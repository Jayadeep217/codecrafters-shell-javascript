const readline = require("readline");
const { exit } = require("process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt() {
  rl.question("$ ", (input) => {
    let command = input.split(" ")[0];
    if (input === "exit 0") {
      exit(0);
    } else if (command === "echo") {
      console.log(`${input.replace("echo", "").trim()}`);
    } else {
      console.log(`${input}: command not found`);
    }
    prompt();
  });
}
prompt();
