import { describe, expect, it } from "vitest";
import { normalizeDockerAvailability } from "../tools/docker.js";
import type { CommandResult } from "../utils/command-runner.js";

function commandResult(status: CommandResult["status"]): CommandResult {
  return {
    args: ["--version"],
    command: "docker",
    cwd: "/repo",
    displayCommand: "docker --version",
    durationMs: 1,
    error: status === "missing" ? "spawn docker ENOENT" : null,
    exitCode: null,
    ok: status === "success",
    status,
    stderr: "",
    stdout: status === "success" ? "Docker version 27" : "",
  };
}

describe("docker diagnostics", () => {
  it("reports missing docker as a prerequisite issue", () => {
    const result = normalizeDockerAvailability(commandResult("missing"));

    expect(result.available).toBe(false);
    expect(result.message).toContain("Docker n'est pas disponible");
  });

  it("reports available docker", () => {
    const result = normalizeDockerAvailability(commandResult("success"));

    expect(result.available).toBe(true);
    expect(result.message).toBe("Docker version 27");
  });
});

