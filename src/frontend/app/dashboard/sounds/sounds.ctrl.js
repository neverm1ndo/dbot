import Http from '@shared/http';
import template from 'pug-loader!./sounds.tpl.pug';
import emptyList from 'pug-loader!../commands/empty-commands-list.tpl.pug';
import { SoundComponent } from './sound';

export class SoundsController extends HTMLElement {
  _sounds = [];
  constructor() {
    super();
    this.getAllSounds();
    this.innerHTML = template();
    this.closeBtn  = this.querySelector('.btn-close');
    this.container = this.querySelector('#container');
    this.name      = this.querySelector('#command-name');
    // this.textarea  = this.querySelector('.textarea');
    this.submit    = this.querySelector('#submit');
    this.closeBtn.addEventListener('click', () => {
      this.close();
    })
    this.submit.addEventListener('click', () => {
      if (!this.textarea.value && !this.name.value) return;
      console.log(this.textarea.value, this.name.value);
      this.addSound({
        name: this.name.value.toLowerCase(),
        path: this.textarea.value
      })
      .then(() => {
        console.log('saved');
        this.name.value = '';
      })
      .catch((err) => {
        console.error(err);
      });
    });
  }

  close() {
    this.classList.add('d-none');
  }
  open() {
    this.classList.remove('d-none');
    this.name.focus();
  }

  isEmpty() {
    if (this._sounds.length > 0 && this.container.children.length > 0) {
      const empty = this.container.querySelector('#empty');
      if (empty) empty.querySelector('#empty').remove();
      return;
    }
    this.container.innerHTML = emptyList({ message: 'Список звуков пуст' });
  }

  getAllSounds() {
    return Http.get('/api/user/sounds').then((sounds) => {
      /*
        Add rules to stack
      */
      sounds.forEach((sound) => {
        this.addSoundToListView(sound);
      });
      this.isEmpty();
    }).catch((err) => {
      /*
      Show error alert
      */
      console.error(err);
    });
  }

  addSound(soundRaw) {
    return Http.post('/api/user/update-sounds',
      {
        sounds: [...this.getSoundsRaw(), soundRaw]
      }, {
        'Content-Type': 'application/json'
      })
      .then(() => {
        this.addSoundToListView(soundRaw);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  addSoundToListView(soundRaw) {
    const sound = new SoundComponent(soundRaw.command);
    this._sounds.push(sound);
    this.container.append(sound);
    this.isEmpty();
    sound.addEventListener('save', (event) => {
      console.log(event);
      this.saveCommands().then(() => {
        console.log('saved');
      });
    });
    sound.addEventListener('delete', (event) => {
      this._sounds.splice(this._sounds.indexOf(event.target.value), 1);
      this.saveCommands().then(() => {
        console.log('deleted');
        this.isEmpty();
      });
    });
  }

  saveCommands() {
    return Http.post('/api/user/update-sound',
      {
        commands: this.getSoundsRaw()
      }, {
        'Content-Type': 'application/json'
      })
      .catch((err) => {
        console.error(err);
      });
  }

  getSoundsRaw() {
    return this._sounds.map(sound => sound.value);
  }
}
