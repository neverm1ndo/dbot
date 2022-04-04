import template from 'pug-loader!./message.tpl.pug';
import { timestamp, haveLinks, linkify } from '@chat/utils';
import { YTFrame } from '@chat/chat.ytframe';
import { ChatMessageBadge } from '@chat/chat.badge';
import { MessageControlButton } from '@chat/message/chat.message-control';
import TTVClip from '@chat/ttv.clips.embed';
import HEX from '@shared/hex';
import { twitchApiService, bttv, client } from '@chat/chat';


export class ChatMessage extends HTMLElement {
  constructor(channel, displayName, tags, message, self, date, channelBadges) {
    super();
    const color = tags.color?new HEX(tags.color):new HEX('FFFFFF');
    this.tags = tags;
    this.innerHTML = template({
      firstMsg: tags['first-msg'] == true,
      timestamp: timestamp(date),
      highlightedMessage: tags['highlighted-message'],
      botCommand: message.startsWith('!'),
      nickname: tags['display-name'],
      separator: tags['message-type'] === "action" ? undefined : ': ',
      message: this.pretty(channel, twitchApiService.user.display_name, tags, message),
    });
    this.body     = this.querySelector('.card-body');
    this.nickname = this.querySelector('.nickname');
    this.nickname.style.color = color < 0x505050?color.brightness(70).contrast(30).toString():color.toString();
    if (tags.badges) {
      const container = document.createElement('span');
      const badges = Object.entries(tags.badges);
      if (tags.username === 'diktorbot') badges.push(['diktorbot', '1']);
      for (let i = 0; i < badges.length; i++) {
        container.append(new ChatMessageBadge(badges[i], channelBadges));
      }
      this.body.prepend(container);
    }
    if (!self && (tags.username !== twitchApiService.user.username)) {
      const controls = document.createElement('span');
      controls.prepend(new MessageControlButton(['bi', 'bi-slash-circle', 'red'], () => {
        client.ban(channel, tags.username);
      }));
      controls.prepend(new MessageControlButton(['bi', 'bi-clock', 'yellow'], () => {
        client.timeout(channel,  tags.username);
      }));
      this.body.prepend(controls);
    }
    if (!haveLinks(message)) return;
    const links = haveLinks(message);
    if (YTFrame.getVideoID(links[0])) {
      this.body.appendChild(new YTFrame(links[0]));
      return;
    }
    const ttvClipSlug = TTVClip.getSlug(links[0]);
    if (!ttvClipSlug) return;
      twitchApiService.getClips(ttvClipSlug).then(data => {
      const clip = data.data[0];
      [...this.body.getElementsByTagName('a')].map((link) => { link.remove(); });
      if (clip) {
        this.body.append(new TTVClip(clip, 100, 100).valueOf());
      } else {
        this.body.append(TTVClip.notLikeThis('Клипа не существует'))
      }
    });
  }

  /**
  * Слишком много циклов
  */
  pretty(channel, displayName, tags, message) {
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
}
