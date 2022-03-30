import Http from '@shared/http'

export default class TwitchApiService {

  _API_URL = 'https://api.twitch.tv/helix';

  constructor(user) {
    this._user = user;
    this._headers = {
      'Authorization': 'Bearer ' + this.user.token,
      'Client-ID': this.user.client
    };
  }

  set user(user) {
    this._user = user;
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
