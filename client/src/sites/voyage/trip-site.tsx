import { useEffect, useState } from "react";
import { TripCarnet } from "./trip-carnet";
import type { TripDetail } from "./trip-types";
import { VoyageBrand } from "./voyage-brand";
import { VoyageApiError, fetchTrip } from "./voyage-api";

type CarnetState =
  | { state: "loading" }
  | { state: "not-found" }
  | { state: "error" }
  | { state: "ready"; trip: TripDetail };

// Page carnet generique: tout vient de GET /api/voyages/:slug.
export function TripSite({ slug }: { slug: string }) {
  const [carnet, setCarnet] = useState<CarnetState>({ state: "loading" });

  useEffect(() => {
    let cancelled = false;
    setCarnet({ state: "loading" });
    fetchTrip(slug)
      .then((trip) => {
        if (cancelled) return;
        setCarnet({ state: "ready", trip });
        document.title = `${trip.title} - Voyage`;
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setCarnet({
          state:
            error instanceof VoyageApiError && error.status === 404
              ? "not-found"
              : "error",
        });
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

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
        {carnet.state === "ready" ? (
          <TripCarnet trip={carnet.trip} />
        ) : (
          <div
            role="status"
            className="grid min-h-[50vh] place-items-center text-center"
          >
            <div>
              <p className="site-label text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-[var(--site-muted)]">
                {carnet.state === "loading"
                  ? "Embarquement"
                  : "Billet introuvable"}
              </p>
              <h1 className="site-display mt-3 text-3xl font-semibold sm:text-4xl">
                {carnet.state === "loading"
                  ? "Chargement du carnet…"
                  : carnet.state === "not-found"
                    ? "Ce carnet n’existe pas ou n’est pas publié."
                    : "Le carnet est indisponible pour le moment."}
              </h1>
              {carnet.state !== "loading" && (
                <a
                  href="/voyage"
                  className="site-label mt-6 inline-block text-xs font-semibold uppercase tracking-[0.12em] text-[#1c4ed8] hover:underline"
                >
                  Retour aux voyages →
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      <footer className="border-t border-[#dfe4ea] bg-white">
        <div className="site-label mx-auto flex max-w-[78rem] flex-col gap-2 px-5 py-5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--site-muted)] sm:flex-row sm:justify-between sm:px-9 lg:px-14">
          <p>
            {carnet.state === "ready" ? carnet.trip.stubLabel : "Voyage"} ·
            Carnet de route
          </p>
          <a href="/voyage" className="text-[#1c4ed8] hover:underline">
            Retour aux voyages →
          </a>
        </div>
      </footer>
    </main>
  );
}
