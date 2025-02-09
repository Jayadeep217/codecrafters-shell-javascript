const readline = require("readline");
const { exit } = require("process");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function prompt() {
  rl.question("$ ", (input) => {
    const builtins = new Set(["echo", "exit", "type"]);
    const args = input.trim().split(/\s+/);
    const command = args[0];
    const restOfInput = args.slice(1).join(" ");

    if (command === "exit") {
      const exitCode = parseInt(args[1]);
      exit(exitCode);
    } else if (command === "type") {
      let found = false;
      const cmd = args[1];
      if (builtins.has(cmd)) {
        console.log(`${cmd} is a shell builtin`);
        found = true;
      } else {
        const paths = process.env.PATH.split(path.delimiter);
        for (const pathEnv of paths) {
          let destPath = path.join(pathEnv, cmd);
          if (fs.existsSync(destPath) && fs.statSync(destPath).isFile()) {
            console.log(`${cmd} is ${destPath}\n`);
            found = true;
          }
        }
        if (!found) {
          console.log(`${restOfInput}: not found`);
        }
      }
    } else if (command === "echo") {
      console.log(restOfInput);
    } else {
      console.log(`${command}: command not found`);
    }

    prompt();
  });
}
prompt();
