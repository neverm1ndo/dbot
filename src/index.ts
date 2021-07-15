import './pre-start'; // Must be the first import
import app from '@server';
import logger from '@shared/Logger';
import https from 'https';
// import http from 'http';
import { readFileSync } from 'fs';
import WebSocket from 'ws';
import sockets from './routes/sockets';

const port = Number(process.env.PORT);

const server = https.createServer({
  key: readFileSync(process.env.SSL_KEY!, 'utf8'),
  cert: readFileSync(process.env.SSL_CERT!, 'utf8'),
  rejectUnauthorized: false
}, app);
// const serverHttp = http.createServer(app);
const wss = new WebSocket.Server({ server });
wss.on('connection', (ws: WebSocket, req: any) => {
  sockets(ws, req);
});
server.listen(port, () => { logger.info('OMD server started on port: ' + port) });
// serverHttp.listen(8080, () => { logger.info('OMD server started on port: ' + port) });
