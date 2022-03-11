import template from 'pug-loader!./automode.rule.tpl.pug';

export class AutomodeRuleComponent extends HTMLElement {
  constructor(rule) {
    super();
    this.innerHTML = template({ rule });
    this.value = rule;
  }
}
