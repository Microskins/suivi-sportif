# Assistant IA MCP

## Contexte

- Le profil connecte contient deja les champs de base, mais les modifications restent manuelles.
- Les saisies frequentes restent dispersees entre repas, seances, mensurations, objectifs et profil.
- Une chatbox permettrait de demander a l'IA d'interpreter une intention simple et de preparer l'action correspondante.
- Le MCP existant peut servir de couche d'outils controlee entre l'IA et les API metier.

## Proposition

- Ajouter une chatbox dans le dashboard.
- Laisser l'IA transformer le message utilisateur en brouillon d'action structure.
- Utiliser le MCP existant comme couche d'outils pour lire ou modifier les donnees via l'API.
- Couvrir progressivement les demandes comme:
  - ajouter un repas;
  - creer une seance;
  - enregistrer une pesee ou mensuration;
  - modifier le profil;
  - creer un objectif.
- Demander confirmation avant chaque creation, modification ou suppression.

## Impact

- Saisie plus rapide pour les actions quotidiennes.
- UX plus naturelle pour les utilisateurs qui preferent ecrire une demande plutot que remplir un formulaire.
- Base reutilisable pour d'autres assistants IA plus tard, sans exposer directement les cles ou la base au navigateur.

## Complexite

- L

## Liens

- Plan: docs/90-plans/058-chatbox-ia.md
