const readline = require("readline");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function terminateShell(exitCode) {
  if (isNaN(exitCode)) {
    console.error("Invalid exit code");
    return;
  }
  rl.close();
  process.exit(exitCode);
}

function printWorkDir() {
  return process.cwd();
}

function changeDir(args) {
  const newDir = args[1] === '~' ? process.env.HOME || process.env.USERPROFILE : args[1];

  if (!fs.existsSync(newDir)) {
    console.error(`cd: no such file or directory: ${newDir}`);
    return;
  }

  try {
    process.chdir(newDir);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.error(`cd: no such file or directory: ${args[1]}`);
    } else {
      console.error(`cd: ${err.message}`);
    }
  }
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
  const builtins = new Set(["exit", "type", "echo", "pwd", "cd"]);
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
      input = input.replace(command+" ", "");

      switch (command) {
        case "exit":
          terminateShell(Number(args[1]));
          break;
        case "type":
          handleType(args);
          break;
        case "echo":
          console.log(input.replace(/'/g,""));
          break;
        case "pwd":
          console.log(printWorkDir());
          break;
        case "cd":
          changeDir(args);
          break;
        default: {
          const [exists, destPath] = findExternalProgram(command);
          if (exists) {
            const result = spawnSync(command, input.split(" "), {
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

// Handle Ctrl+C gracefully
rl.on("SIGINT", () => {
  console.log("\nUse 'exit' to quit the shell.");
  prompt();
});

prompt();
