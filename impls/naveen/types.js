const print_str = (ast, print_readably) => {
  if (ast instanceof MalValue) return ast.print_str(print_readably);
  return ast.toString();
};

class MalValue {
  print_str(print_readably = false) {
    return 'default MalValue';
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
    return '"' + this.string + '"';
  }

  count() {
    return this.string.length;
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
}

class MalSymbol extends MalValue {
  constructor(symbol) {
    super();
    this.symbol = symbol;
  }

  print_str(print_readably = false) {
    return this.symbol;
  }
}

class NilValue extends MalValue {
  constructor() {
    super();
  }

  print_str(print_readably = false) {
    return 'nil';
  }
}

const Nil = new NilValue();

module.exports = { List, Vector, Nil, Str, Keyword, MalSymbol, HashMap, print_str };
