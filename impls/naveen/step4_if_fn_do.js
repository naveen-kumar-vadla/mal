const readline = require('readline');
const { read_str } = require('./reader');
const { print_str } = require('./printer');
const { MalSymbol, List, Vector, HashMap, Nil } = require('./types');
const { Env } = require('./env');
const { coreEnv } = require('./core');

const options = {
  input: process.stdin,
  output: process.stdout,
};

const rl = readline.createInterface(options);

const env = new Env(coreEnv);

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

const READ = str => read_str(str);

const EVAL = (ast, env) => {
  if (ast === undefined) return Nil;
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
  if (symbol === 'do') return ast.ast.slice(1).reduce((_, form) => EVAL(form, env), Nil);
  if (symbol === 'if') {
    const expr = EVAL(ast.ast[1], env);
    return expr === Nil || expr === false
      ? EVAL(ast.ast[3], env)
      : EVAL(ast.ast[2], env);
  }
  if (symbol === 'fn*') return (...exprs) => EVAL(ast.ast[2], Env.create(env, ast.ast[1].ast, exprs));

  const [fn, ...args] = eval_ast(ast, env).ast;
  if (!(fn instanceof Function)) throw new Error(`'${fn}' is not a function`);

  return fn.apply(null, args);
};

const PRINT = ast => print_str(ast, true);

const rep = str => PRINT(EVAL(READ(str), env));

rep('(def! not (fn* (x) (if x false true)))');

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
