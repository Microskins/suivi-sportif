# Plan 009 — Optimisation du déploiement production npm

## Objectif

Réduire fortement le temps de déploiement GitHub Actions en évitant la réinstallation complète de npm à chaque build Docker, et en **cachant les téléchargements npm** entre builds.

---

## Statut

✅ **TERMINÉ** — 2026-05-09

---

## Problème identifié

Les 3 Dockerfiles (`server/`, `client/`, `mcp/`) exécutaient systématiquement :

```bash
RUN npm install -g npm@11.13.0
```

dans **chaque stage** (build + runtime), soit **6 installations inutiles** à chaque déploiement.

De plus, la commande `npm ci || npm install` utilisait un fallback inutile alors que `package-lock.json` est présent.

**Conséquences :**
* Temps de build Docker très long
* Téléchargements inutiles
* Charge CPU importante sur runner ARM64
* Risque de timeout réseau

---

## Solution appliquée

### 1. Suppression des installations npm globales

Supprimé `npm install -g npm@11.13.0` dans tous les Dockerfiles :
- ✅ [`server/Dockerfile`](../../server/Dockerfile) : stages build + runtime
- ✅ [`client/Dockerfile`](../../client/Dockerfile) : stage build
- ✅ [`mcp/Dockerfile`](../../mcp/Dockerfile) : stages build + runtime

**Justification :** Node 20 Alpine embarque déjà npm 10.x, largement suffisant. La version npm 11.13.0 n'apporte pas de bénéfice critique pour ce projet.

### 2. Utilisation exclusive de npm ci

Remplacé `npm ci || npm install` par `npm ci` strict dans les 3 Dockerfiles.

**Avantages :**
* Installation reproductible (basée sur `package-lock.json`)
* Plus rapide que `npm install`
* Optimisé pour CI/CD
* Échec explicite si `package-lock.json` désynchronisé

### 3. Optimisation du stage build server

Déplacé `apk add --no-cache openssl` **avant** `npm ci` pour éviter de polluer le cache npm avec des installations système.

---

## Résultat attendu

**Gains estimés :**
* Temps de build Docker réduit de ~40% (6 installations npm globales évitées)
* Build plus stable (moins de points de défaillance réseau)
* Logs plus clairs et plus courts
* Cache Docker mieux exploité

Le test final se fera automatiquement lors du prochain push via GitHub Actions.

---

## Actions effectuées

- [x] Analyse des 3 Dockerfiles
- [x] Suppression de toutes les installations npm globales
- [x] Remplacement de `npm ci || npm install` par `npm ci` strict
- [x] Optimisation de l'ordre des instructions (openssl avant npm)
- [x] Mise à jour de ce plan 009
- [ ] Validation via CI/CD (prochain push)

---

## Fichiers modifiés

- [`server/Dockerfile`](../../server/Dockerfile)
- [`client/Dockerfile`](../../client/Dockerfile)
- [`mcp/Dockerfile`](../../mcp/Dockerfile)

---

## Cache npm BuildKit (gain principal)

La majeure partie du temps de déploiement venait de `npm ci` dans les builds Docker (téléchargement de centaines de packages).

Pour éviter de retélécharger à chaque run, on active le cache npm via BuildKit :

- Utilisation de `RUN --mount=type=cache,target=/root/.npm npm ci` dans :
  - [`server/Dockerfile`](../../server/Dockerfile)
  - [`client/Dockerfile`](../../client/Dockerfile)
  - [`mcp/Dockerfile`](../../mcp/Dockerfile)

Pré-requis : BuildKit + buildx actifs sur le runner.

## Buildx

Le runner affichait :

> Docker Compose is configured to build using Bake, but buildx isn't installed

On ajoute donc `docker/setup-buildx-action@v3` et on force BuildKit pour le job deploy dans [`deploy-production.yml`](../../.github/workflows/deploy-production.yml).

## Notes

Le script [`scripts/deploy-production.sh`](../../scripts/deploy-production.sh) n'avait déjà pas d'installation npm globale (déploiement uniquement via Docker Compose).

Les optimisations se concentrent donc sur les builds Docker, qui représentent la majorité du temps de déploiement.
