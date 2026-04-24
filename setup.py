#!/usr/bin/env python3
"""
Script de configuration pour créer la structure des répertoires du projet suivi-sportif
"""

import os
import sys

def create_directory_structure():
    """Crée la structure complète des répertoires"""
    
    base_path = r'G:\suivi-sportif'
    
    # Définir tous les répertoires à créer
    directories = [
        r'G:\suivi-sportif\server\src\routes',
        r'G:\suivi-sportif\server\src\controllers',
        r'G:\suivi-sportif\server\src\models',
        r'G:\suivi-sportif\server\src\middleware',
        r'G:\suivi-sportif\client\src\components',
        r'G:\suivi-sportif\client\src\pages',
        r'G:\suivi-sportif\client\src\hooks',
        r'G:\suivi-sportif\migrations'
    ]
    
    # Créer tous les répertoires
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"✓ Créé: {directory}")
    
    print("\n✓ Structure de répertoires créée avec succès !")

if __name__ == '__main__':
    try:
        create_directory_structure()
    except Exception as e:
        print(f"✗ Erreur: {e}", file=sys.stderr)
        sys.exit(1)
