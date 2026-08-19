// Verifie qu'un site de `client/src/sites` n'importe jamais un autre site.
//
// La regle est documentee dans `docs/02-architecture/project-structure.md`:
// chaque site est autonome, et tout code reellement partage par au moins deux
// sites doit passer par `client/src/shared`. Jusqu'ici la regle ne reposait
// que sur la discipline; ce controle la rend verifiable.
//
// Le sens autorise reste `client/src/app` -> `sites/*`: la couche de
// selection de site doit bien pouvoir monter chaque site.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const SITES_DIRECTORY = path.resolve("client", "src", "sites");
const INSPECTED_EXTENSIONS = new Set([".ts", ".tsx"]);

// Couvre les imports statiques, les exports re-exportes et les imports
// dynamiques: `from "..."`, `import "..."` et `import("...")`.
const IMPORT_PATTERN = /(?:from|import)\s*\(?\s*["']([^"']+)["']/g;

async function listInspectedFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listInspectedFiles(entryPath);
      }
      return INSPECTED_EXTENSIONS.has(path.extname(entry.name))
        ? [entryPath]
        : [];
    }),
  );

  return nestedFiles.flat();
}

// Resout l'import et rend le site cible, ou null si l'import ne sort pas du
// site courant. On resout le chemin reel plutot que de filtrer sur le texte:
// une remontee du type `../../autre-site/x` doit etre detectee aussi bien
// qu'un `@/sites/autre-site/x`.
function resolveTargetSite(fromFile, importPath) {
  if (!importPath.startsWith(".")) {
    const aliasMatch = importPath.match(/(?:^|\/)sites\/([^/]+)/);
    return aliasMatch ? aliasMatch[1] : null;
  }

  const resolved = path.resolve(path.dirname(fromFile), importPath);
  const relativeToSites = path.relative(SITES_DIRECTORY, resolved);

  if (relativeToSites.startsWith("..") || path.isAbsolute(relativeToSites)) {
    return null;
  }

  return relativeToSites.split(path.sep)[0] || null;
}

function siteOf(file) {
  return path.relative(SITES_DIRECTORY, file).split(path.sep)[0];
}

const files = await listInspectedFiles(SITES_DIRECTORY);
const violations = [];

for (const file of files) {
  const content = await readFile(file, "utf8");
  const currentSite = siteOf(file);

  for (const match of content.matchAll(IMPORT_PATTERN)) {
    const targetSite = resolveTargetSite(file, match[1]);
    if (targetSite && targetSite !== currentSite) {
      violations.push({
        file: path.relative(process.cwd(), file),
        importPath: match[1],
        currentSite,
        targetSite,
      });
    }
  }
}

if (violations.length > 0) {
  console.error(
    "Frontiere entre sites franchie: un site ne doit pas importer un autre site.",
  );
  for (const violation of violations) {
    console.error(
      `- ${violation.file}: importe "${violation.importPath}" (${violation.currentSite} -> ${violation.targetSite})`,
    );
  }
  console.error(
    "Extraire le code commun dans client/src/shared plutot que de coupler deux sites.",
  );
  process.exitCode = 1;
} else {
  console.info(
    `Frontieres respectees: ${files.length} fichiers controles dans client/src/sites.`,
  );
}
