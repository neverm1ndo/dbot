import axios from 'axios';

const TWITCH_EVENTS_STREAMS = 'https://api.twitch.tv/helix/eventsub/streams';

export class Twitch {
  static streamChanges(id: number, accessToken: string) {
    axios({
      method: 'post',
      url: TWITCH_EVENTS_STREAMS,
      headers: {
        'Client-ID': process.env.TWITCH_CLIENT_ID,
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'application/json'
      },
      data: {
        type: 'stream.online',
        version: "1",
        condition: {
            broadcaster_user_id: id
        },
        transport: {
            method: "webhook",
            callback: "https://apps.nmnd.ru/webhooks/callback",
            secret: process.env.SESSION_SECRET
        }
      }
    });
  }
}
