import axios from 'axios';

const OPN_DOTA = 'https://api.opendota.com/api/';

export interface Dota2Ratings {
  account_id: number;
  match_id: number;
  solo_competitive_rank: number;
  competitive_rank: number;
  leaderboard_rank: number;
  time: number;
}

export class Dota2 {
  public static getRatings(id: number) {
    return axios.get(OPN_DOTA + `players/${id}`);
  }
  public static refreshPlayer(id: number) {
    return axios.post(OPN_DOTA + `players/${id}/refresh`);
  }
  public static parseRankTier(tier: number): string {
    const tiers: any = {
      80: 'Immortal',
      70: 'Divine',
      60: 'Ancient',
      50: 'Legend',
      40: 'Hero'
    }
    if (!tiers[tier]) return 'Low Rank';
    return tiers[tier];
  }
}
