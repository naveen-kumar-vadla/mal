const { Env } = require('./env');
const { MalValue, MalSymbol, Nil, Str, List, isEqual, Atom } = require('./types');
const { print_str } = require('./printer');
const { read_str } = require('./reader');
const fs = require('fs');

const add = (...args) => args.reduce((a, b) => a + b, 0);

const subtract = (...args) => {
  if(args.length < 2) args.unshift(0);
  return args.reduce((a, b) => a - b);
};

const multiply = (...args) => args.reduce((a, b) => a * b, 1);

const divide = (...args) => {
  if(args.length < 2) args.unshift(1);
  return args.reduce((a, b) => a / b);
};

const remainder = (...args) => {
  if(args.length < 2) args.unshift(0);
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

const isList = (list) => (list instanceof List) || (Array.isArray(list));

const isEmpty = (ast) => {
  if(ast instanceof MalValue) return ast.isEmpty();
  if(ast.length !== undefined) return ast.length === 0;
  throw new Error(`cannot check 'empty?' for ${print_str(ast)}`);
};

const count = (ast) => {
  if(ast instanceof MalValue) return ast.count();
  if(ast.length !== undefined) return ast.length;
  throw new Error(`cannot check 'count' for ${print_str(ast)}`);
};

const isLesser = (...args) => {
  if(args.length < 2) args.unshift(-Infinity);
  return args.reduce((a, b) => a < b);
};

const isLesserOrEqual = (...args) => {
  if(args.length < 2) args.unshift(-Infinity);
  return args.reduce((a, b) => a <= b);
};

const isGreater = (...args) => {
  if(args.length < 2) args.unshift(Infinity);
  return args.reduce((a, b) => a > b);
};

const isGreaterOrEqual = (...args) => {
  if(args.length < 2) args.unshift(Infinity);
  return args.reduce((a, b) => a >= b);
};

const readString = (ast) => {
  if (ast instanceof Str) return read_str(ast.print_str());
  throw new Error(`${print_str(ast)} is not String`);
}

const slurp = (ast) => {
  if (!(ast instanceof Str)) throw new Error(`Cannot open <${print_str(ast)}> as an InputStream.`);
  const filePath = print_str(ast);
  
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (e) {
    throw new Error(`File '${filePath}' not found`);
  }
}

const makeAtom = (val) => new Atom(val);

const isAtom = (val) => (val instanceof Atom);

const derefAtom = (val) => {
  if (val instanceof Atom) return val.value;
  throw new Error(`${print_str(val)} is not Atom`);
};

const resetAtom = (atom, val) => {
  if (atom instanceof Atom) return atom.reset(val);
  throw new Error(`${print_str(atom)} is not Atom`);
};

const swapAtomValue = (atom, fn, ...params) => {
  if (!(atom instanceof Atom)) throw new Error(`${print_str(atom)} is not Atom`);
  const val = fn.apply(null, atom.value, ...params);
  return atom.reset(val);
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

module.exports = { coreEnv };