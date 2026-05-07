# Plan 009 — Optimisation du déploiement production npm

## Objectif

Réduire fortement le temps de déploiement GitHub Actions en évitant la réinstallation complète de npm à chaque déploiement.

---

# Problème actuel

Le script de déploiement exécute :

```bash
npm install -g npm@11.13.0
```

à chaque déploiement.

Conséquences :

* temps de déploiement très long ;
* téléchargements inutiles ;
* charge CPU importante sur le runner ARM64 ;
* risque de timeout ou de blocage réseau.

---

# Solution recommandée

Installer npm une seule fois sur le serveur de production puis supprimer la mise à jour globale automatique du script de deploy.

---

# Étape 1 — Installer npm une seule fois

Sur le serveur de production :

```bash
node -v
npm -v
sudo npm install -g npm@11.13.0
npm -v
```

Vérifier que la version affichée est :

```text
11.13.0
```

---

# Étape 2 — Modifier le script de déploiement

Fichier :

```text
scripts/deploy-production.sh
```

Supprimer cette ligne :

```bash
npm install -g npm@11.13.0
```

---

# Étape 3 — Ajouter une vérification intelligente (optionnel)

À la place, utiliser :

```bash
CURRENT_NPM_VERSION="$(npm -v)"

if [ "$CURRENT_NPM_VERSION" != "11.13.0" ]; then
  echo "Updating npm to 11.13.0..."
  npm install -g npm@11.13.0
else
  echo "npm already up to date: $CURRENT_NPM_VERSION"
fi
```

Cela évite les réinstallations inutiles.

---

# Étape 4 — Utiliser npm ci

Toujours préférer :

```bash
npm ci
```

au lieu de :

```bash
npm install
```

Avantages :

* plus rapide ;
* reproductible ;
* optimisé CI/CD ;
* utilise package-lock.json.

---

# Étape 5 — Conserver le cache npm

Configurer le cache npm :

```bash
npm config set cache /home/deploy/.npm
```

Vérification :

```bash
npm config get cache
```

---

# Étape 6 — Vérification manuelle

Tester directement sur le serveur :

```bash
cd /var/www/suivi-sportif

npm -v
npm ci
npm run build
```

---

# Étape 7 — Déployer les modifications

Une fois le script modifié :

```bash
git add scripts/deploy-production.sh
git commit -m "Optimize npm production deployment"
git push origin main
```

Puis relancer GitHub Actions.

---

# Résultat attendu

Temps de déploiement réduit :

* avant : plusieurs minutes ;
* après : quelques secondes pour l’étape npm globale.

Déploiement plus stable et plus fiable sur runner ARM64.
