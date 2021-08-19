const { List, Vector, Nil, Str } = require('./types');

class Reader {
  constructor(tokens) {
    this.tokens = tokens;
    this.position = 0;
  }

  peek() {
    return this.tokens[this.position];
  }

  next() {
    const token = this.peek();
    if (this.position < this.tokens.length) this.position++;
    return token;
  }
}

const tokenize = (str) => {
  const regEx = /[\s,]*(~@|[\[\]{}()'`~^@]|"(?:\\.|[^\\"])*"?|;.*|[^\s\[\]{}('"`,;)]*)/g;
  return [...str.matchAll(regEx)].map((x) => x[1]).slice(0, -1);
};

const read_atom = (reader) => {
  const token = reader.next();
  if (token.match(/^-?[0-9]+$/)) return parseInt(token);
  if (token.match(/^-?[0-9][0-9.]*$/)) return parseFloat(token);
  if (token === 'true') return true;
  if (token === 'false') return false;
  if (token === 'nil') return Nil;
  if(token.match(/^"(?:\\.|[^\\"])*"$/)) return new Str(token.slice(1, -1));
  if(token[0] === '"') throw new Error(`unbalanced | expected '"', got EOF`);

  return token;
};

const read_seq = (reader, closingCharacter) => {
  const ast = [];
  reader.next();

  while (reader.peek() !== closingCharacter) {
    if(!reader.peek()) throw new Error(`unbalanced | expected '${closingCharacter}', got EOF`);
    ast.push(read_form(reader));
  }

  reader.next();
  return ast;
};

const read_list = (reader) => {
  const ast = read_seq(reader, ')');
  return new List(ast);
};

const read_vector = (reader) => {
  const ast = read_seq(reader, ']');
  return new Vector(ast);
};

const read_form = (reader) => {
  const token = reader.peek();

  switch (token[0]) {
    case '(': return read_list(reader);
    case ')': throw new Error("unbalanced | unexpected ')'");
    
    case '[': return read_vector(reader);
    case ']': throw new Error("unbalanced | unexpected ']'");
  }

  return read_atom(reader);
};

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_str };