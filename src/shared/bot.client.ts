import logger from '@shared/Logger';
import { Client, ChatUserstate } from 'tmi.js';
import { RNG } from '@shared/rng'
import { Chatter } from '@interfaces/chatter';
import { Media } from '@shared/media';
import { Schedule } from '@shared/bot.schedule';
import { Dota2 } from '@shared/dota2';
import { D2PT } from '@shared/d2pt';
import { Twitch } from '@shared/twitch';
import { Nuzhdiki } from '@shared/nuzhdiki';
import { MESSAGE } from '../schemas/message.schema';
import StartOptions from '../pre-start';
import { Subscription, interval } from 'rxjs';

enum BotStatus {
  SLEEPS,
  WORKS,
}

export class Bot {
  opts: Schedule = new Schedule();
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
  announcers: {[channel: string]: Subscription } = {};

  private readonly prefix: string = '!';

  constructor() {
    if (process.env.NODE_ENV !== 'development') this.checkEventSubscriptions();
    if (StartOptions.works) this.wakeup(process.env.BOT_CHANNEL!);
  }

  private messageInterpolation(message: string, channel: string, tags: ChatUserstate) {
    const prefix: string = '#';
    const replaceMap: {[ rep: string]: any } = {
      'rng': RNG.randomize(0, 101),
      'nickname': tags.username,
      'channel': channel,
      'get': async function() {

      }
    };
    for (let rep in replaceMap) {
      const regex = new RegExp(`/${prefix}\[${rep}:?.*?\]/g`);
      let result: string = '';
      if (!regex.test(message)) continue;
      if (typeof replaceMap[rep] == 'function') {
        const args: RegExpMatchArray | null = message.match(new RegExp(`/?!<=\#\[rng\()([0-9, a-z]*)(?=\)\]/g`));
        if (args) result = replaceMap[rep](...args);
      }
      if (!result) result = replaceMap[rep];
      new Promise((resolve, reject) => {
        
      });
      message.replace(regex, result);
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
  public shutdown(channel: string): void {
    logger.info(`CHANNEL ${channel} shutdown`);
    this.announcers[channel].unsubscribe();
    delete this.announcers[channel];
    logger.imp(`Shuttdown in ${channel} channel`);
  }

  public wakeup(channel: string): void {
    this.announcers[channel] = new Subscription();
    this.opts.getChannelAutomessages(channel).then((messages) => {
      messages.forEach((announce) => {
        const subscription = interval(announce.interval*60000)
                            .subscribe(() => { this.client.say(channel, announce.message) }, console.error);
        this.announcers[channel].add(subscription);
      });
    }).catch(console.error);
    logger.imp(`Woke up in ${channel} channel`);
  }

  public init(): void {
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
      const channelName = channel.slice(1);
      message = message.replace(/ /g, '').toLowerCase();
      this.opts.getChannelDictionary(channelName)
               .then((dictionary: string[]) => {
                  for (let i = 0; i < dictionary.length; i+=1) {
                    const current = dictionary[i];
                    const form = current.replace(/ /g, '').toLowerCase();
                    if (!message.includes(form)) return;
                    this.client.ban(channel, tags.username!, 'Banned phrase: ' + current);
                    logger.warn(channelName + ': ' + tags.username + ' banned for reason: ' + current);
                    break;
                  };
                })
                .catch((err) => logger.err(err))
    }
  }
  private readChattersMessage(channel: any, tags: ChatUserstate, command?: string, args?: string[]): void {
    if (!tags.username || !command) return;
        const channelName = channel.slice(1);
    // SOUNDS
    this.opts.getChannelSounds(channelName)
             .then((sounds: any[]) => {
                sounds.forEach((sound: { command: string, path: string, gain?: number }) => {
                  if (command === sound.command) {
                    this.media.playSound(channelName, tags, sound);
                    return;
                  }
                });
              })
              .catch(logger.err);
    // CUSTOM COMMANDS
    this.opts.getChannelCustomCommands(channelName).then((commands: any[]) => {
      const replaceMap: {[ rep: string]: any } = {
        '#[rng]': RNG.randomize(0, 101),
        '#[nickname]': tags.username,
        '#[channel]': channelName,
      };
      commands.forEach((customCommand) => {
        if (command === customCommand.command) {
          let message = customCommand.response;
          for(let rep in replaceMap) {
            message = message.replace(rep, replaceMap[rep]);
          }
          this.client.say(channel, message);
          return;
        }
      });
    }).catch(logger.err);

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
        }).catch(logger.err);
        break;
      }
      case 'нуждики': {
        Nuzhdiki.getOne()
                .then((path: string) => {
                  this.media.playSound(channelName, tags, { path });
                });
        break;
      }
      //TODO: make this command optional
      case 'wr': {
        if (args) {
            let arg = args.join(' ');
            let pos;
            if (arg.includes('|')) [arg, pos] = arg.split('|').map((val) => val.trim());
            D2PT.getHeroWR(arg, pos)
                .then((msg: string) => {
                  console.log(msg)
                  this.client.say(channel, msg.trim());
                })
                .catch((err) => {
                  this.client.say(channel, err);
                });
        } else {
           this.client.say(channel, 'Имя персонажа небыло введено. Правильно - !wr invoker');
        }
        break;
      }
      default: { break; }
    }
  }
}
