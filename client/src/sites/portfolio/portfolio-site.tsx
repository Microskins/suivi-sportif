import { PortfolioBrand } from "./portfolio-brand";

const SPORT_APP_PATH = "/suivi-sportif";
const PRICE_COMPARISON_PATH = "/prix-aliments";
const TREKKING_PATH = "/trekking";
const VOYAGE_PATH = "/voyage";

const projects = [
  {
    description:
      "Un espace unique pour organiser ses séances, suivre sa nutrition et lire sa progression corporelle sans disperser ses données.",
    href: SPORT_APP_PATH,
    index: "01",
    specs: ["Entraînement", "Nutrition", "Mensurations"],
    status: "En ligne",
    tag: "Application web",
    title: "Suivi Sportif",
  },
  {
    description:
      "Des itinéraires préparés comme de vrais carnets de terrain, avec étapes, traces, matériel et souvenirs de marche.",
    href: TREKKING_PATH,
    index: "02",
    specs: ["3 jours", "2 traces", "Carnet photo local"],
    status: "En ligne",
    tag: "Carnets de marche",
    title: "Trekking",
  },
  {
    description:
      "Un carnet d'embarquement pour regrouper trajets, étapes et réservations de chaque départ sans exposer les données privées.",
    href: VOYAGE_PATH,
    index: "03",
    specs: ["Itinéraires", "Réservations", "Carte de route"],
    status: "En ligne",
    tag: "Carnets de voyage",
    title: "Voyage",
  },
  {
    description:
      "Un comparateur lisible pour rechercher un aliment et confronter son prix, son format et sa fraîcheur chez quatre enseignes.",
    href: PRICE_COMPARISON_PATH,
    index: "04",
    specs: ["8 produits démo", "4 enseignes", "Prix unitaires"],
    status: "Prototype",
    tag: "Comparateur alimentaire",
    title: "Prix Frais",
  },
];

export function PortfolioSite() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#efe7d8] text-[#1b2a3d]">
      <div className="mx-auto flex min-h-screen max-w-[78rem] flex-col px-5 py-5 sm:px-9 lg:px-14">
        <header className="flex items-center justify-between gap-6 border-b-[3px] border-[#1b2a3d] pb-5">
          <a href="/" aria-label="Retour au portfolio">
            <PortfolioBrand />
          </a>
          <p className="site-label text-right text-[0.68rem] font-semibold uppercase leading-5 tracking-[0.16em] text-[#5b6474] sm:text-xs">
            Édition 2026
            <span className="block text-[#a63d2f]">
              N° 04 — Projets choisis
            </span>
          </p>
        </header>

        <section className="grid gap-9 py-14 sm:py-20 lg:grid-cols-[1.4fr_1px_1fr] lg:gap-12 lg:py-24">
          <div>
            <p className="site-label text-xs font-semibold uppercase tracking-[0.16em] text-[#a63d2f]">
              Thomas Cochart — Développeur produit
            </p>
            <h1 className="site-display mt-5 max-w-4xl text-[clamp(4.8rem,13vw,10rem)] font-bold uppercase leading-[0.82] tracking-[-0.02em]">
              Faire
              <br />
              utile.
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-8 text-[#1b2a3d] first-letter:float-left first-letter:mr-2 first-letter:font-['Barlow_Condensed'] first-letter:text-6xl first-letter:font-bold first-letter:leading-[0.8] first-letter:text-[#a63d2f] sm:text-2xl sm:leading-9">
              Je conçois des outils web lisibles, concrets et attentifs aux
              usages quotidiens. Chaque projet commence par un besoin réel et se
              termine par une interface qui sait rester à sa place.
            </p>
          </div>

          <div className="hidden bg-[#1b2a3d] lg:block" aria-hidden="true" />

          <aside className="border-t border-[#c9bfa8] pt-7 lg:border-t-0 lg:pt-8">
            <p className="text-2xl italic leading-9 text-[#5b6474] sm:text-3xl sm:leading-10">
              « Le bon niveau de détail n&apos;est pas celui qui impressionne.
              C&apos;est celui qui aide à décider. »
            </p>
            <dl className="site-label mt-12 grid grid-cols-2 gap-y-7 border-t border-[#c9bfa8] pt-6 text-xs font-semibold uppercase tracking-[0.12em]">
              <div>
                <dt className="text-[#5b6474]">Édition</dt>
                <dd className="mt-2 text-base text-[#1b2a3d]">2026 / 03</dd>
              </div>
              <div>
                <dt className="text-[#5b6474]">Projets</dt>
                <dd className="mt-2 text-base text-[#1b2a3d]">
                  Trois en ligne · Un prototype
                </dd>
              </div>
              <div className="col-span-2">
                <dt className="text-[#5b6474]">Territoires</dt>
                <dd className="mt-2 text-base text-[#1b2a3d]">
                  Sport · Données · Plein air · Voyage · Budget
                </dd>
              </div>
            </dl>
          </aside>
        </section>

        <section id="projets" className="pb-14">
          <div className="flex items-end justify-between gap-5 border-y-[3px] border-[#1b2a3d] py-4">
            <h2 className="site-display text-4xl font-bold uppercase leading-none sm:text-5xl">
              Catalogue
            </h2>
            <span className="site-label text-xs font-semibold uppercase tracking-[0.16em] text-[#5b6474]">
              Sélection / 001—004
            </span>
          </div>

          <div>
            {projects.map((project) => (
              <article
                key={project.href}
                className="grid border-b border-[#c9bfa8] py-7 sm:grid-cols-[64px_1fr] sm:gap-5 lg:grid-cols-[64px_1fr_240px] lg:gap-8 lg:py-9"
              >
                <p className="site-display text-6xl font-semibold leading-none text-[#c9bfa8]">
                  {project.index}
                </p>

                <div>
                  <p className="site-label mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#a63d2f] sm:mt-0">
                    {project.tag}
                  </p>
                  <h3 className="site-display mt-2 text-5xl font-bold uppercase leading-[0.9] sm:text-6xl">
                    {project.title}
                  </h3>
                  <p className="mt-5 max-w-2xl text-lg leading-7 text-[#5b6474]">
                    {project.description}
                  </p>
                  <ul className="site-label mt-7 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#c9bfa8] pt-4 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#5b6474]">
                    {project.specs.map((spec) => (
                      <li key={spec}>{spec}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-7 flex items-end justify-between border-t border-[#c9bfa8] pt-5 lg:mt-0 lg:flex-col lg:items-start lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
                  <p className="site-label text-xs font-semibold uppercase tracking-[0.14em] text-[#4a5a3f]">
                    ● {project.status}
                  </p>
                  <a
                    href={project.href}
                    className="site-label border-b-2 border-[#a63d2f] pb-1 text-sm font-semibold uppercase tracking-[0.12em] transition hover:text-[#a63d2f]"
                  >
                    Ouvrir le projet ↗
                  </a>
                </div>
              </article>
            ))}
          </div>
        </section>

        <footer className="site-label mt-auto flex flex-col gap-2 border-t-[3px] border-[#1b2a3d] py-5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-[#5b6474] sm:flex-row sm:items-center sm:justify-between">
          <p>Thomas Cochart — Portfolio</p>
          <p>Conçu et développé en France</p>
        </footer>
      </div>
    </main>
  );
}
