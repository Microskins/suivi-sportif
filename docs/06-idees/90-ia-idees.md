# IA Idees

## 2026-06-17 - Assistant IA chat: streaming et presence

## Contexte

- Une chat box reste plus vivante quand la reponse arrive comme une vraie conversation, pas comme un bloc statique.
- Le passage a un chat pur ouvre la porte a une sensation de reponse plus fluide.

## Proposition

- Ajouter plus tard un affichage progressif de la reponse:
  - indicateur de saisie du modele;
  - streaming texte ou reveal progressif;
  - reprise visuelle des messages longs dans des bulles mieux decoupees.

## Impact

- Donne une impression de reactivite.
- Rend l'IA plus presente et moins froide.

## Complexite

- M

## Liens

- Plan: docs/90-plans/065-chatbox-ia-sans-brouillons.md

---

## 2026-06-17 - Assistant IA chat: raccourcis contextuels

## Contexte

- Dans une chat box, l'utilisateur gagne du temps avec des suggestions adaptees a l'ecran courant.
- Les demandes frequentes se repetent souvent sur les memes zones du produit.

## Proposition

- Ajouter plus tard des chips de raccourci selon le contexte actif:
  - "Ajoute ma pesee" sur les mensurations;
  - "Resume ma semaine" sur le dashboard;
  - "Ajoute un repas" sur la nutrition;
  - "Planifie une seance" sur les entrainements.

## Impact

- Reponses plus rapides.
- Moins de saisie au clavier pour les actions communes.

## Complexite

- S

## Liens

- Plan: docs/90-plans/065-chatbox-ia-sans-brouillons.md

---

## 2026-06-17 - Assistant IA chat: annulation rapide apres action

## Contexte

- Si l'assistant applique une action directement depuis le chat, un filet de securite rassure toujours.
- L'utilisateur doit pouvoir corriger vite une action lancee par erreur.

## Proposition

- Ajouter plus tard un bouton ou une notification d'annulation immediate apres une mutation du chat:
  - restauration rapide de l'etat precedent;
  - message de confirmation discret;
  - limite de temps courte pour l'annulation.

## Impact

- Renforce la confiance.
- Permet un mode plus direct sans faire revenir les brouillons.

## Complexite

- M

## Liens

- Plan: docs/90-plans/065-chatbox-ia-sans-brouillons.md

---

## 2026-06-17 - Assistant IA chat: memoire des conversations utiles

## Contexte

- Une chat box devient plus pratique quand on retrouve les discussions importantes.
- Les utilisateurs reviennent souvent sur les memes sujets de suivi.

## Proposition

- Ajouter plus tard une memoire locale de la conversation avec:
  - fils epingles;
  - recherche par mots cles;
  - resume de conversation partageable.

## Impact

- Facilite le retour sur une consigne ou une interpretation deja donnees.
- Ameliore la continuite d'usage.

## Complexite

- M

## Liens

- Plan: docs/90-plans/065-chatbox-ia-sans-brouillons.md

---

## 2026-06-12 - Assistant IA: reponses avec sources

## Contexte

- L'assistant actuel sait deja proposer des brouillons et des conseils courts.
- Pour qu'il paraisse vraiment intelligent, l'utilisateur doit comprendre sur quoi il se base.

## Proposition

- Ajouter plus tard un mode de reponse qui affiche:
  - les donnees utilisees pour le conseil;
  - un niveau de confiance ou de certitude;
  - une courte explication du raisonnement;
  - un lien vers l'action ou l'ecran concerne quand c'est pertinent.

## Impact

- Renforce la confiance.
- Aide a distinguer un conseil solide d'une simple inference du modele.

## Complexite

- M

## Liens

- Plan: docs/90-plans/064-assistant-ia-contextuel.md

---

## 2026-06-12 - Assistant IA: memoire legere des preferences

## Contexte

- Beaucoup de demandes repetitives gagneraient a reutiliser les habitudes de l'utilisateur.
- Le chat devient plus fluide si l'assistant retient quelques preferences simples.

## Proposition

- Ajouter plus tard une memoire legere pour:
  - les unites preferees;
  - les horaires habituels de repas et d'entrainement;
  - les exercices ou objectifs frequents;
  - les formulations ou raccourcis deja compris.

## Impact

- Moins de redites.
- Chat plus naturel et plus rapide.

## Complexite

- M

## Liens

- Plan: docs/90-plans/064-assistant-ia-contextuel.md

---

## 2026-06-12 - Assistant IA: resume hebdo et prochaine action

## Contexte

- Le dashboard contient deja assez de signaux pour produire une lecture utile de la semaine.
- Un vrai coach IA doit aussi savoir condenser et orienter vers la prochaine action utile.

## Proposition

- Ajouter plus tard un resume hebdo qui:
  - regroupe la progression;
  - met en avant les ecarts ou points d'attention;
  - propose une prochaine action simple et prioritaire.

## Impact

- Donne une sensation de suivi actif plutot que de simple saisie de donnees.
- Aide a transformer le dashboard en outil de decision.

## Complexite

- M

## Liens

- Plan: docs/90-plans/064-assistant-ia-contextuel.md

---

## 2026-06-12 - Assistant IA: relances intelligentes

## Contexte

- Quand il manque une information, le chat renvoie parfois juste une liste technique de champs manquants.
- Une vraie IA doit pouvoir reformuler la relance de facon naturelle et progressive.

## Proposition

- Ajouter plus tard des questions de suivi contextuelles:
  - une seule question a la fois quand c'est possible;
  - rappel du contexte deja donne;
  - reprise automatique des reponses dans le brouillon actif.

## Impact

- Rend les echanges plus humains.
- Diminue la sensation de formulaire deguisant un chat.

## Complexite

- S

## Liens

- Plan: docs/90-plans/064-assistant-ia-contextuel.md

---

## 2026-06-09 - Deploiement OVH: preflight de compatibilite

## Contexte

- Le chantier de migration depend du type exact d'offre OVH choisi.
- Sans verification amont, on peut lancer une migration sur une offre qui ne supporte pas le runtime, la base de donnees ou les operations attendues.

## Proposition

- Ajouter plus tard un preflight de compatibilite qui verifie automatiquement si la cible supporte:
  - Node.js runtime;
  - SSH;
  - base de donnees externe;
  - Docker ou, a defaut, un lancement sans Docker;
  - variables d'environnement critiques.

## Impact

- Evite de partir sur une offre incompatible.
- Clarifie tres vite le type de migration possible.

## Complexite

- S

## Liens

- Aucun plan actif pour l'instant.

---

## 2026-06-09 - Deploiement OVH: smoke tests de cutover

## Contexte

- Une migration d'hebergement peut reussir sur le plan technique mais casser sur le routage, le certificat ou un endpoint metier.
- Il faut un filet de securite simple au moment du basculement DNS.

## Proposition

- Ajouter plus tard une suite de smoke tests post-cutover qui verifie:
  - la page d'accueil;
  - `/health`;
  - la connexion utilisateur;
  - un appel API protege avec token;
  - la presence des assets frontend.

## Impact

- Detection rapide d'une regression apres bascule.
- Moins de temps perdu a distinguer un probleme DNS d'un probleme applicatif.

## Complexite

- S

## Liens

- Aucun plan actif pour l'instant.

---

## 2026-06-09 - Deploiement OVH: drill de sauvegarde et restauration

## Contexte

- La migration d'une VM vers un autre hebergement expose souvent les points faibles du backup/restore.
- Un rollback est rassurant seulement si la restauration a deja ete testee.

## Proposition

- Ajouter plus tard un exercice periodique de restauration de la base:
  - export de sauvegarde;
  - restauration dans un conteneur ou un environnement isole;
  - verification d'un jeu de donnees minimal;
  - note de temps de reprise.

## Impact

- Rend les migrations et les rollback beaucoup plus fiables.
- Met en evidence les lacunes de sauvegarde avant l'incident.

## Complexite

- M

## Liens

- Aucun plan actif pour l'instant.

---

## 2026-06-09 - Deploiement OVH: garde-fous sur les variables d'environnement

## Contexte

- Le projet depend de plusieurs variables sensibles pour fonctionner correctement en production.
- Une migration d'hebergement augmente le risque de mismatch entre domaine, API publique et configuration CORS.

## Proposition

- Ajouter plus tard une validation de demarrage ou de CI qui verifie la presence et la coherence de:
  - `DATABASE_URL`;
  - `JWT_SECRET`;
  - `API_PUBLIC_BASE_URL`;
  - `CORS_ORIGINS`;
  - `MCP_AUTH_TOKEN`.

## Impact

- Moins d'erreurs de configuration apres migration.
- Messages d'erreur plus explicites lors d'un deploiement incomplet.

## Complexite

- S

## Liens

- Aucun plan actif pour l'instant.

---

## 2026-06-08 - Assistant IA MCP: diff, raccourcis et trace

## Contexte

- L'assistant IA MCP va permettre de piloter des actions metier en langage naturel.
- Plus l'IA touche aux repas, seances, mensurations, objectifs ou au profil, plus il faut de la visibilite sur ce qui va changer et sur ce qui a change.

## Proposition

- Ajouter plus tard un apercu du diff avant application, surtout pour les champs sensibles et les creations complexes.
- Proposer des raccourcis de commandes courantes dans l'UI pour accelerer les demandes repetitives.
- Conserver un journal leger des actions IA pour le support et la confiance.

## Impact

- Reduit le risque d'action involontaire.
- Rend la chatbox plus rapide et plus rassurante au quotidien.
- Facilite le diagnostic si une demande est mal interpretee.

## Complexite

- S

## Liens

- Plan: docs/90-plans/058-chatbox-ia.md

---

## 2026-06-08 - Synthese corporelle: poids, anciennete et raccourci objectif

## Contexte

- Le dashboard a deja des donnees corporelles dans l'onglet Mensurations, mais la synthese reste centree sur le sport et la nutrition.
- Une lecture rapide du poids corporel dans la synthese aiderait a voir l'evolution sans changer d'onglet.

## Proposition

- Ajouter plus tard des signaux adjacents a la carte poids de corps de la synthese:
  - anciennete de la derniere pesee;
  - comparaison a un objectif corps actif s'il existe;
  - raccourci contextuel vers la saisie d'une mesure quand les donnees deviennent trop anciennes.

## Impact

- Rend la lecture du poids plus actionable au quotidien.
- Aide a relier la synthese du dashboard et l'onglet Mensurations sans dupliquer le contenu.

## Complexite

- S

## Liens

- Plan: docs/90-plans/057-synthese-poids-corps.md

---

## 2026-06-07 - Builder seances: profils de repos personnalisables

## Contexte

- Les repos conseilles automatiques couvrent maintenant un cas simple par type, difficulte et zone corporelle.
- Certains utilisateurs voudront ajuster ces valeurs selon leur niveau, objectif ou phase d'entrainement.

## Proposition

- Ajouter plus tard des profils de repos configurables:
  - force;
  - hypertrophie;
  - cardio;
  - reprise;
  - personnalise.
- Permettre de choisir un profil par seance ou modele, sans rendre obligatoire le parametrage.

## Impact

- Recommandations plus proches des usages reels.
- Meilleure transition vers des blocs Tabata ou echauffement.

## Complexite

- M

## Liens

- Plan: docs/90-plans/049-repos-conseilles-builder.md

---

## 2026-06-07 - Builders: decouper les restes en micro-chantiers

## Contexte

- Les idees builder de seances et de repas melangent des fondations deja livrees avec des prolongements encore ouverts.
- Les garder comme gros blocs rend la priorisation moins lisible.

## Proposition

- Transformer plus tard les restes volumineux en micro-chantiers separes quand une idee melange UX, data et integration externe.
- Cette proposition a ete appliquee aux builders de seances et de repas.

## Impact

- Chantiers plus petits et plus faciles a valider.
- Moins de risque de melanger UX, data et integration externe.

## Complexite

- S

## Liens

- Plan: docs/90-plans/048-tri-idees-builder.md
- Plan: docs/90-plans/053-modeles-favoris-repas.md
- Plan: docs/90-plans/054-lookup-code-barres-aliments.md

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
- Le chantier `047-durcissement-securite-auth-session-cors` va corriger les risques immediats, mais il reste des ameliorations adjacentes utiles a tracer.

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
- Plan: docs/90-plans/047-durcissement-securite-auth-session-cors.md

## 2026-06-03 - Identite app: theme PWA par contexte

## Contexte

- Le plan `042-assets-identite-app` ajoute les premiers assets d'identite et les metadonnees HTML.
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

- Plan: docs/90-plans/042-assets-identite-app.md

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

- Plan: docs/90-plans/040-mobile-capacitor.md

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

- Plan: docs/90-plans/041-tour-qualite-ui.md

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
- Plan: docs/90-plans/042-assets-identite-app.md

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

## 2026-06-07 - Idees: statut explicite active/archive/reportee

## Contexte

- La passe d'archive de `docs/06-idees` repose aujourd'hui sur l'emplacement du fichier.
- Une idee peut etre partiellement realisee, reportee ou archivee, ce qui n'est pas toujours visible sans lire les plans lies.

## Proposition

- Ajouter plus tard un champ court de statut dans les idees:
  - `active`;
  - `partielle`;
  - `archivee`;
  - `reportee`.
- Utiliser ce statut dans l'index pour accelerer les futures passes de tri.

## Impact

- Moins d'ambiguite quand une idee contient plusieurs sous-parties.
- Meilleure lecture des idees encore actionnables.

## Complexite

- S

## Liens

- Plan: docs/90-plans/055-archive-idees-realisees.md

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

- Plan: docs/90-plans/043-suppression-popups-exercices-repas.md

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

- Plan: docs/90-plans/043-suppression-popups-exercices-repas.md

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
