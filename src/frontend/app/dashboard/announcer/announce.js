import template from 'pug-loader!./announce.tpl.pug';
import editFormTemplate from 'pug-loader!./announce-edit-form.tpl.pug';

export class AnnounceComponent extends HTMLElement {
  editBtn;
  deleteBtn;
  constructor(index, message) {
    super();
    this.timing = index*15;
    // this.innerHTML = template({
    //   timing: this.timing,
    //   message
    // });
    this.editForm = document.createElement('div');
    this.value = message;
    this.editForm.innerHTML = editFormTemplate({ message });
    this.render();
  }
  edit() {
    this.firstChild.append(this.editForm);
    this.firstChild.querySelector('#save').addEventListener(('click'), () => {
      this.save();
    });
  }
  save() {
    const message = this.editForm.querySelector('#message').value;
    this.value = message;
    this.dispatchEvent(new CustomEvent('save', { message }));
    this.editForm.remove();
    this.render();
  }
  render() {
    this.innerHTML = template({
      timing: this.timing,
      message: this.value,
    });
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
