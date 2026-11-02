// filepath: server/src/lib/photo-gps.ts
// Position GPS d'une photo JPEG (bloc EXIF ecrit par les telephones), pour
// placer un repas sur la carte sans chercher son adresse. Lecture minimale et
// defensive: tout fichier inattendu ou tronque donne simplement null.
import type { LngLat } from "../schemas/voyages.js";

const GPS_IFD_POINTER = 0x8825;
const GPS_LATITUDE_REF = 0x0001;
const GPS_LATITUDE = 0x0002;
const GPS_LONGITUDE_REF = 0x0003;
const GPS_LONGITUDE = 0x0004;

type Reader = {
  u16: (offset: number) => number;
  u32: (offset: number) => number;
};

function exifStart(buffer: Buffer): number | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }
  let offset = 2;
  while (offset + 4 <= buffer.length) {
    if (buffer[offset] !== 0xff) return null;
    const marker = buffer[offset + 1];
    // Debut de l'image (SOS) ou fin: plus de metadonnees au-dela.
    if (marker === 0xda || marker === 0xd9) return null;
    const length = buffer.readUInt16BE(offset + 2);
    if (
      marker === 0xe1 &&
      buffer.toString("binary", offset + 4, offset + 10) === "Exif\0\0"
    ) {
      return offset + 10;
    }
    offset += 2 + length;
  }
  return null;
}

// Entrees d'un repertoire TIFF: tag -> position de la valeur (ou de son
// pointeur) dans le fichier.
function readIfd(buffer: Buffer, read: Reader, start: number) {
  const entries = new Map<number, number>();
  const count = read.u16(start);
  for (let index = 0; index < count; index += 1) {
    const entry = start + 2 + index * 12;
    entries.set(read.u16(entry), entry + 8);
  }
  return entries;
}

function readCoordinate(
  buffer: Buffer,
  read: Reader,
  tiff: number,
  valueAt: number | undefined,
  refAt: number | undefined,
  negative: string,
  max: number,
) {
  if (valueAt === undefined || refAt === undefined) return null;
  const at = tiff + read.u32(valueAt);
  const parts = [0, 1, 2].map((index) => {
    const numerator = read.u32(at + index * 8);
    const denominator = read.u32(at + index * 8 + 4);
    return denominator === 0 ? Number.NaN : numerator / denominator;
  });
  const value = parts[0] + parts[1] / 60 + parts[2] / 3600;
  if (!Number.isFinite(value) || value > max) return null;
  const ref = String.fromCharCode(buffer[refAt]).toUpperCase();
  return ref === negative ? -value : value;
}

const round = (value: number) => Math.round(value * 1e6) / 1e6;

export function readPhotoGps(buffer: Buffer): LngLat | null {
  try {
    const tiff = exifStart(buffer);
    if (tiff === null) return null;
    const order = buffer.toString("binary", tiff, tiff + 2);
    if (order !== "II" && order !== "MM") return null;
    const little = order === "II";
    const read: Reader = {
      u16: (offset) =>
        little ? buffer.readUInt16LE(offset) : buffer.readUInt16BE(offset),
      u32: (offset) =>
        little ? buffer.readUInt32LE(offset) : buffer.readUInt32BE(offset),
    };
    if (read.u16(tiff + 2) !== 42) return null;

    const ifd0 = readIfd(buffer, read, tiff + read.u32(tiff + 4));
    const gpsPointer = ifd0.get(GPS_IFD_POINTER);
    if (gpsPointer === undefined) return null;
    const gps = readIfd(buffer, read, tiff + read.u32(gpsPointer));

    const lat = readCoordinate(
      buffer,
      read,
      tiff,
      gps.get(GPS_LATITUDE),
      gps.get(GPS_LATITUDE_REF),
      "S",
      90,
    );
    const lng = readCoordinate(
      buffer,
      read,
      tiff,
      gps.get(GPS_LONGITUDE),
      gps.get(GPS_LONGITUDE_REF),
      "W",
      180,
    );
    // 0,0: position absente que certains appareils ecrivent quand meme.
    if (lat === null || lng === null || (lat === 0 && lng === 0)) return null;
    return [round(lng), round(lat)];
  } catch {
    // Fichier tronque ou pointeur hors limites.
    return null;
  }
}
