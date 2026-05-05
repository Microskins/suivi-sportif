import { config } from "../config.js";
import { runCommand } from "../utils/command-runner.js";
import { summarizeResult } from "../utils/diagnostics.js";
import type { DockerService } from "./docker.js";

export const PRISMA_ACTIONS = ["generate", "push", "migrate", "seed"] as const;

export type PrismaAction = (typeof PRISMA_ACTIONS)[number];

function assertMutationAllowed(confirm: string) {
  if (!config.enableMutations) {
    return {
      allowed: false,
      reason: "MCP_ENABLE_MUTATIONS doit etre egal a true.",
    };
  }

  if (confirm !== "CONFIRM") {
    return {
      allowed: false,
      reason: 'L input confirm doit valoir exactement "CONFIRM".',
    };
  }

  return { allowed: true, reason: null };
}

export async function maintenancePrisma(action: PrismaAction, confirm: string) {
  const guard = assertMutationAllowed(confirm);

  if (!guard.allowed) {
    return guard;
  }

  const scriptByAction: Record<PrismaAction, string> = {
    generate: "db:generate",
    migrate: "db:migrate",
    push: "db:push",
    seed: "db:seed",
  };

  const result = await runCommand("npm", ["run", scriptByAction[action], "-w", "server"], {
    cwd: config.projectRoot,
    timeoutMs: 120000,
  });

  return {
    action,
    allowed: true,
    result: summarizeResult(result),
  };
}

export async function dockerRestartService(
  service: DockerService,
  confirm: string,
) {
  const guard = assertMutationAllowed(confirm);

  if (!guard.allowed) {
    return guard;
  }

  const args =
    service === "all"
      ? ["compose", "restart"]
      : ["compose", "restart", service];

  const result = await runCommand("docker", args, {
    cwd: config.projectRoot,
    timeoutMs: 60000,
  });

  return {
    allowed: true,
    result: summarizeResult(result),
    service,
  };
}

