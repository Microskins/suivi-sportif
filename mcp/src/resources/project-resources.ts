import fs from "node:fs/promises";
import path from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { config } from "../config.js";
import { runCommand } from "../utils/command-runner.js";
import { redactObject, redactText } from "../utils/redaction.js";
import { checkApiHealth } from "../tools/api.js";
import { dbSummary } from "../tools/db.js";
import { dockerAvailability } from "../tools/docker.js";

async function readJsonFile(filePath: string) {
  const content = await fs.readFile(filePath, "utf8");
  return JSON.parse(content) as unknown;
}

function jsonResource(uri: string, value: unknown) {
  return {
    contents: [
      {
        mimeType: "application/json",
        text: JSON.stringify(redactObject(value), null, 2),
        uri,
      },
    ],
  };
}

function textResource(uri: string, text: string, mimeType = "text/plain") {
  return {
    contents: [
      {
        mimeType,
        text: redactText(text),
        uri,
      },
    ],
  };
}

export function registerProjectResources(server: McpServer) {
  server.registerResource(
    "project-state",
    "suivi-sportif://project/state",
    {
      description: "Etat redige du depot local et des principaux prerequis.",
      mimeType: "application/json",
      title: "Etat projet",
    },
    async (uri) => {
      const [gitStatus, docker, apiHealth] = await Promise.all([
        runCommand("git", ["status", "--short"], {
          cwd: config.projectRoot,
          timeoutMs: 5000,
        }),
        dockerAvailability(),
        checkApiHealth(),
      ]);

      return jsonResource(uri.href, {
        apiHealth,
        docker,
        git: {
          changedFiles: gitStatus.stdout
            .split("\n")
            .filter((line) => line.trim().length > 0).length,
          ok: gitStatus.ok,
          status: gitStatus.stdout,
        },
        projectRoot: config.projectRoot,
      });
    },
  );

  server.registerResource(
    "project-scripts",
    "suivi-sportif://project/scripts",
    {
      description: "Scripts npm disponibles dans les workspaces racine, serveur, client et MCP.",
      mimeType: "application/json",
      title: "Scripts projet",
    },
    async (uri) => {
      const [rootPackage, serverPackage, clientPackage, mcpPackage] =
        await Promise.all([
          readJsonFile(path.resolve(config.projectRoot, "package.json")),
          readJsonFile(path.resolve(config.projectRoot, "server/package.json")),
          readJsonFile(path.resolve(config.projectRoot, "client/package.json")),
          readJsonFile(path.resolve(config.projectRoot, "mcp/package.json")),
        ]);

      return jsonResource(uri.href, {
        client: (clientPackage as { scripts?: unknown }).scripts,
        mcp: (mcpPackage as { scripts?: unknown }).scripts,
        root: (rootPackage as { scripts?: unknown }).scripts,
        server: (serverPackage as { scripts?: unknown }).scripts,
      });
    },
  );

  server.registerResource(
    "prisma-schema",
    "suivi-sportif://project/prisma-schema",
    {
      description: "Schema Prisma actuel du backend.",
      mimeType: "text/plain",
      title: "Schema Prisma",
    },
    async (uri) => {
      const schema = await fs.readFile(
        path.resolve(config.projectRoot, "server/prisma/schema.prisma"),
        "utf8",
      );

      return textResource(uri.href, schema, "text/plain");
    },
  );

  server.registerResource(
    "openapi",
    "suivi-sportif://project/openapi",
    {
      description: "OpenAPI JSON si l'API locale est disponible.",
      mimeType: "application/json",
      title: "OpenAPI locale",
    },
    async (uri) => {
      try {
        const response = await fetch(new URL("/docs/json", config.apiBaseUrl), {
          signal: AbortSignal.timeout(5000),
        });
        const body = await response.json();
        return jsonResource(uri.href, {
          available: response.ok,
          body,
          status: response.status,
        });
      } catch (error: unknown) {
        return jsonResource(uri.href, {
          available: false,
          reason: error instanceof Error ? error.message : String(error),
        });
      }
    },
  );

  server.registerResource(
    "environment-summary",
    "suivi-sportif://project/environment",
    {
      description: "Resume redige de l'environnement local MCP.",
      mimeType: "application/json",
      title: "Environnement",
    },
    async (uri) => {
      const [npmVersion, prismaVersion, docker] = await Promise.all([
        runCommand("npm", ["--version"], { timeoutMs: 5000 }),
        runCommand("npm", ["exec", "prisma", "--", "--version"], {
          cwd: path.resolve(config.projectRoot, "server"),
          timeoutMs: 15000,
        }),
        dockerAvailability(),
      ]);

      return jsonResource(uri.href, {
        docker,
        env: {
          databaseUrl: Boolean(process.env.DATABASE_URL),
          mcpAuthToken: Boolean(config.authToken),
          mcpEnableMutations: config.enableMutations,
        },
        node: process.version,
        npm: npmVersion.stdout.trim() || npmVersion.error,
        prisma: prismaVersion.stdout || prismaVersion.error,
      });
    },
  );

  server.registerResource(
    "db-summary",
    "suivi-sportif://project/db-summary",
    {
      description: "Resume base de donnees redige, sans secrets ni emails complets.",
      mimeType: "application/json",
      title: "Resume BDD",
    },
    async (uri) => jsonResource(uri.href, await dbSummary()),
  );
}

