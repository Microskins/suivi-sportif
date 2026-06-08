import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import * as domain from "./domain.js";
import {
  bodyMeasurementInputSchema,
  foodInputSchema,
  jwtTokenSchema,
  mealInputSchema,
  nutritionGoalInputSchema,
  optionalShape,
  profileInputSchema,
  userGoalInputSchema,
  workoutInputSchema,
} from "./domain-tool-schemas.js";

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

export function registerDomainTools(server: McpServer) {
  registerProfileTools(server);
  registerExerciseTools(server);
  registerFoodTools(server);
  registerMealTools(server);
  registerNutritionGoalTools(server);
  registerWorkoutTools(server);
  registerUserGoalTools(server);
  registerBodyMeasurementTools(server);
}

function registerProfileTools(server: McpServer) {
  server.registerTool(
    "get_profile",
    {
      annotations: { readOnlyHint: true },
      description: "Retourne le profil de l'utilisateur JWT.",
      inputSchema: { jwtToken: jwtTokenSchema },
      title: "Lire le profil",
    },
    async ({ jwtToken }) => toolResponse(await domain.getProfile({ jwtToken })),
  );

  server.registerTool(
    "update_profile",
    {
      annotations: { idempotentHint: false },
      description:
        "Modifie le profil de l'utilisateur JWT via /api/users/me. Les champs sensibles gardent currentPassword.",
      inputSchema: { jwtToken: jwtTokenSchema, ...profileInputSchema },
      title: "Modifier le profil",
    },
    async (input) => toolResponse(await domain.updateProfile(input)),
  );
}

function registerExerciseTools(server: McpServer) {
  server.registerTool(
    "list_exercises",
    {
      annotations: { readOnlyHint: true },
      description:
        "Liste les exercices disponibles pour retrouver les ids avant de creer une seance.",
      inputSchema: { jwtToken: jwtTokenSchema },
      title: "Lister les exercices",
    },
    async ({ jwtToken }) =>
      toolResponse(await domain.listExercises({ jwtToken })),
  );
}

function registerFoodTools(server: McpServer) {
  server.registerTool(
    "list_foods",
    {
      annotations: { readOnlyHint: true },
      description:
        "Liste les aliments globaux et personnalises accessibles a l'utilisateur JWT.",
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
        "Cree un aliment personnalise avec kcal et macros pour 100g via l'API.",
      inputSchema: { jwtToken: jwtTokenSchema, ...foodInputSchema },
      title: "Creer un aliment",
    },
    async (input) => toolResponse(await domain.createFood(input)),
  );

  server.registerTool(
    "update_food",
    {
      annotations: { idempotentHint: false },
      description: "Modifie un aliment personnalise appartenant a l'utilisateur.",
      inputSchema: {
        id: z.string().uuid(),
        jwtToken: jwtTokenSchema,
        ...optionalShape(foodInputSchema),
      },
      title: "Modifier un aliment",
    },
    async (input) => toolResponse(await domain.updateFood(input)),
  );

  server.registerTool(
    "delete_food",
    {
      annotations: { destructiveHint: true, idempotentHint: false },
      description: "Supprime un aliment personnalise appartenant a l'utilisateur.",
      inputSchema: { id: z.string().uuid(), jwtToken: jwtTokenSchema },
      title: "Supprimer un aliment",
    },
    async (input) => toolResponse(await domain.deleteFood(input)),
  );
}

function registerMealTools(server: McpServer) {
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
        "Cree un repas avec ses aliments et quantites en grammes via l'API.",
      inputSchema: { jwtToken: jwtTokenSchema, ...mealInputSchema },
      title: "Creer un repas",
    },
    async (input) => toolResponse(await domain.createMeal(input)),
  );

  server.registerTool(
    "update_meal",
    {
      annotations: { idempotentHint: false },
      description: "Modifie un repas; si items est fourni, les items sont remplaces.",
      inputSchema: {
        id: z.string().uuid(),
        jwtToken: jwtTokenSchema,
        ...optionalShape(mealInputSchema),
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
}

function registerNutritionGoalTools(server: McpServer) {
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
        "Cree un objectif calories/macros. Un objectif actif desactive les autres objectifs actifs du meme utilisateur.",
      inputSchema: { jwtToken: jwtTokenSchema, ...nutritionGoalInputSchema },
      title: "Creer un objectif nutrition",
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
        ...optionalShape(nutritionGoalInputSchema),
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
}

function registerWorkoutTools(server: McpServer) {
  server.registerTool(
    "list_workouts",
    {
      annotations: { readOnlyHint: true },
      description: "Liste les seances de l'utilisateur JWT.",
      inputSchema: { jwtToken: jwtTokenSchema },
      title: "Lister les seances",
    },
    async ({ jwtToken }) =>
      toolResponse(await domain.listWorkouts({ jwtToken })),
  );

  server.registerTool(
    "create_workout",
    {
      annotations: { idempotentHint: false },
      description:
        "Cree une seance avec date, duree, statut et exercices via l'API.",
      inputSchema: { jwtToken: jwtTokenSchema, ...workoutInputSchema },
      title: "Creer une seance",
    },
    async (input) => toolResponse(await domain.createWorkout(input)),
  );

  server.registerTool(
    "update_workout",
    {
      annotations: { idempotentHint: false },
      description:
        "Modifie une seance de l'utilisateur JWT; si exercises est fourni, les exercices sont remplaces.",
      inputSchema: {
        id: z.string().uuid(),
        jwtToken: jwtTokenSchema,
        ...optionalShape(workoutInputSchema),
      },
      title: "Modifier une seance",
    },
    async (input) => toolResponse(await domain.updateWorkout(input)),
  );

  server.registerTool(
    "delete_workout",
    {
      annotations: { destructiveHint: true, idempotentHint: false },
      description: "Supprime une seance de l'utilisateur JWT.",
      inputSchema: { id: z.string().uuid(), jwtToken: jwtTokenSchema },
      title: "Supprimer une seance",
    },
    async (input) => toolResponse(await domain.deleteWorkout(input)),
  );
}

function registerUserGoalTools(server: McpServer) {
  server.registerTool(
    "list_user_goals",
    {
      annotations: { readOnlyHint: true },
      description: "Liste les objectifs sport et corps de l'utilisateur JWT.",
      inputSchema: { jwtToken: jwtTokenSchema },
      title: "Lister les objectifs utilisateur",
    },
    async ({ jwtToken }) =>
      toolResponse(await domain.listUserGoals({ jwtToken })),
  );

  server.registerTool(
    "create_user_goal",
    {
      annotations: { idempotentHint: false },
      description:
        "Cree un objectif sport ou corps via l'API /api/user-goals.",
      inputSchema: { jwtToken: jwtTokenSchema, ...userGoalInputSchema },
      title: "Creer un objectif utilisateur",
    },
    async (input) => toolResponse(await domain.createUserGoal(input)),
  );

  server.registerTool(
    "update_user_goal",
    {
      annotations: { idempotentHint: false },
      description: "Modifie un objectif sport ou corps de l'utilisateur JWT.",
      inputSchema: {
        id: z.string().uuid(),
        jwtToken: jwtTokenSchema,
        ...optionalShape(userGoalInputSchema),
      },
      title: "Modifier un objectif utilisateur",
    },
    async (input) => toolResponse(await domain.updateUserGoal(input)),
  );

  server.registerTool(
    "delete_user_goal",
    {
      annotations: { destructiveHint: true, idempotentHint: false },
      description: "Supprime un objectif sport ou corps de l'utilisateur JWT.",
      inputSchema: { id: z.string().uuid(), jwtToken: jwtTokenSchema },
      title: "Supprimer un objectif utilisateur",
    },
    async (input) => toolResponse(await domain.deleteUserGoal(input)),
  );
}

function registerBodyMeasurementTools(server: McpServer) {
  server.registerTool(
    "list_body_measurements",
    {
      annotations: { readOnlyHint: true },
      description: "Liste les mensurations de l'utilisateur JWT.",
      inputSchema: { jwtToken: jwtTokenSchema },
      title: "Lister les mensurations",
    },
    async ({ jwtToken }) =>
      toolResponse(await domain.listBodyMeasurements({ jwtToken })),
  );

  server.registerTool(
    "get_latest_body_measurement",
    {
      annotations: { readOnlyHint: true },
      description: "Retourne la derniere mensuration de l'utilisateur JWT.",
      inputSchema: { jwtToken: jwtTokenSchema },
      title: "Derniere mensuration",
    },
    async ({ jwtToken }) =>
      toolResponse(await domain.getLatestBodyMeasurement({ jwtToken })),
  );

  server.registerTool(
    "create_body_measurement",
    {
      annotations: { idempotentHint: false },
      description:
        "Cree une entree de poids ou mensurations corporelles via l'API.",
      inputSchema: { jwtToken: jwtTokenSchema, ...bodyMeasurementInputSchema },
      title: "Creer une mensuration",
    },
    async (input) => toolResponse(await domain.createBodyMeasurement(input)),
  );

  server.registerTool(
    "update_body_measurement",
    {
      annotations: { idempotentHint: false },
      description: "Modifie une mensuration de l'utilisateur JWT.",
      inputSchema: {
        id: z.string().uuid(),
        jwtToken: jwtTokenSchema,
        ...optionalShape(bodyMeasurementInputSchema),
      },
      title: "Modifier une mensuration",
    },
    async (input) => toolResponse(await domain.updateBodyMeasurement(input)),
  );

  server.registerTool(
    "delete_body_measurement",
    {
      annotations: { destructiveHint: true, idempotentHint: false },
      description: "Supprime une mensuration de l'utilisateur JWT.",
      inputSchema: { id: z.string().uuid(), jwtToken: jwtTokenSchema },
      title: "Supprimer une mensuration",
    },
    async (input) => toolResponse(await domain.deleteBodyMeasurement(input)),
  );
}
