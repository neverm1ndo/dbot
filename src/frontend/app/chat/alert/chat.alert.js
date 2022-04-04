import template from 'pug-loader!./alert.tpl.pug';
import { MessageControlButton } from '@chat/message/chat.message-control';

export class ChatAlert extends HTMLElement {
  constructor(message, type = 'default', username = '', icon) {
    super();
    this.username = username;
    this.type = type;
    this.classList.add('alert', 'mb-1');
    this.innerHTML = template({
      icon: icon ? icon.join(' '): undefined,
      message
    });
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
    this.msg = this.querySelector('.message');

    if (!username) return;
    let btn = new MessageControlButton(['bi', 'bi-robot', 'white'], (event) => {
      const msg = document.createElement('span');
      // ChatAlert.addLurker(username);
      // chatterList.remove(username);
      btn.remove();
      this.msg.remove();
      msg.innerHTML = '<em>(<b>' + username + '</b> добавлен в черный список)</em>';
      this.prepend(msg);
      setTimeout(() => {
        this.remove()
      }, 2000);
      event.preventDefault();
      event.stopPropagation();
    });
    this.prepend(btn);
  }
}
