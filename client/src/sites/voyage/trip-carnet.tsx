import { useMemo } from "react";
import { BoardingTicket } from "./boarding-ticket";
import { formatDistance, stageDistance, tripDistance } from "./gpx-track";
import { fullRoute } from "./trip-geometry";
import { formatTripDates, tripDays, tripPeriod } from "./trip-format";
import { TripPhotoFrame } from "./trip-photo-frame";
import { TripRouteMap } from "./trip-route-map";
import type { TripDetail, TripStage } from "./trip-types";
import { useGpxTracks } from "./use-gpx-tracks";

const NO_STAGES: TripStage[] = [];

// Voyage sans etape: la carte se pose sur l'aeroport d'arrivee pour montrer
// au moins le pays.
function arrivalStage(trip: TripDetail): TripStage {
  const arrival = trip.flights[0].to;
  return {
    code: arrival.code,
    coordinates: arrival.coordinates,
    dateLabel: formatTripDates(trip.startDate, trip.endDate) ?? trip.country,
    dayLabel: "Arrivée",
    detail: `Atterrissage à ${arrival.name}.`,
    highlights: [],
    id: `arrivee-${arrival.code}`,
    photos: [],
    route: [],
    title: arrival.city,
    tracks: [],
  };
}

export function TripCarnet({ trip }: { trip: TripDetail }) {
  const stages = trip.stages.length ? trip.stages : NO_STAGES;
  const tracks = useGpxTracks(stages);
  const hasStages = stages.length > 0;
  // Memorise: la carte est creee une fois avec ces etapes.
  const mapStages = useMemo(
    () => (hasStages ? stages : [arrivalStage(trip)]),
    [hasStages, stages, trip],
  );
  const mapRoute = useMemo(() => fullRoute(mapStages), [mapStages]);
  const days = tripDays(trip.startDate, trip.endDate);
  const dates = formatTripDates(trip.startDate, trip.endDate);
  const flight = trip.flights[0];
  const photos = stages.flatMap((stage) => stage.photos);

  const tripStats = [
    ["Distance", hasStages ? tripDistance(stages, tracks) : "—"],
    ["Durée", days ? `${days} jours` : "—"],
    ["Étapes", hasStages ? `${stages.length} étapes` : "—"],
    ["Période", tripPeriod(trip.startDate) ?? "—"],
  ];

  return (
    <>
      <BoardingTicket
        actionHref="#carte"
        actionLabel="Carte 3D"
        arrivalCode={flight.to.code}
        departureCode={flight.from.code}
        description={trip.description}
        eyebrow={[dates, trip.country].filter(Boolean).join(" · ")}
        headingLevel="h1"
        status={trip.status}
        stubLabel={trip.stubLabel}
        title={trip.title}
      />

      <dl className="grid grid-cols-2 border-x border-b border-[#dfe4ea] bg-white md:grid-cols-4">
        {tripStats.map(([label, value], index) => (
          <div
            key={label}
            className={`p-5 sm:p-6 ${index % 2 ? "border-l" : ""} ${
              index > 1 ? "border-t md:border-t-0" : ""
            } border-[#dfe4ea] md:border-l md:first:border-l-0`}
          >
            <dt className="site-label text-[0.62rem] font-medium uppercase tracking-[0.13em] text-[var(--site-muted)]">
              {label}
            </dt>
            <dd className="site-display mt-2 text-xl font-semibold sm:text-2xl">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      <section id="carte" className="py-16 lg:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#1c4ed8]">
              Carte de route
            </p>
            <h2 className="site-display mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              Le trajet, <br />
              vu d’en haut.
            </h2>
          </div>
          <p className="max-w-md leading-7 text-[var(--site-muted)]">
            {hasStages
              ? "Trois modèles de carte à comparer — plan, relief et satellite en 3D. Cliquez sur une étape ou rejouez le trajet complet."
              : "Les étapes de ce carnet restent à écrire ; la carte montre déjà le pays autour de l’aéroport d’arrivée."}
          </p>
        </div>
        <TripRouteMap
          fullRoute={mapRoute}
          label={`Carte interactive du voyage — ${trip.country}`}
          stages={mapStages}
          tracks={tracks}
        />
      </section>

      {hasStages && (
        <section className="border-t border-[#dfe4ea] py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--site-muted)]">
                Feuille de route
              </p>
              <h2 className="site-display mt-2 text-3xl font-semibold sm:text-4xl">
                Étape par étape
              </h2>
            </div>
            <p className="site-label text-xs font-medium uppercase tracking-[0.12em] text-[var(--site-muted)]">
              {days ? `${String(days).padStart(2, "0")} jours / ` : ""}
              {String(stages.length).padStart(2, "0")} étapes
            </p>
          </div>

          <ol className="mt-8 border-t border-[#dfe4ea]">
            {stages.map((stage, index) => (
              <li
                key={stage.id}
                className="grid gap-4 border-b border-[#dfe4ea] py-6 sm:grid-cols-[6rem_1fr_auto] sm:items-center sm:gap-8"
              >
                <div className="site-label">
                  <p className="text-sm font-semibold text-[#1c4ed8]">
                    {stage.dayLabel}
                  </p>
                  <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.1em] text-[var(--site-muted)]">
                    {stage.dateLabel}
                  </p>
                </div>
                <div>
                  <h3 className="site-display text-xl font-semibold">
                    {stage.title}
                  </h3>
                  <p className="mt-2 leading-6 text-[var(--site-muted)]">
                    {stage.detail}
                  </p>
                </div>
                <p className="site-label text-xs font-semibold uppercase tracking-[0.1em] text-[#0f1b2b]">
                  {formatDistance(stageDistance(stage, index, tracks))}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {photos.length > 0 && (
        <section className="border-t border-[#dfe4ea] py-14 sm:py-16">
          <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#1c4ed8]">
            Pellicule · {trip.country}
          </p>
          <h2 className="site-display mt-2 text-3xl font-semibold sm:text-4xl">
            Souvenirs de voyage
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <TripPhotoFrame key={photo.id} photo={photo} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
