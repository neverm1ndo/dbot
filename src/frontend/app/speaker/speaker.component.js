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
    const toggleButton = this.querySelector('#toggle-speaker');
    const muteButton = this.querySelector('#mute');
    const initButton = document.querySelector('#speaker-init');
    initButton.classList.add('bg-danger');
    toggleButton.addEventListener('click', () => {
      collapse.toggle();
    });
    muteButton.addEventListener('click', () => {
      if (!this.player.muted) {
        muteButton.classList.add('btn-danger');
        muteButton.classList.remove('btn-dark');
      } else {
        muteButton.classList.remove('btn-danger')
        muteButton.classList.add('btn-dark');
      }
      this.player.toggleMute();
    });
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
