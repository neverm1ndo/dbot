import axios from 'axios';

const TWITCH_EVENTS_STREAMS = 'https://api.twitch.tv/helix/eventsub/subscriptions';
const TWITCH_APP_TOKEN = 'https://id.twitch.tv/oauth2/token';
const BTTV = 'https://api.betterttv.net/2/';

export class Twitch {
  /**
  (POST) Subscribe to stream events to get notifications
  * @param {string} type EventSub type
  * @param {number} id Twitch user id
  * @param {string} accessToken App access token
  **/
  static getBttvEmotes(url: string) {
    return axios({
      method: 'get',
      url: BTTV + url,
      headers: {
        Accept: 'application/json'
      }
    })
  }
  static streamChanges(type: 'stream.online' | 'stream.offline' | 'channel.follow', id: number, accessToken: string) {
    return axios({
      method: 'post',
      url: TWITCH_EVENTS_STREAMS,
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      data: {
        type: type,
        version: "1",
        condition: {
            broadcaster_user_id: id.toString()
        },
        transport: {
            method: "webhook",
            callback: process.env.TWITCH_EVENTSUB_CALLBACK_URL,
            secret: process.env.TWITCH_EVENTSUB_SECRET
        }
      }
    });
  }
  /**
  (DELETE) Delete subscription
  * @param {number} id Twitch user id
  * @param {string} accessToken App access token
  **/
  static deleteSub(id: string | number, accessToken: string) {
    return axios({
      method: 'delete',
      url: TWITCH_EVENTS_STREAMS,
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': 'Bearer ' + accessToken
      },
      params: {
        id: id
      }
    })
  }
  /**
  (GET) Get subscriptions list
  * @param {string} accessToken App access token
  **/
  static getSubs(accessToken: string) {
    return axios({
      method: 'get',
      url: TWITCH_EVENTS_STREAMS,
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': 'Bearer ' + accessToken
      }
    })
  }
  static validateToken(accessToken: string) {
    return axios({
      method: 'get',
      url: 'https://id.twitch.tv/oauth2/validate',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    })
  }
  /**
  (POST) Get applications access token
  **/
  static getAppAccessToken() {
    return axios({
      method: 'post',
      url: TWITCH_APP_TOKEN,
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'client_credentials'
      }
    })
  }
  static getClip(slug: string) {
    return axios({
      method: 'get',
      url: 'https://api.twitch.tv/kraken/clips/' + slug,
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
      }
    })
  }
}
