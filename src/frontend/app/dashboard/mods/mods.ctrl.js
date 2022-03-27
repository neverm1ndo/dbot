import Http from '@shared/http';
import { AutomodeController } from '../automode/automode.ctrl';
import { AutomodeRuleComponent } from '../automode/automode.rule';
import template from 'pug-loader!../automode/automode.tpl.pug';

export class Mods extends AutomodeController {
  constructor() {
    super();
    this.innerHTML = template({
      title: 'Доступ к управлению ботом',
      icon: 'bi-people-fill',
      cardTexts: [
        'Добавьте никнеймы пользователей, которым вы доверяете настройку бота',
        'Удалить модератора можно нажав на крестик в блоке правила.'
      ],
    });
  }
  addRule(ruleRaw) {
    return Http.post('/api/user/update-moderators',
      { rules: this.getRulesRaw().push(ruleRaw) },
      {'Content-Type': 'application/json'})
      .then(() => { this.addBadge(ruleRaw); })
      .catch((err) => console.error );
  }
  getRules() {
    return Http.get('/api/user/moderators')
               .then((rules) => this.spawnRules(rules))
               .catch((err) => console.error);
  }
  saveRules() {
    return Http.post('/api/user/update-moderators',
      { rules: this.getRulesRaw() },
      { 'Content-Type': 'application/json' });
  }
  removeRule(rule) {
    return Http.post('/api/user/update-moderators',
      { rules: this.getRulesRaw().filter((r) => r != rule.value )},
      { 'Content-Type': 'application/json'})
      .then(() => { rule.remove() })
      .catch((err) => console.error );
  }
}
