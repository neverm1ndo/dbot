import { WSMessage } from '@interfaces/ws.message';
import logger from '@shared/Logger';

export class Client {
  readonly ws: WebSocket;

  constructor (ws: WebSocket) {
    this.ws = ws;
  }
}


export class ClientManager {
  public pool: Client[] = [];
  private getClientFromPool(ws: WebSocket): Client | undefined {
    for (let i = 0; i < this.pool.length; i+=1) {
      if (this.pool[i].ws == ws) {
        return this.pool[i];
      }
    }
    return undefined;
  }
  public add(client: Client): void {
    this.pool.push(client);
  }
  public remove(ws: WebSocket): void {
    let client = this.getClientFromPool(ws);
    if (!client) return logger.err('[CM] Client not exists');
    this.pool.splice(this.pool.indexOf(client) , 1);
  }
  public sendall(message: WSMessage): void {
    this.pool.forEach((client: Client) => {
      client.ws.send(JSON.stringify(message));
    });
  }
}
