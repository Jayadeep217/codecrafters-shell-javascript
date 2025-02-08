const readline = require("readline");
const { exit } = require("process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt() {
  rl.question("$ ", (input) => {
    const builtins = ["echo", "exit", "type"];
    let input_arr = input.split(" ");
    let primary_command = input_arr[0];
    if (input === "exit 0") {
      exit(0);
    } else if (primary_command === "type") {
      let cmd = input_arr[1].trim();
      if (builtins.includes(cmd)) {
        console.log(`${cmd} is a shell builtin`);
      } else {
        console.log(`${cmd}: not found`);
      }
    } else if (primary_command === "echo") {
      console.log(`${input.replace("echo", "").trim()}`);
    } else {
      console.log(`${input}: command not found`);
    }
    prompt();
  });
}

prompt();
