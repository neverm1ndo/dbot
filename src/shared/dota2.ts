import axios from 'axios';

const OPN_DOTA = 'https://api.opendota.com/api/';

export interface Dota2Ratings {
  account_id: number;
  match_id: number;
  solo_competitive_rank: number;
  competitive_rank: number;
  time: number;
}

export class Dota2 {
  public static getRatings(id: number) {
    return axios.get(OPN_DOTA + `players/${id}`);
  }
  public static refreshPlayer(id: number) {
    return axios.post(OPN_DOTA + `players/${id}/refresh`);
  }
}
