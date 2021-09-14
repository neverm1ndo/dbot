const user = {
  username: document.querySelector('#chatjs').dataset.username,
  token: document.querySelector('#chatjs').dataset.token,
  id: document.querySelector('#chatjs').dataset.id,
  client: document.querySelector('#chatjs').dataset.client
};

const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/player_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

const parser = new DOMParser();

class Http {
  static async get(url, headers) {
    const res = await fetch(url, { headers })
      if (res.ok) {
       return await res.json();
    } else {
      alert.error(`Ошибка HTTP: ${this.res.status}`);
    }
  }
  static async post(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return await response.json();
  }
}

class ChatMessageBadge extends HTMLDivElement {
  constructor(type) {
    super();
    this.classList.add('badge-icon');
    this.icon = document.createElement('img');
    this.icon.classList.add('badge-icon-img');
    switch (type) {
      case 'diktorbot':
        this.icon.src = '/tank2.png';
        break;
      case 'broadcaster':
        this.icon.src = '/img/bc.png';
        break;
      case 'moderator':
        this.icon.src = '/img/cm.png';
        break;
      case 'subscriber':
        this.icon.src = '/img/sub.png';
        break;
      case 'founder':
        this.icon.src = '/img/sub.png';
        break;
      case 'vip':
        this.icon.src = '/img/vip.png';
        break;
      case 'turbo':
        this.icon.src = '/img/tur.png';
        break;
      case 'verified':
        this.icon.src = '/img/vf.png';
        break;
      case 'prime':
        this.icon.src = '/img/prime.png';
        break;
      default:
        delete this.icon;
        break;
    }
    if (this.icon) {
      this.append(this.icon);
    }
  }
}
class YTFrame extends HTMLDivElement {
  constructor(url) {
    super();
    this.player;
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
    return (match && match[7].length === 11) ? match[7] : console.error('NO videoID');
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
class ChatMessage extends HTMLDivElement { // FIXIT: Implement it with lodash
  constructor(tags, message, self) {
    super();
    const body = document.createElement('div');
    const nickname = document.createElement('span');
    const ban = document.createElement('button');
    this.tags = tags;
    this.body = body;
    this.links = [];
    nickname.classList.add('nickname');
    nickname.innerHTML = tags['display-name'];
    nickname.style.color = tags.color;
    this.classList.add('card');
    this.body.classList.add('card-body');
    if (tags['message-type'] === "action") body.style.color = nickname.style.color;
    this.body.dataset.date = (this.timestamp(Date.now()));
    let notice = message.includes('@')?'@' + user.username: user.username;
    message = message.replace(notice, `<span class="notice">${notice}</span>`);
    if (this.haveLinks(message)) {
      message = this.linkify(message);
    }
    this.body.innerHTML = this.formatEmotes(message, tags.emotes);
    this.body.prepend(nickname);
    if (tags.badges) {
      const badges = Object.keys(tags.badges);
      if (tags.username === 'diktorbot') badges.push('diktorbot');
      for (let i = 0; i < badges.length; i+=1) {
        this.body.prepend(new ChatMessageBadge(badges[i]));
      }
    }
    if (!self && (tags.username !== user.username)) {
      this.body.prepend(new MessageControlButton('btn-control', () => {
        client.ban(user.username, tags.username)
      }));
    }
    this.append(this.body);
    if (this.links) {
      if (!YTFrame.getVideoID(this.links[0])) return;
      this.body.appendChild(new YTFrame(this.links[0]));
    }
  }

  pretty(tags, message) {
    let notice = message.includes('@')?'@' + user.username: user.username;
    message = this.formatEmotes(message, tags.emotes);
    message = message.replace(notice, `<span class="notice">${notice}</span>`);
    if (Array.isArray(this.haveLinks(message))) {
      message = this.linkify(message);
    }
    return message;
  }

  timestamp (unix) {
    const  date = new Date(unix);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }
  haveLinks(text) {
    this.links = text.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
    return this.links;
  }
  linkify(text) {
    //URLs starting with http://, https://, or ftp://
    var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    var replacedText = text.replace(replacePattern1, '<a href="$1">$1</a>');

    //URLs starting with www. (without // before it, or it'd re-link the ones done above)
    var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2">$2</a>');

    //Change email addresses to mailto:: links
    var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
    var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
    return replacedText;
  }
  formatEmotes(text, emotes) {
        var splitText = text.split('');
        for(let i in emotes) {
            let e = emotes[i];
            for(let j in e) {
                let mote = e[j];
                if(typeof mote == 'string') {
                    mote = mote.split('-');
                    mote = [parseInt(mote[0]), parseInt(mote[1])];
                    let length =  mote[1] - mote[0],
                        empty = Array.apply(null, new Array(length + 1)).map(() => { return '' });
                    splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                    splitText.splice(mote[0], 1, '<img class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v2/' + i + '/default/dark/3.0">');
                }
            }
        }
        return splitText.join('');
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
        this.addLurker(username);
      }));
    }
    this.append(body);
  }
  addLurker(username) {
    lurkers.push(username);
    window.localStorage.setItem('lurkers', JSON.stringify([...new Set(lurkers)]));
  }
}

class ChattersListController {
  constructor() {
    this.box = document.querySelector('#chatters-list');
    this.list = document.querySelector('#list');
    this.buttons = {
      open: document.querySelector('#open-chatters-list'),
      close: document.querySelector('#close')
    }
    this.buttons.close.addEventListener('click', () => {
      this.close();
    });
    this.buttons.open.addEventListener('click', () => {
      this.open();
      this.list.innerHTML = '';
      for (let i = 0; i < connected.length; i+=1) {
        const li = document.createElement('li');
        li.innerHTML = connected[i];
        this.list.append(li);
      }
    });
  }
  open() {
    this.box.style.display = 'block';
  }
  close() {
    this.box.style.display = 'none';
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
    //*********************FIXIT***************************//
    Http.get(
      'https://api.twitch.tv/helix/chat/emotes/global',
      {
        'Authorization': 'Bearer ' + user.token,
        'Client-ID': 'ezap2dblocyxqnsjhl9dpyw1jpn8c7'
      }
    )
    .then(data => { this.addEmotes(data.data, 'Twitch') });
    Http.get(
      'https://api.twitch.tv/helix/chat/emotes?broadcaster_id=' + user.id,
      {
        'Authorization': 'Bearer ' + user.token,
        'Client-ID': 'ezap2dblocyxqnsjhl9dpyw1jpn8c7'
      }
    )
    .then(data => { this.addEmotes(data.data, user.username) });
    //*************************************************//
    this.emotes.addEventListener('click', (event) => {
      if (event.target.tagName !== 'IMG') return;
      if (typeof this.selfEmotes[event.target.dataset.id] !== 'object') {
        this.selfEmotes[event.target.dataset.id] = [];
      }
      this.selfEmotes[event.target.dataset.id].push(`${this.text.value.length}-${this.text.value.length + event.target.dataset.name.length}`);
      this.text.value = this.text.value + ' ' + event.target.dataset.name + ' ';
    });
  }
  addEmotes(emotes, type) {
    const title = document.createElement('h6');
    title.innerHTML = type;
    this.emotes.append(title);
    emotes.forEach(emote => {
      const img = document.createElement('img');
      img.src = `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/${emote.format}/dark/3.0`;
      img.dataset.name = emote.name;
      img.dataset.id = emote.id;
      this.emotes.append(img);
    })
  }
  add(tags, message, self) {
    this.chat.append(new ChatMessage(tags, message, self));
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
          childs[i].body.classList.add('text-decoration-line-through');
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

customElements.define('twitch-badge', ChatMessageBadge, { extends: 'div' });
customElements.define('chat-message', ChatMessage, { extends: 'div' });
customElements.define('chat-alert', ChatAlert, { extends: 'div' });
customElements.define('yt-player', YTFrame, { extends: 'div' });
customElements.define('control-button', MessageControlButton, { extends: 'button' });


const chat = new ChatController('#chat');
const chatterList = new ChattersListController();

const counter = document.querySelector('#chatters-counter');
const connected = [];


let lurkers;
Http.get('/controls/chat/lurkers').then(data => { lurkers = [...lurkers, data] });
if (window.localStorage.getItem('lurkers')) {
  lurkers = [...new Set(...[JSON.parse(window.localStorage.getItem('lurkers')), lurkers])];
}
const params = new URLSearchParams(window.location.search);

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
// chat.add({
//     "badge-info": null,
//     "badges": null,
//     "color": null,
//     "display-name": "dummy",
//     "emotes": null,
//     "flags": null,
//     "mod": false,
//     "subscriber": false,
//     "turbo": false,
//     "user-type": null,
//     "emotes-raw": null,
//     "badge-info-raw": null,
//     "badges-raw": null,
//     "username": "moodinthemoon",
//     "message-type": "chat"
// }, 'test', false);
// chat.alert('kek присоединился к чату', 'success', 'kek');
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
  if (self || connected.includes(username) || lurkers.includes(username)) return;
  connected.push(username);
  counter.innerHTML = connected.length;
  chat.alert(`<b>${username}</b> подключился к чату`, 'success', username);
});
client.on('ban', (channel, username, reason) => {
  chat.alert(`<b>${username}</b> забанен`, 'warning');
  chat.pseudoDelete(username);
});
client.on('part', (channel, username, self) => {
  if (self || lurkers.includes(username)) return;
  setTimeout(() => {
    if (connected.includes(username)) {
      connected.pop(username);
      counter.innerHTML = connected.length;
      chat.alert(`<b>${username}</b> отключился`, 'danger', username);
    }
  }, 180000);
});
client.on('message', (channel, tags, message, self) => {
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
