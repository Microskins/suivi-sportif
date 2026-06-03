import { spawn } from "node:child_process";

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";

const processes = [
  { name: "server", args: ["run", "dev", "-w", "server"] },
  { name: "client", args: ["run", "dev", "-w", "client"] },
];

let isShuttingDown = false;

function stopAll(exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  for (const item of processes) {
    item.child?.kill("SIGTERM");
  }

  setTimeout(() => process.exit(exitCode), 250).unref();
}

for (const item of processes) {
  const child = spawn(npmCommand, item.args, {
    env: process.env,
    shell: false,
    stdio: "inherit",
  });

  item.child = child;

  child.on("exit", (code, signal) => {
    if (isShuttingDown) return;

    if (code && code !== 0) {
      console.error(`[${item.name}] exited with code ${code}`);
      stopAll(code);
      return;
    }

    if (signal) {
      console.error(`[${item.name}] stopped by ${signal}`);
      stopAll(1);
    }
  });

  child.on("error", (error) => {
    console.error(`[${item.name}] failed to start: ${error.message}`);
    stopAll(1);
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
