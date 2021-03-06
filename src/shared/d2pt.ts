import axios from 'axios';
import { parse, HTMLElement } from 'node-html-parser';

type Hero = keyof typeof D2PT.heroes;

enum HeroPositions {
  CARRY,
  MID,
  OFFLANE,
  SUPPORT4,
  SUPPORT5
}

export class D2PT {
  static readonly heroes = {
    "Anti-Mage": {
      "valid": [
        "anti-mage",
        "am",
        "anti",
        "mage"
      ]
    },
    "Axe": {
      "valid": [
        "axe",
        "a"
      ]
    },
    "Bane": {
      "valid": [
        "bane",
        "b"
      ]
    },
    "Bloodseeker": {
      "valid": [
        "bloodseeker",
        "b"
      ]
    },
    "Crystal Maiden": {
      "valid": [
        "crystal maiden",
        "cm",
        "crystal",
        "maiden"
      ]
    },
    "Drow Ranger": {
      "valid": [
        "drow ranger",
        "dr",
        "drow",
        "ranger"
      ]
    },
    "Earthshaker": {
      "valid": [
        "earthshaker",
        "e"
      ]
    },
    "Juggernaut": {
      "valid": [
        "juggernaut",
        "j"
      ]
    },
    "Mirana": {
      "valid": [
        "mirana",
        "m"
      ]
    },
    "Shadow Fiend": {
      "valid": [
        "shadow fiend",
        "sf",
        "shadow",
        "fiend"
      ]
    },
    "Morphling": {
      "valid": [
        "morphling",
        "m"
      ]
    },
    "Phantom Lancer": {
      "valid": [
        "phantom lancer",
        "pl",
        "phantom",
        "lancer"
      ]
    },
    "Puck": {
      "valid": [
        "puck",
        "p"
      ]
    },
    "Pudge": {
      "valid": [
        "pudge",
        "p"
      ]
    },
    "Razor": {
      "valid": [
        "razor",
        "r"
      ]
    },
    "Sand King": {
      "valid": [
        "sand king",
        "sk",
        "sand",
        "king"
      ]
    },
    "Storm Spirit": {
      "valid": [
        "storm spirit",
        "ss",
        "storm",
        "spirit"
      ]
    },
    "Sven": {
      "valid": [
        "sven",
        "s"
      ]
    },
    "Tiny": {
      "valid": [
        "tiny",
        "t"
      ]
    },
    "Vengeful Spirit": {
      "valid": [
        "vengeful spirit",
        "vs",
        "vengeful",
        "spirit"
      ]
    },
    "Windranger": {
      "valid": [
        "windranger",
        "w"
      ]
    },
    "Zeus": {
      "valid": [
        "zeus",
        "z"
      ]
    },
    "Kunkka": {
      "valid": [
        "kunkka",
        "k"
      ]
    },
    "Lina": {
      "valid": [
        "lina",
        "l"
      ]
    },
    "Lich": {
      "valid": [
        "lich",
        "l"
      ]
    },
    "Lion": {
      "valid": [
        "lion",
        "l"
      ]
    },
    "Shadow Shaman": {
      "valid": [
        "shadow shaman",
        "ss",
        "shadow",
        "shaman"
      ]
    },
    "Slardar": {
      "valid": [
        "slardar",
        "s"
      ]
    },
    "Tidehunter": {
      "valid": [
        "tidehunter",
        "t"
      ]
    },
    "Witch Doctor": {
      "valid": [
        "witch doctor",
        "wd",
        "witch",
        "doctor"
      ]
    },
    "Riki": {
      "valid": [
        "riki",
        "r"
      ]
    },
    "Enigma": {
      "valid": [
        "enigma",
        "e"
      ]
    },
    "Tinker": {
      "valid": [
        "tinker",
        "t"
      ]
    },
    "Sniper": {
      "valid": [
        "sniper",
        "s"
      ]
    },
    "Necrophos": {
      "valid": [
        "necrophos",
        "n"
      ]
    },
    "Warlock": {
      "valid": [
        "warlock",
        "w"
      ]
    },
    "Beastmaster": {
      "valid": [
        "beastmaster",
        "b"
      ]
    },
    "Queen of Pain": {
      "valid": [
        "queen of pain",
        "qop",
        "queen",
        "of",
        "pain"
      ]
    },
    "Venomancer": {
      "valid": [
        "venomancer",
        "v"
      ]
    },
    "Faceless Void": {
      "valid": [
        "faceless void",
        "fv",
        "faceless",
        "void"
      ]
    },
    "Wraith King": {
      "valid": [
        "wraith king",
        "wk",
        "wraith",
        "king"
      ]
    },
    "Death Prophet": {
      "valid": [
        "death prophet",
        "dp",
        "death",
        "prophet"
      ]
    },
    "Phantom Assassin": {
      "valid": [
        "phantom assassin",
        "pa",
        "phantom",
        "assassin"
      ]
    },
    "Pugna": {
      "valid": [
        "pugna",
        "p"
      ]
    },
    "Templar Assassin": {
      "valid": [
        "templar assassin",
        "ta",
        "templar",
        "assassin"
      ]
    },
    "Viper": {
      "valid": [
        "viper",
        "v"
      ]
    },
    "Luna": {
      "valid": [
        "luna",
        "l"
      ]
    },
    "Dragon Knight": {
      "valid": [
        "dragon knight",
        "dk",
        "dragon",
        "knight"
      ]
    },
    "Dazzle": {
      "valid": [
        "dazzle",
        "d"
      ]
    },
    "Clockwerk": {
      "valid": [
        "clockwerk",
        "c"
      ]
    },
    "Leshrac": {
      "valid": [
        "leshrac",
        "l"
      ]
    },
    "Nature's Prophet": {
      "valid": [
        "nature's prophet",
        "np",
        "nature's",
        "prophet"
      ]
    },
    "Lifestealer": {
      "valid": [
        "lifestealer",
        "l"
      ]
    },
    "Dark Seer": {
      "valid": [
        "dark seer",
        "ds",
        "dark",
        "seer"
      ]
    },
    "Clinkz": {
      "valid": [
        "clinkz",
        "c"
      ]
    },
    "Omniknight": {
      "valid": [
        "omniknight",
        "o"
      ]
    },
    "Enchantress": {
      "valid": [
        "enchantress",
        "e"
      ]
    },
    "Huskar": {
      "valid": [
        "huskar",
        "h"
      ]
    },
    "Night Stalker": {
      "valid": [
        "night stalker",
        "ns",
        "night",
        "stalker"
      ]
    },
    "Broodmother": {
      "valid": [
        "broodmother",
        "b"
      ]
    },
    "Bounty Hunter": {
      "valid": [
        "bounty hunter",
        "bh",
        "bounty",
        "hunter"
      ]
    },
    "Weaver": {
      "valid": [
        "weaver",
        "w"
      ]
    },
    "Jakiro": {
      "valid": [
        "jakiro",
        "j"
      ]
    },
    "Batrider": {
      "valid": [
        "batrider",
        "b"
      ]
    },
    "Chen": {
      "valid": [
        "chen",
        "c"
      ]
    },
    "Spectre": {
      "valid": [
        "spectre",
        "s"
      ]
    },
    "Doom": {
      "valid": [
        "doom",
        "d"
      ]
    },
    "Ancient Apparition": {
      "valid": [
        "ancient apparition",
        "aa",
        "ancient",
        "apparition"
      ]
    },
    "Ursa": {
      "valid": [
        "ursa",
        "u"
      ]
    },
    "Spirit Breaker": {
      "valid": [
        "spirit breaker",
        "sb",
        "spirit",
        "breaker"
      ]
    },
    "Gyrocopter": {
      "valid": [
        "gyrocopter",
        "g"
      ]
    },
    "Alchemist": {
      "valid": [
        "alchemist",
        "a"
      ]
    },
    "Invoker": {
      "valid": [
        "invoker",
        "i"
      ]
    },
    "Silencer": {
      "valid": [
        "silencer",
        "s"
      ]
    },
    "Outworld Devourer": {
      "valid": [
        "outworld devourer",
        "od",
        "outworld",
        "devourer"
      ]
    },
    "Lycan": {
      "valid": [
        "lycan",
        "l"
      ]
    },
    "Brewmaster": {
      "valid": [
        "brewmaster",
        "b"
      ]
    },
    "Shadow Demon": {
      "valid": [
        "shadow demon",
        "sd",
        "shadow",
        "demon"
      ]
    },
    "Lone Druid": {
      "valid": [
        "lone druid",
        "ld",
        "lone",
        "druid"
      ]
    },
    "Chaos Knight": {
      "valid": [
        "chaos knight",
        "ck",
        "chaos",
        "knight"
      ]
    },
    "Meepo": {
      "valid": [
        "meepo",
        "m"
      ]
    },
    "Treant Protector": {
      "valid": [
        "treant protector",
        "tp",
        "treant",
        "protector"
      ]
    },
    "Ogre Magi": {
      "valid": [
        "ogre magi",
        "om",
        "ogre",
        "magi"
      ]
    },
    "Undying": {
      "valid": [
        "undying",
        "u"
      ]
    },
    "Rubick": {
      "valid": [
        "rubick",
        "r"
      ]
    },
    "Disruptor": {
      "valid": [
        "disruptor",
        "d"
      ]
    },
    "Nyx Assassin": {
      "valid": [
        "nyx assassin",
        "na",
        "nyx",
        "assassin"
      ]
    },
    "Naga Siren": {
      "valid": [
        "naga siren",
        "ns",
        "naga",
        "siren"
      ]
    },
    "Keeper of the Light": {
      "valid": [
        "keeper of the light",
        "kotl",
        "keeper",
        "of",
        "the",
        "light"
      ]
    },
    "Io": {
      "valid": [
        "io",
        "i"
      ]
    },
    "Visage": {
      "valid": [
        "visage",
        "v"
      ]
    },
    "Slark": {
      "valid": [
        "slark",
        "s"
      ]
    },
    "Medusa": {
      "valid": [
        "medusa",
        "m"
      ]
    },
    "Troll Warlord": {
      "valid": [
        "troll warlord",
        "tw",
        "troll",
        "warlord"
      ]
    },
    "Centaur Warrunner": {
      "valid": [
        "centaur warrunner",
        "cw",
        "centaur",
        "warrunner"
      ]
    },
    "Magnus": {
      "valid": [
        "magnus",
        "m"
      ]
    },
    "Timbersaw": {
      "valid": [
        "timbersaw",
        "t"
      ]
    },
    "Bristleback": {
      "valid": [
        "bristleback",
        "b"
      ]
    },
    "Tusk": {
      "valid": [
        "tusk",
        "t"
      ]
    },
    "Skywrath Mage": {
      "valid": [
        "skywrath mage",
        "sm",
        "skywrath",
        "mage"
      ]
    },
    "Abaddon": {
      "valid": [
        "abaddon",
        "a"
      ]
    },
    "Elder Titan": {
      "valid": [
        "elder titan",
        "et",
        "elder",
        "titan"
      ]
    },
    "Legion Commander": {
      "valid": [
        "legion commander",
        "lc",
        "legion",
        "commander"
      ]
    },
    "Ember Spirit": {
      "valid": [
        "ember spirit",
        "es",
        "ember",
        "spirit"
      ]
    },
    "Earth Spirit": {
      "valid": [
        "earth spirit",
        "es",
        "earth",
        "spirit"
      ]
    },
    "Terrorblade": {
      "valid": [
        "terrorblade",
        "t"
      ]
    },
    "Phoenix": {
      "valid": [
        "phoenix",
        "p"
      ]
    },
    "Oracle": {
      "valid": [
        "oracle",
        "o"
      ]
    },
    "Techies": {
      "valid": [
        "techies",
        "t"
      ]
    },
    "Winter Wyvern": {
      "valid": [
        "winter wyvern",
        "ww",
        "winter",
        "wyvern"
      ]
    },
    "Arc Warden": {
      "valid": [
        "arc warden",
        "aw",
        "arc",
        "warden"
      ]
    },
    "Underlord": {
      "valid": [
        "underlord",
        "u"
      ]
    },
    "Monkey King": {
      "valid": [
        "monkey king",
        "mk",
        "monkey",
        "king"
      ]
    },
    "Dark Willow": {
      "valid": [
        "dark willow",
        "dw",
        "dark",
        "willow"
      ]
    },
    "Pangolier": {
      "valid": [
        "pangolier",
        "pango",
        "p"
      ]
    },
    "Grimstroke": {
      "valid": [
        "grimstroke",
        "gs"
      ]
    },
    "Mars": {
      "valid": [
        "mars"
      ]
    },
    "Void Spirit": {
      "valid": [
        "void spirit"
      ]
    },
    "Snapfire": {
      "valid": [
        "snapfire"
      ]
    },
    "Hoodwink": {
      "valid": [
        "hw"
      ]
    },
    "Dawnbreaker": {
      "valid": [
        "db",
        "dawnbreaker"
      ]
    },
    "Marci": {
      "valid": [
        "marci"
      ]
    },
    "Primal Beast": {
      "valid": [
        "primal beast",
        "beast",
        "primal",
        "pb"
      ]
    },
  };

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
    if (!validatedHero) return Promise.reject('?????? ???????????? ?????????????????? ?????? ?? ?????????? ???????????????? ????????????');
    if (pos) {
      if (!isNaN(parseInt(pos as string))) {
        if (![1, 2, 3, 4, 5].includes(+pos)) return Promise.reject('?????? ?????????? ??????????????. ?????????????????????? ?????????? ?????????? ???? 1 ???? 5.');
        pos = parseInt(pos as string) - 1;
      } else {
        if (!Object.keys(D2PT.positions).includes(String(pos).toLowerCase())) return Promise.reject('?????? ?????????? ??????????????. ??????????????????????: Carry, Mid, Offlane, Support(4), Support(5).');
        pos = D2PT.positions[pos];
      }
    }
    return axios.get(this.URL_D2PT + validatedHero).then((body) => {
      if (pos !== undefined) return D2PT.getHeroStatByPosition(parse(body.data).querySelector('.roles').querySelectorAll('.content-box-lvl-3'), validatedHero as Hero, pos);
      const data  = parse(body.data).querySelector('.hero-header-stats-detailed').rawText.replace(/ +(?= )/g,'');
      const times = data.match(/\d+(?=\sMatches)/)![0];
      const wr    = data.match(/(?<=\s)\d+\.\d+\%(?=\s)/)![0];
      const days  = data.match(/(?<=last\s)\d+(?=\sdays)/)![0];
      return Promise.resolve(`${validatedHero} ?????? ???????????? ${times} ?????? ???? ?????????????????? ${days} ????????, ?? ?????????????????? ${wr}`);
    });
  }

  private static getHeroStatByPosition(data: HTMLElement[], hero: Hero, pos: HeroPositions | keyof typeof D2PT.positions): Promise<string> {
    return new Promise((resolve, reject) => {
      const positionInfo: { [position: number]: string } = data.reduce((acc, posContainer: HTMLElement) => {
        const position: keyof typeof D2PT.positions = posContainer
                        .querySelector('.header-role-info').rawText
                        .trim()
                        .toLowerCase()
                        .replace(/[\s, \n]/g, '')
                        .replace('mostplayed', '');
        return Object.assign(acc,
          { [D2PT.positions[position]]:
            `${hero} ???? ?????????????? ${position.charAt(0).toUpperCase() + position.slice(1)} ${
            posContainer.querySelector('.header-role-stats').rawText
                        .replace(/[\n]/g, '')
                        .trim()
                        .replace('matches', '????????????')
                        .replace('Win Rate', '??????????')}`
          });
      }, {});
      if (!positionInfo) reject();
      if (!positionInfo[pos as number]) resolve('?????? ???????????????????? ???? ?????????????? ?????????? ???? ???????????? ??????????????.');
      resolve(positionInfo[pos as number]);
    });
  }

  static validateHero(hero: string): Hero | undefined {
    if (Object.keys(D2PT.heroes).includes(hero)) return hero as Hero;
    for (let heroname in D2PT.heroes) {
      for (let i = 0; i < D2PT.heroes[heroname as Hero].valid.length; i++) {
        if (hero === D2PT.heroes[heroname as Hero].valid[i]) return heroname as Hero;
      }
    }
  }
}
