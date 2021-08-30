import { Queue } from '@shared/queue';
import { ChatUserstate } from 'tmi.js';
import { cm } from '../routes/sockets';

export class Media {
  queue: Queue = new Queue({ cooldown: 60000, global: true });
  constructor() {}

  playSound(chatter: ChatUserstate, path: string) {
    console.log(this.queue.list)
    if (this.queue.check(chatter)) return;
    this.queue.toTimeout(chatter);
    cm.sendall({ event: 'play-sound', msg: path });
  }
}
