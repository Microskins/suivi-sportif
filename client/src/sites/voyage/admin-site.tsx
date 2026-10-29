// Ecran /voyage/admin, charge a la demande depuis le routeur: c'est un outil
// d'edition, sobre, qui ne pese pas sur le bundle des pages publiques.
import { useCallback, useEffect, useState } from "react";
import { VoyageApiError } from "./voyage-api";
import type { AuthErrorHandler } from "./admin-api";
import { readToken, storeToken } from "./admin-api";
import { AdminLogin } from "./admin-login";
import { AdminTripEditor } from "./admin-trip-editor";
import { AdminTripList } from "./admin-trip-list";
import { buttonClass } from "./admin-ui";
import { VoyageBrand } from "./voyage-brand";

type View = { kind: "list" } | { kind: "edit"; tripId: string | null };

export default function AdminSite() {
  const [token, setToken] = useState(readToken);
  const [forbidden, setForbidden] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [view, setView] = useState<View>({ kind: "list" });

  useEffect(() => {
    document.title = "Administration - Voyage";
  }, []);

  const logout = useCallback((message: string | null = null) => {
    storeToken(null);
    setToken(null);
    setForbidden(false);
    setView({ kind: "list" });
    setNotice(message);
  }, []);

  const handleAuthError = useCallback<AuthErrorHandler>(
    (error) => {
      if (!(error instanceof VoyageApiError)) return false;
      if (error.status === 401) {
        logout("Votre session a expiré : reconnectez-vous.");
        return true;
      }
      if (error.status === 403 && error.code === "VOYAGE_ADMIN_REQUIRED") {
        setForbidden(true);
        return true;
      }
      return false;
    },
    [logout],
  );

  let content;
  if (!token) {
    content = (
      <>
        {notice && (
          <p
            role="status"
            className="mx-auto mb-6 max-w-md rounded-[8px] border border-[#dfe4ea] bg-white px-4 py-3 text-sm"
          >
            {notice}
          </p>
        )}
        <AdminLogin
          onLoggedIn={() => {
            setNotice(null);
            setToken(readToken() ?? "session");
          }}
        />
      </>
    );
  } else if (forbidden) {
    content = (
      <div
        role="alert"
        className="mx-auto max-w-lg rounded-[12px] border border-[#dfe4ea] bg-white p-6 sm:p-8"
      >
        <h1 className="site-display text-2xl font-semibold">Accès refusé</h1>
        <p className="mt-3 leading-7 text-[var(--site-muted)]">
          Ce compte est bien connecté, mais il ne fait pas partie des
          administrateurs du site Voyage. Déconnectez-vous pour utiliser un
          autre compte.
        </p>
        <button
          type="button"
          className={`${buttonClass.primary} mt-6`}
          onClick={() => logout()}
        >
          Se déconnecter
        </button>
      </div>
    );
  } else if (view.kind === "edit") {
    content = (
      <AdminTripEditor
        key={view.tripId ?? "nouveau"}
        tripId={view.tripId}
        onAuthError={handleAuthError}
        onBack={() => setView({ kind: "list" })}
      />
    );
  } else {
    content = (
      <AdminTripList
        onAuthError={handleAuthError}
        onEdit={(tripId) => setView({ kind: "edit", tripId })}
      />
    );
  }

  return (
    <main
      id="contenu-principal"
      tabIndex={-1}
      className="min-h-screen bg-[#f4f6f8] text-[#0f1b2b]"
    >
      <header className="bg-[#0f1b2b] text-white">
        <div className="mx-auto flex max-w-[64rem] flex-wrap items-center justify-between gap-4 px-5 py-5 sm:px-9">
          <a href="/voyage" aria-label="Retour aux voyages">
            <VoyageBrand />
          </a>
          <div className="flex items-center gap-4">
            <p className="site-label text-xs font-medium uppercase tracking-[0.15em] text-white/70">
              Administration
            </p>
            {token && (
              <button
                type="button"
                onClick={() => logout()}
                className="site-label rounded-full border border-white/40 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white focus-visible:outline-white"
              >
                Se déconnecter
              </button>
            )}
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[64rem] px-5 pb-20 pt-10 sm:px-9">
        {content}
      </div>
    </main>
  );
}
