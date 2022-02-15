import { Client, ChatUserstate } from 'tmi.js';
import { RNG } from '@shared/rng'
import logger from '@shared/Logger';
import { Announcer } from '@shared/bot.announcer';
import { Chatter } from '@interfaces/chatter';
import { Media } from '@shared/media';
import { Schedule } from '@shared/bot.schedule';
import { Dota2 } from '@shared/dota2';
import { D2PT } from '@shared/D2Scraper';
import { Twitch } from '@shared/twitch';
import { Nuzhdiki } from '@shared/nuzhdiki';
import { Aneki } from '@shared/aneki';
import { MESSAGE } from '../schemas/message.schema';
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
  announcer: Announcer | undefined;

  public status: BotStatus = 'sleeps';
  private readonly prefix: string = '!';

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
              Promise.all([
                Twitch.streamChanges('stream.online', Number(process.env.TWITCH_USER_ID), body.data.access_token),
                Twitch.streamChanges('stream.offline', Number(process.env.TWITCH_USER_ID), body.data.access_token)
              ])
              .then(() => { logger.info('Subbed to all events')})
              .catch((err) => { logger.err(err, true) });
            }
          })
        }).catch((err) => logger.err(err, true));
    }
    if (StartOptions.works) {
      this.wakeup();
    }
  }

  public shutdown(): void {
    if (this.status === 'sleeps') return;
    this.status = 'sleeps';
    if (this.announcer) {
      this.announcer.start.unsubscribe();
      delete this.announcer;
    }
  }

  public wakeup(): void {
    if (this.status === 'works') return;
    this.status = 'works';
    if (!this.announcer) {
      this.announcer = new Announcer(900000);
    }
  }

  public init(): void {
    logger.info('Bot status: ' + this.status);
    this.client.connect();
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
      case 'разбор': {
        this.client.say(channel, 'Короткий разбор реплея без дискорда - 200р');
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
      case 'd2pt': {
        if (args) {
            const arg = args.join(' ');
            D2PT.getHeroWR(arg).then((msg: string) => {
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
