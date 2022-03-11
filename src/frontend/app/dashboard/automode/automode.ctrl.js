import Http from '@shared/http';
import template from 'pug-loader!./automode.tpl.pug';
import { AutomodeRuleComponent } from './automode.rule';

export class AutomodeController extends HTMLElement {
  _rules;
  constructor() {
    super();
    this.getRules();
    this.innerHTML = template();
    this.closeBtn  = this.querySelector('.btn-close');
    this.container = this.querySelector('#container');
    this.textarea  = this.querySelector('.textarea');
    this.submit    = this.querySelector('#submit');
    this.closeBtn.addEventListener('click', () => {
      this.close();
    })
    this.submit.addEventListener('click', () => {
      if (!this.textarea.value) return;
      this.addBadge(this.textarea.value);
      this.saveRules()
          .then(() => {
            console.log('saved');
            this.textarea.value = '';
          })
          .catch((err) => {
            console.error(err);
          });
    });
  }

  close() {
    this.classList.add('d-none');
  }
  open() {
    this.classList.remove('d-none');
    this.textarea.focus();
  }

  getRulesRaw() {
    return this._rules.map(rule => rule.value);
  }

  addRule(ruleRaw) {
    /*
    Add rule to stack then save rules in db
    */
    return Http.post('/api/user/update-automode-rules',
      {
        rules: this.getRulesRaw().push(ruleRaw)
      }, {
        'Content-Type': 'application/json'
      })
      .then(() => {
        this.addBadge(ruleRaw);
      })
      .catch((err) => {
        console.error(err);
      });
  }
  removeRule(rule) {
    /*
    Remove rule from stack then save rules in db
    */
    return Http.post('/api/user/update-automode-rules',
      {
        rules: this.getRulesRaw().filter((r) => r != rule.value )
      }, {
        'Content-Type': 'application/json'
      })
      .then(() => {
        rule.remove();
      })
      .catch((err) => {
        console.error(err);
      });
  }
  addBadge(ruleRaw) {
    const rule = new AutomodeRuleComponent(ruleRaw);
    this._rules.push(rule);
    this.container.append(rule);
    rule.addEventListener('click', (event) => {
      this.removeRule(rule);
    });
  }
  getRules() {
    return Http.get('/api/user/automode-rules').then((rules) => {
      /*
        Add rules to stack
      */
      this._rules = rules.map(rule => new AutomodeRuleComponent(rule));
      this._rules.forEach((rule) => {
        this.container.append(rule);
        rule.addEventListener('click', (event) => {
          this.removeRule(rule);
        });
      });
    }).catch((err) => {
      /*
      Show error alert
      */
      console.error(err);
    });
  }
  saveRules() {
    return Http.post('/api/user/update-automode-rules',
      {
        rules: this.getRulesRaw()
      }, {
        'Content-Type': 'application/json'
      });
  }
}
