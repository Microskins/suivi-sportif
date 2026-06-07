# IA Idees

## 2026-06-07 - Builders: decouper les restes en micro-chantiers

## Contexte

- Les idees builder de seances et de repas melangent des fondations deja livrees avec des prolongements encore ouverts.
- Les garder comme gros blocs rend la priorisation moins lisible.

## Proposition

- Transformer plus tard les restes en micro-chantiers separes:
  - tutoriels exercices;
  - repos conseilles automatiques;
  - blocs echauffement / Tabata;
  - drag-and-drop depuis bibliotheque;
  - modeles ou favoris de repas;
  - source externe code-barres.

## Impact

- Chantiers plus petits et plus faciles a valider.
- Moins de risque de melanger UX, data et integration externe.

## Complexite

- S

## Liens

- Plan: docs/90-plans/097-tri-idees-builder.md

---

## 2026-06-03 - Technique: cartographie des hotspots de maintenance

## Contexte

- Le bilan du projet montre des zones tres denses, en particulier le dashboard frontend et les gros fichiers de tests API.
- Avant de lancer des refactors, il est utile de savoir ou se concentre le cout de maintenance.

## Proposition

- Ajouter plus tard une cartographie simple des hotspots techniques:
  - taille des fichiers;
  - nombre de responsabilites par module;
  - zones les plus couteuses a tester;
  - points de couplage visibles dans les routes et stores.

## Impact

- Aide a choisir les refactors qui rapportent vraiment.
- Rend les futures decisions techniques moins intuitives.
## 2026-06-03 - Securite auth: durcissement session et CORS

## Contexte

- Le point securite du projet a mis en evidence un secret JWT de secours trop faible, un CORS tres permissif et un token conserve cote navigateur.
- Le chantier `096-durcissement-securite-auth-session-cors` va corriger les risques immediats, mais il reste des ameliorations adjacentes utiles a tracer.

## Proposition

- Ajouter plus tard un durcissement CSP cible autour de `connect-src`, `frame-ancestors` et des scripts tiers pour reduire l'impact d'un eventuel XSS.
- Prevoir un rate limiting progressif et un backoff sur les routes `login` et `register` pour limiter brute force et enumeration.
- Valider au demarrage les variables d'environnement critiques (`JWT_SECRET`, allowlist CORS, URL API) avec un message explicite si elles sont absentes.
- Si le projet migre vers des cookies `HttpOnly` ou des refresh tokens, anticiper une politique de rotation/revocation et un suivi des sessions actives.
- Ajouter une telemetrie minimale des echecs d'authentification et des refus CORS pour diagnostiquer les incidents de prod.

## Impact

- Reduit la surface d'attaque autour de l'authentification et de la navigation cross-origin.
- Rend les incidents de securite plus faciles a diagnostiquer sans ouvrir un observabilite trop lourde.

## Complexite

- M

## Liens

- Plan: docs/90-plans/036-angle-technique-dette-maintenance.md

---

## 2026-06-03 - UX: parcours critiques et baselines de rendu

## Contexte

- Le frontend couvre deja beaucoup de cas, mais plusieurs ecrans importants restent tres denses.
- Sans repere de rendu ou de parcours critique, les ajustements UX se prennent facilement au feeling.

## Proposition

- Ajouter plus tard un petit kit de baselines UX:
  - liste des parcours critiques a verifier;
  - captures de reference desktop/mobile;
  - checklist pour navigation, filtres, chargements et erreurs;
  - etats vides et variations de densite.

## Impact

- Permet de voir les regressions plus vite.
- Ameliore la coherence des futures retouches UI.

## Complexite

- M

## Liens

- Plan: docs/90-plans/037-angle-produit-ux-parcours-critiques.md

---

## 2026-06-03 - Pilotage: score de priorisation des chantiers

## Contexte

- Le portefeuille de chantiers est deja large et melange produit, ops, UX et dette technique.
- Un score pour les chantiers eux-memes serait complementaire au score des idees.

## Proposition

- Ajouter plus tard une grille de priorisation legere pour les chantiers:
  - impact utilisateur;
  - effort;
  - risque;
  - dependances;
  - evidence attendue apres livraison.

## Impact

- Facilite l'arbitrage entre plusieurs sujets concurrents.
- Aide a garder une feuille de route lisible sans ajouter de lourdeur.

## Complexite

- S

## Liens

- Plan: docs/90-plans/038-angle-priorisation-chantiers-impact.md

---

## 2026-06-03 - Pilotage: revue courte des plans ouverts

## Contexte

- La priorisation marche mieux si les plans ouverts ont un statut fiable.
- Plusieurs plans peuvent etre presque termines mais rester ouverts faute de verification ou de nettoyage de todo.

## Proposition

- Ajouter plus tard une revue courte des plans ouverts:
  - lister les plans avec todos non coches;
  - separer "travail restant" et "verification bloquee";
  - noter une decision: fermer, reprendre, reporter, fusionner;
  - garder une trace de la date de revue.

## Impact

- Reduit le bruit dans la roadmap.
- Evite de relancer un chantier deja quasi termine.

## Complexite

- S

## Liens

- Plan: docs/90-plans/038-angle-priorisation-chantiers-impact.md

---
- Plan: docs/90-plans/096-durcissement-securite-auth-session-cors.md

## 2026-06-03 - Identite app: theme PWA par contexte

## Contexte

- Le plan `091-assets-identite-app` ajoute les premiers assets d'identite et les metadonnees HTML.
- L'application a plusieurs contextes visuels utiles: sport, nutrition, mensurations, calendrier.

## Proposition

- Ajouter plus tard une strategie de theme PWA plus fine:
  - couleur `theme-color` adaptee au mode clair/sombre;
  - icone de masque verifiee sur Android/iOS;
  - image sociale dediee aux pages publiques si elles apparaissent;
  - checklist de rendu favicon sur desktop, mobile et onglets epingles.

## Impact

- Meilleure finition percue sur mobile et dans les partages.
- Moins de regressions visuelles quand l'application devient installable.

## Complexite

- S

## Liens

- Plan: docs/90-plans/091-assets-identite-app.md

---

## 2026-06-01 - Roadmap: score de priorisation des idees

## Contexte

- Le plan `030-roadmap-idees-ia` regroupe beaucoup d'idees utiles.
- Sans score de priorisation, les prochaines decisions peuvent redevenir subjectives.

## Proposition

- Ajouter un score simple pour chaque idee candidate:
  - Impact utilisateur;
  - Effort;
  - Risque technique;
  - Dependances;
  - Preuve attendue apres livraison.
- Utiliser ce score avant d'extraire une idee en plan d'implementation.

## Impact

- Choix de chantier plus clair.
- Moins de dispersion entre features visibles, qualite et dette technique.

## Complexite

- S

## Liens

- Plan: docs/90-plans/030-roadmap-idees-ia.md

---

## 2026-06-01 - Objectifs: alertes et projections

## Contexte

- Le chantier objectifs sport/corps ajoute une cible numerique et un suivi de progression.
- La prochaine valeur viendra de rappels et d'une lecture predictive.

## Proposition

- Ajouter plus tard:
  - des alertes quand un objectif approche de son echeance;
  - une projection simple de tendance a partir des dernieres mesures;
  - des recommandations d'ajustement si l'objectif parait trop rapide ou trop lent.

## Impact

- Rend les objectifs plus actionnables.
- Aide a eviter les objectifs corporels irrealisables ou mal calibres.

## Complexite

- M

## Liens

- Plan: docs/90-plans/029-objectifs-sport-corps.md

---

## 1) Modeles: templates de seances

## Contexte

- Beaucoup de seances reviennent (full body, push/pull/legs, etc.).
- Recomposer les memes blocs prend du temps.

## Proposition

- Ajouter des "templates" de seances:
  - creer un template depuis une seance existante;
  - instancier un template en seance planifiee (ou en brouillon).
- Option: versionner un template (v1, v2) et garder l'historique.

## Impact

- Gain de temps important sur la creation.
- Standardisation de la structure.

## Complexite

- M

## Liens

- Plan: docs/90-plans/XXX-... (quand ce sera actee)

---

## 2026-05-11 - Mobile: Capacitor checklist pre-release

## Contexte

- Une app mobile "wrappee" peut marcher en dev mais casser a la publication (signing, deep links, storage, network).

## Proposition

- Ajouter une checklist pre-release mobile:
  - mode offline (assets embarques) + ecran d'erreur reseau;
  - token storage (Preferences/secure storage) + expiration;
  - base URL API selon env + blocage du "localhost" en prod;
  - verification HTTPS (mixed content) + config CORS;
  - analytics/logging minimal pour diagnostiquer en prod.

## Impact

- Moins de surprises au moment de la publication.
- Diagnostic plus rapide quand un device reel a un comportement different.

## Complexite

- S

## Liens

- Plan: docs/90-plans/089-mobile-capacitor.md

---

## 2026-05-11 - Docs: controle des doublons d'idees

## Contexte

- Les idees sont numerotees par fichier.
- Un doublon de numero peut cacher des propositions non indexees ou dispersees.

## Proposition

- Ajouter une verification simple de documentation qui signale:
  - deux fichiers avec le meme prefixe numerique dans `docs/06-idees`;
  - un fichier d'idee absent de l'index;
  - un lien d'index vers un fichier inexistant.

## Impact

- Moins de perte d'idees.
- Nettoyage plus rapide avant de transformer une idee en chantier.

## Complexite

- S

## Liens

- Plan: docs/90-plans/014-fusion-idees-seances.md

---

## 2) Progression: PRs et objectifs par exercice

## Contexte

- La progression (poids/reps) est le coeur du suivi.
- Sans objectif, on ne sait pas si une seance est "bonne" ou "mauvaise".

## Proposition

- Par exercice, definir:
  - un objectif (ex: 3x8 a 80kg) et/ou une plage (ex: 6-10 reps);
  - une regle de progression (double progression, +2.5kg, etc.).
- Afficher un indicateur simple dans la seance (atteint / en dessous / au dessus).

## Impact

- Donne du sens aux donnees.
- Encourage la constance.

## Complexite

- L

## Liens

- Plan: docs/90-plans/XXX-... (quand ce sera actee)

---

## 3) Qualite: RPE / RIR et sensations

## Contexte

- Deux seances identiques sur le papier peuvent etre tres differentes en fatigue.

## Proposition

- Ajouter a la serie ou a l'exercice:
  - RPE (1-10) ou RIR (0-5);
  - note libre courte ("douleur epaule", "bonne energie").
- Exploiter ca dans les stats (ex: charge vs RPE).

## Impact

- Suivi plus intelligent (fatigue, deload, blessure).

## Complexite

- M

## Liens

- Plan: docs/90-plans/XXX-... (quand ce sera actee)

---

## 4) Nutrition: scanner code-barres (plus tard)

## Contexte

- Ajouter des aliments manuellement est long et repetitif.

## Proposition

- Ajouter un mode "scanner" (mobile) pour rechercher un aliment par code-barres.
- Stocker les aliments frequents et permettre des favoris.

## Impact

- UX nutrition nettement meilleure.

## Complexite

- L

## Liens

- Plan: docs/90-plans/XXX-... (quand ce sera actee)

---

## 2026-05-11 - Modeles: etiquettes et recherche rapide

## Contexte

- Les premiers modeles de seances vont couvrir quelques cas simples.
- Quand la bibliotheque grandira, une liste brute deviendra moins pratique.

## Proposition

- Ajouter des etiquettes aux modeles:
  - objectif principal (force, cardio, hypertrophie, reprise);
  - duree courte / moyenne / longue;
  - materiel requis.
- Ajouter une recherche et des filtres dans la modale de choix de modele.

## Impact

- Selection plus rapide du bon modele.
- Meilleure extensibilite quand on ajoutera plus de seances preconstruites.

## Complexite

- M

## Liens

- Plan: docs/90-plans/015-modeles-seances-defaut.md

---

## 2026-05-12 - Conformite cookies: mode policy-version

## Contexte

- Une CMP frontend peut devenir obsol�te quand la politique legale evolue.
- Sans versionning explicite, le consentement stocke est difficile a invalider proprement.

## Proposition

- Versionner la politique cookies (ex: date ISO) dans l'objet de consentement.
- Re-afficher la banniere automatiquement quand la version change.
- Garder un journal minimal des changements de version dans la doc legale.

## Impact

- Conformite plus robuste dans le temps.
- Moins de risques d'utiliser un ancien consentement sur de nouvelles finalites.

## Complexite

- S

## Liens

- Plan: docs/90-plans/017-cmp-cookies-frontend.md

---

## 2026-05-12 - Calendrier: score de regularite hebdo

## Contexte

- Le calendrier montre les seances, mais la progression de regularite n'est pas explicite.

## Proposition

- Ajouter un score hebdomadaire simple dans la vue calendrier:
  - nombre de seances realisees / objectif cible;
  - jauge visuelle sur la semaine courante.
- Conserver la logique de statut (`PLANNED`, `COMPLETED`, `CANCELED`) comme source de verite.

## Impact

- Feedback motivant immediat sur la constance.
- Facilite la lecture "planifie vs realise" sans ouvrir chaque jour.

## Complexite

- S

## Liens

- Plan: docs/90-plans/018-calendrier-suivi-statut-seances.md

---

## 2026-05-13 - Modeles: historique des revisions

## Contexte

- Une fois les modeles modifiables, il peut etre utile de comprendre qui a change quoi.
- Sans historique, une regression de contenu est difficile a expliquer.

## Proposition

- Ajouter un historique simple des modifications de modele:
  - date de modification;
  - resume des champs modifies;
  - auteur (si role admin introduit plus tard).
- Exposer cet historique en lecture dans l'interface de gestion des modeles.

## Impact

- Meilleure tracabilite sur le contenu des modeles.
- Diagnostic plus rapide en cas de changement non attendu.

## Complexite

- M

## Liens

- Plan: docs/90-plans/020-edition-modeles-seances.md

---

## 2026-05-20 - Exercices: controle qualite des images IA

## Contexte

- La base d'exercices peut contenir beaucoup d'images generees par IA.
- Une image incorrecte, avec texte parasite ou posture dangereuse, peut degrader la confiance utilisateur.

## Proposition

- Ajouter un petit manifeste de validation des images d'exercices:
  - taille et format attendus;
  - presence du fichier reference par JSON/CSV;
  - statut de revue humaine par lot;
  - notes de rejet/regeneration.

## Impact

- Facilite la regeneration ciblee sans reprendre tout le catalogue.
- Rend la qualite pedagogique plus controlable dans le temps.

## Complexite

- S

## Liens

- Plan: docs/90-plans/025-base-exercices-ia-gpt-image-2.md

---

## 2026-05-29 - UI: audit accessibilite et parcours critiques

## Contexte

- Le tour qualite UI corrige les irritants visibles, mais ne remplace pas un audit systematique.
- Les formulaires et tableaux de bord gagnent vite en complexite avec les seances, repas et objectifs.

## Proposition

- Ajouter un audit UI dedie aux parcours critiques:
  - navigation clavier et focus visible;
  - contraste des badges et boutons;
  - etats vides, chargement et erreurs;
  - capture desktop/mobile des vues dashboard, calendrier, seances et exercices.

## Impact

- Meilleure robustesse avant mobile Capacitor.
- Moins de regressions visuelles lors des prochains chantiers frontend.

## Complexite

- M

## Liens

- Plan: docs/90-plans/090-tour-qualite-ui.md

---

## 2026-05-29 - Mensurations: graphiques de progression

## Contexte

- Le chantier mensurations ajoute d'abord la saisie et l'historique.
- La valeur principale viendra ensuite de la visualisation des tendances.

## Proposition

- Ajouter des graphiques dedies aux mesures corporelles:
  - courbe de poids;
  - evolution taille abdominale / hanches / poitrine;
  - variation depuis la premiere mesure et depuis la derniere mesure;
  - indicateurs simples par periode 30j / 90j / 1 an.

## Impact

- Rend les donnees saisies plus utiles et motivantes.
- Permet de suivre la recomposition corporelle au-dela du poids seul.

## Complexite

- M

## Liens

- Plan: docs/90-plans/027-mensurations-corporelles.md

---

## 2026-06-06 - DX: controle automatique des fichiers trop longs

## Contexte

- Le plan dette et maintenance adopte une limite de 500 lignes par fichier maintenu a la main.
- Le split de `Dashboard.tsx` rend la regle atteignable, mais le controle reste manuel.

## Proposition

- Ajouter un script de verification qui liste les fichiers de code ou docs au-dessus de 500 lignes.
- Exclure explicitement les fichiers generes, configs volumineuses et exceptions documentees.
- Brancher ce script dans une commande de qualite locale ou CI quand la liste d'exceptions sera stabilisee.

## Impact

- Evite les regressions discretes vers des fichiers monolithiques.
- Rend la regle plus simple a appliquer sans inspection manuelle.

## Complexite

- S

## Liens

- Plan: docs/90-plans/036-angle-technique-dette-maintenance.md

---

## 2026-05-31 - Profil: securite compte et confirmation email

## Contexte

- Le chantier profil ajoute la modification email, mot de passe et date de naissance.
- Ces changements deviennent plus sensibles si l'application evolue vers un usage public.

## Proposition

- Ajouter plus tard une confirmation de mot de passe actuel avant changement d'email ou de mot de passe.
- Prevoir une verification du nouvel email par lien de confirmation.
- Ajouter un journal minimal des changements de securite du compte.

## Impact

- Reduction du risque de prise de controle apres session ouverte.
- Meilleure tracabilite pour diagnostiquer les changements de compte.

## Complexite

- M

## Liens

- Plan: docs/90-plans/028-onglet-profil.md

---

## 2026-06-07 - Frontend: fractionner le bundle principal

## Contexte

- La fermeture des plans dashboard et assets confirme que le build client passe.
- Vite signale encore un chunk JavaScript principal superieur a 500 kB apres minification.

## Proposition

- Introduire du chargement dynamique sur les zones lourdes du dashboard:
  - graphiques;
  - calendrier;
  - formulaires ou sections rarement ouvertes;
  - vues mobiles futures si Capacitor reutilise le meme bundle.
- Mesurer avant/apres avec le rapport Vite pour eviter un fractionnement artificiel.

## Impact

- Chargement initial plus leger, surtout mobile.
- Meilleure marge pour le futur chantier Capacitor.

## Complexite

- M

## Liens

- Plan: docs/90-plans/007-dashboard-suivi-frontend.md
- Plan: docs/90-plans/091-assets-identite-app.md

---

## 2026-06-07 - Tests frontend: setup Vitest partage pour le nettoyage DOM

## Contexte

- La fermeture du plan duplication calendrier a revele que les tests CMP empilaient plusieurs rendus React dans le DOM jsdom.
- Le correctif local ajoute `cleanup()` dans le fichier concerne, mais cette discipline peut etre centralisee.

## Proposition

- Ajouter un fichier de setup Vitest client qui importe `@testing-library/jest-dom` et lance `cleanup()` automatiquement apres chaque test composant.
- Configurer Vitest pour utiliser ce setup afin de reduire les oublis dans les futurs tests React.

## Impact

- Tests composants plus fiables.
- Moins de bruit lors des validations globales.

## Complexite

- S

## Liens

- Plan: docs/90-plans/024-duplication-seances-calendrier.md
- Plan: docs/90-plans/017-cmp-cookies-frontend.md

---

## 2026-06-03 - UX: filtres persistants et vues rapides pour bibliotheques

## Contexte

- Le chantier de suppression des popups exercices et repas va rendre les catalogues plus visibles et plus centraux.
- Une fois les sections inline en place, les utilisateurs auront interet a retrouver rapidement leurs filtres frequents.

## Proposition

- Ajouter des vues rapides ou filtres presets memorises pour les exercices et les aliments:
  - muscle prefere;
  - marque frequente;
  - type d'exercice;
  - filtres recents re-appliques en un clic.
- Transformer les filtres actifs en chips persistantes plus faciles a relire et a effacer.
- Proposer un tri rapide par usage recent ou favori si la donnees produit le permet ensuite.

## Impact

- Moins de manipulation repetee pour les actions quotidiennes.
- Meilleure sensation de controle dans un dashboard deja dense.

## Complexite

- M

## Liens

- Plan: docs/90-plans/092-suppression-popups-exercices-repas.md

---

## 2026-06-03 - UX: raccourci mobile pour ajout rapide sans modale

## Contexte

- Les popups sont pratiques pour demarrer, mais elles ralentissent souvent les saisies rapides sur mobile.
- Le nouveau flux inline peut servir de base a des raccourcis de saisie plus directs.

## Proposition

- Ajouter un bouton d'ajout rapide qui ouvre un panneau ancre en bas d'ecran plutot qu'une popup classique.
- Enregistrer la derniere section ouverte pour permettre un retour instantane au bon endroit.
- Simplifier la reprise apres creation avec insertion automatique dans la liste visible.

## Impact

- Parcours plus fluide sur petit ecran.
- Moins de clics pour les usages repetitifs.

## Complexite

- M

## Liens

- Plan: docs/90-plans/092-suppression-popups-exercices-repas.md

---

## 2026-05-30 - Mensurations: interpretation des indicateurs corporels

## Contexte

- Les calculs IMC, masse grasse US Navy et metabolisme sont maintenant visibles dans le dashboard.
- L'utilisateur a besoin d'une lecture actionnable, pas seulement de chiffres bruts.

## Proposition

- Ajouter une couche d'interpretation:
  - zone IMC (insuffisance, normal, surpoids, obésité) avec message court;
  - fourchettes % masse grasse selon silhouette et objectif;
  - tendance metabolique estimee et proposition de calories maintien / leger deficit / surplus.

## Impact

- Rend la section mensurations plus pedagogique et utile au quotidien.
- Aide a transformer les mesures en decisions nutrition/entrainement.

## Complexite

- M

## Liens

- Plan: docs/90-plans/027-mensurations-corporelles.md
