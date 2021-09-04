const fs = require('fs');
const { Env } = require('./env');
const { MalValue, MalSymbol, Nil, Str, List, isEqual, Atom, MalSequence, MalFunction  } = require('./types');
const { print_str } = require('./printer');
const { read_str } = require('./reader');

const NOT_A_MAL_SEQUENCE_ERROR = (val) => new Error(`${print_str(val)} is not a List/Vector`);
const NOT_AN_ATOM_ERROR = (val) => new Error(`${print_str(val)} is not an Atom`);
const NOT_A_STRING_ERROR = (val) => new Error(`${print_str(val)} is not a String`);
const FILE_NOT_FOUND_ERROR = (filePath) => new Error(`file '${filePath}' not found`);
const METHOD_NOT_FOUND = (methodName, ast) => new Error(`cannot check '${methodName}' for ${print_str(ast)}`);

const add = (...args) => args.reduce((a, b) => a + b, 0);

const subtract = (...args) => {
  if (args.length < 2) args.unshift(0);
  return args.reduce((a, b) => a - b);
};

const multiply = (...args) => args.reduce((a, b) => a * b, 1);

const divide = (...args) => {
  if (args.length < 2) args.unshift(1);
  return args.reduce((a, b) => a / b);
};

const remainder = (...args) => {
  if (args.length < 2) args.unshift(0);
  return args.reduce((a, b) => a % b);
};

const prn = (...args) => {
  console.log(args.map(x => print_str(x, true)).join(' '));
  return Nil;
}

const println = (...args) => {
  console.log(args.map(x => print_str(x, false)).join(' '));
  return Nil;
};

const pr_str = (...args) => new Str(args.map(x => print_str(x, true)).join(' '));

const str = (...args) => new Str(args.map(x => print_str(x, false)).join(''));

const makeList = (...args) => new List(args);

const isList = (list) => list instanceof List;

const isEmpty = (ast) => {
  if (ast instanceof MalValue) return ast.isEmpty();
  throw METHOD_NOT_FOUND('empty?', ast);
};

const count = (ast) => {
  if (ast instanceof MalValue) return ast.count();
  throw METHOD_NOT_FOUND('count', ast);
};

const isLesser = (...args) => {
  if (args.length < 2) args.unshift(-Infinity);
  return args.reduce((a, b) => a < b);
};

const isLesserOrEqual = (...args) => {
  if (args.length < 2) args.unshift(-Infinity);
  return args.reduce((a, b) => a <= b);
};

const isGreater = (...args) => {
  if (args.length < 2) args.unshift(Infinity);
  return args.reduce((a, b) => a > b);
};

const isGreaterOrEqual = (...args) => {
  if (args.length < 2) args.unshift(Infinity);
  return args.reduce((a, b) => a >= b);
};

const readString = (ast) => {
  if (ast instanceof Str) return read_str(ast.print_str());
  throw NOT_A_STRING_ERROR(ast);
}

const slurp = (ast) => {
  if (!(ast instanceof Str)) throw new Error(`cannot open <${print_str(ast)}> as an InputStream.`);
  const filePath = ast.print_str();

  try {
    return new Str(fs.readFileSync(filePath, 'utf-8'));
  } catch (e) {
    throw FILE_NOT_FOUND_ERROR(filePath);
  }
}

const makeAtom = (val) => new Atom(val);

const isAtom = (val) => (val instanceof Atom);

const derefAtom = (val) => {
  if (val instanceof Atom) return val.value;
  throw NOT_AN_ATOM_ERROR(val);
};

const resetAtom = (atom, val) => {
  if (atom instanceof Atom) return atom.reset(val);
  throw NOT_AN_ATOM_ERROR(atom);
};

const swapAtomValue = (atom, fn, ...params) => {
  if (!(atom instanceof Atom)) throw NOT_AN_ATOM_ERROR(atom);
  const val = fn.apply(null, [atom.value, ...params]);
  return atom.reset(val);
};

const constructNewList = (firstElement, list) => {
  if (!(list instanceof MalSequence)) throw NOT_A_MAL_SEQUENCE_ERROR(list);
  return list.unshift(firstElement);
};

const concatenateLists = (...lists) => {
  if (lists.some(list => !(list instanceof MalSequence))) throw NOT_A_MAL_SEQUENCE_ERROR(list);
  return lists.reduce((ast, list) => ast.concat(list), new List([]));
};

const listToVector = (ast) => {
  if (!(ast instanceof MalSequence)) throw NOT_A_MAL_SEQUENCE_ERROR(ast);
  return ast.toVector();
};

const nth = (list, index) => {
  if (!(list instanceof MalSequence)) throw NOT_A_MAL_SEQUENCE_ERROR(list);
  return list.nth(index);
};

const first = (list) => {
  if (list === Nil) return Nil;
  if (!(list instanceof MalSequence)) throw NOT_A_MAL_SEQUENCE_ERROR(list);
  return list.nth(0);
};

const rest = (list) => {
  if (list === Nil) return new List([]);
  if (!(list instanceof MalSequence)) throw NOT_A_MAL_SEQUENCE_ERROR(list);
  return list.rest(0);
};

const reduce = (list, fn, initialValue) => {
  if (!(list instanceof MalSequence)) throw new Error(`${print_str(list)} is not a List/Vector`);
  if (!(fn instanceof MalFunction)) throw new Error(`${print_str(list)} is not a Function`);
  return list.reduce(fn, initialValue);
};

const map = (list, fn) => {
  if (!(list instanceof MalSequence)) throw new Error(`${print_str(list)} is not a List/Vector`);
  if (!(fn instanceof MalFunction)) throw new Error(`${print_str(list)} is not a Function`);
  return list.map(fn);
};

const filter = (list, fn) => {
  if (!(list instanceof MalSequence)) throw new Error(`${print_str(list)} is not a List/Vector`);
  if (!(fn instanceof MalFunction)) throw new Error(`${print_str(list)} is not a Function`);
  return list.filter(fn);
};

const some = (list, fn) => {
  if (!(list instanceof MalSequence)) throw new Error(`${print_str(list)} is not a List/Vector`);
  if (!(fn instanceof MalFunction)) throw new Error(`${print_str(list)} is not a Function`);
  return list.some(fn);
};

const every = (list, fn) => {
  if (!(list instanceof MalSequence)) throw new Error(`${print_str(list)} is not a List/Vector`);
  if (!(fn instanceof MalFunction)) throw new Error(`${print_str(list)} is not a Function`);
  return list.every(fn);
};

const coreEnv = new Env();

coreEnv.set(new MalSymbol('+'), add);
coreEnv.set(new MalSymbol('-'), subtract);
coreEnv.set(new MalSymbol('*'), multiply);
coreEnv.set(new MalSymbol('/'), divide);
coreEnv.set(new MalSymbol('%'), remainder);
coreEnv.set(new MalSymbol('pi'), Math.PI);

coreEnv.set(new MalSymbol('prn'), prn);
coreEnv.set(new MalSymbol('println'), println);
coreEnv.set(new MalSymbol('pr-str'), pr_str);
coreEnv.set(new MalSymbol('str'), str);

coreEnv.set(new MalSymbol('list'), makeList);
coreEnv.set(new MalSymbol('list?'), isList);
coreEnv.set(new MalSymbol('empty?'), isEmpty);
coreEnv.set(new MalSymbol('count'), count);

coreEnv.set(new MalSymbol('='), isEqual);
coreEnv.set(new MalSymbol('<'), isLesser);
coreEnv.set(new MalSymbol('<='), isLesserOrEqual);
coreEnv.set(new MalSymbol('>'), isGreater);
coreEnv.set(new MalSymbol('>='), isGreaterOrEqual);

coreEnv.set(new MalSymbol('read-string'), readString);
coreEnv.set(new MalSymbol('slurp'), slurp);

coreEnv.set(new MalSymbol('atom'), makeAtom);
coreEnv.set(new MalSymbol('atom?'), isAtom);
coreEnv.set(new MalSymbol('deref'), derefAtom);
coreEnv.set(new MalSymbol('reset!'), resetAtom);
coreEnv.set(new MalSymbol('swap!'), swapAtomValue);

coreEnv.set(new MalSymbol('cons'), constructNewList);
coreEnv.set(new MalSymbol('concat'), concatenateLists);
coreEnv.set(new MalSymbol('vec'), listToVector);
coreEnv.set(new MalSymbol('nth'), nth);
coreEnv.set(new MalSymbol('first'), first);
coreEnv.set(new MalSymbol('rest'), rest);

coreEnv.set(new MalSymbol('reduce'), reduce);
coreEnv.set(new MalSymbol('map'), map);
coreEnv.set(new MalSymbol('filter'), filter);
coreEnv.set(new MalSymbol('some?'), some);
coreEnv.set(new MalSymbol('every?'), every);

module.exports = { coreEnv };
