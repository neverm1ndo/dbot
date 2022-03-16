import template from 'pug-loader!./chat.tpl.pug';
import styles from './chat.scss';
import tmi from 'tmi.js';
import Http from '@shared/http';
import TTVClip from './ttv.clips.embed';
import Collapse from 'bootstrap/js/dist/collapse';
import Tooltip from 'bootstrap/js/dist/tooltip';
import PubSub from './pubsub';
import BTTV from './bttv';
import { User } from './chat.user';
import { ChatMessage } from './chat.message';
import { ChatAlert } from './chat.alert';
import { Marker } from './marker';
import { ChattersListController } from './chatter-list.controller';
import { secondsToTimestamp, timestamp } from './utils';

export class ChatComponent extends HTMLElement {
  stream;
  live = false;
  connected = false;
  selfEmotes = {};
  constructor() {
    super();
    this.user = new User();
    this.settings = {
      badges: [],
      lurkers: [],
      sets: new Set(),
      id: this.user.id,
    };
    this.innerHTML = template({ user: {
        profile_image_url: this.user.profile_image_url
    }});
    this.pubsub = new PubSub(this);
    this.chatterList = new ChattersListController(this);
    this.ws = new WebSocket(`wss://${window.location.host}`);
    const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/player_api';
    document.body.append(tag);
    this.chat          = this.querySelector('#chat-box');
    this.text          = this.querySelector('#text');
    this.text.disabled = true;
    this.submit        = this.querySelector('#send');
    this.emotes        = this.querySelector("#emotes-list");
    this.quickpanel    = this.querySelector("#broadcaster-quickpanel")
    this.marker        = this.querySelector(".marker");
    this.marker.disabled = true;
    this.channel = this.getChannelName();
                   this.getChannelProperties(this.channel);
    this.client = new tmi.Client({
       options: {
         debug: true,
         messagesLogLevel: "info",
         clientId: this.user.client,
         skipUpdatingEmotesets: true
       },
       connection: { reconnect: true, secure: true },
       identity: {
         username: this.user.username,
         password: 'oauth:' + this.user.token
       },
       channels: [this.channel]
    });
    this.bttv = new BTTV();
    this.bttv.getEmotes(this.channel, this.emotes);
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
    this.getLurkersFromStorage();
    this.connectTmiClient();
    this.setUserBagde();
  }
  setUserBagde() {
    const label = this.querySelector('.chatty-label');
    const img = new Image();
    img.src = '/assets/cm.png';
    if (this.user.login !== this.channel) img.src = '/assets/bc.png';
    label.append(img);
  }
  connectTmiClient() {
    const CDC_VIEWER_LIM = 35;
    let trigger = 0;
    this.client.connect();
    this.client.on('connected', (channel, self) => {
      this.alert('Добро пожаловать в чат!');
      this.connected = true;
      this.submit.disabled = false;
      this.text.disabled = false;
    });
    this.client.on('disconnected', (channel, self) => {
      this.alert('Вы отсоединенны от чата', 'siren');
      this.connected = false;
      this.submit.disabled = true;
      this.text.disabled = true;
    });
    this.client.on('join', (channel, username, self) => {
      if (self || this.chatterList.connected.includes(username) || this.settings.lurkers.includes(username)) return;
      this.chatterList.add(username);
      if (this.stream) {
        if (this.stream.viewer_count <= CDC_VIEWER_LIM) {
          this.alert(`<b>${username}</b> подключился`, 'connect', username);
        }
      }
    });
    this.client.on('ban', (channel, username, reason, userstate) => {
      // Replaced with PubSub event handler
      this.pseudoDelete(username);
    });
    this.client.on('timeout', (channel, username, reason, duration, userstate) => {
      this.alert(`<b>${username}</b> отстранен на ${duration} секунд ${reason?'по причине ' + reason:''}`, 'warning', '', ['bi', 'bi-clock']);
      this.pseudoDelete(username);
    });
    this.client.on('part', (channel, username, self) => {
      if (self || this.settings.lurkers.includes(username)) return;
      setTimeout(() => {
        if (this.chatterList.connected.includes(username)) {
          this.chatterList.remove(username);
          if (this.stream) {
            if (this.stream.viewer_count <= CDC_VIEWER_LIM) {
              this.alert(`<b>${username}</b> отключился`, 'disconnect', username);
            }
          }
        }
      }, 180000);
    });
    this.client.on('chat', (channel, tags, message, self) => {
      if (self) {
        tags.emotes = this.selfEmotes;
        this.add(tags, message, self);
        return;
      }
      this.add(tags, message, self);
    });
    this.client.on('subscription', (channel, username, methods, message, userstate) => {
      this.alert(`<b>${username}</b> оформил подписку<br><small>${message}</small>`, 'twitch', '', ['bi', 'bi-twitch']);
    });
    this.client.on('notice', (channel, msgid, message) => {
      this.alert(`<small>${message}</small>`);
    });
    this.client.on('vips', (channel, vips) => {
      vips = vips.join('</br>');
      this.alert(`<small>${vips.length > 0?vips:'Список VIP пуст'}</small>`);
    });
    this.client.on('mods', (channel, mods) => {
      mods = mods.join('</br>');
      this.alert(`<small>${mods.length > 0?mods:'Список модераторов пуст'}</small>`);
    });
    this.client.on('resub', (channel, username, methods, message, userstate) => {
      this.alert(`<b>${username}</b> переоформил подписку<br><small>${message}</small>`, 'twitch', '', ['bi', 'bi-twitch']);
    });
    this.client.on('subgift', (channel, username, streakMonths, recepient, methods, userstate) => {
      this.alert(`<b>${username}</b> подарил подписку <u>${recepient}</u>`, 'twitch', '', ['bi', 'bi-gift-fill']);
    });
    this.client.on('raided', (channel, username, viewers) => {
      this.alert(`<b>${username}</b> зарейдил канал на <b>${viewers}</b> зрителей`, 'twitch', '', ['bi', 'bi-twitch']);
    });
    this.client.on('hosted', (channel, username, viewers, autohost) => {
      this.alert(`<b>${username}</b> захостил канал на <b>${viewers}</b> зрителей`, 'twitch', '', ['bi', 'bi-twitch']);
    });
    this.client.on('whisper', (channel, tags, message, self) => {
      this.add(tags, message, self);
    });
    this.client.on('clearchat', (channel) => {
      this.alert('Чат был очищен');
    });
    this.client.on('cheer', (channel, userstate, message) => {
      this.alert(`<b>${username}</b> поддержал канал на <b>${userstate.bits}</b> Cheers`, 'info');
    });
    this.client.on('emotesets', (sets, obj) => {
      trigger++;
      if (trigger != 1) this.getEmoteSet(sets.split(','));
    });
  }
  getLurkersFromStorage() {
    const storage = window.localStorage.getItem('lurkers');
    if (!storage) return;
    const lurkers = JSON.parse(storage);
    this.settings.lurkers = [...new Set(...[lurkers, this.settings.lurkers])];
    lurkers.forEach((lurker, index, arr) => {
      if (Array.isArray(lurker)) this.settings.lurkers.splice(index, 1);
    });
    window.localStorage.setItem('lurkers', JSON.stringify(this.settings.lurkers));
  }
  getChannelName() {
    const params = new URLSearchParams(window.location.search);
    return params.has('channel')?params.get('channel'):this.user.username;
  }
  getEmoteSet(id) {
    Http.get(`https://api.twitch.tv/helix/chat/emotes/set?emote_set_id=${id.join('&emote_set_id=')}`,
      {
        'Authorization': 'Bearer ' + this.user.token,
        'Client-ID': this.user.client
      }).then(data => { if (data.data.length > 0) this.addEmotes(data.data) })
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
        const subcont   = document.createElement('div');
        const title     = document.createElement('b');
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
        if (ownersInfo.data[i].display_name.toLowerCase() == this.user.display_name) {
          if (this.quickpanel.children.length < 1) {
            // setTimeout(() => { // Quickpanel task
              queueMicrotask(this.quickpanel.append(container));
            // }, 0);
          }
        } else {
          this.emotes.append(container, document.createElement('hr'));
        }
      }
    }).catch((err) => console.log(err))
  }
  add(tags, message, self, date = Date.now()) {
    const messageComponent = new ChatMessage(this.channel, this.user.display_name, tags, message, self, date, this);
          messageComponent.nickname.addEventListener('click', () => {
            this.text.value = this.text.value + ' @' + tags.username + ' ';
            this.text.focus();
          });
    this.chat.append(messageComponent);
    this.autoscroll();
  }
  alert(message, type, username, icon) {
    const prevLast = this.chat.children[this.chat.children.length - 2];
    if (this.chat.lastChild instanceof ChatAlert && prevLast instanceof ChatAlert) {
      if ((prevLast.type == 'connect') && (this.chat.lastChild == 'disconnect') && (prevLast.username == this.chat.lastChild.username)) {
        prevLast.remove();
        this.chat.lastChild.remove();
      }
    }
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
      if (wrap.children.length + 1 >= 1) {
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
      const child = childs[i];
      if (child.className !== 'card') continue;
      if (child.tags.username !== username) continue;
      child.body.classList.add('text-decoration-line-through', 'pseudo-delete');
    }
  }
  send(message = '') {
    if (!this.text.value && !message) return;
    this.client.say(this.channel, message || this.text.value);
    this.text.value = '';
    this.selfEmotes = {};
  }
  setLive(live) {
    this.live = live;
    this.marker.disabled = !live;
  }
  setWsConnection() {
    this.ws.onopen = function() {
      console.log(`Соединение c ${window.location.host} установлено`);
      this.send(JSON.stringify({event: 'chat-connection'}));
    };

    this.ws.onclose = (event) => {
      if (event.wasClean) {
        console.log('Соединение закрыто чисто');
      } else {
        console.log('Обрыв соединения');
        setTimeout(()=> {
          this.setWsConnection();
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
        case 'channel.follow': {
          this.alert(`Новый фолловер <b>${depeche.msg.user_name}</b>`, 'twitch', '', ['bi', 'bi-twitch']);
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
  addLurker(username) {
    this.settings.lurkers.push(username);
    window.localStorage.setItem('lurkers', JSON.stringify([...new Set(this.settings.lurkers)]));
  }
  handleStreamInfo(id) {
    let interval = setInterval(() => {
      if (this.live) {
        Http.get(`https://api.twitch.tv/helix/streams?user_id=${id}`, {
          'Authorization': 'Bearer ' + this.user.token,
          'Client-ID': this.user.client
        }).then((data) => {
          const streamInfo = data.data[0];
          if (streamInfo) {
            this.stream = streamInfo;
            this.chatterList.dom.counter.innerHTML = streamInfo.viewer_count;
          } else {
            this.chatterList.dom.counter.innerHTML = 0;
          }
        })
      }
    }, 120000);
  }
  getChannelProperties (channel) {
    Http.get(`https://api.twitch.tv/helix/users?login=${channel}`, {
      'Authorization': 'Bearer ' + this.user.token,
      'Client-ID': this.user.client
    }).then((data) => {
      this.user.twitch = data[0];
      this.settings.id = data.data[0].id;
      this.pubsub.connect(this.settings.id);
      this.handleStreamInfo(this.settings.id);
      return Promise.all([
        Http.get(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${this.settings.id}`, {
          'Authorization': 'Bearer ' + this.user.token,
          'Client-ID': this.user.client
        }),
        Http.get(`https://api.twitch.tv/helix/chat/badges/global`, {
          'Authorization': 'Bearer ' + this.user.token,
          'Client-ID': this.user.client
        }),
        Http.get(`/controls/chat/last?channel=${channel}`),
      ])
    }).then(([badges, global, lastMessages]) => {
      this.settings.badges = [...badges.data, ...global.data];
      lastMessages.forEach((message) => {
        this.add(message.tags, message.message, message.self, message.date);
      });
    }).catch((err) => console.error(err));
  }
}