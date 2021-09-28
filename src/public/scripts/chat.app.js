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
class Cookies {
  static getCookie(name) {
    let matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }
}
class BTTV {
  bttvEmotes = {
    urlTemplate: 'https://cdn.betterttv.net/emote/{{id}}/{{image}}',
    scales: { 1: '1x', 2: '2x', 3: '3x' },
    bots: [], // Bots listed by BTTV for a channel { name: 'name', channel: 'channel' }
    emoteCodeList: [], // Just the BTTV emote codes
    emotes: [], // BTTV emotes
    subEmotesCodeList: [], // I don't have a restriction set for Night-sub-only emotes, but the data's here.
    allowEmotesAnyChannel: false // Allow all BTTV emotes that are loaded no matter the channel restriction
  };
  getEmotes() {
    Http.get('https://api.betterttv.net/2/emotes', {
       Accept: 'application/json',
     })
    .then((data) => {
      console.log('Got BTTV global emotes \n', data);
      this.bttvEmotes = this.bttvEmotes.emotes.concat(data.emotes.map(function(n) {
        n.global = true;
        return n;
      }));
      this.bttvEmotes.subEmotesCodeList = _.chain(this.bttvEmotes.emotes).where({ global: true }).reject(function(n) { return _.isNull(n.channel); }).pluck('code').value();
    }).catch((err) => console.error);
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
}
class ChatMessageBadge extends HTMLDivElement {
  constructor(type) {
    super();
    this.classList.add('badge-icon');
    this.icon = document.createElement('img');
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
class ChatMessage extends HTMLDivElement {
  constructor(tags, message, self, date) {
    super();
    let splitter = ': ';
    const color = tags.color?new HEX(tags.color):new HEX('FFFFFF');
    this.body = document.createElement('div');
    this.nickname = document.createElement('span');
    this.tags = tags;
    this.links = [];
    this.nickname.classList.add('nickname');
    this.nickname.innerHTML = tags['display-name'];
    this.nickname.style.color = color < 0x505050?color.brightness(70).contrast(30).toString():color.toString();
    if (tags['message-type'] === "action") {
      this.body.style.color = this.nickname.style.color;
      splitter = '';
    };
    this.classList.add('card');
    this.body.classList.add('card-body');
    this.body.dataset.date = (this.timestamp(date));
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
    if (this.links) { // FIXME: remove unnecessary variable (links), fix condition
      if (!YTFrame.getVideoID(this.links[0])) return;
      this.body.appendChild(new YTFrame(this.links[0]));
    }
    this.nickname.addEventListener('click', () => { // ??? Exprerimental (may cause perfomance violation)
      chat.text.value = chat.text.value + ' @' + tags.username + ' ';
      chat.text.focus();
    });
    delete this.links;
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
    for (let i = 0; i < splited.length; i++) {
      let emoted = false;
      position+= splited[i].length + 1;
      if (this.haveLinks(splited[i])) {
        result.push(this.linkify(splited[i]));
        continue;
      }
      if (splited[i].toLowerCase() === user.display_name.toLowerCase() || splited[i].toLowerCase() ==='@' + user.username.toLowerCase()) {
        result.push(`<span class="notice">${notice}</span>`);
        continue;
      }
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
      case 'ban':
        this.classList.add('bg-warning', 'text-light');
        break;
      case 'unban':
        this.classList.add('bg-warning', 'text-light');
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
        chatterList.remove(username);
        this.innerHTML = '<em>(<b>' + username + '</b> добавлен в черный список)</em>';
      }));
    }
    this.append(body);
  }
  static addLurker(username) {
    channelSets.lurkers.push(username);
    window.localStorage.setItem('lurkers', JSON.stringify([...new Set(channelSets.lurkers)]));
  }
}

class ChattersListController {
  constructor() {
    this.box = document.querySelector('#chatters-list');
    this.list = document.querySelector('#list');
    this.counter = document.querySelector('#chatters-counter');
    this.connected = [];
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
      for (let i = 0; i < this.connected.length; i++) {
        const li = document.createElement('li');
        li.innerHTML = this.connected[i];
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
        this.list.append(li);
      }
    });
  }
  remove(username) {
    this.connected.splice(this.connected.indexOf(username), 1);
    this.counter.innerHTML = this.connected.length;
  }
  add(username) {
    this.connected.push(username);
    this.counter.innerHTML = this.connected.length;
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
          new bootstrap.Tooltip(img, {
            boundary: this.emotes.parentNode
          });
          container.append(title, avatar?avatar:'', subcont);
          subcont.append(img);
        }
        this.emotes.append(container);
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
    client.say(params.has('channel')?params.get('channel'):user.username, this.text.value);
    this.text.value = '';
    this.selfEmotes = {};
  }
}
