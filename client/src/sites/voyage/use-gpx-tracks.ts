import { useEffect, useState } from "react";
import type { GpxTrack } from "./gpx-track";
import { parseGpx } from "./gpx-track";
import type { TripStage } from "./trip-types";
import { apiFileUrl } from "./voyage-api";

// Charge les GPX des etapes. Un fichier absent ou illisible est ignore:
// l'etape garde alors son trace reconstitue au lieu de casser la page.
export function useGpxTracks(stages: TripStage[]) {
  const [tracks, setTracks] = useState<GpxTrack[]>([]);

  useEffect(() => {
    const files = stages.flatMap((stage, stageIndex) =>
      stage.tracks.map((file) => ({ ...file, stageIndex })),
    );
    if (files.length === 0) {
      setTracks([]);
      return;
    }
    let cancelled = false;

    Promise.all(
      files.map(async (file) => {
        try {
          const response = await fetch(apiFileUrl(file.url));
          if (!response.ok) {
            return null;
          }
          const { points } = parseGpx(await response.text(), file.name);
          // Le nom saisi dans l'admin prime sur celui contenu dans le GPX.
          return points.length > 1
            ? {
                kind: file.kind,
                name: file.name,
                points,
                stageIndex: file.stageIndex,
              }
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
