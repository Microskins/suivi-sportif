import { config } from "../config.js";
import { runCommand } from "../utils/command-runner.js";
import { summarizeResult } from "../utils/diagnostics.js";
import { checkApiHealth } from "./api.js";
import { dockerAvailability } from "./docker.js";

export const CHECKS = ["typecheck", "test", "build", "lint"] as const;
export const TARGETS = ["server", "client", "all"] as const;

export type CheckName = (typeof CHECKS)[number];
export type CheckTarget = (typeof TARGETS)[number];

export type PlannedCommand = {
  args: string[];
  command: "npm";
  env?: NodeJS.ProcessEnv;
  label: string;
  timeoutMs: number;
};

export function getCheckPlan(
  check: CheckName,
  target: CheckTarget,
): PlannedCommand[] {
  const targets = target === "all" ? ["server", "client"] : [target];

  return targets.map((workspace) => ({
    args:
      check === "test"
        ? ["run", "test", "-w", workspace, "--", "--run"]
        : ["run", check, "-w", workspace],
    command: "npm",
    env: check === "test" && workspace === "server" ? { TMPDIR: "/tmp" } : {},
    label: `${workspace}:${check}`,
    timeoutMs: check === "test" ? 90000 : 60000,
  }));
}

export async function runCheck(check: CheckName, target: CheckTarget) {
  const plannedCommands = getCheckPlan(check, target);
  const results: Array<Record<string, unknown> & { ok: boolean }> = [];

  for (const plannedCommand of plannedCommands) {
    const result = await runCommand(plannedCommand.command, plannedCommand.args, {
      cwd: config.projectRoot,
      env: plannedCommand.env,
      timeoutMs: plannedCommand.timeoutMs,
    });

    results.push({
      label: plannedCommand.label,
      ...summarizeResult(result),
      ok: result.ok,
    });
  }

  return {
    check,
    ok: results.every((result) => result.ok === true),
    results,
    target,
  };
}

export async function diagnoseProject() {
  const [serverTypecheck, clientTypecheck, serverTests, apiHealth, docker] =
    await Promise.all([
      runCheck("typecheck", "server"),
      runCheck("typecheck", "client"),
      runCheck("test", "server"),
      checkApiHealth(),
      dockerAvailability(),
    ]);

  const checks = {
    apiHealth,
    clientTypecheck,
    docker,
    serverTests,
    serverTypecheck,
  };

  return {
    checks,
    ok:
      serverTypecheck.ok &&
      clientTypecheck.ok &&
      serverTests.ok &&
      apiHealth.ok &&
      docker.available,
    summary: {
      apiHealth: apiHealth.ok ? "ok" : "unavailable_or_invalid",
      clientTypecheck: clientTypecheck.ok ? "ok" : "failed",
      docker: docker.available ? "available" : "missing_or_unavailable",
      serverTests: serverTests.ok ? "ok" : "failed",
      serverTypecheck: serverTypecheck.ok ? "ok" : "failed",
    },
  };
}
