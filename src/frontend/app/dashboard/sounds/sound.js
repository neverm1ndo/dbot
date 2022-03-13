import template from 'pug-loader!./sound.tpl.pug';
import editForm from 'pug-loader!../commands/command-edit-form.tpl.pug';

export class SoundComponent extends HTMLElement {
  editBtn;
  deleteBtn;
  playBtn;
  constructor(sound) {
    super();
    this.editForm = document.createElement('div');
    this.editForm.innerHTML = editForm({
      command: {
        name: sound.command,
        response: sound.path
      }
    });
    if (!sound.gain) sound.gain = 0;
    this.value = sound;
    this.render();
  }
  edit() {
    this.gain.disabled = false;
    this.firstChild.append(this.editForm);
    this.firstChild.querySelector('#save').addEventListener(('click'), () => {
      this.save();
    });
  }
  save() {
    const command = this.editForm.querySelector('#name').value;
    const path = this.editForm.querySelector('#response').value;
    const gain = this.gain.value;
    this.value = {
      command,
      path,
      gain,
    };
    this.dispatchEvent(new CustomEvent('save', this.value));
    this.editForm.remove();
    this.render();
  }
  play() {
    this.dispatchEvent(new CustomEvent('play', { sound: this.value }));
  }
  render() {
    this.innerHTML = template(this.value);
    this.editBtn = this.querySelector('#edit');
    this.deleteBtn = this.querySelector('#delete');
    this.playBtn = this.querySelector('#play');
    this.gain = this.querySelector('#gain');
    this.editBtn.addEventListener('click', () => {
      this.edit();
    });
    this.playBtn.addEventListener('click', () => {
      this.play();
    });
    this.deleteBtn.addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('delete', this));
      this.delete();
    });
  }
  delete() {
    this.remove();
  }
}
