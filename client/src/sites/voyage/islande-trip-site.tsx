import { BoardingTicket } from "./boarding-ticket";
import { IslandeRouteMap } from "./islande-route-map";
import { VoyageBrand } from "./voyage-brand";

const tripStats = [
  ["Distance", "680 km"],
  ["Durée", "8 jours"],
  ["Étapes", "5 bases"],
  ["Période", "Sept. 2026"],
];

const itinerary = [
  {
    day: "J01",
    date: "12 sept.",
    title: "Keflavík → Reykjavík",
    detail:
      "Arrivée, prise en main du véhicule et première nuit dans la capitale.",
    distance: "50 km",
  },
  {
    day: "J02",
    date: "13 sept.",
    title: "Le Cercle d’Or",
    detail:
      "Þingvellir, la zone géothermale de Geysir et les chutes de Gullfoss.",
    distance: "230 km",
  },
  {
    day: "J03—04",
    date: "14—15 sept.",
    title: "La côte jusqu’à Vík",
    detail:
      "Seljalandsfoss, Skógafoss, Reynisfjara et deux nuits face à l’Atlantique.",
    distance: "190 km",
  },
  {
    day: "J05—06",
    date: "16—17 sept.",
    title: "Glaciers et lagunes",
    detail:
      "Skaftafell puis Jökulsárlón, avec retour progressif vers la côte sud.",
    distance: "210 km",
  },
  {
    day: "J07—08",
    date: "18—19 sept.",
    title: "Péninsule de Reykjanes",
    detail: "Dernière halte géothermale et retour vers Keflavík avant le vol.",
    distance: "À confirmer",
  },
];

const bookings = [
  {
    source: "Airbnb — nuits 1 à 2",
    title: "Base à Reykjavík",
    detail: "Arrivée autonome et stationnement à confirmer.",
    action: "À réserver",
  },
  {
    source: "GetYourGuide — journée 2",
    title: "Repères du Cercle d’Or",
    detail: "Comparer l’excursion guidée avec l’option voiture.",
    action: "À comparer",
  },
  {
    source: "Airbnb — nuits 3 à 5",
    title: "Étape sur la côte sud",
    detail: "Rechercher un hébergement entre Vík et Skaftafell.",
    action: "À réserver",
  },
  {
    source: "GetYourGuide — journée 7",
    title: "Pause géothermale",
    detail: "Choisir un créneau compatible avec le retour à Keflavík.",
    action: "À comparer",
  },
];

export function IslandeTripSite() {
  return (
    <main id="contenu-principal" tabIndex={-1} className="min-h-screen bg-[#f4f6f8] text-[#0f1b2b]">
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
          actionHref="#itineraire"
          actionLabel="Itinéraire"
          arrivalCode="KEF"
          departureCode="CDG"
          description="Un carnet de préparation pour huit jours entre villes, cascades, plages noires et lagunes glaciaires."
          eyebrow="Dossier ISL-0926 · 12—19 septembre"
          headingLevel="h1"
          status="a-venir"
          stubLabel="Siège / libre"
          title="Islande — Route du Sud"
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

        <section
          id="itineraire"
          className="grid gap-8 py-16 lg:grid-cols-[0.62fr_1.38fr] lg:py-20"
        >
          <div>
            <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[#1c4ed8]">
              Carte de route
            </p>
            <h2 className="site-display mt-3 text-4xl font-semibold tracking-[-0.03em] sm:text-5xl">
              D’ouest en est,{" "}
              <br />
              sans courir.
            </h2>
            <p className="mt-5 max-w-md leading-7 text-[var(--site-muted)]">
              Le parcours garde des marges pour la météo. Les distances et les
              accès devront être vérifiés avant le départ.
            </p>
            <div className="site-label mt-8 flex items-center gap-3 text-[0.62rem] font-medium uppercase tracking-[0.1em] text-[var(--site-muted)]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0f1b2b]" /> Départ
              <span className="ml-2 h-2.5 w-2.5 rounded-full bg-[#1c4ed8]" />{" "}
              Étapes
            </div>
          </div>
          <IslandeRouteMap />
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
              08 jours / 05 bases
            </p>
          </div>

          <ol className="mt-8 border-t border-[#dfe4ea]">
            {itinerary.map((stage) => (
              <li
                key={stage.day}
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
                  {stage.distance}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          id="liste-reservations"
          className="border-t border-[#dfe4ea] py-14 sm:py-16"
        >
          <div className="max-w-2xl">
            <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--site-accent-2-text)]">
              Préparation
            </p>
            <h2 className="site-display mt-2 text-3xl font-semibold sm:text-4xl">
              Réservations à cadrer
            </h2>
            <p className="mt-4 leading-7 text-[var(--site-muted)]">
              Les sources sont identifiées, mais aucun lien privé ni numéro de
              dossier n’est publié dans ce carnet.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {bookings.map((booking) => (
              <article
                key={booking.source}
                className="flex min-h-48 flex-col rounded-xl border border-[#dfe4ea] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#bcc7d5] hover:shadow-[0_12px_30px_rgba(15,27,43,0.06)]"
              >
                <p className="site-label text-[0.62rem] font-semibold uppercase tracking-[0.13em] text-[var(--site-muted)]">
                  {booking.source}
                </p>
                <h3 className="site-display mt-4 text-xl font-semibold">
                  {booking.title}
                </h3>
                <p className="mt-2 leading-6 text-[var(--site-muted)]">
                  {booking.detail}
                </p>
                <p className="site-label mt-auto pt-6 text-right text-xs font-semibold uppercase tracking-[0.1em] text-[#1c4ed8]">
                  {booking.action} →
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-[#dfe4ea] bg-white">
        <div className="site-label mx-auto flex max-w-[78rem] flex-col gap-2 px-5 py-5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--site-muted)] sm:flex-row sm:justify-between sm:px-9 lg:px-14">
          <p>ISL / 2026 · Document de préparation</p>
          <a href="/voyage" className="text-[#1c4ed8] hover:underline">
            Retour aux voyages →
          </a>
        </div>
      </footer>
    </main>
  );
}
