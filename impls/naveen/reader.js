const { List, Vector, Nil, Str, Keyword, MalSymbol, HashMap } = require('./types');

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
  return [...str.matchAll(regEx)]
    .map((x) => x[1])
    .filter(x => x[0] !== ';')
    .slice(0, -1);
};

const read_atom = (reader) => {
  const token = reader.next();
  if (token.match(/^-?[0-9]+$/)) return parseInt(token);
  if (token.match(/^-?[0-9][0-9.]*$/)) return parseFloat(token);
  if (token === 'true') return true;
  if (token === 'false') return false;
  if (token === 'nil') return Nil;
  if (token[0] === ':') return new Keyword(token.slice(1));
  if (token.match(/^"(?:\\.|[^\\"])*"$/)) {
    const str = token.slice(1, token.length - 1).replace(/\\(.)/g, (_, c) => c === "n" ? "\n" : c)
    return new Str(str);
  }
  if (token[0] === '"') throw new Error(`expected '"', got end of input`);

  return new MalSymbol(token);
};

const read_seq = (reader, closingCharacter) => {
  const ast = [];
  reader.next();

  while (reader.peek() !== closingCharacter) {
    if (reader.peek() === undefined) throw new Error(`expected '${closingCharacter}', got end of input`);
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

const read_hashmap = (reader) => {
  const ast = read_seq(reader, '}');
  if (ast.length % 2 !== 0) throw new Error('Odd number of hash map arguments');
  return new HashMap(ast);
};

const prepend_symbol = (reader, symbolName) => {
  reader.next();
  const symbol = new MalSymbol(symbolName);
  const newAst = read_form(reader);
  return new List([symbol, newAst])
};

const read_form = (reader) => {
  const token = reader.peek();
  if (token === undefined) return Nil;

  switch (token) {
    case '(': return read_list(reader);
    case ')': throw new Error(`unexpected ')'`);

    case '[': return read_vector(reader);
    case ']': throw new Error(`unexpected ']'`);

    case '{': return read_hashmap(reader);
    case '}': throw new Error(`unexpected '}'`);

    case '@': return prepend_symbol(reader, 'deref');
    case '\'': return prepend_symbol(reader, 'quote');
    case '`': return prepend_symbol(reader, 'quasiquote');
    case '~': return prepend_symbol(reader, 'unquote');
    case '~@': return prepend_symbol(reader, 'splice-unquote');
  }

  return read_atom(reader);
};

const read_str = (str) => {
  const tokens = tokenize(str);
  const reader = new Reader(tokens);
  return read_form(reader);
};

module.exports = { read_str };