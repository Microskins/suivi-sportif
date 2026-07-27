import { PortfolioBrand } from "./portfolio-brand";

const SPORT_APP_PATH = "/suivi-sportif";
const TREKKING_PATH = "/trekking";

export function PortfolioSite() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#f4f1e8] text-[#17322e]">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 sm:px-10 lg:px-14">
        <header className="flex items-center justify-between border-b border-[#17322e]/20 pb-5">
          <a href="/" aria-label="Retour au portfolio">
            <PortfolioBrand />
          </a>
          <a
            href="#projets"
            className="text-sm font-semibold uppercase tracking-[0.16em] text-[#17322e]/70 transition hover:text-[#d84a32]"
          >
            Projets
          </a>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d84a32]">
              Espace de projets
            </p>
            <h1 className="mt-5 font-serif text-5xl leading-[0.96] sm:text-6xl lg:text-7xl">
              Portfolio
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-[#17322e]/80">
              Une collection de projets web construits pour etre utiles, simples a
              parcourir et agreables a utiliser.
            </p>
          </div>

          <div className="relative border-y border-[#17322e]/20 py-8 lg:border-y-0 lg:border-l lg:py-4 lg:pl-12">
            <p className="font-serif text-3xl leading-tight text-[#17322e]">
              Deux projets sont deja en ligne. D&apos;autres pourront rejoindre cette
              page au fil du temps.
            </p>
            <div className="mt-8 h-2 w-24 bg-[#d84a32]" />
          </div>
        </section>

        <section id="projets" className="border-t border-[#17322e]/20 py-8 sm:py-10">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="font-serif text-3xl">Projets</h2>
            <span className="text-sm font-medium text-[#17322e]/60">02</span>
          </div>

          <div className="grid gap-4">
            <a
              href={SPORT_APP_PATH}
              className="group grid gap-6 border border-[#17322e] bg-[#17322e] p-5 text-[#f4f1e8] transition hover:bg-[#245047] sm:grid-cols-[160px_1fr_auto] sm:items-center sm:p-6"
            >
              <div className="flex aspect-square w-28 items-center justify-center bg-[#071411] p-6 sm:w-40">
                <img
                  src="/sites/suivi-sportif/favicon.svg"
                  alt="Marque Suivi Sportif"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f4f1e8]/60">
                  Application web
                </p>
                <h3 className="mt-2 font-serif text-3xl">Suivi Sportif</h3>
                <p className="mt-3 max-w-xl leading-7 text-[#f4f1e8]/80">
                  Entrainements, nutrition et progression corporelle reunis au meme
                  endroit.
                </p>
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-[#f4f1e8] transition group-hover:text-[#f7bb4b]">
                Ouvrir
              </span>
            </a>

            <a
              href={TREKKING_PATH}
              className="group grid gap-6 border border-[#17322e] bg-[#cfe895] p-5 text-[#17322e] transition hover:bg-[#b8d57c] sm:grid-cols-[160px_1fr_auto] sm:items-center sm:p-6"
            >
              <img
                src="/sites/trekking/vosges-wild-hero.png"
                alt="Crete des Vosges au lever du jour"
                className="aspect-square w-28 object-cover sm:w-40"
              />
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#17322e]/60">
                  Carnet de trek
                </p>
                <h3 className="mt-2 font-serif text-3xl">Vosges Wild</h3>
                <p className="mt-3 max-w-xl leading-7 text-[#17322e]/80">
                  Premier trek de trois jours dans les Hautes-Vosges: itineraire,
                  etapes, sac et preparation terrain.
                </p>
              </div>
              <span className="text-sm font-semibold uppercase tracking-[0.16em] transition group-hover:text-[#d84a32]">
                Ouvrir
              </span>
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
