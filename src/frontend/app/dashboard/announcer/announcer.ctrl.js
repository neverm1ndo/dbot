import Http from '@shared/http';
import { Popout } from '../popout';
import { AnnounceListItemEditComponent } from './announce-list.component';
import template from 'pug-loader!./announcer.tpl.pug';
import itemTemplate from 'pug-loader!./announce.tpl.pug';
import { autoscroll } from '@shared/scroller';

export class AnnouncerController extends Popout {

  editing = false;

  constructor(icon) {
    super({
      title: 'Автоматические сообщения',
      subtitles: [
        `Добавляйте сообщения, которые будут отправлены ботом в чат с интервалом в 10 минут`,
        'Бот не воспроизводит сообщения, пока ваш стрим оффлайн',
      ],
      icon
    });
    this.delay = 10;
    this.body.innerHTML = template();
    this._announceList = this.querySelector('custom-list');
    this._announceList.addEventListener('remove-item', (event) => {
      this._deleteMessage(Object.assign(event.detail.itemValue, { _id: event.detail.target._id }))
          .then(() => {
            this._announceList.remove(event.detail.target);
            console.log('Announce deleted', event.detail.itemValue);
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
      message: this.querySelector('.textarea'),
      submit: this.querySelector('#submit'),
    };
    this._form.submit.addEventListener('click', () => {
      if (!this._form.message.value) return;
      this._addMessage(this.formValue)
          .then(() => {
            this._announceList.add({ message: this.formValue.message, timing: (this._announceList.children.length+1)*this.delay }, itemTemplate, AnnounceListItemEditComponent);
            this._clearForm();
            autoscroll(this.body);
          })
          .catch(console.error);
    });
    this._getAllMessages();
  }

  get formValue() {
    return {
      message: this._form.message.value
    };
  }

  _clearForm() {
    this._form.message.value = '';
  }

  _getAllMessages() {
    return Http.get('/api/user/automessages').then((messages) => {
      messages.forEach((message, index) => {
        this._announceList.add({ message: message.message, _id: message._id, timing: (index+1)*15 }, itemTemplate, AnnounceListItemEditComponent);
      });
    }).catch(console.error);
  }

  _patchMessage(messageValue) {
    return Http.patch('/api/user/patch-custom-announce',
      messageValue,
      { 'Content-Type': 'application/json' });
  }

  _addMessage(messageValue) {
    console.log(messageValue)
    return Http.post('/api/user/add-custom-announce',
      messageValue,
      { 'Content-Type': 'application/json' });
  }

  _deleteMessage(messageValue) {
    return Http.delete('/api/user/delete-custom-announce',
    messageValue,
    { 'Content-Type': 'application/json' });
  }
}
