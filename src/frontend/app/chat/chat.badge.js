const defaultBadges = {
  'diktorbot': '/assets/tank2.png',
};

export class ChatMessageBadge extends HTMLDivElement {
  constructor(type, settings) {
    super();
    this.classList.add('badge-icon');
    this.icon = new Image(20, 20);
    this.icon.classList.add('badge-icon-img');
    for (let i = 0; i < settings.badges.length; i++) {
      const badge = settings.badges[i];
      if (type[0] !== badge.set_id) continue;
      for (let j = 0; j < badge.versions.length; j++) {
        const version = badge.versions[j];
        if (type[1] !== version.id) continue;
        this.icon.src = version.image_url_2x;
        break;
      }
    }
    if (!this.icon.src) {
      const defaultBadgesKeys = Object.keys(defaultBadges);
      for (let i = 0; i < defaultBadgesKeys.length; i++ ) {
        if (type[0] !== defaultBadgesKeys[i]) continue;
        this.icon.src = defaultBadges[defaultBadgesKeys[i]];
        break;
      }
    }
    if (!this.icon.src) delete this.icon;
    if (this.icon) {
      this.append(this.icon);
    }
  }
}
