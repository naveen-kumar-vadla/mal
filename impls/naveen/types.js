const print_str = (ast, print_readably) => {
  if(ast instanceof MalValue) return ast.print_str(print_readably);
  return ast.toString();
};

const isEqual = (...args) => {
  const firstElement = args[0];
  let comparator = (x) => x === firstElement;
  if(firstElement instanceof MalValue) comparator = (x) => firstElement.isEqual(x);

  return args.slice(1).every(comparator);
};

class MalValue {
  print_str(print_readably = false) {
    return 'default MalValue';
  }
  isEqual(other) {
    return false;
  }
  isEmpty() {
    return true;
  }
  count() {
    return 0;
  }
}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  print_str(print_readably = false) {
    return `(${this.ast.map(x => print_str(x, print_readably)).join(' ')})`;
  }

  isEmpty() {
    return this.ast.length === 0;
  }

  count() {
    return this.ast.length;
  }

  isEqual(other) {
    if((!(other instanceof List) && !(other instanceof Vector)) || other.count() !== this.count()) {
      return false;
    }

    return this.ast.every((val, i) => isEqual(val, other.ast[i]));
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  print_str(print_readably = false) {
    return `[${this.ast.map(x => print_str(x, print_readably)).join(' ')}]`;
  }

  isEmpty() {
    return this.ast.length === 0;
  }

  count() {
    return this.ast.length;
  }

  isEqual(other) {
    if((!(other instanceof List) && !(other instanceof Vector)) || other.count() !== this.count()) {
      return false;
    }

    return this.ast.every((val, i) => isEqual(val, other.ast[i]));
  }
}

class HashMap extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
    this.hashmap = new Map();
    this.initialiseHashMap();
  }

  initialiseHashMap() {
    for(let i = 0; i < this.ast.length; i += 2) {
      this.hashmap.set(this.ast[i], this.ast[i + 1]);
    }
  }

  print_str(print_readably = false) {
    const str = [];

    for(const [k, v] of this.hashmap.entries()) {
      const key = print_str(k, print_readably);
      const value = print_str(v, print_readably);
      str.push(`${key} ${value}`);
    }

    return `{${str.join(', ')}}`;
  }

  isEmpty() {
    return this.hashmap.size === 0;
  }

  count() {
    return this.hashmap.size;
  }

  isEqual(other) {
    if(!(other instanceof HashMap) || other.hashmap.size !== this.hashmap.size) {
      return false;
    }

    const keys = [...this.hashmap.keys()];
    return keys.every(key => isEqual(this.hashmap.get(key), other.hashmap.get(key)));
  }
}

class Str extends MalValue {
  constructor(string) {
    super();
    this.string = string;
  }

  print_str(print_readably = false) {
    if(!print_readably) return this.string;
    return `"${this.string
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')}"`;
  }

  isEmpty() {
    return this.string.length === 0;
  }

  count() {
    return this.string.length;
  }

  isEqual(other) {
    return other instanceof Str && this.string === other.string;
  }
}

class Keyword extends MalValue {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  print_str(print_readably = false) {
    return `:${this.keyword}`;
  }

  isEmpty() {
    throw new Error(`cannot check 'empty?' for keyword: ${this.print_str()}`);
  }

  count() {
    throw new Error(`cannot check 'count' for keyword: ${this.print_str()}`);
  }

  isEqual(other) {
    return other instanceof Keyword && this.keyword === other.keyword;
  }
}

class MalSymbol extends MalValue {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  print_str(print_readably = false) {
    return this.symbol;
  }

  isEmpty() {
    throw new Error(`cannot check 'empty?' for symbol: ${this.print_str()}`);
  }

  count() {
    throw new Error(`cannot check 'count' for symbol: ${this.print_str()}`);
  }

  isEqual(other) {
    return other instanceof MalSymbol && this.symbol === other.symbol;
  }
}

class MalFunction extends MalValue {
  constructor(ast = null, binds = [], env = null, fn = null) {
    super();
    this.ast = ast;
    this.binds = binds;
    this.env = env;
    this.fn = fn;
  }

  print_str(print_readably = false) {
    return '#<function>';
  }

  isEmpty() {
    throw new Error(`cannot check 'empty?' for function`);
  }

  count() {
    throw new Error(`cannot check 'count' for function`);
  }

  isEqual(other) {
    throw new Error(`cannot check '=' for function`);
  }

  apply(thisArg = null, params = []) {
    return this.fn.apply(thisArg, params);
  }
}

class NilValue extends MalValue {
  constructor() {
    super();
  }

  print_str(print_readably = false) {
    return 'nil';
  }

  isEmpty() {
    return true;
  }

  count() {
    return 0;
  }

  isEqual(other) {
    return other instanceof NilValue;
  }
}

class Atom extends MalValue {
  constructor(value) {
    super();
    this.value = value;
  }

  print_str(print_readably = false) {
    return `(atom ${print_str(this.value, print_readably)})`;
  }
  
  isEmpty() {
    throw new Error(`cannot check 'empty?' for atom`);
  }

  count() {
    throw new Error(`cannot check 'count' for atom`);
  }

  isEqual(other) {
    if (!(other instanceof Atom)) return false;
    return isEqual(this.value, other.value);
  }

  reset(value) {
    return this.value = value;
  }
}

const Nil = new NilValue();

module.exports = {
  MalValue,
  List,
  Vector,
  Nil,
  Str,
  Keyword,
  MalSymbol,
  HashMap,
  MalFunction,
  Atom,
  print_str,
  isEqual,
};
