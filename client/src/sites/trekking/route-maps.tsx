import { useState } from "react";

type TrekMap = {
  id: string;
  label: string;
  src: string;
};

const TREK_MAPS: TrekMap[] = [
  {
    id: "trace-01",
    label: "Trace 01",
    src: "https://www.google.com/maps/d/embed?mid=1RgMdZ-flBR0RCBd3crgFZPnPmIPzSjk&ehbc=2E312F",
  },
  {
    id: "trace-02",
    label: "Trace 02",
    src: "https://www.google.com/maps/d/embed?mid=1vvAnoS9xjo8CzyP8p5Et5jnmojIRMe0&ehbc=2E312F",
  },
];

function MapPlaceholder({
  label,
  onLoad,
}: {
  label: string;
  onLoad: () => void;
}) {
  return (
    <div className="relative grid h-full min-h-72 place-items-center overflow-hidden bg-[#0a1f17] p-8 text-center">
      <div
        aria-hidden="true"
        className="absolute -left-16 -top-20 h-64 w-64 rounded-full border border-[#315947]"
      />
      <div
        aria-hidden="true"
        className="absolute -left-8 -top-12 h-48 w-48 rounded-full border border-[#315947]/70"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -right-12 h-60 w-60 rounded-full border border-[#315947]"
      />
      <div className="relative max-w-sm">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-[#cfe895] text-xs font-black text-[#cfe895]">
          MAP
        </span>
        <p className="mt-5 font-serif text-3xl text-[#f4efdf]">{label}</p>
        <p className="mt-3 text-sm leading-6 text-[#9eb3a6]">
          La carte est fournie par Google My Maps. Elle ne sera contactee
          qu&apos;apres ton action.
        </p>
        <button
          type="button"
          onClick={onLoad}
          className="mt-6 border border-[#cfe895] bg-[#cfe895] px-5 py-3 text-xs font-black uppercase tracking-[0.14em] text-[#102016] transition hover:bg-transparent hover:text-[#cfe895] focus:outline-none focus:ring-2 focus:ring-[#f4efdf] focus:ring-offset-2 focus:ring-offset-[#0a1f17]"
        >
          Charger la carte
        </button>
      </div>
    </div>
  );
}

function TrekMapCard({
  map,
  isLoaded,
  onLoad,
}: {
  map: TrekMap;
  isLoaded: boolean;
  onLoad: () => void;
}) {
  return (
    <article className="overflow-hidden border border-[#315947] bg-[#102d21]">
      <div className="flex items-center justify-between gap-4 border-b border-[#315947] px-5 py-4">
        <div>
          <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#95d5a8]">
            Cartographie terrain
          </p>
          <h4 className="mt-1 font-serif text-2xl text-[#f4efdf]">{map.label}</h4>
        </div>
        <a
          href={map.src}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-bold uppercase tracking-[0.12em] text-[#cfe895] underline decoration-[#315947] underline-offset-4 transition hover:decoration-[#cfe895]"
        >
          Nouvel onglet
        </a>
      </div>

      <div className="aspect-[4/3] min-h-72">
        {isLoaded ? (
          <iframe
            src={map.src}
            title={`Carte Google My Maps - ${map.label}`}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            className="h-full w-full border-0"
          />
        ) : (
          <MapPlaceholder label={map.label} onLoad={onLoad} />
        )}
      </div>
    </article>
  );
}

export function RouteMaps() {
  const [loadedMapIds, setLoadedMapIds] = useState<string[]>([]);

  function loadMap(mapId: string) {
    setLoadedMapIds((currentIds) =>
      currentIds.includes(mapId) ? currentIds : [...currentIds, mapId],
    );
  }

  return (
    <section
      aria-labelledby="route-maps-title"
      className="border-t border-[#315947] bg-[#071610] p-6 lg:p-10"
    >
      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#95d5a8]">
            Deux lectures du terrain
          </p>
          <h3
            id="route-maps-title"
            className="mt-3 font-serif text-4xl leading-none text-[#f4efdf]"
          >
            Les traces detaillees
          </h3>
        </div>
        <p className="max-w-2xl leading-7 text-[#a9bcb1]">
          Ouvre chaque carte pour comparer les deux traces. Verifie toujours les
          fermetures, la meteo et le balisage avant de partir.
        </p>
      </div>

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        {TREK_MAPS.map((map) => (
          <TrekMapCard
            key={map.id}
            map={map}
            isLoaded={loadedMapIds.includes(map.id)}
            onLoad={() => loadMap(map.id)}
          />
        ))}
      </div>
    </section>
  );
}
