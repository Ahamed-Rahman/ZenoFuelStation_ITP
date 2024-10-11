// src/services/socketService.js
import io from 'socket.io-client';

// Replace with your server URL
const socket = io('http://localhost:5000', {
  transports: ['websocket'],
});

export default socket;
