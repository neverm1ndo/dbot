import { Observable, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';
import { bot } from '@server';

export class Announcer {
  public start: Observable<any>;
  public delay: number;
  constructor(delay: number) {
    this.delay = delay;
    this.start = timer(delay, delay)
    .pipe(
      takeWhile(() => bot.status === 1) // take while works
    ).pipe(
      map(e => bot.opts.schedules.automessages[e % bot.opts.schedules.automessages.length])
    )
  }
};
