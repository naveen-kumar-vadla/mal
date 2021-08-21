const print_str = (ast, print_readably) => {
  if (ast instanceof MalValue) return ast.print_str(print_readably);
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
}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  print_str(print_readably = false) {
    return '(' + this.ast.map(x => print_str(x, print_readably)).join(' ') + ')';
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

    return this.ast.every((val, i) => isEqual(val, other.ast[i]))
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  print_str(print_readably = false) {
    return '[' + this.ast.map(x => print_str(x, print_readably)).join(' ') + ']';
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

    return this.ast.every((val, i) => isEqual(val, other.ast[i]))
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
    for(const [key, value] of this.hashmap.entries()) { 
      str.push(print_str(key, print_readably) + ' ' + print_str(value, print_readably));
    }
    return '{' + str.join(', ') + '}'
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
    if (print_readably) {
      return '"' + this.string.replace(/\\/g, '\\\\')
              .replace(/"/g, '\\"')
              .replace(/\n/g, '\\n')
          + '"';
    }
    return this.string;
  }

  count() {
    return this.string.length;
  }

  isEqual(other) {
    return (other instanceof Str) && this.string === other.string;
  }
}

class Keyword extends MalValue {
  constructor(keyword) {
    super();
    this.keyword = keyword;
  }

  print_str(print_readably = false) {
    return ':' + this.keyword;
  }

  isEqual(other) {
    console.log(`this, other`, this, other);
    return (other instanceof Keyword) && this.keyword === other.keyword;
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

  isEqual(other) {
    return (other instanceof MalSymbol) && this.symbol === other.symbol;
  }
}

class NilValue extends MalValue {
  constructor() {
    super();
  }

  print_str(print_readably = false) {
    return 'nil';
  }

  count() {
    return 0;
  }

  isEqual(other) {
    return (other instanceof NilValue);
  }
}

const Nil = new NilValue();

module.exports = { List, Vector, Nil, Str, Keyword, MalSymbol, HashMap, print_str, isEqual };
