const { MalSymbol, print_str } = require('./types');

class Env {
  constructor(outer = null) {
    this.outer = outer;
    this.data = new Map();
  }

  set(key, malValue) {
    if (!(key instanceof MalSymbol)) throw new Error(`${key} is not a symbol`);

    this.data.set(key.symbol, malValue);
    return malValue;
  }

  find(key) {
    if (!(key instanceof MalSymbol)) throw new Error(`${key} is not a symbol`);

    if (this.data.has(key.symbol)) return this;
    return this.outer && this.outer.find(key);
  }

  get(key) {
    if (!(key instanceof MalSymbol)) throw new Error(`${key} is not a symbol`);

    const env = this.find(key);
    if (env) return env.data.get(key.symbol);

    throw new Error(`symbol '${key.symbol}' not found`);
  }

  static create(outer = null, binds = [], exprs = []) {
    const env = new Env(outer);
    let andNotFound = true;

    for (let i = 0; i < binds.length && andNotFound; i++) {
      let key = binds[i];
      let value = exprs[i];
      if (key.symbol === '&') {
        key = binds[i + 1];
        value = exprs.slice(i);
        andNotFound = false;
      }
      if (value === undefined) throw new Error(`No value provided for '${print_str(key)}'`);
      env.set(key, value);
    }
    return env;
  }
}

module.exports = { Env };