import Http from '@shared/http';
import { User } from './chat.user';
import { ChatMessage } from './chat.message';
import { ChatAlert } from './chat.alert';
import { Marker } from './marker';
import { secondsToTimestamp, timestamp } from './utils';
import { bttv, chatterList, params, client } from './chat';
import TTVClip from './ttv.clips.embed';
import Collapse from 'bootstrap/js/dist/collapse';
import Tooltip from 'bootstrap/js/dist/tooltip';

/**
* В целом код читается очень тяжело. Особенно вермишель из нагромождений запросов к DOM в конструкторах классов;
*/

export class ChatController {
  constructor(selector) {
    this.chat = document.querySelector(selector);
    this.user = new User();
    this.live = false;
    this.indicator = document.querySelector('.logo');
    this.stream;
    this.ws = new WebSocket(`wss://${window.location.host}`);
    this.settings = {
      badges: [],
      lurkers: [],
      sets: new Set(),
      id: this.user.id,
    };
    this.connected = false;
    this.selfEmotes = {};
    this.text = document.querySelector('#text');
    this.text.disabled = true;
    this.submit = document.querySelector('#send');
    this.emotes = document.querySelector("#emotes-list");
    this.quickpanel = document.querySelector("#broadcaster-quickpanel")
    this.marker = document.querySelector(".marker");
    this.marker.disabled = true;
    this.marker.addEventListener('click', () => {
      if (this.connected) {
        Marker.create(this.user).then((res) => {
          this.alert(`Установлен маркер на позиции ${secondsToTimestamp(res.data[0].position_seconds)} ${res.data[0].description?'с описанием ' + res.data[0].description:''}`, 'twitch', '', ['bi', 'bi-vr']);
        }).catch((err) => {
          this.alert(`Не удалось создать маркер`, 'warning', '', ['bi', 'bi-exclamation-diamond-fill'])
        })
      }
    });
    this.submit.addEventListener('click', () => {
      if (this.connected) this.send();
    });
    this.text.addEventListener('keydown', (event) => {
      if (event.code === 'Enter') this.send();
    });
    this.text.addEventListener('input', (event) => {
      if (this.text.value === '') {
        this.selfEmotes = {};
      }
    });
    const quickpanel = new Collapse(this.quickpanel, {
      toggle: false
    });
    [this.emotes, this.quickpanel].map(panel => panel.addEventListener('click', (event) => {
      if (event.target.tagName !== 'IMG') return;
      if (typeof this.selfEmotes[event.target.dataset.id] !== 'object') {
        this.selfEmotes[event.target.dataset.id] = [];
      }
      this.selfEmotes[event.target.dataset.id].push(`${this.text.value.length}-${this.text.value.length + event.target.dataset.name.length}`);
      this.text.value = this.text.value + ' ' + event.target.dataset.name + ' ';
    }));
    this.text.addEventListener('focus', () => {
      quickpanel.show();
    })
    this.quickpanel.addEventListener('mouseleave', () => {
      quickpanel.hide();
    })
    this.setWsConnection();
  }
  getEmoteSet(id) {
    Http.get(
      `https://api.twitch.tv/helix/chat/emotes/set?emote_set_id=${id.join('&emote_set_id=')}`,
      {
        'Authorization': 'Bearer ' + this.user.token,
        'Client-ID': this.user.client
      }
    )
    .then(data => {
        if (data.data.length > 0) {
          this.addEmotes(data.data);
        }
      })
    .catch(err => console.error);
  }
  addEmotes(emotes) {
    const owners = {};
    let streamers = new Set();
    for (let i = 0; i < emotes.length; i++) {
      if (emotes[i].owner_id !== 'twitch' && emotes[i].owner_id !== '0') streamers.add(emotes[i].owner_id);
      if (!owners[emotes[i].owner_id]) owners[emotes[i].owner_id] = [];
      owners[emotes[i].owner_id].push(emotes[i]);
    }
    Http.get(`https://api.twitch.tv/helix/users?id=${[...streamers].join('&id=')}`, {
      'Authorization': 'Bearer ' + this.user.token,
      'Client-ID': this.user.client
    }).then((ownersInfo) => {
      ownersInfo.data.push({
        id: '0',
        display_name: 'Whole World'
      })
      for (let i = 0; i < ownersInfo.data.length; i++) {
        const container = document.createElement('div');
        const subcont = document.createElement('div');
        const title = document.createElement('b');
        let avatar;
        if (ownersInfo.data[i].profile_image_url) {
          avatar = new Image(20, 20);
          avatar.classList.add('avatar');
          avatar.src = ownersInfo.data[i].profile_image_url;
        }
        title.innerHTML = ownersInfo.data[i].display_name;
        for (let j = 0; j < owners[ownersInfo.data[i].id].length; j++) {
          const img = document.createElement('img');
          img.title = owners[ownersInfo.data[i].id][j].name;
          img.classList.add('emote');
          img.setAttribute('data-bs-toggle', 'tooltip');
          img.setAttribute('data-bs-placement', 'top');
          img.src = `https://static-cdn.jtvnw.net/emoticons/v2/${owners[ownersInfo.data[i].id][j].id}/default/light/3.0`;
          img.dataset.name = owners[ownersInfo.data[i].id][j].name;
          img.dataset.id = owners[ownersInfo.data[i].id][j].id;
          new Tooltip(img, {
            boundary: this.emotes.parentNode
          });
          container.append(title, avatar?avatar:'', subcont);
          subcont.append(img);
        }
        if (ownersInfo.data[i].display_name.toLowerCase() == (params.has('channel')?params.get('channel'):this.user.username)) {
          if (this.quickpanel.children.length < 1) {
            setTimeout(() => { // Quickpanel task
              this.quickpanel.append(container);
            }, 0);
          }
        } else {
          this.emotes.append(container, document.createElement('hr'));
        }
      }
    }).catch((err) => console.log(err))
  }
  add(tags, message, self, date = Date.now()) {
    this.chat.append(new ChatMessage(tags, message, self, date));
    this.autoscroll();
  }
  alert(message, type, username, icon) {
    if (this.chat.lastChild instanceof ChatAlert && this.chat.lastChild.type === type) {
      const last = this.chat.lastChild;
      let wrap;
      let btn;
      let badge;
      if (last.children.length > 2) {
        wrap = last.lastChild;
        badge = last.getElementsByTagName('a')[0];
      } else {
        badge = document.createElement('a');
        badge.classList.add('ml-15', 'pull-right', 'badge', 'rounded-pill', 'bg-light', 'text-dark');
        last.append(badge);
        wrap = document.createElement('div');
        wrap.classList.add('list-group', 'list-group-flush');
        badge.setAttribute('data-bs-toggle', 'collapse');
        last.setAttribute('role', 'button')
        badge.setAttribute('aria-expanded', true)
        wrap.id = String(message + Date.now()).hashCode();
        badge.setAttribute('aria-controls', wrap.id);
        badge.setAttribute('data-bs-toggle', '#' + wrap.id);
        let collapse = new Collapse(wrap, {
          toggle: true
        });
        last.append(wrap);
        last.addEventListener('click', () => {
          collapse.toggle();
        })
      }
      if (wrap.children.length + 1 >= 3) {
        setTimeout(() => {
          Collapse.getInstance(wrap).hide();
        }, 10);
      }
      badge.innerText = `+ ${wrap.children.length + 1}`
      let alert = new ChatAlert(message, type, username);
      alert.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info')
      alert.classList.add('list-group-item');
      wrap.append(alert);
    } else {
      this.chat.append(new ChatAlert(message, type, username, icon));
    }
    setTimeout(() => {
      this.autoscroll();
    }, 10);
  }
  autoscroll () {
    this.chat.parentElement.scrollTo({
      top: this.chat.parentElement.scrollHeight + 300,
      behavior: 'smooth'
    });
  }
  pseudoDelete(username) {
    const childs = this.chat.childNodes;
    for (let i = 0; i < childs.length; i += 1) {
      if (childs[i].className === 'card') {
        if (childs[i].tags.username === username) {
          childs[i].body.classList.add('text-decoration-line-through', 'pseudo-delete');
        }
      }
    }
  }
  send(message = '') {
    if (!this.text.value && !message) return;
    client.say(params.has('channel')?params.get('channel'):this.user.username, message || this.text.value);
    this.text.value = '';
    this.selfEmotes = {};
  }
  setLive(live) {
    this.live = live;
    this.marker.disabled = !live;
  }
  setWsConnection() {
    this.ws.onopen = function() {
      console.log("Соединение установлено.");
      this.send(JSON.stringify({event: 'chat-connection'}));
    };

    this.ws.onclose = function(event) {
      if (event.wasClean) {
        console.log('Соединение закрыто чисто');
      } else {
        console.log('Обрыв соединения');
        setTimeout(()=> {
          setConnection();
        }, 5000)
      }
      console.log('Code: ' + event.code + '\n Reason: ' + event.reason);
    };

    this.ws.onmessage = (event) => {
      let depeche = JSON.parse(event.data);
      console.log(depeche);
      switch (depeche.event) {
        case 'bot-status':
          this.setLive(depeche.msg == 'works');
        break;
        case 'stream.online': {
          this.setLive(true);
          this.alert(`Стрим запущен. Время запуска ${timestamp(Date.now())}`, 'success', '', ['bi', 'bi-twitch']);
          break;
        }
        case 'stream.offline': {
          this.setLive(false);
          this.alert(`Стрим окончен. Время трансляции ${secondsToTimestamp(Date.now() - new Date(this.stream.started_at))}`, 'success', '', ['bi', 'bi-twitch']);
          break;
        }
        default: break;
      }
    }

    this.ws.onerror = function(error) {
      console.log("Ошибка " + error.message);
    };
  }
}
