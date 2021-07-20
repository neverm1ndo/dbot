import axios from 'axios';

const TWITCH_EVENTS_STREAMS = 'https://api.twitch.tv/helix/eventsub/streams';
const TWITCH_APP_TOKEN = 'https://id.twitch.tv/oauth2/token';

export class Twitch {
  static streamChanges(type: 'stream.online' | 'stream.offline', id: number, accessToken: string) {
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
            broadcaster_user_id: id
        },
        transport: {
            method: "webhook",
            callback: "https://apps.nmnd.ru/webhooks/callback/streams",
            secret: process.env.SESSION_SECRET
        }
      }
    });
  }
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
}
