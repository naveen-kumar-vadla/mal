const { MalSymbol } = require('./types');

class Env {
  constructor(outer = null) {
    this.outer = outer;
    this.data = new Map();
  }

  set(key, malValue) {
    if(!(key instanceof MalSymbol)) throw new Error(`${key} is not a symbol`);
    
    this.data.set(key.symbol, malValue);
    return malValue;
  }

  find(key) {
    if(!(key instanceof MalSymbol)) throw new Error(`${key} is not a symbol`);

    if(this.data.has(key.symbol)) return this;
    return this.outer && this.outer.find(key);
  }

  get(key) {
    if(!(key instanceof MalSymbol)) throw new Error(`${key} is not a symbol`);
    
    const env = this.find(key);
    if(env) return env.data.get(key.symbol);

    throw new Error(`symbol '${key.symbol}' not found`);
  }
}

module.exports = { Env };