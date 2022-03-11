export class Popout extends HTMLElement {
  constructor() {
    super();
  }
  close() {
    this.classList.add('d-none');
  }
  open() {
    this.classList.remove('d-none');
    this.textarea.focus();
  }
}
