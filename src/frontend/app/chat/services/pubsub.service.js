import { User } from '@chat/chat.user';
import { nonce } from '@chat/utils';

export class PubSubService {

  _user = new User();
  _SCOPE = 'user_read+chat_login';
  _ws = new WebSocket('wss://pubsub-edge.twitch.tv');
  _moderation_actions = {
    'unban': 'разбанил',
    'ban': 'забанил'
  };

  connect(id) {
    const heartbeatInterval = 1000 * 60;
    const reconnectInterval = 1000 * 3;
    let heartbeatHandle;
    this._ws.onopen = (event) => {
      console.log('[PUBSUB] INFO: Socket Opened')
      this._heartbeat();
      heartbeatHandle = setInterval(() => {
        this._heartbeat();
      }, heartbeatInterval);
      this._listen(id);
    };
    this._ws.onerror = (error) => {
      console.error('[PUBSUB] ERR:  ' + JSON.stringify(error) + '\n');
    };
    this._ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('[PUBSUB] RECV: ' + JSON.stringify(message) + '\n');
      if (message.type == 'MESSAGE') {
        const msg = JSON.parse(message.data.message).data;
        if (!this._moderation_actions[msg.moderation_action]) return;
        // this.chat.alert(`<b>${msg.created_by}</b> ${this.moderation_actions[msg.moderation_action]} <b>${msg.args[0]}</b> ${msg.args[1]?'по причине: ' + msg.args[1]:''}`, 'warning', '');
      }
      if (message.type == 'RECONNECT') {
        console.log('[PUBSUB] INFO: Reconnecting...\n');
        setTimeout(() => {
          this.connect()
        }, reconnectInterval);
      }
    };
    this._ws.onclose = () => {
      console.log('[PUBSUB] INFO: Socket Closed\n');
      clearInterval(heartbeatHandle);
      console.log('[PUBSUB] INFO: Reconnecting...\n');
      setTimeout(() => {
        this.connect()
      }, reconnectInterval);
    };
  }

  _heartbeat() {
    const message = { type: 'PING' };
    this._ws.send(JSON.stringify(message));
  }

  _listen(id) {
    const message = {
      type: 'LISTEN',
      nonce: nonce(15),
      data: {
          topics: [`chat_moderator_actions.${this._user.id}.${id}`],
          auth_token: this._user.token
      }
    };
    console.log('[PUBSUB] SENT: ' + JSON.stringify(message) + '\n');
    this._ws.send(JSON.stringify(message));
  }
}