const { Env } = require('./env');
const { MalSymbol, Nil, Str, List, Vector, isEqual } = require('./types');
const { print_str } = require('./printer');

const add = (...args) => {
  if (args.length < 2) args.unshift(0);
  return args.reduce((a, b) => a + b);
};

const subtract = (...args) => {
  if (args.length < 2) args.unshift(0);
  return args.reduce((a, b) => a - b);
};

const multiply = (...args) => {
  if (args.length < 2) args.unshift(1);
  return args.reduce((a, b) => a * b);
};

const divide = (...args) => {
  if (args.length < 2) args.unshift(1);
  return args.reduce((a, b) => a / b);
};

const reminder = (...args) => {
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

const isList = (list) => (list instanceof List);

const isListEmpty = (list) => {
  if(!(list instanceof List) && !(list instanceof Vector)) throw new Error(`cannot check 'empty?' for ${print_str(list)}`);
  return list.isEmpty();
};

const count = (list) => {
  if(!(list instanceof List) && !(list instanceof Vector) && !(list instanceof Str)) throw new Error(`cannot check 'count' for ${print_str(list)}`);
  return list.count();
};

const isLesser = (...args) => {
  if (args.length < 2) args.unshift(-Infinity);
  return args.reduce((a, b) => a < b);
};

const coreEnv = new Env();

coreEnv.set(new MalSymbol('+'), add);
coreEnv.set(new MalSymbol('-'), subtract);
coreEnv.set(new MalSymbol('*'), multiply);
coreEnv.set(new MalSymbol('/'), divide);
coreEnv.set(new MalSymbol('%'), reminder);
coreEnv.set(new MalSymbol('pi'), Math.PI);

coreEnv.set(new MalSymbol('prn'), prn);
coreEnv.set(new MalSymbol('println'), println);
coreEnv.set(new MalSymbol('pr-str'), pr_str);
coreEnv.set(new MalSymbol('str'), str);

coreEnv.set(new MalSymbol('list'), makeList);
coreEnv.set(new MalSymbol('list?'), isList);
coreEnv.set(new MalSymbol('empty?'), isListEmpty);
coreEnv.set(new MalSymbol('count?'), count);

coreEnv.set(new MalSymbol('='), isEqual);
coreEnv.set(new MalSymbol('<'), isLesser);

module.exports = { coreEnv };