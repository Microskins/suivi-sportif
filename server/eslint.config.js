// Flat config ESLint 10 pour le workspace serveur.
//
// La config vit dans le workspace et non a la racine: les paquets
// `@typescript-eslint/*` sont installes dans `server/node_modules`, pas a la
// racine. Node remonte vers la racine pour `@eslint/js` et `globals`, qui
// eux y sont hoistes.
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "prisma/**"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      // `no-unused-vars` de base ne comprend pas les types TypeScript et
      // produit des faux positifs; la version TypeScript la remplace.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // Le code existant utilise `catch (error: any)` de facon systematique.
      // En "warn" plutot qu'en "error" pour que le lint soit exploitable des
      // maintenant, sans transformer sa mise en place en chantier de typage.
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
