import { ChatController } from './chat.controller';
import { ChattersListController } from './chatter-list.controller';
import BTTV from './bttv';
import PubSub from './pubsub';
import Http from '@shared/http';
import tmi from 'tmi.js';

/**
* Add YouTube embed player API
*/
const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/player_api';

const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

const parser = new DOMParser();
export const chat = new ChatController('#chat');
export const chatterList = new ChattersListController();
export const params = new URLSearchParams(window.location.search);
export const bttv = new BTTV(params);
             bttv.getEmotes();
const pubsub = new PubSub();

const alerts = [];

function handleStreamInfo(id) {
  let interval = setInterval(() => {
    if (chat.live) {
      Http.get(`https://api.twitch.tv/helix/streams?user_id=${id}`, {
        'Authorization': 'Bearer ' + chat.user.token,
        'Client-ID': chat.user.client
      }).then((data) => {
        const streamInfo = data.data[0];
        if (streamInfo) {
          chat.stream = streamInfo;
          chatterList.dom.counter.innerHTML = streamInfo.viewer_count;
        } else {
          chatterList.dom.counter.innerHTML = 0;
        }
      })
    }
  }, 120000);
}
Http.get(`https://api.twitch.tv/helix/users?login=${params.has('channel')?params.get('channel'):chat.user.username}`, {
  'Authorization': 'Bearer ' + chat.user.token,
  'Client-ID': chat.user.client
}).then((data) => {
  chat.settings.id = data.data[0].id;
  pubsub.connect(chat.settings.id);
  handleStreamInfo(chat.settings.id);
  return Promise.all([
    Http.get(`https://api.twitch.tv/helix/chat/badges?broadcaster_id=${chat.settings.id}`, {
      'Authorization': 'Bearer ' + chat.user.token,
      'Client-ID': chat.user.client
    }),
    Http.get(`https://api.twitch.tv/helix/chat/badges/global`, {
      'Authorization': 'Bearer ' + chat.user.token,
      'Client-ID': chat.user.client
    }),
    Http.get(`/controls/chat/last?channel=${params.has('channel')?params.get('channel'):chat.user.username}`),
  ])
}).then(([badges, global, lastMessages]) => {
  chat.settings.badges = [...badges.data, ...global.data];
  lastMessages.forEach((message) => {
    chat.add(message.tags, message.message, message.self, message.date);
  });
}).catch((err) => console.error(err));

/**
* Set lurkers IIFE
*/
(() => {
  const storage = window.localStorage.getItem('lurkers');
  if (storage) {
    const lurkers = JSON.parse(storage);
    chat.settings.lurkers = [...new Set(...[lurkers, chat.settings.lurkers])];
    lurkers.forEach((lurker, index, arr) => {
      if (Array.isArray(lurker)) {
        chat.settings.lurkers.splice(index, 1);
      }
    })
    window.localStorage.setItem('lurkers', JSON.stringify(chat.settings.lurkers));
  }
})();

let trigger = 0; // ???
export const client = new tmi.Client({
  options: {
    debug: true,
    messagesLogLevel: "info",
    clientId: chat.user.client,
    skipUpdatingEmotesets: true
  },
  connection: { reconnect: true, secure: true },
  identity: {
    username: chat.user.username,
    password: 'oauth:' + chat.user.token
  },
  channels: [params.has('channel')?params.get('channel'):chat.user.username]
});

client.connect();

const CDC_VIEWER_LIM = 35;

/**
* Set user badge
*/
(function() {
  const label = document.querySelector('.chatty-label');
  const img = new Image();
  img.src = '/assets/cm.png';
  if (!params.has('channel')) {
    img.src = '/assets/bc.png';
  }
  label.append(img);
})();

client.on('connected', (channel, self) => {
  chat.alert('Добро пожаловать в чат!');
  chat.connected = true;
  chat.submit.disabled = false;
  chat.text.disabled = false;
});
client.on('disconnected', (channel, self) => {
  chat.alert('Вы отсоединенны от чата', 'siren');
  chat.connected = false;
  chat.submit.disabled = true;
  chat.text.disabled = true;
});
client.on('join', (channel, username, self) => {
  if (self || chatterList.connected.includes(username) || chat.settings.lurkers.includes(username)) return;
  chatterList.add(username);
  if (chat.stream) {
    if (chat.stream.viewer_count <= CDC_VIEWER_LIM) {
      chat.alert(`<b>${username}</b> подключился`, 'connect', username);
    }
  }
});
client.on('ban', (channel, username, reason, userstate) => {
  // Replaced with PubSub event handler
  chat.pseudoDelete(username);
});
client.on('timeout', (channel, username, reason, duration, userstate) => {
  chat.alert(`<b>${username}</b> отстранен на ${duration} секунд ${reason?'по причине ' + reason:''}`, 'warning', '', ['bi', 'bi-clock']);
  chat.pseudoDelete(username);
});
client.on('part', (channel, username, self) => {
  if (self || chat.settings.lurkers.includes(username)) return;
  if (chat.stream) {
    if (chat.stream.viewer_count <= CDC_VIEWER_LIM) {
      setTimeout(() => {
        if (chatterList.connected.includes(username)) {
          chatterList.remove(username);
          chat.alert(`<b>${username}</b> отключился`, 'disconnect', username);
        }
      }, 180000);
    }
  }
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
  chat.alert(`<b>${username}</b> оформил подписку<br><small>${message}</small>`, 'twitch', '', ['bi', 'bi-twitch']);
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
  chat.alert(`<b>${username}</b> переоформил подписку<br><small>${message}</small>`, 'twitch', '', ['bi', 'bi-twitch']);
});
client.on('subgift', (channel, username, streakMonths, recepient, methods, userstate) => {
  chat.alert(`<b>${username}</b> подарил подписку <u>${recepient}</u>`, 'twitch', '', ['bi', 'bi-gift-fill']);
});
client.on('raided', (channel, username, viewers) => {
  chat.alert(`<b>${username}</b> зарейдил канал на <b>${viewers}</b> зрителей`, 'twitch', '', ['bi', 'bi-twitch']);
});
client.on('hosted', (channel, username, viewers, autohost) => {
  chat.alert(`<b>${username}</b> захостил канал на <b>${viewers}</b> зрителей`, 'twitch', '', ['bi', 'bi-twitch']);
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
  trigger++;
  if (trigger != 1) {
    chat.getEmoteSet(sets.split(','));
  }
});
