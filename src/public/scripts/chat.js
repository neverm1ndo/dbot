const user = { username: document.querySelector('#chatjs').dataset.username, token: document.querySelector('#chatjs').dataset.token};

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
class ChatMessage extends HTMLDivElement {
  constructor(tags, message) {
    super();
    const body = document.createElement('div');
    const nickname = document.createElement('span');
    nickname.classList.add('nickname');
    nickname.innerHTML = tags.username;
    nickname.style.color = tags.color
    this.classList.add('card');
    body.classList.add('card-body');
    body.dataset.date = (this.timestamp(Date.now()));
    if (message.includes(user.username)) message = message.replace(user.username, '<span class="notice">' + user.username + '</span>')
    body.innerHTML = message;
    body.prepend(nickname);
    if (tags.badges) {
      const badges = Object.keys(tags.badges);
      if (tags.username === 'diktorbot') badges.push('diktorbot');
      for (let i = 0; i < badges.length; i+=1) {
        body.prepend(new ChatMessageBadge(badges[i]));
      }
    }
    this.append(body);
  }

  timestamp (unix) {
    const  date = new Date(unix);
    let hours = date.getHours();
    let minutes = "0" + date.getMinutes();
    let seconds = "0" + date.getSeconds();
    return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
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
      console.log('dd');
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
    this.text = document.querySelector('#text');
    this.submit = document.querySelector('#send');

    this.submit.addEventListener('click', () => {
      if (this.connected) this.send();
    });
    this.text.addEventListener('keydown', (event) => {
      if (event.code === 'Enter') this.send();
    })
  }
  add(tags, message) {
    this.chat.append(new ChatMessage(tags, message));
  }
  alert(message, type) {
    this.chat.append(new ChatAlert(message, type));
  }
  send() {
    client.say(user.username, this.text.value);
    this.text.value = '';
  }
}

customElements.define('twitch-badge', ChatMessageBadge, { extends: 'div' });
customElements.define('chat-message', ChatMessage, { extends: 'div' });
customElements.define('chat-alert', ChatAlert, { extends: 'div' });


const chat = new ChatController('#chat');
const chatterList = new ChattersListController();

const counter = document.querySelector('#chatters-counter');

const client = new tmi.Client({
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

const connected = [];

async function getLurkers() {
  const res = await fetch(`/controls/chat/lurkers`)
    if (res.ok) {
     return await res.json();
  } else {
    alert.error(`Ошибка HTTP: ${this.res.status}`);
  }
};

let lurkers;
getLurkers().then(data => { lurkers = data });

client.on('join', (channel, username, self) => {
  if (self || connected.includes(username) || lurkers.includes(username)) return;
  connected.push(username);
  counter.innerHTML = connected.length;
  chat.alert(`<b>${username}</b> подключился к чату`, 'success');
});
client.on('ban', (channel, username, reason) => {
  chat.alert(`<b>${username}</b> забанен ${reason}`, 'warning');
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
  chat.add(tags, message);
});
