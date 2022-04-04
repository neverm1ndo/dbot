import { fromEventPattern } from 'rxjs';
import { io } from 'socket.io-client';
import { User } from '@chat/chat.user';

export class SocketService {
  _user = new User();
  _HOST = window.location.host;
  _socket = io(`wss://${this._HOST}`, {
    reconnectionDelayMax: 10000,
    auth: {
      token: this._user.token,
    }
  });
  constructor() {
    this.onConnect().subscribe(() => {
      console.log(`Соединение с ${this._HOST} установлено`);
    });
  }

  onConnect() {
    return fromEventPattern((cb) => {
      this._socket.on('connect', cb);
    });
  }

  onBotStatus() {
    return fromEventPattern((cb) => {
      this._socket.on('bot-status', cb);
    });
  }

  onStreamOnline() {
    return fromEventPattern((cb) => {
      this._socket.on('stream.online', cb);
    });
  }

  onStreamOffline() {
    return fromEventPattern((cb) => {
      this._socket.on('stream.offline', cb);
    });
  }

  onChannelFollow() {
    return fromEventPattern((cb) => {
      this._socket.on('channel.follow', cb);
    });
  }

  onSoundPlay() {
    return fromEventPattern((cb) => {
      this._socket.on('play-sound', cb);
    });
  }
}
