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
    this.body.innerHTML = this.pretty(tags, message);
    this.body.prepend(nickname);
    if (tags.badges) {
      const badges = Object.keys(tags.badges);
      if (tags.username === 'diktorbot') badges.push('diktorbot');
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
    if (this.links) {
      if (!YTFrame.getVideoID(this.links[0])) return;
      this.body.appendChild(new YTFrame(this.links[0]));
    }
  }

  pretty(tags, message) {
    let notice = message.includes('@')?'@' + user.username: user.username;
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
    for (let i = 0; i < splited.length; i++) {
      let emoted = false;
      position+= splited[i].length + 1;
      if (this.haveLinks(splited[i])) {
        result.push(this.linkify(splited[i]));
        continue;
      }
      if (splited[i] === user.username || splited[i] ==='@' + user.username) {
        result.push(`<span class="notice">${notice}</span>`);
        continue;
      }
      for (let j = 0; j < emotes.length; j++ ) {
        if (position === emotes[j][1] + emotes[j][2] + 1) {
          emoted = true;
            result.push('<img class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v2/' + emotes[j][0] + '/default/dark/3.0">');
            break;
        }
      }
      if (emoted) continue;
      result.push(splited[i]);
    }
    return result.join(' ');
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
    var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    var replacedText = text.replace(replacePattern1, '<a href="$1">$1</a>');
    var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2">$2</a>');
    var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
    var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
    return replacedText;
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
        connected.splice(connected.indexOf(username), 1);
        counter.innerHTML = connected.length;
        this.innerHTML = '<em>(<b>' + username + '</b> добавлен в черный список)</em>';
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
    this.text.addEventListener('input', (event) => {
      if (this.text.value === '') {
        this.selfEmotes = {};
      }
    });
    if (!window.localStorage.getItem('lastEmotes')) {
      window.localStorage.setItem('lastEmotes', JSON.stringify([]));
    }
    this.addEmotes(JSON.parse(window.localStorage.getItem('lastEmotes')), 'last used');
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
      // let last = JSON.parse(window.localStorage.getItem('lastEmotes'));
      // last.push({id: event.target.dataset.id, name: event.target.dataset.name, format: 'default'});
      // window.localStorage.setItem('lastEmotes', JSON.stringify([...new Set(last)]));
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
