# Checklist UI et accessibilite

Cette checklist couvre les **cinq sites** du depot, pas seulement Suivi
Sportif. Les quatre sites publics (portfolio, trekking, voyage,
prix-aliments) fonctionnent sur donnees locales: ils se verifient sans base
de donnees, contrairement au tableau de bord.

## Parcours critiques

### Suivi Sportif (necessite la base)

- Connexion et inscription.
- Dashboard de synthese.
- Creation, modification et duplication de seance.
- Creation de repas et duplication de repas.
- Mensurations et objectifs sport/corps.
- Profil utilisateur.

### Sites publics (verifiables sans base)

- Portfolio: accueil et liens vers les quatre projets.
- Trekking: accueil et carnet Vosges.
- Voyage: accueil et carnet Islande.
- Prix Frais: recherche, comparaison, ticket partageable et vue impression.

## Accessibilite: seuils a tenir

- Texte courant: contraste minimum **4,5:1** (WCAG 2.1 AA, 1.4.3).
- Texte large (>= 24 px, ou >= 18,7 px en gras): **3:1**.
- Indicateur de focus et elements d'interface: **3:1** (1.4.11).
- Controle automatise des tokens de couleur: `npm run check:contrast`.
  Il ne remplace pas une mesure dans le navigateur, qui seule voit les
  couleurs reellement appliquees, mais il attrape la regression a la source.

Ne pas ecrire de couleur en dur dans un composant: passer par les tokens
`var(--site-*)`. Le plan 075 a montre que 96 valeurs recopiees en dur
neutralisaient la correction faite sur les tokens.

## Controle clavier

- Chaque action visible est atteignable au clavier.
- L'ordre de tabulation suit la lecture visuelle, sans `tabindex` positif.
- Le lien d'evitement est le premier element focusable et deplace bien le
  focus sur `#contenu-principal` (la cible doit garder son `tabindex="-1"`).
- L'indicateur de focus reste visible sur toutes les surfaces du site.
- Les modales gardent un bouton d'annulation et une action principale visibles.
- Les champs requis utilisent `required` ou une validation explicite.

## Restitution par un lecteur d'ecran

- Un titre coupe par `<br />` doit garder un espace explicite (`{" "}`),
  sinon JSX colle les deux fragments dans le nom accessible.
- Un element purement decoratif porte `aria-hidden="true"` plutot que d'etre
  force a respecter le contraste.
- Chaque page declare `lang="fr"` et une hierarchie de titres continue.

## Etats et feedback

- Les erreurs API apparaissent pres du parcours concerne.
- Les etats vides indiquent l'action attendue.
- Les actions de sauvegarde affichent un etat de chargement.
- Les suppressions passent par une confirmation.

## Lisibilite

- Les textes longs peuvent passer a la ligne sans deborder.
- Les boutons restent lisibles sur mobile.
- Les jauges gardent une valeur textuelle a proximite.
- Les cartes compactes n'utilisent pas de texte hero-scale.

## Donnees sensibles

- Les changements d'email ou de mot de passe demandent le mot de passe actuel.
- Aucun hash, secret ou variable d'environnement ne remonte au frontend.
- Les consentements cookies obsoletes sont invalides.

## Notes Vague 4

- Le parcours Profil demande maintenant le mot de passe actuel pour email et
  mot de passe.
- Le parcours Repas affiche un recap macros avant validation et une comparaison
  aux objectifs.
- Le parcours Objectifs sport affiche des recommandations comme aides, pas
  comme consignes obligatoires.

## Etat au 2026-08-19 (plan 075)

Premier audit d'accessibilite reellement mene sur les cinq sites.

| Point | Etat |
| --- | --- |
| Contraste des textes | conforme AA sur les cinq sites, mesure dans le navigateur |
| Indicateur de focus | conforme 3:1 sur les cinq sites |
| Lien d'evitement | present sur les cinq sites |
| Nom accessible des titres | corrige sur les cinq sites |
| `lang`, hierarchie des titres, etiquettes de champs | deja conformes avant l'audit |

Deux limites connues:

- Le tableau de bord de Suivi Sportif n'a pas pu etre parcouru, la base
  PostgreSQL n'ayant pas pu etre demarree. Ses couleurs sont passees aux
  tokens conformes, mais le parcours lui-meme reste a verifier.
- L'activation du lien d'evitement par la touche Entree n'a pas pu etre
  reproduite avec des evenements synthetiques; elle a ete validee par un
  clic. A confirmer par un test humain.
