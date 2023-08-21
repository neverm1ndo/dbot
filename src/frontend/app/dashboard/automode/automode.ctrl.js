import Http from '@shared/http';
import { Popout } from '../popout';
import template from './automode.tpl.pug';
import { BadgeListComponent } from '@app/dashboard/badge-list/badge-list.component';

export class AutomodeController extends Popout {

  constructor(icon) {
    super({
      title: 'Автомод',
      icon,
      subtitles: [
        'Автоматический бан пользователя, если в его сообщении будут обнаружены добавленные в правило слова или фразы.',
        'Удалить правило можно нажав на крестик в блоке правила.'
      ],
    });
    this.body.innerHTML = template();
    this.getRules();
    this.textarea  = this.querySelector('.textarea');
    this.submit    = this.querySelector('#submit');
    this._rules    = this.querySelector('badge-list');
    this._rules.addEventListener('remove-item', (event) => {
      this.removeRule(event.detail);
    });
    this.submit.addEventListener('click', () => {
      if (!this.textarea.value) return;
      this.addRule(this.textarea.value);
    });
  }

  getRules() {
    return Http.get('/api/user/automode-rules')
               .then((rules) => { rules.forEach((rule) => this.addBadge(rule)); })
               .catch((err) => console.error);
  }

  addBadge(rule) {
    this._rules.add(rule);
  }

  addRule(rule) {
    return Http.post('/api/user/add-automode-rule',
      { rule },
      { 'Content-Type': 'application/json' })
      .then(() => {
        this.addBadge(rule);
        this.textarea.value = '';
        this.textarea.focus();
      })
      .catch((err) => console.error);
  }
  removeRule(rule) {
    return Http.delete('/api/user/remove-automode-rule',
      { rule },
      { 'Content-Type': 'application/json'})
      .then(() => { console.log(rule + ' removed from automode'); })
      .catch((err) => console.error);
  }
}
