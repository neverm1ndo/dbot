import { readFileSync } from 'fs';

export class Schedule {
  schedules: {
    dictionary: string[];
    sounds: string[];
    automessages: string[];
  }
  constructor() {
    this.schedules = {
      dictionary: JSON.parse(readFileSync(process.env.DICTIONARY_PATH!, 'utf-8')),
      sounds: JSON.parse(readFileSync(process.env.SOUNDS_PATH!, 'utf-8')),
      automessages: JSON.parse(readFileSync(process.env.AUTOMESSAGES_PATH!, 'utf-8')).m,
    };
  }

  get sounds(): string[] {
    return this.schedules.sounds;
  }

  get dictionary(): string[] {
    return this.schedules.dictionary;
  }

  set dictionary(newdict) {
    this.schedules.dictionary = newdict;
  }

  get automessages(): string[] {
    return this.schedules.automessages;
  }
};
