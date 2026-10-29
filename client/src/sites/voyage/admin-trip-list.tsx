import { useEffect, useState } from "react";
import type { AuthErrorHandler } from "./admin-api";
import { adminApi, adminErrorMessage } from "./admin-api";
import { ErrorAlert, buttonClass } from "./admin-ui";
import { formatTripDates } from "./trip-format";
import type { TripSummary } from "./trip-types";
import { tripHref } from "./trip-types";

type ListState =
  | { state: "loading" }
  | { state: "error"; message: string }
  | { state: "ready"; trips: TripSummary[] };

export function AdminTripList({
  onAuthError,
  onEdit,
}: {
  onAuthError: AuthErrorHandler;
  onEdit: (tripId: string | null) => void;
}) {
  const [list, setList] = useState<ListState>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    adminApi
      .listTrips()
      .then((trips) => !cancelled && setList({ state: "ready", trips }))
      .catch((error: unknown) => {
        if (cancelled || onAuthError(error)) return;
        setList({ state: "error", message: adminErrorMessage(error) });
      });
    return () => {
      cancelled = true;
    };
  }, [onAuthError]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#1c4ed8]">
            Administration
          </p>
          <h1 className="site-display mt-2 text-3xl font-semibold sm:text-4xl">
            Voyages
          </h1>
        </div>
        <button
          type="button"
          className={buttonClass.primary}
          onClick={() => onEdit(null)}
        >
          Nouveau voyage
        </button>
      </div>

      <div className="mt-8">
        {list.state === "loading" && (
          <p role="status" className="text-[var(--site-muted)]">
            Chargement des voyages…
          </p>
        )}
        {list.state === "error" && <ErrorAlert>{list.message}</ErrorAlert>}
        {list.state === "ready" && list.trips.length === 0 && (
          <p className="rounded-[12px] border border-dashed border-[#c9d1db] bg-white p-6 text-[var(--site-muted)]">
            Aucun voyage pour l’instant. Créez le premier avec « Nouveau voyage
            ».
          </p>
        )}
        {list.state === "ready" && list.trips.length > 0 && (
          <ul className="grid gap-3">
            {list.trips.map((trip) => (
              <TripRow key={trip.id} trip={trip} onEdit={onEdit} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function TripRow({
  onEdit,
  trip,
}: {
  onEdit: (tripId: string) => void;
  trip: TripSummary;
}) {
  const dates = formatTripDates(trip.startDate, trip.endDate);
  const route = trip.flights
    .map((flight) => `${flight.from.code} → ${flight.to.code}`)
    .join(" · ");

  return (
    <li className="flex flex-wrap items-center justify-between gap-4 rounded-[12px] border border-[#dfe4ea] bg-white px-5 py-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="site-display text-lg font-semibold">{trip.title}</h2>
          <span
            className={`site-label rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.1em] ${
              trip.published
                ? "bg-[#e8eefc] text-[#1c4ed8]"
                : "bg-[#eef1f4] text-[#0f1b2b]"
            }`}
          >
            {trip.published ? "Publié" : "Brouillon"}
          </span>
        </div>
        <p className="site-label mt-1 text-xs font-medium tracking-[0.06em] text-[var(--site-muted)]">
          /voyage/{trip.slug}
          {dates ? ` · ${dates}` : " · dates à préciser"}
          {route ? ` · ${route}` : ""}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {trip.published && (
          <a
            href={tripHref(trip.slug)}
            className={buttonClass.secondary}
            aria-label={`Voir la page de ${trip.title}`}
          >
            Voir la page →
          </a>
        )}
        <button
          type="button"
          className={buttonClass.primary}
          aria-label={`Modifier ${trip.title}`}
          onClick={() => onEdit(trip.id)}
        >
          Modifier
        </button>
      </div>
    </li>
  );
}
