import { useEffect, useMemo, useState } from "react";
import { initializeConsentGatedBootstraps } from "../../consent/tracker-bootstrap";
import { useCookieConsentStore } from "../../stores/cookie-consent-store";

const COOKIE_POLICY_PATH = "/suivi-sportif/politique-cookies";

function CookieBanner() {
  const acceptAll = useCookieConsentStore((state) => state.acceptAll);
  const rejectAll = useCookieConsentStore((state) => state.rejectAll);
  const openConsentPreferences = useCookieConsentStore(
    (state) => state.openConsentPreferences,
  );

  return (
    <section className="fixed inset-x-0 bottom-0 z-50 border-t border-[#f0e3d6] bg-white/95 p-4 shadow-[0_-10px_35px_rgba(43,36,30,0.08)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="max-w-3xl">
          <h2 className="site-display text-base font-bold text-[#2b241e]">Gestion des cookies</h2>
          <p className="mt-1 text-sm text-[#665b51]">
            Nous utilisons uniquement les cookies nécessaires par défaut. Tu peux accepter
            ou refuser les catégories optionnelles, puis modifier ton choix à tout moment.
          </p>
          <a
            href={COOKIE_POLICY_PATH}
            className="mt-2 inline-block text-sm font-semibold text-[var(--site-accent-text)] underline decoration-[#ffb648] underline-offset-4"
          >
            Consulter la politique cookies
          </a>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={rejectAll}
            className="sport-secondary-button"
          >
            Tout refuser
          </button>
          <button
            type="button"
            onClick={openConsentPreferences}
            className="sport-secondary-button"
          >
            Personnaliser
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="sport-primary-button"
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2b241e]/45 p-4 backdrop-blur-sm">
      <section className="panel w-full max-w-xl p-6 shadow-[0_20px_60px_rgba(43,36,30,0.2)]">
        <h2 className="site-display text-xl font-bold text-[#2b241e]">Préférences cookies</h2>
        <p className="mt-2 text-sm text-[#665b51]">
          Choisis les catégories que tu autorises. Les cookies nécessaires restent
          actifs pour le fonctionnement de l&apos;application.
        </p>
        <a
          href={COOKIE_POLICY_PATH}
          className="mt-2 inline-block text-sm font-semibold text-[var(--site-accent-text)] underline decoration-[#ffb648] underline-offset-4"
        >
          Lire la politique cookies
        </a>

        <div className="mt-4 space-y-3">
          <label className="flex items-center justify-between rounded-[14px] bg-[#fdf6ef] p-3">
            <span>
              <span className="block text-sm font-medium text-[#2b241e]">Nécessaires</span>
              <span className="block text-xs text-[var(--site-muted)]">
                Authentification, sécurité et fonctionnement principal.
              </span>
            </span>
            <input type="checkbox" checked disabled className="h-4 w-4 accent-[#ff7a54]" />
          </label>

          <label className="flex items-center justify-between rounded-[14px] bg-[#fdf6ef] p-3">
            <span>
              <span className="block text-sm font-medium text-[#2b241e]">Analytics</span>
              <span className="block text-xs text-[var(--site-muted)]">
                Mesure d&apos;usage anonyme pour améliorer le produit.
              </span>
            </span>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
              className="h-4 w-4 accent-[#ff7a54]"
            />
          </label>

          <label className="flex items-center justify-between rounded-[14px] bg-[#fdf6ef] p-3">
            <span>
              <span className="block text-sm font-medium text-[#2b241e]">Marketing</span>
              <span className="block text-xs text-[var(--site-muted)]">
                Personalisation publicitaire et campagnes externes.
              </span>
            </span>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
              className="h-4 w-4 accent-[#ff7a54]"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={closeConsentPreferences}
            className="sport-secondary-button"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={rejectAll}
            className="sport-secondary-button"
          >
            Tout refuser
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className="sport-secondary-button"
          >
            Tout accepter
          </button>
          <button
            type="button"
            onClick={() => savePreferences({ analytics, marketing })}
            className="sport-primary-button"
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
      className={`fixed left-4 z-40 rounded-full border border-[#f0e3d6] bg-white px-4 py-2 text-xs font-semibold text-[var(--site-muted)] shadow transition hover:border-[#ffb899] hover:text-[var(--site-accent-text)] ${
        isBannerVisible ? "bottom-28" : "bottom-4"
      }`}
    >
      Gérer mes cookies
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
