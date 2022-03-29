import logger from '@shared/Logger';
import { USER } from '../schemas/user.schema';
import { Socket } from 'socket.io';
import { bot } from '../Server';

export const socketCORS = {
  origin: '*',
  methods: ['GET', 'POST'],
  credentials: true
};
export const socketAuth = (socket: any, next: any) => {
  const token = socket.handshake.auth.token;
  USER.findOne({'accessToken': token}, (err: any, user: any) => {
    if (err || !user) return next(err);
    socket.data.username = user.user.login;
    socket.data.id = user.user.id;
    logger.imp(user.user.display_name + ' authenticated');
    next();
  });
};

const sockets = (socket: Socket) => {

  socket.join(socket.data.username);

  socket.on('chat-connection', () => {
    socket.emit('bot-status', bot.status);
  });
  socket.on('disconnect', (reason) => {
    logger.info(`${socket.data.username}  disconnected from ${socket.rooms}:  ${reason}`);
  });
}
export default sockets;
