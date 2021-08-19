class MalValue {}

class List extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  toString() {
    return '(' + this.ast.map(x => x.toString()).join(' ') + ')';
  }
}

class Vector extends MalValue {
  constructor(ast) {
    super();
    this.ast = ast;
  }

  toString() {
    return '[' + this.ast.map(x => x.toString()).join(' ') + ']';
  }
}
class NilValue extends MalValue {
  constructor() {
    super();
  }

  toString() {
    return 'nil';
  }
}

const Nil = new NilValue();

module.exports = { List, Vector, Nil };