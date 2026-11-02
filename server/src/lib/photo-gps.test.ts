import { describe, expect, it } from "vitest";
import { readPhotoGps } from "./photo-gps.js";
import { jpegWithGps } from "./photo-gps.fixture.js";

describe("position GPS d'une photo", () => {
  it("lit la position notee par le telephone, dans les deux ordres d'octets", () => {
    const [lng, lat] = readPhotoGps(jpegWithGps(55.9489, -3.1955))!;
    expect(lat).toBeCloseTo(55.9489, 4);
    expect(lng).toBeCloseTo(-3.1955, 4);

    const [lngMm, latMm] = readPhotoGps(jpegWithGps(-33.8568, 151.2153, "MM"))!;
    expect(latMm).toBeCloseTo(-33.8568, 4);
    expect(lngMm).toBeCloseTo(151.2153, 4);
  });

  it("rend null sans position exploitable", () => {
    // JPEG sans EXIF, PNG, fichier tronque, position 0,0.
    expect(
      readPhotoGps(Buffer.from([0xff, 0xd8, 0xff, 0xda, 0x00, 0x02])),
    ).toBeNull();
    expect(
      readPhotoGps(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a])),
    ).toBeNull();
    expect(readPhotoGps(jpegWithGps(55.9, -3.2).subarray(0, 60))).toBeNull();
    expect(readPhotoGps(jpegWithGps(0, 0))).toBeNull();
  });
});
