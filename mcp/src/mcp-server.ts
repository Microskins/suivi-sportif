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
import * as domain from "./tools/domain.js";
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

const jwtTokenSchema = z
  .string()
  .min(1)
  .describe("JWT utilisateur obtenu via /api/users/login.");

const foodInputSchema = {
  barcode: z.string().nullable().optional(),
  brand: z.string().nullable().optional(),
  caloriesKcal: z.number().min(0),
  carbsGrams: z.number().min(0),
  fatGrams: z.number().min(0),
  fiberGrams: z.number().min(0).nullable().optional(),
  name: z.string().min(1),
  proteinGrams: z.number().min(0),
  servingUnit: z.string().min(1).default("g"),
};

const mealItemSchema = z.object({
  foodId: z.string().uuid(),
  quantityGrams: z.number().min(0.01),
});

const mealInputSchema = {
  date: z.string().datetime(),
  items: z.array(mealItemSchema).min(1),
  mealType: z
    .enum(["breakfast", "lunch", "dinner", "snack", "other"])
    .default("other"),
  name: z.string().min(1),
  notes: z.string().nullable().optional(),
};

const nutritionGoalInputSchema = {
  dailyCaloriesKcal: z.number().int().min(0),
  dailyCarbsGrams: z.number().min(0).nullable().optional(),
  dailyFatGrams: z.number().min(0).nullable().optional(),
  dailyProteinGrams: z.number().min(0).nullable().optional(),
  endDate: z.string().datetime().nullable().optional(),
  isActive: z.boolean().default(true),
  name: z.string().min(1),
  startDate: z.string().datetime(),
};

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

  server.registerTool(
    "list_foods",
    {
      annotations: { readOnlyHint: true },
      description:
        "Liste les aliments globaux et personnalisés accessibles à l'utilisateur JWT.",
      inputSchema: { jwtToken: jwtTokenSchema },
      title: "Lister les aliments",
    },
    async ({ jwtToken }) => toolResponse(await domain.listFoods({ jwtToken })),
  );

  server.registerTool(
    "create_food",
    {
      annotations: { idempotentHint: false },
      description:
        "Crée un aliment personnalisé avec kcal et macros pour 100g via l'API.",
      inputSchema: { jwtToken: jwtTokenSchema, ...foodInputSchema },
      title: "Créer un aliment",
    },
    async (input) => toolResponse(await domain.createFood(input)),
  );

  server.registerTool(
    "update_food",
    {
      annotations: { idempotentHint: false },
      description: "Modifie un aliment personnalisé appartenant à l'utilisateur.",
      inputSchema: {
        id: z.string().uuid(),
        jwtToken: jwtTokenSchema,
        ...Object.fromEntries(
          Object.entries(foodInputSchema).map(([key, schema]) => [
            key,
            schema.optional(),
          ]),
        ),
      },
      title: "Modifier un aliment",
    },
    async (input) => toolResponse(await domain.updateFood(input)),
  );

  server.registerTool(
    "delete_food",
    {
      annotations: { destructiveHint: true, idempotentHint: false },
      description: "Supprime un aliment personnalisé appartenant à l'utilisateur.",
      inputSchema: { id: z.string().uuid(), jwtToken: jwtTokenSchema },
      title: "Supprimer un aliment",
    },
    async (input) => toolResponse(await domain.deleteFood(input)),
  );

  server.registerTool(
    "list_meals",
    {
      annotations: { readOnlyHint: true },
      description: "Liste les repas de l'utilisateur JWT.",
      inputSchema: { jwtToken: jwtTokenSchema },
      title: "Lister les repas",
    },
    async ({ jwtToken }) => toolResponse(await domain.listMeals({ jwtToken })),
  );

  server.registerTool(
    "create_meal",
    {
      annotations: { idempotentHint: false },
      description:
        "Crée un repas avec ses aliments et quantités en grammes via l'API.",
      inputSchema: { jwtToken: jwtTokenSchema, ...mealInputSchema },
      title: "Créer un repas",
    },
    async (input) => toolResponse(await domain.createMeal(input)),
  );

  server.registerTool(
    "update_meal",
    {
      annotations: { idempotentHint: false },
      description: "Modifie un repas; si items est fourni, les items sont remplacés.",
      inputSchema: {
        id: z.string().uuid(),
        jwtToken: jwtTokenSchema,
        date: mealInputSchema.date.optional(),
        items: mealInputSchema.items.optional(),
        mealType: mealInputSchema.mealType.optional(),
        name: mealInputSchema.name.optional(),
        notes: mealInputSchema.notes,
      },
      title: "Modifier un repas",
    },
    async (input) => toolResponse(await domain.updateMeal(input)),
  );

  server.registerTool(
    "delete_meal",
    {
      annotations: { destructiveHint: true, idempotentHint: false },
      description: "Supprime un repas de l'utilisateur JWT.",
      inputSchema: { id: z.string().uuid(), jwtToken: jwtTokenSchema },
      title: "Supprimer un repas",
    },
    async (input) => toolResponse(await domain.deleteMeal(input)),
  );

  server.registerTool(
    "list_nutrition_goals",
    {
      annotations: { readOnlyHint: true },
      description: "Liste les objectifs nutritionnels de l'utilisateur JWT.",
      inputSchema: { jwtToken: jwtTokenSchema },
      title: "Lister les objectifs nutrition",
    },
    async ({ jwtToken }) =>
      toolResponse(await domain.listNutritionGoals({ jwtToken })),
  );

  server.registerTool(
    "get_active_nutrition_goal",
    {
      annotations: { readOnlyHint: true },
      description: "Retourne l'objectif nutritionnel actif de l'utilisateur JWT.",
      inputSchema: { jwtToken: jwtTokenSchema },
      title: "Objectif nutrition actif",
    },
    async ({ jwtToken }) =>
      toolResponse(await domain.getActiveNutritionGoal({ jwtToken })),
  );

  server.registerTool(
    "create_nutrition_goal",
    {
      annotations: { idempotentHint: false },
      description:
        "Crée un objectif calories/macros. Un objectif actif désactive les autres objectifs actifs du même utilisateur.",
      inputSchema: { jwtToken: jwtTokenSchema, ...nutritionGoalInputSchema },
      title: "Créer un objectif nutrition",
    },
    async (input) => toolResponse(await domain.createNutritionGoal(input)),
  );

  server.registerTool(
    "update_nutrition_goal",
    {
      annotations: { idempotentHint: false },
      description: "Modifie un objectif nutritionnel de l'utilisateur JWT.",
      inputSchema: {
        id: z.string().uuid(),
        jwtToken: jwtTokenSchema,
        dailyCaloriesKcal: nutritionGoalInputSchema.dailyCaloriesKcal.optional(),
        dailyCarbsGrams: nutritionGoalInputSchema.dailyCarbsGrams,
        dailyFatGrams: nutritionGoalInputSchema.dailyFatGrams,
        dailyProteinGrams: nutritionGoalInputSchema.dailyProteinGrams,
        endDate: nutritionGoalInputSchema.endDate,
        isActive: nutritionGoalInputSchema.isActive.optional(),
        name: nutritionGoalInputSchema.name.optional(),
        startDate: nutritionGoalInputSchema.startDate.optional(),
      },
      title: "Modifier un objectif nutrition",
    },
    async (input) => toolResponse(await domain.updateNutritionGoal(input)),
  );

  server.registerTool(
    "delete_nutrition_goal",
    {
      annotations: { destructiveHint: true, idempotentHint: false },
      description: "Supprime un objectif nutritionnel de l'utilisateur JWT.",
      inputSchema: { id: z.string().uuid(), jwtToken: jwtTokenSchema },
      title: "Supprimer un objectif nutrition",
    },
    async (input) => toolResponse(await domain.deleteNutritionGoal(input)),
  );

  return server;
}
