import badgeListItemTpl from './badge-list-item.tpl.pug';
import { ListComponent } from '@app/dashboard/list/list.component';

export class BadgeListItemComponent extends HTMLElement {
  constructor(rule) {
    super();
    this.innerHTML = badgeListItemTpl({ rule });
    this.value = rule;
  }
}

export class BadgeListComponent extends ListComponent {
  add(name) {
    const item = new BadgeListItemComponent(name);
    this.append(item);
    item.addEventListener('click', (event) => {
      this.remove(item);
    });
    this.isEmpty();
  }
}
