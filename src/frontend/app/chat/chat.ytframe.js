export class YTFrame extends HTMLElement {
  player;
  constructor(url) {
    super();
    this.replace(url)
  }
  replace(url) {
    const rep = document.createElement('div');
    rep.id = String(url + Date.now()).hashCode();
    this.append(rep);
    setTimeout(() => { // Зачемт тут этот макротаск уже сам не помню. Вроде фрейм не рендерился.
      new Promise((resolve) => {
        this.player = new YT.Player(rep.id, {
          videoId: YTFrame.getVideoID(url),
          height: '100%',
          width: '100%',
          playerVars: { autoplay: 0, controls: 1, fs: 0 },
          events: {
            onReady: resolve
          },
        });
      }).then((event) => {
        event.target.setVolume(15);
      });
    }, 2000);
  }
  static getVideoID(url) { // Обожаю статические методы
    const regExp = new RegExp(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/);
    const match = url.match(regExp);
    return (match && match[7].length === 11) ? match[7] : null;
  }
}
