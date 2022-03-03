class TTVClip {
  constructor(clip, width, height) {
    const wrap = document.createElement('a');
          wrap.href = clip.url;
    const title = document.createElement('div');
          title.innerHTML = `<i class="bi bi-camera-reels-fill"></i><b>${clip.title}</b>`;
    const thumbnail = new Image();
          thumbnail.src = clip.thumbnail_url;
    const author = document.createElement('div');
          author.innerHTML = `<small>с канала ${clip.broadcaster_name} от ${clip.creator_name}</small>`;
    const info = document.createElement('div');
          info.append(title, author);
    wrap.append(thumbnail, info);
    wrap.classList.add('clip-frame')
    this.frame = wrap;
  }

  valueOf() {
    return this.frame;
  }

  static notLikeThis(message) {
    const wrap = document.createElement('div');
          wrap.classList.add('not-like-this');
    const img = new Image();
          img.src = "https://static-cdn.jtvnw.net/emoticons/v2/58765/default/light/3.0";
          wrap.innerHTML = `<small>${message}</small>`;
          wrap.prepend(img);
    return wrap;
  }

  static getSlug(link) {
    if (!link) return;
    const regex = new RegExp(/(?<=clip\/)(.*)/);
    if (!regex.test(link)) return;
    return link.match(regex)[0];
  }
}

export default TTVClip;
