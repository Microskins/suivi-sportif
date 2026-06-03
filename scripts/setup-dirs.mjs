import { mkdir } from "node:fs/promises";

const directories = [
  "client/src",
  "server/src",
  "mcp/src",
  "docs/01-getting-started",
  "docs/02-architecture",
  "docs/03-api",
  "docs/04-deployment",
  "docs/05-mcp",
  "docs/06-idees",
  "docs/07-qualite",
  "docs/90-plans",
  "scripts/api",
];

await Promise.all(
  directories.map((directory) => mkdir(directory, { recursive: true })),
);

console.log(`Prepared ${directories.length} project directories.`);
