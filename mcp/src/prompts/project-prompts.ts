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
      description: "Cadre agent pour les futures questions nutrition/calories.",
      title: "Nutrition future",
    },
    () => ({
      messages: [
        {
          content: {
            text: [
              "L'application ne stocke pas encore les repas, calories, objectifs nutritionnels ou depenses energetiques.",
              "Un agent ne doit donc pas pretendre lire des donnees nutrition internes.",
              "Pour repondre a une question comme 'quoi manger ce soir pour ne pas etre en surplus kcal', demander les donnees necessaires ou utiliser uniquement des entrees fournies par l'utilisateur.",
              "Ne cree pas de modele Prisma/API/UI nutrition sans demande explicite.",
            ].join("\n"),
            type: "text",
          },
          role: "user",
        },
      ],
    }),
  );
}

