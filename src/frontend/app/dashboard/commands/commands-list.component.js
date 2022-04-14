import editFormTemplate from 'pug-loader!./command-edit-form.tpl.pug';

export class CommandListItemEditComponent extends HTMLElement {
  constructor(value, _id) {
    super();
    this.innerHTML = editFormTemplate(value);
    const saveButton = this.querySelector('#save');
          saveButton.addEventListener('click', () => {
            const command = this.querySelector('#name').value;
            const response = this.querySelector('#response').value;
            this.dispatchEvent(new CustomEvent('save-edited-item', { detail: { value: { command, response }, _id }}));
          });
  }
}
