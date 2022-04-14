import { USER } from '../schemas/user.schema';

interface UserSettings {
  automessages: string[];
  banwords: string[];
  sounds: any[];
  commands: any[];
}
interface Chatter {
  username: string;
  joins_count: number;
}
interface Chatters {
  regulars: Chatter[];
  lurkers: Chatter[];
}

export class Schedule {
  blacklist: string[] = [  // FIXME: hardcoded
    "diktorbot",
    "9kmmrbot",
    "fragilitys",
    "007_bad_girl",
    "anotherttvviewer",
    "socialfriends11",
    "fixloven",
    "chat_fantastic",
    "ftopayr",
    "2020",
    "restreambot",
    "jointeffortt",
    "violets_tv",
    "janenv",
    "aiexiaxo",
    "feet",
    "communityshowcase"
  ];

  getChannelSounds(channel: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      USER.findOne({'user.login': channel}, (err: any, user: any) => {
        if (err || !user) return reject(err || 'User not found');
        resolve(user.settings.sounds);
      });
    });
  }

  getChannelDictionary(channel: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      USER.findOne({'user.login': channel}, (err: any, user: any) => {
        if (err || !user) return reject(err || 'User not found');
        resolve(user.settings.banwords);
      });
    });
  }

  getChannelCustomCommands(channel: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      USER.findOne({'user.login': channel}, (err: any, user: any) => {
        if (err || !user) return reject(err || 'User not found');
        resolve(user.settings.commands);
      });
    });
  }

  getChannelAutomessages(channel: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
      USER.findOne({'user.login': channel}, (err: any, user: any) => {
        if (err || !user) return reject(err || 'User not found');
        resolve(user.settings.automessages);
      });
    });
  }
};
