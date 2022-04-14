import logger from '@shared/Logger';
import { USER } from '../schemas/user.schema';
import { Socket } from 'socket.io';

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
    if (socket.handshake.auth.channel) socket.data.channel = socket.handshake.auth.channel
    logger.imp(user.user.display_name + ' authenticated');
    next();
  });
};

const sockets = (socket: Socket) => {

  socket.join(socket.data.channel || socket.data.username);

  socket.on('disconnect', (reason) => {
    logger.info(`${socket.data.username}  disconnected from ${socket.rooms}:  ${reason}`);
  });
}
export default sockets;
