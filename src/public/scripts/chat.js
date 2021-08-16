const user = {
  username: document.querySelector('#chatjs').dataset.username,
  token: document.querySelector('#chatjs').dataset.token,
  id: document.querySelector('#chatjs').dataset.id,
  client: document.querySelector('#chatjs').dataset.client
};

class Http {
  static async get(url, headers) {
    const res = await fetch(url, { headers })
      if (res.ok) {
       return await res.json();
    } else {
      alert.error(`Ошибка HTTP: ${this.res.status}`);
    }
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
class MessageControlButton extends HTMLButtonElement {
  constructor(tags) {
    super();
    this.type = 'button';
    this.classList.add('btn', 'btn-control');
    this.addEventListener('click', () => {
      client.ban(user.username, tags.username)
    });
  }
}
class ChatMessage extends HTMLDivElement {
  constructor(tags, message, self) {
    super();
    const body = document.createElement('div');
    const nickname = document.createElement('span');
    const ban = document.createElement('button');
    this.tags = tags;
    this.body = body;
    nickname.classList.add('nickname');
    nickname.innerHTML = tags['display-name'];
    nickname.style.color = tags.color
    this.classList.add('card');
    this.body.classList.add('card-body');
    if (tags['message-type'] === "action") body.style.color = tags.color;
    this.body.dataset.date = (this.timestamp(Date.now()));
    message = this.formatLinks(message);
    this.body.innerHTML = this.formatEmotes(message, tags.emotes);
    this.body.prepend(nickname);
    if (tags.badges) {
      const badges = Object.keys(tags.badges);
      if (tags.username === 'diktorbot') badges.push('diktorbot');
      for (let i = 0; i < badges.length; i+=1) {
        this.body.prepend(new ChatMessageBadge(badges[i]));
      }
    }
    if (!self && (tags.username !== user.username)) this.body.prepend(new MessageControlButton(tags));
    this.append(this.body);
  }

  timestamp (unix) {
    const  date = new Date(unix);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
  }
  formatLinks(text) {
    const urlPattern = new RegExp("(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$", 'gm')
    text.match(urlPattern).forEach((link) => {
      console.log(link);
      text = text.replace(link, '<a target="_blank" href="' + link + '">'+ link +'</a>');
    });
    return text;
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
                    splitText.splice(mote[0], 1, '<img class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v2/' + i + '/static/dark/3.0">');
                }
            }
        }
        return splitText.join('');
    }
}

class ChatAlert extends HTMLDivElement {
  constructor(message, type = 'default') {
    super();
    const body = document.createElement('div');
    this.classList.add('alert', 'mb-2');
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
    this.append(body);
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
  }
  addEmotes(emotes, type) {
    const title = document.createElement('h6');
    title.innerHTML = type;
    this.emotes.append(title);
    emotes.forEach(emote => {
      const img = document.createElement('img');
      img.src = `https://static-cdn.jtvnw.net/emoticons/v2/${emote.id}/${emote.format}/dark/3.0`;
      img.dataset.name = emote.name;
      img.addEventListener('click', () => {
        if (typeof this.selfEmotes[emote.id] !== 'object') {
          this.selfEmotes[emote.id] = [];
        }
        this.selfEmotes[emote.id].push(`${this.text.value.length}-${this.text.value.length + emote.name.length}`);
        this.text.value = this.text.value + ' ' + emote.name + ' ';
      });
      this.emotes.append(img);
    })
  }
  add(tags, message, self) {
    this.chat.append(new ChatMessage(tags, message, self));
    this.autoscroll();
  }
  alert(message, type) {
    this.chat.append(new ChatAlert(message, type));
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
    client.say(user.username, this.text.value);
    this.text.value = '';
    this.selfEmotes = {};
  }
}

customElements.define('twitch-badge', ChatMessageBadge, { extends: 'div' });
customElements.define('chat-message', ChatMessage, { extends: 'div' });
customElements.define('chat-alert', ChatAlert, { extends: 'div' });
customElements.define('control-button', MessageControlButton, { extends: 'button' });


const chat = new ChatController('#chat');
const chatterList = new ChattersListController();

const counter = document.querySelector('#chatters-counter');
const connected = [];


let lurkers;
Http.get('/controls/chat/lurkers').then(data => { lurkers = data });

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
  channels: [user.username]
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
  if (self || connected.includes(username) || lurkers.includes(username)) return;
  connected.push(username);
  counter.innerHTML = connected.length;
  chat.alert(`<b>${username}</b> подключился к чату`, 'success');
});
client.on('ban', (channel, username, reason) => {
  chat.alert(`<b>${username}</b> забанен`, 'warning');
  chat.pseudoDelete(username);
});
client.on('part', (channel, username, self) => {
  if (self || lurkers.includes(username)) return;
  setTimeout(() => {
    connected.pop(username);
    counter.innerHTML = connected.length;
    chat.alert(`<b>${username}</b> отключился`, 'danger');
  }, 300000);
});
client.on('message', (channel, tags, message, self) => {
  if (self) {
    tags.emotes = chat.selfEmotes;
    chat.add(tags, message, self);
    return;
  }
  console.log(tags);
  chat.add(tags, message, self);
});
client.on('subscription', (channel, username, methods, message, userstate) => {
  alert.add(`<b>${username}</b> оформил подписку<br><small>${message}</small>`, 'info');
});
client.on('subgift', (channel, username, streakMonths, recepient, methods, userstate) => {
  alert.add(`<b>${username}</b> подарил подписку <u>${recepient}</u>`, 'info');
});
client.on('raided', (channel, username, viewers) => {
  alert.add(`<b>${username}</b> зарейдил канал на <b>${viewers}</b> зрителей`, 'info');
});
client.on('follow', (channel, tags, message, self) => {
  alert.add(tags, message, self);
});
client.on('whisper', (channel, tags, message, self) => {
  chat.add(tags, message, self);
});
