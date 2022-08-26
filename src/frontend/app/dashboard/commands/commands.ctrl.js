import Http from '@shared/http';
import { Popout } from '../popout';
import template from 'pug-loader!./commands.tpl.pug';
import itemTemplate from 'pug-loader!./custom-command.tpl.pug';
import { autoscroll } from '@shared/scroller';
import { CommandListItemEditComponent } from './commands-list.component';

export class CommandsController extends Popout {
  constructor(icon) {
    super({
      title: 'Кастомные команды',
      subtitles: [
        'Добавляйте свои команды и указывайте тип ответа на команду'
      ],
      icon
    });
    this.body.innerHTML = template();
    this._commandsList = this.querySelector('custom-list');
    this._commandsList.addEventListener('remove-item', (event) => {
      this._deleteCommand(Object.assign(event.detail.itemValue, { _id: event.detail.target._id }))
          .then(() => {
            this._commandsList.remove(event.detail.target);
            console.log('Command deleted', event.detail.itemValue);
          })
          .catch(console.error);
    });
    this._commandsList.addEventListener('patch-list-item', (event) => {
      this._patchCommand(event.detail)
          .then(() => {
            console.log('Command patched successfuly');
          }).catch(console.error);
    });
    this._form = {
      command: this.querySelector('#command-name'),
      response: this.querySelector('.textarea'),
      submit: this.querySelector('#submit'),
    };
    this._form.submit.addEventListener('click', () => {
      if (!this._form.response.value && !this._form.command.value) return;
      this._addCommand(this.formValue)
          .then(() => {
            this._commandsList.add(this.formValue, itemTemplate, CommandListItemEditComponent);
            this._clearForm();
            autoscroll(this.body);
          })
          .catch(console.error);
    });
    this._getCommands();
  }

  get formValue() {
    return {
      command: this._form.command.value.toLowerCase(),
      response: this._form.response.value
    };
  }

  _clearForm() {
    this._form.textarea.value = '';
    this._form.command.value = '';
  }

  _getCommands() {
    return Http.get('/api/user/commands').then((commands) => {
      commands.forEach((command) => {
        this._commandsList.add(command, itemTemplate, CommandListItemEditComponent);
      });
    }).catch((err) => {
      console.error(err);
    });
  }

  _patchCommand(commandValue) {
    return Http.patch('/api/user/patch-custom-command',
      commandValue,
      { 'Content-Type': 'application/json' });
  }

  _addCommand(commandValue) {
    return Http.post('/api/user/add-custom-command',
      commandValue,
      { 'Content-Type': 'application/json' });
  }

  _deleteCommand(commandValue) {
    return Http.delete('/api/user/delete-custom-command',
    commandValue,
    { 'Content-Type': 'application/json' });
  }
}
