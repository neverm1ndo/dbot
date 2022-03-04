import Http from '@shared/http';

export class Marker {
  static create(user, description = '') {
    return Http.post('https://api.twitch.tv/helix/streams/markers',
    {
      user_id: user.id,
      description
    }, {
      'Authorization': 'Bearer ' + user.token,
      'Client-ID': user.client,
      'Content-Type': 'application/json',
    })
  }
}
