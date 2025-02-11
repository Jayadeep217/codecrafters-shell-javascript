const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function exit_(exitCode) {
  if (exitCode !== 0) {
    console.error("Invalid exit code");
    return;
  }
  rl.close();
  process.exit(exitCode || 0);
}

function findExternalProgram(command) {
  try {
    const paths = process.env.PATH.split(path.delimiter);
    for (const pathEnv of paths) {
      const destPath = path.resolve(pathEnv, command);
      try {
        if (fs.statSync(destPath).isFile()) {
          return [true, destPath];
        }
      } catch (err) {
        // Continue searching if file not found in this path
        continue;
      }
    }
    return [false, null];
  } catch (err) {
    console.error("Error while finding external program:", err.message);
    return [false, null];
  }
}

function handleType(args) {
  const builtins = new Set(["exit", "type", "echo"]);
  let found = false;
  
  if (args.length < 2) {
    console.error("type: missing argument");
    return;
  }
  
  const cmd = args[1];
  if (builtins.has(cmd)) {
    console.log(`${cmd} is a shell builtin`);
    found = true;
  } else {
    const [exists, destPath] = findExternalProgram(cmd);
    if (exists) {
      console.log(`${cmd} is ${destPath}`);
      found = true;
    }
  }
  
  if (!found) {
    console.log(`${cmd}: not found`);
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
        default: {
          const exists = findExternalProgram(command)[0];
          if (exists) {
            const result = spawnSync(command, args.slice(1), {
              stdio: "inherit",
            });
            if (result.error) {
              console.error(`Error executing ${command}:`, result.error.message);
            }
          } else {
            console.error(`${command}: command not found`);
          }
        }
      }
    } catch (err) {
      console.error("An error occurred:", err.message);
    }
    prompt();
  });
}

prompt();