import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";

export function registerProjectPrompts(server: McpServer) {
  server.registerPrompt(
    "debug-incident",
    {
      argsSchema: {
        symptom: z
          .string()
          .optional()
          .describe("Symptome ou erreur observee par l'utilisateur."),
      },
      description: "Workflow court pour debugger un incident Suivi Sportif.",
      title: "Debug incident",
    },
    ({ symptom }) => ({
      messages: [
        {
          content: {
            text: [
              "Tu aides a debugger Suivi Sportif.",
              "Commence par appeler diagnose_project, puis lis project-state si le contexte manque.",
              "Classe les problemes en environnement, TypeScript/tests, API, Docker ou BDD.",
              "Ne lance une maintenance mutante que si l'utilisateur l'a explicitement demandee.",
              symptom ? `Symptome fourni: ${symptom}` : "Aucun symptome fourni.",
            ].join("\n"),
            type: "text",
          },
          role: "user",
        },
      ],
    }),
  );

  server.registerPrompt(
    "project-context",
    {
      description: "Contexte architecture actuel du projet.",
      title: "Contexte projet",
    },
    () => ({
      messages: [
        {
          content: {
            text: [
              "Suivi Sportif est un monorepo npm.",
              "server: Fastify, TypeScript, Prisma, PostgreSQL, JWT, tests Vitest avec fastify.inject.",
              "client: React 18, Vite, Zustand, Recharts.",
              "La source de verite metier est l'API. Le navigateur ne parle jamais directement a PostgreSQL.",
              "Les reponses API suivent { data }, { data, meta } ou { error, code }.",
            ].join("\n"),
            type: "text",
          },
          role: "user",
        },
      ],
    }),
  );

  server.registerPrompt(
    "nutrition-future-scope",
    {
      description: "Cadre agent pour les questions nutrition/calories.",
      title: "Nutrition",
    },
    () => ({
      messages: [
        {
          content: {
            text: [
              "L'application stocke maintenant des aliments, repas et objectifs nutritionnels via l'API Fastify.",
              "Utilise les outils MCP list/create/update/delete foods, meals et nutrition goals avec un jwtToken utilisateur.",
              "Ne pretends pas calculer des recommandations medicales ou nutritionnelles automatiques: l'app stocke des donnees et objectifs, elle ne remplace pas un professionnel.",
              "Les depenses energetiques et conseils nutrition avances ne sont pas encore modelises.",
            ].join("\n"),
            type: "text",
          },
          role: "user",
        },
      ],
    }),
  );
}
