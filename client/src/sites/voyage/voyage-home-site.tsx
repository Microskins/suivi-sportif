import { useEffect, useState } from "react";
import type { TripSummary } from "./trip-types";
import { VoyageBrand } from "./voyage-brand";
import { fetchTrips } from "./voyage-api";
import { VoyageGlobe } from "./voyage-globe";

type Catalogue =
  | { state: "loading" }
  | { state: "error" }
  | { state: "ready"; trips: TripSummary[] };

const pad = (count: number) => String(count).padStart(2, "0");

export function VoyageHomeSite() {
  const [catalogue, setCatalogue] = useState<Catalogue>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    fetchTrips()
      .then((trips) => !cancelled && setCatalogue({ state: "ready", trips }))
      .catch(() => !cancelled && setCatalogue({ state: "error" }));
    return () => {
      cancelled = true;
    };
  }, []);

  const trips = catalogue.state === "ready" ? catalogue.trips : [];
  const completedCount = trips.filter(
    (trip) => trip.status === "realise",
  ).length;
  const flightCount = trips.reduce(
    (count, trip) => count + trip.flights.length,
    0,
  );

  return (
    <main
      id="contenu-principal"
      tabIndex={-1}
      className="flex min-h-screen flex-col bg-[#f4f6f8] text-[#0f1b2b]"
    >
      <header className="bg-[#0f1b2b] text-white">
        <div className="mx-auto flex max-w-[78rem] items-center justify-between gap-6 px-5 py-5 sm:px-9 lg:px-14">
          <a href="/" aria-label="Retour au portfolio">
            <VoyageBrand />
          </a>
          <p className="site-label hidden text-xs font-medium uppercase tracking-[0.15em] text-white/60 sm:block">
            Terminal 04 / Édition 2026
          </p>
        </div>
      </header>

      {/* Le globe occupe toute la hauteur restante: le pied de page reste
          colle en bas de l'ecran, quelle que soit sa taille. */}
      <section className="relative flex flex-1 flex-col">
        <div className="mx-auto max-w-[78rem] px-5 pt-10 sm:px-9 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:z-10 lg:px-14 lg:pt-14">
          <p className="site-label text-xs font-semibold uppercase tracking-[0.17em] text-[#1c4ed8]">
            Carnet d’embarquement
          </p>
          <h1 className="site-display mt-4 max-w-xl text-[clamp(3rem,7vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.06em]">
            Partir avec <br />
            un plan clair.
          </h1>
          <p className="mt-5 max-w-sm leading-7 text-[var(--site-muted)]">
            Chaque arc est un trajet, en avion ou en voiture. Cliquez-le pour
            plonger dans le pays et ouvrir le carnet du voyage.
          </p>
          <dl className="site-label mt-6 flex gap-8 text-xs font-medium uppercase tracking-[0.12em]">
            <div>
              <dt className="text-[var(--site-muted)]">Carnets</dt>
              <dd className="mt-1 text-lg font-semibold">
                {pad(trips.length)}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--site-muted)]">Trajets</dt>
              <dd className="mt-1 text-lg font-semibold">{pad(flightCount)}</dd>
            </div>
            <div>
              <dt className="text-[var(--site-muted)]">Réalisés</dt>
              <dd className="mt-1 text-lg font-semibold">
                {pad(completedCount)}
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative mt-6 min-h-[30rem] flex-1 bg-[radial-gradient(ellipse_at_62%_55%,#ffffff_0%,#eef2f6_55%,#f4f6f8_80%)] sm:min-h-[38rem] lg:mt-0 lg:min-h-[36rem]">
          {/* Voile clair a gauche: garde le titre lisible sur le globe. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[46%] bg-gradient-to-r from-[#f4f6f8] via-[#f4f6f8]/80 to-transparent lg:block"
          />
          {catalogue.state === "ready" ? (
            <VoyageGlobe trips={catalogue.trips} />
          ) : (
            <p
              role="status"
              className="site-label absolute inset-0 grid place-items-center p-8 text-center text-[0.68rem] font-medium uppercase leading-6 tracking-[0.1em] text-[var(--site-muted)]"
            >
              {catalogue.state === "loading"
                ? "Chargement des voyages…"
                : "Voyages indisponibles pour le moment — réessayez dans un instant."}
            </p>
          )}
          <div className="site-label pointer-events-none absolute bottom-5 left-5 z-[2] flex flex-wrap items-center gap-x-4 gap-y-2 rounded-full bg-white/90 px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.11em] text-[var(--site-muted)] sm:left-9 lg:left-14">
            <span className="flex items-center gap-2">
              <span className="h-[3px] w-5 rounded-full bg-[#1c4ed8]" />
              Réalisé
            </span>
            <span className="flex items-center gap-2">
              <span className="h-[3px] w-5 rounded-full bg-[#e08a1e]" />À venir
            </span>
            <span className="flex items-center gap-2">
              <span className="h-[3px] w-5 rounded-full bg-[#0f1b2b]" />
              Avion
            </span>
            <span className="flex items-center gap-2">
              {/* Tirets, comme le trajet en voiture sur le globe. */}
              <span className="h-[3px] w-5 bg-[repeating-linear-gradient(90deg,#0f1b2b_0_5px,transparent_5px_8px)]" />
              Voiture
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#dfe4ea] bg-white">
        <div className="site-label mx-auto flex max-w-[78rem] flex-col gap-2 px-5 py-5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--site-muted)] sm:flex-row sm:justify-between sm:px-9 lg:px-14">
          <p>Voyage — Thomas Cochart</p>
          <p>
            Documents publics · Aucune référence privée ·{" "}
            <a href="/voyage/confidentialite" className="hover:underline">
              Confidentialité
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
