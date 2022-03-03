import { ChatAlert } from './chat.alert';
import { MessageControlButton } from './chat.message-control';

export class ChattersListController {
  dom = {
    box: document.querySelector('#chatters-list'),
    list: document.querySelector('#list'),
    counter: document.querySelector('#chatters-counter'),
    altCounter: document.querySelector('#chatters-counter-alt'),
    buttons: {
      open: document.querySelector('#open-chatters-list'),
      close: document.querySelector('#close')
    }
  };
  connected = [];
  constructor() {
    this.dom.buttons.close.addEventListener('click', () => {
      this.close();
    });
    this.dom.buttons.open.addEventListener('click', () => {
      this.open();
      this.dom.list.innerHTML = '';
      for (let i = 0; i < this.connected.length; i++) {
        const card = document.createElement('div');
              card.classList.add('card');
        const body = document.createElement('div');
              body.classList.add('card-body', 'pt-0', 'pb-0');
              body.innerText = this.connected[i];
        let btn = body.prepend(
          new MessageControlButton(['bi', 'bi-robot', 'red'], () => {
            ChatAlert.addLurker(this.connected[i]);
            // innerHTML!
            card.innerHTML = '<em>(<b>' + this.connected[i] + '</b> добавлен в черный список)</em>';
            this.remove(this.connected[i]);
            setTimeout(() => {
              card.remove();
            }, 3000);
          }),
        );
        card.append(body);
        this.dom.list.append(card);
      }
    });
  }
  remove(username) {
    this.connected.splice(this.connected.indexOf(username), 1);
    this.dom.altCounter.innerText = this.connected.length;
  }
  add(username) {
    this.connected.push(username);
    this.dom.altCounter.innerText = this.connected.length;
  }
  open() {
    this.dom.box.style.display = 'block';
  }
  close() {
    this.dom.box.style.display = 'none';
  }
}
