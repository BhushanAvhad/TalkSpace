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
const users = new Map(); // Store users as { socketId → { username, profileImage } }
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

// Helper to format Supabase message rows (reconstructs attachments from JSON payload if present)
function formatMessageRow(row) {
    let text = row.message;
    let fileURL = null;
    let fileName = null;
    let fileSize = null;
    let fileType = null;

    if (typeof row.message === 'string' && row.message.trim().startsWith('{') && row.message.includes('"fileURL"')) {
        try {
            const parsed = JSON.parse(row.message);
            text = parsed.text || '';
            fileURL = parsed.fileURL || null;
            fileName = parsed.fileName || null;
            fileSize = parsed.fileSize || null;
            fileType = parsed.fileType || null;
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
        profilePicture: 'profile.png'
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
            const { error: insertError } = await supabase
                .from('users')
                .insert([{ username: cleanUsername, password_hash }]);

            if (insertError) {
                console.error('Supabase insert user error:', insertError);
                return socket.emit('authResult', { success: false, message: 'Registration failed: ' + insertError.message });
            }

            users.set(socket.id, { username: cleanUsername, profileImage: 'profile.png' });
            socket.emit('authResult', { success: true, username: cleanUsername });
            io.emit('updateUsers', Array.from(users.values()).map(u => u.username));

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

            users.set(socket.id, { username: userRecord.username, profileImage: 'profile.png' });
            socket.emit('authResult', { success: true, username: userRecord.username });
            io.emit('updateUsers', Array.from(users.values()).map(u => u.username));

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

    // Request private chat history between two users
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

    // Handle group messages (text or file attachment)
    socket.on('groupMessage', async (msg) => {
        const sender = users.get(socket.id)?.username;
        if (sender === msg.user && !sentMessageIds.has(msg.messageId)) {
            sentMessageIds.add(msg.messageId);

            const messageData = {
                user: msg.user,
                message: msg.message || '',
                type: 'group',
                timestamp: new Date().toISOString(),
                messageId: msg.messageId,
                fileURL: msg.fileURL || null,
                fileName: msg.fileName || null,
                fileSize: msg.fileSize || null,
                fileType: msg.fileType || null,
                profilePicture: msg.profilePicture || 'profile.png',
            };

            // Reconstruct JSON payload if message contains an attachment for clean Supabase storage
            const messageToSave = msg.fileURL
                ? JSON.stringify({
                    text: msg.message || '',
                    fileURL: msg.fileURL,
                    fileName: msg.fileName,
                    fileSize: msg.fileSize,
                    fileType: msg.fileType
                })
                : (msg.message || '');

            try {
                await supabase
                    .from('messages')
                    .insert([{
                        message_id: msg.messageId,
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

    // Handle private messages (text or file attachment)
    socket.on('privateMessage', async (msg) => {
        const sender = users.get(socket.id)?.username;
        if (!sentMessageIds.has(msg.messageId) && sender) {
            sentMessageIds.add(msg.messageId);
            const targetEntry = Array.from(users.entries()).find(([id, user]) => user.username === msg.target);

            const messageData = {
                user: msg.user,
                target: msg.target,
                message: msg.message || '',
                type: 'private',
                timestamp: new Date().toISOString(),
                messageId: msg.messageId,
                fileURL: msg.fileURL || null,
                fileName: msg.fileName || null,
                fileSize: msg.fileSize || null,
                fileType: msg.fileType || null,
                profilePicture: msg.profilePicture || 'profile.png',
            };

            const messageToSave = msg.fileURL
                ? JSON.stringify({
                    text: msg.message || '',
                    fileURL: msg.fileURL,
                    fileName: msg.fileName,
                    fileSize: msg.fileSize,
                    fileType: msg.fileType
                })
                : (msg.message || '');

            try {
                await supabase
                    .from('messages')
                    .insert([{
                        message_id: msg.messageId,
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

    // Handle typing indicators
    socket.on('typing', ({ target }) => {
        const user = users.get(socket.id);
        if (!user) return;

        if (target === 'group') {
            socket.broadcast.emit('displayTyping', { user: user.username, isTyping: true, target: 'group' });
        } else {
            const targetEntry = Array.from(users.entries()).find(([id, u]) => u.username === target);
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
        const targetEntry = Array.from(users.entries()).find(([id, user]) => user.username === to);
        if (targetEntry) {
            const [targetSocketId] = targetEntry;
            io.to(targetSocketId).emit('chatRequest', { from });
        }
    });

    // Handle Chat Responses
    socket.on('chatResponse', ({ to, accepted }) => {
        const targetEntry = Array.from(users.entries()).find(([id, user]) => user.username === to);
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
