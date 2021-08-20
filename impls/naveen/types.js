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
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  print_str(print_readably = false) {
    return '[' + this.ast.map(x => print_str(x, print_readably)).join(' ') + ']';
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

module.exports = { List, Vector, Nil, Str, Keyword, MalSymbol, print_str };
