import 'bootstrap/dist/css/bootstrap.min.css';
import '../dashboard/dashboard.css';
import Collapse from 'bootstrap/js/dist/collapse';

const collapseElementList = [].slice.call(document.querySelectorAll('.collapse'))
const collapseList = collapseElementList.map(function (collapseEl) {
  return new Collapse(collapseEl, {
    toggle: false
  });
});
