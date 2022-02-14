import axios from 'axios';
import { parse } from 'node-html-parser';

export class D2PT {
  private static URL_D2PT = 'https://dota2protracker.com/hero/';
  public static async getHeroWR(hero: string) {
    return axios.get(this.URL_D2PT + hero).then((body) => {
      return parse(body.data).querySelector('.hero-stats-descr').rawText
    });
  }
}
