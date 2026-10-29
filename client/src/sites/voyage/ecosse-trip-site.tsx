import { BoardingTicket } from "./boarding-ticket";
import {
  ecosseFullRoute,
  ecosseStages,
  ecosseTotalKm,
  stageDistanceLabel,
} from "./ecosse-2026-data";
import { TripPhotoFrame } from "./trip-photo-frame";
import { TripRouteMap } from "./trip-route-map";
import { VoyageBrand } from "./voyage-brand";

const tripStats = [
  ["Distance", `≈ ${ecosseTotalKm.toLocaleString("fr-FR")} km`],
  ["Durée", "9 jours"],
  ["Étapes", `${ecosseStages.length} étapes`],
  ["Période", "Oct. 2026"],
];

const photos = ecosseStages.flatMap((stage) =>
  stage.photos.map((photo) => ({ ...photo, stage: stage.title })),
);

export function EcosseTripSite() {
  return (
    <main
      id="contenu-principal"
      tabIndex={-1}
      className="min-h-screen bg-[#f4f6f8] text-[#0f1b2b]"
    >
      <header className="bg-[#0f1b2b] text-white">
        <div className="mx-auto flex max-w-[78rem] items-center justify-between gap-6 px-5 py-5 sm:px-9 lg:px-14">
          <a href="/voyage" aria-label="Retour aux voyages">
            <VoyageBrand />
          </a>
          <a
            href="/voyage"
            className="site-label text-xs font-medium uppercase tracking-[0.13em] text-white/70 transition hover:text-white"
          >
            ← Tous les billets
          </a>
        </div>
      </header>

      <div className="mx-auto max-w-[78rem] px-5 pb-20 pt-10 sm:px-9 sm:pt-14 lg:px-14">
        <BoardingTicket
          actionHref="#carte"
          actionLabel="Carte 3D"
          arrivalCode="SKY"
          departureCode="EDI"
          description="Neuf jours d’automne d’Édimbourg à l’île de Skye : lochs, châteaux, Highlands et falaises du Trotternish."
          eyebrow="Dossier SCO-1026 · 19—27 octobre"
          headingLevel="h1"
          status="realise"
          stubLabel="Highlands / boucle"
          title="Écosse — Boucle des Highlands"
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
                La boucle, <br />
                vue d’en haut.
              </h2>
            </div>
            <p className="max-w-md leading-7 text-[var(--site-muted)]">
              Trois modèles de carte à comparer — plan, relief et satellite en
              3D. Cliquez sur une étape ou rejouez le trajet complet.
            </p>
          </div>
          <TripRouteMap fullRoute={ecosseFullRoute} stages={ecosseStages} />
        </section>

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
              09 jours / {String(ecosseStages.length).padStart(2, "0")} étapes
            </p>
          </div>

          <ol className="mt-8 border-t border-[#dfe4ea]">
            {ecosseStages.map((stage) => (
              <li
                key={stage.id}
                className="grid gap-4 border-b border-[#dfe4ea] py-6 sm:grid-cols-[6rem_1fr_auto] sm:items-center sm:gap-8"
              >
                <div className="site-label">
                  <p className="text-sm font-semibold text-[#1c4ed8]">
                    {stage.day}
                  </p>
                  <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-[0.1em] text-[var(--site-muted)]">
                    {stage.date}
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
                  {stageDistanceLabel(stage)}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section className="border-t border-[#dfe4ea] py-14 sm:py-16">
          <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#1c4ed8]">
            Pellicule
          </p>
          <h2 className="site-display mt-2 text-3xl font-semibold sm:text-4xl">
            Souvenirs d’Écosse
          </h2>
          {photos.length > 0 ? (
            <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => (
                <TripPhotoFrame key={photo.src} photo={photo} />
              ))}
            </div>
          ) : (
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {ecosseStages.slice(0, 6).map((stage) => (
                <TripPhotoFrame key={stage.id} code={stage.code} />
              ))}
            </div>
          )}
        </section>
      </div>

      <footer className="border-t border-[#dfe4ea] bg-white">
        <div className="site-label mx-auto flex max-w-[78rem] flex-col gap-2 px-5 py-5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--site-muted)] sm:flex-row sm:justify-between sm:px-9 lg:px-14">
          <p>SCO / 2026 · Carnet de route</p>
          <a href="/voyage" className="text-[#1c4ed8] hover:underline">
            Retour aux voyages →
          </a>
        </div>
      </footer>
    </main>
  );
}
