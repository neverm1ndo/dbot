import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

export class Announcer {
  public  _announcer: Observable<string>;
  public delay: number;
  constructor(delay: number, messages: string[]) {
    this.delay = delay;
    this._announcer = timer(delay, delay).pipe(
      map(e => messages[e % messages.length])
    )
  }
};
