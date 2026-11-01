import { create } from 'zustand';
import socket from '@/socket/socket';

const SOUND_PREF_KEY = 'talkspace-sound-enabled';
const MUTED_CHATS_KEY = 'talkspace-muted-chats';

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

  const initialMuted =
    typeof window !== 'undefined'
      ? JSON.parse(localStorage.getItem(MUTED_CHATS_KEY) || '[]')
      : [];

  return {
    currentChat: 'group', // 'group' or username
    activeUsers: [],
    groupMessages: [],
    privateMessages: {}, // { [partner]: Array<msg> }
    chatRequests: [], // [{ from: string }]
    typingUser: null, // username typing, or null
    searchQuery: '',
    soundEnabled: initialSound,
    mutedChats: initialMuted, // Array<string>
    unreadCounts: {}, // { [chatKey]: number }
    messageReactions: {}, // { [messageId]: { [emoji]: Array<username> } }
    connectionStatus: 'connected', // 'connected' | 'connecting' | 'disconnected'
    sharedMediaOpen: false,

    // Phase 6: Replies, Editing, Search, and Read Receipts
    replyingTo: null, // { messageId, user, text, fileURL, fileName } | null
    editingMessage: null, // { messageId, text } | null
    searchModalOpen: false,
    searchResults: { query: '', messages: [], users: [] },
    isSearching: false,
    readReceipts: {}, // { [partner]: timestamp }
    userProfiles: {}, // { [username]: { avatarUrl, statusText, bio } }

    setSharedMediaOpen: (open) => set({ sharedMediaOpen: open }),
    toggleSharedMedia: () => set((state) => ({ sharedMediaOpen: !state.sharedMediaOpen })),

    setSearchModalOpen: (open) => set({ searchModalOpen: open }),
    setSearchResults: (results) => set({ searchResults: results, isSearching: false }),
    setIsSearching: (isSearching) => set({ isSearching }),

    setReplyingTo: (msg) => set({ replyingTo: msg, editingMessage: null }),
    clearReplyingTo: () => set({ replyingTo: null }),

    setEditingMessage: (msg) => set({ editingMessage: msg, replyingTo: null }),
    clearEditingMessage: () => set({ editingMessage: null }),

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

    toggleMuteChat: (chatName) => {
      set((state) => {
        const isMuted = state.mutedChats.includes(chatName);
        const updated = isMuted
          ? state.mutedChats.filter((c) => c !== chatName)
          : [...state.mutedChats, chatName];
        if (typeof window !== 'undefined') {
          localStorage.setItem(MUTED_CHATS_KEY, JSON.stringify(updated));
        }
        return { mutedChats: updated };
      });
    },

    setSearchQuery: (query) => set({ searchQuery: query }),

    setCurrentChat: (chat) => {
      set((state) => ({
        currentChat: chat,
        typingUser: null,
        replyingTo: null,
        editingMessage: null,
        unreadCounts: {
          ...state.unreadCounts,
          [chat]: 0,
        },
      }));

      // Notify partner that messages are read
      if (chat !== 'group' && socket.connected) {
        socket.emit('markMessagesRead', { partner: chat });
      }

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
      const { soundEnabled, currentChat, mutedChats } = get();

      const sourceChat = msg.type === 'group' ? 'group' : msg.user;
      const isMuted = mutedChats.includes(sourceChat);

      // Trigger audio if message is incoming, sound enabled, and chat not muted
      if (isIncoming && soundEnabled && !isMuted && notificationAudio) {
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

    // Real-Time Socket Event Handlers for Phase 6
    onMessageEdited: ({ messageId, newText, isEdited, editedAt }) => {
      set((state) => {
        const updateList = (list) =>
          list.map((m) =>
            m.messageId === messageId
              ? { ...m, message: newText, isEdited: true, editedAt }
              : m
          );

        const newPrivate = {};
        for (const [k, v] of Object.entries(state.privateMessages)) {
          newPrivate[k] = updateList(v);
        }

        return {
          groupMessages: updateList(state.groupMessages),
          privateMessages: newPrivate,
        };
      });
    },

    onMessageDeleted: ({ messageId }) => {
      set((state) => {
        const updateList = (list) =>
          list.map((m) =>
            m.messageId === messageId
              ? {
                  ...m,
                  isDeleted: true,
                  message: 'This message was deleted',
                  fileURL: null,
                  fileName: null,
                }
              : m
          );

        const newPrivate = {};
        for (const [k, v] of Object.entries(state.privateMessages)) {
          newPrivate[k] = updateList(v);
        }

        return {
          groupMessages: updateList(state.groupMessages),
          privateMessages: newPrivate,
        };
      });
    },

    onReactionUpdated: ({ messageId, reactions }) => {
      set((state) => {
        const updateList = (list) =>
          list.map((m) => (m.messageId === messageId ? { ...m, reactions } : m));

        const newPrivate = {};
        for (const [k, v] of Object.entries(state.privateMessages)) {
          newPrivate[k] = updateList(v);
        }

        return {
          groupMessages: updateList(state.groupMessages),
          privateMessages: newPrivate,
          messageReactions: {
            ...state.messageReactions,
            [messageId]: reactions,
          },
        };
      });
    },

    onConversationRead: ({ partner, timestamp }) => {
      set((state) => ({
        readReceipts: {
          ...state.readReceipts,
          [partner]: timestamp,
        },
      }));
    },

    setUserProfileCache: (username, profile) => {
      set((state) => {
        const existing = state.userProfiles[username];
        if (
          existing &&
          existing.avatarUrl === profile.avatarUrl &&
          existing.statusText === profile.statusText &&
          existing.bio === profile.bio
        ) {
          return state; // Prevent unnecessary re-render loop
        }
        return {
          userProfiles: {
            ...state.userProfiles,
            [username]: profile,
          },
        };
      });
    },

    setUserProfilesBatch: (profilesList) => {
      set((state) => {
        const next = { ...state.userProfiles };
        let hasChanges = false;
        profilesList.forEach((p) => {
          if (!p.username) return;
          const existing = next[p.username];
          if (
            !existing ||
            existing.avatarUrl !== p.avatarUrl ||
            existing.statusText !== p.statusText ||
            existing.bio !== p.bio
          ) {
            next[p.username] = p;
            hasChanges = true;
          }
        });
        if (!hasChanges) return state;
        return { userProfiles: next };
      });
    },

    // User Actions
    toggleReaction: (messageId, emoji) => {
      if (socket.connected) {
        socket.emit('toggleReaction', { messageId, emoji });
      }
    },

    editMessage: (messageId, newText) => {
      if (!newText || !newText.trim() || !socket.connected) return;
      socket.emit('editMessage', { messageId, newText: newText.trim() });
      get().clearEditingMessage();
    },

    deleteMessage: (messageId) => {
      if (!messageId || !socket.connected) return;
      socket.emit('deleteMessage', { messageId });
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
      const { currentChat, replyingTo } = get();
      const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

      const msgData = {
        user: currentUsername,
        message: text.trim(),
        messageId,
        profilePicture: 'profile.png',
        type: currentChat === 'group' ? 'group' : 'private',
        timestamp: new Date().toISOString(),
        replyTo: replyingTo
          ? {
              messageId: replyingTo.messageId,
              user: replyingTo.user,
              text: replyingTo.message || '',
              fileURL: replyingTo.fileURL || null,
              fileName: replyingTo.fileName || null,
            }
          : null,
        isEdited: false,
        isDeleted: false,
        reactions: {},
      };

      if (currentChat === 'group') {
        socket.emit('groupMessage', msgData);
        get().addMessage(msgData, currentUsername);
      } else {
        msgData.target = currentChat;
        socket.emit('privateMessage', msgData);
        get().addMessage(msgData, currentUsername);
      }

      get().clearReplyingTo();
    },

    sendFileMessage: (fileData, currentUsername, customCaption = '') => {
      const { currentChat, replyingTo } = get();
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
        replyTo: replyingTo
          ? {
              messageId: replyingTo.messageId,
              user: replyingTo.user,
              text: replyingTo.message || '',
              fileURL: replyingTo.fileURL || null,
              fileName: replyingTo.fileName || null,
            }
          : null,
        isEdited: false,
        isDeleted: false,
        reactions: {},
      };

      if (currentChat === 'group') {
        socket.emit('groupMessage', msgData);
        get().addMessage(msgData, currentUsername);
      } else {
        msgData.target = currentChat;
        socket.emit('privateMessage', msgData);
        get().addMessage(msgData, currentUsername);
      }

      get().clearReplyingTo();
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
