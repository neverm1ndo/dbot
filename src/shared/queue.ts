import { ChatUserstate } from 'tmi.js';
import { Timestamp } from '@shared/timestamp';
import logger from '@shared/Logger';
interface QueueOptions {
  cooldown: number,
  global: boolean
}

export interface QueueChatUserstate {
  username: string;
  start: number;
}

export class Queue {
  static whitelist: string[] = JSON.parse(process.env.WHITELIST!);
  queue: QueueChatUserstate[] = [];
  options: QueueOptions = { cooldown: 0, global: false };
  constructor(options: QueueOptions) {
    this.options = options;
  }

  public get list(): QueueChatUserstate[] {
    return this.queue;
  }

  clear() {
    this.queue = [];
  }
  public static checkWhitelist(user: ChatUserstate) {
    if (!user.username) { return false; };
    return this.whitelist.includes(user.username);
  }
  countTime(user: ChatUserstate) {
    return new Promise((resolve, reject) => {
      const now = Date.now();
      this.queue.forEach((userInQ) => {
        if (userInQ.username === user.username) {
          resolve(Timestamp.parseCD(this.options.cooldown * 60000 - (now - userInQ.start)));
        }
      });
      reject(user);
    });
  }
  check(user: ChatUserstate) {
    for (let i = 0; i < this.queue.length; i+=1) {
      if (this.queue[i].username === user.username) {
        return true;
      }
    }
    return false;
  }
  addTime(user: ChatUserstate, time: number) {
    for (let i = 0; i <= this.queue.length; i+=1 ) {
       if (this.queue[i].username === user.username) {
         this.queue[i].start = (Date.now() - (time * 60000));
         console.log('> ', user.username, ' added to queue for ', time, ' minutes');
       }
    }
  }
  toTimeout(user: ChatUserstate) {
    if (user.username) {
      if (!Queue.whitelist.includes(user.username)) {
        const now = Date.now();
        this.queue.push({ username: user.username, start: now });
        setTimeout(() => {
          this.removeFromQueue(user);
        }, this.options.cooldown * 60000);
      }
    }
  }
  removeFromQueue(user: ChatUserstate) {
    for (let i = 0; i < this.queue.length; i+=1) {
      if (this.queue[i].username === user.username) {
        this.queue.splice(i, i + 1);
        logger.info('Chatter ' + user.username + ' removed from queue ' + this.queue);
        break;
      }
    };
  }
}
