import { useState } from "react";
import { useTrekkingStore } from "../stores/trekkingStore";

type RouteView = "trace" | "etapes" | "sac";

const PACKING_ITEMS = [
  "Tente ou abri leger",
  "Duvet adapte",
  "Matelas isolant",
  "Sac de 45 a 55 litres",
  "Chaussures deja rodees",
  "Veste impermeable",
  "Couche chaude",
  "Tenue seche pour la nuit",
  "Deux litres d'eau par personne",
  "Filtre a eau",
  "Carte hors ligne",
  "Batterie externe",
  "Lampe frontale",
  "Trousse de secours",
  "Nourriture pour trois jours",
  "Sacs pour les dechets",
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

const STAGES = [
  {
    day: "01",
    title: "Schlucht - Hohneck - Schiessrothried",
    distance: "13 a 15 km",
    duration: "5 a 6 h",
    detail: "Depart matinal, sommet du Hohneck puis descente soutenue vers le lac.",
  },
  {
    day: "02",
    title: "Crete - Tanet - Lac Blanc",
    distance: "19 a 21 km",
    duration: "6 a 8 h",
    detail: "La journee la plus engagee: longue traversee, reserve sensible et solution de nuit a confirmer.",
  },
  {
    day: "03",
    title: "Lac Blanc - Gazon du Faing - Schlucht",
    distance: "13 a 15 km",
    duration: "5 a 6 h",
    detail: "Retour par les cretes: partir tot et surveiller le vent, le brouillard et les orages.",
  },
];

function RouteTrace() {
  return (
    <div className="grid gap-8 p-6 lg:grid-cols-[0.8fr_1.2fr] lg:p-10">
      <div className="border-b border-[#315947] pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#cfe895]">
          Boucle de preparation
        </p>
        <h3 className="mt-3 font-serif text-4xl leading-none text-[#f4efdf]">
          Col de la Schlucht
        </h3>
        <p className="mt-4 leading-7 text-[#b5c8bb]">
          Depart et retour a 1 139 m. Le parcours suit les chaumes, le Hohneck,
          les lacs glaciaires et le GR5 avant de revenir au point de depart.
        </p>
        <p className="mt-6 border-l-2 border-[#f4c56a] pl-4 text-sm leading-6 text-[#dfe9e2]">
          La trace est un support de preparation. Une carte IGN recente et les
          conditions du terrain restent indispensables.
        </p>
      </div>

      <ol className="space-y-0">
        {[
          ["01", "Col de la Schlucht", "1 139 m - depart"],
          ["02", "Hohneck", "1 363 m - point culminant"],
          ["03", "Lac de Schiessrothried", "930 m - eau a traiter"],
          ["04", "Le Tanet et Gazon du Faing", "1 292 a 1 306 m - zone sensible"],
          ["05", "Lac Blanc", "1 055 m - nuit a anticiper"],
          ["06", "Retour Schlucht", "49 km - boucle terminee"],
        ].map(([index, title, note], itemIndex) => (
          <li key={title} className="grid grid-cols-[2.5rem_1fr] gap-4">
            <div className="flex flex-col items-center">
              <span className="grid h-9 w-9 place-items-center rounded-full border border-[#cfe895] text-xs font-bold text-[#cfe895]">
                {index}
              </span>
              {itemIndex < 5 && <span className="h-10 w-px bg-[#315947]" />}
            </div>
            <div className="pb-4 pt-1">
              <p className="font-serif text-2xl text-[#f4efdf]">{title}</p>
              <p className="mt-1 text-sm text-[#9eb3a6]">{note}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Stages() {
  return (
    <div className="grid gap-px bg-[#315947] md:grid-cols-3">
      {STAGES.map((stage) => (
        <article key={stage.day} className="relative min-h-80 overflow-hidden bg-[#102d21] p-6 lg:p-8">
          <span className="absolute -right-2 -top-8 font-serif text-9xl leading-none text-white/[0.04]">
            {stage.day}
          </span>
          <p className="relative text-xs font-bold uppercase tracking-[0.18em] text-[#95d5a8]">
            Jour {stage.day}
          </p>
          <h3 className="relative mt-5 max-w-xs font-serif text-3xl leading-none text-[#f4efdf]">
            {stage.title}
          </h3>
          <div className="relative mt-6 flex flex-wrap gap-2 text-xs font-semibold text-[#dfe9e2]">
            <span className="border border-[#315947] px-3 py-2">{stage.distance}</span>
            <span className="border border-[#315947] px-3 py-2">{stage.duration}</span>
          </div>
          <p className="relative mt-6 max-w-sm text-sm leading-6 text-[#a9bcb1]">{stage.detail}</p>
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
    <div className="p-6 lg:p-10">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#315947] pb-6">
        <div>
          <p className="font-serif text-4xl text-[#f4efdf]">
            {packedItemIds.length} / {PACKING_ITEMS.length}
          </p>
          <p className="mt-1 text-sm text-[#a9bcb1]">elements prets pour le depart</p>
        </div>
        <button
          type="button"
          onClick={resetPackedItems}
          className="border border-[#5d796a] px-4 py-2 text-sm font-semibold text-[#dfe9e2] transition hover:border-[#cfe895] hover:text-[#cfe895]"
        >
          Reinitialiser
        </button>
      </div>
      <div className="mt-4 h-2 overflow-hidden bg-[#183c2d]">
        <div
          className={`h-full bg-[#cfe895] transition-all ${PROGRESS_WIDTH_CLASSES[packedItemIds.length]}`}
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
                  ? "border-[#315947] bg-[#15392a] text-[#8ba398] line-through"
                  : "border-[#315947] bg-[#102d21] text-[#e8eee8] hover:border-[#95d5a8]"
              }`}
            >
              <input
                type="checkbox"
                checked={isPacked}
                onChange={() => togglePackedItem(itemId)}
                className="h-4 w-4 accent-[#cfe895]"
              />
              {item}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function Trekking() {
  const [routeView, setRouteView] = useState<RouteView>("trace");

  return (
    <main className="min-h-screen bg-[#071610] text-[#f4efdf]">
      <section className="relative isolate min-h-[44rem] overflow-hidden border-b border-[#315947]">
        <img
          src="/media/trekking/vosges-wild-hero.png"
          alt="Crete des Hautes-Vosges au lever du jour"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[#071610]/55" />
        <div className="mx-auto flex min-h-[44rem] max-w-6xl flex-col px-6 py-6 sm:px-10 lg:px-14">
          <header className="flex items-center justify-between border-b border-white/20 pb-5">
            <a href="/" className="font-serif text-xl font-semibold tracking-wide">
              Vosges Wild
            </a>
            <a
              href="#itineraire"
              className="text-sm font-semibold uppercase tracking-[0.16em] text-[#e6ede8]/80 transition hover:text-[#cfe895]"
            >
              Le trek
            </a>
          </header>

          <div className="mt-auto max-w-4xl pb-14 pt-24 sm:pb-20">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#cfe895]">
              Micro-aventure - 3 jours / 2 nuits
            </p>
            <h1 className="mt-6 font-serif text-6xl leading-[0.88] sm:text-7xl lg:text-9xl">
              La crete
              <br />
              comme horizon.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-[#e7ede9] sm:text-xl">
              Un carnet de preparation pour une premiere itinerance dans les
              Hautes-Vosges, entre Hohneck, lacs glaciaires et chaumes d'altitude.
            </p>
            <a
              href="#itineraire"
              className="mt-9 inline-flex border border-[#cfe895] bg-[#cfe895] px-5 py-3 text-sm font-bold uppercase tracking-[0.12em] text-[#102016] transition hover:bg-transparent hover:text-[#cfe895]"
            >
              Explorer le parcours
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-6 sm:px-10 lg:px-14">
        <section className="grid border-x border-b border-[#315947] bg-[#102d21] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["49 km", "base indicative"],
            ["3 jours", "2 nuits"],
            ["1 363 m", "point culminant"],
            ["Modere +", "avec sac"],
          ].map(([value, label]) => (
            <div key={label} className="border-b border-[#315947] p-6 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
              <p className="font-serif text-4xl text-[#f4efdf]">{value}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-[#9eb3a6]">
                {label}
              </p>
            </div>
          ))}
        </section>

        <section id="itineraire" className="py-20 sm:py-28">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#95d5a8]">
                Navigation
              </p>
              <h2 className="mt-4 font-serif text-5xl leading-[0.92] sm:text-6xl">
                Votre terrain de jeu
              </h2>
            </div>
            <p className="max-w-xl text-lg leading-8 text-[#a9bcb1]">
              La boucle se construit autour des points majeurs. Les kilometres,
              temps et altitudes sont des reperes de preparation, pas une promesse
              de conditions terrain.
            </p>
          </div>

          <div className="mt-10 overflow-hidden border border-[#315947] bg-[#102d21]">
            <div className="flex flex-wrap gap-2 border-b border-[#315947] p-3">
              {([
                ["trace", "Itineraire"],
                ["etapes", "Les etapes"],
                ["sac", "Le sac"],
              ] as const).map(([view, label]) => (
                <button
                  key={view}
                  type="button"
                  onClick={() => setRouteView(view)}
                  className={`px-4 py-2 text-sm font-bold transition ${
                    routeView === view
                      ? "bg-[#cfe895] text-[#102016]"
                      : "text-[#a9bcb1] hover:bg-[#15392a] hover:text-[#f4efdf]"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            {routeView === "trace" && <RouteTrace />}
            {routeView === "etapes" && <Stages />}
            {routeView === "sac" && <PackList />}
          </div>
        </section>

        <section className="grid gap-px border-y border-[#315947] bg-[#315947] md:grid-cols-2">
          <article className="bg-[#0c241a] p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#95d5a8]">
              Bivouac
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-none">Bivouaquer sans abimer</h2>
            <p className="mt-6 max-w-xl leading-8 text-[#a9bcb1]">
              Installer leger au coucher du soleil, repartir au lever du jour,
              ne laisser aucun dechet et ne jamais faire de feu. Les reserves, les
              communes et les proprietaires imposent leurs propres regles.
            </p>
          </article>
          <article className="bg-[#102d21] p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#f4c56a]">
              Point de vigilance
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-none">Une nuit de secours</h2>
            <p className="mt-6 max-w-xl leading-8 text-[#c0cec5]">
              Garder une solution en dur autour du Lac Blanc: refuge, auberge,
              gite ou camping. Le beau panorama ne vaut jamais une installation
              dans une zone interdite ou exposee.
            </p>
          </article>
        </section>

        <section className="py-20 sm:py-28">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#95d5a8]">
            Decision
          </p>
          <h2 className="mt-4 max-w-3xl font-serif text-5xl leading-[0.92] sm:text-6xl">
            Le feu vert meteo se gagne la veille.
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {[
              ["Maintenir", "Temps stable, bonne visibilite, vent raisonnable et aucun orage annonce.", "border-t-[#95d5a8]"],
              ["Adapter", "Brouillard ou pluie faible: raccourcir, eviter les passages raides et dormir en dur.", "border-t-[#f4c56a]"],
              ["Reporter", "Orages, fortes rafales, canicule, pluie durable ou vigilance officielle.", "border-t-[#ff8c7e]"],
            ].map(([title, detail, color]) => (
              <article
                key={title}
                className={`border border-[#315947] border-t-[3px] bg-[#102d21] p-6 ${color}`}
              >
                <h3 className="font-serif text-3xl">{title}</h3>
                <p className="mt-4 leading-7 text-[#a9bcb1]">{detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-[#315947] px-6 py-8 text-sm text-[#81958a] sm:px-10 lg:px-14">
        Vosges Wild - carnet de preparation personnel. Verifier les regles locales,
        les fermetures et la meteo avant chaque depart.
      </footer>
    </main>
  );
}
