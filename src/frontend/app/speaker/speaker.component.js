import Collapse from 'bootstrap/js/dist/collapse';
import template from 'pug-loader!./speaker.pug';
import './speaker.scss';
import { Player } from './speaker.js';
import { socketService } from '@chat/chat';

export class SpeakerComponent extends HTMLElement {
  player;
  constructor() {
    super();
    this.innerHTML = template();
    this.gainContainer = this.querySelector('.gain');
    let collapse = new Collapse(this.gainContainer, {
      toggle: false
    });
    const initButton = document.querySelector('#speaker-init');
    initButton.classList.add('bg-danger');
    initButton.addEventListener('click', () => {
      collapse.toggle();
      if (!this.player) {
        this.player = new Player();
        initButton.classList.remove('bg-danger');
      }
    });
    socketService.onSoundPlay().subscribe((sound)=> {
      if (this.player) this.player.play(sound);
    });
  }
 }
