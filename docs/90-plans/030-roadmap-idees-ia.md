# Plan - Roadmap idees IA

## Objectif

- Transformer les idees IA dispersees en une roadmap lisible et actionnable.
- Prioriser les chantiers qui apportent le plus de valeur au suivi sportif sans casser l'architecture actuelle.
- Servir de plan pivot pour choisir les prochains chantiers, tout en gardant chaque implementation dans son propre plan dedie.

## Decisions

- Organiser les idees en vagues plutot qu'en backlog plat.
- Garder ce plan comme document de cadrage: il ne remplace pas les plans d'implementation.
- Prioriser d'abord les boucles de feedback utilisateur: objectifs, progression, graphiques, interpretation.
- Traiter la qualite, la securite et le mobile comme des socles a enclencher avant d'elargir fortement l'usage.
- Sortir chaque grosse idee dans un plan specifique avant implementation.
- Avancer vague par vague: une vague doit etre planifiee, implementee et validee avant d'ouvrir la suivante.

## Vague 1 - Feedback immediat et motivation

- Graphiques de progression corporelle:
  - courbe poids;
  - IMC;
  - masse grasse;
  - mensurations principales;
  - variation 30j / 90j / 1 an.
- Interpretation des indicateurs corporels:
  - zones IMC;
  - fourchettes de masse grasse;
  - estimation maintien / deficit / surplus.
- Objectifs: alertes et projections:
  - alerte avant echeance;
  - projection de tendance;
  - avertissement si le rythme est trop rapide ou trop lent.
- Calendrier: score de regularite hebdomadaire:
  - seances realisees / cible;
  - jauge semaine courante;
  - lecture planifie vs realise.

## Vague 2 - Progression sportive intelligente

- Objectifs par exercice et regles de progression:
  - objectif 3x8, 1RM, 10RM, max reps;
  - plage de reps;
  - regle de progression automatique.
- RPE / RIR et sensations:
  - effort percu par serie ou exercice;
  - notes courtes sur energie, douleur, fatigue;
  - analyse charge vs ressenti.
- Modeles de seances enrichis:
  - etiquettes force / hypertrophie / cardio / reprise;
  - duree courte / moyenne / longue;
  - materiel requis;
  - recherche et filtres dans le choix du modele.
- Historique des revisions de modeles:
  - date;
  - resume des changements;
  - auteur quand les roles existent.

## Vague 3 - Nutrition et saisie rapide

- Scanner code-barres:
  - recherche aliment par code-barres;
  - favoris;
  - aliments frequents;
  - integration mobile en priorite.
- Builder repas:
  - duplication de repas;
  - repas favoris;
  - portions frequentes;
  - recap rapide calories/macros.
- Suggestions nutritionnelles simples:
  - comparer apports aux objectifs actifs;
  - proposer ajustement proteines/glucides/lipides;
  - rester explicatif, pas medical.

## Vague 4 - Qualite, confiance et securite

- Audit accessibilite et parcours critiques:
  - navigation clavier;
  - focus visible;
  - contrastes;
  - etats vides / chargement / erreurs;
  - captures desktop/mobile.
- Controle qualite des images d'exercices:
  - manifeste de validation;
  - statut de revue humaine;
  - notes de rejet/regeneration;
  - verification presence des assets.
- Securite compte:
  - confirmation du mot de passe actuel avant changement sensible;
  - verification du nouvel email;
  - journal minimal des changements de securite.
- Conformite cookies:
  - version de politique;
  - invalidation automatique d'un ancien consentement;
  - journal des changements.

## Vague 5 - Mobile, ops et industrialisation

- Checklist pre-release Capacitor:
  - offline assets;
  - ecran d'erreur reseau;
  - stockage token adapte mobile;
  - base URL API par environnement;
  - verification HTTPS/CORS.
- Verification des idees et plans:
  - detecter doublons numeriques;
  - detecter liens morts;
  - verifier qu'une idee transformee en plan est referencee.
- Observabilite minimale:
  - erreurs API lisibles;
  - journal des echecs critiques;
  - checks deploy/health plus explicites.

## Ordre conseille

1. Graphiques corporels et objectifs: plus gros gain utilisateur immediat.
2. Progression sportive par exercice + RPE/RIR: donne du sens aux entrainements.
3. Audit UI/accessibilite: stabilise avant mobile.
4. Scanner nutrition + builder repas: gros gain UX, mais plus dependant du mobile.
5. Checklist mobile et securite compte: a faire avant usage public plus large.

## Mode d'execution vague par vague

- Chaque vague a son plan d'execution dedie (`031`, `032`, etc.).
- Une vague peut contenir plusieurs sous-chantiers, mais elle garde un objectif utilisateur coherent.
- Les sous-chantiers techniques restent scopes: API, frontend, tests et docs doivent etre valides avant de passer a la vague suivante.
- Une vague est terminee quand:
  - les features principales sont livrees;
  - les tests/typechecks pertinents ont ete lances ou les blocages documentes;
  - les docs sources de verite sont a jour;
  - les idees restantes ont ete replanifiees ou explicitement repoussees.

## Plans d'execution

- [Vague 1 feedback et motivation](./031-vague-1-feedback-motivation.md)
- [Vague 2 progression sportive](./032-vague-2-progression-sportive.md)
- [Vague 3 nutrition et saisie rapide](./033-vague-3-nutrition-saisie-rapide.md)
- [Vague 4 qualite, confiance et securite](./034-vague-4-qualite-confiance-securite.md)
- [Vague 5 mobile, ops et industrialisation](./035-vague-5-mobile-ops-industrialisation.md)

## Todo

- [x] Creer ce plan.
- [x] Relire les idees IA existantes.
- [x] Regrouper les idees par vagues.
- [x] Ajouter ce plan a l'index.
- [x] Ajouter une idee IA complementaire liee a la gouvernance roadmap.
- [x] Choisir le premier chantier a extraire de cette roadmap.

## Notes de verification

- 2026-06-01: plan cree depuis `docs/06-idees/90-ia-idees.md`, les plans existants et les docs d'architecture.
- 2026-06-01: la roadmap reste un cadrage; chaque implementation devra avoir son plan dedie.
- 2026-06-01: decision utilisateur confirmee: execution vague par vague, en commencant par la Vague 1.
