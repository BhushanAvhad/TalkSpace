import { create } from 'zustand';
import socket from '@/socket/socket';

const SOUND_PREF_KEY = 'talkspace-sound-enabled';

let notificationAudio = null;
if (typeof window !== 'undefined') {
  try {
    notificationAudio = new Audio('/notification.mp3');
  } catch (e) {
    // audio fallback
  }
}

export const useChatStore = create((set, get) => {
  const initialSound =
    typeof window !== 'undefined'
      ? localStorage.getItem(SOUND_PREF_KEY) !== 'false'
      : true;

  return {
    currentChat: 'group', // 'group' or username
    activeUsers: [],
    groupMessages: [],
    privateMessages: {}, // { [partner]: Array<msg> }
    chatRequests: [], // [{ from: string }]
    typingUser: null, // username typing, or null
    searchQuery: '',
    soundEnabled: initialSound,
    unreadCounts: {}, // { [chatKey]: number }
    messageReactions: {}, // { [messageId]: { [emoji]: count } }
    connectionStatus: 'connected', // 'connected' | 'connecting' | 'disconnected'
    sharedMediaOpen: false,

    setSharedMediaOpen: (open) => set({ sharedMediaOpen: open }),
    toggleSharedMedia: () => set((state) => ({ sharedMediaOpen: !state.sharedMediaOpen })),

    setConnectionStatus: (status) => set({ connectionStatus: status }),

    toggleSound: () => {
      set((state) => {
        const next = !state.soundEnabled;
        if (typeof window !== 'undefined') {
          localStorage.setItem(SOUND_PREF_KEY, String(next));
        }
        return { soundEnabled: next };
      });
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    setCurrentChat: (chat) => {
      set((state) => ({
        currentChat: chat,
        typingUser: null,
        unreadCounts: {
          ...state.unreadCounts,
          [chat]: 0,
        },
      }));

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
      const { soundEnabled, currentChat } = get();

      // Trigger audio if message is incoming and sound is enabled
      if (isIncoming && soundEnabled && notificationAudio) {
        notificationAudio.play().catch(() => {});
      }

      if (msg.type === 'group') {
        set((state) => {
          if (state.groupMessages.some((m) => m.messageId === msg.messageId)) return state;
          
          const isBackground = state.currentChat !== 'group' && isIncoming;
          const currentCount = state.unreadCounts['group'] || 0;

          return {
            groupMessages: [...state.groupMessages, msg],
            unreadCounts: isBackground
              ? { ...state.unreadCounts, group: currentCount + 1 }
              : state.unreadCounts,
          };
        });
      } else {
        // Private message
        const partner = msg.user === currentUsername ? msg.target : msg.user;
        set((state) => {
          const existing = state.privateMessages[partner] || [];
          if (existing.some((m) => m.messageId === msg.messageId)) return state;

          const isBackground = state.currentChat !== partner && isIncoming;
          const currentCount = state.unreadCounts[partner] || 0;

          return {
            privateMessages: {
              ...state.privateMessages,
              [partner]: [...existing, msg],
            },
            unreadCounts: isBackground
              ? { ...state.unreadCounts, [partner]: currentCount + 1 }
              : state.unreadCounts,
          };
        });
      }
    },

    toggleReaction: (messageId, emoji) => {
      set((state) => {
        const msgReactions = state.messageReactions[messageId] || {};
        const count = msgReactions[emoji] || 0;
        return {
          messageReactions: {
            ...state.messageReactions,
            [messageId]: {
              ...msgReactions,
              [emoji]: count > 0 ? 0 : 1, // toggle on/off
            },
          },
        };
      });
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

    sendFileMessage: (fileData, currentUsername, customCaption = '') => {
      const { currentChat } = get();
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const msgData = {
        user: currentUsername,
        message: customCaption || (fileData.fileName ? `Shared a file: ${fileData.fileName}` : 'Shared an image'),
        fileURL: fileData.fileURL,
        fileName: fileData.fileName,
        fileSize: fileData.fileSize || null,
        fileType: fileData.fileType || null,
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
  };
});

export default useChatStore;

