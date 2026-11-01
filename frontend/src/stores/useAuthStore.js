import { create } from 'zustand';
import socket from '@/socket/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,

  setUser: (user) => {
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
    if (socket.connected) {
      socket.disconnect();
    }
    set({ user: null, isAuthenticated: false, authError: null, isLoading: false });
  },
}));

export default useAuthStore;

