import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

let socketInstance = null;

const useSocket = () => {
  const { accessToken, isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated || !accessToken) return;

    if (!socketInstance) {
      const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : '/';
      socketInstance = io(socketUrl, {
        auth: { token: accessToken },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      setIsConnected(true);
      socketInstance.emit('get_online_users');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('online_users', (users) => {
      setOnlineUsers(users);
    });

    socketInstance.on('user_online', ({ userId }) => {
      setOnlineUsers((prev) => [...new Set([...prev, userId])]);
    });

    socketInstance.on('user_offline', ({ userId }) => {
      setOnlineUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socketInstance?.off('connect');
      socketInstance?.off('disconnect');
      socketInstance?.off('online_users');
      socketInstance?.off('user_online');
      socketInstance?.off('user_offline');
    };
  }, [isAuthenticated, accessToken]);

  const emit = (event, data) => socketRef.current?.emit(event, data);
  const on = (event, handler) => socketRef.current?.on(event, handler);
  const off = (event, handler) => socketRef.current?.off(event, handler);

  return { socket: socketRef.current, isConnected, onlineUsers, emit, on, off };
};

export default useSocket;
