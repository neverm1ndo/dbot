import axios from 'axios';
import { RNG } from '@shared/rng';
import { parse } from 'node-html-parser';

const ANEKI = 'https://baneks.ru/';

export class Aneki {
  static async getOne() {
    return await axios({
      method: 'get',
      url: ANEKI + RNG.randomize(1, 1100),
      headers: {
        'Content-Type': 'text/html'
      }
    }).then((body: any) => {
      return parse(body.data).querySelector('.anek-view').childNodes[3].childNodes[3].rawText;
    });
  }
}
