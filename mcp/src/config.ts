import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

export const PROJECT_ROOT = path.resolve(currentDir, "../..");
export const MCP_ROOT = path.resolve(PROJECT_ROOT, "mcp");

dotenv.config({
  path: [path.resolve(PROJECT_ROOT, ".env"), path.resolve(MCP_ROOT, ".env")],
  override: false,
});

const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "::1", "[::1]"]);

function parsePort(value: string | undefined): number {
  const port = Number(value ?? 3033);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("MCP_PORT doit etre un port TCP valide");
  }

  return port;
}

function normalizeHostHeader(hostHeader: string | undefined): string | null {
  if (!hostHeader) {
    return null;
  }

  const trimmedHost = hostHeader.trim().toLowerCase();

  if (trimmedHost.startsWith("[")) {
    const endIndex = trimmedHost.indexOf("]");
    return endIndex === -1 ? null : trimmedHost.slice(0, endIndex + 1);
  }

  return trimmedHost.split(":")[0] ?? null;
}

export function isAllowedHostHeader(hostHeader: string | undefined): boolean {
  const host = normalizeHostHeader(hostHeader);
  return host !== null && LOOPBACK_HOSTS.has(host);
}

function resolveHost(value: string | undefined): string {
  const host = value ?? "127.0.0.1";

  if (!LOOPBACK_HOSTS.has(host)) {
    throw new Error("MCP_HOST doit rester limite a une adresse loopback");
  }

  return host;
}

export const config = {
  apiBaseUrl: process.env.MCP_API_BASE_URL ?? "http://127.0.0.1:3001",
  authToken: process.env.MCP_AUTH_TOKEN,
  enableMutations: process.env.MCP_ENABLE_MUTATIONS === "true",
  host: resolveHost(process.env.MCP_HOST),
  mcpRoot: MCP_ROOT,
  port: parsePort(process.env.MCP_PORT),
  projectRoot: PROJECT_ROOT,
};

