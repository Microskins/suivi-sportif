import { describe, expect, it } from "vitest";
import { getCheckPlan } from "../tools/checks.js";

describe("check planning", () => {
  it("uses TMPDIR=/tmp for server tests", () => {
    const [command] = getCheckPlan("test", "server");

    expect(command?.args).toEqual(["run", "test", "-w", "server", "--", "--run"]);
    expect(command?.env).toEqual({ TMPDIR: "/tmp" });
  });

  it("expands all targets without arbitrary commands", () => {
    const commands = getCheckPlan("typecheck", "all");

    expect(commands.map((command) => command.command)).toEqual(["npm", "npm"]);
    expect(commands.map((command) => command.args)).toEqual([
      ["run", "typecheck", "-w", "server"],
      ["run", "typecheck", "-w", "client"],
    ]);
  });
});

