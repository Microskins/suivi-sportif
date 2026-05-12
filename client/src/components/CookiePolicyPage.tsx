import { openConsentPreferences } from "../stores/cookieConsentStore";
import { getConsentPolicyVersion } from "../consent/consentManager";

export function CookiePolicyPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-6 py-10 text-slate-900">
      <section className="mx-auto max-w-3xl rounded border border-slate-300 bg-white p-6 shadow-sm">
        <a href="/" className="text-sm font-medium text-slate-900 underline">
          Retour a l'application
        </a>
        <h1 className="mt-4 text-2xl font-bold">Politique de cookies</h1>
        <p className="mt-2 text-sm text-slate-600">
          Version de politique: {getConsentPolicyVersion()}
        </p>

        <p className="mt-4 text-sm text-slate-700">
          Cette page explique les categories de cookies utilisees par Suivi Sportif,
          leur finalite, leur duree et la facon de retirer ton consentement.
        </p>

        <h2 className="mt-6 text-lg font-semibold">1. Cookies necessaires</h2>
        <p className="mt-2 text-sm text-slate-700">
          Ces cookies sont indispensables au fonctionnement du service
          (authentification, securite, preferences techniques). Ils ne peuvent pas
          etre desactives depuis le panneau de consentement.
        </p>

        <h2 className="mt-6 text-lg font-semibold">2. Cookies analytics</h2>
        <p className="mt-2 text-sm text-slate-700">
          Ces cookies servent a mesurer l'usage de l'application pour ameliorer
          l'experience. Ils restent desactives tant que tu n'as pas donne ton accord.
        </p>

        <h2 className="mt-6 text-lg font-semibold">3. Cookies marketing</h2>
        <p className="mt-2 text-sm text-slate-700">
          Ces cookies permettent la personnalisation marketing et la mesure de campagne.
          Ils restent desactives tant que tu n'as pas donne ton accord.
        </p>

        <h2 className="mt-6 text-lg font-semibold">4. Duree de conservation</h2>
        <p className="mt-2 text-sm text-slate-700">
          Ton choix de consentement est conserve en local sur ton navigateur jusqu'a
          changement de politique ou suppression des donnees du navigateur.
        </p>

        <h2 className="mt-6 text-lg font-semibold">5. Retrait du consentement</h2>
        <p className="mt-2 text-sm text-slate-700">
          Tu peux modifier ton choix a tout moment via le bouton
          &nbsp;"Gerer mes cookies" disponible dans l'application.
        </p>

        <button
          type="button"
          onClick={() => openConsentPreferences()}
          className="mt-8 rounded bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
        >
          Ouvrir les preferences cookies
        </button>
      </section>
    </main>
  );
}
