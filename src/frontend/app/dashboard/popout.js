import template from 'pug-loader!./popout.tpl.pug';

export class Popout extends HTMLElement {
  constructor(options) {
    super();
    this.innerHTML = template({
      title: options.title,
      subtitles: options.subtitles,
      icon: options.icon
    });
    this.body = this.querySelector('.main');
    const closeBtn  = this.querySelector('.btn-close');
    closeBtn.addEventListener('click', () => {
      this.close();
    });
  }
  close() {
    this.remove();
  }
  open(callback) {
    if (callback) callback();
  }
}
