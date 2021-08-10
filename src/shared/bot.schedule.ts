import { USER } from '../schemas/user.schema';
interface UserSettings {
  automessages: string[];
  banwords: string[];
  sounds: any[];
}


export class Schedule {
  schedules: UserSettings = {
    automessages: [],
    banwords: [],
    sounds: []
  };
  blacklist: string[] = [  // FIXME: hardcoded
    "9kmmrbot",
    "fragilitys",
    "007_bad_girl",
    "anotherttvviewer",
    "socialfriends11",
    "fixloven",
    "chat_fantastic"
  ]
  constructor(username: string) {
    USER.findOne({'user.login': username}, (err: any, user: any) => {
      if (err || !user) return;
      this.schedules = user.settings;
    })
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
