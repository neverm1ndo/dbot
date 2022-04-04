import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './dashboard.css';
import { AutomodeController } from './automode/automode.ctrl';
import { AutomodeRuleComponent } from './automode/automode.rule';
import { CommandsController } from './commands/commands.ctrl';
import { CustomCommandComponent } from './commands/custom-command';
import { AnnounceComponent } from './announcer/announce';
import { AnnouncerController } from './announcer/announcer.ctrl';
import { Mods } from './mods/mods.ctrl';
import { SoundsController } from './sounds/sounds.ctrl';
import { SoundComponent } from './sounds/sound';
import '@assets/bc.png';
import '@assets/cm.png';
import '@assets/tank2.png';
import '@chat/chat';

customElements.define('automode-rule', AutomodeRuleComponent);
customElements.define('automode-rules', AutomodeController);
customElements.define('custom-command', CustomCommandComponent);
customElements.define('custom-commands', CommandsController);
customElements.define('custom-announce', AnnounceComponent);
customElements.define('custom-announcer', AnnouncerController);
customElements.define('sounds-list', SoundsController);
customElements.define('sound-item', SoundComponent);
customElements.define('moderators-rules', Mods);

[
  {
    btn: document.querySelector('#btn-automode'),
    controller: AutomodeController
  },
  {
    btn: document.querySelector('#btn-custom-commands'),
    controller: CommandsController
  },
  {
    btn: document.querySelector('#btn-sounds'),
    controller: SoundsController
  },
  {
    btn: document.querySelector('#btn-announcer'),
    controller: AnnouncerController
  },
  {
    btn: document.querySelector('#btn-mods'),
    controller: Mods
  }
].forEach((component) => {
  component.btn.addEventListener('click', () => {
    document.body.append(new component.controller());
  });
});

document.body.querySelector('#chat')
             .append(new ChatComponent());
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  })
  .catch(function(error) {
    console.log('Service worker registration failed, error:', error);
  });
}
