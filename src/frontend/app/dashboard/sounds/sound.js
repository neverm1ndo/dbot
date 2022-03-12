import template from 'pug-loader!./sound.tpl.pug';

export class SoundComponent extends HTMLElement {
  editBtn;
  deleteBtn;
  constructor(name) {
    super();
    this.editForm = document.createElement('div');
    this.value = name;
    this.render();
  }
  edit() {
  }
  save() {
  }
  render() {
    this.innerHTML = template({ name: this.value });
    this.editBtn = this.querySelector('#edit');
    this.deleteBtn = this.querySelector('#delete');
    this.editBtn.addEventListener('click', () => {
      this.edit();
    });
    this.deleteBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('delete', this));
      this.delete();
    });
  }
  delete() {
    this.remove();
  }
}
