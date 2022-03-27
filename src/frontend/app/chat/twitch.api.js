import Http from '@shared/http'
import Cookies from '@shared/cookies';
import { User } from './chat.user';

export default class TwitchApi {

  static _API_URL = 'https://api.twitch.tv/helix';
  static _user = new User();
  static _headers = {
    'Authorization': 'Bearer ' + TwitchApi._user.token,
    'Client-ID': TwitchApi._user.client
  };

  static getEmoteSets(id) {
    return Http.get(`${TwitchApi._API_URL}/chat/emotes/set?emote_set_id=${id.join('&emote_set_id=')}`, TwitchApi._headers);
  }

  static getUsers(ids) {
    return Http.get(`${TwitchApi._API_URL}/users?id=${[...ids].join('&id=')}`, TwitchApi._headers);
  }

  static getUser(login) {
    return Http.get(`${TwitchApi._API_URL}/users?login=${login}`, TwitchApi._headers);
  }

  static getStreams(id) {
    return Http.get(`${TwitchApi._API_URL}/streams?user_id=${id}`, TwitchApi._headers);
  }

  static getChannelBadges(id) {
    return Http.get(`${TwitchApi._API_URL}/chat/badges?broadcaster_id=${id}`, TwitchApi._headers);
  }

  static getGlobalBadges() {
    return Http.get(`${TwitchApi._API_URL}/chat/badges/global`, TwitchApi._headers);
  }

  static getClips(slug) {
    return Http.get(`${TwitchApi._API_URL}/clips?id=${slug}`, TwitchApi._headers);
  }
}
