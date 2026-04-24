#!/bin/bash

# Script de configuration pour créer la structure des répertoires
# Exécutez avec: bash setup.sh

BASE_PATH="."

# Créer les répertoires du serveur
mkdir -p "$BASE_PATH/server/src/routes"
mkdir -p "$BASE_PATH/server/src/controllers"
mkdir -p "$BASE_PATH/server/src/models"
mkdir -p "$BASE_PATH/server/src/middleware"

# Créer les répertoires du client
mkdir -p "$BASE_PATH/client/src/components"
mkdir -p "$BASE_PATH/client/src/pages"
mkdir -p "$BASE_PATH/client/src/hooks"

# Créer le répertoire des migrations
mkdir -p "$BASE_PATH/migrations"

echo "✓ Tous les répertoires ont été créés avec succès !"
echo ""
echo "Structure créée:"
echo "  server/src/{routes,controllers,models,middleware}"
echo "  client/src/{components,pages,hooks}"
echo "  migrations/"
