import { RNG } from '@shared/rng';
import { readdir } from 'fs';

export class Nuzhdiki {
  static getOne(): Promise<any> {
    return new Promise((resolve, reject) => {
       readdir(process.env.NUZHDIKI_PATH!, (err, files) => {
         if (err) {
           reject(`Unable to scan directory: ${err}`);
         } else {
           resolve('/NuzhdikiSound/' + files[RNG.randomize(0, 318)]);
         }
       });
     });
  }
}
