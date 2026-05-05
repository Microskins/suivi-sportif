import { describe, expect, it } from "vitest";
import { maintenancePrisma } from "../tools/maintenance.js";

describe("maintenance guardrails", () => {
  it("blocks prisma mutations unless env opt-in is enabled", async () => {
    const result = await maintenancePrisma("push", "CONFIRM");

    expect(result).toEqual({
      allowed: false,
      reason: "MCP_ENABLE_MUTATIONS doit etre egal a true.",
    });
  });
});

