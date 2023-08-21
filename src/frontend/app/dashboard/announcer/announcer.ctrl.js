import Http from '@shared/http';
import { Popout } from '../popout';
import { AnnounceListItemEditComponent } from './announce-list.component';
import template from './announcer.tpl.pug';
import itemTemplate from './announce.tpl.pug';
import { autoscroll } from '@shared/scroller';

const HttpHeaders = { 'Content-Type': 'application/json' };

export class AnnouncerController extends Popout {

  editing = false;

  constructor(icon) {
    super({
      title: 'Автоматические сообщения',
      subtitles: [
        `Добавляйте сообщения, которые будут отправлены ботом в чат с определенным интервалом`,
        'Бот не воспроизводит сообщения, пока ваш стрим оффлайн',
      ],
      icon
    });
    this.body.innerHTML = template();
    this._announceList = this.querySelector('custom-list');
    this._announceList.addEventListener('remove-item', (event) => {
      this._deleteMessage(Object.assign(event.detail.itemValue, { _id: event.detail.target._id }))
          .then(() => {
            this._announceList.remove(event.detail.target);
            console.log('Announce deleted', event.detail.value);
          })
          .catch(console.error);
    });
    this._announceList.addEventListener('patch-list-item', (event) => {
      this._patchMessage(event.detail)
          .then(() => {
            console.log('Announce patched successfuly');
          }).catch(console.error);
    });
    this._form = {
      interval: this.querySelector('.interval'),
      message: this.querySelector('.textarea'),
      submit: this.querySelector('#submit'),
    };
    this._form.submit.addEventListener('click', () => {
      if (!this._form.message.value || !this._form.interval.value) return;
      this._addMessage(this.formValue)
          .then(() => {
            this._announceList.add(this.formValue, itemTemplate, AnnounceListItemEditComponent);
            this._clearForm();
            autoscroll(this.body);
          })
          .catch(console.error);
    });
    this._getAllMessages();
  }

  get formValue() {
    return {
      interval: +this._form.interval.value,
      message: this._form.message.value
    };
  }

  _clearForm() {
    this._form.message.value = this._form.interval.value = '';
  }

  _getAllMessages() {
    return Http.get('/api/user/automessages').then((messages) => {
      messages.forEach((value) => {
        this._announceList.add(value, itemTemplate, AnnounceListItemEditComponent);
      });
    }).catch(console.error);
  }

  _patchMessage(message) {
    return Http.patch('/api/user/patch-custom-announce',
      message,
      HttpHeaders);
  }

  _addMessage(message) {
    return Http.post('/api/user/add-custom-announce',
      message,
      HttpHeaders);
  }

  _deleteMessage(message) {
    return Http.delete('/api/user/delete-custom-announce',
      message,
      HttpHeaders);
  }
}
