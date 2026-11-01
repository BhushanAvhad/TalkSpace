import { create } from 'zustand';
import socket from '@/socket/socket';

// Optional audio notification
let notificationAudio = null;
if (typeof window !== 'undefined') {
  notificationAudio = new Audio('/notification.mp3');
}

export const useChatStore = create((set, get) => ({
  currentChat: 'group', // 'group' or username
  activeUsers: [],
  groupMessages: [],
  privateMessages: {}, // { [partner]: Array<msg> }
  chatRequests: [], // [{ from: string }]
  typingUser: null, // username typing, or null
  searchQuery: '',

  setSearchQuery: (query) => set({ searchQuery: query }),

  setCurrentChat: (chat) => {
    set({ currentChat: chat, typingUser: null });
    if (chat === 'group') {
      socket.emit('requestGroupHistory');
    } else {
      socket.emit('requestPrivateHistory', { partner: chat });
    }
  },

  setActiveUsers: (users) => set({ activeUsers: users }),

  setGroupMessages: (messages) => set({ groupMessages: messages }),

  setPrivateMessages: (partner, history) =>
    set((state) => ({
      privateMessages: {
        ...state.privateMessages,
        [partner]: history,
      },
    })),

  addMessage: (msg, currentUsername) => {
    const isIncoming = msg.user !== currentUsername;

    // Trigger audio if message is from another user
    if (isIncoming && notificationAudio) {
      notificationAudio.play().catch(() => {});
    }

    if (msg.type === 'group') {
      set((state) => {
        // Prevent duplicate IDs
        if (state.groupMessages.some((m) => m.messageId === msg.messageId)) return state;
        return { groupMessages: [...state.groupMessages, msg] };
      });
    } else {
      // Private message
      const partner = msg.user === currentUsername ? msg.target : msg.user;
      set((state) => {
        const existing = state.privateMessages[partner] || [];
        if (existing.some((m) => m.messageId === msg.messageId)) return state;
        return {
          privateMessages: {
            ...state.privateMessages,
            [partner]: [...existing, msg],
          },
        };
      });
    }
  },

  setTypingUser: (user) => set({ typingUser: user }),

  addChatRequest: (from) =>
    set((state) => {
      if (state.chatRequests.some((r) => r.from === from)) return state;
      return { chatRequests: [...state.chatRequests, { from }] };
    }),

  removeChatRequest: (from) =>
    set((state) => ({
      chatRequests: state.chatRequests.filter((r) => r.from !== from),
    })),

  sendTextMessage: (text, currentUsername) => {
    if (!text || !text.trim()) return;
    const { currentChat } = get();
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const msgData = {
      user: currentUsername,
      message: text.trim(),
      messageId,
      profilePicture: 'profile.png',
      type: currentChat === 'group' ? 'group' : 'private',
      timestamp: new Date().toISOString(),
    };

    if (currentChat === 'group') {
      socket.emit('groupMessage', msgData);
      get().addMessage(msgData, currentUsername);
    } else {
      msgData.target = currentChat;
      socket.emit('privateMessage', msgData);
      get().addMessage(msgData, currentUsername);
    }
  },

  sendFileMessage: (fileData, currentUsername) => {
    const { currentChat } = get();
    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const msgData = {
      user: currentUsername,
      message: fileData.fileName ? `Shared a file: ${fileData.fileName}` : 'Shared an image',
      fileURL: fileData.fileURL,
      fileName: fileData.fileName,
      messageId,
      profilePicture: 'profile.png',
      type: currentChat === 'group' ? 'group' : 'private',
      timestamp: new Date().toISOString(),
    };

    if (currentChat === 'group') {
      socket.emit('groupMessage', msgData);
      get().addMessage(msgData, currentUsername);
    } else {
      msgData.target = currentChat;
      socket.emit('privateMessage', msgData);
      get().addMessage(msgData, currentUsername);
    }
  },

  emitTyping: () => {
    const { currentChat } = get();
    socket.emit('typing', { target: currentChat });
  },

  sendChatRequest: (targetUser, currentUsername) => {
    socket.emit('chatRequest', { to: targetUser, from: currentUsername });
  },

  respondChatRequest: (fromUser, accepted) => {
    socket.emit('chatResponse', { to: fromUser, accepted });
    get().removeChatRequest(fromUser);
    if (accepted) {
      get().setCurrentChat(fromUser);
    }
  },
}));

export default useChatStore;
