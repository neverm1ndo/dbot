import Http from '@shared/http';
import { User } from './chat.user';
import { ChatMessage } from './chat.message';
import { ChatAlert } from './chat.alert';
import { Marker } from './marker';
import { secondsToTimestamp, timestamp } from './utils';
import { bttv, chatterList, params, client } from './chat';
import TTVClip from './ttv.clips.embed';
import Collapse from 'bootstrap/js/dist/collapse';
import Tooltip from 'bootstrap/js/dist/tooltip';

/**
* В целом код читается очень тяжело. Особенно вермишель из нагромождений запросов к DOM в конструкторах классов;
*/

export class ChatController {
  constructor(selector) {

  }

}
