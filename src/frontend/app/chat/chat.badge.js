const _defaultBadges = {
  'diktorbot': '/assets/tank2.png',
};

export class ChatMessageBadge extends HTMLElement {
  constructor(type, badges) {
    super();
    
    this.classList.add('badge-icon');
    this.icon = new Image(20, 20);
    this.icon.classList.add('badge-icon-img');
    
    for (const badge of badges) {
      if (type[0] !== badge.set_id) continue;
      
      for (const version of badge.versions) {
        if (type[1] !== version.id) continue;
        this.icon.src = version.image_url_2x;
        this.icon.title = version.id;
        break;
      }
    }
    
    if (!this.icon.src) {
      for (const badgeKey in _defaultBadges) {
        if (type[0] !== _defaultBadges[badgeKey]) continue;
        this.icon.src = _defaultBadges[badgeKey];
        this.icon.title = badgeKey;
        break;
      }
    }
    if (!this.icon.src) delete this.icon;
    if (this.icon) this.append(this.icon);
  }
}
