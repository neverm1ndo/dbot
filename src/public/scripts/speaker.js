let ws;
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

    this.source.connect(this.gainNode);
    if (window.localStorage.getItem('compressor') === 'true') {
      this.compressor.connect(this.gainNode);
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
  play (path) {
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
            console.log("Error with decoding audio data" + e.err);
            reject();
          });
        }
        request.send();
    }).then(() => {
      this.source.connect(this.compressor);
      this.source.start(0);
    })
	}
  switchCompressor(value) {
    if (!value) {
			this.compressor.disconnect(0);
		} else {
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

(function setConnection() {
  console.log(window.location.host);
  ws = new WebSocket(`wss://${window.location.host}`);
  ws.onopen = function() {
    console.log("Соединение установлено.");
    ws.send(JSON.stringify({event: 'speaker-connection'}));
    indicator.classList.remove('bg-red');
    indicator.classList.add('bg-green');
  };

  ws.onclose = function(event) {
    if (event.wasClean) {
      console.log('Соединение закрыто чисто');
    } else {
      console.log('Обрыв соединения');
      indicator.classList.remove('bg-green');
      indicator.classList.add('bg-red');
      setTimeout(()=> {
        setConnection();
      }, 5000)
    }
    console.log('Code: ' + event.code + '\n Reason: ' + event.reason);
  };

  ws.onmessage = (event) => {
    let depeche = JSON.parse(event.data);
    console.log(depeche);
    switch (depeche.event) {
      case 'play-sound':
        if (!player) break;
        player.play(depeche.msg);
      break;
      case 'connection':
        console.log(depeche.msg);
      break;
      default:
    }
  }

  ws.onerror = function(error) {
    console.log("Ошибка " + error.message);
  };
})();
