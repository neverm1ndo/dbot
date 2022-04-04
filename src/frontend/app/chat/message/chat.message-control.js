export class MessageControlButton extends HTMLElement {
  constructor(type, cb) {
    super();
    this.type = 'button';
    this.classList.add('btn-control');
    this.icon = document.createElement('i');
    this.icon.classList.add(...type);
    this.append(this.icon);
    this.addEventListener('click', cb);
  }
}
