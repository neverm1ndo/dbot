import { chat } from './chat';

const defaultBadges = {
  'diktorbot': '/assets/tank2.png',
};

export class ChatMessageBadge extends HTMLDivElement {
  constructor(type, badges) {
    super();
    this.classList.add('badge-icon');
    this.icon = new Image(20, 20);
    this.icon.classList.add('badge-icon-img');
    for (let i = 0; i < chat.settings.badges.length; i++) {
      if (type[0] === chat.settings.badges[i].set_id) {
        for (let j = 0; j < chat.settings.badges[i].versions.length; j++) {
          if (type[1] === chat.settings.badges[i].versions[j].id) {
              this.icon.src = chat.settings.badges[i].versions[j].image_url_2x;
              break;
          };
        };
        break;
      };
    };
    if (!this.icon.src) {
      const defaultBadgesKeys = Object.keys(defaultBadges);
      for (let i = 0; i < defaultBadgesKeys.length; i++ ) {
        if (type[0] === defaultBadgesKeys[i]) {
          this.icon.src = defaultBadges[defaultBadgesKeys[i]];
          break;
        }
      }
    }
    if (!this.icon.src) delete this.icon;
    if (this.icon) {
      this.append(this.icon);
    }
  }
}
