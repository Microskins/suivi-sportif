# Checklist UI et accessibilite

## Parcours critiques

- Connexion et inscription.
- Dashboard de synthese.
- Creation, modification et duplication de seance.
- Creation de repas et duplication de repas.
- Mensurations et objectifs sport/corps.
- Profil utilisateur.

## Controle clavier

- Chaque action visible est atteignable au clavier.
- L'ordre de tabulation suit la lecture visuelle.
- Les modales gardent un bouton d'annulation et une action principale visibles.
- Les champs requis utilisent `required` ou une validation explicite.

## Etats et feedback

- Les erreurs API apparaissent pres du parcours concerne.
- Les etats vides indiquent l'action attendue.
- Les actions de sauvegarde affichent un etat de chargement.
- Les suppressions passent par une confirmation.

## Lisibilite

- Les textes longs peuvent passer a la ligne sans deborder.
- Les boutons restent lisibles sur mobile.
- Les jauges gardent une valeur textuelle a proximite.
- Les cartes compactes n'utilisent pas de texte hero-scale.

## Donnees sensibles

- Les changements d'email ou de mot de passe demandent le mot de passe actuel.
- Aucun hash, secret ou variable d'environnement ne remonte au frontend.
- Les consentements cookies obsoletes sont invalides.

## Notes Vague 4

- Le parcours Profil demande maintenant le mot de passe actuel pour email et
  mot de passe.
- Le parcours Repas affiche un recap macros avant validation et une comparaison
  aux objectifs.
- Le parcours Objectifs sport affiche des recommandations comme aides, pas
  comme consignes obligatoires.
