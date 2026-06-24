const http = require('http');
const { Server } = require('socket.io');
const logger = require('../utils/logger');
const User = require('../models/User');

const setupSocket = (server) => {
  const io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
    },
  });

  // Online users map
  const onlineUsers = new Map();

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error'));

      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password -refreshTokens');
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    logger.info(`✅ Socket connected: ${socket.user.name} (${userId})`);

    // Join personal room
    socket.join(userId);
    onlineUsers.set(userId, socket.id);

    // Broadcast online status
    io.emit('user_online', { userId, name: socket.user.name });

    // Get online users
    socket.on('get_online_users', () => {
      socket.emit('online_users', Array.from(onlineUsers.keys()));
    });

    // Typing indicator
    socket.on('typing', ({ to }) => {
      socket.to(to).emit('typing', { from: userId });
    });

    socket.on('stop_typing', ({ to }) => {
      socket.to(to).emit('stop_typing', { from: userId });
    });

    // Message read receipt
    socket.on('message_read', ({ conversationId }) => {
      socket.broadcast.emit('message_read', { conversationId, by: userId });
    });

    // Join class room (for class-wide broadcasts)
    socket.on('join_class', (classId) => {
      socket.join(`class_${classId}`);
    });

    // Disconnect
    socket.on('disconnect', () => {
      logger.info(`❌ Socket disconnected: ${socket.user.name}`);
      onlineUsers.delete(userId);
      io.emit('user_offline', { userId });
    });
  });

  return io;
};

module.exports = setupSocket;
