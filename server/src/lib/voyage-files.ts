// filepath: server/src/lib/voyage-files.ts
// Stockage des fichiers du site Voyage (traces GPX et photos) sur disque.
//
// Le nom de fichier est toujours genere ici (uuid + extension deduite du
// contenu): le nom envoye par le client n'est jamais utilise comme chemin, ce
// qui ferme la porte aux traversees de repertoire et aux ecrasements.
import { randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";

export const GPX_MAX_BYTES = 10 * 1024 * 1024;
export const PHOTO_MAX_BYTES = 15 * 1024 * 1024;

export class VoyageFileError extends Error {
  constructor(
    message: string,
    readonly code: "UPLOAD_EMPTY" | "UPLOAD_TYPE_NOT_ALLOWED",
  ) {
    super(message);
    this.name = "VoyageFileError";
  }
}

export function uploadDirectory() {
  return path.resolve(process.env.UPLOAD_DIR ?? "uploads", "voyages");
}

const CONTENT_TYPES: Record<string, string> = {
  gpx: "application/gpx+xml",
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
};

export function contentTypeOf(fileName: string) {
  return (
    CONTENT_TYPES[path.extname(fileName).slice(1)] ?? "application/octet-stream"
  );
}

// Reconnait le format au contenu (signature binaire), pas a l'extension ni
// au Content-Type annonces par le client.
export function detectPhotoExtension(buffer: Buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "jpg";
  }
  if (
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "png";
  }
  if (
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "webp";
  }
  return null;
}

export function looksLikeGpx(buffer: Buffer) {
  const head = buffer.toString("utf8", 0, Math.min(buffer.length, 2048));
  return /^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*)*<gpx[\s>]/i.test(head);
}

async function store(buffer: Buffer, extension: string) {
  const directory = uploadDirectory();
  await mkdir(directory, { recursive: true });
  const fileName = `${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, fileName), buffer, { flag: "wx" });
  return { byteSize: buffer.length, fileName };
}

export async function storeGpx(buffer: Buffer) {
  if (buffer.length === 0) {
    throw new VoyageFileError("Fichier vide", "UPLOAD_EMPTY");
  }
  if (!looksLikeGpx(buffer)) {
    throw new VoyageFileError(
      "Le fichier n'est pas un GPX",
      "UPLOAD_TYPE_NOT_ALLOWED",
    );
  }
  return store(buffer, "gpx");
}

export async function storePhoto(buffer: Buffer) {
  if (buffer.length === 0) {
    throw new VoyageFileError("Fichier vide", "UPLOAD_EMPTY");
  }
  const extension = detectPhotoExtension(buffer);
  if (!extension) {
    throw new VoyageFileError(
      "Format de photo non pris en charge (JPEG, PNG ou WebP)",
      "UPLOAD_TYPE_NOT_ALLOWED",
    );
  }
  return {
    ...(await store(buffer, extension)),
    mimeType: CONTENT_TYPES[extension],
  };
}

export async function openStoredFile(fileName: string) {
  const filePath = path.join(uploadDirectory(), path.basename(fileName));
  try {
    const info = await stat(filePath);
    return info.isFile()
      ? { size: info.size, stream: createReadStream(filePath) }
      : null;
  } catch {
    return null;
  }
}

// Suppression tolerante: un fichier deja absent n'empeche pas de nettoyer la
// base.
export async function deleteStoredFiles(fileNames: string[]) {
  await Promise.all(
    fileNames.map((fileName) =>
      rm(path.join(uploadDirectory(), path.basename(fileName)), {
        force: true,
      }),
    ),
  );
}
