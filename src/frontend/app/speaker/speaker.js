export class Player {
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
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    const gainValueIndicator = document.querySelector('#gain_value');

    this.playerRanger = document.querySelector('#gain');
    this.playerRanger.value = this.gainNode.gain.value*100;
    gainValueIndicator.innerHTML = this.playerRanger.value;
    this.playerRanger.addEventListener('input', () => {
      this.gainNode.gain.value = this.playerRanger.value/100;
      gainValueIndicator.innerHTML = this.playerRanger.value;
      window.localStorage.setItem('gain', this.gainNode.gain.value);
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
}
