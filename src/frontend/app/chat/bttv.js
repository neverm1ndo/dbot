import Http from '@shared/http';
import Tooltip from 'bootstrap/js/dist/tooltip';
import _ from 'underscore';

class BTTV {
  bttvEmotes = {
    urlTemplate: 'https://cdn.betterttv.net/emote/{{id}}/{{image}}',
    scales: { 1: '1x', 2: '2x', 3: '3x' },
    bots: [],
    emoteCodeList: [],
    emotes: [],
    subEmotesCodeList: [],
    allowEmotesAnyChannel: false
  };
  globalEmotes = {
    emotes: []
  }
  constructor() {};
  getEmotes(channel, emotesContainer) {
    console.log('Getting BTTV emotes');
    Http.get(`/controls/chat/emotes?channel=${channel}`)
    .then((data) => {
      console.log('Got BTTV global emotes');
      this.bttvEmotes = this.bttvEmotes.emotes.concat(data.channel.emotes.map(function(n) {
        n.global = true;
        return n;
      }));
      this.globalEmotes = this.globalEmotes.emotes.concat(data.global.emotes.map(function(n) {
        n.global = true;
        return n;
      }));
      this.bttvEmotes.subEmotesCodeList = _.chain(this.bttvEmotes.emotes).where({ global: true }).reject(function(n) { return _.isNull(n.channel); }).pluck('code').value();
    }).catch((err) => console.error)
    .then(() => {
      this.addEmotes(this.bttvEmotes, channel, emotesContainer);
      this.addEmotes(this.globalEmotes, 'Global', emotesContainer);
    })
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
  addEmotes(emotes, titleof, emotesContainer) {
    const container = document.createElement('div');
    const subcont   = document.createElement('div');
    const title     = document.createElement('b');
    title.innerText = 'BTTV ' + titleof;
    for (let i = 0; i < emotes.length; i++) {
      const img = document.createElement('img');
      img.title = emotes[i].code;
      img.classList.add('emote');
      img.setAttribute('data-bs-toggle', 'tooltip');
      img.setAttribute('data-bs-placement', 'top');
      img.src = `https://cdn.betterttv.net/emote/${emotes[i].id}/1x`;
      img.dataset.name = emotes[i].code;
      img.dataset.id = emotes[i].id;
      new Tooltip(img, {
        boundary: emotesContainer.parentNode
      });
      subcont.append(img);
    }
    container.append(title, subcont);
    emotesContainer.append(container, document.createElement('hr'));
  }
}

export default BTTV;
