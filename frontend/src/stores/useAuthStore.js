import { create } from 'zustand';
import socket from '@/socket/socket';

const SAVED_USER_KEY = 'talkspace-user';

export const useAuthStore = create((set, get) => {
  const savedUser = typeof window !== 'undefined' ? localStorage.getItem(SAVED_USER_KEY) : null;
  const initialUser = savedUser ? JSON.parse(savedUser) : null;

  return {
    user: initialUser,
    isAuthenticated: !!initialUser,
    isLoading: false,
    authError: null,

    setUser: (user) => {
      if (typeof window !== 'undefined') {
        if (user) {
          localStorage.setItem(SAVED_USER_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(SAVED_USER_KEY);
        }
      }
      set({ user, isAuthenticated: !!user, authError: null, isLoading: false });
    },

    setAuthError: (error) => set({ authError: error, isLoading: false }),

    login: (username, password) => {
      set({ isLoading: true, authError: null });
      if (!socket.connected) socket.connect();
      socket.emit('login', { username, password });
    },

    register: (username, password) => {
      set({ isLoading: true, authError: null });
      if (!socket.connected) socket.connect();
      socket.emit('register', { username, password });
    },

    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(SAVED_USER_KEY);
      }
      if (socket.connected) {
        socket.disconnect();
      }
      set({ user: null, isAuthenticated: false, authError: null, isLoading: false });
    },
  };
});

export default useAuthStore;
