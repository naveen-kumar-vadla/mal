const readline = require('readline');
const { read_str } = require('./reader');
const { print_str } = require('./printer');
const { MalSymbol, List, Vector, HashMap, Nil, MalFunction } = require('./types');
const { Env } = require('./env');
const { coreEnv } = require('./core');

const options = {
  input: process.stdin,
  output: process.stdout
};

const rl = readline.createInterface(options);

const env = new Env(coreEnv);
env.set(new MalSymbol('eval'), (ast) => EVAL(ast, env));

const eval_ast = (ast, env) => {
  if(ast instanceof MalSymbol) return env.get(ast);
  if(ast instanceof List) return new List(ast.ast.map(x => EVAL(x, env)));
  if(ast instanceof Vector) return new Vector(ast.ast.map(x => EVAL(x, env)));
  if(ast instanceof HashMap) {
    const newAst = [];
    for(const [key, value] of ast.hashmap.entries()) newAst.push(EVAL(key, env), EVAL(value, env));
    return new HashMap(newAst);
  }

  return ast;
};

const READ = (str) => read_str(str);

const EVAL = (ast, env) => {
  while(true) {
    if(ast === undefined) return Nil;
    if(!(ast instanceof List)) return eval_ast(ast, env);
    if(ast.isEmpty()) return ast;

    const symbol = ast.ast[0].symbol;
    if(symbol === 'def!') {
      if(ast.ast.length !== 3) throw new Error('Too many arguments to def!');
      return env.set(ast.ast[1], EVAL(ast.ast[2], env));
    }
    if(symbol === 'let*') {
      if(ast.ast.length !== 3) throw new Error('Too many arguments to let*');
      const newEnv = new Env(env);
      const bindings = ast.ast[1].ast;

      for(let i = 0; i < bindings.length; i += 2) newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
      ast = ast.ast[2];
      env = newEnv;
      continue;
    }
    if(symbol === 'do') {
      ast.ast.slice(1, -1).forEach(form => EVAL(form, env));
      ast = ast.ast[ast.ast.length - 1];
      env = env;
      continue;
    }
    if(symbol === 'if') {
      const expr = EVAL(ast.ast[1], env);
      ast = (expr === Nil || expr === false) ? ast.ast[3] : ast.ast[2];
      env = env;
      continue;
    }
    if(symbol === 'fn*') {
      return new MalFunction(ast.ast[2], ast.ast[1].ast, env);
    }

    const [fn, ...args]=eval_ast(ast, env).ast;
    
    if(fn instanceof MalFunction) {
      ast = fn.ast;
      env = Env.create(env, fn.binds, args);
      continue;
    }
    if(!(fn instanceof Function)) throw new Error(`'${fn}' is not a function`);

    return fn.apply(null, args);
  }
}

const PRINT = (ast) => print_str(ast, true);

const rep = (str) => PRINT(EVAL(READ(str), env));

rep('(def! not (fn* (x) (if x false true)))');
rep('(def! sqrt (fn* (x) (* x x)))');

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