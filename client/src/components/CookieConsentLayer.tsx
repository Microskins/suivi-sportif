import { useEffect, useMemo, useState } from "react";
import { initializeConsentGatedBootstraps } from "../consent/trackerBootstrap";
import { useCookieConsentStore } from "../stores/cookieConsentStore";

function CookieBanner() {
  const acceptAll = useCookieConsentStore((state) => state.acceptAll);
  const rejectAll = useCookieConsentStore((state) => state.rejectAll);
  const openConsentPreferences = useCookieConsentStore(
    (state) => state.openConsentPreferences,
  );

  return (
    <section className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-300 bg-white/95 p-4 shadow-lg backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h2 className="text-sm font-semibold text-slate-900">Gestion des cookies</h2>
          <p className="mt-1 text-sm text-slate-700">
            Nous utilisons uniquement les cookies necessaires par defaut. Tu peux accepter
            ou refuser les categories optionnelles, puis modifier ton choix a tout moment.
          </p>
          <a
            href="/politique-cookies"
            className="mt-2 inline-block text-sm font-medium text-slate-900 underline"
          >
            Consulter la politique cookies
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={rejectAll}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Tout refuser
          </button>
          <button
            type="button"
            onClick={openConsentPreferences}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Personnaliser
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Tout accepter
          </button>
        </div>
      </div>
    </section>
  );
}

function CookiePreferencesModal() {
  const isOpen = useCookieConsentStore((state) => state.isPreferencesOpen);
  const consent = useCookieConsentStore((state) => state.consent);
  const closeConsentPreferences = useCookieConsentStore(
    (state) => state.closeConsentPreferences,
  );
  const savePreferences = useCookieConsentStore((state) => state.savePreferences);
  const rejectAll = useCookieConsentStore((state) => state.rejectAll);
  const acceptAll = useCookieConsentStore((state) => state.acceptAll);

  const initialAnalytics = useMemo(
    () => consent?.categories.analytics ?? false,
    [consent],
  );
  const initialMarketing = useMemo(
    () => consent?.categories.marketing ?? false,
    [consent],
  );
  const [analytics, setAnalytics] = useState(initialAnalytics);
  const [marketing, setMarketing] = useState(initialMarketing);

  useEffect(() => {
    if (!isOpen) return;
    setAnalytics(initialAnalytics);
    setMarketing(initialMarketing);
  }, [isOpen, initialAnalytics, initialMarketing]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <section className="w-full max-w-xl rounded-lg border border-slate-300 bg-white p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-900">Preferences cookies</h2>
        <p className="mt-2 text-sm text-slate-700">
          Choisis les categories que tu autorises. Les cookies necessaires restent
          actifs pour le fonctionnement de l'application.
        </p>
        <a
          href="/politique-cookies"
          className="mt-2 inline-block text-sm font-medium text-slate-900 underline"
        >
          Lire la politique cookies
        </a>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between rounded border border-slate-200 p-3">
            <span>
              <span className="block text-sm font-medium text-slate-900">Necessaires</span>
              <span className="block text-xs text-slate-600">
                Authentification, securite et fonctionnement principal.
              </span>
            </span>
            <input type="checkbox" checked disabled className="h-4 w-4 accent-slate-900" />
          </label>

          <label className="flex items-center justify-between rounded border border-slate-200 p-3">
            <span>
              <span className="block text-sm font-medium text-slate-900">Analytics</span>
              <span className="block text-xs text-slate-600">
                Mesure d'usage anonyme pour ameliorer le produit.
              </span>
            </span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="h-4 w-4 accent-slate-900"
            />
          </label>

          <label className="flex items-center justify-between rounded border border-slate-200 p-3">
            <span>
              <span className="block text-sm font-medium text-slate-900">Marketing</span>
              <span className="block text-xs text-slate-600">
                Personalisation publicitaire et campagnes externes.
              </span>
            </span>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              className="h-4 w-4 accent-slate-900"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={closeConsentPreferences}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Tout refuser
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Tout accepter
          </button>
          <button
            type="button"
            onClick={() => savePreferences({ analytics, marketing })}
            className="rounded bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Enregistrer
          </button>
        </div>
      </section>
    </div>
  );
}

function ManageCookiesButton() {
  const isBannerVisible = useCookieConsentStore((state) => state.isBannerVisible);
  const openConsentPreferences = useCookieConsentStore(
    (state) => state.openConsentPreferences,
  );

  return (
    <button
      type="button"
      onClick={openConsentPreferences}
      className={`fixed left-4 z-40 rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-700 shadow transition hover:bg-slate-100 ${
        isBannerVisible ? "bottom-28" : "bottom-4"
      }`}
    >
      Gerer mes cookies
    </button>
  );
}

export function CookieConsentLayer() {
  const initializeConsent = useCookieConsentStore((state) => state.initializeConsent);
  const isBannerVisible = useCookieConsentStore((state) => state.isBannerVisible);

  useEffect(() => {
    const cleanupConsent = initializeConsent();
    const cleanupBootstraps = initializeConsentGatedBootstraps();
    return () => {
      cleanupConsent();
      cleanupBootstraps();
    };
  }, [initializeConsent]);

  return (
    <>
      <ManageCookiesButton />
      {isBannerVisible && <CookieBanner />}
      <CookiePreferencesModal />
    </>
  );
}
