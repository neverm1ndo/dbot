import Http from '@shared/http';
import { Popout } from '@app/dashboard/popout';
import template from './mods.tpl.pug';

export class Mods extends Popout {
  constructor(icon) {
    super({
      title: 'Доступ к управлению ботом',
      icon,
      subtitles: [
        'Добавьте никнеймы пользователей, которым вы доверяете настройку бота',
        'Удалить модератора можно нажав на крестик в блоке правила.'
      ],
    });
    this.body.innerHTML = template();
    this.body.innerHTML = template();
    this.getMods();
    this.textarea  = this.querySelector('.textarea');
    this.submit    = this.querySelector('#submit');
    this._moderators = this.querySelector('badge-list');
    // this._moderators.addEventListener('remove-item', (event) => {
    //   this.removeRule(event.detail);
    // });
    // this.submit.addEventListener('click', () => {
    //   if (!this.textarea.value) return;
    //   this.addRule(this.textarea.value);
    // });
  }
  addBadge(rule) {
    this._moderators.add(rule);
  }
  addMod(ruleRaw) {
    return Http.post('/api/user/update-moderators',
      { rules: this.getRulesRaw().push(ruleRaw) },
      {'Content-Type': 'application/json'})
      .then(() => { this.addBadge(ruleRaw); })
      .catch((err) => console.error );
  }
  getMods() {
    return Http.get('/api/user/moderators')
               .then((rules) => { rules.forEach((rule) => this.addBadge(rule)); })
               .catch((err) => console.error);
  }
  removeMod(rule) {
    return Http.post('/api/user/update-moderators',
      { rules: this.getRulesRaw().filter((r) => r != rule.value )},
      { 'Content-Type': 'application/json'})
      .then(() => { rule.remove() })
      .catch((err) => console.error );
  }
}
