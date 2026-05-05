import { config } from "../config.js";
import { runCommand, type CommandResult } from "../utils/command-runner.js";
import { summarizeResult } from "../utils/diagnostics.js";

export const DOCKER_SERVICES = ["api", "client", "all"] as const;

export type DockerService = (typeof DOCKER_SERVICES)[number];

export function normalizeDockerAvailability(result: CommandResult) {
  return {
    available: result.ok,
    message:
      result.status === "missing"
        ? "Docker n'est pas disponible dans ce shell."
        : result.ok
          ? result.stdout.trim()
          : result.stderr || result.error,
    status: result.status,
  };
}

export async function dockerAvailability() {
  const result = await runCommand("docker", ["--version"], {
    cwd: config.projectRoot,
    timeoutMs: 5000,
  });

  return normalizeDockerAvailability(result);
}

export async function dockerStatus() {
  const availability = await dockerAvailability();

  if (!availability.available) {
    return availability;
  }

  const result = await runCommand("docker", ["compose", "ps"], {
    cwd: config.projectRoot,
    timeoutMs: 15000,
  });

  return {
    available: result.ok,
    result: summarizeResult(result),
  };
}

export async function dockerLogs(service: DockerService, tail: number) {
  const availability = await dockerAvailability();

  if (!availability.available) {
    return availability;
  }

  const args =
    service === "all"
      ? ["compose", "logs", "--tail", String(tail)]
      : ["compose", "logs", "--tail", String(tail), service];

  const result = await runCommand("docker", args, {
    cwd: config.projectRoot,
    timeoutMs: 20000,
  });

  return {
    available: result.ok,
    result: summarizeResult(result),
    service,
    tail,
  };
}

