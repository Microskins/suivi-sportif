// Regles de confidentialite du site Voyage, exigees par Google pour l'ecran
// de consentement OAuth de l'import Google Photos (admin).
import type { ReactNode } from "react";
import { VoyageBrand } from "./voyage-brand";

export const PRIVACY_UPDATED = "2 novembre 2026";
const CONTACT = "thomas.cochart@outlook.fr";

function Section({ title, children }: { children: ReactNode; title: string }) {
  return (
    <section className="border-t border-[#dfe4ea] pt-6">
      <h2 className="site-display text-xl font-semibold tracking-[-0.02em]">
        {title}
      </h2>
      <div className="mt-3 grid gap-3 text-[0.95rem] leading-7 text-[#0f1b2b]">
        {children}
      </div>
    </section>
  );
}

export function PrivacySite() {
  return (
    <main
      id="contenu-principal"
      tabIndex={-1}
      className="flex min-h-screen flex-col bg-[#f4f6f8] text-[#0f1b2b]"
    >
      <header className="bg-[#0f1b2b] text-white">
        <div className="mx-auto flex max-w-[78rem] items-center justify-between gap-6 px-5 py-5 sm:px-9 lg:px-14">
          <a href="/voyage" aria-label="Retour aux voyages">
            <VoyageBrand />
          </a>
        </div>
      </header>

      <article className="mx-auto w-full max-w-3xl flex-1 px-5 py-10 sm:px-9">
        <p className="site-label text-xs font-semibold uppercase tracking-[0.17em] text-[#1c4ed8]">
          Mise à jour : {PRIVACY_UPDATED}
        </p>
        <h1 className="site-display mt-3 text-[clamp(2.2rem,5vw,3.4rem)] font-semibold leading-[0.95] tracking-[-0.05em]">
          Règles de confidentialité
        </h1>
        <p className="mt-5 text-[0.95rem] leading-7 text-[var(--site-muted)]">
          Ces règles s’appliquent au site suivi-sportif.fr, et en particulier au
          site Voyage (carnets de voyage publics et leur espace
          d’administration). Le site est un projet personnel édité par Thomas
          Cochart, joignable à{" "}
          <a
            className="text-[#1c4ed8] underline underline-offset-2"
            href={`mailto:${CONTACT}`}
          >
            {CONTACT}
          </a>
          .
        </p>

        <div className="mt-8 grid gap-8">
          <Section title="1. Visiteurs des carnets">
            <p>
              La consultation des carnets publics ne demande aucun compte. Le
              site ne dépose aucun cookie publicitaire et ne revend aucune
              donnée. Le serveur conserve des journaux techniques (adresse IP,
              page demandée, date) pour la sécurité et le diagnostic, pendant
              une durée limitée.
            </p>
          </Section>

          <Section title="2. Comptes de l’application">
            <p>
              La création d’un compte enregistre une adresse e-mail, un nom et
              un mot de passe chiffré (bcrypt). Ces données servent uniquement à
              l’authentification et ne sont jamais transmises à des tiers.
            </p>
          </Section>

          <Section title="3. Données Google (import Google Photos)">
            <p>
              L’espace d’administration du site Voyage, réservé à son
              propriétaire, permet d’importer des photos depuis Google Photos
              grâce à l’API Google Photos Picker. Voici exactement ce qui se
              passe :
            </p>
            <ul className="grid list-disc gap-2 pl-5">
              <li>
                <strong>Données consultées</strong> : uniquement les photos que
                l’utilisateur choisit lui-même dans la fenêtre de sélection de
                Google Photos (portée{" "}
                <code className="site-label text-sm">
                  photospicker.mediaitems.readonly
                </code>
                , lecture seule). Le site n’a accès ni au reste de la
                bibliothèque, ni aux albums, ni au profil Google.
              </li>
              <li>
                <strong>Utilisation</strong> : chaque photo choisie est copiée
                sur le serveur du site (redimensionnée à 2560 px) pour illustrer
                une étape de carnet de voyage. Elle est publiée avec le carnet
                si celui-ci est rendu public.
              </li>
              <li>
                <strong>Jeton d’accès</strong> : le jeton OAuth fourni par
                Google reste en mémoire du navigateur et n’est transmis au
                serveur que le temps de l’import. Il n’est jamais enregistré en
                base ni dans les journaux, et expire de lui-même après une
                heure.
              </li>
              <li>
                <strong>Partage</strong> : les données Google ne sont ni
                vendues, ni partagées avec des tiers, ni utilisées à des fins
                publicitaires, ni utilisées pour entraîner des modèles
                d’intelligence artificielle.
              </li>
              <li>
                <strong>Conservation et suppression</strong> : une photo
                importée est conservée jusqu’à sa suppression depuis l’espace
                d’administration (ou la suppression de l’étape ou du voyage),
                qui efface aussitôt le fichier du serveur. L’accès accordé peut
                être retiré à tout moment depuis{" "}
                <a
                  className="text-[#1c4ed8] underline underline-offset-2"
                  href="https://myaccount.google.com/permissions"
                >
                  la page des autorisations du compte Google
                </a>
                .
              </li>
            </ul>
            <p>
              L’utilisation et le transfert vers toute autre application des
              informations reçues des API Google respectent les{" "}
              <a
                className="text-[#1c4ed8] underline underline-offset-2"
                href="https://developers.google.com/terms/api-services-user-data-policy"
              >
                règles relatives aux données utilisateur des services API Google
              </a>
              , y compris les exigences d’utilisation limitée (Limited Use).
            </p>
          </Section>

          <Section title="4. Hébergement et sécurité">
            <p>
              Le site et ses données sont hébergés sur un serveur en France. Les
              échanges sont chiffrés (HTTPS) et l’espace d’administration est
              réservé aux comptes autorisés.
            </p>
          </Section>

          <Section title="5. Vos droits">
            <p>
              Conformément au RGPD, vous pouvez demander l’accès, la
              rectification ou la suppression de vos données en écrivant à{" "}
              <a
                className="text-[#1c4ed8] underline underline-offset-2"
                href={`mailto:${CONTACT}`}
              >
                {CONTACT}
              </a>
              . Vous pouvez aussi saisir la CNIL (cnil.fr).
            </p>
          </Section>
        </div>
      </article>

      <footer className="border-t border-[#dfe4ea] bg-white">
        <div className="site-label mx-auto flex max-w-[78rem] flex-col gap-2 px-5 py-5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-[var(--site-muted)] sm:flex-row sm:justify-between sm:px-9 lg:px-14">
          <p>Voyage — Thomas Cochart</p>
          <a href="/voyage" className="hover:underline">
            Retour aux voyages
          </a>
        </div>
      </footer>
    </main>
  );
}
