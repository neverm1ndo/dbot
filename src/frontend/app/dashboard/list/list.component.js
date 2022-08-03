import emptyList from 'pug-loader!./empty-list.tpl.pug';

export class ListComponent extends HTMLElement {
  constructor() {
    super();
    this.isEmpty();
  }

  add(item) {
    this.append(item);
  }

  remove(item) {
    this.dispatchEvent(new CustomEvent('remove-item', { detail: item.value }));
    item.remove();
    this.isEmpty();
  }

  isEmpty () {
    if (this.children.length > 0) {
      const empty = this.querySelector('#empty');
      if (empty) empty.remove();
      return;
    }
    this.innerHTML = emptyList({ message: 'Список пуст' });
  }
}

export class CustomListComponent extends ListComponent {  
  add(itemValue, itemTemplate, editFormTemplate) {
    const item = new CustomListItemComponent(itemValue, itemTemplate, editFormTemplate);
    item.addEventListener('patch-item', (event) => {
      this.dispatchEvent(new CustomEvent('patch-list-item', { detail: Object.assign(event.detail.value, { _id: event.detail._id }) }));
    });
    item.addEventListener('remove-item', (event) => {
      this.dispatchEvent(new CustomEvent('remove-item', { detail: { itemValue, target: event.target }}));
    });
    this.append(item);
    this.isEmpty();
    this.parentElement.scrollTo({
      top: this.parentNode.scrollHeight + 300,
      behavior: 'smooth'
    });
  }
}

export class CustomListItemComponent extends HTMLElement {
  
  editing = false;

  constructor(itemValue, itemTemplate, editFormComponent) {
    super();
    this._id = itemValue._id;
    this._value = Object.assign(itemValue);
    if (this._value._id) delete this._value._id;
    this._template = itemTemplate;
    this._editFormComponent = editFormComponent;
    this._render();
  }

  _addListeners() {
    const del = this.querySelector('#delete');
          del.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('remove-item', { detail: this._value }))
          });
    const edit = this.querySelector('#edit');
          edit.addEventListener('click', () => {
            this.editing = true;
            edit.disabled = this.editing;
            const editForm = new this._editFormComponent(this._value, this._id);
                  editForm.addEventListener('save-edited-item', (event) => {
                    this.value = event.detail.value;
                    this.editing = false;
                    edit.disabled = this.editing;
                    this.dispatchEvent(new CustomEvent('patch-item', { detail: event.detail }));
                  });
            this.firstChild.append(editForm);
          });
  }

  _render() {
    this.innerHTML = this._template(this._value);
    this._addListeners();
  }

  set value(newValue) {
    this._value = newValue;
    this._render();
  }
}
