// Constants
const socket = io(); // Initialize Socket.IO connection
const textarea = document.querySelector('#textarea');
const messageArea = document.querySelector('#messageArea');
const userList = document.getElementById('activeUsers');
const loginOverlay = document.getElementById('loginOverlay');
const authSubmitBtn = document.getElementById('authSubmitBtn') || document.getElementById('loginBtn');
const authTitle = document.getElementById('authTitle');
const authToggleLink = document.getElementById('authToggleLink');
const errorMessage = document.getElementById('errorMessage');
const chatRequestsList = document.getElementById('chatRequests');
const backButton = document.getElementById('backButton');
const returnButton = document.getElementById('returnButton');
const chatHeaderTitle = document.getElementById('chatHeaderTitle');
const onlineCount = document.getElementById('onlineCount');
const typingIndicator = document.getElementById('typingIndicator');
const logoutButton = document.getElementById('logoutButton');
const emojiPicker = document.getElementById('emojiPicker');
const emojiBtn = document.getElementById('emojiBtn');
const profilePictureElem = document.querySelector('.profile-picture');

// State
let username;
let currentChat = 'group';
let personalChatPartner = null;
let groupChatHistory = [];
let personalChatHistories = {};
let lastPersonalChatPartner = null;
let sentMessageIds = new Set();
let receivedMessageIds = new Set();
let profilePictureURL = 'profile.png'; // Default profile picture

/**
 * Append a message to the message area.
 * @param {Object} msg - The message object.
 * @param {string} type - The type of message ('outgoing' or 'incoming').
 */
function appendMessage(msg, type) {
    const messageDiv = document.createElement('li');
    messageDiv.classList.add('message', type === 'outgoing' ? 'my-message' : 'other-message');
    if (msg.messageId) {
        messageDiv.setAttribute('data-message-id', msg.messageId);
    }

    const isMe = msg.user === username;
    let messageContent = `
        <div class="message-header">
            <img src="${msg.profilePicture || 'profile.png'}" alt="Profile Picture">
            <strong>${isMe ? 'You' : msg.user}</strong>
        </div>
        <div class="message-body">
            ${escapeHtml(msg.message)}
        </div>
    `;

    messageDiv.innerHTML = messageContent;
    messageArea.appendChild(messageDiv);
    scrollToBottom();
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    if (!text) return '';
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Send a message to the server.
 * @param {string} message - The message text.
 */
function sendMessage(message) {
    if (!message || !message.trim()) return;

    const messageId = generateUniqueId();
    if (!sentMessageIds.has(messageId)) {
        const msgData = {
            user: username,
            message: message.trim(),
            messageId,
            profilePicture: profilePictureURL,
            type: currentChat === 'group' ? 'group' : 'private',
        };

        if (currentChat === 'group') {
            socket.emit('groupMessage', msgData);
        } else {
            msgData.target = personalChatPartner;
            socket.emit('privateMessage', msgData);
        }

        appendMessage(msgData, 'outgoing');

        if (currentChat === 'group') {
            groupChatHistory.push({ ...msgData, type: 'outgoing' });
        } else {
            if (!personalChatHistories[personalChatPartner]) {
                personalChatHistories[personalChatPartner] = [];
            }
            personalChatHistories[personalChatPartner].push({ ...msgData, type: 'outgoing' });
        }

        sentMessageIds.add(messageId);
        receivedMessageIds.add(messageId);
        scrollToBottom();
    }
}

/**
 * Generate a unique ID for messages.
 * @returns {string} - A unique message ID.
 */
function generateUniqueId() {
    return 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Scroll the message area to the bottom.
 */
function scrollToBottom() {
    messageArea.scrollTop = messageArea.scrollHeight;
}

/**
 * Handle typing events.
 */
function handleTyping() {
    socket.emit('typing', { target: currentChat === 'group' ? 'group' : personalChatPartner });
}

/**
 * Reset typing indicator.
 */
function resetTyping() {
    socket.emit('typing', { target: currentChat === 'group' ? 'group' : personalChatPartner });
}

/**
 * Initiate a private chat with a user.
 * @param {string} partner - The username of the chat partner.
 */
function initiatePrivateChat(partner) {
    personalChatPartner = partner;
    lastPersonalChatPartner = partner;
    currentChat = 'private';
    chatHeaderTitle.textContent = `Chat with ${partner}`;
    messageArea.innerHTML = ''; // Clear previous messages

    // Request chat history with this partner from Supabase
    socket.emit('requestPrivateHistory', { partner });

    // Show the back button and hide the return button
    backButton.style.display = 'block';
    returnButton.style.display = 'none';
}

// Event Listeners

// Auth Mode (Login vs Sign Up)
let isSignUpMode = false;

if (authToggleLink) {
    authToggleLink.addEventListener('click', (e) => {
        e.preventDefault();
        isSignUpMode = !isSignUpMode;
        if (isSignUpMode) {
            authTitle.textContent = 'Create Account';
            authSubmitBtn.textContent = 'Sign Up';
            authToggleLink.textContent = 'Already have an account? Sign In';
        } else {
            authTitle.textContent = 'Login to Wassup';
            authSubmitBtn.textContent = 'Login';
            authToggleLink.textContent = "Don't have an account? Sign Up";
        }
        errorMessage.textContent = '';
    });
}

// Auth Submit (Login / Register)
if (authSubmitBtn) {
    authSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const userInput = document.getElementById('username').value.trim();
        const passwordInput = document.getElementById('password').value.trim();

        if (!userInput || !passwordInput) {
            errorMessage.textContent = 'Please enter both username and password.';
            return;
        }

        errorMessage.textContent = isSignUpMode ? 'Creating account...' : 'Logging in...';

        if (isSignUpMode) {
            socket.emit('register', { username: userInput, password: passwordInput });
        } else {
            socket.emit('login', { username: userInput, password: passwordInput });
        }
    });
}

// Textarea Input
textarea.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey && e.target.value.trim()) {
        e.preventDefault();
        sendMessage(e.target.value.trim());
        textarea.value = '';
        resetTyping();
    } else {
        handleTyping();
    }
});

// Send Button
const sendBtn = document.getElementById('sendBtn');
if (sendBtn) {
    sendBtn.addEventListener('click', () => {
        const message = textarea.value.trim();
        if (message) {
            sendMessage(message);
            textarea.value = '';
            resetTyping();
        }
    });
}

// Logout Button
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        window.location.reload();
    });
}

// Socket.IO Event Listeners

// Handle Auth Results (Login & Register)
socket.on('authResult', (result) => {
    if (result.success) {
        username = result.username;
        if (loginOverlay) {
            loginOverlay.style.display = 'none';
        }
        textarea.disabled = false;
        textarea.focus();
        errorMessage.textContent = '';

        const usernameDisplay = document.getElementById('usernameDisplay');
        if (usernameDisplay) usernameDisplay.textContent = username;
        if (profilePictureElem) profilePictureElem.src = profilePictureURL;
    } else {
        errorMessage.textContent = result.message || 'Authentication failed.';
    }
});

// Backward compatibility
socket.on('passwordVerified', (isValid) => {
    if (isValid) {
        if (loginOverlay) {
            loginOverlay.style.display = 'none';
        }
        textarea.disabled = false;
        textarea.focus();
        errorMessage.textContent = '';
    } else {
        errorMessage.textContent = 'Invalid username or password.';
    }
});

// Receive group chat history from Supabase
socket.on('loadGroupHistory', (history) => {
    if (currentChat === 'group') {
        messageArea.innerHTML = '';
        groupChatHistory = history;
        history.forEach(msg => {
            receivedMessageIds.add(msg.messageId);
            appendMessage(msg, msg.user === username ? 'outgoing' : 'incoming');
        });
    }
});

// Receive private chat history from Supabase
socket.on('loadPrivateHistory', ({ partner, history }) => {
    if (currentChat === 'private' && personalChatPartner === partner) {
        messageArea.innerHTML = '';
        personalChatHistories[partner] = history;
        history.forEach(msg => {
            receivedMessageIds.add(msg.messageId);
            appendMessage(msg, msg.user === username ? 'outgoing' : 'incoming');
        });
    }
});

// Update the User List
socket.on('updateUsers', (users) => {
    userList.innerHTML = '';
    users.forEach((user) => {
        if (user !== username) {
            const li = document.createElement('li');
            li.textContent = user;
            li.style.cursor = 'pointer';
            userList.appendChild(li);
        }
    });
    if (onlineCount) onlineCount.textContent = users.length;
});

// Event Listener for Active Users List
userList.addEventListener('click', (e) => {
    if (e.target && e.target.nodeName === 'LI') {
        const selectedUser = e.target.textContent.trim();
        if (selectedUser !== username) {
            sendChatRequest(selectedUser);
            alert(`Chat request sent to ${selectedUser}`);
        }
    }
});

// Function to Send Chat Request
function sendChatRequest(targetUser) {
    socket.emit('chatRequest', { to: targetUser, from: username });
}

// Handle Incoming Chat Requests
socket.on('chatRequest', ({ from }) => {
    const requestItem = document.createElement('li');
    requestItem.innerHTML = `
      <strong>${escapeHtml(from)}</strong> wants to chat with you.
      <button class="btn btn-sm btn-success acceptBtn">Accept</button>
      <button class="btn btn-sm btn-danger declineBtn">Decline</button>`;
    chatRequestsList.appendChild(requestItem);

    requestItem.querySelector('.acceptBtn').addEventListener('click', () => {
        socket.emit('chatResponse', { to: from, accepted: true });
        chatRequestsList.removeChild(requestItem);
        initiatePrivateChat(from);
    });
    requestItem.querySelector('.declineBtn').addEventListener('click', () => {
        socket.emit('chatResponse', { to: from, accepted: false });
        chatRequestsList.removeChild(requestItem);
    });
});

// Handle Chat Responses
socket.on('chatResponse', ({ from, accepted }) => {
    if (accepted) {
        alert(`${from} accepted your chat request.`);
        initiatePrivateChat(from);
    } else {
        alert(`${from} declined your chat request.`);
    }
});

// Incoming message handler
socket.on('message', (msg) => {
    if (!receivedMessageIds.has(msg.messageId)) {
        receivedMessageIds.add(msg.messageId);

        if (msg.type === 'group' && currentChat === 'group') {
            appendMessage(msg, msg.user === username ? 'outgoing' : 'incoming');
            if (typeof window.playNotificationSound === 'function' && msg.user !== username) {
                window.playNotificationSound();
            }
        } else if (msg.type === 'private' && currentChat === 'private' && (msg.user === personalChatPartner || msg.target === personalChatPartner)) {
            appendMessage(msg, msg.user === username ? 'outgoing' : 'incoming');
            if (typeof window.playNotificationSound === 'function' && msg.user !== username) {
                window.playNotificationSound();
            }
        }
    }
});

// Typing indicator
socket.on('displayTyping', (data) => {
    if (data.user !== username) {
        typingIndicator.textContent = data.isTyping ? `${data.user} is typing...` : '';
    }
});

socket.on('stopTyping', () => {
    typingIndicator.textContent = '';
});

// Back Button: Return to Group Chat
backButton.addEventListener('click', () => {
    currentChat = 'group';
    personalChatPartner = null;
    chatHeaderTitle.textContent = 'Group Chat';
    messageArea.innerHTML = '';

    // Request group chat history from Supabase
    socket.emit('requestGroupHistory');

    backButton.style.display = 'none';
    returnButton.style.display = lastPersonalChatPartner ? 'block' : 'none';
});

// Return Button: Go Back to Last Private Chat
returnButton.addEventListener('click', () => {
    if (lastPersonalChatPartner) {
        initiatePrivateChat(lastPersonalChatPartner);
        backButton.style.display = 'block';
        returnButton.style.display = 'none';
    }
});

// Initialize Emoji Picker
if (emojiBtn && emojiPicker) {
    emojiBtn.addEventListener('click', () => {
        emojiPicker.classList.toggle("hidden");
        if (!emojiPicker.classList.contains("hidden")) {
            loadEmojis();
        }
    });
}

// Load emojis from emojicpe.txt
function loadEmojis() {
    fetch('emojicpe.txt')
        .then(response => response.text())
        .then(data => {
            const emojis = data.split('\n');
            emojiPicker.innerHTML = '';
            emojis.forEach(emoji => {
                const trimmed = emoji.trim();
                if (trimmed) {
                    const emojiButton = document.createElement('button');
                    emojiButton.textContent = trimmed;
                    emojiButton.type = 'button';
                    emojiButton.addEventListener('click', () => {
                        textarea.value += trimmed;
                        emojiPicker.classList.add("hidden");
                    });
                    emojiPicker.appendChild(emojiButton);
                }
            });
        })
        .catch(error => console.error('Error loading emojis:', error));
}
