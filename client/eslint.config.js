// Flat config ESLint 10 pour le workspace client.
//
// Comme cote serveur, la config vit dans le workspace: les paquets
// `@typescript-eslint/*` sont installes dans `client/node_modules`. Node
// remonte vers la racine pour `@eslint/js` et `globals`.
//
// Pas de regles specifiques a React ici: `eslint-plugin-react` et
// `eslint-plugin-react-hooks` ne sont pas installes dans ce depot. Les
// ajouter releverait d'un choix de dependances a part entiere; la config
// pourra les integrer le jour ou ils seront installes.
import js from "@eslint/js";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import globals from "globals";

export default [
  {
    // `e2e/` est une suite Playwright, avec son propre runner et ses propres
    // conventions; elle n'est pas couverte par le lint applicatif.
    ignores: ["dist/**", "node_modules/**", "e2e/**", "public/**"],
  },
  js.configs.recommended,
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 2022,
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,

      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // `no-undef` ne connait pas les types TypeScript et signale des types
      // DOM comme `RequestInit` ou `HeadersInit` comme des variables
      // inexistantes. Le compilateur TypeScript couvre deja ce controle;
      // c'est la recommandation officielle de typescript-eslint.
      "no-undef": "off",

      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];
