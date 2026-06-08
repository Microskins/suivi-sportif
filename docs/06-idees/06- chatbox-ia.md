# Chatbox IA

## Contexte

- Le profil connecte contient deja les champs de base, mais les modifications restent manuelles.
- Une chatbox permettrait de demander a l'IA d'interpreter une intention simple et de remplir le profil a la place de l'utilisateur.
- Le besoin est surtout utile pour des changements rapides comme le nom, l'email ou la date de naissance, sans perdre les regles de securite du compte.

## Proposition

- Ajouter une chatbox dans l'onglet Profil du dashboard.
- Laisser l'IA transformer le message utilisateur en modifications structurees du profil connecte.
- Reutiliser le flux d'update deja existant pour valider et enregistrer les changements.
- Conserver les confirmations requises pour les champs sensibles comme l'email ou le mot de passe.

## Impact

- Saisie plus rapide pour les petites modifications de compte.
- UX plus naturelle pour les utilisateurs qui preferent ecrire une demande plutot que remplir un formulaire.
- Base reutilisable pour d'autres assistants IA plus tard.

## Complexite

- L

## Liens

- Plan: docs/90-plans/058-chatbox-ia.md
