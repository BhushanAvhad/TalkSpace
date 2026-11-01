import { create } from 'zustand';
import socket from '@/socket/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  authError: null,

  setUser: (userData) => {
    set((state) => ({
      user: userData ? { ...state.user, ...userData } : null,
      isAuthenticated: !!userData,
      authError: null,
      isLoading: false
    }));
  },

  updateProfile: (profileData) => {
    if (socket.connected) {
      socket.emit('updateProfile', profileData);
    }
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

