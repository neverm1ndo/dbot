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
    this.source.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
  }
  set vol(volume) {
    this.audio.volume = volume;
  }
  play (path, gain) {
    this.source = null;
    this.source = this.ctx.createBufferSource();
    if (gain > 100) gain = 100;
    if (gain < 0) gain = 0;
    this.vol = gain;
    new Promise((resolve, reject) => {
      var request = new XMLHttpRequest();
      request.open('GET', path, true);
      request.responseType = 'arraybuffer';
      request.onload = () => {
        console.log(request.response)
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
