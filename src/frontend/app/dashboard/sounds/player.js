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
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
  }
  set vol(volume) {
    this.audio.volume = volume;
  }
  play (sound) {
    this.source = null;
    this.source = this.ctx.createBufferSource();
    if (!sound.gain) sound.gain = 1;
    if (sound.gain > 100) sound.gain = 100;
    if (sound.gain < 0) sound.gain = 0;
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
      };
      request.send();
    }).then(() => {
      this.source.connect(this.gainNode);
      this.source.start(0);
    }).catch((e) => {
      console.log("Error with decoding audio data" + e.err);
    })
	}
}
