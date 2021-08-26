const readline = require('readline');
const { read_str } = require('./reader');
const { print_str } = require('./printer');
const { MalSymbol, List, Vector, HashMap, Nil, MalFunction, Str } = require('./types');
const { Env } = require('./env');
const { coreEnv } = require('./core');

const options = {
  input: process.stdin,
  output: process.stdout
};

const rl = readline.createInterface(options);

const env = new Env(coreEnv);
env.set(new MalSymbol('eval'), (ast) => EVAL(ast, env));
env.set(new MalSymbol('*ARGV*'), new List(process.argv.slice(3).map(s => new Str(s))));

const eval_ast = (ast, env) => {
  if (ast instanceof MalSymbol) return env.get(ast);
  if (ast instanceof List) return new List(ast.ast.map(x => EVAL(x, env)));
  if (ast instanceof Vector) return new Vector(ast.ast.map(x => EVAL(x, env)));
  if (ast instanceof HashMap) {
    const newAst = [];
    for (const [key, value] of ast.hashmap.entries()) newAst.push(EVAL(key, env), EVAL(value, env));
    return new HashMap(newAst);
  }

  return ast;
};

const READ = (str) => read_str(str);

const populate = (ast) => {
  let result = new List([]);

  for (let i = ast.ast.length - 1; i >= 0; i--) {
    const elt = ast.ast[i];
    if (elt instanceof List && elt.ast[0] instanceof MalSymbol && elt.ast[0].symbol === 'splice-unquote') {
      result = new List([new MalSymbol('concat'), elt.ast[1], result]);
    } else {
      result = new List([new MalSymbol('cons'), quasiquote(elt), result]);
    }
  }

  return result;
};

const quasiquote = (ast) => {
  if ((ast instanceof HashMap) || (ast instanceof MalSymbol)) return new List([new MalSymbol('quote'), ast]);
  if (ast instanceof List) {
    const firstElement = ast.ast[0];
    if ((firstElement instanceof MalSymbol) && firstElement.symbol === 'unquote') return ast.ast[1];
    return populate(ast);
  }
  return ast;
};

const EVAL = (ast, env) => {
  while (true) {
    if (ast === undefined) return Nil;
    if (!(ast instanceof List)) return eval_ast(ast, env);
    if (ast.isEmpty()) return ast;

    const symbol = ast.ast[0].symbol;
    if (symbol === 'def!') {
      if (ast.ast.length !== 3) throw new Error('Too many arguments to def!');
      return env.set(ast.ast[1], EVAL(ast.ast[2], env));
    }
    if (symbol === 'let*') {
      if (ast.ast.length !== 3) throw new Error('Too many arguments to let*');
      const newEnv = new Env(env);
      const bindings = ast.ast[1].ast;

      for (let i = 0; i < bindings.length; i += 2) newEnv.set(bindings[i], EVAL(bindings[i + 1], newEnv));
      ast = ast.ast[2];
      env = newEnv;
      continue;
    }
    if (symbol === 'do') {
      ast.ast.slice(1, -1).forEach(form => EVAL(form, env));
      ast = ast.ast[ast.ast.length - 1];
      env = env;
      continue;
    }
    if (symbol === 'if') {
      const expr = EVAL(ast.ast[1], env);
      ast = (expr === Nil || expr === false) ? ast.ast[3] : ast.ast[2];
      env = env;
      continue;
    }
    if (symbol === 'fn*') {
      const fnAst = ast.ast[2];
      const fnBinds = ast.ast[1].ast;
      return new MalFunction(fnAst, fnBinds, env, (...exprs) => EVAL(fnAst, Env.create(env, fnBinds, exprs)));
    }
    if (symbol === 'quote') return ast.ast[1];
    if (symbol === 'quasiquote') {
      ast = quasiquote(ast.ast[1]);
      continue;
    }

    const [fn, ...args] = eval_ast(ast, env).ast;

    if (fn instanceof MalFunction) {
      ast = fn.ast;
      env = Env.create(env, fn.binds, args);
      continue;
    }
    if (!(fn instanceof Function)) throw new Error(`'${fn}' is not a function`);

    return fn.apply(null, args);
  }
}

const PRINT = (ast) => print_str(ast, true);

const rep = (str) => PRINT(EVAL(READ(str), env));

rep('(def! not (fn* (x) (if x false true)))');
rep('(def! sqrt (fn* (x) (* x x)))');
rep('(def! load-file (fn* (f) (eval (read-string (str "(do " (slurp f) "\nnil)")))))');

const main = () => {
  rl.question('user> ', (str) => {
    try {
      console.log(rep(str));
    }
    catch (e) {
      console.log(e.message);
    }
    finally {
      main();
    }
  });
};

const executeProgramFile = () => {
  try {
    rep(`(load-file "${process.argv[2]}")`);
  }
  catch (e) {
    console.log(e.message);
  }
  finally {
    process.exit(0);
  }
}

process.argv.length > 2 ? executeProgramFile() : main();