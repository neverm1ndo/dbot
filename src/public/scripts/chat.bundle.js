/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/public/scripts/bttv.js":
/*!************************************!*\
  !*** ./src/public/scripts/bttv.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./http */ "./src/public/scripts/http.js");
/* harmony import */ var _chat__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./chat */ "./src/public/scripts/chat.js");


class BTTV {
  bttvEmotes = {
    urlTemplate: 'https://cdn.betterttv.net/emote/{{id}}/{{image}}',
    scales: { 1: '1x', 2: '2x', 3: '3x' },
    bots: [],
    emoteCodeList: [],
    emotes: [],
    subEmotesCodeList: [],
    allowEmotesAnyChannel: false
  };
  globalEmotes = {
    emotes: []
  }
  constructor() {};
  getEmotes() {
    console.log('Getting BTTV emotes');
    _http__WEBPACK_IMPORTED_MODULE_0__["default"].get(`chat/emotes?channel=${_chat__WEBPACK_IMPORTED_MODULE_1__.params.has('channel')?_chat__WEBPACK_IMPORTED_MODULE_1__.params.get('channel'):_chat__WEBPACK_IMPORTED_MODULE_1__.user.username}`)
    .then((data) => {
      console.log('Got BTTV global emotes \n', data);
      this.bttvEmotes = this.bttvEmotes.emotes.concat(data.channel.emotes.map(function(n) {
        n.global = true;
        return n;
      }));
      this.globalEmotes = this.globalEmotes.emotes.concat(data.global.emotes.map(function(n) {
        n.global = true;
        return n;
      }));
      this.bttvEmotes.subEmotesCodeList = _.chain(this.bttvEmotes.emotes).where({ global: true }).reject(function(n) { return _.isNull(n.channel); }).pluck('code').value();
    }).catch((err) => console.error)
    .then(() => {
      this.addEmotes(this.bttvEmotes, _chat__WEBPACK_IMPORTED_MODULE_1__.params.has('channel')?_chat__WEBPACK_IMPORTED_MODULE_1__.params.get('channel'):_chat__WEBPACK_IMPORTED_MODULE_1__.user.username);
      this.addEmotes(this.globalEmotes, 'Global');
    })
  }
  mergeEmotes(data, channel) {
    console.log('Got BTTV emotes for ' + channel);
    this.bttvEmotes.emotes = this.bttvEmotes.emotes.concat(data.emotes.map(function(n) {
        if(!_.has(n, 'restrictions')) {
          n.restrictions = {
              channels: [],
              games: []
            };
        }
        if(n.restrictions.channels.indexOf(channel) == -1) {
          n.restrictions.channels.push(channel);
        }
        return n;
      }));
    this.bttvEmotes.bots = this.bttvEmotes.bots.concat(data.bots.map(function(n) {
      return {
        name: n,
        channel: channel
      };
    }));
  }
  addEmotes(emotes, titleof) {
    const container = document.createElement('div');
    const subcont = document.createElement('div');
    const title = document.createElement('b');
    title.innerText = 'BTTV ' + titleof;
    for (let i = 0; i < emotes.length; i++) {
      const img = document.createElement('img');
      img.title = emotes[i].code;
      img.classList.add('emote');
      img.setAttribute('data-bs-toggle', 'tooltip');
      img.setAttribute('data-bs-placement', 'top');
      img.src = `https://cdn.betterttv.net/emote/${emotes[i].id}/1x`;
      img.dataset.name = emotes[i].code;
      img.dataset.id = emotes[i].id;
      new bootstrap.Tooltip(img, {
        boundary: _chat__WEBPACK_IMPORTED_MODULE_1__.chat.emotes.parentNode
      });
      subcont.append(img);
    }
    container.append(title, subcont);
    _chat__WEBPACK_IMPORTED_MODULE_1__.chat.emotes.append(container, document.createElement('hr'));
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (BTTV);


/***/ }),

/***/ "./src/public/scripts/chat.app.js":
/*!****************************************!*\
  !*** ./src/public/scripts/chat.app.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "ChatAlert": () => (/* binding */ ChatAlert),
/* harmony export */   "ChatMessage": () => (/* binding */ ChatMessage),
/* harmony export */   "ChatController": () => (/* binding */ ChatController),
/* harmony export */   "ChattersListController": () => (/* binding */ ChattersListController),
/* harmony export */   "YTFrame": () => (/* binding */ YTFrame),
/* harmony export */   "MessageControlButton": () => (/* binding */ MessageControlButton),
/* harmony export */   "ChatMessageBadge": () => (/* binding */ ChatMessageBadge)
/* harmony export */ });
/* harmony import */ var _http__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./http */ "./src/public/scripts/http.js");
/* harmony import */ var _hex__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./hex */ "./src/public/scripts/hex.js");
/* harmony import */ var _chat__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./chat */ "./src/public/scripts/chat.js");




const defaultBadges = {
  'diktorbot': '/tank2.png',
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
    for (let i = 0; i < _chat__WEBPACK_IMPORTED_MODULE_2__.channelSets.badges.length; i++) {
      if (type[0] === _chat__WEBPACK_IMPORTED_MODULE_2__.channelSets.badges[i].set_id) {
        for (let j = 0; j < _chat__WEBPACK_IMPORTED_MODULE_2__.channelSets.badges[i].versions.length; j++) {
          if (type[1] === _chat__WEBPACK_IMPORTED_MODULE_2__.channelSets.badges[i].versions[j].id) {
              this.icon.src = _chat__WEBPACK_IMPORTED_MODULE_2__.channelSets.badges[i].versions[j].image_url_2x;
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
        _chat__WEBPACK_IMPORTED_MODULE_2__.chat.autoscroll();
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
    const color = tags.color?new _hex__WEBPACK_IMPORTED_MODULE_1__["default"](tags.color):new _hex__WEBPACK_IMPORTED_MODULE_1__["default"]('FFFFFF');
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
    if (!self && (tags.username !== _chat__WEBPACK_IMPORTED_MODULE_2__.user.username)) {
      this.body.prepend(new MessageControlButton('btn-timeout', () => {
        _chat__WEBPACK_IMPORTED_MODULE_2__.client.timeout(_chat__WEBPACK_IMPORTED_MODULE_2__.params.has('channel')?_chat__WEBPACK_IMPORTED_MODULE_2__.params.get('channel'):_chat__WEBPACK_IMPORTED_MODULE_2__.user.username, tags.username, 600, 'rediska');
      }));
      this.body.prepend(new MessageControlButton('btn-control', () => {
        _chat__WEBPACK_IMPORTED_MODULE_2__.client.ban(_chat__WEBPACK_IMPORTED_MODULE_2__.params.has('channel')?_chat__WEBPACK_IMPORTED_MODULE_2__.params.get('channel'):_chat__WEBPACK_IMPORTED_MODULE_2__.user.username, tags.username);
      }));
    }
    this.append(this.body);
    if (haveLinks(message)) { // FIXME: remove unnecessary variable (links), fix condition
      const links = haveLinks(message);
      if (!YTFrame.getVideoID(links[0])) return;
      this.body.appendChild(new YTFrame(links[0]));
    }
    this.nickname.addEventListener('click', () => { // ??? Exprerimental (may cause perfomance violation)
      _chat__WEBPACK_IMPORTED_MODULE_2__.chat.text.value = _chat__WEBPACK_IMPORTED_MODULE_2__.chat.text.value + ' @' + tags.username + ' ';
      _chat__WEBPACK_IMPORTED_MODULE_2__.chat.text.focus();
    });
  }

  pretty(tags, message) {
    let notice = message.includes('@')?'@' + _chat__WEBPACK_IMPORTED_MODULE_2__.user.display_name: _chat__WEBPACK_IMPORTED_MODULE_2__.user.display_name;
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
      if (splited[i].toLowerCase() === _chat__WEBPACK_IMPORTED_MODULE_2__.user.display_name.toLowerCase() || splited[i].toLowerCase() ==='@' + _chat__WEBPACK_IMPORTED_MODULE_2__.user.username.toLowerCase()) {
        result.push(`<span class="notice">${notice}</span>`);
        continue;
      }
      for (let k = 0; k < _chat__WEBPACK_IMPORTED_MODULE_2__.bttv.globalEmotes.length; k++) {
        if (_chat__WEBPACK_IMPORTED_MODULE_2__.bttv.globalEmotes[k].code === splited[i]) {
          emoted = true;
          result.push('<img data-bs-toggle="tooltip" title="'+ splited[i] +'" class="emoticon" src="https://cdn.betterttv.net/emote/'+ _chat__WEBPACK_IMPORTED_MODULE_2__.bttv.globalEmotes[k].id +'/1x">')
        }
      }
      if (emoted) continue;
      for (let k = 0; k < _chat__WEBPACK_IMPORTED_MODULE_2__.bttv.bttvEmotes.length; k++) {
        if (_chat__WEBPACK_IMPORTED_MODULE_2__.bttv.bttvEmotes[k].code === splited[i]) {
          emoted = true;
          result.push('<img data-bs-toggle="tooltip" title="'+ splited[i] +'" class="emoticon" src="https://cdn.betterttv.net/emote/'+ _chat__WEBPACK_IMPORTED_MODULE_2__.bttv.bttvEmotes[k].id +'/1x">')
        }
      }
      if (emoted) continue;
      for (let j = 0; j < emotes.length; j++ ) {
        if (position === emotes[j][1] + emotes[j][2] + 1) {
          emoted = true;
            result.push('<img data-bs-toggle="tooltip" title="'+ splited[i] +'" class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v2/' + emotes[j][0] + '/default/dark/3.0">');
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
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
}

class ChatAlert extends HTMLDivElement {
  constructor(message, type = 'default', username = '') {
    super();
    const body = document.createElement('div');
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
    this.innerHTML = message;
    if (username) {
      this.prepend(new MessageControlButton('btn-lurk', () => {
        ChatAlert.addLurker(username);
        _chat__WEBPACK_IMPORTED_MODULE_2__.chatterList.remove(username);
        this.innerHTML = '<em>(<b>' + username + '</b> добавлен в черный список)</em>';
      }));
    }
    this.append(body);
  }
  static addLurker(username) {
    _chat__WEBPACK_IMPORTED_MODULE_2__.channelSets.lurkers.push(username);
    window.localStorage.setItem('lurkers', JSON.stringify([...new Set(_chat__WEBPACK_IMPORTED_MODULE_2__.channelSets.lurkers)]));
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
        const li = document.createElement('li');
        li.innerText = this.connected[i];
        li.prepend(
          new MessageControlButton('btn-lurk', () => {
            ChatAlert.addLurker(this.connected[i]);
            li.innerHTML = '<em>(<b>' + this.connected[i] + '</b> добавлен в черный список)</em>';
            this.remove(this.connected[i]);
            setTimeout(() => {
              li.remove();
            }, 3000);
          }),
        );
        this.dom.list.append(li);
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
    _http__WEBPACK_IMPORTED_MODULE_0__["default"].get(
      `https://api.twitch.tv/helix/chat/emotes/set?emote_set_id=${id.join('&emote_set_id=')}`,
      {
        'Authorization': 'Bearer ' + _chat__WEBPACK_IMPORTED_MODULE_2__.user.token,
        'Client-ID': _chat__WEBPACK_IMPORTED_MODULE_2__.user.client
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
    _http__WEBPACK_IMPORTED_MODULE_0__["default"].get(`https://api.twitch.tv/helix/users?id=${[...streamers].join('&id=')}`, {
      'Authorization': 'Bearer ' + _chat__WEBPACK_IMPORTED_MODULE_2__.user.token,
      'Client-ID': _chat__WEBPACK_IMPORTED_MODULE_2__.user.client
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
          new bootstrap.Tooltip(img, {
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
    this.chat.append(new ChatAlert(message, type, username));
    this.autoscroll();
  }
  autoscroll () {
    this.chat.parentElement.scrollTop = this.chat.parentElement.scrollHeight;
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
    _chat__WEBPACK_IMPORTED_MODULE_2__.client.say(_chat__WEBPACK_IMPORTED_MODULE_2__.params.has('channel')?_chat__WEBPACK_IMPORTED_MODULE_2__.params.get('channel'):_chat__WEBPACK_IMPORTED_MODULE_2__.user.username, this.text.value);
    this.text.value = '';
    this.selfEmotes = {};
  }
}




/***/ }),

/***/ "./src/public/scripts/chat.js":
/*!************************************!*\
  !*** ./src/public/scripts/chat.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "user": () => (/* binding */ user),
/* harmony export */   "channelSets": () => (/* binding */ channelSets),
/* harmony export */   "chat": () => (/* binding */ chat),
/* harmony export */   "chatterList": () => (/* binding */ chatterList),
/* harmony export */   "params": () => (/* binding */ params),
/* harmony export */   "bttv": () => (/* binding */ bttv),
/* harmony export */   "client": () => (/* binding */ client)
/* harmony export */ });
/* harmony import */ var _chat_app__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chat.app */ "./src/public/scripts/chat.app.js");
/* harmony import */ var _cookies__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./cookies */ "./src/public/scripts/cookies.js");
/* harmony import */ var _pubsub__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./pubsub */ "./src/public/scripts/pubsub.js");
/* harmony import */ var _http__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./http */ "./src/public/scripts/http.js");
/* harmony import */ var _bttv__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./bttv */ "./src/public/scripts/bttv.js");






class User {
  username = _cookies__WEBPACK_IMPORTED_MODULE_1__["default"].get('nmnd_user_login');
  display_name = _cookies__WEBPACK_IMPORTED_MODULE_1__["default"].get('nmnd_user_display_name');
  token = _cookies__WEBPACK_IMPORTED_MODULE_1__["default"].get('nmnd_user_access_token');
  id = _cookies__WEBPACK_IMPORTED_MODULE_1__["default"].get('nmnd_user_id');
  client = _cookies__WEBPACK_IMPORTED_MODULE_1__["default"].get('nmnd_app_client_id');
};

const user = new User();

const channelSets = {
  badges: [],
  lurkers: [],
  sets: new Set(),
  id: user.id,
}

const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/player_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


//** Define custom HTML elements **//

customElements.define('twitch-badge', _chat_app__WEBPACK_IMPORTED_MODULE_0__.ChatMessageBadge, { extends: 'div' });
customElements.define('chat-message', _chat_app__WEBPACK_IMPORTED_MODULE_0__.ChatMessage, { extends: 'div' });
customElements.define('chat-alert', _chat_app__WEBPACK_IMPORTED_MODULE_0__.ChatAlert, { extends: 'div' });
customElements.define('yt-player', _chat_app__WEBPACK_IMPORTED_MODULE_0__.YTFrame, { extends: 'div' });
customElements.define('control-button', _chat_app__WEBPACK_IMPORTED_MODULE_0__.MessageControlButton, { extends: 'button' });

//*******************************//

const parser = new DOMParser();
const chat = new _chat_app__WEBPACK_IMPORTED_MODULE_0__.ChatController('#chat');
const chatterList = new _chat_app__WEBPACK_IMPORTED_MODULE_0__.ChattersListController();
const params = new URLSearchParams(window.location.search);
const bttv = new _bttv__WEBPACK_IMPORTED_MODULE_4__["default"](params);

const pubsub = new _pubsub__WEBPACK_IMPORTED_MODULE_2__["default"]();

bttv.getEmotes();
pubsub.connect();

let trigger = 0;

// if (params.has('channel')) {
function handleStreamInfo(id) {
  setInterval(() => {
    _http__WEBPACK_IMPORTED_MODULE_3__["default"].get(`https://api.twitch.tv/helix/streams?user_id=${id}`, {
      'Authorization': 'Bearer ' + user.token,
      'Client-ID': user.client
    }).then((data) => {
      if (data.data[0]) {
        chatterList.dom.counter.innerHTML = data.data[0].viewer_count;
      }
    })
  }, 120000);
}
_http__WEBPACK_IMPORTED_MODULE_3__["default"].get(`https://api.twitch.tv/helix/users?login=${params.has('channel')?params.get('channel'):user.username}`, {
  'Authorization': 'Bearer ' + user.token,
  'Client-ID': user.client
}).then((data) => {
  channelSets.id = data.data[0].id;
  handleStreamInfo(channelSets.id);
  return Promise.all([
    _http__WEBPACK_IMPORTED_MODULE_3__["default"].get(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${channelSets.id}`, {
      'Authorization': 'Bearer ' + user.token,
      'Client-ID': user.client
    }),
    _http__WEBPACK_IMPORTED_MODULE_3__["default"].get(`/controls/chat/last?channel=${params.has('channel')?params.get('channel'):user.username}`),
  ])
}).then(([badges, lastMessages]) => {
  channelSets.badges = badges.data;
  lastMessages.forEach((message) => {
    chat.add(message.tags, message.message, message.self, message.date);
  });
}).catch((err) => console.error(err));

if (window.localStorage.getItem('lurkers')) {
  channelSets.lurkers = [...new Set(...[JSON.parse(window.localStorage.getItem('lurkers')), channelSets.lurkers])];
  JSON.parse(window.localStorage.getItem('lurkers')).forEach((lurker, index, arr) => {
    if (Array.isArray(lurker)) {
      channelSets.lurkers.splice(channelSets.lurkers.indexOf(lurker), 1);
    }
  })
  window.localStorage.setItem('lurkers', JSON.stringify(channelSets.lurkers));
}

const client = new tmi.Client({
  options: {
    debug: true,
    messagesLogLevel: "info",
    clientId: user.client,
    skipUpdatingEmotesets: true
  },
  connection: { reconnect: true, secure: true },
  identity: {
    username: user.username,
    password: 'oauth:' + user.token
  },
  channels: [params.has('channel')?params.get('channel'):user.username]
});

client.connect();
client.on('connected', (channel, self) => {
  chat.alert('Добро пожаловать в чат!');
  chat.connected = true;
  chat.submit.disabled = false;
});
client.on('disconnected', (channel, self) => {
  chat.alert('Вы отсоединенны от чата', 'siren');
  chat.connected = false;
  chat.submit.disabled = true;
});
client.on('join', (channel, username, self) => {
  if (self || chatterList.connected.includes(username) || channelSets.lurkers.includes(username)) return;
  chatterList.add(username);
  chat.alert(`<b>${username}</b> подключился к чату`, 'success', username);
});
client.on('ban', (channel, username, reason, userstate) => {
  // Replaced with PubSub event handler
  // chat.alert(`<b>${username}</b> забанен ${reason?': ' + reason:''}`, 'warning');
  chat.pseudoDelete(username);
});
client.on('timeout', (channel, username, reason, duration, userstate) => {
  chat.alert(`<b>${username}</b> отстранен на ${duration} секунд ${reason?'по причине ' + reason:''}`, 'warning');
  chat.pseudoDelete(username);
});
client.on('part', (channel, username, self) => {
  if (self || channelSets.lurkers.includes(username)) return;
  setTimeout(() => {
    if (chatterList.connected.includes(username)) {
      chatterList.remove(username);
      chat.alert(`<b>${username}</b> отключился`, 'danger', username);
    }
  }, 180000);
});
client.on('chat', (channel, tags, message, self) => {
  if (self) {
    tags.emotes = chat.selfEmotes;
    chat.add(tags, message, self);
    return;
  }
  chat.add(tags, message, self);
});
client.on('subscription', (channel, username, methods, message, userstate) => {
  chat.alert(`<b>${username}</b> оформил подписку<br><small>${message}</small>`, 'info');
});
client.on('notice', (channel, msgid, message) => {
  chat.alert(`<small>${message}</small>`);
});
client.on('vips', (channel, vips) => {
  vips = vips.join('</br>');
  chat.alert(`<small>${vips.length > 0?vips:'Список VIP пуст'}</small>`);
});
client.on('mods', (channel, mods) => {
  mods = mods.join('</br>');
  chat.alert(`<small>${mods.length > 0?mods:'Список модераторов пуст'}</small>`);
});
client.on('resub', (channel, username, methods, message, userstate) => {
  chat.alert(`<b>${username}</b> оформил подписку<br><small>${message}</small>`, 'info');
});
client.on('subgift', (channel, username, streakMonths, recepient, methods, userstate) => {
  chat.alert(`<b>${username}</b> подарил подписку <u>${recepient}</u>`, 'info');
});
client.on('raided', (channel, username, viewers) => {
  chat.alert(`<b>${username}</b> зарейдил канал на <b>${viewers}</b> зрителей`, 'info');
});
client.on('hosted', (channel, username, viewers, autohost) => {
  chat.alert(`<b>${username}</b> захостил канал на <b>${viewers}</b> зрителей`, 'info');
});
client.on('whisper', (channel, tags, message, self) => {
  chat.add(tags, message, self);
});
client.on('clearchat', (channel) => {
  chat.alert('Чат был очищен');
});
client.on('cheer', (channel, userstate, message) => {
  chat.alert(`<b>${username}</b> поддержал канал на <b>${userstate.bits}</b> Cheers`, 'info');
});
client.on('emotesets', (sets, obj) => {
  if (trigger > 0) return;
  trigger++;
  chat.getEmoteSet(sets.split(','));
});


/***/ }),

/***/ "./src/public/scripts/cookies.js":
/*!***************************************!*\
  !*** ./src/public/scripts/cookies.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Cookies)
/* harmony export */ });
class Cookies {
  static get(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }
}


/***/ }),

/***/ "./src/public/scripts/hex.js":
/*!***********************************!*\
  !*** ./src/public/scripts/hex.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class HEX {
  constructor(color) {
    if (typeof color !== 'string') throw console.error(Error(color + ' is not a string!'));
    if (color.startsWith('#')) color = color.substr(1);
    this.color = parseInt(color, 16);
    this.r = parseInt(color.substr(0, 2), 16);
    this.g = parseInt(color.substr(2, 2), 16);
    this.b = parseInt(color.substr(4, 2), 16);
  }
  setSpecters() {
    this.r = parseInt(this.toString().substr(0, 2), 16);
    this.g = parseInt(this.toString().substr(2, 2), 16);
    this.b = parseInt(this.toString().substr(4, 2), 16);
  }
  setColor() {
    this.color = parseInt(this.toString().substr(1), 16);
  }
  blend(hex) {
    if (!(hex instanceof HEX)) {
      throw console.error(Error(hex + ' is not a HEX instance!'));
    }
    this.color = this.color + hex.color;
    this.setSpecters();
    return this;
  }
  toString() {
    const c = {
      r: this.r.toString(16),
      g: this.g.toString(16),
      b: this.b.toString(16)
    };
    const result = '#' + ('0').repeat(2 - c.r.length) + c.r + ('0').repeat(2 - c.g.length) + c.g + ('0').repeat(2 - c.b.length) + c.b;
    return result;
  }
  valueOf() {
    return this.color;
  }
  saturation(amount) {
    amount = amount/100;
    if (amount < 0) {
      console.warn('Saturation percentage must be more than 0', amount);
      return this;
    }
    const gray = this.r * 0.3086 + this.g * 0.6094 + this.b * 0.0820;
    this.r = Math.round(this.r * amount + gray * (1-amount));
    this.g = Math.round(this.g * amount + gray * (1-amount));
    this.b = Math.round(this.b * amount + gray * (1-amount));
    this.setColor();
    return this;
  }
  contrast(amount) {
    amount = amount/100;
    if (amount < 0) {
      return this;
    }
    const col = Math.max.apply(null, [this.r, this.g, this.b]);
    this.r = Math.min(255, Math.round((this.r/col)*this.r + (amount*col)));
    this.g = Math.min(255, Math.round((this.g/col)*this.g + (amount*col)));
    this.b = Math.min(255, Math.round((this.b/col)*this.b + (amount*col)));
    this.setColor();
    return this;
  }
  brightness(amount) {
    amount = amount/100;
    if (amount < 0) {
      console.warn('Brightness percentage must be more than 0', amount);
      return this;
    }
    this.r = Math.min(255,Math.floor(this.r + 255 - (amount*255)));
    this.g = Math.min(255,Math.floor(this.g + 255 - (amount*255)));
    this.b = Math.min(255,Math.floor(this.b + 255 - (amount*255)));
    this.setColor();
    return this;
  }
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (HEX);


/***/ }),

/***/ "./src/public/scripts/http.js":
/*!************************************!*\
  !*** ./src/public/scripts/http.js ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
class Http {
  static async get(url, headers, mode = 'cors') {
    const res = await fetch(url, { method: 'GET', headers, cache: 'default' })
      if (res.ok) {
       return await res.json();
    } else {
      alert.error(`Ошибка HTTP: ${this.res.status}`);
    }
  }
  static async post(url, data) {
    const res= await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return await res.json();
  }
}
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (Http);


/***/ }),

/***/ "./src/public/scripts/pubsub.js":
/*!**************************************!*\
  !*** ./src/public/scripts/pubsub.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _chat__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chat */ "./src/public/scripts/chat.js");


const _SCOPE = 'user_read+chat_login';

class PubSub {
  ws
  moderation_actions = {
    'unban': 'разбанил',
    'ban': 'забанил'
  }
  constructor() {}
  connect() {
    const heartbeatInterval = 1000 * 60;
    const reconnectInterval = 1000 * 3;
    let heartbeatHandle;
    this.ws = new WebSocket('wss://pubsub-edge.twitch.tv');
    this.ws.onopen = (event) => {
        console.log('[PUBSUB] INFO: Socket Opened')
        this.heartbeat();
        heartbeatHandle = setInterval(() => {
          this.heartbeat();
        }, heartbeatInterval);
        this.listen();
    };
    this.ws.onerror = (error) => {
        console.error('[PUBSUB] ERR:  ' + JSON.stringify(error) + '\n');
    };
    this.ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('[PUBSUB] RECV: ' + JSON.stringify(message) + '\n');
        if (message.type == 'MESSAGE') {
          const msg = JSON.parse(message.data.message).data;
          if (!this.moderation_actions[msg.moderation_action]) return;
          _chat__WEBPACK_IMPORTED_MODULE_0__.chat.alert(`<b>${msg.created_by}</b> ${this.moderation_actions[msg.moderation_action]} <b>${msg.args[0]}</b> ${msg.args[1]?'по причине: ' + msg.args[1]:''}`, msg.moderation_action);
        }
        if (message.type == 'RECONNECT') {
            console.log('[PUBSUB] INFO: Reconnecting...\n');
            setTimeout(() => {
              this.connect()
            }, reconnectInterval);
        }
    };
    this.ws.onclose = () => {
        console.log('[PUBSUB] INFO: Socket Closed\n');
        clearInterval(heartbeatHandle);
        console.log('[PUBSUB] INFO: Reconnecting...\n');
        setTimeout(() => {
          this.connect()
        }, reconnectInterval);
    };
  }
  heartbeat() {
    const message = {
        type: 'PING'
    };
    this.ws.send(JSON.stringify(message));
  }
  listen() {
    const message = {
        type: 'LISTEN',
        nonce: nonce(15),
        data: {
            topics: [`chat_moderator_actions.${_chat__WEBPACK_IMPORTED_MODULE_0__.user.id}.${_chat__WEBPACK_IMPORTED_MODULE_0__.user.id}`],
            auth_token: _chat__WEBPACK_IMPORTED_MODULE_0__.user.token
        }
    };
    console.log('[PUBSUB] SENT: ' + JSON.stringify(message) + '\n');
    this.ws.send(JSON.stringify(message));
  }
}
function nonce(length) {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (PubSub);


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!*************************************!*\
  !*** ./src/public/scripts/index.js ***!
  \*************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _chat_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chat.js */ "./src/public/scripts/chat.js");


})();

/******/ })()
;
//# sourceMappingURL=chat.bundle.js.map