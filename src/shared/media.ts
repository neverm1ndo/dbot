import { Queue } from '@shared/queue';
import { ChatUserstate } from 'tmi.js';
import { io } from '../index';

interface Sound {
  command?: string;
  path: string;
  gain?: number;
}

export class Media {
  queue: Queue = new Queue({ cooldown: 10000, global: true });

  playSound(channel: string, chatter: ChatUserstate, sound: Sound) {
    if (this.queue.check(chatter)) return;
    this.queue.toTimeout(chatter);  
    io.sockets.in(channel).emit('play-sound', sound);
  }
}
