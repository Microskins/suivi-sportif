import { openConsentPreferences } from "../../stores/cookie-consent-store";
import { getConsentPolicyVersion } from "../../consent/consent-manager";

export function CookiePolicyPage() {
  return (
    <main className="site-sport-grid min-h-screen px-6 py-10 text-[#2b241e]">
      <section className="panel mx-auto max-w-3xl p-6 sm:p-9">
        <a href="/suivi-sportif" className="text-sm font-semibold text-[#e85f3c] underline decoration-[#ffb648] decoration-2 underline-offset-4">
          Retour à l&apos;application
        </a>
        <h1 className="site-display mt-5 text-3xl font-bold">Politique de cookies</h1>
        <p className="mt-2 text-sm text-[#9c8f83]">
          Version de la politique : {getConsentPolicyVersion()}
        </p>

        <p className="mt-5 rounded-[16px] bg-[#fdf6ef] p-4 text-sm leading-6 text-[#665b51]">
          Cette page explique les catégories de cookies utilisées par Suivi Sportif,
          leur finalité, leur durée et la façon de retirer ton consentement.
        </p>

        <h2 className="site-display mt-7 text-xl font-bold">1. Cookies nécessaires</h2>
        <p className="mt-2 text-sm leading-6 text-[#665b51]">
          Ces cookies sont indispensables au fonctionnement du service
          (authentification, sécurité, préférences techniques). Ils ne peuvent pas
          être désactivés depuis le panneau de consentement.
        </p>

        <h2 className="site-display mt-7 text-xl font-bold">2. Cookies analytics</h2>
        <p className="mt-2 text-sm leading-6 text-[#665b51]">
          Ces cookies servent à mesurer l&apos;usage de l&apos;application pour améliorer
          l&apos;expérience. Ils restent désactivés tant que tu n&apos;as pas donné ton accord.
        </p>

        <h2 className="site-display mt-7 text-xl font-bold">3. Cookies marketing</h2>
        <p className="mt-2 text-sm leading-6 text-[#665b51]">
          Ces cookies permettent la personnalisation marketing et la mesure de campagne.
          Ils restent désactivés tant que tu n&apos;as pas donné ton accord.
        </p>

        <h2 className="site-display mt-7 text-xl font-bold">4. Durée de conservation</h2>
        <p className="mt-2 text-sm leading-6 text-[#665b51]">
          Ton choix de consentement est conservé en local sur ton navigateur jusqu&apos;à
          changement de politique ou suppression des données du navigateur. Si la
          version de politique change, l&apos;ancien consentement est invalide et le
          panneau est de nouveau affiché.
        </p>

        <h2 className="site-display mt-7 text-xl font-bold">5. Retrait du consentement</h2>
        <p className="mt-2 text-sm leading-6 text-[#665b51]">
          Tu peux modifier ton choix à tout moment via le bouton
          &nbsp;« Gérer mes cookies » disponible dans l&apos;application.
        </p>

        <button
          type="button"
          onClick={() => openConsentPreferences()}
          className="sport-primary-button mt-8"
        >
          Ouvrir les préférences cookies
        </button>
      </section>
    </main>
  );
}
