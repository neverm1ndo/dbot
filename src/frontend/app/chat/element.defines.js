import { ChatMessageBadge } from './chat.badge';
import { ChatMessage } from './chat.message';
import { ChatAlert } from './chat.alert';
import { YTFrame } from './chat.ytframe';
import { MessageControlButton } from './chat.message-control';

//** Define custom HTML elements **//

customElements.define('twitch-badge', ChatMessageBadge, { extends: 'div' });
customElements.define('chat-message', ChatMessage, { extends: 'div' });
customElements.define('chat-alert', ChatAlert, { extends: 'div' });
customElements.define('yt-player', YTFrame, { extends: 'div' });
customElements.define('control-button', MessageControlButton, { extends: 'button' });

//*******************************//
