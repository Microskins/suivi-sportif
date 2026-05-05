import type { CommandResult } from "./command-runner.js";
import { commandResultToText } from "./command-runner.js";

export type TypeScriptError = {
  code: string;
  column: number;
  file: string;
  line: number;
  message: string;
};

export type VitestSummary = {
  duration: string | null;
  failedTests: number | null;
  passedTests: number | null;
  raw: string | null;
};

export function extractTypeScriptErrors(output: string): TypeScriptError[] {
  const errors: TypeScriptError[] = [];
  const pattern = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$/gm;

  for (const match of output.matchAll(pattern)) {
    const [, file, line, column, code, message] = match;

    if (!file || !line || !column || !code || !message) {
      continue;
    }

    errors.push({
      code,
      column: Number(column),
      file,
      line: Number(line),
      message,
    });
  }

  return errors;
}

function extractNumber(pattern: RegExp, output: string): number | null {
  const match = output.match(pattern);
  return match?.[1] ? Number(match[1]) : null;
}

export function extractVitestSummary(output: string): VitestSummary {
  const raw = output.match(/Test Files\s+.+\n\s+Tests\s+.+\n(?:\s+Errors\s+.+\n)?\s+Start at\s+.+\n\s+Duration\s+.+/m)?.[0] ?? null;
  const duration = output.match(/Duration\s+(.+)$/m)?.[1]?.trim() ?? null;
  const testsLine = output.match(/^\s*Tests\s+(.+)$/m)?.[1] ?? "";

  return {
    duration,
    failedTests: extractNumber(/(\d+)\s+failed/m, testsLine),
    passedTests: extractNumber(/(\d+)\s+passed/m, testsLine),
    raw,
  };
}

export function summarizeResult(result: CommandResult): Record<string, unknown> {
  const output = commandResultToText(result);
  const typeScriptErrors = extractTypeScriptErrors(output);
  const vitestSummary = extractVitestSummary(output);

  return {
    command: result.displayCommand,
    durationMs: result.durationMs,
    exitCode: result.exitCode,
    ok: result.ok,
    status: result.status,
    typeScriptErrors:
      typeScriptErrors.length > 0 ? typeScriptErrors.slice(0, 20) : undefined,
    vitestSummary:
      vitestSummary.raw !== null || vitestSummary.duration !== null
        ? vitestSummary
        : undefined,
    output: output.slice(0, 6000),
  };
}
