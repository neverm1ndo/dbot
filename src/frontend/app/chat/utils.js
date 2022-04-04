export function formatTime(time) {
  return ('0' + String(time)).substr(-2);
}

export function timestamp (unix) {
  const  date = new Date(unix);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  return `${hours}:${formatTime(minutes)}:${formatTime(seconds)}`;
}

export function haveLinks(text) {
  return text.match(/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig);
}

export function linkify(text) {
  var replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
  var replacedText = text.replace(replacePattern1, '<a href="$1">$1</a>');
  var replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
  var replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2">$2</a>');
  var replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
  var replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');
  return replacedText;
}

export function secondsToTimestamp(time) {
  const hours = Math.floor(time / 3600);
        time  = time - hours * 3600;
  const minutes = Math.floor(time / 60);
  const seconds = time - minutes * 60;
  return `${hours}:${formatTime(minutes)}:${formatTime(seconds)}`;
}
export function nonce(length) {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
