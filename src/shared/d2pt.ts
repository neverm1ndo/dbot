import axios from 'axios';
import { parse, HTMLElement } from 'node-html-parser';
import fs from 'fs/promises';
import path from 'path';

type Hero = keyof typeof heroes;

enum HeroPositions {
  CARRY,
  MID,
  OFFLANE,
  SUPPORT4,
  SUPPORT5
}

let heroes: { [key: string]: { valid: string[] }};

fs.readFile(path.join(__dirname, '../../dist/public/d2_heroes.json'))
  .then((file: Buffer) => { 
    heroes = JSON.parse(file.toString());
  });

  export class D2PT {

  private static positions: { [position: string]: HeroPositions } = {
    'carry': HeroPositions.CARRY,
    'mid': HeroPositions.MID,
    'offlane': HeroPositions.OFFLANE,
    'support(4)': HeroPositions.SUPPORT4,
    'support(5)': HeroPositions.SUPPORT5
  };

  private static URL_D2PT = 'https://dota2protracker.com/hero/';

  public static async getHeroWR(hero: string, pos?: HeroPositions | keyof typeof D2PT.positions): Promise<string> {
    const validatedHero: Hero | undefined = this.validateHero(hero);
    if (!validatedHero) return Promise.reject('Нет такого персонажа или в имени допущена ошибка');
    if (pos) {
      if (!isNaN(parseInt(pos as string))) {
        if (![1, 2, 3, 4, 5].includes(+pos)) return Promise.reject('Нет такой позиции. Разрешаются целые числа от 1 до 5.');
        pos = parseInt(pos as string) - 1;
      } else {
        if (!Object.keys(D2PT.positions).includes(String(pos).toLowerCase())) return Promise.reject('Нет такой позиции. Разрешаются: Carry, Mid, Offlane, Support(4), Support(5).');
        pos = D2PT.positions[pos];
      }
    }
    return axios.get(this.URL_D2PT + validatedHero).then((body) => {
      if (pos !== undefined) return D2PT.getHeroStatByPosition(parse(body.data).querySelector('.roles'), validatedHero as Hero, pos);
      const data  = parse(body.data).querySelector('.hero-header-stats-detailed').rawText.replace(/ +(?= )/g,'');
      const times = data.match(/\d+(?=\sMatches)/)![0];
      const wr    = data.match(/(?<=\s)\d+\.\d+\%(?=\s)/)![0];
      const days  = data.match(/(?<=last\s)\d+(?=\sdays)/)![0];
      return Promise.resolve(`${validatedHero} был пикнут ${times} раз за последние ${days} дней, с винрейтом ${wr}`);
    });
  }

  private static getHeroStatByPosition(data: HTMLElement, hero: Hero, pos: HeroPositions | keyof typeof D2PT.positions): Promise<string> {
    return new Promise((resolve, reject) => {
      let positionInfo: { [position: number]: string } = {};
      let positionNames: { [position: number]: string } = {};
      
      const positions: HTMLElement = data.querySelector('.role-tabs');
            positions.querySelectorAll('button').forEach((roleButton: HTMLElement) => {
              const posName: string = roleButton.textContent.trim();

              const posNumber: number = D2PT.positions[posName.toLowerCase().replace(/\s/, '') as string];
              
              positionNames[posNumber] = posName;
              positionInfo[posNumber] = data.querySelector(`.${roleButton.id}`)
                                            .querySelector('.header-role-info').rawText
                                            .trim()
                                            .toLowerCase()
                                            .replace(/[\s, \n]/g, '')
                                            .replace('mostplayed', '');
            });
      
      for (let position in positionInfo) {
        let text = (() => {
          const [_build, matches, percent] = positionInfo[position].match(/(\d+(?:\.\d+)?)/g)!;
          return `${matches} матчей c ${percent}% побед.`;
        })();
        positionInfo[position] = `${hero} на позиции ${positionNames[D2PT.positions[pos]]}: ${text}`
      }
      
      if (!positionInfo) return reject();
      if (!positionInfo[pos as number]) return resolve('Нет информации по данному герою на данной позиции.');
      resolve(positionInfo[pos as number]);
    });
  }

  static validateHero(hero: string): Hero | undefined {
    if (Object.keys(heroes).includes(hero)) return hero as Hero;
    for (let heroname in heroes) {
      for (let i = 0; i < heroes[heroname as Hero].valid.length; i++) {
        if (hero === heroes[heroname as Hero].valid[i]) return heroname as Hero;
      }
    }
  }
}
