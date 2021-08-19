const print_str = (ast) => {
  if(ast instanceof MalValue) return ast.print_str();
  return ast.toString()
};

class MalValue {
  print_str() { 
    return "default MalValue" 
  }
}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  print_str() {
    return '(' + this.ast.map(print_str).join(' ') + ')';
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  print_str() {
    return '[' + this.ast.map(print_str).join(' ') + ']';
  }
}

class NilValue extends MalValue {
  constructor() {
    super();
  }

  print_str() {
    return 'nil';
  }
}

const Nil = new NilValue();

module.exports = { List, Vector, Nil, print_str };