const readline = require('readline');
const { read_str } = require('./reader');
const { print_str } = require('./printer');
const { MalSymbol, List, Vector } = require('./types');

const options = {
  input: process.stdin,
  output: process.stdout
};

const rl = readline.createInterface(options);

const env = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => a / b,
  '%': (a, b) => a % b,
  'pi': Math.PI
};

const eval_ast = (ast, env) => {
  if(ast instanceof MalSymbol) {
    const val = env[ast.symbol];
    if(val) return val;
    throw new Error(`symbol '${ast.symbol}' not found`);
  }
  if(ast instanceof List) return new List(ast.ast.map(x => EVAL(x, env)));
  if(ast instanceof Vector) return new Vector(ast.ast.map(x => EVAL(x, env)));

  return ast;
};

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  if(!(ast instanceof List)) return eval_ast(ast, env);
  if(ast.isEmpty()) return ast;

  const [fn, ...args] = eval_ast(ast, env).ast;
  if(!(fn instanceof Function)) throw new Error(`'${fn}' is not a function`);

  return fn.apply(null, args);
}

const PRINT = (ast) => print_str(ast, true);

const rep = (str) => PRINT(EVAL(READ(str), env));

const main = () => {
  rl.question('user> ', (str) => {
    try {
      console.log(rep(str));
    } 
    catch(e) {
      console.log(e.message);
    }
    finally {
      main();
    }
  });
};

main();