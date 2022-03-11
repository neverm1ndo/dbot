import template from 'pug-loader!./custom-command.tpl.pug';
import editFormTemplate from 'pug-loader!./command-edit-form.tpl.pug';

export class CustomCommandComponent extends HTMLElement {
  editBtn;
  deleteBtn;
  constructor(name, response, id) {
    super();
    this._id = id;
    this.innerHTML = template({ name, response });
    this.editForm = document.createElement('div');
    this.value = {
      name,
      response,
    };
    this.editForm.innerHTML = editFormTemplate({ command: this.value });
    this.render();
  }
  edit() {
    this.firstChild.append(this.editForm);
    this.firstChild.querySelector('#save').addEventListener(('click'), () => {
      this.save();
    });
  }
  save() {
    const name = this.editForm.querySelector('#name').value;
    const response = this.editForm.querySelector('#response').value;
    this.value = {
      name,
      response,
    };
    this.dispatchEvent(new CustomEvent('save', this.value));
    this.editForm.remove();
    this.render();
  }
  render() {
    this.innerHTML = template(this.value);
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
