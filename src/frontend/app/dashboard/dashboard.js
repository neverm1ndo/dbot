import 'bootstrap/dist/css/bootstrap.min.css';
import './dashboard.css';
import Http from '@shared/http';
/* eslint max-classes-per-file: ["error", 10] */
let ws;
const userId = document.querySelector('#user').dataset.id;

class Alert {
  constructor() {
    this.box = document.querySelector('.alert');
  }

  success(message) {
    this.box.innerHTML = message;
    this.box.classList.add('alert-success');
    this.box.style.display = 'block';
    setTimeout(() => {
      this.box.classList.remove('alert-success');
      this.closeAlert();
    }, 2000);
  }

  error(message) {
    this.box.innerHTML = `<span>Произошла ошибка: ${message}</span>`;
    this.box.style.display = 'block';
    this.box.classList.add('alert-danger');
    setTimeout(() => {
      this.box.classList.remove('alert-danger');
      this.closeAlert();
    }, 2000);
  }

  warn(message) {
    this.box.innerHTML = `<span>Обрыв соединения: ${message}</span>`;
    this.box.style.display = 'block';
    this.box.classList.add('alert-warning');
  }

  closeAlert() {
    this.box.style.display = 'none';
  }
}

const alert = new Alert();

(function setConnection() {
  ws = new WebSocket(`wss://${window.location.host}`);
  ws.onopen = () => {
    alert.closeAlert();
    alert.success('Соединение установлено');
    ws.send(JSON.stringify({ event: 'dashboard-connection' }));
  };

  ws.onclose = (event) => {
    if (event.wasClean) {
      console.log('Соединение закрыто чисто');
    } else {
      console.log('Обрыв соединения');
      alert.warn(`Код: ${event.code}`);
      setTimeout(() => {
        setConnection();
      }, 5000);
    }
    console.log(`Code: ${event.code}\n Reason: ${event.reason}`);
  };

  ws.onmessage = (event) => {
    const depeche = JSON.parse(event.data);
    console.log(depeche);
    switch (depeche.event) {
      case 'save-success':
        alert.success('Настройки успешно применены');
        break;
      case 'save-fail':
        alert.error(`Ошибка: ${depeche.message}`);
        break;
      case 'bot-status':
        botStatus.setStatus = depeche.message;
        break;
      default:
    }
  };

  ws.onerror = (error) => {
    alert.error(error);
    console.log(`Ошибка ${error.message}`);
  };
}());

// (async function getSettings() {
//   this.res = await fetch(`/api/user?id=${userId}`)
//     if (this.res.ok) {
//     this.conf = await res.json();
//     console.log(this.conf);
//   } else {
//     alert.error(`Ошибка HTTP: ${this.res.status}`);
//   }
// })();
Http.get(`/api/user?id=${userId}`)
    .then((data) => {
        document.querySelector('#automessages').value = JSON.stringify(data.settings.automessages);
        document.querySelector('#sounds').value = JSON.stringify(data.settings.sounds);
        document.querySelector('#banwords').value = JSON.stringify(data.settings.banwords);
    })
    .catch((err) => {
      alert.error(`Ошибка HTTP: ${err.status}`);
    })
async function saveSettings() {
  const body = {
    id: userId,
    settings: {
      automessages: JSON.parse(document.querySelector('#automessages').value.toString()),
      sounds: JSON.parse(document.querySelector('#sounds').value.toString()),
      banwords: JSON.parse(document.querySelector('#banwords').value.toString())
    }
  };
  const headers = {
    'Content-Type': 'application/json'
  };
  Http.post('/api/user/update-settings', body, headers)
      .then(() => {
        alert.success('Настройки сохранены');
      })
};
document.querySelector('.save').addEventListener('click', () => {
  saveSettings();
})
