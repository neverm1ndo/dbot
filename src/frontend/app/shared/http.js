class Http {
  static async get(url, headers, mode = 'cors') {
    const res = await fetch(url, { method: 'GET', headers, cache: 'default' })
      if (res.ok) {
       return await res.json();
    } else {
      console.error(`Ошибка HTTP: ${this.res.status}`);
    }
  }
  static async post(url, data, headers) {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });
    if (res.ok) {
      return await res;
    } else {
      console.error(`Ошибка HTTP: ${this.res.status}`);
    }
  }
}
export default Http;
