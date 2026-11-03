// Itineraires par la route de toutes les etapes, pour le bouton « Tracer
// par la route » de l'admin. Chaque etape est rejointe depuis la precedente
// en passant par le depart de chacune de ses randonnees (dans l'ordre
// d'ajout) et en repartant de leur arrivee. Les appels au serveur OSRM
// public se suivent a une seconde d'intervalle (limite de debit).
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage } from "./admin-api";
import type { StageDraft } from "./admin-form";
import { stageCoordinates } from "./admin-form";
import type { HikeEnds } from "./hike-legs";
import { joinLegs, roadLegs } from "./hike-legs";

const stageName = (stage: StageDraft, index: number) =>
  `Étape ${index + 1}${stage.title.trim() ? ` — ${stage.title.trim()}` : ""}`;

export type TraceResult = {
  report: string;
  routes: Map<string, StageDraft["route"]>;
};

// Rend null si la session admin a expire (onAuthError l'a deja traite).
export async function traceStageRoads(
  stages: StageDraft[],
  {
    onAuthError,
    onProgress,
  }: {
    onAuthError: AuthErrorHandler;
    onProgress: (index: number, total: number) => void;
  },
): Promise<TraceResult | null> {
  const routes = new Map<string, StageDraft["route"]>();
  const failures: string[] = [];
  let distanceKm = 0;
  let hikesReached = 0;
  let calls = 0;
  for (let index = 1; index < stages.length; index += 1) {
    const from = stageCoordinates(stages[index - 1]);
    const to = stageCoordinates(stages[index]);
    const name = stageName(stages[index], index);
    if (!from || !to) {
      failures.push(`${name} : coordonnées à compléter`);
      continue;
    }
    onProgress(index, stages.length - 1);
    try {
      const hikes: HikeEnds[] = [];
      for (const track of stages[index].tracks) {
        if (track.kind !== "randonnee") continue;
        try {
          hikes.push(await adminApi.trackEndpoints(track.id));
        } catch (error) {
          if (onAuthError(error)) throw error;
          failures.push(`${name} : randonnée « ${track.name} » illisible`);
        }
      }
      const legs: StageDraft["route"][] = [];
      let stageKm = 0;
      for (const [legFrom, legTo] of roadLegs(from, hikes, to)) {
        if (calls > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1100));
        }
        calls += 1;
        const result = await adminApi.roadRoute(legFrom, legTo);
        legs.push(result.route);
        stageKm += result.distanceKm;
      }
      routes.set(stages[index].key, joinLegs(legs));
      distanceKm += stageKm;
      hikesReached += hikes.length;
    } catch (error) {
      if (onAuthError(error)) return null;
      failures.push(`${name} : ${adminErrorMessage(error)}`);
    }
  }
  const viaHikes = hikesReached
    ? `, en passant par le départ de ${hikesReached} randonnée(s)`
    : "";
  const summary =
    routes.size > 0
      ? `${routes.size} itinéraire(s) routier(s) tracé(s)${viaHikes}, ${Math.round(distanceKm)} km au total. Enregistrez le voyage pour les garder.`
      : "Aucun itinéraire tracé.";
  return {
    report: failures.length
      ? `${summary} À revoir — ${failures.join(" ; ")}.`
      : summary,
    routes,
  };
}
