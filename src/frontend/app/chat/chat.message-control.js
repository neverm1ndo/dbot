export class MessageControlButton extends HTMLButtonElement {
  constructor(type, cb) {
    super();
    this.type = 'button';
    this.classList.add('btn', type);
    this.addEventListener('click', cb);
  }
}
