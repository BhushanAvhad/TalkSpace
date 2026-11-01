require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const supabase = require('./supabaseClient');

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

// Create 'uploads' folder if it doesn't exist
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_'));
    }
});
const upload = multer({ storage });

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

// Helper to send group history
async function sendRecentGroupHistory(socket) {
    try {
        const { data: history, error } = await supabase
            .from('messages')
            .select('*')
            .eq('type', 'group')
            .order('created_at', { ascending: true })
            .limit(100);

        if (error) {
            console.error('Error fetching group history from Supabase:', error.message);
        } else if (history) {
            const formattedHistory = history.map(row => ({
                user: row.sender,
                message: row.message,
                type: 'group',
                timestamp: row.created_at,
                messageId: row.message_id || row.id,
                profilePicture: 'profile.png'
            }));
            socket.emit('loadGroupHistory', formattedHistory);
        }
    } catch (err) {
        console.error('Supabase query error:', err);
    }
}

app.use(express.json());

// Handle file uploads
app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileURL = `/uploads/${req.file.filename}`;
    res.json({ fileURL, fileName: req.file.filename });
});

app.post('/uploadProfilePic', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const fileURL = `/uploads/${req.file.filename}`;
    res.json({ fileURL });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', supabaseConnected: !!process.env.SUPABASE_URL });
});

// Serve modern React frontend build if present
const frontendDist = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));
}

// Serve public directory for uploads and legacy assets
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

    // Request group chat history
    socket.on('requestGroupHistory', async () => {
        try {
            const { data: history, error } = await supabase
                .from('messages')
                .select('*')
                .eq('type', 'group')
                .order('created_at', { ascending: true })
                .limit(100);

            if (error) {
                console.error('Error fetching group history:', error.message);
            } else if (history) {
                const formattedHistory = history.map(row => ({
                    user: row.sender,
                    message: row.message,
                    type: 'group',
                    timestamp: row.created_at,
                    messageId: row.message_id || row.id,
                    profilePicture: 'profile.png'
                }));
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
                const formattedHistory = history.map(row => ({
                    user: row.sender,
                    target: row.target,
                    message: row.message,
                    type: 'private',
                    timestamp: row.created_at,
                    messageId: row.message_id || row.id,
                    profilePicture: 'profile.png'
                }));
                socket.emit('loadPrivateHistory', { partner, history: formattedHistory });
            }
        } catch (err) {
            console.error('Error in requestPrivateHistory:', err);
        }
    });

    // Handle group messages
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
                profilePicture: msg.profilePicture || 'profile.png',
            };

            try {
                await supabase
                    .from('messages')
                    .insert([{
                        message_id: msg.messageId,
                        sender: msg.user,
                        target: null,
                        type: 'group',
                        message: msg.message || ''
                    }]);
            } catch (err) {
                console.error('Supabase insert error:', err);
            }

            socket.broadcast.emit('message', messageData);
        }
    });

    // Handle private messages
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
                profilePicture: msg.profilePicture || 'profile.png',
            };

            try {
                await supabase
                    .from('messages')
                    .insert([{
                        message_id: msg.messageId,
                        sender: msg.user,
                        target: msg.target,
                        type: 'private',
                        message: msg.message || ''
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
});
