import Http from './http';
import HEX from './hex';
import { user, bttv, channelSets, chatterList, client, params, chat } from './chat';
import Tooltip from 'bootstrap/js/dist/tooltip';
import Collapse from 'bootstrap/js/dist/collapse';

const defaultBadges = {
  'diktorbot': '/img/tank2.png',
  'broadcaster': '/img/bc.png',
  'moderator': '/img/cm.png',
  'subscriber': '/img/sub.png',
  'founder': '/img/sub.png',
  'vip': '/img/vip.png',
  'turbo': '/img/tur.png',
  'verified': '/img/vf.png',
  'prime': '/img/prime.png',
};

function timestamp (unix) {
  const  date = new Date(unix);
  let hours = date.getHours();
  let minutes = "0" + date.getMinutes();
  let seconds = "0" + date.getSeconds();
  return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
}
function haveLinks(text) {
  return text.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
}
function linkify(text) {
  var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  var replacedText = text.replace(replacePattern1, '<a href="$1">$1</a>');
  var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2">$2</a>');
  var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
  var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
  return replacedText;
}

class ChatMessageBadge extends HTMLDivElement {
  constructor(type, badges) {
    super();
    this.classList.add('badge-icon');
    this.icon = new Image(20, 20);
    this.icon.classList.add('badge-icon-img');
    for (let i = 0; i < channelSets.badges.length; i++) {
      if (type[0] === channelSets.badges[i].set_id) {
        for (let j = 0; j < channelSets.badges[i].versions.length; j++) {
          if (type[1] === channelSets.badges[i].versions[j].id) {
              this.icon.src = channelSets.badges[i].versions[j].image_url_2x;
              break;
          }
        }
        break;
      }
    }
    if (!this.icon.src) {
      const defaultBadgesKeys = Object.keys(defaultBadges);
      for (let i = 0; i < defaultBadgesKeys.length; i++ ) {
        if (type[0] === defaultBadgesKeys[i]) {
          this.icon.src = defaultBadges[defaultBadgesKeys[i]];
          break;
        }
      }
    }
    if (!this.icon.src) delete this.icon;
    if (this.icon) {
      this.append(this.icon);
    }
  }
}
class YTFrame extends HTMLDivElement {
  player;
  constructor(url) {
    super();
    this.replace(url)
  }
  replace(url) {
    const rep = document.createElement('div');
    rep.id = String(url + Date.now()).hashCode();
    this.append(rep);
    setTimeout(() => {
      new Promise((resolve) => {
        this.player = new YT.Player(rep.id, {
          videoId: YTFrame.getVideoID(url),
          height: '100%',
          width: '100%',
          playerVars: { autoplay: 0, controls: 1, fs: 0 },
          events: {
            onReady: resolve
          },
        });
      }).then((event) => {
        event.target.setVolume(15);
        chat.autoscroll();
      });
    }, 2000);
  }
  static getVideoID(url) {
    const regExp = new RegExp(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/);
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : console.warn('No YT video ID', match);
  }
}
class MessageControlButton extends HTMLButtonElement {
  constructor(type, cb) {
    super();
    this.type = 'button';
    this.classList.add('btn', type);
    this.addEventListener('click', cb);
  }
}
class ChatMessage extends HTMLDivElement {
  constructor(tags, message, self, date) {
    super();
    let splitter = ': ';
    const color = tags.color?new HEX(tags.color):new HEX('FFFFFF');
    this.body = document.createElement('div');
    this.nickname = document.createElement('span');
    this.tags = tags;
    this.nickname.classList.add('nickname');
    this.nickname.innerHTML = tags['display-name'];
    this.nickname.style.color = color < 0x505050?color.brightness(70).contrast(30).toString():color.toString();
    if (tags['message-type'] === "action") {
      this.body.style.color = this.nickname.style.color;
      splitter = '';
    };
    this.classList.add('card');
    this.body.classList.add('card-body');
    this.body.dataset.date = timestamp(date);
    this.body.innerHTML = splitter + this.pretty(tags, message);
    this.addTooltipsToEmotes();
    this.body.prepend(this.nickname);
    if (tags.badges) {
      const badges = Object.entries(tags.badges);
      if (tags.username === 'diktorbot') badges.push(['diktorbot', '1']);
      for (let i = 0; i < badges.length; i+=1) {
        this.body.prepend(new ChatMessageBadge(badges[i]));
      }
    }
    if (!self && (tags.username !== user.username)) {
      this.body.prepend(new MessageControlButton('btn-timeout', () => {
        client.timeout(params.has('channel')?params.get('channel'):user.username, tags.username, 600, 'rediska');
      }));
      this.body.prepend(new MessageControlButton('btn-control', () => {
        client.ban(params.has('channel')?params.get('channel'):user.username, tags.username);
      }));
    }
    this.append(this.body);
    if (haveLinks(message)) { // FIXME: remove unnecessary variable (links), fix condition
      const links = haveLinks(message);
      if (!YTFrame.getVideoID(links[0])) return;
      this.body.appendChild(new YTFrame(links[0]));
    }
    this.nickname.addEventListener('click', () => { // ??? Exprerimental (may cause perfomance violation)
      chat.text.value = chat.text.value + ' @' + tags.username + ' ';
      chat.text.focus();
    });
  }

  pretty(tags, message) {
    let notice = message.includes('@')?'@' + user.display_name: user.display_name;
    let splited = message.split(' ');
    let result = [];
    let position = 0;
    let emotes = [];
    let emoted = false;
    for (let emote in tags.emotes) {
      for (let i = 0; i < tags.emotes[emote].length; i++) {
        let points = tags.emotes[emote][i].split('-');
        emotes.push([emote, parseInt(points[0]), points[1] - points[0] + 1]);
      }
    }
    for (let i = 0; i < splited.length; i++) { // FIXME
      let emoted = false;
      position+= splited[i].length + 1;
      if (haveLinks(splited[i])) {
        result.push(linkify(splited[i]));
        continue;
      }
      if (splited[i].toLowerCase() === user.display_name.toLowerCase() || splited[i].toLowerCase() ==='@' + user.username.toLowerCase()) {
        result.push(`<span class="notice">${notice}</span>`);
        continue;
      }
      for (let k = 0; k < bttv.globalEmotes.length; k++) {
        if (bttv.globalEmotes[k].code === splited[i]) {
          emoted = true;
          result.push('<img data-bs-toggle="tooltip" alt="'+ splited[i] +'" title="'+ splited[i] +'" class="emoticon" src="https://cdn.betterttv.net/emote/'+ bttv.globalEmotes[k].id +'/1x">')
        }
      }
      if (emoted) continue;
      for (let k = 0; k < bttv.bttvEmotes.length; k++) {
        if (bttv.bttvEmotes[k].code === splited[i]) {
          emoted = true;
          result.push('<img data-bs-toggle="tooltip" alt="'+ splited[i] +'" title="'+ splited[i] +'" class="emoticon" src="https://cdn.betterttv.net/emote/'+ bttv.bttvEmotes[k].id +'/1x">')
        }
      }
      if (emoted) continue;
      for (let j = 0; j < emotes.length; j++ ) {
        if (position === emotes[j][1] + emotes[j][2] + 1) {
          emoted = true;
            result.push('<img data-bs-toggle="tooltip" alt="'+  +'" title="'+ splited[i] +'" class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v2/' + emotes[j][0] + '/default/dark/3.0">');
            break;
        }
      }
      if (emoted) continue;
      result.push(splited[i]);
    }
    return result.join(' ');
  }

  addTooltipsToEmotes() {
    let tooltipTriggerList = [].slice.call(this.body.querySelectorAll('[data-bs-toggle="tooltip"]'))
    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new Tooltip(tooltipTriggerEl);
    });
  }
}

class ChatAlert extends HTMLDivElement {
  constructor(message, type = 'default', username = '') {
    super();
    this.type = type;
    this.msg = document.createElement('span');
    this.classList.add('alert', 'mb-1');
    switch (type) {
      case 'success':
      this.classList.add('bg-success', 'text-light');
        break;
      case 'ban':
        this.classList.add('bg-warning', 'text-dark');
        break;
      case 'unban':
        this.classList.add('bg-warning', 'text-dark');
        break;
      case 'danger':
        this.classList.add('bg-danger', 'text-light');
        break;
      case 'siren':
        this.classList.add('bg-danger', 'text-light', 'siren');
        break;
      case 'warning':
        this.classList.add('bg-warning', 'text-dark');
        break;
      case 'info':
        this.classList.add('bg-info', 'text-dark');
        break;
      default:
        this.classList.add('text-muted');
    }
    this.msg.innerHTML = message;
    this.append(this.msg);
    if (username) {
      let btn = new MessageControlButton('btn-lurk', (e) => {
        const msg = document.createElement('span');
        ChatAlert.addLurker(username);
        chatterList.remove(username);
        btn.remove();
        this.msg.remove();
        msg.innerHTML = '<em>(<b>' + username + '</b> добавлен в черный список)</em>';
        this.prepend(msg);
        e.preventDefault();
        e.stopPropagation();
      })
      this.prepend(btn);
    }
  }
  static addLurker(username) {
    channelSets.lurkers.push(username);
    window.localStorage.setItem('lurkers', JSON.stringify([...new Set(channelSets.lurkers)]));
  }
}

class ChattersListController {
  dom = {
    box: document.querySelector('#chatters-list'),
    list: document.querySelector('#list'),
    counter: document.querySelector('#chatters-counter'),
    altCounter: document.querySelector('#chatters-counter-alt'),
    buttons: {
      open: document.querySelector('#open-chatters-list'),
      close: document.querySelector('#close')
    }
  };
  connected = [];
  constructor() {
    this.dom.buttons.close.addEventListener('click', () => {
      this.close();
    });
    this.dom.buttons.open.addEventListener('click', () => {
      this.open();
      this.dom.list.innerHTML = '';
      for (let i = 0; i < this.connected.length; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        const body = document.createElement('div');
        body.classList.add('card-body', 'pt-0', 'pb-0');
        body.innerText = this.connected[i];
        let btn =
        body.prepend(
          new MessageControlButton('btn-lurk', () => {
            ChatAlert.addLurker(this.connected[i]);
            card.innerHTML = '<em>(<b>' + this.connected[i] + '</b> добавлен в черный список)</em>';
            this.remove(this.connected[i]);
            setTimeout(() => {
              card.remove();
            }, 3000);
          }),
        );
        card.append(body);
        this.dom.list.append(card);
      }
    });
  }
  remove(username) {
    this.connected.splice(this.connected.indexOf(username), 1);
    this.dom.altCounter.innerText = this.connected.length;
  }
  add(username) {
    this.connected.push(username);
    this.dom.altCounter.innerText = this.connected.length;
  }
  open() {
    this.dom.box.style.display = 'block';
  }
  close() {
    this.dom.box.style.display = 'none';
  }
}

class ChatController {
  constructor(selector) {
    this.chat = document.querySelector(selector);
    this.connected = false;
    this.selfEmotes = {};
    this.text = document.querySelector('#text');
    this.submit = document.querySelector('#send');
    this.emotes = document.querySelector("#emotes-list");
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
    this.emotes.addEventListener('click', (event) => {
      if (event.target.tagName !== 'IMG') return;
      if (typeof this.selfEmotes[event.target.dataset.id] !== 'object') {
        this.selfEmotes[event.target.dataset.id] = [];
      }
      this.selfEmotes[event.target.dataset.id].push(`${this.text.value.length}-${this.text.value.length + event.target.dataset.name.length}`);
      this.text.value = this.text.value + ' ' + event.target.dataset.name + ' ';
    });
  }
  getEmoteSet(id) {
    Http.get(
      `https://api.twitch.tv/helix/chat/emotes/set?emote_set_id=${id.join('&emote_set_id=')}`,
      {
        'Authorization': 'Bearer ' + user.token,
        'Client-ID': user.client
      }
    )
    .then(data => { if (data.data.length > 0) this.addEmotes(data.data);})
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
      'Authorization': 'Bearer ' + user.token,
      'Client-ID': user.client
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
        this.emotes.append(container, document.createElement('hr'));
      }
    }).catch((err) => console.log(err))
  }
  add(tags, message, self, date = Date.now()) {
    this.chat.append(new ChatMessage(tags, message, self, date));
    this.autoscroll();
  }
  alert(message, type, username) {
    if (this.chat.lastChild instanceof ChatAlert && this.chat.lastChild?.type === type) {
      const last = this.chat.children[this.chat.children.length - 1];
      let wrap;
      let btn;
      let badge;
      if (last.children.length >= 4) {
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
      badge.innerText = `и еще ${wrap.children.length + 1}`
      let alert = new ChatAlert(message, type, username);
      alert.classList.remove('bg-success', 'bg-danger', 'bg-warning', 'bg-info')
      alert.classList.add('list-group-item');
      wrap.append(alert);
    } else {
      this.chat.append(new ChatAlert(message, type, username));
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
  send() {
    if (!this.text.value) return;
    client.say(params.has('channel')?params.get('channel'):user.username, this.text.value);
    this.text.value = '';
    this.selfEmotes = {};
  }
}

export { ChatAlert, ChatMessage, ChatController, ChattersListController, YTFrame, MessageControlButton, ChatMessageBadge };
