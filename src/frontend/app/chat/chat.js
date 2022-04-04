import '@app/polyfills';
import tmi from 'tmi.js';

import { ChatComponent } from '@chat/chat.component';
import { SpeakerComponent } from '@app/speaker/speaker.component';
import { ChattersListComponent } from '@chat/chatters-list/chatters-list.component';
import { ChatMessageBadge } from '@chat/chat.badge';
import { ChatMessage } from '@chat/message/chat.message';
import { ChatAlert } from '@chat/alert/chat.alert';
import { YTFrame } from '@chat/chat.ytframe';
import { MessageControlButton } from '@chat/message/chat.message-control';

import { TwitchApiService } from '@chat/services/twitch.api.service';
import { PubSubService } from '@chat/services/pubsub.service';
import { SocketService } from '@chat/services/socket.service';
import { OmdApiService } from '@chat/services/omd.api.service';
import BTTVService from '@chat/services/bttv.service';


/**
* Application services
*/
export const twitchApiService = new TwitchApiService();
export const pubsubService    = new PubSubService();
export const socketService    = new SocketService();
export const omdApiService    = new OmdApiService();
export const bttv             = new BTTVService();

/**
* Tmi client
*/
export const client = new tmi.Client({
   options: {
     debug: true,
     messagesLogLevel: "info",
     clientId: twitchApiService.user.client,
     skipUpdatingEmotesets: true
   },
   connection: { reconnect: true, secure: true },
   identity: {
     username: twitchApiService.user.username,
     password: 'oauth:' + twitchApiService.user.token
   },
   channels: [twitchApiService.getChannelName()]
});


/**
* Application componets
*/
const components = {
  'omd-chat'          : ChatComponent,
  'omd-alert'         : ChatAlert,
  'omd-chatters-list' : ChattersListComponent,
  'omd-chat-badge'    : ChatMessageBadge,
  'omd-chat-message'  : ChatMessage,
  'omd-control-button': MessageControlButton,
  'omd-speaker'       : SpeakerComponent,
  'yt-player'         : YTFrame,
};
/**
* Define application componets
*/
Object.entries(components).forEach((entry) => {
  customElements.define(entry[0], entry[1]);
});
