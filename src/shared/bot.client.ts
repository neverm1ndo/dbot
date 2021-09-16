import { Client, ChatUserstate } from 'tmi.js';
import { RNG } from '@shared/rng'
import logger from '@shared/Logger';
import { Announcer } from '@shared/bot.announcer';
import { Chatter } from '@interfaces/chatter';
import { Media } from '@shared/media';
import { Schedule } from '@shared/bot.schedule';
import { Subscription } from 'rxjs';
import { Dota2 } from '@shared/dota2';
import { Twitch } from '@shared/twitch';
import { Nuzhdiki } from '@shared/nuzhdiki';
import { Aneki } from '@shared/aneki';
import StartOptions from '../pre-start';
type BotStatus = 'works' | 'sleeps';

export class Bot {
  opts: Schedule;
  media: Media = new Media();
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

  public status: BotStatus = 'sleeps';
  private readonly prefix: string = '!';
  private subscriptions: Subscription = new Subscription();

  constructor() {
    this.opts = new Schedule('neverm1nd_o');
    this.announcer = new Announcer(900000);
    if (process.env.NODE_ENV !== 'development') {
      Twitch.getAppAccessToken().then((body: any) => {
        Twitch.getSubs(body.data.access_token).then((subsBody: any) => {
          // subsBody.data.data.forEach(async (sub: any) => {
            //   await Twitch.deleteSub(sub.id, body.data.access_token).then((bodyd) => {console.log(bodyd.data)});
            // });
            if (subsBody.data.total >= 2) { // FIXME: fix algorithm for checking existing subscribers
              logger.info('All subs already existing')
            } else {
              Twitch.streamChanges('stream.online', Number(process.env.TWITCH_USER_ID), body.data.access_token)
              .then(() => { logger.info('Subbed to stream.online event')})
              .catch((err) => { logger.err(err, true) });
              Twitch.streamChanges('stream.offline', Number(process.env.TWITCH_USER_ID), body.data.access_token)
              .then(() => { logger.info('Subbed to stream.offline event')})
              .catch((err) => { logger.err(err, true) });
            }
          })
        }).catch((err) => logger.err(err, true));
    }
    if (StartOptions.works) {
      this.wakeup();
    }
    this.subscriptions.add(this.announcer.start);
  }

  public shutdown(): void {
    if (this.status === 'sleeps') return;
    this.status = 'sleeps';
  }

  public wakeup(): void {
    if (this.status === 'works') return;
    this.status = 'works';
  }

  public init(): void {
    logger.info('Bot status: ' + this.status);
    this.client.connect();
    this.client.on('message', (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
      this.banSpam(channel, tags, message, self);
      if(self || !message.startsWith(this.prefix)) return;
    	const args = message.slice(1).split(' ');
    	const command = args.shift()!.toLowerCase();
      this.readChattersMessage(channel, tags, command);
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
      for (let i = 0; i < this.opts.dictionary.length; i+=1) {
        if (message.includes(this.opts.dictionary[i])) {
          this.client.ban(channel, tags.username!);
          logger.warn(tags.username + ' banned for reason: ' + this.opts.dictionary[i]);
          return;
        }
      };
    }
  }
  readChattersMessage(channel: any, tags: ChatUserstate, command?: string, args?: string[]): void {
    if (!tags.username || (this.status === 'sleeps') || !command) return;
    // SOUNDS
    this.opts.schedules.sounds.forEach((sound: { command: string, path: string }) => {
      if (command === sound.command) {
        this.media.playSound(tags, sound.path);
        return;
      }
    });
    // COMMANDS
    switch (command) {
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
        this.client.say(channel, `OhMyDog Список команд тут: https://apps.nmnd.ru/commands`);
        break;
      }
      case 'help': {
        this.client.say(channel, `OhMyDog Список команд тут: https://apps.nmnd.ru/commands`);
        break;
      }
      case 'нуждики': {
        Nuzhdiki.getOne().then((path: string) => {
          this.media.playSound(tags, path);
        });
        break;
      }
      case 'анек': {
        Aneki.getOne().then((anek: string) => {
          this.client.say(channel, anek);
        });
        break;
      }
      default: { break; }
    }
  }
}
