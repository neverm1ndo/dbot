import { Popout } from '@app/dashboard/popout';

export class AlertsConstructorComponent extends Popout {
  constructor(icon) {
    super({
      title: 'Конструктор оповещений',
      subtitles: [
        'Составляйте свои оповещения',
      ],
      icon,
    });
  }
}
