// filepath: server/src/lib/photo-gps.fixture.ts
// JPEG minimal portant un bloc EXIF GPS, pour les tests (pas d'image reelle).

const dms = (value: number) => {
  const abs = Math.abs(value);
  const degrees = Math.floor(abs);
  const minutes = Math.floor((abs - degrees) * 60);
  // Secondes au centieme, comme les telephones.
  const seconds = Math.round(((abs - degrees) * 60 - minutes) * 60 * 100);
  return [
    [degrees, 1],
    [minutes, 1],
    [seconds, 100],
  ];
};

export function jpegWithGps(
  lat: number,
  lng: number,
  order: "II" | "MM" = "II",
): Buffer {
  const little = order === "II";
  const tiff = Buffer.alloc(150);
  const u16 = (value: number, at: number) =>
    little ? tiff.writeUInt16LE(value, at) : tiff.writeUInt16BE(value, at);
  const u32 = (value: number, at: number) =>
    little ? tiff.writeUInt32LE(value, at) : tiff.writeUInt32BE(value, at);
  const entry = (
    at: number,
    tag: number,
    type: number,
    count: number,
    value: number,
  ) => {
    u16(tag, at);
    u16(type, at + 2);
    u32(count, at + 4);
    u32(value, at + 8);
  };

  tiff.write(order, 0, "binary");
  u16(42, 2);
  u32(8, 4);
  // IFD0: une seule entree, le pointeur vers le repertoire GPS (offset 26).
  u16(1, 8);
  entry(10, 0x8825, 4, 1, 26);
  u32(0, 22);
  // Repertoire GPS: references N/S, E/W et deux triplets de rationnels.
  u16(4, 26);
  entry(28, 1, 2, 2, 0);
  tiff.write(lat < 0 ? "S" : "N", 36, "binary");
  entry(40, 2, 5, 3, 82);
  entry(52, 3, 2, 2, 0);
  tiff.write(lng < 0 ? "W" : "E", 60, "binary");
  entry(64, 4, 5, 3, 106);
  u32(0, 76);
  [...dms(lat), ...dms(lng)].forEach(([numerator, denominator], index) => {
    u32(numerator, 82 + index * 8);
    u32(denominator, 86 + index * 8);
  });

  const exif = Buffer.concat([Buffer.from("Exif\0\0", "binary"), tiff]);
  const app1 = Buffer.alloc(4);
  app1.writeUInt16BE(0xffe1, 0);
  app1.writeUInt16BE(exif.length + 2, 2);
  return Buffer.concat([
    Buffer.from([0xff, 0xd8]),
    app1,
    exif,
    Buffer.from([0xff, 0xda, 0x00, 0x02, 0xff, 0xd9]),
  ]);
}
