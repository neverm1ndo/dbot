import 'bootstrap/dist/css/bootstrap.min.css';
import '../dashboard/dashboard.css';
import Collapse from 'bootstrap/js/dist/collapse';

const collapseElementList = [].slice.call(document.querySelectorAll('.collapse'))
const collapseList = collapseElementList.map(function (collapseEl) {
  return new Collapse(collapseEl, {
    toggle: false
  });
});

const audioList = [].slice.call(document.querySelectorAll('.audio'));
audioList.forEach(function(audio) {
  audio.volume = audio.dataset.volume/100;
  if (audio.volume == 0) audio.volume = 0.25;
});
