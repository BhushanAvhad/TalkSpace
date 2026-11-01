require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const supabase = require('./supabaseClient');
const { startRetentionScheduler, getRetentionHours, executeRetentionCleanup } = require('./retentionService');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});

const PORT = process.env.PORT || 3000;
const users = new Map(); // Store users as { socketId → { username, profileImage, statusText, bio } }
const sentMessageIds = new Set(); // Store sent message IDs to prevent duplicates

// Supported & Protected File Extensions and MIME Types
const ALLOWED_EXTENSIONS = new Set([
    '.jpg', '.jpeg', '.png', '.webp', '.gif',
    '.pdf', '.doc', '.docx', '.xls', '.xlsx',
    '.ppt', '.pptx', '.txt', '.csv'
]);

const ALLOWED_MIME_TYPES = new Set([
    'image/jpeg', 'image/png', 'image/webp', 'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
]);

const DANGEROUS_EXTENSIONS = new Set([
    '.exe', '.bat', '.cmd', '.sh', '.vbs', '.js', '.mjs',
    '.msi', '.dll', '.scr', '.jar', '.php', '.py', '.ps1',
    '.com', '.hta', '.app', '.vbe', '.jse', '.wsf', '.wsh'
]);

// Protected Uploads Directory (outside public folder to prevent unauthorized static access)
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Migrate legacy files from public/uploads if any existed
const legacyUploadDir = path.join(__dirname, 'public', 'uploads');
if (fs.existsSync(legacyUploadDir)) {
    try {
        const legacyFiles = fs.readdirSync(legacyUploadDir);
        for (const file of legacyFiles) {
            const src = path.join(legacyUploadDir, file);
            const dest = path.join(uploadDir, file);
            if (!fs.existsSync(dest) && fs.statSync(src).isFile()) {
                fs.copyFileSync(src, dest);
            }
        }
    } catch (e) {
        // Migration completed or unneeded
    }
}

// In-memory registry for private file permissions: filename -> { sender, target }
const privateFilePermissions = new Map();

// Configure Multer Storage with Cryptographic Safe Filenames
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = ALLOWED_EXTENSIONS.has(ext) ? ext : '.bin';
        const randomHex = crypto.randomBytes(12).toString('hex');
        const safeName = `${Date.now()}-${randomHex}${safeExt}`;
        cb(null, safeName);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25 MB max
        files: 10 // Max 10 files per request
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();

        // Reject dangerous executable types immediately
        if (DANGEROUS_EXTENSIONS.has(ext)) {
            return cb(new Error('Rejected dangerous file type. Executables and scripts are prohibited.'));
        }

        // Validate allowed extension and MIME type
        if (!ALLOWED_EXTENSIONS.has(ext) && !ALLOWED_MIME_TYPES.has(file.mimetype)) {
            return cb(new Error('Unsupported file format. Supported: JPG, PNG, WEBP, GIF, PDF, DOCX, XLSX, PPTX, TXT, CSV.'));
        }

        cb(null, true);
    }
});

// Password Hashing Helpers
function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, storedHash) {
    if (!storedHash || !storedHash.includes(':')) return false;
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
}

// Helper to format Supabase message rows (reconstructs attachments, replies, reactions & status from JSON payload)
function formatMessageRow(row) {
    let text = row.message;
    let fileURL = null;
    let fileName = null;
    let fileSize = null;
    let fileType = null;
    let replyTo = null;
    let isEdited = false;
    let editedAt = null;
    let isDeleted = false;
    let reactions = {};
    let profilePicture = null;

    if (typeof row.message === 'string' && row.message.trim().startsWith('{')) {
        try {
            const parsed = JSON.parse(row.message);
            text = parsed.text !== undefined ? parsed.text : (parsed.message || '');
            fileURL = parsed.fileURL || null;
            fileName = parsed.fileName || null;
            fileSize = parsed.fileSize || null;
            fileType = parsed.fileType || null;
            replyTo = parsed.replyTo || null;
            isEdited = !!parsed.isEdited;
            editedAt = parsed.editedAt || null;
            isDeleted = !!parsed.isDeleted;
            reactions = parsed.reactions || {};
            profilePicture = parsed.profilePicture || parsed.avatarUrl || null;
        } catch (e) {
            // Keep original row.message if not valid JSON
        }
    }

    return {
        user: row.sender,
        target: row.target,
        message: text,
        type: row.type || 'group',
        timestamp: row.created_at,
        messageId: row.message_id || row.id,
        fileURL,
        fileName,
        fileSize,
        fileType,
        replyTo,
        isEdited,
        editedAt,
        isDeleted,
        reactions,
        profilePicture,
        avatarUrl: profilePicture
    };
}

// Helper to send group history (filtered to active retention window: <= 48 hours)
async function sendRecentGroupHistory(socket) {
    try {
        const retentionHours = getRetentionHours();
        const cutoffDate = new Date(Date.now() - retentionHours * 60 * 60 * 1000).toISOString();

        const { data: history, error } = await supabase
            .from('messages')
            .select('*')
            .eq('type', 'group')
            .gt('created_at', cutoffDate)
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) {
            console.error('Error fetching group history from Supabase:', error.message);
        } else if (history) {
            const formattedHistory = history.map(formatMessageRow);
            socket.emit('loadGroupHistory', formattedHistory);
        }
    } catch (err) {
        console.error('Supabase query error:', err);
    }
}

app.use(express.json());

// Multi-file Advanced Upload Endpoint
app.post('/api/upload', (req, res) => {
    upload.array('files', 10)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || 'File upload failed.' });
        }
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files provided.' });
        }

        const isPrivate = req.body.isPrivate === 'true';
        const sender = (req.body.sender || '').trim();
        const target = (req.body.target || '').trim();

        const uploadedFiles = req.files.map((file) => {
            // If private, record permissions for access authorization
            if (isPrivate && target) {
                privateFilePermissions.set(file.filename, { sender, target });
            }

            return {
                fileURL: `/api/files/${file.filename}`,
                fileName: file.originalname,
                storedName: file.filename,
                fileSize: file.size,
                fileType: file.mimetype
            };
        });

        res.json({ success: true, files: uploadedFiles });
    });
});

// Single File Upload Endpoint (Backward-Compatible)
app.post('/upload', (req, res) => {
    upload.single('file')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || 'File upload failed.' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded.' });
        }

        const isPrivate = req.body.isPrivate === 'true';
        const sender = (req.body.sender || '').trim();
        const target = (req.body.target || '').trim();

        if (isPrivate && target) {
            privateFilePermissions.set(req.file.filename, { sender, target });
        }

        res.json({
            fileURL: `/api/files/${req.file.filename}`,
            fileName: req.file.originalname,
            storedName: req.file.filename,
            fileSize: req.file.size,
            fileType: req.file.mimetype
        });
    });
});

// Profile Picture Upload Endpoint
app.post('/uploadProfilePic', (req, res) => {
    upload.any()(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message || 'Avatar upload failed.' });
        }
        const file = req.file || (req.files && req.files[0]);
        if (!file) {
            return res.status(400).json({ error: 'No image file uploaded.' });
        }
        const avatarUrl = `/api/files/${file.filename}`;
        res.json({ success: true, avatarUrl, fileURL: avatarUrl });
    });
});

// Protected File Serving Handler (Access Verification & Path Traversal Prevention)
function handleFileRequest(req, res) {
    // Path traversal defense: strip any directory paths
    const filename = path.basename(req.params.filename);
    const filePath = path.join(uploadDir, filename);

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'File not found.' });
    }

    // Access control: verify authorization for private conversation attachments
    const permission = privateFilePermissions.get(filename);
    if (permission) {
        const requestingUser = (req.query.user || req.headers['x-talkspace-user'] || '').trim().toLowerCase();
        const isAuthorized =
            requestingUser &&
            (requestingUser === permission.sender.toLowerCase() ||
             requestingUser === permission.target.toLowerCase());

        if (!isAuthorized) {
            return res.status(403).json({ error: 'Forbidden. You do not have permission to access this private attachment.' });
        }
    }

    // Serve protected file
    res.sendFile(filePath);
}

app.get('/api/files/:filename', handleFileRequest);
app.get('/uploads/:filename', handleFileRequest);

// Health check & Retention status endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        supabaseConnected: !!process.env.SUPABASE_URL,
        retentionPolicy: {
            groupRetentionHours: getRetentionHours(),
            privateRetention: 'lifetime'
        }
    });
});

app.get('/api/admin/retention/status', (req, res) => {
    const hours = getRetentionHours();
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
    res.json({
        policy: '48-hour public group retention / lifetime private retention',
        groupRetentionHours: hours,
        currentCutoffUTC: cutoff,
        timestamp: new Date().toISOString()
    });
});

// Serve modern React frontend build if present
const frontendDist = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
}

// Serve public directory for static assets
app.use(express.static(path.join(__dirname, 'public')));

// HTML Fallback for Single Page Application
app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/upload') || req.path.startsWith('/socket.io')) {
        return next();
    }
    const modernIndex = path.join(__dirname, 'frontend', 'dist', 'index.html');
    if (fs.existsSync(modernIndex)) {
        return res.sendFile(modernIndex);
    }
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle WebSocket connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user registration
    socket.on('register', async ({ username, password }) => {
        if (!username || !password) {
            return socket.emit('authResult', { success: false, message: 'Please enter both username and password.' });
        }
        const cleanUsername = username.trim();
        if (cleanUsername.length < 3) {
            return socket.emit('authResult', { success: false, message: 'Username must be at least 3 characters.' });
        }
        if (password.length < 4) {
            return socket.emit('authResult', { success: false, message: 'Password must be at least 4 characters.' });
        }

        try {
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .ilike('username', cleanUsername)
                .maybeSingle();

            if (checkError) {
                console.error('Supabase check user error:', checkError);
                return socket.emit('authResult', { success: false, message: 'Database error: ' + checkError.message });
            }

            if (existingUser) {
                return socket.emit('authResult', { success: false, message: 'Username already taken. Please choose another.' });
            }

            const password_hash = hashPassword(password);
            let insertError = null;

            // Attempt insert with profile columns; fallback to base columns if columns not migrated yet
            const resWithProfile = await supabase
                .from('users')
                .insert([{
                    username: cleanUsername,
                    password_hash,
                    avatar_url: 'profile.png',
                    status_text: 'Available',
                    bio: ''
                }]);

            if (resWithProfile.error) {
                const resBase = await supabase
                    .from('users')
                    .insert([{
                        username: cleanUsername,
                        password_hash
                    }]);
                insertError = resBase.error;
            }

            if (insertError) {
                console.error('Supabase insert user error:', insertError);
                return socket.emit('authResult', { success: false, message: 'Registration failed: ' + insertError.message });
            }

            users.set(socket.id, {
                username: cleanUsername,
                profileImage: 'profile.png',
                statusText: 'Available',
                bio: ''
            });

            socket.emit('authResult', {
                success: true,
                username: cleanUsername,
                avatarUrl: 'profile.png',
                statusText: 'Available',
                bio: ''
            });

            io.emit('updateUsers', Array.from(users.values()).map(u => u.username));
            io.emit('updateUsersDetailed', Array.from(users.values()));

            await sendRecentGroupHistory(socket);
        } catch (err) {
            console.error('Registration exception:', err);
            socket.emit('authResult', { success: false, message: 'Server error during registration.' });
        }
    });

    // Handle user login
    socket.on('login', async ({ username, password }) => {
        if (!username || !password) {
            return socket.emit('authResult', { success: false, message: 'Please enter both username and password.' });
        }
        const cleanUsername = username.trim();

        try {
            const { data: userRecord, error: fetchError } = await supabase
                .from('users')
                .select('*')
                .ilike('username', cleanUsername)
                .maybeSingle();

            if (fetchError) {
                console.error('Supabase fetch user error:', fetchError);
                return socket.emit('authResult', { success: false, message: 'Database error: ' + fetchError.message });
            }

            if (!userRecord) {
                return socket.emit('authResult', { success: false, message: 'User not found. Please click Create Account to register.' });
            }

            const isValid = verifyPassword(password, userRecord.password_hash);
            if (!isValid) {
                return socket.emit('authResult', { success: false, message: 'Incorrect password.' });
            }

            const avatarUrl = userRecord.avatar_url || 'profile.png';
            const statusText = userRecord.status_text || 'Available';
            const bio = userRecord.bio || '';

            users.set(socket.id, {
                username: userRecord.username,
                profileImage: avatarUrl,
                statusText,
                bio
            });

            socket.emit('authResult', {
                success: true,
                username: userRecord.username,
                avatarUrl,
                statusText,
                bio
            });

            io.emit('updateUsers', Array.from(users.values()).map(u => u.username));
            io.emit('updateUsersDetailed', Array.from(users.values()));

            await sendRecentGroupHistory(socket);
        } catch (err) {
            console.error('Login exception:', err);
            socket.emit('authResult', { success: false, message: 'Server error during login.' });
        }
    });

    // Request group chat history (strictly filtered to within the 48-hour retention window)
    socket.on('requestGroupHistory', async () => {
        try {
            const retentionHours = getRetentionHours();
            const cutoffDate = new Date(Date.now() - retentionHours * 60 * 60 * 1000).toISOString();

            const { data: history, error } = await supabase
                .from('messages')
                .select('*')
                .eq('type', 'group')
                .gt('created_at', cutoffDate)
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) {
                console.error('Error fetching group history:', error.message);
            } else if (history) {
                const formattedHistory = history.map(formatMessageRow);
                socket.emit('loadGroupHistory', formattedHistory);
            }
        } catch (err) {
            console.error('Error in requestGroupHistory:', err);
        }
    });

    // Request private chat history between two users (Retained indefinitely)
    socket.on('requestPrivateHistory', async ({ partner }) => {
        const currentUser = users.get(socket.id)?.username;
        if (!currentUser || !partner) return;

        try {
            const { data: history, error } = await supabase
                .from('messages')
                .select('*')
                .eq('type', 'private')
                .or(`and(sender.eq."${currentUser}",target.eq."${partner}"),and(sender.eq."${partner}",target.eq."${currentUser}")`)
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) {
                console.error('Error fetching private history:', error.message);
            } else if (history) {
                const formattedHistory = history.map(formatMessageRow);
                socket.emit('loadPrivateHistory', { partner, history: formattedHistory });
            }
        } catch (err) {
            console.error('Error in requestPrivateHistory:', err);
        }
    });

    // Handle group messages (text, file attachment, and replies)
    socket.on('groupMessage', async (msg) => {
        const sender = users.get(socket.id)?.username;
        const messageId = msg.messageId || 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        if (sender === msg.user && !sentMessageIds.has(messageId)) {
            sentMessageIds.add(messageId);

            const currentProfileImg = users.get(socket.id)?.profileImage || msg.avatarUrl || msg.profilePicture || null;

            const messageData = {
                user: msg.user,
                message: msg.message || '',
                type: 'group',
                timestamp: new Date().toISOString(),
                messageId: messageId,
                fileURL: msg.fileURL || null,
                fileName: msg.fileName || null,
                fileSize: msg.fileSize || null,
                fileType: msg.fileType || null,
                replyTo: msg.replyTo || null,
                isEdited: false,
                isDeleted: false,
                reactions: {},
                profilePicture: currentProfileImg,
                avatarUrl: currentProfileImg,
            };

            const messageToSave = JSON.stringify({
                text: msg.message || '',
                fileURL: msg.fileURL || null,
                fileName: msg.fileName || null,
                fileSize: msg.fileSize || null,
                fileType: msg.fileType || null,
                replyTo: msg.replyTo || null,
                isEdited: false,
                isDeleted: false,
                reactions: {},
                profilePicture: currentProfileImg,
                avatarUrl: currentProfileImg
            });

            try {
                await supabase
                    .from('messages')
                    .insert([{
                        message_id: messageId,
                        sender: msg.user,
                        target: null,
                        type: 'group',
                        message: messageToSave
                    }]);
            } catch (err) {
                console.error('Supabase insert error:', err);
            }

            socket.broadcast.emit('message', messageData);
        }
    });

    // Handle private messages (text, file attachment, and replies)
    socket.on('privateMessage', async (msg) => {
        const sender = users.get(socket.id)?.username;
        const messageId = msg.messageId || 'msg_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
        if (!sentMessageIds.has(messageId) && sender) {
            sentMessageIds.add(messageId);
            const targetEntry = Array.from(users.entries()).find(([id, user]) => user.username.toLowerCase() === msg.target.toLowerCase());

            const messageData = {
                user: msg.user,
                target: msg.target,
                message: msg.message || '',
                type: 'private',
                timestamp: new Date().toISOString(),
                messageId: messageId,
                fileURL: msg.fileURL || null,
                fileName: msg.fileName || null,
                fileSize: msg.fileSize || null,
                fileType: msg.fileType || null,
                replyTo: msg.replyTo || null,
                isEdited: false,
                isDeleted: false,
                reactions: {},
                profilePicture: users.get(socket.id)?.profileImage || msg.avatarUrl || null,
                avatarUrl: users.get(socket.id)?.profileImage || msg.avatarUrl || null,
            };

            const messageToSave = JSON.stringify({
                text: msg.message || '',
                fileURL: msg.fileURL || null,
                fileName: msg.fileName || null,
                fileSize: msg.fileSize || null,
                fileType: msg.fileType || null,
                replyTo: msg.replyTo || null,
                isEdited: false,
                isDeleted: false,
                reactions: {},
                profilePicture: users.get(socket.id)?.profileImage || msg.avatarUrl || null,
                avatarUrl: users.get(socket.id)?.profileImage || msg.avatarUrl || null
            });

            try {
                await supabase
                    .from('messages')
                    .insert([{
                        message_id: messageId,
                        sender: msg.user,
                        target: msg.target,
                        type: 'private',
                        message: messageToSave
                    }]);
            } catch (err) {
                console.error('Supabase insert error:', err);
            }

            if (targetEntry) {
                const [targetSocketId] = targetEntry;
                io.to(targetSocketId).emit('message', messageData);
            }
            socket.emit('message', messageData);
        }
    });

    // Edit message
    socket.on('editMessage', async ({ messageId, newText }) => {
        const currentUser = users.get(socket.id)?.username;
        if (!currentUser || !messageId || !newText || !newText.trim()) return;

        try {
            const { data: row, error: fetchErr } = await supabase
                .from('messages')
                .select('*')
                .eq('message_id', messageId)
                .maybeSingle();

            if (fetchErr || !row) return;

            // Security check: Only the author can edit
            if (row.sender.toLowerCase() !== currentUser.toLowerCase()) {
                return socket.emit('errorNotification', { message: 'Unauthorized: You can only edit your own messages.' });
            }

            let payload = {};
            if (typeof row.message === 'string' && row.message.trim().startsWith('{')) {
                try { payload = JSON.parse(row.message); } catch (e) { payload = { text: row.message }; }
            } else {
                payload = { text: row.message };
            }

            payload.text = newText.trim();
            payload.isEdited = true;
            payload.editedAt = new Date().toISOString();

            await supabase
                .from('messages')
                .update({ message: JSON.stringify(payload) })
                .eq('message_id', messageId);

            const editEvent = {
                messageId,
                newText: payload.text,
                isEdited: true,
                editedAt: payload.editedAt,
                type: row.type,
                target: row.target
            };

            if (row.type === 'group') {
                io.emit('messageEdited', editEvent);
            } else {
                const partner = row.sender.toLowerCase() === currentUser.toLowerCase() ? row.target : row.sender;
                const targetEntry = Array.from(users.entries()).find(([_, u]) => u.username.toLowerCase() === partner.toLowerCase());
                if (targetEntry) {
                    io.to(targetEntry[0]).emit('messageEdited', editEvent);
                }
                socket.emit('messageEdited', editEvent);
            }
        } catch (err) {
            console.error('Error editing message:', err);
        }
    });

    // Delete message
    socket.on('deleteMessage', async ({ messageId }) => {
        const currentUser = users.get(socket.id)?.username;
        if (!currentUser || !messageId) return;

        try {
            const { data: row, error: fetchErr } = await supabase
                .from('messages')
                .select('*')
                .eq('message_id', messageId)
                .maybeSingle();

            if (fetchErr || !row) return;

            // Security check: Only the author can delete
            if (row.sender.toLowerCase() !== currentUser.toLowerCase()) {
                return socket.emit('errorNotification', { message: 'Unauthorized: You can only delete your own messages.' });
            }

            let payload = {};
            if (typeof row.message === 'string' && row.message.trim().startsWith('{')) {
                try { payload = JSON.parse(row.message); } catch (e) { payload = { text: row.message }; }
            } else {
                payload = { text: row.message };
            }

            payload.isDeleted = true;
            payload.text = 'This message was deleted';
            payload.fileURL = null;
            payload.fileName = null;

            await supabase
                .from('messages')
                .update({ message: JSON.stringify(payload) })
                .eq('message_id', messageId);

            const deleteEvent = {
                messageId,
                isDeleted: true,
                type: row.type,
                target: row.target
            };

            if (row.type === 'group') {
                io.emit('messageDeleted', deleteEvent);
            } else {
                const partner = row.sender.toLowerCase() === currentUser.toLowerCase() ? row.target : row.sender;
                const targetEntry = Array.from(users.entries()).find(([_, u]) => u.username.toLowerCase() === partner.toLowerCase());
                if (targetEntry) {
                    io.to(targetEntry[0]).emit('messageDeleted', deleteEvent);
                }
                socket.emit('messageDeleted', deleteEvent);
            }
        } catch (err) {
            console.error('Error deleting message:', err);
        }
    });

    // Toggle message reaction (persistent & real-time)
    socket.on('toggleReaction', async ({ messageId, emoji }) => {
        const currentUser = users.get(socket.id)?.username;
        if (!currentUser || !messageId || !emoji) return;

        try {
            const { data: row, error: fetchErr } = await supabase
                .from('messages')
                .select('*')
                .eq('message_id', messageId)
                .maybeSingle();

            if (fetchErr || !row) return;

            let payload = {};
            if (typeof row.message === 'string' && row.message.trim().startsWith('{')) {
                try { payload = JSON.parse(row.message); } catch (e) { payload = { text: row.message }; }
            } else {
                payload = { text: row.message };
            }

            if (!payload.reactions) payload.reactions = {};
            const userList = payload.reactions[emoji] || [];

            // Toggle user in reaction array (prevents duplicate reactions per user)
            if (userList.includes(currentUser)) {
                payload.reactions[emoji] = userList.filter(u => u !== currentUser);
                if (payload.reactions[emoji].length === 0) {
                    delete payload.reactions[emoji];
                }
            } else {
                payload.reactions[emoji] = [...userList, currentUser];
            }

            await supabase
                .from('messages')
                .update({ message: JSON.stringify(payload) })
                .eq('message_id', messageId);

            const reactionEvent = {
                messageId,
                reactions: payload.reactions,
                type: row.type,
                target: row.target
            };

            if (row.type === 'group') {
                io.emit('reactionUpdated', reactionEvent);
            } else {
                const partner = row.sender.toLowerCase() === currentUser.toLowerCase() ? row.target : row.sender;
                const targetEntry = Array.from(users.entries()).find(([_, u]) => u.username.toLowerCase() === partner.toLowerCase());
                if (targetEntry) {
                    io.to(targetEntry[0]).emit('reactionUpdated', reactionEvent);
                }
                socket.emit('reactionUpdated', reactionEvent);
            }
        } catch (err) {
            console.error('Error toggling reaction:', err);
        }
    });

    // Advanced Authorized Search
    socket.on('searchTalkSpace', async ({ query, chatType = 'all', partner = null }) => {
        const currentUser = users.get(socket.id)?.username;
        if (!currentUser || !query || !query.trim()) return;

        const cleanQuery = query.trim().toLowerCase();

        try {
            // 1. Search Users
            const { data: matchedUsers } = await supabase
                .from('users')
                .select('username, avatar_url, status_text')
                .ilike('username', `%${cleanQuery}%`)
                .limit(10);

            // 2. Search Public Group Messages (within 48h retention)
            const retentionHours = getRetentionHours();
            const cutoffDate = new Date(Date.now() - retentionHours * 60 * 60 * 1000).toISOString();

            let groupResults = [];
            if (chatType === 'all' || chatType === 'group') {
                const { data: grpMessages } = await supabase
                    .from('messages')
                    .select('*')
                    .eq('type', 'group')
                    .gt('created_at', cutoffDate)
                    .ilike('message', `%${cleanQuery}%`)
                    .order('created_at', { ascending: false })
                    .limit(30);

                if (grpMessages) groupResults = grpMessages.map(formatMessageRow);
            }

            // 3. Search Private Messages (STRICTLY constrained to currentUser)
            let privateResults = [];
            if (chatType === 'all' || chatType === 'private') {
                let pvtQuery = supabase
                    .from('messages')
                    .select('*')
                    .eq('type', 'private')
                    .or(`sender.eq."${currentUser}",target.eq."${currentUser}"`)
                    .ilike('message', `%${cleanQuery}%`)
                    .order('created_at', { ascending: false })
                    .limit(30);

                if (partner) {
                    pvtQuery = supabase
                        .from('messages')
                        .select('*')
                        .eq('type', 'private')
                        .or(`and(sender.eq."${currentUser}",target.eq."${partner}"),and(sender.eq."${partner}",target.eq."${currentUser}")`)
                        .ilike('message', `%${cleanQuery}%`)
                        .order('created_at', { ascending: false })
                        .limit(30);
                }

                const { data: pvtMessages } = await pvtQuery;
                if (pvtMessages) privateResults = pvtMessages.map(formatMessageRow);
            }

            const formattedUsers = (matchedUsers || []).map(u => ({
                username: u.username,
                avatar_url: u.avatar_url || 'profile.png',
                status_text: u.status_text || 'Available'
            }));
            const formattedMessages = [...groupResults, ...privateResults];

            socket.emit('searchResults', {
                query: cleanQuery,
                results: {
                    users: formattedUsers,
                    messages: formattedMessages
                },
                users: formattedUsers,
                messages: formattedMessages
            });
        } catch (err) {
            console.error('Error executing search:', err);
        }
    });

    // Mark private conversation messages as read
    socket.on('markMessagesRead', ({ partner }) => {
        const currentUser = users.get(socket.id)?.username;
        if (!currentUser || !partner) return;

        const targetEntry = Array.from(users.entries()).find(([_, u]) => u.username.toLowerCase() === partner.toLowerCase());
        if (targetEntry) {
            io.to(targetEntry[0]).emit('conversationRead', {
                by: currentUser,
                chat: currentUser,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Update user profile
    socket.on('updateProfile', async ({ statusText, bio, avatarUrl }) => {
        const currentUser = users.get(socket.id)?.username;
        if (!currentUser) return;

        try {
            const updateFields = {};
            if (statusText !== undefined) updateFields.status_text = statusText.trim().slice(0, 100);
            if (bio !== undefined) updateFields.bio = bio.trim().slice(0, 300);
            if (avatarUrl !== undefined) updateFields.avatar_url = avatarUrl;

            try {
                await supabase
                    .from('users')
                    .update(updateFields)
                    .eq('username', currentUser);
            } catch (dbErr) {
                // Non-fatal if remote schema columns not migrated yet
            }

            const sessionUser = users.get(socket.id);
            if (sessionUser) {
                if (statusText !== undefined) sessionUser.statusText = updateFields.status_text;
                if (avatarUrl !== undefined) sessionUser.profileImage = updateFields.avatar_url;
                if (bio !== undefined) sessionUser.bio = updateFields.bio;
            }

            const resolvedProfile = {
                username: currentUser,
                avatarUrl: updateFields.avatar_url || sessionUser?.profileImage || 'profile.png',
                statusText: updateFields.status_text || sessionUser?.statusText || 'Available',
                bio: updateFields.bio || ''
            };

            socket.emit('profileUpdated', {
                success: true,
                username: currentUser,
                profile: resolvedProfile,
                avatarUrl: resolvedProfile.avatarUrl,
                statusText: resolvedProfile.statusText,
                bio: resolvedProfile.bio
            });

            io.emit('userProfileChanged', {
                username: currentUser,
                avatarUrl: resolvedProfile.avatarUrl,
                statusText: resolvedProfile.statusText,
                bio: resolvedProfile.bio
            });
        } catch (err) {
            console.error('Error updating profile:', err);
        }
    });

    // Get specific user profile info
    socket.on('getUserProfile', async ({ username }) => {
        if (!username) return;
        try {
            const cleanUser = username.trim();
            const activeUser = Array.from(users.values()).find(u => u.username.toLowerCase() === cleanUser.toLowerCase());
            let userRecord = null;
            try {
                const { data } = await supabase
                    .from('users')
                    .select('*')
                    .ilike('username', cleanUser)
                    .maybeSingle();
                userRecord = data;
            } catch (e) {}

            socket.emit('userProfileResult', {
                username: cleanUser,
                avatar_url: userRecord?.avatar_url || activeUser?.profileImage || 'profile.png',
                avatarUrl: userRecord?.avatar_url || activeUser?.profileImage || 'profile.png',
                status_text: userRecord?.status_text || activeUser?.statusText || 'Available',
                statusText: userRecord?.status_text || activeUser?.statusText || 'Available',
                bio: userRecord?.bio || activeUser?.bio || '',
                joinedAt: userRecord?.created_at
            });
        } catch (err) {
            console.error('Error fetching user profile:', err);
        }
    });

    // Handle typing indicators
    socket.on('typing', ({ target }) => {
        const user = users.get(socket.id);
        if (!user) return;

        if (target === 'group') {
            socket.broadcast.emit('displayTyping', { user: user.username, isTyping: true, target: 'group' });
        } else {
            const targetEntry = Array.from(users.entries()).find(([id, u]) => u.username.toLowerCase() === target.toLowerCase());
            if (targetEntry) {
                const [targetSocketId] = targetEntry;
                io.to(targetSocketId).emit('displayTyping', { user: user.username, isTyping: true });
            }
        }

        setTimeout(() => {
            socket.emit('stopTyping', { target });
        }, 2000);
    });

    // Handle Chat Requests
    socket.on('chatRequest', ({ to, from }) => {
        const targetEntry = Array.from(users.entries()).find(([id, user]) => user.username.toLowerCase() === to.toLowerCase());
        if (targetEntry) {
            const [targetSocketId] = targetEntry;
            io.to(targetSocketId).emit('chatRequest', { from });
        }
    });

    // Handle Chat Responses
    socket.on('chatResponse', ({ to, accepted }) => {
        const targetEntry = Array.from(users.entries()).find(([id, user]) => user.username.toLowerCase() === to.toLowerCase());
        if (targetEntry) {
            const [targetSocketId] = targetEntry;
            io.to(targetSocketId).emit('chatResponse', { from: users.get(socket.id)?.username, accepted });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        if (users.has(socket.id)) {
            const user = users.get(socket.id);
            users.delete(socket.id);

            io.emit('message', {
                user: 'System',
                message: `${user.username} has left the chat`,
                type: 'group',
                timestamp: new Date().toISOString(),
                profilePicture: 'profile.png',
            });

            io.emit('updateUsers', Array.from(users.values()).map(u => u.username));
            io.emit('updateUsersDetailed', Array.from(users.values()));
        }
    });
});

// Start the server
server.listen(PORT, () => {
    console.log(`🚀 TalkSpace server running directly on port ${PORT}`);
    console.log(`📡 Supabase database: ${process.env.SUPABASE_URL ? 'Connected' : 'Missing credentials in .env'}`);
    
    // Start automated hourly message retention and attachment cleanup scheduler
    startRetentionScheduler(io, uploadDir);
});
