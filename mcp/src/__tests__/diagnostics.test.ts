import { describe, expect, it } from "vitest";
import {
  extractTypeScriptErrors,
  extractVitestSummary,
} from "../utils/diagnostics.js";

describe("diagnostics", () => {
  it("extracts TypeScript errors", () => {
    const errors = extractTypeScriptErrors(
      "src/file.ts(12,7): error TS7006: Parameter 'x' implicitly has an 'any' type.",
    );

    expect(errors).toEqual([
      {
        code: "TS7006",
        column: 7,
        file: "src/file.ts",
        line: 12,
        message: "Parameter 'x' implicitly has an 'any' type.",
      },
    ]);
  });

  it("extracts Vitest summaries", () => {
    const summary = extractVitestSummary(`
 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 44 passed (45)
   Start at  11:55:13
   Duration  62.05s
`);

    expect(summary.failedTests).toBe(1);
    expect(summary.passedTests).toBe(44);
    expect(summary.duration).toBe("62.05s");
  });
});

