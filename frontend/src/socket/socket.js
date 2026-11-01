import { io } from 'socket.io-client';

// Connect directly to the unified server on port 3000
const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

export const socket = io(SOCKET_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

export default socket;
