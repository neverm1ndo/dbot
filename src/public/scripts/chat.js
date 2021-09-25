const user = {
  username: document.querySelector('#chatjs').dataset.username,
  display_name: document.querySelector('#chatjs').dataset.displayname,
  token: document.querySelector('#chatjs').dataset.token,
  id: document.querySelector('#chatjs').dataset.id,
  client: document.querySelector('#chatjs').dataset.client
};

const channelSets = {
  badges: [],
  lurkers: [],
  id: user.id
}

const tag = document.createElement('script');
tag.src = 'https://www.youtube.com/player_api';
const firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


//** Define custom HTML elements **//

customElements.define('twitch-badge', ChatMessageBadge, { extends: 'div' });
customElements.define('chat-message', ChatMessage, { extends: 'div' });
customElements.define('chat-alert', ChatAlert, { extends: 'div' });
customElements.define('yt-player', YTFrame, { extends: 'div' });
customElements.define('control-button', MessageControlButton, { extends: 'button' });

//*******************************//

const parser = new DOMParser();
const chat = new ChatController('#chat');
const chatterList = new ChattersListController();
const params = new URLSearchParams(window.location.search);
// const bttv = new BTTV();
//
// bttv.getEmotes();
// if (params.has('channel')) {
  Http.get(`https://api.twitch.tv/helix/users?login=${params.has('channel')?params.get('channel'):user.username}`, {
    'Authorization': 'Bearer ' + user.token,
    'Client-ID': user.client
  }).then((data) => {
    channelSets.id = data.data[0].id;
    return Promise.all([
      Http.get(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${channelSets.id}`, {
        'Authorization': 'Bearer ' + user.token,
        'Client-ID': user.client
      }),
      // Http.get('/controls/chat/lurkers'),
      // Http.get('https://api.twitch.tv/helix/streams'),
      Http.get(`/controls/chat/last?channel=${params.has('channel')?params.get('channel'):user.username}`),
    ])
  }).then(([badges, lastMessages]) => {
    channelSets.badges = badges.data;
    // channelSets.lurkers = [...channelSets.lurkers, ...lurkers];
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
client.on('ban', (channel, username, reason) => {
  chat.alert(`<b>${username}</b> забанен ${reason?': ' + reason:''}`, 'warning');
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
client.on("emotesets", (sets, obj) => {
    sets.split(',').forEach((id) => {
      chat.getEmoteSet(id);
    })
});
