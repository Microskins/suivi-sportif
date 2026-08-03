import { TrekkingBrand } from "./trekking-brand";

const VOSGES_WILD_PATH = "/trekking/vosges-wild";

export function TrekkingHomeSite() {
  return (
    <main className="site-topography min-h-screen bg-[#f1e2c4] text-[#332f26]">
      <section className="relative isolate min-h-[44rem] overflow-hidden">
        <img
          src="/sites/trekking/vosges-wild-hero.png"
          alt="Crête des Hautes-Vosges au lever du jour"
          className="absolute inset-0 -z-20 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,rgba(40,44,30,.18)_0%,rgba(30,34,22,.52)_45%,rgba(30,34,22,.82)_73%,#f1e2c4_100%)]" />

        <div className="mx-auto flex min-h-[44rem] max-w-[78rem] flex-col px-5 py-5 sm:px-9 lg:px-14">
          <header className="flex items-center justify-between gap-6 border-b border-white/30 pb-5">
            <a href="/" aria-label="Retour au portfolio">
              <TrekkingBrand />
            </a>
            <p className="site-label hidden text-xs font-medium uppercase tracking-[0.14em] text-white/80 sm:block">
              Carnets de marche / Édition 01
            </p>
          </header>

          <div className="mt-auto max-w-5xl pb-24 pt-28 text-white sm:pb-28">
            <p className="site-label inline-flex rounded-full border border-white/40 bg-[#b0794c]/55 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.14em] backdrop-blur-sm">
              🥾 Itinérances à pied
            </p>
            <h1 className="site-display mt-6 max-w-4xl text-[clamp(3.8rem,9vw,6.8rem)] font-semibold leading-[0.9]">
              Marcher loin,
              <br />
              regarder mieux.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/85 sm:text-xl">
              Des carnets conçus pour préparer le terrain, garder le cap et
              raconter ce qui reste après les kilomètres.
            </p>
            <div className="site-label mt-9 flex flex-wrap gap-3 text-xs font-medium uppercase tracking-[0.1em]">
              {["1 voyage", "3 jours", "2 traces"].map((stat) => (
                <span
                  key={stat}
                  className="rounded-[14px] border border-white/30 bg-[#332f26]/55 px-4 py-3 backdrop-blur-sm"
                >
                  {stat}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[78rem] px-5 pb-20 sm:px-9 lg:px-14">
        <section className="pt-8">
          <div className="flex items-end justify-between gap-6 border-b-2 border-[#332f26] pb-4">
            <div>
              <p className="site-label text-[0.68rem] font-medium uppercase tracking-[0.15em] text-[#b0794c]">
                Carnets disponibles
              </p>
              <h2 className="site-display mt-2 text-4xl font-semibold sm:text-5xl">
                Choisir un horizon
              </h2>
            </div>
            <span className="site-label text-xs font-medium text-[#b0794c]">01 / 01</span>
          </div>

          <a
            href={VOSGES_WILD_PATH}
            className="group mt-8 grid border border-[#332f26] bg-[#f7ecd5]/70 transition hover:bg-[#f7ecd5] md:grid-cols-[0.92fr_1.08fr]"
          >
            <div className="overflow-hidden border-b border-[#332f26] md:border-b-0 md:border-r">
              <img
                src="/sites/trekking/vosges-wild-hero.png"
                alt="Panorama des Hautes-Vosges"
                className="h-72 w-full object-cover transition duration-700 group-hover:scale-[1.025] md:h-full"
              />
            </div>
            <div className="flex min-h-[24rem] flex-col p-6 sm:p-9">
              <p className="site-label text-[0.68rem] font-medium uppercase tracking-[0.15em] text-[#5c7350]">
                France · Hautes-Vosges
              </p>
              <h3 className="site-display mt-4 text-5xl font-semibold leading-[0.94] sm:text-6xl">
                Vosges 2027
              </h3>
              <p className="mt-5 max-w-xl text-lg leading-8 text-[#5f584c]">
                Une première itinérance entre crêtes, lacs glaciaires et
                chaumes, préparée autour de deux parcours de trois jours.
              </p>

              <svg
                viewBox="0 0 360 74"
                role="img"
                aria-label="Profil d’élévation indicatif du parcours"
                className="mt-7 h-20 w-full border-y border-[#e0c99e] py-3"
              >
                <polyline
                  points="0,58 34,48 66,52 102,24 132,38 171,17 207,29 243,10 278,35 318,22 360,45"
                  fill="none"
                  stroke="#5c7350"
                  strokeWidth="3"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <div className="site-label mt-auto flex flex-wrap items-center justify-between gap-5 pt-7 text-xs font-medium uppercase tracking-[0.1em]">
                <span className="text-[#b0794c]">36 à 41 km · 3 jours</span>
                <span className="rounded-full bg-[#332f26] px-5 py-3 text-[#f1e2c4] transition group-hover:bg-[#5c7350]">
                  Ouvrir le carnet →
                </span>
              </div>
            </div>
          </a>
        </section>
      </div>
    </main>
  );
}
