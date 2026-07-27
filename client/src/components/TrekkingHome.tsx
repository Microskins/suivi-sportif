const VOSGES_WILD_PATH = "/trekking/vosges-wild";

export function TrekkingHome() {
  return (
    <main className="min-h-screen bg-[#071610] text-[#f4efdf]">
      <div className="mx-auto max-w-6xl px-6 py-6 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between border-b border-[#315947] pb-5">
          <a href="/" className="font-serif text-xl font-semibold tracking-wide">
            Trekking
          </a>
          <span className="text-sm font-bold uppercase tracking-[0.16em] text-[#95d5a8]">
            Carnets de voyage
          </span>
        </header>

        <section className="grid min-h-[31rem] items-end gap-10 py-16 lg:grid-cols-[1fr_0.85fr] lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#cfe895]">
              Les voyages a pied
            </p>
            <h1 className="mt-5 font-serif text-6xl leading-[0.88] sm:text-7xl lg:text-8xl">
              Carnets de
              <br />
              trek.
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#b5c8bb]">
              Des itineraire prepares pour garder le cap: etapes, sac, points de
              vigilance et souvenirs de chaque aventure.
            </p>
          </div>
          <p className="border-l border-[#315947] pl-7 font-serif text-3xl leading-tight text-[#e2ede5]">
            Chaque voyage possede son propre chemin, ses propres donnees et son
            propre carnet.
          </p>
        </section>

        <section className="border-t border-[#315947] py-8 sm:py-10">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-3xl">Voyages</h2>
            <span className="text-sm font-medium text-[#8fa79a]">01</span>
          </div>
          <a
            href={VOSGES_WILD_PATH}
            className="group grid overflow-hidden border border-[#315947] bg-[#102d21] transition hover:border-[#cfe895] md:grid-cols-[0.95fr_1.05fr]"
          >
            <img
              src="/media/trekking/vosges-wild-hero.png"
              alt="Crete des Hautes-Vosges au lever du jour"
              className="h-72 w-full object-cover transition duration-500 group-hover:scale-[1.03] md:h-full"
            />
            <div className="flex min-h-72 flex-col p-7 sm:p-10">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#95d5a8]">
                France - Hautes-Vosges
              </p>
              <h3 className="mt-5 font-serif text-5xl leading-[0.9]">Vosges Wild</h3>
              <p className="mt-5 max-w-lg leading-7 text-[#b5c8bb]">
                Une boucle de trois jours entre le Hohneck, les lacs glaciaires et
                les chaumes d'altitude.
              </p>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-[#315947] pt-6">
                <span className="text-sm font-semibold text-[#dfe9e2]">49 km - 3 jours</span>
                <span className="text-sm font-bold uppercase tracking-[0.14em] text-[#cfe895]">
                  Ouvrir le carnet
                </span>
              </div>
            </div>
          </a>
        </section>
      </div>
    </main>
  );
}
