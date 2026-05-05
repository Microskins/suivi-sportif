import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import { registerProjectPrompts } from "./prompts/project-prompts.js";
import { registerProjectResources } from "./resources/project-resources.js";
import { checkApiHealth } from "./tools/api.js";
import { CHECKS, TARGETS, diagnoseProject, runCheck } from "./tools/checks.js";
import {
  DOCKER_SERVICES,
  dockerLogs,
  dockerStatus,
} from "./tools/docker.js";
import { dbSummary } from "./tools/db.js";
import {
  PRISMA_ACTIONS,
  dockerRestartService,
  maintenancePrisma,
} from "./tools/maintenance.js";

function toolResponse(value: Record<string, unknown>) {
  return {
    content: [
      {
        text: JSON.stringify(value, null, 2),
        type: "text" as const,
      },
    ],
    structuredContent: value,
  };
}

export function createMcpServer() {
  const server = new McpServer(
    {
      name: "suivi-sportif-debug",
      version: "1.0.0",
    },
    {
      capabilities: {
        logging: {},
      },
      instructions:
        "Serveur MCP local de debug pour Suivi Sportif. Utilise uniquement les outils allowlistes et respecte les garde-fous de mutation.",
    },
  );

  registerProjectResources(server);
  registerProjectPrompts(server);

  server.registerTool(
    "diagnose_project",
    {
      annotations: {
        readOnlyHint: true,
      },
      description:
        "Lance les diagnostics principaux: typecheck serveur/client, tests serveur avec TMPDIR=/tmp, health API et disponibilite Docker.",
      title: "Diagnostiquer le projet",
    },
    async () => toolResponse(await diagnoseProject()),
  );

  server.registerTool(
    "run_check",
    {
      annotations: {
        readOnlyHint: true,
      },
      description:
        "Lance un check npm allowliste sans formatter ni commande arbitraire.",
      inputSchema: {
        check: z.enum(CHECKS).describe("Check a lancer."),
        target: z.enum(TARGETS).describe("Workspace cible."),
      },
      title: "Lancer un check",
    },
    async ({ check, target }) => toolResponse(await runCheck(check, target)),
  );

  server.registerTool(
    "check_api_health",
    {
      annotations: {
        readOnlyHint: true,
      },
      description: "Verifie GET /health et le format de reponse { data }.",
      title: "Verifier health API",
    },
    async () => toolResponse(await checkApiHealth()),
  );

  server.registerTool(
    "docker_status",
    {
      annotations: {
        readOnlyHint: true,
      },
      description:
        "Execute docker compose ps si Docker est disponible dans ce shell.",
      title: "Statut Docker",
    },
    async () => toolResponse(await dockerStatus()),
  );

  server.registerTool(
    "docker_logs",
    {
      annotations: {
        readOnlyHint: true,
      },
      description: "Lit les logs Docker Compose avec une limite de lignes.",
      inputSchema: {
        service: z.enum(DOCKER_SERVICES).default("all"),
        tail: z.number().int().min(1).max(500).default(100),
      },
      title: "Logs Docker",
    },
    async ({ service, tail }) =>
      toolResponse(await dockerLogs(service, tail)),
  );

  server.registerTool(
    "db_summary",
    {
      annotations: {
        readOnlyHint: true,
      },
      description:
        "Lit un resume Prisma redige: compteurs et elements recents sans emails complets.",
      title: "Resume BDD",
    },
    async () => toolResponse(await dbSummary()),
  );

  server.registerTool(
    "maintenance_prisma",
    {
      annotations: {
        destructiveHint: true,
        idempotentHint: false,
      },
      description:
        "Lance une action Prisma de maintenance uniquement avec MCP_ENABLE_MUTATIONS=true et confirm=CONFIRM.",
      inputSchema: {
        action: z.enum(PRISMA_ACTIONS),
        confirm: z.string(),
      },
      title: "Maintenance Prisma",
    },
    async ({ action, confirm }) =>
      toolResponse(await maintenancePrisma(action, confirm)),
  );

  server.registerTool(
    "docker_restart_service",
    {
      annotations: {
        destructiveHint: true,
        idempotentHint: false,
      },
      description:
        "Redemarre un service Docker Compose uniquement avec MCP_ENABLE_MUTATIONS=true et confirm=CONFIRM.",
      inputSchema: {
        confirm: z.string(),
        service: z.enum(DOCKER_SERVICES),
      },
      title: "Redemarrer Docker",
    },
    async ({ confirm, service }) =>
      toolResponse(await dockerRestartService(service, confirm)),
  );

  return server;
}

