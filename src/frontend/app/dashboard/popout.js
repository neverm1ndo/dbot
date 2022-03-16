export class Popout extends HTMLElement {
  close() {
    this.remove();
  }
  open(callback) {
    if (callback) callback();
  }
}
