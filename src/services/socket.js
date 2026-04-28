import { io } from 'socket.io-client';

let socket;

export const initSocket = () => {
  const BACKEND_URL = 'http://localhost:3000';
  socket = io(BACKEND_URL, {
    transports: ['websocket'],
  });
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) socket.disconnect();
};