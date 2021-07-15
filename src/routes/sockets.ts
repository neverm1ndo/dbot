import logger from '@shared/Logger';
// import { WSMessage } from '@interfaces/ws.message';
import { ClientManager } from '@shared/client.manager';

export const cm = new ClientManager();

const sockets = (ws: any, req: any) => {
  cm.add({ ws: ws });
  ws.on('close', (ws: WebSocket) => {
    logger.info(`WS │ , ${req.connection.remoteAddress} -> CLOSED_CONNECTION`);
    cm.remove(ws);
  });
}
export default sockets;
