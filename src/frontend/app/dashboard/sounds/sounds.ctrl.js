import template from 'pug-loader!./sounds.tpl.pug';
import Http from '@shared/http';
import { Popout } from '../popout';
import { Player } from './player';
import { autoscroll } from '@shared/scroller';

const HEADERS = { 'Content-Type': 'application/json' };

export class SoundsController extends Popout {
  constructor(icon) {
    super({
      title: 'Звуковые команды',
      subtitles: [
        'Добавляйте звуки, для воспроизведения их в спикере бота с помощью команды в чате'
      ],
      icon: icon
    });
    this.body.innerHTML = template();
    this._soundsList = this.querySelector('sounds-list');
    this._soundsList.addEventListener('play-item-sound', (event) => {
      this._player.play(event.detail);
    });
    this._soundsList.addEventListener('patch-list-item', (event) => {
      this._patchSound(event.detail)
          .then(() => {
            console.log('Sound patched successfuly');
          }).catch(console.error);
    });
    this._soundsList.addEventListener('remove-item', (event) => {
      this._deleteSound(event.detail.item)
          .then(() => {
            event.detail.target.remove();
          }).catch(console.error);
    });
    this._form = {
      name: this.querySelector('#command-name'),
      response: this.querySelector('#new-sound-path'),
      submit: this.querySelector('#submit'),
    };
    this._form.submit.addEventListener('click', () => {
      if (!this._form.response.value && !this._form.name.value) return;
      this._addSound(this.formValue)
          .then((res) => res.json())
          .then((data) => {
            this._soundsList.add(data);
            this._clearForm();
            autoscroll(this.body);
          })
          .catch(console.error);
    });
    this._player = new Player();
    this._getSounds();
  }

  get formValue() {
    return {
      command: this._form.name.value.toLowerCase(),
      path: this._form.response.value
    };
  }

  _clearForm() {
    this._form.textarea.value = '';
    this._form.name.value = '';
  }

  _getSounds() {
    return Http.get('/api/user/sounds').then((sounds) => {
      sounds.forEach((sound) => {
        this._soundsList.add(sound);
      });
    }).catch((err) => console.error);
  }

  _addSound(soundValue) {
    return Http.post('/api/user/sound', soundValue, HEADERS);
  }

  _patchSound(soundValue) {
    return Http.patch('/api/user/sound', soundValue, HEADERS);
  }

  _deleteSound(soundValue) {
    return Http.delete('/api/user/sound', soundValue, HEADERS);
  }
}
