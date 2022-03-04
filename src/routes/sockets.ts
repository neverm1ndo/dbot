import logger from '@shared/Logger';
// import { WSMessage } from '@interfaces/ws.message';
import { ClientManager } from '@shared/client.manager';
import { bot } from '@server';

export const cm = new ClientManager();

const sockets = (ws: any, req: any) => {
  cm.add({ ws: ws });
  ws.on('close', (ws: WebSocket) => {
    logger.info(`WS │ , ${req.connection.remoteAddress} -> CLOSED_CONNECTION`);
    cm.remove(ws);
  });
  ws.on('message', (message: string) => {
    const depeche = JSON.parse(message);
    switch (depeche.event) {
      case 'chat-connection': ws.send(JSON.stringify({ event: 'bot-status', msg: bot.status })); break;
      default: break;
    }
  })
}
export default sockets;
