const { Env } = require('./env');
const { MalSymbol, Nil } = require('./types');
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

const coreEnv = new Env();

coreEnv.set(new MalSymbol('+'), add);
coreEnv.set(new MalSymbol('-'), subtract);
coreEnv.set(new MalSymbol('*'), multiply);
coreEnv.set(new MalSymbol('/'), divide);
coreEnv.set(new MalSymbol('%'), reminder);
coreEnv.set(new MalSymbol('pi'), Math.PI);
coreEnv.set(new MalSymbol('prn'), prn);

module.exports = { coreEnv };