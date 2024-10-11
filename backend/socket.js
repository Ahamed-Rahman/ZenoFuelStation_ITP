// backend/socket.js
const io = require('socket.io')(require('http').createServer(), {
    cors: {
      origin: 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  });
  
  module.exports = io;
  