import { BoardingTicket } from "./boarding-ticket";
import { VoyageBrand } from "./voyage-brand";

const ISLANDE_PATH = "/voyage/islande-2026";

export function VoyageHomeSite() {
  return (
    <main id="contenu-principal" tabIndex={-1} className="min-h-screen bg-[#f4f6f8] text-[#0f1b2b]">
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

      <div className="mx-auto max-w-[78rem] px-5 pb-20 sm:px-9 lg:px-14">
        <section className="grid gap-10 border-b border-[#dfe4ea] py-16 sm:py-20 lg:grid-cols-[1.3fr_0.7fr] lg:items-end lg:py-24">
          <div>
            <p className="site-label text-xs font-semibold uppercase tracking-[0.17em] text-[#1c4ed8]">
              Carnet d’embarquement
            </p>
            <h1 className="site-display mt-5 max-w-4xl text-[clamp(3.7rem,9vw,7.5rem)] font-semibold leading-[0.88] tracking-[-0.06em]">
              Partir avec{" "}
              <br />
              un plan clair.
            </h1>
          </div>
          <div className="border-t border-[#dfe4ea] pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
            <p className="text-lg leading-8 text-[var(--site-muted)]">
              Une collection de voyages préparés comme des billets : trajets,
              étapes et réservations lisibles avant même de fermer la valise.
            </p>
            <dl className="site-label mt-8 grid grid-cols-2 gap-5 text-xs font-medium uppercase tracking-[0.12em]">
              <div>
                <dt className="text-[var(--site-muted)]">Carnets</dt>
                <dd className="mt-2 text-lg font-semibold text-[#0f1b2b]">
                  01
                </dd>
              </div>
              <div>
                <dt className="text-[var(--site-muted)]">Prochain départ</dt>
                <dd className="mt-2 text-lg font-semibold text-[#0f1b2b]">
                  Sept. 2026
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="py-14 sm:py-16">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--site-muted)]">
                Départs enregistrés
              </p>
              <h2 className="site-display mt-2 text-3xl font-semibold sm:text-4xl">
                Prochain embarquement
              </h2>
            </div>
            <p className="site-label text-xs font-medium uppercase tracking-[0.12em] text-[var(--site-muted)]">
              01 billet / 01
            </p>
          </div>

          <BoardingTicket
            actionHref={ISLANDE_PATH}
            actionLabel="Ouvrir"
            arrivalCode="KEF"
            departureCode="CDG"
            description="Huit jours entre Reykjavík, le Cercle d’Or, la côte sud et les lagunes glaciaires."
            eyebrow="12—19 septembre 2026 · Islande"
            status="a-venir"
            stubLabel="ISL / 2026"
            title="Islande — Route du Sud"
          />
        </section>

        <section className="grid gap-8 border-t border-[#dfe4ea] py-12 md:grid-cols-3">
          {[
            [
              "01",
              "Trajets",
              "Les codes et les dates essentielles, au même endroit.",
            ],
            [
              "02",
              "Étapes",
              "Une lecture quotidienne du parcours, sans surcharge.",
            ],
            [
              "03",
              "Réservations",
              "Les sources nommées, sans exposer les données privées.",
            ],
          ].map(([index, title, description]) => (
            <article key={index} className="border-l-2 border-[#1c4ed8] pl-5">
              <p className="site-label text-[0.65rem] font-semibold tracking-[0.14em] text-[#1c4ed8]">
                {index}
              </p>
              <h3 className="site-display mt-3 text-xl font-semibold">
                {title}
              </h3>
              <p className="mt-2 leading-6 text-[var(--site-muted)]">{description}</p>
            </article>
          ))}
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
