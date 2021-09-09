const { MalSymbol, print_str, List } = require('./types');

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
    const env = this.find(key);
    if (env) return env.data.get(key.symbol);

    throw new Error(`symbol '${key.symbol}' not found`);
  }

  static create(outer = null, binds = [], exprs = []) {
    const env = new Env(outer);

    for (let i = 0; i < binds.length && andNotFound; i++) {
      if (binds[i].symbol === '&') {
        env.set(binds[i + 1], new List(exprs.slice(i)));
        break;
      }
      if (exprs[i] === undefined) throw new Error(`No value provided for '${print_str(binds[i])}'`);
      env.set(binds[i], exprs[i]);
    }

    return env;
  }
}

module.exports = { Env };
