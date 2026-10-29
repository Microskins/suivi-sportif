import { useRef, useState } from "react";
import { BoardingTicket } from "./boarding-ticket";
import { VoyageBrand } from "./voyage-brand";
import type { VoyageGlobeControls } from "./voyage-globe";
import { VoyageGlobe } from "./voyage-globe";
import { trips } from "./voyage-trips";

const completedCount = trips.filter((trip) => trip.status === "realise").length;
const flightCount = trips.reduce(
  (count, trip) => count + trip.flights.length,
  0,
);

export function VoyageHomeSite() {
  const globeRef = useRef<VoyageGlobeControls>(null);
  const [hoveredTrip, setHoveredTrip] = useState<string | null>(null);

  function highlight(tripId: string | null) {
    setHoveredTrip(tripId);
    globeRef.current?.highlight(tripId);
  }

  return (
    <main
      id="contenu-principal"
      tabIndex={-1}
      className="min-h-screen bg-[#f4f6f8] text-[#0f1b2b]"
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

      <section className="relative">
        <div className="mx-auto max-w-[78rem] px-5 pt-10 sm:px-9 lg:pointer-events-none lg:absolute lg:inset-x-0 lg:top-0 lg:z-10 lg:px-14 lg:pt-14">
          <p className="site-label text-xs font-semibold uppercase tracking-[0.17em] text-[#1c4ed8]">
            Carnet d’embarquement
          </p>
          <h1 className="site-display mt-4 max-w-xl text-[clamp(3rem,7vw,5.6rem)] font-semibold leading-[0.9] tracking-[-0.06em]">
            Partir avec <br />
            un plan clair.
          </h1>
          <p className="mt-5 max-w-sm leading-7 text-[var(--site-muted)]">
            Chaque arc est un vol. Cliquez-le pour plonger dans le pays et
            ouvrir le carnet du voyage.
          </p>
          <dl className="site-label mt-6 flex gap-8 text-xs font-medium uppercase tracking-[0.12em]">
            <div>
              <dt className="text-[var(--site-muted)]">Carnets</dt>
              <dd className="mt-1 text-lg font-semibold">
                {String(trips.length).padStart(2, "0")}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--site-muted)]">Vols</dt>
              <dd className="mt-1 text-lg font-semibold">
                {String(flightCount).padStart(2, "0")}
              </dd>
            </div>
            <div>
              <dt className="text-[var(--site-muted)]">Réalisés</dt>
              <dd className="mt-1 text-lg font-semibold">
                {String(completedCount).padStart(2, "0")}
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative mt-6 h-[30rem] bg-[radial-gradient(ellipse_at_62%_55%,#ffffff_0%,#eef2f6_55%,#f4f6f8_80%)] sm:h-[38rem] lg:mt-0 lg:h-[min(52rem,88vh)]">
          {/* Voile clair a gauche: garde le titre lisible sur le globe. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-[1] hidden w-[46%] bg-gradient-to-r from-[#f4f6f8] via-[#f4f6f8]/80 to-transparent lg:block"
          />
          <VoyageGlobe
            ref={globeRef}
            trips={trips}
            onHoverTrip={setHoveredTrip}
          />
          <div className="site-label pointer-events-none absolute bottom-5 left-5 z-[2] flex flex-wrap items-center gap-x-4 gap-y-2 rounded-full bg-white/90 px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.11em] text-[var(--site-muted)] sm:left-9 lg:left-14">
            <span className="flex items-center gap-2">
              <span className="h-[3px] w-5 rounded-full bg-[#1c4ed8]" />
              Réalisé
            </span>
            <span className="flex items-center gap-2">
              <span className="h-[3px] w-5 rounded-full bg-[#e08a1e]" />À venir
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[78rem] px-5 pb-20 sm:px-9 lg:px-14">
        <section className="border-t border-[#dfe4ea] py-14 sm:py-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--site-muted)]">
                Départs enregistrés
              </p>
              <h2 className="site-display mt-2 text-3xl font-semibold sm:text-4xl">
                Les billets
              </h2>
            </div>
            <p className="site-label text-xs font-medium uppercase tracking-[0.12em] text-[var(--site-muted)]">
              {String(trips.length).padStart(2, "0")} billets
            </p>
          </div>

          <div className="grid gap-6">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onMouseEnter={() => highlight(trip.id)}
                onMouseLeave={() => highlight(null)}
                onFocus={() => highlight(trip.id)}
                onBlur={() => highlight(null)}
                className={`rounded-xl transition ${
                  hoveredTrip === trip.id
                    ? "ring-2 ring-[#1c4ed8] ring-offset-4 ring-offset-[#f4f6f8]"
                    : ""
                }`}
              >
                <BoardingTicket
                  actionHref={trip.href}
                  actionLabel={trip.status === "realise" ? "Revivre" : "Ouvrir"}
                  arrivalCode={trip.flights[0].to.code}
                  departureCode={trip.flights[0].from.code}
                  description={trip.description}
                  eyebrow={`${trip.dates} · ${trip.country}`}
                  status={trip.status}
                  stubLabel={trip.stubLabel}
                  title={trip.title}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-[#dfe4ea] bg-white">
        <div className="site-label mx-auto flex max-w-[78rem] flex-col gap-2 px-5 py-5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--site-muted)] sm:flex-row sm:justify-between sm:px-9 lg:px-14">
          <p>Voyage — Thomas Cochart</p>
          <p>Documents publics · Aucune référence privée</p>
        </div>
      </footer>
    </main>
  );
}
