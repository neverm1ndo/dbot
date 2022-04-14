import soundsListItemTemplate from 'pug-loader!./sound.tpl.pug';
import { ListComponent } from '@app/dashboard/list/list.component';
import { CommandListItemEditComponent } from '@app/dashboard/commands/commands-list.component';

export class SoundsListItemComponent extends HTMLElement {
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
            gain.disabled = false;
            const editForm = new CommandListItemEditComponent({ command: this._value.command, response: this._value.path }, this._id);
                  editForm.addEventListener('save-edited-item', (event) => {
                    this.value = Object.assign(event.detail, { gain: gain.value });
                    this.dispatchEvent(new CustomEvent('patch-item', {
                      detail: this._value
                    }));
                    gain.disabled = true;
                  });
            this.firstChild.append(editForm);
          });
  }

  set value(newValue) {
    this._value = {
      command: newValue.command,
      path: newValue.path,
      gain: newValue.gain,
    };
    this.innerHTML = soundsListItemTemplate(this._value);
    this._addListeners();
  };
}

export class SoundsListComponent extends ListComponent {
  add(item) {
    const sound = new SoundsListItemComponent(item.command, item.path, item.gain, item._id);
    sound.addEventListener('patch-item', (event) => {
      this.dispatchEvent(new CustomEvent('patch-list-item', { detail: event.detail }));
    });
    sound.addEventListener('remove-item', (event) => {
      this.dispatchEvent(new CustomEvent('remove-item', { detail: { item, target: event.target }}));
    });
    sound.addEventListener('play', (event) => {
      this.dispatchEvent(new CustomEvent('play-item-sound', { detail: event.detail }));
    });
    this.append(sound);
    this.isEmpty();
  }
}
