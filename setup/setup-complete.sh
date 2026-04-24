#!/usr/bin/env bash

# Script d'installation pour Suivi Sportif
# Exécution: bash setup.sh

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  Suivi Sportif - Configuration du Projet                       ║"
echo "║  Stack: Fastify + React + SQLite                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "✗ Node.js n'est pas installé"
    echo "  Téléchargez-le depuis: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version)
echo "✓ Node.js détecté: $NODE_VERSION"

# Vérifier npm
if ! command -v npm &> /dev/null; then
    echo "✗ npm n'est pas installé"
    exit 1
fi

NPM_VERSION=$(npm --version)
echo "✓ npm détecté: $NPM_VERSION"
echo ""

# Créer la structure
echo "1️⃣  Création de la structure des répertoires..."
node setup-dirs.js

if [ $? -ne 0 ]; then
    echo "✗ Erreur lors de la création de la structure"
    exit 1
fi

echo ""
echo "2️⃣  Installation des dépendances..."
npm install

if [ $? -ne 0 ]; then
    echo "✗ Erreur lors de l'installation des dépendances"
    exit 1
fi

echo ""
echo "3️⃣  Configuration de la base de données..."
npm run migrate -w server

if [ $? -ne 0 ]; then
    echo "✗ Erreur lors de la migration BD"
    exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║  ✓ Configuration terminée avec succès !                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "🔗 Accédez à:"
echo "   Client  : http://localhost:5173"
echo "   API     : http://localhost:3001"
echo "   Health  : http://localhost:3001/health"
echo ""
echo "Démarrage du serveur de développement..."
echo ""

npm run dev
