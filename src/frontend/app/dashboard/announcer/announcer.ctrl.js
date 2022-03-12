import Http from '@shared/http';
import { Popout } from '../popout';
import template from 'pug-loader!./announcer.tpl.pug';
import emptyList from 'pug-loader!../commands/empty-commands-list.tpl.pug';
import { AnnounceComponent } from './announce';

export class AnnouncerController extends Popout {
  _messages = [];
  constructor() {
    super();
    this.getAllMessages();
    this.innerHTML = template();
    this.closeBtn  = this.querySelector('.btn-close');
    this.container = this.querySelector('#container');
    // this.name      = this.querySelector('#command-name');
    this.textarea  = this.querySelector('.textarea');
    this.submit    = this.querySelector('#submit');
    this.closeBtn.addEventListener('click', () => {
      this.close();
    })
    this.submit.addEventListener('click', () => {
      if (!this.textarea.value) return;
      this.addMessage(this.textarea.value)
      .then(() => {
        console.log('saved');
        this.textarea.value = '';
      })
      .catch((err) => {
        console.error(err);
      });
    });
  }

  // close() {
  //   // this.classList.add('d-none');
  //   this.remove();
  // }
  // open() {
  //   this.classList.remove('d-none');
  //   this.name.focus();
  // }

  isEmpty() {
    if (this._messages.length > 0) {
      const empty = this.container.querySelector('#empty');
      if (empty) empty.remove();
      return;
    }
    this.container.innerHTML = emptyList({ message: 'Список кастомных команд пуст' });
  }

  getAllMessages() {
    return Http.get('/api/user/automessages').then((messages) => {
      /*
        Add rules to stack
      */
      messages.forEach((message) => {
        this.addMessageToListView(message);
      });
      this.isEmpty();
    }).catch((err) => {
      /*
      Show error alert
      */
      console.error(err);
    });
  }
  //
  addMessage(messageRaw) {
    return Http.post('/api/user/update-automessages',
      {
        messages: [...this.getMessagesRaw(), messageRaw]
      }, {
        'Content-Type': 'application/json'
      })
      .then(() => {
        this.addMessageToListView(messageRaw);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  //
  addMessageToListView(messageRaw) {
    const message = new AnnounceComponent(this.container.children.length + 1, messageRaw);
    this._messages.push(message);
    this.container.append(message);
    message.addEventListener('save', (event) => {
      this.saveMessages().then(() => {
        console.log('saved');
      });
    });
    message.addEventListener('delete', (event) => {
      this._messages.splice(this._messages.indexOf(event.target.value), 1);
      this.saveMessages().then(() => {
        console.log('deleted');
        this.isEmpty();
      });
    });
  }
  //
  saveMessages() {
    return Http.post('/api/user/update-automessages',
      {
        messages: this.getMessagesRaw()
      }, {
        'Content-Type': 'application/json'
      })
      .catch((err) => {
        console.error(err);
      });
  }
  //
  getMessagesRaw() {
    return this._messages.map(message => message.value);
  }
}
