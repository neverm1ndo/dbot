import template from 'pug-loader!./chat.tpl.pug';
import styles from './chat.scss';

import Collapse from 'bootstrap/js/dist/collapse';
import { socketService, pubsubService, twitchApiService, omdApiService, bttv, client } from '@chat/chat';
import { ChatMessage } from '@chat/message/chat.message';
import { ChatAlert } from '@chat/alert/chat.alert';
import { ChatReward } from '@chat/reward/reward.component';
import { secondsToTimestamp, timestamp } from '@chat/utils';

import { interval, throwError, from, fromEvent } from 'rxjs';
import { takeWhile, switchMap, catchError, filter } from 'rxjs/operators';

export class ChatComponent extends HTMLElement {

  stream;
  live = false;
  connected = false;
  selfEmotes = {};

  constructor() {
    super();
    this.settings = {
      badges: [],
      lurkers: [],
      sets: new Set(),
      id: twitchApiService.user.id,
    };
    this.innerHTML = template({ user: {
        profile_image_url: twitchApiService.user.profile_image_url
    }});
    this.#setSocketConnection();
    
    const tag = document.createElement('script');
          tag.src = 'https://www.youtube.com/player_api';
    document.body.append(tag);
    
    this.chat          = this.querySelector('#chat-box');
    this.text          = this.querySelector('#text');
    this.text.disabled = true;
    this.submit        = this.querySelector('#send');
    this.emotes        = this.querySelector("#emotes-list");
    this.emotesBtn     = this.querySelector('#emotes');
    this.quickpanel    = this.querySelector("#broadcaster-quickpanel")
    this.marker        = this.querySelector(".marker");
    this.marker.disabled = true;
    this.channel = twitchApiService.getChannelName();
    this.#getChannelProperties(this.channel);
    
    this.chatterList = this.querySelector('omd-chatters-list');
    bttv.getEmotes(this.channel, this.quickpanel);
    
    this.#subToChatEvents();
    this.#quickpanelSetup();
    this.#getLurkersFromStorage();
    this.#connectTmiClient();
    this.#setUserBagde();

    // this.#handleStreamInfo(this.settings.id);
  }

  #subToChatEvents() {
    fromEvent(this.marker, 'click').subscribe(() => this.#markerEventHandler());
    fromEvent(this.submit, 'click').pipe(filter(() => this.connected)).subscribe(() => this.send());
    fromEvent(this.text, 'keydown').pipe(filter((event) => event.code == 'Enter')).subscribe(() => this.send());
    fromEvent(this.text, 'input').pipe(filter(() => this.text.value == '')).subscribe(() => { this.selfEmotes = {}; });
  }

  #markerEventHandler() {
    if (!this.connected) return;
    twitchApiService.createMarker().then((res) => {
      this.alert(`Установлен маркер на позиции ${secondsToTimestamp(res.data[0].position_seconds)} ${res.data[0].description?'с описанием ' + res.data[0].description:''}`, 'twitch', '', ['bi', 'bi-vr']);
    }).catch((err) => {
      this.alert(`Не удалось создать маркер ${err.message}`, 'warning', '', ['bi', 'bi-exclamation-diamond-fill']);
    });
  }

  #quickpanelSetup() {
    const quickpanel = new Collapse(this.quickpanel, {
      toggle: false
    });
    this.emotesBtn.addEventListener('click', () => {
      quickpanel.toggle();
    });
    [this.quickpanel].map(panel => panel.addEventListener('click', (event) => {
      if (event.target.tagName !== 'IMG') return;
      if (typeof this.selfEmotes[event.target.dataset.id] !== 'object') {
        this.selfEmotes[event.target.dataset.id] = [];
      }
      this.selfEmotes[event.target.dataset.id].push(`${this.text.value.length}-${this.text.value.length + event.target.dataset.name.length}`);
      this.text.value = `${this.text.value} ${event.target.dataset.name}`;
    }));
  }

  #setUserBagde() {
    const label = this.querySelector('.chatty-label');
    const img = new Image();
    img.src = '/assets/cm.png';
    if (twitchApiService.user.username == this.channel) img.src = '/assets/bc.png';
    label.append(img);
  }

  #setSocketConnection() {
    socketService.onBotStatus().subscribe((status) => {
      this.setLive(status == 1);
    });
    socketService.onStreamOnline().subscribe((event) => {
      this.setLive(true);
      this.alert(`Стрим запущен. Время запуска ${timestamp(Date.now())}`, 'success', '', ['bi', 'bi-twitch']);
    });
    socketService.onStreamOffline().subscribe((event) => {
      this.setLive(false);
      this.alert(`Стрим окончен. Время трансляции ${secondsToTimestamp(Date.now() - new Date(this.stream.started_at).getTime()/1000)}`, 'success', '', ['bi', 'bi-twitch']);
    });
    socketService.onChannelFollow().subscribe((event) => {
      this.alert(`Новый фолловер <b>${event.user_name}</b>`, 'twitch', '', ['bi', 'bi-twitch']);
    });
  }

  #connectTmiClient() {
    const CDC_VIEWER_LIM = 35;
    // let trigger = 0;
    client.connect();
    client.on('connected', (_channel, _self) => {
      this.alert('Добро пожаловать в чат!');
      this.connected = true;
      this.submit.disabled = false;
      this.text.disabled = false;
    });
    client.on('disconnected', (_channel, _self) => {
      this.alert('Вы отсоединенны от чата', 'siren');
      this.connected = false;
      this.submit.disabled = true;
      this.text.disabled = true;
    });
    client.on('join', (_channel, username, self) => {
      if (self || this.chatterList.connected.includes(username) || this.settings.lurkers.includes(username)) return;
      this.chatterList.add(username);
      if (this.chatterList.connected.length <= CDC_VIEWER_LIM) {
        this.alert(`<b>${username}</b> подключился`, 'connect', username);
      }
    });
    client.on('ban', (_channel, username, _reason, _userstate) => {
      // Replaced with PubSub event handler
      this.pseudoDelete(username);
    });
    client.on('timeout', (_channel, username, reason, duration, userstate) => {
      this.alert(`<b>${username}</b> отстранен на ${duration} секунд ${reason?'по причине ' + reason:''}`, 'warning', '', ['bi', 'bi-clock']);
      this.pseudoDelete(username);
    });
    client.on('part', (channel, username, self) => {
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
    client.on('chat', (_channel, tags, message, self) => {
      if (self) {
        tags.emotes = this.selfEmotes;
        this.add(tags, message, self);
        return;
      }
      this.add(tags, message, self);
    });
    client.on('subscription', (_channel, username, _methods, message, userstate) => {
      this.alert(`<b>${username}</b> оформил подписку<br><small>${message}</small>`, 'twitch', '', ['bi', 'bi-twitch']);
    });
    client.on('notice', (_channel, _msgid, message) => {
      this.alert(`<small>${message}</small>`);
    });
    client.on('vips', (_channel, vips) => {
      vips = vips.join('</br>');
      this.alert(`<small>${vips.length > 0?vips:'Список VIP пуст'}</small>`);
    });
    client.on('mods', (_channel, mods) => {
      mods = mods.join('</br>');
      this.alert(`<small>${mods.length > 0?mods:'Список модераторов пуст'}</small>`);
    });
    client.on('resub', (_channel, username, _methods, message, _userstate) => {
      this.alert(`<b>${username}</b> переоформил подписку<br><small>${message}</small>`, 'twitch', '', ['bi', 'bi-twitch']);
    });
    client.on('subgift', (_channel, username, _streakMonths, recepient, _methods, _userstate) => {
      this.alert(`<b>${username}</b> подарил подписку <u>${recepient}</u>`, 'twitch', '', ['bi', 'bi-gift-fill']);
    });
    client.on('raided', (_channel, username, viewers) => {
      this.alert(`<b>${username}</b> зарейдил канал на <b>${viewers}</b> зрителей`, 'twitch', '', ['bi', 'bi-twitch']);
    });
    client.on('hosted', (_channel, username, viewers, autohost) => {
      this.alert(`<b>${username}</b> захостил канал на <b>${viewers}</b> зрителей`, 'twitch', '', ['bi', 'bi-twitch']);
    });
    client.on('whisper', (_channel, tags, message, self) => {
      this.add(tags, message, self);
    });
    client.on('clearchat', (_channel) => {
      this.alert('Чат был очищен');
    });
    client.on('cheer', (_channel, userstate, message) => {
      this.alert(`<b>${username}</b> поддержал канал на <b>${userstate.bits}</b> Cheers`, 'info');
    });
    client.on('emotesets', (sets, _obj) => {
      this.#getEmoteSet(sets.split(','));
    });
  }

  #getLurkersFromStorage() {
    const storage = window.localStorage.getItem('lurkers');
    if (!storage) return;
    const lurkers = JSON.parse(storage);
    this.settings.lurkers = [...new Set(...[lurkers, this.settings.lurkers])];
    lurkers.forEach((lurker, index, arr) => {
      if (Array.isArray(lurker)) this.settings.lurkers.splice(index, 1);
    });
    window.localStorage.setItem('lurkers', JSON.stringify(this.settings.lurkers));
  }

  #getEmoteSet(id) {
    twitchApiService.getEmoteSets(id)
                    .then(data => { if (data.data.length > 0) this.addEmotes(data.data) })
                    .catch(_err => console.error);
  }

  #addEmotes(emotes) {
    const owners = {};
    let streamers = new Set();
    for (let i = 0; i < emotes.length; i++) {
      if (emotes[i].owner_id !== 'twitch' && emotes[i].owner_id !== '0') streamers.add(emotes[i].owner_id);
      if (!owners[emotes[i].owner_id]) owners[emotes[i].owner_id] = [];
      owners[emotes[i].owner_id].push(emotes[i]);
    }
    twitchApiService.getUsers(streamers).then((ownersInfo) => {
      ownersInfo.data.push({
        id: '0',
        display_name: 'Whole World'
      });
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
          img.src = `https://static-cdn.jtvnw.net/emoticons/v2/${owners[ownersInfo.data[i].id][j].id}/default/light/3.0`;
          img.dataset.name = owners[ownersInfo.data[i].id][j].name;
          img.dataset.id = owners[ownersInfo.data[i].id][j].id;
          container.append(title, avatar?avatar:'', subcont);
          subcont.append(img);
        }
        this.quickpanel.append(container, document.createElement('hr'));
      }
    }).catch(_err => console.log);
  }

  /**
  * @param {number} amount - max chat lenght
  * DOM optimization
  * Removes old messages and alerts from chat container
  */
  removeOldMessages(amount) {
    if (this.chat.children.length >= amount) this.chat.children[0].remove();
  }

  /**
  * @param {number} tags - chat tmi message tags
  * @param {string} message - chat message
  * @param {boolean} self - self message
  * @param {number} date - current unix timestamp
  * Adds new message container into the chat container, then scrolls chat to the bottom
  */
  add(tags, message, self, date = Date.now()) {
    this.removeOldMessages(800);
    const messageComponent = new ChatMessage(this.channel, twitchApiService.user.display_name, tags, message, self, date, this.settings.badges);
          messageComponent.nickname.addEventListener('click', () => {
            this.text.value = this.text.value + ' @' + tags.username + ' ';
            this.text.focus();
          });
    this.chat.append(messageComponent);
    this.autoscroll();
  }

  /**
  * Adds new message container with reward used
  */
  reward(rewardData) {
    this.chat.append(new ChatReward(rewardData));
    this.autoscroll();
  }

  /**
  * @param {string} message - chat message
  * @param {string} type - alert type
  * @param {string} username - target username
  * @param {Array<string>} icon - bootstrap icon classes ['bi', 'bi-info']
  * Adds new alert container, makes a stack
  */
  alert(message, type, username, icon) {
    this.removeOldMessages(800);
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
        last.setAttribute('role', 'button')

        wrap = document.createElement('div');
        wrap.classList.add('list-group', 'list-group-flush');
        wrap.id = String(message + Date.now()).hashCode();

        badge.setAttribute('data-bs-toggle', 'collapse');
        badge.setAttribute('aria-expanded', true)
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
    client.say(this.channel, message || this.text.value);
    this.text.value = '';
    this.selfEmotes = {};
  }

  #setLive(live) {
    this.live = live;
    this.marker.disabled = !live;
  }

  addLurker(username) {
    this.settings.lurkers.push(username);
    window.localStorage.setItem('lurkers', JSON.stringify([...new Set(this.settings.lurkers)]));
  }

  #handleStreamInfo(id) {
     interval(0, 120000)
    .pipe(takeWhile(() => this.live == true))
    .pipe(switchMap(() => from(twitchApiService.getStreams(id))))
    .pipe(catchError((err) =>  {
      return throwError(err);
    }))
    .subscribe((data) => {
      const streamInfo = data.data[0];
      if (streamInfo) {
        this.stream = streamInfo;
        this.chatterList.dom.counter.innerHTML = streamInfo.viewer_count;
      } else {
        this.chatterList.dom.counter.innerHTML = 0;
      };
    }, (err) => {
      console.error(err);
    });
  };

  #getChannelProperties (channel) {
    twitchApiService.getUser(channel).then((data) => {
      twitchApiService.user.twitch = data[0];
      this.settings.id = data.data[0].id;
      pubsubService.connect(this.settings.id);
      // this.handleStreamInfo(this.settings.id);
      return Promise.all([
        twitchApiService.getChannelBadges(this.settings.id),
        twitchApiService.getGlobalBadges(),
        omdApiService.getLastMessages(this.channel),
      ])
    }).then(([badges, global, lastMessages]) => {
      this.settings.badges = [...badges.data, ...global.data];
      lastMessages.forEach((message) => {
        this.add(message.tags, message.message, message.self, message.date);
      });
    }).catch((err) => console.error(err));
  }
}
