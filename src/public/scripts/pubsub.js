import { chat, user, channelSets } from './chat';

const _SCOPE = 'user_read+chat_login';

class PubSub {
  ws
  moderation_actions = {
    'unban': 'разбанил',
    'ban': 'забанил'
  }
  constructor() {}
  connect() {
    const heartbeatInterval = 1000 * 60;
    const reconnectInterval = 1000 * 3;
    let heartbeatHandle;
    this.ws = new WebSocket('wss://pubsub-edge.twitch.tv');
    this.ws.onopen = (event) => {
        console.log('[PUBSUB] INFO: Socket Opened')
        this.heartbeat();
        heartbeatHandle = setInterval(() => {
          this.heartbeat();
        }, heartbeatInterval);
        this.listen();
    };
    this.ws.onerror = (error) => {
        console.error('[PUBSUB] ERR:  ' + JSON.stringify(error) + '\n');
    };
    this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('[PUBSUB] RECV: ' + JSON.stringify(message) + '\n');
        if (message.type == 'MESSAGE') {
          const msg = JSON.parse(message.data.message).data;
          if (!this.moderation_actions[msg.moderation_action]) return;
          chat.alert(`<b>${msg.created_by}</b> ${this.moderation_actions[msg.moderation_action]} <b>${msg.args[0]}</b> ${msg.args[1]?'по причине: ' + msg.args[1]:''}`, msg.moderation_action);
        }
        if (message.type == 'RECONNECT') {
            console.log('[PUBSUB] INFO: Reconnecting...\n');
            setTimeout(() => {
              this.connect()
            }, reconnectInterval);
        }
    };
    this.ws.onclose = () => {
        console.log('[PUBSUB] INFO: Socket Closed\n');
        clearInterval(heartbeatHandle);
        console.log('[PUBSUB] INFO: Reconnecting...\n');
        setTimeout(() => {
          this.connect()
        }, reconnectInterval);
    };
  }
  heartbeat() {
    const message = {
        type: 'PING'
    };
    this.ws.send(JSON.stringify(message));
  }
  listen() {
    const message = {
        type: 'LISTEN',
        nonce: nonce(15),
        data: {
            topics: [`chat_moderator_actions.${channelSets.id}.${channelSets.id}`],
            auth_token: user.token
        }
    };
    console.log('[PUBSUB] SENT: ' + JSON.stringify(message) + '\n');
    this.ws.send(JSON.stringify(message));
  }
}
function nonce(length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

export default PubSub;
