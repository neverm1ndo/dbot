/* eslint max-classes-per-file: ["error", 10] */

let ws;

class Alert {
  constructor() {
    this.box = document.querySelector('.alert');
  }

  success(message) {
    this.box.innerHTML = message;
    this.box.classList.add('alert-success');
    this.box.style.display = 'block';
    setTimeout(() => {
      this.box.classList.remove('alert-success');
      this.closeAlert();
    }, 2000);
  }

  error(message) {
    this.box.innerHTML = `<span>Произошла ошибка: ${message}</span>`;
    this.box.style.display = 'block';
    this.box.classList.add('alert-danger');
    setTimeout(() => {
      this.box.classList.remove('alert-danger');
      this.closeAlert();
    }, 2000);
  }

  warn(message) {
    this.box.innerHTML = `<span>Обрыв соединения: ${message}</span>`;
    this.box.style.display = 'block';
    this.box.classList.add('alert-warning');
  }

  closeAlert() {
    this.box.style.display = 'none';
  }
}

const alert = new Alert();

(function setConnection() {
  ws = new WebSocket(`wss://${window.location.host}`);
  ws.onopen = () => {
    alert.closeAlert();
    alert.success('Соединение установлено');
    ws.send(JSON.stringify({ event: 'dashboard-connection' }));
  };

  ws.onclose = (event) => {
    if (event.wasClean) {
      console.log('Соединение закрыто чисто');
    } else {
      console.log('Обрыв соединения');
      alert.warn(`Код: ${event.code}`);
      setTimeout(() => {
        setConnection();
      }, 5000);
    }
    console.log(`Code: ${event.code}\n Reason: ${event.reason}`);
  };

  ws.onmessage = (event) => {
    const depeche = JSON.parse(event.data);
    console.log(depeche);
    switch (depeche.event) {
      case 'save-success':
        alert.success('Настройки успешно применены');
        break;
      case 'save-fail':
        alert.error(`Ошибка: ${depeche.message}`);
        break;
      case 'bot-status':
        botStatus.setStatus = depeche.message;
        break;
      default:
    }
  };

  ws.onerror = (error) => {
    alert.error(error);
    console.log(`Ошибка ${error.message}`);
  };
}());

class FormItem {
  constructor(options) {
    this.item = document.createElement('div');
    this.item.classList.add('mb-3');
    this.input = document.createElement('textarea');
    this.input.classList.add("form-control")
    this.input.value = '';
    if (options.value) this.input.value = options.value;
    this.close = document.createElement('button');
    this.close.classList.add('btn-close', 'btn', 'btn-dark');

    this.close.addEventListener('click', (e) => {
      e.stopPropagation();
      this.item.remove();
    });

    this.item.append(this.input, this.close);
  }

  set text(text) {
    this.labeltext = text;
  }

  add() {
    return this.item;
  }
}

class FormItemDouble extends FormItem {
  constructor(options) {
    super(options);
    this.label.remove();
    this.input.remove();
    this.input = document.createElement('input');
    this.input.type = 'text';
    this.label = document.createElement('input');
    // this.audio = document.createElement('audio');
    // this.audio.src = `./../${options.value.input}`;
    // this.audio.controls = true;
    this.label.type = 'text';
    this.item.append(this.label, this.input, this.close);
    this.label.value = options.value.label;
    this.input.value = options.value.input;
    // this.item.append(this.audio);
  }
}

class Form {
  constructor(options) {
    this.form = document.createElement('form');
    this.form.id = options.name;

    this.title = document.createElement('label');
    this.title.classList.add('form-label');
    this.title.innerHTML = options.title;

    this.submit = document.createElement('button');
    this.submit.classList.add('btn');
    this.submit.classList.add('btn-dark');
    

    this.box = document.createElement('div');
    this.box.classList.add('mb-3');

    this.submit.innerHTML = 'submit';
    if (options.adds) {
      this.addItem = document.createElement('button');
      this.addItem.classList.add('btn');
      this.addItem.classList.add('btn-dark');
      this.addItem.innerHTML = '+';
      this.addItem.addEventListener('click', (e) => {
        e.preventDefault();
        this.box.append(new FormItem({ type: 'text', labeltext: `#${this.box.childNodes.length}` }).add());
      });
    } else {
      this.addItem = document.createElement('div');
    }
    this.submit.innerHTML = 'Сохранить';

    options.items.forEach((item) => {
      this.box.append(item);
    });

    this.submit.addEventListener('click', (e) => {
      e.preventDefault();
      const messages = [];
      const areas = this.box.getElementsByTagName('textarea');

      for (let i = 0; i < areas.length; i += 1) {
        messages.push(areas[i].value);
      }
      fetch('https://localhost:8443/api/user/update-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: '144668618', settings: { automessages: messages }}) // body data type must match "Content-Type" header
      });
    });

    this.box.append(this.items);
    this.form.append(this.title, this.box, this.addItem, this.submit);
  }

  appendItem(item) {
    const i = item;
    i.text = `#${this.box.childNodes.length}`;
    this.box.append(i.add());
  }

  add() {
    return this.form;
  }
}

class Configurator {
  constructor() {
    this.amsg = document.querySelector('#avt-msg-form');
    this.amsgForm = new Form({
      name: 'amsg-reconf', title: 'Автоматические сообщения', items: [], adds: true,
    });
    this.amsg.append(this.amsgForm.add());
    // this.filter = document.querySelector('#filter-form');
    // this.filterForm = new Form({
    //   name: 'filter-reconf', title: 'Нежелательные фразы', items: [], adds: false,
    // });
    // this.filter.append(this.filterForm.add());
    // this.sounds = document.querySelector('#sounds-form');
    // this.soundsForm = new Form({
    //   name: 'sounds-reconf', title: 'Список звуков', items: [], adds: false,
    // });
    // this.sounds.append(this.soundsForm.add());
  }

  async getConfiguration() {
    console.log(window.location.pathname);
    this.response = await fetch(`https://${window.location.hostname}:8443/api/user?id=144668618`);
    if (this.response.ok) {
      this.conf = await this.response.json();
      console.log(this.conf);
    } else {
      alert(`Ошибка HTTP: ${this.response.status}`);
    }
    this.conf.settings.automessages.forEach((message, index) => {
      this.amsgForm.appendItem(new FormItem({ type: 'text', labeltext: `#${index + 1}`, value: message }));
    });
    // this.filterForm.appendItem(new FormItem({ type: 'text', labeltext: 'Фильтр Бан', value: this.conf.settings.banwords }));

    // Object.keys(this.conf.settings.sounds).forEach((command) => {
    //   this.soundsForm.appendItem(new FormItemDouble({ type: 'text', value: { label: command, input: this.conf.settings.sounds[command].path } }));
    // });
    (function addMenuEvents() {
      const main = document.getElementsByTagName('main')[0];
      const mainChildren = main.children;
      const list = document.querySelector('#list').children;
      for (let i = 0; (i < list.length) && (i < mainChildren.length); i += 1) {
        const element = mainChildren[i];
        const rect = element.getBoundingClientRect();
        console.log(rect);
        list[i].id = `link-${element.id}`;
        list[i].addEventListener('click', () => {
          console.log(rect.top);
          main.scrollTo({
            top: rect.top,
            behavior: 'smooth',
          });
        });
      }
    }());
  }
}

const conf = new Configurator();
conf.getConfiguration();
