import './speaker.css';
import { io } from 'socket.io-client';
import Cookies from '@shared/cookies';

class Player {
  constructor() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    this.source = this.ctx.createBufferSource();
    this.gainNode = this.ctx.createGain();
    this.source.addEventListener('ended', () => {
      this.source.stop();
      this.source = null;
      this.source = this.ctx.createBufferSource();
    });
    this.gainNode.gain.value = window.localStorage.getItem('gain');

    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = window.localStorage.getItem('threshold');
    this.compressor.knee.value = window.localStorage.getItem('knee');
    this.compressor.ratio.value = window.localStorage.getItem('ratio');
    this.compressor.attack.value = window.localStorage.getItem('attack');
    this.compressor.release.value = window.localStorage.getItem('release');

    if (window.localStorage.getItem('compressor') === 'true') {
      this.source.connect(this.compressor);
      this.compressor.connect(this.gainNode);
    } else {
      this.source.connect(this.gainNode);
    }
    this.gainNode.connect(this.ctx.destination);

    this.playerRanger = document.querySelector('#gain');
    this.playerRanger.value = this.gainNode.gain.value*100;
    document.querySelector('#gain_value').innerHTML = this.playerRanger.value;
    this.playerRanger.addEventListener('input', () => {
      this.gainNode.gain.value = this.playerRanger.value/100;
      document.querySelector('#gain_value').innerHTML = this.playerRanger.value;
      window.localStorage.setItem('gain', this.gainNode.gain.value);
    });
    this.addListeners();
  }
  set vol(volume) {
    this.audio.volume = volume;
  }
  addListeners() {
    const compressorSwitch = document.querySelector('#compressor');
    compressorSwitch.checked = window.localStorage.getItem('compressor') === 'true';
    const knee = document.querySelector('#knee');
    const ratio = document.querySelector('#ratio');
    const attack = document.querySelector('#attack');
    const release = document.querySelector('#release');
    const threshold = document.querySelector('#threshold');
    [knee, ratio, attack, release, threshold].forEach((input) => {
      input.value = window.localStorage.getItem(input.name);
      input.disabled = !compressorSwitch.checked;
      input.addEventListener('input', (event) => {
          this.compressor[input.name].value = input.value;
        window.localStorage.setItem(input.name, input.value);
      });
    })
    compressorSwitch.addEventListener('change', (event) => {
      window.localStorage.setItem('compressor', compressorSwitch.checked);
      player.switchCompressor(compressorSwitch.checked);
      this.toggleInputs(compressorSwitch.checked, [knee, ratio, attack, release, threshold]);
    });
  }
  toggleInputs(value, inputs) {
    inputs.forEach((input) => {
      input.disabled = !value;
    });
  }
  play (sound) {
    this.source = null;
    this.source = this.ctx.createBufferSource();
    sound.gain = sound.gain ?? this.gainNode.gain.value*100;
    if (sound.gain === 0) sound.gain = this.gainNode.gain.value*100;
    this.gainNode.gain.value = sound.gain/100;
    new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.open('GET', sound.path, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        this.ctx.decodeAudioData(request.response,
          (buffer) => {
            this.source.buffer = buffer;
            this.source.loop = false;
            resolve();
          },
          (e) => {
            reject(e);
          });
        }
        request.send();
    }).then(() => {
      this.source.connect(this.gainNode);
      this.source.start(0);
    }).catch((e) => {
        console.log("Error with decoding audio data" + e.err);
    })
	}
  switchCompressor(value) {
    if (!value) {
      this.source.disconnect(0);
      this.source.connect(this.gainNode)
			this.compressor.disconnect(0);
		} else {
      this.source.disconnect(0);
      this.source.connect(this.compressor);
      this.compressor.connect(this.gainNode);
		}
  }
}

let player;
const accept = document.querySelector('#accept');
accept.addEventListener('click', (event) => {
  player = new Player();
  event.target.style.display = 'none';
});

const indicator = document.querySelector('#indicator');

const socket = io(`wss://${window.location.host}`, {
  reconnectionDelayMax: 10000,
  auth: {
    token: Cookies.get('nmnd_user_access_token'),
  },
});
socket.on("connect", () => {
  console.log("Соединение установлено.");
  indicator.classList.add('bg-green');
  socket.on("play-sound", (sound) => {
    if (player) player.play(sound);
  });
  socket.on('close', () => {
    indicator.classList.add('bg-red');
  });
});
