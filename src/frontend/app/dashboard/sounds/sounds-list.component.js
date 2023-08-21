import soundsListItemTemplate from './sound.tpl.pug';
import { ListComponent } from '@app/dashboard/list/list.component';
import { CommandListItemEditComponent } from '@app/dashboard/commands/commands-list.component';

export class SoundsListItemComponent extends HTMLElement {

  editing = true;

  constructor(command, path, gain, _id) {
    super();
    this.innerHTML = soundsListItemTemplate({ command, gain });
    this._id = _id;
    this._value = {
      command,
      path,
      gain,
    };
    this._addListeners();
  }

  _addListeners() {
    const gain = this.querySelector('#gain');
    const playButton = this.querySelector('#play');
          playButton.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('play', { detail: { path: this._value.path, gain: gain.value }}));
          });
    const del = this.querySelector('#delete');
          del.addEventListener('click', () => {
            this.dispatchEvent(new CustomEvent('remove-item', { detail: this._value }))
          });
    const edit = this.querySelector('#edit');
          edit.addEventListener('click', () => {
            this.editing = true;
            edit.disabled = this.editing;
            del.disabled = this.editing;
            gain.disabled = false;
            const editForm = new CommandListItemEditComponent({ command: this._value.command, response: this._value.path }, this._id);
                  editForm.addEventListener('save-edited-item', (event) => {
                    this.value = Object.assign(event.detail.value, { gain: +gain.value });
                    this.dispatchEvent(new CustomEvent('patch-item', {
                      detail: this._value
                    }));
                    gain.disabled = true;
                    this.editing = false;
                    edit.disabled = this.editing;
                    del.disabled = this.editing;
                  });
            this.firstChild.append(editForm);
          });
  }

  set value(newValue) {
    const { command, response, gain } = newValue;
    this._value = {
      command,
      path: response,
      gain,
    };
    this.innerHTML = soundsListItemTemplate(this._value);
    this._addListeners();
  };
}

export class SoundsListComponent extends ListComponent {
  add(item) {
    const sound = new SoundsListItemComponent(item.command, item.path, item.gain, item._id);
    sound.addEventListener('patch-item', (event) => {
      let { detail } = event; 
      detail = Object.assign(detail, { _id: item._id });
      this.dispatchEvent(new CustomEvent('patch-list-item', { detail }));
    });
    sound.addEventListener('remove-item', (event) => {
      this.dispatchEvent(new CustomEvent('remove-item', { detail: { item, target: event.target }}));
    });
    sound.addEventListener('play', (event) => {
      const { detail } = event; 
      this.dispatchEvent(new CustomEvent('play-item-sound', { detail }));
    });
    this.append(sound);
    this.isEmpty();
  }
}
