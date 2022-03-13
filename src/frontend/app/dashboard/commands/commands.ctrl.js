import Http from '@shared/http';
import { Popout } from '../popout';
import template from 'pug-loader!./commands.tpl.pug';
import emptyList from 'pug-loader!./empty-commands-list.tpl.pug';
import { CustomCommandComponent } from './custom-command';
import { autoscroll } from '@shared/scroller';

export class CommandsController extends Popout {
  _commands = [];
  constructor() {
    super();
    this.getAllCommands();
    this.innerHTML = template();
    this.closeBtn  = this.querySelector('.btn-close');
    this.container = this.querySelector('#container');
    this.name      = this.querySelector('#command-name');
    this.textarea  = this.querySelector('.textarea');
    this.submit    = this.querySelector('#submit');
    this.closeBtn.addEventListener('click', () => {
      this.close();
    })
    this.submit.addEventListener('click', () => {
      if (!this.textarea.value && !this.name.value) return;
      console.log(this.textarea.value, this.name.value);
      this.addCommand({
        name: this.name.value.toLowerCase(),
        response: this.textarea.value
      })
      .then(() => {
        console.log('saved');
        this.textarea.value = '';
        this.name.value = '';
      })
      .catch((err) => {
        console.error(err);
      });
    });
  }

  isEmpty() {
    if (this._commands.length > 0) {
      const empty = this.container.querySelector('#empty');
      if (empty) empty.remove();
      return;
    }
    this.container.innerHTML = emptyList({ message: 'Список кастомных команд пуст' });
  }

  getAllCommands() {
    return Http.get('/api/user/commands').then((commands) => {
      commands.forEach((command) => {
        this.addCommandToListView(command);
      });
      this.isEmpty();
    }).catch((err) => {
      console.error(err);
    });
  }

  addCommand(commandRaw) {
    console.log(this.getCommandsRaw(), commandRaw)
    return Http.post('/api/user/update-commands',
      {
        commands: [...this.getCommandsRaw(), commandRaw]
      }, {
        'Content-Type': 'application/json'
      })
      .then(() => {
        this.addCommandToListView(commandRaw);
        autoscroll(this.container.parentElement);
      })
      .catch((err) => {
        console.error(err);
      });
  }

  addCommandToListView(commandRaw) {
    const command = new CustomCommandComponent(commandRaw.name, commandRaw.response, commandRaw._id);
    this._commands.push(command);
    this.container.append(command);
    this.isEmpty();
    command.addEventListener('save', (event) => {
      console.log(event);
      this.saveCommands().then(() => {
        console.log('saved');
      });
    });
    command.addEventListener('delete', (event) => {
      for (let i = 0; i < this._commands.length; i++) {
        if (this._commands[i]._id !== event.target._id) continue;
        this._commands.splice(i, 1);
        break;
      }
      this.saveCommands().then(() => {
        console.log('deleted');
        this.isEmpty();
      });
    });
  }

  saveCommands() {
    return Http.post('/api/user/update-commands',
      {
        commands: this.getCommandsRaw()
      }, {
        'Content-Type': 'application/json'
      })
      .catch((err) => {
        console.error(err);
      });
  }

  getCommandsRaw() {
    return this._commands.map(command => command.value);
  }
}
