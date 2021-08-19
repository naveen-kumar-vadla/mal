const readline = require('readline');

const options = {
  input: process.stdin,
  output: process.stdout
};

const rl = readline.createInterface(options);

const READ = (str) => str;
const EVAL = (str) => str;
const PRINT = (str) => str;

const rep = (str) => PRINT(EVAL(READ(str)));

const main = () => {
  rl.question('user> ', (str) => {
    console.log(rep(str));
    main();
  });
};

main();