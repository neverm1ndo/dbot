import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './dashboard.css';
import '@chat/chat';
import { AutomodeController } from './automode/automode.ctrl';
import { CommandsController } from './commands/commands.ctrl';
import { AnnouncerController } from './announcer/announcer.ctrl';
import { SoundsController } from './sounds/sounds.ctrl';
import { SoundsListComponent, SoundsListItemComponent } from './sounds/sounds-list.component';
// import { Mods } from './mods/mods.ctrl';
// import { AlertsConstructorComponent } from './alerts-constructor/alerts-constructor.ctrl';
import { BadgeListComponent, BadgeListItemComponent } from '@app/dashboard/badge-list/badge-list.component';
import { CustomListComponent, CustomListItemComponent } from '@app/dashboard/list/list.component';
import { CommandListItemEditComponent } from '@app/dashboard/commands/commands-list.component';
import { AnnounceListItemEditComponent } from '@app/dashboard/announcer/announce-list.component';

/**
* Define Bootstrap Icons classes
*/
const bootstrapIcons = {
  exclamationMark: ['bi', 'bi-exclamation-lg'],
  musicNote: ['bi', 'bi-music-note'],
  robot: ['bi', 'bi-robot'],
  chatLeftDots: ['bi', 'bi-chat-left-dots-fill'],
  people: ['bi','bi-people-fill'],
  alerts: ['bi', 'bi-alarm-fill']
};

/**
* App components
*/
const components = [
  { selector: 'badge-list-item', component: BadgeListItemComponent },
  { selector: 'badge-list', component: BadgeListComponent },
  { selector: 'custom-list', component: CustomListComponent },
  { selector: 'custom-list-item', component: CustomListItemComponent },
  { selector: 'list-item-edit-form', component: CommandListItemEditComponent },
  { selector: 'announce-item-edit-form', component: AnnounceListItemEditComponent },
  { selector: 'sounds-list', component: SoundsListComponent },
  { selector: 'sounds-list-item', component: SoundsListItemComponent },
  { selector: 'custom-commands', component: CommandsController, icon: bootstrapIcons.exclamationMark },
  { selector: 'automode-rules', component: AutomodeController, icon: bootstrapIcons.robot},
  { selector: 'custom-sounds', component: SoundsController, icon: bootstrapIcons.musicNote },
  { selector: 'custom-announcer', component: AnnouncerController, icon: bootstrapIcons.chatLeftDots },
  // { selector: 'moderators-rules', component: Mods, icon: bootstrapIcons.people },
  // { selector: 'alerts-constructor', component: AlertsConstructorComponent, icon: bootstrapIcons.alerts },
];

/**
* Define application componets
* Render navigation buttons
*/
(function() {
  /**
  * @type {string} id - button id
  * @type {Array<string>} iconClass - classes of bootstrap icons
  */
  function createNavButton(id, iconClass) {
    const btn = document.createElement('button');
          btn.type = 'button';
          btn.id = id;
          btn.classList.add('btn', 'btn-dark');
    const icon = document.createElement('i');
          icon.classList.add(...iconClass);
          btn.append(icon);
    return btn;
  };
  const navBar = document.querySelector('#nav-buttons');
  components.forEach((component) => {
    customElements.define(component.selector, component.component);
    if (!component.icon) return;
    const navButton = createNavButton(component.selector, component.icon);
    navButton.addEventListener('click', () => {
      if (document.querySelector(component.selector)) return;
      document.body.append(new component.component(component.icon[1]));
    });
    navBar.append(navButton);
  });
})();

/**
* Service worker registration
*/
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
  .then(function(registration) {
    console.log('Registration successful, scope is:', registration.scope);
  })
  .catch(function(error) {
    console.log('Service worker registration failed, error:', error);
  });
}
