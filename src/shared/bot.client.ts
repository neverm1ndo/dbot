import { Client, ChatUserstate } from 'tmi.js';
import { RNG } from '@shared/rng'
import logger from '@shared/Logger';
import { Announcer } from '@shared/bot.announcer';
import { Chatter } from '@interfaces/chatter';
import { Media } from '@shared/media';
import { Schedule } from '@shared/bot.schedule';
import { Dota2 } from '@shared/dota2';
import { Twitch } from '@shared/twitch';
import { Nuzhdiki } from '@shared/nuzhdiki';
import { Subscription } from 'rxjs';

export class Bot {
  opts: Schedule;
  $announcer: Subscription | undefined;
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

  state = { status: 'works' }
  userconf = { silent: false, prefix: '!' }

  constructor() {
    this.opts = new Schedule('neverm1nd_o');
    this.announcer = new Announcer(900000);
    Twitch.getAppAccessToken().then((body: any) => {
      Twitch.getSubs(body.data.access_token).then((subsBody: any) => {
        // subsBody.data.data.forEach(async (sub: any) => {
        //   await Twitch.deleteSub(sub.id, body.data.access_token).then((bodyd) => {console.log(bodyd.data)});
        // });
        if (subsBody.data.total >= 2) {
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

  public shutdown(): void {
    if (!this.$announcer) return;
    this.$announcer.unsubscribe();
  }

  public wakeup(): void {
    this.$announcer = this.announcer._announcer.subscribe((announce: string) => {
      this.client.say(this.client.getChannels()[0], announce);
    });
  }

  public init(): void {
    this.client.connect();
    this.client.on('message', (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
      if(self || !message.startsWith(this.userconf.prefix)) return;
    	const args = message.slice(1).split(' ');
    	const command = args.shift()!.toLowerCase();
      this.readChattersMessage(channel, tags, command);
    });
    this.client.on('join', (channel: string, username: string, self: boolean) => {
      if (self || (username === process.env.BOT_CHANNEL)) return;
      logger.info(`${username} connected to the channel ` + channel)
      this.client.say(channel, `${username}, HeyGuys !`)
    });
  }
  /**
  * @param {ChatUserstate} chatter Chat user info
  **/
  private isPrevileged(chatter: Chatter | ChatUserstate) {
    return (chatter.mod || (chatter.username === this.client.getChannels()[0]));
  }
  private сheckSub(chatter: Chatter | ChatUserstate) {
    if (!chatter.badges) {
      return false;
    }
    return chatter.badges.broadcaster || chatter.badges.founder || chatter.badges.subscriber;
  }
  readChattersMessage(channel: any, tags: ChatUserstate, command?: string, args?: string[]) {
    if (!tags.username) return;
    if (this.state.status === 'works') {
      if (command) {
        this.opts.schedules.sounds.forEach((sound: { command: string, path: string }) => {
          if (command === sound.command) {
            this.media.playSound(tags, sound.path);
          }
        });
        // BANHAMMER
        if (!this.isPrevileged(tags)) {
          for (let i = 0; i < this.opts.dictionary.length; i+=1) {
            if (command.includes(this.opts.dictionary[i])) {
              this.client.ban(channel, tags.username!);
            }
          };
        }
        // COMMANDS
        if (this.userconf.silent) return;
        switch (command) {
          case 'ранг': {
            Dota2.getRatings(120494497).then((ratings: any) => {
              this.client.say(channel, `Ранг ${channel}: ${ratings.data.leaderboard_rank} Immortal`);
            }).catch((err) => logger.err(err));
            break;
          }
          case 'ролл': {
            this.client.say(channel, `${tags.username} нароллил: ${RNG.randomize(0, 101)} BlessRNG`);
            break;
          }
          case 'хелп': {
            this.client.say(channel, 'Вся помощь по командам в описаннии под стримом! OhMyDog');
            break;
          }
          case 'нуждики': {
            Nuzhdiki.getOne().then((path: string) => {
              this.media.playSound(tags, path);
            });
          }
          default: { break; }
        }
      }
    }
  }
}
