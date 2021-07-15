export class RNG {
  static randomize(min: number, max: number) {
    return Math.floor(Math.random() * max + min);
  }
}
