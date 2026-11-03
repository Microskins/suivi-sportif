import { describe, expect, it } from "vitest";
import { gpxEndpoints } from "./gpx-endpoints.js";

describe("depart et arrivee d'une trace GPX", () => {
  it("lit le premier et le dernier point, en [lng, lat]", () => {
    const gpx = `<?xml version="1.0"?><gpx><trk><trkseg>
      <trkpt lat="57.5009" lon="-6.1586"><ele>10</ele></trkpt>
      <trkpt lon="-6.17" lat='57.51'/>
      <trkpt lat="57.5201" lon="-6.1802"></trkpt>
    </trkseg></trk></gpx>`;
    expect(gpxEndpoints(gpx)).toEqual({
      start: [-6.1586, 57.5009],
      end: [-6.1802, 57.5201],
    });
  });

  it("accepte un itineraire (rtept) et ignore les points illisibles", () => {
    const gpx = `<gpx><rte><rtept lat="x" lon="1"/><rtept lat="45" lon="6"/></rte></gpx>`;
    expect(gpxEndpoints(gpx)).toEqual({ start: [6, 45], end: [6, 45] });
  });

  it("rend null sans aucun point", () => {
    expect(gpxEndpoints("<gpx><trk></trk></gpx>")).toBeNull();
  });
});
