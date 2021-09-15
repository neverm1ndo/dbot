import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { bot } from '@server';

export class Announcer {
  public start: Observable<string>;
  public delay: number;
  constructor(delay: number) {
    this.delay = delay;
    this.start = timer(delay, delay).pipe(
      map(e => bot.opts.schedules.automessages[e % bot.opts.schedules.automessages.length])
    )
  }
};
