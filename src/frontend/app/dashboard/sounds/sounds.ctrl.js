import Http from '@shared/http';
import { Popout } from '../popout';
import template from 'pug-loader!./sounds.tpl.pug';
import emptyList from 'pug-loader!../commands/empty-commands-list.tpl.pug';
import { SoundComponent } from './sound';
import { Player } from './player';

export class SoundsController extends Popout {
  _sounds = [];
  constructor() {
    super();
    this.getAllSounds();
    this.innerHTML = template();
    this.closeBtn  = this.querySelector('.btn-close');
    this.container = this.querySelector('#container');
    this.name      = this.querySelector('#command-name');
    this.submit    = this.querySelector('#submit');
    this.player = new Player();
    this.closeBtn.addEventListener('click', () => {
      this.close();
    });
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

  isEmpty() {
    if (this._sounds.length > 0) {
      const empty = this.container.querySelector('#empty');
      if (empty) empty.remove();
      return;
    }
    this.container.innerHTML = emptyList({ message: 'Список звуков пуст' });
  }

  getAllSounds() {
    return Http.get('/api/user/sounds').then((sounds) => {
      sounds.forEach((sound) => {
        this.addSoundToListView(sound);
      });
      this.isEmpty();
    }).catch((err) => {
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
    const sound = new SoundComponent(soundRaw);
    this._sounds.push(sound);
    this.container.append(sound);
    this.isEmpty();
    sound.addEventListener('save', (event) => {
      this.saveSounds().then(() => {
        console.log('saved');
      });
    });
    sound.addEventListener('play', (event) => {
      console.log(event)
      this.player.play(event.target.value);
    });
    sound.addEventListener('delete', (event) => {
      this._sounds.splice(this._sounds.indexOf(event.target.value), 1);
      this.saveCommands().then(() => {
        console.log('deleted');
        this.isEmpty();
      });
    });
  }

  saveSounds() {
    return Http.post('/api/user/update-sounds',
      {
        sounds: this.getSoundsRaw()
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
