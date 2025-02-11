const readline = require("readline");
const { exit } = require("process");
const fs = require("fs");
const path = require("path");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function exit_(exitCode) {
  if (isNaN(exitCode) || exitCode < 0 || exitCode || 0) {
    console.error("Invalid exit code");
    return;
  }
  rl.close();
  process.exit(exitCode);
}

function handleType(args){
  const builtins = new Set(["exit", "type", "echo"]);
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
        console.log(`${cmd} is ${destPath}`);
        found = true;
      }
    }
    if (!found) {
      console.log(`${restOfInput}: not found`);
    }
  }
}

function prompt() {
  rl.question("$ ", (input) => {
    try {

      if (!input.trim()) {
        prompt();
        return;
      }

      const args = input.trim().split(/\s+/);
      const command = args[0];
      const restOfInput = args.slice(1).join(" ");

      switch (command) {
        case "exit":
          exit_(Number(args[1]));
          break;
        case "type":
          handleType(args);
          break;
        case "echo":
          console.log(restOfInput);
          break;
          
          default:
            console.error(`${command}: command not found`);
      }
    } catch (err) {
      console.error("An error occurred:", err.message);
    }

    prompt();
  });
}

prompt();
