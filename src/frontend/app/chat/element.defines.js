import { ChatMessageBadge } from '@chat/chat.badge';
import { ChatMessage } from '@chat/message/chat.message';
import { ChatAlert } from '@chat/alert/chat.alert';
import { YTFrame } from '@chat/chat.ytframe';
import { MessageControlButton } from '@chat/message/chat.message-control';

//** Define custom HTML elements **//

customElements.define('twitch-badge', ChatMessageBadge, { extends: 'div' });
customElements.define('chat-message', ChatMessage, { extends: 'div' });
customElements.define('chat-alert', ChatAlert, { extends: 'div' });
customElements.define('yt-player', YTFrame, { extends: 'div' });
customElements.define('control-button', MessageControlButton, { extends: 'button' });

//*******************************//
