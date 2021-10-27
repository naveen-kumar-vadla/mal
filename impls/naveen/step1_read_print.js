const readline = require('readline');
const { read_str } = require('./reader');
const { print_str } = require('./printer');

const options = {
  input: process.stdin,
  output: process.stdout,
};

const rl = readline.createInterface(options);

const READ = str => read_str(str);
const EVAL = ast => ast;
const PRINT = ast => print_str(ast, true);

const rep = str => PRINT(EVAL(READ(str)));

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
