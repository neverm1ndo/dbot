/**
<iframe
    src="https://clips.twitch.tv/embed?clip=<slug>&parent=streamernews.example.com"
    height="<height>"
    width="<width>"
    allowfullscreen="<allow full screen>">
</iframe>
*/

class TTVClip {
  constructor(clip, width, height) {
    const wrap = document.createElement('a');
          wrap.href = clip.url;
    const title = document.createElement('div');
          title.innerHTML = '<b>' + clip.title + '</b>';
    const author = document.createElement('div');
          author.innerHTML = `<small>с канала ${clip.broadcaster_name} от ${clip.creator_name}</small>` ;
    // const thumb = new Image();
    //       thumb.src = clip.thumbnail_url;
    const info = document.createElement('div');
          info.append(title, author);
    wrap.append(info);
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
          wrap.innerText = message;
          wrap.prepend(img);
    return wrap;
  }

  static getSlug(link) {
    if (!link) return;
    // https://clips.twitch.tv/TangentialPopularPorpoisePJSugar-DQNOMEcbFrdkPEgf
    return link.match(/(?<=https:\/\/clips\.twitch\.tv\/)(.*)/)[0];
  }
}

export default TTVClip;
