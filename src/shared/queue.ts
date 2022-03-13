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
  global: boolean = false;
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
    if (!user.username) return false;
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
      if (this.queue[i].username === user.username) return true;
    }
    return false;
  }
  addTime(user: ChatUserstate, time: number): void {
    if (this.global) return;
    for (let i = 0; i < this.queue.length; i+=1 ) {
       if (this.queue[i].username !== user.username) continue;
       this.queue[i].start = (Date.now() - (time * 60000));
       logger.info(`Added ${time} minutes for ${user.username}`);
       break;
    }
    if (!this.options.global) return;
    this.global = true;
    setTimeout(() => {
      this.global = false;
    }, 30000);
  }
  toTimeout(user: ChatUserstate) {
    if (this.global) return;
    if (!user.username) return;
    const now = Date.now();
    this.queue.push({ username: user.username, start: now });
    setTimeout(() => {
      this.removeFromQueue(user);
    }, this.options.cooldown);
    if (!this.options.global) return;
    this.global = true;
    setTimeout(() => {
      this.global = false;
    }, 30000);
  }
  removeFromQueue(user: ChatUserstate) {
    for (let i = 0; i < this.queue.length; i+=1) {
      if (this.queue[i].username !== user.username) continue;
      this.queue.splice(i, 1);
      logger.info('Chatter ' + user.username + ' removed from queue');
      break;
    };
  }
}
