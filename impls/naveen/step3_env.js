const readline = require('readline');
const { read_str } = require('./reader');
const { print_str } = require('./printer');
const { MalSymbol, List, Vector, HashMap } = require('./types');
const { Env } = require('./env');

const options = {
  input: process.stdin,
  output: process.stdout,
};

const rl = readline.createInterface(options);

const env = new Env();
env.set(new MalSymbol('pi'), Math.PI);
env.set(new MalSymbol('+'), (...args) => {
  if (args.length < 2) args.unshift(0);
  return args.reduce((a, b) => a + b);
});
env.set(new MalSymbol('-'), (...args) => {
  if (args.length < 2) args.unshift(0);
  return args.reduce((a, b) => a - b);
});
env.set(new MalSymbol('*'), (...args) => {
  if (args.length < 2) args.unshift(1);
  return args.reduce((a, b) => a * b);
});
env.set(new MalSymbol('/'), (...args) => {
  if (args.length < 2) args.unshift(1);
  return args.reduce((a, b) => a / b);
});
env.set(new MalSymbol('%'), (...args) => {
  if (args.length < 2) args.unshift(0);
  return args.reduce((a, b) => a % b);
});

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) {
    const val = env.get(ast);
    if (val) return val;
    throw new Error(`symbol '${ast.symbol}' not found`);
  }
  if (ast instanceof List) return new List(ast.ast.map(x => EVAL(x, env)));
  if (ast instanceof Vector) return new Vector(ast.ast.map(x => EVAL(x, env)));
  if (ast instanceof HashMap) {
    const newAst = [];
    for (const [key, value] of ast.hashmap.entries()) newAst.push(EVAL(key, env), EVAL(value, env));
    return new HashMap(newAst);
  }

  return ast;
};

const READ = str => read_str(str);

const EVAL = (ast, env) => {
  if (!(ast instanceof List)) return eval_ast(ast, env);
  if (ast.isEmpty()) return ast;

  const symbol = ast.ast[0].symbol;
  if (symbol === 'def!') return env.set(ast.ast[1], EVAL(ast.ast[2], env));
  if (symbol === 'let*') {
    const newEnv = new Env(env);
    const bindings = ast.ast[1].ast;

    for (let i = 0; i < bindings.length; i += 2) newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
    return EVAL(ast.ast[2], newEnv);
  }

  const [fn, ...args] = eval_ast(ast, env).ast;
  if (!(fn instanceof Function)) throw new Error(`'${fn}' is not a function`);

  return fn.apply(null, args);
};

const PRINT = ast => print_str(ast, true);

const rep = str => PRINT(EVAL(READ(str), env));

const main = () => {
  rl.question('user> ', str => {
    try {
      console.log(rep(str));
    } catch (e) {
      console.log(e.message);
    } finally {
      main();
    }
  });
};

main();
