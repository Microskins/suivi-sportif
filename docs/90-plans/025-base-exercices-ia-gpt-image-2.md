# Plan - Base exercices IA gpt-image-2

## Objectif

- Creer une base exportable d'exercices dans `/exercices` avec JSON, CSV et images.
- Reutiliser le catalogue source de 163 exercices, cardio/HIIT inclus.
- Preparer et tenter la generation d'images originales via `gpt-image-2`.

## Decisions

- Source finale de donnees: `exercices/exercices.json` et `exercices/image-prompts-gpt-image-2.jsonl`.
- Format JSON/CSV: `nom`, `groupe_musculaire`, `muscles_secondaires`, `type`, `materiel`, `niveau`, `description`, `conseils`, `image`.
- Le catalogue conserve les 163 entrees source; les noms presents dans plusieurs categories gardent une image distincte via un suffixe de categorie.
- Images cible: PNG 1536x1536 dans `exercices/images`.
- Generation image: CLI imagegen avec `gpt-image-2` et `generate-batch` si `OPENAI_API_KEY` et Python sont disponibles.

## Todo

- [x] Creer ce plan.
- [x] Ajouter le plan a l'index.
- [x] Generer `exercices/exercices.json`.
- [x] Generer `exercices/exercices.csv`.
- [x] Preparer le fichier JSONL de prompts `gpt-image-2`.
- [x] Tenter la generation des images IA.
- [x] Valider JSON, CSV et references images.
- [x] Noter les validations et blocages.

## Notes de verification

- `exercices/exercices.json`, `exercices/exercices.csv` et `exercices/image-prompts-gpt-image-2.jsonl` generes puis conserves comme source finale du catalogue.
- 163 entrees conservees, incluant cardio/HIIT et doublons multi-categories avec chemins image uniques.
- Tentative imagegen: `python C:/Users/thoma/.codex/skills/.system/imagegen/scripts/image_gen.py generate-batch --input tmp/imagegen/exercices-gpt-image-2.jsonl --out-dir exercices/images --concurrency 5`.
- Blocage: Python indisponible localement (`python` et `python3` pointent vers le raccourci Microsoft Store) et `OPENAI_API_KEY` absent.
- Validation JSON: 163 entrees, champs attendus presents, 0 ligne incomplete, repartition type `polyarticulaire:91`, `isolation:72`.
- Validation CSV: 163 lignes, colonnes attendues presentes.
- Validation prompts: 163 prompts, modele `gpt-image-2`, taille `1536x1536`.
- Validation images: 163 references image manquantes car la generation IA n'a pas pu etre executee dans cet environnement.
- Idee ajoutee: `docs/06-idees/90-ia-idees.md` section `2026-05-20 - Exercices: controle qualite des images IA`.
- Dossier `exercices/images` conserve via `.gitkeep` en attendant les PNG generes.
- Test 2 images: batch `tmp/imagegen/exercices-test-2.jsonl` prepare pour `developpe-couche.png` et `developpe-couche-halteres.png`.
- Commande test: `python C:/Users/thoma/.codex/skills/.system/imagegen/scripts/image_gen.py generate-batch --input tmp/imagegen/exercices-test-2.jsonl --out-dir exercices/images --concurrency 2`.
- Resultat test: echec avant appel API, Python indisponible via le raccourci Microsoft Store; aucun PNG genere.
- Test WSL 2 images: `python3` disponible via Ubuntu WSL, dry-run imagegen valide pour `developpe-couche.png` et `developpe-couche-halteres.png`.
- Blocage WSL restant: `OPENAI_API_KEY` absent dans l'environnement WSL du process imagegen; l'appel reel echoue avec `OPENAI_API_KEY is not set`.
- Test WSL apres ajout cle: virtualenv `~/.codex-imagegen-venv` cree, dependances `openai` et `pillow` installees.
- Commande reelle 2 images lancee avec `bash -ic` et `~/.codex-imagegen-venv/bin/python`; `OPENAI_API_KEY` bien detectee par le script.
- Resultat API: les deux jobs echouent avec `billing_hard_limit_reached` (`Billing hard limit has been reached`); aucun PNG partiel genere.
- Script imagegen mis a jour: `generate-batch --limit N` traite seulement les N premiers jobs.
- Script imagegen mis a jour: un job batch est saute si son PNG de sortie existe deja, y compris en dry-run; cela evite de regenerer une image deja presente dans `exercices/images`.
- Script imagegen mis a jour: `billing_hard_limit_reached` arrete immediatement le batch avec un message clair.
- Validations script: `--help` affiche `--limit`; dry-run `--limit 2` ne sort que 2 jobs; dry-run avec PNG factice existant saute le job correspondant; appel reel `--limit 1` s'arrete sur le message billing attendu; `py_compile` OK.
- Nettoyage: suppression de `tools/exercise-prompts/`, devenu redondant apres generation des exports finaux dans `exercices/`.
- Test generation reel: `generate-batch --limit 2 --concurrency 1` lance via WSL et `~/.codex-imagegen-venv/bin/python`.
- Resultat generation: `exercices/images/developpe-couche.png` et `exercices/images/developpe-couche-halteres.png` generes avec succes.
- Validation images apres test: 2 PNG presents, 161 references image restantes a generer.
- Test generation nouveau prompt infographie: `generate-batch --limit 1 --concurrency 1` lance via WSL.
- Resultat: `exercices/images/developpe-couche.png` regenere avec le nouveau prompt infographie, fichier present (~2.58 MB).
- Prompts mis a jour pour utiliser le template valide de `exercices/images/developpe-couche-halteres.png`: titre navy, panneaux informations/execution/muscles, positions depart/finale, variations violettes, conseils securite orange.
- Validation prompts template: 163 prompts JSONL valides, sorties conservees, dry-run OK avec skip du PNG deja present.
- Generation template reference: `generate-batch --limit 1 --concurrency 1` a regenere `exercices/images/developpe-couche.png` avec les prompts bases sur le template valide.
- Validation apres generation: 2 PNG presents (`developpe-couche.png`, `developpe-couche-halteres.png`), 161 images restantes.
- Generation complete tentee: `generate-batch --limit 163 --concurrency 3` lance via WSL.
- Resultat partiel: le script a skippe les 2 PNG deja presents puis genere jusqu'a 63 PNG presents au total.
- Arret automatique attendu: `billing_hard_limit_reached`; aucun process imagegen restant detecte.
- Validation apres arret: 63 PNG presents, 100 images restantes; premiere manquante `tractions-supination-biceps.png`.
