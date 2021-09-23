class Http {
  static async get(url, headers, mode = 'cors') {
    const res = await fetch(url, { method: 'GET', headers, cache: 'default' })
      if (res.ok) {
       return await res.json();
    } else {
      alert.error(`Ошибка HTTP: ${this.res.status}`);
    }
  }
  static async post(url, data) {
    const res= await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return await res.json();
  }
}
