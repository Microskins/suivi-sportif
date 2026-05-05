import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { config } from "../config.js";
import { redactText, truncateText } from "./redaction.js";

const execFileAsync = promisify(execFile);

export type CommandStatus = "success" | "failed" | "missing" | "timeout";

export type CommandResult = {
  args: string[];
  command: string;
  cwd: string;
  displayCommand: string;
  durationMs: number;
  error: string | null;
  exitCode: number | null;
  ok: boolean;
  status: CommandStatus;
  stderr: string;
  stdout: string;
};

type CommandOptions = {
  cwd?: string;
  env?: NodeJS.ProcessEnv;
  maxBuffer?: number;
  timeoutMs?: number;
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function getErrorCode(error: unknown): string | number | undefined {
  if (typeof error === "object" && error !== null && "code" in error) {
    return (error as { code?: string | number }).code;
  }

  return undefined;
}

function getErrorSignal(error: unknown): string | null {
  if (typeof error === "object" && error !== null && "signal" in error) {
    const signal = (error as { signal?: string | null }).signal;
    return signal ?? null;
  }

  return null;
}

function getErrorOutput(error: unknown, key: "stdout" | "stderr"): string {
  if (typeof error !== "object" || error === null || !(key in error)) {
    return "";
  }

  const output = (error as Record<string, unknown>)[key];

  if (Buffer.isBuffer(output)) {
    return output.toString("utf8");
  }

  return typeof output === "string" ? output : "";
}

export async function runCommand(
  command: string,
  args: string[],
  options: CommandOptions = {},
): Promise<CommandResult> {
  const cwd = options.cwd ?? config.projectRoot;
  const startedAt = Date.now();
  const displayCommand = [command, ...args].join(" ");

  try {
    const { stdout, stderr } = await execFileAsync(command, args, {
      cwd,
      env: { ...process.env, ...options.env },
      maxBuffer: options.maxBuffer ?? 1024 * 1024 * 2,
      timeout: options.timeoutMs ?? 30000,
    });

    return {
      args,
      command,
      cwd,
      displayCommand,
      durationMs: Date.now() - startedAt,
      error: null,
      exitCode: 0,
      ok: true,
      status: "success",
      stderr: truncateText(redactText(stderr)),
      stdout: truncateText(redactText(stdout)),
    };
  } catch (error: unknown) {
    const code = getErrorCode(error);
    const signal = getErrorSignal(error);
    const status =
      code === "ENOENT" ? "missing" : signal === "SIGTERM" ? "timeout" : "failed";

    return {
      args,
      command,
      cwd,
      displayCommand,
      durationMs: Date.now() - startedAt,
      error: redactText(getErrorMessage(error)),
      exitCode: typeof code === "number" ? code : null,
      ok: false,
      status,
      stderr: truncateText(redactText(getErrorOutput(error, "stderr"))),
      stdout: truncateText(redactText(getErrorOutput(error, "stdout"))),
    };
  }
}

export function commandResultToText(result: CommandResult): string {
  const output = [result.stdout, result.stderr].filter(Boolean).join("\n");
  return output || result.error || "";
}

