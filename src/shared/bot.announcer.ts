import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

export class Announcer {
  public  _announcer: Observable<string>;
  constructor(delay: number, messages: string[]) {
    this._announcer = timer(delay, delay).pipe(
      map(e => messages[e % messages.length])
    )
  }
};
