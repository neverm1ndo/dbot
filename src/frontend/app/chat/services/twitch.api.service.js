import Http from '@shared/http'
import { User } from '@chat/chat.user';

export class TwitchApiService {

  _user = new User();

  _API_URL = 'https://api.twitch.tv/helix';

  constructor() {
    this._headers = {
      'Authorization': 'Bearer ' + this._user.token,
      'Client-ID': this._user.client
    };
  }

  set accessToken(token) {
    this._user.token = token;
  }

  get user() {
    return this._user;
  }

  set user(user) {
    this._user = user;
  }

  getChannelName() {
    const params = new URLSearchParams(window.location.search);
    return params.has('channel')?params.get('channel'):this._user.username;
  }

  getEmoteSets(id) {
    return Http.get(`${this._API_URL}/chat/emotes/set?emote_set_id=${id.join('&emote_set_id=')}`, this._headers);
  }

  getUsers(ids) {
    return Http.get(`${this._API_URL}/users?id=${[...ids].join('&id=')}`, this._headers);
  }

  getUser(login) {
    return Http.get(`${this._API_URL}/users?login=${login}`, this._headers);
  }

  getStreams(id) {
    return Http.get(`${this._API_URL}/streams?user_id=${id}`, this._headers);
  }

  getChannelBadges(id) {
    return Http.get(`${this._API_URL}/chat/badges?broadcaster_id=${id}`, this._headers);
  }

  getGlobalBadges() {
    return Http.get(`${this._API_URL}/chat/badges/global`, this._headers);
  }

  getClips(slug) {
    return Http.get(`${this._API_URL}/clips?id=${slug}`, this._headers);
  }

  static createMarker(description = `Highlight ${Date.now()}`) {
    return Http.post(`${this._API_URL}/streams/markers`,
    {
      user_id: this._user.id,
      description
    }, Object.assign(this._headers, {
      'Content-Type': 'application/json',
    }));
  }
}
