import { useEffect, useState } from "react";
import type { TripStage } from "./ecosse-2026-data";
import type { GpxTrack } from "./gpx-track";
import { parseGpx } from "./gpx-track";

// Charge les GPX declares sur les etapes. Un fichier absent ou illisible est
// ignore: l'etape garde alors son trace reconstitue au lieu de casser la page.
export function useGpxTracks(stages: TripStage[]) {
  const [tracks, setTracks] = useState<GpxTrack[]>([]);

  useEffect(() => {
    const files = stages.flatMap((stage, stageIndex) =>
      stage.gpx.map((file) => ({ ...file, stageIndex })),
    );
    if (files.length === 0) {
      return;
    }
    let cancelled = false;

    Promise.all(
      files.map(async (file) => {
        try {
          const response = await fetch(file.src);
          if (!response.ok) {
            return null;
          }
          const fallbackName = file.src.split("/").pop() ?? file.src;
          const { name, points } = parseGpx(
            await response.text(),
            fallbackName,
          );
          return points.length > 1
            ? { kind: file.kind, name, points, stageIndex: file.stageIndex }
            : null;
        } catch {
          return null;
        }
      }),
    ).then((loaded) => {
      if (!cancelled) {
        setTracks(loaded.filter((track): track is GpxTrack => track !== null));
      }
    });

    return () => {
      cancelled = true;
    };
  }, [stages]);

  return tracks;
}
