export class Popout extends HTMLElement {
  constructor() {
    super();
  }
  close() {
    this.remove();
  }
  open(callback) {
    if (callback) callback();
  }
}
