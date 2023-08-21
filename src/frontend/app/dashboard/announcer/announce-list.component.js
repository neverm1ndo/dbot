import editFormTemplate from './announce-edit-form.tpl.pug';

export class AnnounceListItemEditComponent extends HTMLElement {
  constructor(item, _id) {
    super();
    this.classList.add('col-12');
    this.innerHTML = editFormTemplate(item);
    const saveButton = this.querySelector('#save');
          saveButton.addEventListener('click', () => {
            const [message, interval] = [
              ['message', String], 
              ['interval', Number]
            ].map(([id, DataType]) => new DataType(this.querySelector(`#${id}`).value).valueOf());
            this.dispatchEvent(new CustomEvent('save-edited-item', { detail: { value: { interval, message }, _id }}));
          });
  }
}
