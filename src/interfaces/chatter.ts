export interface Chatter {
  'badge-info': any,
  badges: { 
    broadcaster?: string,
    founder?: string,
    subscriber?: string
  },
  'client-nonce': string,
  color: string,
  'display-name': string,
  emotes: any,
  flags: any,
  id: string,
  mod: boolean,
  'room-id': string,
  subscriber: boolean,
  'tmi-sent-ts': string,
  turbo: boolean,
  'user-id': string,
  'user-type': any,
  'emotes-raw': null | string,
  'badge-info-raw': any,
  'badges-raw': null | string,
  username: string,
  'message-type': string
}
