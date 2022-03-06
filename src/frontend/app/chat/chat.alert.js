import { MessageControlButton } from './chat.message-control';
import { chat, chatterList } from './chat';

export class ChatAlert extends HTMLDivElement {
  constructor(message, type = 'default', username = '', icon) {
    super();
    this.username = username;
    this.type = type;
    this.msg = document.createElement('span');
    if (icon) {
      this.icon = document.createElement('i');
      this.icon.classList.add(...icon);
    }
    this.classList.add('alert', 'mb-1');
    switch (type) {
      case 'success':
      this.classList.add('bg-success', 'text-light');
        break;
      case 'ban':
        this.classList.add('bg-warning', 'text-dark');
        break;
      case 'unban':
        this.classList.add('bg-warning', 'text-dark');
        break;
      case 'danger':
        this.classList.add('bg-danger', 'text-light');
        break;
      case 'siren':
        this.classList.add('bg-danger', 'text-light', 'siren');
        break;
      case 'warning':
        this.classList.add('bg-warning', 'text-dark');
        break;
      case 'info':
        this.classList.add('bg-info', 'text-dark');
        break;
      case 'twitch':
        this.classList.add('bg-purple', 'text-light');
        break;
      case 'connect':
        this.classList.add('connect', 'text-light');
        break;
      case 'disconnect':
        this.classList.add('disconnect', 'text-light');
        break;
      default:
        this.classList.add('text-muted');
    }
    this.msg.innerHTML = message;
    if (icon) this.msg.prepend(this.icon);
    this.append(this.msg);
    if (username) {
      let btn = new MessageControlButton(['bi', 'bi-robot', 'white'], (e) => {
        const msg = document.createElement('span');
        ChatAlert.addLurker(username);
        chatterList.remove(username);
        btn.remove();
        this.msg.remove();
        msg.innerHTML = '<em>(<b>' + username + '</b> добавлен в черный список)</em>';
        this.prepend(msg);
        e.preventDefault();
        e.stopPropagation();
      })
      this.prepend(btn);
    }
  }
  static addLurker(username) {
    chat.settings.lurkers.push(username);
    window.localStorage.setItem('lurkers', JSON.stringify([...new Set(chat.settings.lurkers)]));
  }
}
