import './pre-start'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import https from 'https';
import http from 'http';
import { readFileSync } from 'fs';
import { Server, Socket } from 'socket.io';
import sockets, { socketAuth, socketCORS } from './routes/sockets';

const port = Number(process.env.PORT);

const server = https.createServer({
  key: readFileSync(process.env.SSL_KEY!, 'utf8'),
  cert: readFileSync(process.env.SSL_CERT!, 'utf8'),
  rejectUnauthorized: false
}, app);

const serverHttp = http.createServer(app);

export const io = new Server(server, { cors: socketCORS });
io.use(socketAuth);
io.on('connection', (socket: Socket) => {
  sockets(socket);
});

server.listen(port, () => { logger.info('OMD server started on port: ' + port) });
serverHttp.listen(8080, () => { logger.info('OMD server started on port: ' + 8080) });
