class Http {
  static async get(url, headers) {
    const res = await fetch(url, { headers })
      if (res.ok) {
       return await res.json();
    } else {
      alert.error(`Ошибка HTTP: ${this.res.status}`);
    }
  }
  static async post(url, data) {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return await response.json();
  }
}
