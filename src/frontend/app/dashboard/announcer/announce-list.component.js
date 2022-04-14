import editFormTemplate from 'pug-loader!./announce-edit-form.tpl.pug';

export class AnnounceListItemEditComponent extends HTMLElement {
  constructor(value, _id) {
    super();
    this.innerHTML = editFormTemplate(value);
    const saveButton = this.querySelector('#save');
          saveButton.addEventListener('click', () => {
            const message = this.querySelector('#message').value;
            this.dispatchEvent(new CustomEvent('save-edited-item', { detail: { value: { message }, _id }}));
          });
  }
}
