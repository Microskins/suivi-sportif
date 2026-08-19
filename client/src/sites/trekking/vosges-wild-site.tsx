import { useState } from "react";
import { RouteMaps } from "./route-maps";
import { RoutePhotoGallery } from "./route-photo-gallery";
import { TrekkingBrand } from "./trekking-brand";
import { useTrekkingStore } from "./trekking-store";
import { TREK_ROUTES, type TrekRouteContent } from "./vosges-wild-routes";

type RouteView = "itineraire" | "etapes" | "carte" | "photos" | "sac";

const PACKING_ITEMS = [
  "Tente ou abri léger",
  "Duvet adapté",
  "Matelas isolant",
  "Sac de 45 à 55 litres",
  "Chaussures déjà rodées",
  "Veste imperméable",
  "Couche chaude",
  "Tenue sèche pour la nuit",
  "Deux litres d’eau par personne",
  "Filtre à eau",
  "Carte hors ligne",
  "Batterie externe",
  "Lampe frontale",
  "Trousse de secours",
  "Nourriture pour trois jours",
  "Sacs pour les déchets",
];

const PROGRESS_WIDTH_CLASSES = [
  "w-0",
  "w-[6.25%]",
  "w-[12.5%]",
  "w-[18.75%]",
  "w-1/4",
  "w-[31.25%]",
  "w-[37.5%]",
  "w-[43.75%]",
  "w-1/2",
  "w-[56.25%]",
  "w-[62.5%]",
  "w-[68.75%]",
  "w-3/4",
  "w-[81.25%]",
  "w-[87.5%]",
  "w-[93.75%]",
  "w-full",
];

function ContourDivider() {
  return (
    <svg
      viewBox="0 0 1200 80"
      preserveAspectRatio="none"
      aria-hidden="true"
      className="h-16 w-full text-[var(--site-muted)]/55"
    >
      <path
        d="M0 51c108-46 187 18 299-11 108-29 173-5 274 18 112 26 188-37 297-22 114 16 203 29 330-18M0 67c103-35 184 25 300-1 103-23 187-1 281 13 111 16 190-31 294-21 112 11 199 22 325-10"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function RouteItinerary({ route }: { route: TrekRouteContent }) {
  return (
    <div className="grid gap-8 bg-[#f7ecd5]/70 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
      <div className="border-b border-[#e0c99e] pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
        <p className="site-label text-xs font-medium uppercase tracking-[0.15em] text-[var(--site-muted)]">
          Itinéraire sélectionné
        </p>
        <h3 className="site-display mt-3 text-4xl font-semibold leading-none text-[#332f26]">
          {route.label}
        </h3>
        <p className="mt-4 leading-7 text-[#6b6254]">{route.summary}</p>
        <p className="mt-6 border-l-4 border-[#b0794c] bg-white/35 px-4 py-3 text-sm leading-6 text-[#5f584c]">
          La carte, ses points et sa légende sont propres à cette trace. Une
          carte IGN récente et les conditions du terrain restent
          indispensables.
        </p>
      </div>

      <ol>
        {route.stages.map((stage, itemIndex) => (
          <li key={stage.day} className="grid grid-cols-[2.75rem_1fr] gap-4">
            <div className="flex flex-col items-center">
              <span className="site-label grid h-10 w-10 place-items-center rounded-full border border-[#5c7350] text-xs font-medium text-[var(--site-accent)]">
                {stage.day}
              </span>
              {itemIndex < route.stages.length - 1 && (
                <span className="h-12 w-px bg-[#e0c99e]" />
              )}
            </div>
            <div className="pb-5 pt-1">
              <p className="site-display text-2xl font-semibold text-[#332f26]">
                {stage.title}
              </p>
              <p className="site-label mt-2 text-xs font-medium uppercase tracking-[0.06em] text-[var(--site-muted)]">
                {stage.distance} · {stage.elevation} · {stage.duration}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stages({ route }: { route: TrekRouteContent }) {
  return (
    <div className="bg-[#f7ecd5]/70">
      {route.stages.map((stage) => (
        <article
          key={stage.day}
          className="grid gap-5 border-b border-[#e0c99e] p-6 last:border-b-0 md:grid-cols-[64px_1fr] lg:grid-cols-[64px_1fr_auto] lg:p-8"
        >
          <span className="site-label grid h-14 w-14 place-items-center rounded-full border border-[#5c7350] text-sm font-medium text-[var(--site-accent)]">
            {stage.day}
          </span>
          <div>
            <p className="site-label text-[0.68rem] font-medium uppercase tracking-[0.14em] text-[var(--site-muted)]">
              Jour {stage.day}
            </p>
            <h3 className="site-display mt-2 text-3xl font-semibold leading-none text-[#332f26]">
              {stage.title}
            </h3>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-[#6b6254]">
              {stage.detail}
            </p>
            <ul className="mt-5 grid gap-x-6 gap-y-2 border-t border-[#e0c99e] pt-4 text-sm text-[#5f584c] sm:grid-cols-2">
              {stage.points.map((point) => (
                <li key={point} className="flex gap-2">
                  <span aria-hidden="true" className="text-[var(--site-accent)]">→</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <dl className="site-label grid grid-cols-2 gap-x-6 gap-y-3 border-t border-[#e0c99e] pt-4 text-xs font-medium uppercase tracking-[0.05em] text-[var(--site-muted)] lg:block lg:min-w-48 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            {[stage.distance, stage.elevation, stage.duration, stage.difficulty].map(
              (metric) => (
                <div key={metric} className="lg:mb-4">
                  <dd className="text-[#332f26]">{metric}</dd>
                </div>
              ),
            )}
          </dl>
        </article>
      ))}
    </div>
  );
}

function PackList() {
  const packedItemIds = useTrekkingStore((state) => state.packedItemIds);
  const resetPackedItems = useTrekkingStore((state) => state.resetPackedItems);
  const togglePackedItem = useTrekkingStore((state) => state.togglePackedItem);

  return (
    <div className="bg-[#f7ecd5]/70 p-6 lg:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e0c99e] pb-6">
        <div>
          <p className="site-display text-4xl font-semibold text-[#332f26]">
            {packedItemIds.length} / {PACKING_ITEMS.length}
          </p>
          <p className="mt-1 text-sm text-[#6b6254]">
            éléments prêts pour le départ
          </p>
        </div>
        <button
          type="button"
          onClick={resetPackedItems}
          className="site-label rounded-full border border-[#332f26] px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] text-[#332f26] transition hover:bg-[#332f26] hover:text-[#f1e2c4]"
        >
          Réinitialiser
        </button>
      </div>
      <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#e0c99e]">
        <div
          className={`h-full rounded-full bg-[#5c7350] transition-all ${PROGRESS_WIDTH_CLASSES[packedItemIds.length]}`}
        />
      </div>
      <div className="mt-7 grid gap-2 sm:grid-cols-2">
        {PACKING_ITEMS.map((item, index) => {
          const itemId = String(index);
          const isPacked = packedItemIds.includes(itemId);

          return (
            <label
              key={item}
              className={`flex cursor-pointer items-center gap-3 border px-4 py-3 text-sm transition ${
                isPacked
                  ? "border-[#e0c99e] bg-[#ead9b8] text-[#897b67] line-through"
                  : "border-[#e0c99e] bg-white/35 text-[#332f26] hover:border-[#5c7350]"
              }`}
            >
              <input
                type="checkbox"
                checked={isPacked}
                onChange={() => togglePackedItem(itemId)}
                className="h-4 w-4 accent-[#5c7350]"
              />
              {item}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function VosgesWildSite() {
  const [routeId, setRouteId] = useState(TREK_ROUTES[0].id);
  const [routeView, setRouteView] = useState<RouteView>("itineraire");
  const activeRoute =
    TREK_ROUTES.find((route) => route.id === routeId) ?? TREK_ROUTES[0];

  return (
    <main id="contenu-principal" tabIndex={-1} className="site-topography min-h-screen bg-[#f1e2c4] text-[#332f26]">
      <section className="relative isolate min-h-[48rem] overflow-hidden">
        <img
          src="/sites/trekking/vosges-wild-hero.png"
          alt="Crête des Hautes-Vosges au lever du jour"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(40,44,30,.15)_0%,rgba(30,34,22,.58)_45%,rgba(30,34,22,.86)_74%,#f1e2c4_100%)]" />
        <div className="mx-auto flex min-h-[48rem] max-w-[78rem] flex-col px-5 py-5 sm:px-9 lg:px-14">
          <header className="flex items-center justify-between border-b border-white/30 pb-5">
            <a href="/trekking" aria-label="Retour aux carnets de trekking">
              <TrekkingBrand />
            </a>
            <a
              href="#itineraire"
              className="site-label text-xs font-medium uppercase tracking-[0.14em] text-white/80 transition hover:text-white"
            >
              Explorer le parcours ↓
            </a>
          </header>

          <div className="mt-auto max-w-5xl pb-28 pt-24 text-white">
            <p className="site-label inline-flex rounded-full border border-white/40 bg-[#865c3a]/90 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] backdrop-blur-sm">
              🏔 Micro-aventure · 3 jours / 2 nuits
            </p>
            <h1 className="site-display mt-6 text-[clamp(3.8rem,8vw,6.8rem)] font-semibold leading-[0.9]">
              Les Vosges{" "}
              <br />
              comme horizon.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
              Un carnet de préparation pour une première itinérance entre le
              Hohneck, les lacs glaciaires et les chaumes d&apos;altitude.
            </p>
            <div className="site-label mt-9 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.08em]">
              {activeRoute.stats.map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-[14px] border border-white/30 bg-[#332f26]/55 px-4 py-3 backdrop-blur-sm"
                >
                  <strong className="block text-sm font-medium text-white">{value}</strong>
                  <span className="mt-1 block text-[0.58rem] text-white/70">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[78rem] px-5 sm:px-9 lg:px-14">
        <section id="itineraire" className="pb-20 pt-8 sm:pb-28">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="site-label text-xs font-medium uppercase tracking-[0.15em] text-[var(--site-muted)]">
                Préparer le terrain
              </p>
              <h2 className="site-display mt-4 text-5xl font-semibold leading-[0.94] sm:text-6xl">
                Deux traces,{" "}
                <br />
                un même massif.
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-[#6b6254]">
              Choisis une trace pour consulter son itinéraire, ses étapes et sa
              carte. Ces informations restent des repères de préparation, pas
              une promesse de conditions terrain.
            </p>
          </div>

          <div className="mt-10 border border-[#332f26] bg-[#f7ecd5]/70">
            <div className="grid border-b border-[#332f26] sm:grid-cols-2">
              {TREK_ROUTES.map((route) => (
                <button
                  key={route.id}
                  type="button"
                  onClick={() => {
                    setRouteId(route.id);
                    setRouteView("itineraire");
                  }}
                  className={`flex items-center gap-4 border-b border-[#332f26] px-5 py-5 text-left transition last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0 ${
                    activeRoute.id === route.id
                      ? "bg-[#e8d6b2] text-[#332f26]"
                      : "text-[#6b6254] hover:bg-white/35 hover:text-[#332f26]"
                  }`}
                >
                  <span className="site-label grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[#5c7350] text-xs font-medium text-[var(--site-accent)]">
                    {route.id === "trace-01" ? "01" : "02"}
                  </span>
                  <span>
                    <span className="site-label block text-[0.6rem] font-medium uppercase tracking-[0.14em] text-[var(--site-muted)]">
                      Parcours
                    </span>
                    <span className="site-display mt-1 block text-xl font-semibold">
                      {route.label}
                    </span>
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-b border-[#e0c99e] p-3">
              {(
                [
                  ["itineraire", "Itinéraire"],
                  ["etapes", "Les étapes"],
                  ["carte", "La carte"],
                  ["photos", "Les photos"],
                  ["sac", "Le sac"],
                ] as const
              ).map(([view, label]) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setRouteView(view)}
                  className={`site-label rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.08em] transition ${
                    routeView === view
                      ? "bg-[#332f26] text-[#f1e2c4]"
                      : "text-[#6b6254] hover:bg-[#e8d6b2] hover:text-[#332f26]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {routeView === "itineraire" && <RouteItinerary route={activeRoute} />}
            {routeView === "etapes" && <Stages route={activeRoute} />}
            {routeView === "carte" && <RouteMaps route={activeRoute} />}
            {routeView === "photos" && <RoutePhotoGallery route={activeRoute} />}
            {routeView === "sac" && <PackList />}
          </div>
        </section>

        <ContourDivider />

        <section className="grid border-y border-[#332f26] md:grid-cols-2">
          <article className="border-b border-[#332f26] bg-white/25 p-7 md:border-b-0 md:border-r sm:p-10">
            <p className="site-label text-xs font-medium uppercase tracking-[0.15em] text-[var(--site-accent)]">
              Bivouac
            </p>
            <h2 className="site-display mt-4 text-4xl font-semibold leading-none">
              Bivouaquer sans abîmer
            </h2>
            <p className="mt-6 max-w-xl leading-8 text-[#6b6254]">
              S&apos;installer léger au coucher du soleil, repartir au lever du
              jour, ne laisser aucun déchet et ne jamais faire de feu. Les
              réserves et les communes imposent leurs propres règles.
            </p>
          </article>
          <article className="bg-white/40 p-7 sm:p-10">
            <p className="site-label text-xs font-medium uppercase tracking-[0.15em] text-[#b1573c]">
              Point de vigilance
            </p>
            <h2 className="site-display mt-4 text-4xl font-semibold leading-none">
              Une nuit de secours
            </h2>
            <p className="mt-6 max-w-xl leading-8 text-[#6b6254]">
              Garder une solution en dur autour du Lac Blanc : refuge, auberge,
              gîte ou camping. Le panorama ne vaut jamais une installation
              dans une zone interdite ou exposée.
            </p>
          </article>
        </section>

        <section className="py-20 sm:py-28">
          <p className="site-label text-xs font-medium uppercase tracking-[0.15em] text-[var(--site-muted)]">
            Décision avant départ
          </p>
          <h2 className="site-display mt-4 max-w-3xl text-5xl font-semibold leading-[0.94] sm:text-6xl">
            Le feu vert météo se gagne la veille.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Maintenir", "Temps stable, bonne visibilité, vent raisonnable et aucun orage annoncé.", "border-t-[#5c7350]"],
              ["Adapter", "Brouillard ou pluie faible : raccourcir, éviter les passages raides et dormir en dur.", "border-t-[#b0794c]"],
              ["Reporter", "Orages, fortes rafales, canicule, pluie durable ou vigilance officielle.", "border-t-[#b1573c]"],
            ].map(([title, detail, color]) => (
              <article
                key={title}
                className={`border border-[#e0c99e] border-t-4 bg-white/35 p-6 ${color}`}
              >
                <h3 className="site-display text-3xl font-semibold">{title}</h3>
                <p className="mt-4 leading-7 text-[#6b6254]">{detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer className="site-label border-t border-[#332f26] px-5 py-8 text-xs font-medium uppercase leading-6 tracking-[0.08em] text-[#806f58] sm:px-9 lg:px-14">
        Vosges 2027 — carnet de préparation personnel. Vérifier les règles
        locales, les fermetures et la météo avant chaque départ.
      </footer>
    </main>
  );
}
