import Http from '@shared/http';

export class OmdApiService {
  refreshSession() {
    return Http.get('/controls/chat/refresh-session');
  }
  getLastMessages(channel) {
    return Http.get(`/controls/chat/last?channel=${channel}`);
  }
  getBttvEmotes(channel) {
    return Http.get(`/controls/chat/emotes?channel=${channel}`);
  }
}
