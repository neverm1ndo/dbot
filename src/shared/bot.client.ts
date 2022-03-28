import logger from '@shared/Logger';
import { Client, ChatUserstate } from 'tmi.js';
import { RNG } from '@shared/rng'
import { Announcer } from '@shared/bot.announcer';
import { Chatter } from '@interfaces/chatter';
import { Media } from '@shared/media';
import { Schedule } from '@shared/bot.schedule';
import { Dota2 } from '@shared/dota2';
import { D2PT } from '@shared/d2pt';
import { Twitch } from '@shared/twitch';
import { Nuzhdiki } from '@shared/nuzhdiki';
import { MESSAGE } from '../schemas/message.schema';
import { Subscription } from 'rxjs';
import StartOptions from '../pre-start';

enum BotStatus {
  SLEEPS,
  WORKS,
}

export class Bot {
  opts: Schedule;
  media: Media = new Media();
  subscribtions: Subscription = new Subscription();
  client: Client = new Client({
      options: { debug: true, messagesLogLevel: 'info'  },
      connection: { reconnect: true },
      identity: {
        username: process.env.BOT_NICKNAME,
        password: process.env.BOT_OAUTH_TOKEN
      },
      channels: [process.env.BOT_CHANNEL!]
    });
  announcer: Announcer;

  public status: BotStatus = BotStatus.SLEEPS; // sleeps by default
  private readonly prefix: string = '!';

  constructor() {
    this.opts = new Schedule(process.env.BOT_CHANNEL!);
    this.announcer = new Announcer(900000);
    if (process.env.NODE_ENV !== 'development') {
      this.checkEventSubscriptions();
    }
    if (StartOptions.works) {
      this.wakeup();
    }
  }

  private checkEventSubscriptions(): void {
    const eventsubs = ['stream.online', 'stream.offline', 'channel.follow'];
    Twitch.getAppAccessToken().then((body: any) => {
      Twitch.getSubs(body.data.access_token).then((subsBody: any) => {
        if (StartOptions.dsub) {
          subsBody.data.data.forEach(async (sub: any) => {
            await Twitch.deleteSub(sub.id, body.data.access_token).then((bodyd) => {console.log(bodyd.data)});
          });
        }
        if (subsBody.data.total >= eventsubs.length && !StartOptions.dsub) { // FIXME: fix algorithm for checking existing subscribers
          logger.info('All subs already existing');
        } else {
          Promise.all(eventsubs.map((type) => Twitch.streamChanges(type, Number(process.env.TWITCH_USER_ID), body.data.access_token)))
                 .then(() => { logger.info('Subbed to all events')})
                 .catch((err) => { logger.err(err, true) });
        }
      })
    }).catch((err) => logger.err(err, true));
  }

  /**
  * Not Implemented
  **/
  private spawnSchedules(): void {
    // TODO: make multiple schedules for every user
  }

  // TODO: make users own statuses, now its global
  public shutdown(): void {
    if (this.status === BotStatus.SLEEPS) return;
    this.status = BotStatus.SLEEPS;
    // if (!this.announcer) return;
    // this.announcer.start.unsubscribe();
    this.subscribtions.remove(this.announcer.start);
  }

  public wakeup(): void {
    if (this.status === BotStatus.WORKS) return;
    this.status = BotStatus.WORKS;
    this.subscribtions.add(this.announcer.start);
  }

  public init(): void {
    logger.info('Bot status: ' + this.status);
    this.client.connect();
    // TODO: join for every connected user
    this.client.on('message', (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
      this.banSpam(channel, tags, message, self);
      let msg = new MESSAGE({channel, tags, message, self, date: Date.now()});
      msg.save();
      if(self || !message.startsWith(this.prefix)) return;
    	const args = message.slice(1).split(' ');
    	const command = args.shift()!.toLowerCase();
      this.readChattersMessage(channel, tags, command, args);
    });
  }
  /**
  * @param {ChatUserstate} chatter Chat user info
  **/
  private isPrevileged(chatter: Chatter | ChatUserstate): boolean {
    return (chatter.mod || (chatter.username === this.client.getChannels()[0]));
  }
  /**
  * @param {ChatUserstate} chatter Checks users channel subscription
  **/
  private isSubscriber(chatter: Chatter | ChatUserstate) {
    if (!chatter.badges) {
      return false;
    }
    return chatter.badges.broadcaster || chatter.badges.founder || chatter.badges.subscriber;
  }
  private banSpam(channel: string, tags: ChatUserstate, message: string, self: boolean) {
    if (self) return;
    if (!this.isPrevileged(tags) || !this.isSubscriber(tags)) {
      message = message.replace(/ /g, '').toLowerCase();
      for (let i = 0; i < this.opts.dictionary.length; i+=1) {
        let form = this.opts.dictionary[i].replace(/ /g, '').toLowerCase();
        if (message.includes(form)) {
          this.client.ban(channel, tags.username!, 'Banned phrase: ' + this.opts.dictionary[i]);
          logger.warn(tags.username + ' banned for reason: ' + this.opts.dictionary[i]);
          return;
        }
      };
    }
  }
  private readChattersMessage(channel: any, tags: ChatUserstate, command?: string, args?: string[]): void {
    if (!tags.username || !command) return;
    // SOUNDS
    this.opts.schedules.sounds.forEach((sound: { command: string, path: string, gain?: number }) => {
      if (command === sound.command) {
        this.media.playSound(tags, sound);
        return;
      }
    });
    // CUSTOM COMMANDS
    this.opts.customCommands.forEach((customCommand) => {
      if (command === customCommand.name) {
        console.log(customCommand);
        this.client.say(channel, customCommand.response);
        return;
      }
    });

    const channelName = channel.slice(1);
    // BUILT-IN COMMANDS
    switch (command) {
      //TODO: make this command optional
      case 'ранг': {
        Promise.all([
          Dota2.getRatings(120494497),
          Dota2.getRatings(350421994)
        ]).then((ratings: any[]) => {
          let message: string = '';
          ratings.forEach((rating, index) => {
            message = message + `${rating.data.profile.personaname}: ${rating.data.leaderboard_rank} ${Dota2.parseRankTier(rating.data.rank_tier)}`
            if (index !== ratings.length - 1) {
              message = message + ', ';
            }
          });
          this.client.say(channel, `Ранг ${channel}: (${message})`);
        }).catch((err) => logger.err(err));
        break;
      }
      case 'ролл': {
        this.client.say(channel, `${tags.username} нароллил: ${RNG.randomize(0, 101)} BlessRNG`);
        break;
      }
      case 'хелп': {
        this.client.say(channel, `OhMyDog Список команд тут: https://apps.nmnd.ru/commands/${channelName}`);
        break;
      }
      case 'help': {
        this.client.say(channel, `OhMyDog Список команд тут: https://apps.nmnd.ru/commands/${channelName}`);
        break;
      }
      case 'нуждики': {
        Nuzhdiki.getOne().then((path: string) => {
          this.media.playSound(tags, { path });
        });
        break;
      }
      //TODO: make this command optional
      case 'd2pt': {
        if (args) {
            let arg = args.join(' ');
            let pos;
            if (arg.includes('|')) [arg, pos] = arg.split('|').map((val) => val.trim());
            console.log(arg, pos);
            D2PT.getHeroWR(arg, pos).then((msg: string) => {
              this.client.say(channel, msg);
            }).catch((err) => {
              this.client.say(channel, err);
            });
        } else {
           this.client.say(channel, 'Имя персонажа небыло введено. Правильно - !d2pt invoker');
        }
        break;
      }
      default: { break; }
    }
  }
}
