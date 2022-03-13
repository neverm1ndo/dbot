import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './dashboard.css';
import { AutomodeController } from './automode/automode.ctrl';
import { AutomodeRuleComponent } from './automode/automode.rule';
import { CommandsController } from './commands/commands.ctrl';
import { CustomCommandComponent } from './commands/custom-command';
import { AnnounceComponent } from './announcer/announce';
import { AnnouncerController } from './announcer/announcer.ctrl';
import { SoundsController } from './sounds/sounds.ctrl';
import { SoundComponent } from './sounds/sound';

const side = {
  automode: {
    btn: document.querySelector('#btn-automode'),
    body: () => {
      return new AutomodeController();
    }
  },
  commands: {
    btn: document.querySelector('#btn-custom-commands'),
    body: () => {
      return new CommandsController();
    }
  },
  sounds: {
    btn: document.querySelector('#btn-sounds'),
    body: () => {
      return new SoundsController();
    }
  },
  announcer: {
    btn: document.querySelector('#btn-announcer'),
    body: () => {
      return new AnnouncerController();
    }
  },
};
Object.entries(side).forEach((btn) => {
  const component = btn[1];
  component.btn.addEventListener('click', () => {
    document.body.append(component.body());
  });
})

customElements.define('automode-rule', AutomodeRuleComponent);
customElements.define('automode-rules', AutomodeController);
customElements.define('custom-command', CustomCommandComponent);
customElements.define('custom-commands', CommandsController);
customElements.define('custom-announce', AnnounceComponent);
customElements.define('custom-announcer', AnnouncerController);
customElements.define('sounds-list', SoundsController);
customElements.define('sound-item', SoundComponent);
