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
      case 'vip':
        this.icon.src = '/img/vip.png';
        break;
      case 'verified':
        this.icon.src = '/img/vf.png';
        break;
      default:
        break;
    }
    this.append(this.icon);
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
    const badges = Object.keys(tags.badges);
    if (tags.username === 'diktorbot') badges.push('diktorbot');
    for (let i = 0; i < badges.length; i+=1) {
      body.prepend(new ChatMessageBadge(badges[i]));
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
    if (type === 'default') this.classList.add('text-muted');
    if (type === 'success') this.classList.add('bg-success', 'text-light');
    if (type === 'danger') this.classList.add('bg-danger', 'text-light');
    this.innerHTML = message;
    this.append(body);
  }
}

class ChatController {
  constructor(selector) {
    this.chat = document.querySelector(selector);
    this.text = document.querySelector('#text');
    this.submit = document.querySelector('#send');
    this.submit.addEventListener('click', () => {
      this.send();
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
  chat.alert(`<b>${username}</b> подключился к чату`, 'success');
});
client.on('part', (channel, username, self) => {
  if (self || lurkers.includes(username)) return;
  setTimeout(() => {
    connected.pop(username);
  }, 900000);
  chat.alert(`<b>${username}</b> отключился`, 'danger');
});

client.on('message', (channel, tags, message, self) => {
  chat.add(tags, message);
})
