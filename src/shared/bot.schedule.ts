import { USER } from '../schemas/user.schema';
import { CHATTER } from '../schemas/chatters.schema';

interface UserSettings {
  automessages: string[];
  banwords: string[];
  sounds: any[];
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
  schedules: UserSettings = {
    automessages: [],
    banwords: [],
    sounds: []
  };
  chatters: Chatters = {
    regulars: [],
    lurkers: []
  };
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
  constructor(username: string) {
    USER.findOne({'user.login': username}, (err: any, user: any) => {
      if (err || !user) return;
      this.schedules = user.settings;
    });
    CHATTER.find({}, (err: any, chatters: any) => {
      if (err || !chatters) return;
      this.chatters = chatters;
    });
  }

  get sounds(): string[] {
    return this.schedules.sounds;
  }

  get dictionary(): string[] {
    return this.schedules.banwords;
  }

  set dictionary(newdict) {
    this.schedules.banwords = newdict;
  }

  get automessages(): string[] {
    return this.schedules.automessages;
  }
};
