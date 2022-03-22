import { timestamp, haveLinks, linkify } from './utils';
import { YTFrame } from './chat.ytframe';
import { ChatAlert } from './chat.alert';
import { ChatMessageBadge } from './chat.badge';
import { MessageControlButton } from './chat.message-control';
import TTVClip from './ttv.clips.embed';
import HEX from '@shared/hex';
import Http from '@shared/http';
import Cookies from '@shared/cookies';


export class ChatMessage extends HTMLDivElement {
  constructor(channel, displayName, tags, message, self, date, chat) {
    super();
    let separator = ': ';
    const color = tags.color?new HEX(tags.color):new HEX('FFFFFF');
    this.body     = document.createElement('div'); // Запихнуть бы все эти переменные в один обжект
    this.nickname = document.createElement('span');
    this.message  = document.createElement('span');
    this.message.classList.add('card-body-msg');
    this.tags = tags;
    this.nickname.classList.add('nickname');
    this.nickname.innerHTML = tags['display-name'];
    this.nickname.style.color = color < 0x505050?color.brightness(70).contrast(30).toString():color.toString();
    if (tags['message-type'] === "action") {
      this.body.style.color = this.nickname.style.color;
      separator = ''; // Обязательные манипуляции???
    };
    this.classList.add('card');
    this.body.classList.add('card-body');
    this.body.dataset.date = timestamp(date);
    if (separator) this.body.innerHTML = separator;
    this.message.innerHTML = this.pretty(channel, chat.user.display_name, tags, message, chat.bttv); // innerHTML!
    this.addTooltipsToEmotes();
    this.body.prepend(this.nickname);
    if (tags.badges) {
      const container = document.createElement('span');
      const badges = Object.entries(tags.badges);
      if (tags.username === 'diktorbot') badges.push(['diktorbot', '1']);
      for (let i = 0; i < badges.length; i++) {
        container.append(new ChatMessageBadge(badges[i], chat.settings));
      }
      this.body.prepend(container);
    }
    if (tags['first-msg'] == true) {
      const firstMsgBadge = document.createElement('span');
      firstMsgBadge.classList.add('first-msg');
      firstMsgBadge.innerText = 'Первое сообщение от';
      this.body.classList.add('first-msg-card');
      this.body.prepend(firstMsgBadge, document.createElement('br'));
    }
    if (tags['msg-id'] == "highlighted-message") {
      this.message.classList.add("highlighted-message");
    }
    if (message.startsWith('!')) {
      const botCommand = document.createElement('span');
            botCommand.innerText = 'Команда бота';
            botCommand.classList.add('bot-command');
      this.message.prepend(botCommand);
    }
    this.body.append(this.message);
    if (!self && (tags.username !== chat.user.username)) {
      const controls = document.createElement('span');
      controls.prepend(new MessageControlButton(['bi', 'bi-slash-circle', 'red'], () => {
        chat.client.ban(channel, tags.username);
      }));
      controls.prepend(new MessageControlButton(['bi', 'bi-clock', 'yellow'], () => {
        chat.client.timeout(channel, tags.username, 600, 'rediska');
      }));
      this.body.prepend(controls);
    }
    this.append(this.body);
    if (haveLinks(message)) {
      const links = haveLinks(message);
      if (YTFrame.getVideoID(links[0])) {
        this.body.appendChild(new YTFrame(links[0]));
        return;
      }
      const ttvClipSlug = TTVClip.getSlug(links[0]);
      if (ttvClipSlug) {
        Http.get('https://api.twitch.tv/helix/clips?id=' + ttvClipSlug,
        {
          'Authorization': 'Bearer ' + chat.user.token,
          'Client-ID': chat.user.client
        })
        .then(data => {
          const clip = data.data[0];
          [...this.body.getElementsByTagName('a')].map((link) => { link.remove(); });
          if (clip) {
            this.body.append(new TTVClip(clip, 100, 100).valueOf());
          } else {
            this.body.append(TTVClip.notLikeThis('Клипа не существует'))
          }
        })
        return;
      }
    }
  }

  /**
  * Слишком много циклов
  */
  pretty(channel, displayName, tags, message, bttv) {
    let notice = message.includes('@')?'@' + displayName: displayName;
    let splited = message.split(/\s/);
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
      let word = splited[i];
      position+= word.length + 1;
      if (haveLinks(word)) {
        result.push(linkify(word));
        continue;
      }
      if (word.toLowerCase() === displayName.toLowerCase() || word.toLowerCase() ==='@' + displayName.toLowerCase()) {
        result.push(`<span class="notice">${notice}</span>`);
        this.classList.add('card-notice')
        continue;
      }
      for (let k = 0; k < bttv.globalEmotes.length; k++) {
        if (bttv.globalEmotes[k].code !== word) continue;
        emoted = true;
        result.push('<img data-bs-toggle="tooltip" alt="'+ word +'" title="'+ word +'" class="emoticon" src="https://cdn.betterttv.net/emote/'+ bttv.globalEmotes[k].id +'/1x">')
        break;
      }
      if (emoted) continue;
      for (let k = 0; k < bttv.bttvEmotes.length; k++) {
        if (bttv.bttvEmotes[k].code !== word) continue;
        emoted = true;
        result.push('<img data-bs-toggle="tooltip" alt="'+ word +'" title="'+ word +'" class="emoticon" src="https://cdn.betterttv.net/emote/'+ bttv.bttvEmotes[k].id +'/1x">')
        break;
      }
      if (emoted) continue;
      for (let j = 0; j < emotes.length; j++ ) {
        const emote = emotes[j];
        if (position !== emote[1] + emote[2] + 1) continue;
        emoted = true;
        result.push('<img data-bs-toggle="tooltip" alt="'+ word +'" title="'+ word +'" class="emoticon" src="https://static-cdn.jtvnw.net/emoticons/v2/' + emote[0] + '/default/dark/3.0">');
        break;
      }
      if (emoted) continue;
      result.push(word);
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
