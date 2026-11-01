import { io } from 'socket.io-client';

// Use same host via Vite proxy in development, or fallback to window.location.origin
const SOCKET_URL = window.location.port === '5173' ? 'http://localhost:3000' : window.location.origin;

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

export default socket;

