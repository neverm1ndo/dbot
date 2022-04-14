import { Observable, timer, from } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { bot } from '@server';

export class Announcer {
  public start: Observable<string>;
  public delay: number;
  constructor(delay: number, channel: string) {
    this.delay = delay;
    this.start = from(bot.opts.getChannelAutomessages(channel))
    .pipe(mergeMap((automessages) =>
      timer(delay, delay)
      .pipe(map(e => automessages[e % automessages.length]))));
  }
};
