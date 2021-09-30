class HEX {
  constructor(color) {
    if (typeof color !== 'string') throw console.error(Error(color + ' is not a string!'));
    if (color.startsWith('#')) color = color.substr(1);
    this.color = parseInt(color, 16);
    this.r = parseInt(color.substr(0, 2), 16);
    this.g = parseInt(color.substr(2, 2), 16);
    this.b = parseInt(color.substr(4, 2), 16);
  }
  setSpecters() {
    this.r = parseInt(this.toString().substr(0, 2), 16);
    this.g = parseInt(this.toString().substr(2, 2), 16);
    this.b = parseInt(this.toString().substr(4, 2), 16);
  }
  setColor() {
    this.color = parseInt(this.toString().substr(1), 16);
  }
  blend(hex) {
    if (!(hex instanceof HEX)) {
      throw console.error(Error(hex + ' is not a HEX instance!'));
    }
    this.color = this.color + hex.color;
    this.setSpecters();
    return this;
  }
  toString() {
    const c = {
      r: this.r.toString(16),
      g: this.g.toString(16),
      b: this.b.toString(16)
    };
    const result = '#' + ('0').repeat(2 - c.r.length) + c.r + ('0').repeat(2 - c.g.length) + c.g + ('0').repeat(2 - c.b.length) + c.b;
    return result;
  }
  valueOf() {
    return this.color;
  }
  saturation(amount) {
    amount = amount/100;
    if (amount < 0) {
      console.warn('Saturation percentage must be more than 0', amount);
      return this;
    }
    const gray = this.r * 0.3086 + this.g * 0.6094 + this.b * 0.0820;
    this.r = Math.round(this.r * amount + gray * (1-amount));
    this.g = Math.round(this.g * amount + gray * (1-amount));
    this.b = Math.round(this.b * amount + gray * (1-amount));
    this.setColor();
    return this;
  }
  contrast(amount) {
    amount = amount/100;
    if (amount < 0) {
      return this;
    }
    const col = Math.max.apply(null, [this.r, this.g, this.b]);
    this.r = Math.min(255, Math.round((this.r/col)*this.r + (amount*col)));
    this.g = Math.min(255, Math.round((this.g/col)*this.g + (amount*col)));
    this.b = Math.min(255, Math.round((this.b/col)*this.b + (amount*col)));
    this.setColor();
    return this;
  }
  brightness(amount) {
    amount = amount/100;
    if (amount < 0) {
      console.warn('Brightness percentage must be more than 0', amount);
      return this;
    }
    this.r = Math.min(255,Math.floor(this.r + 255 - (amount*255)));
    this.g = Math.min(255,Math.floor(this.g + 255 - (amount*255)));
    this.b = Math.min(255,Math.floor(this.b + 255 - (amount*255)));
    this.setColor();
    return this;
  }
}

export default HEX;
