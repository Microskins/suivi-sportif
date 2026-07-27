import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const CLIENT_SOURCE_DIRECTORY = path.resolve("client", "src");
const MAX_LINES = 500;
const MAINTAINED_EXTENSIONS = new Set([".css", ".ts", ".tsx"]);

async function listMaintainedFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nestedFiles = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        return listMaintainedFiles(entryPath);
      }
      return MAINTAINED_EXTENSIONS.has(path.extname(entry.name))
        ? [entryPath]
        : [];
    }),
  );

  return nestedFiles.flat();
}

function countLines(content) {
  if (content.length === 0) return 0;
  const lines = content.split(/\r?\n/).length;
  return content.endsWith("\n") ? lines - 1 : lines;
}

const files = await listMaintainedFiles(CLIENT_SOURCE_DIRECTORY);
const oversizedFiles = [];

for (const file of files) {
  const content = await readFile(file, "utf8");
  const lineCount = countLines(content);
  if (lineCount > MAX_LINES) {
    oversizedFiles.push({
      file: path.relative(process.cwd(), file),
      lineCount,
    });
  }
}

if (oversizedFiles.length > 0) {
  console.error(`Limite depassee: ${MAX_LINES} lignes maximum dans client/src.`);
  for (const oversizedFile of oversizedFiles) {
    console.error(`- ${oversizedFile.file}: ${oversizedFile.lineCount} lignes`);
  }
  process.exitCode = 1;
} else {
  console.info(
    `Limite respectee: ${files.length} fichiers controles, ${MAX_LINES} lignes maximum.`,
  );
}
