# Plan - Mobile Android/iOS via Capacitor

## Objectif

- Transformer le frontend web (`client/`) en applications Android et iOS via Capacitor, sans reecriture de l'UI.
- Mettre en place une base reproductible (scripts, build, CI) pour publier sur Play Store et App Store.

## Decisions

- Utiliser Capacitor (wrap du build Vite) plutot qu'Expo/React Native.
- Bundle id par defaut: `com.microskins.suivi_sportif` (a valider avant toute publication).
- Le build web est copie dans le dossier Capacitor (`mobile/www`) pour supporter le mode offline (assets embarques).
- Stockage auth: utiliser Capacitor Preferences en mobile, sinon localStorage sur le web.
- CI: poser une base GitHub Actions avec fastlane; la signature et les secrets restent a fournir.
- Integrer la Vague 5 `mobile, ops et industrialisation` au moment de la
  reprise de ce chantier.

## Todo

- [x] Creer ce plan.
- [ ] Integrer les items pertinents du plan `035-vague-5-mobile-ops-industrialisation`.
- [ ] Ajouter le workspace `mobile/` (Capacitor) + scripts npm.
- [ ] Rendre le frontend compatible mobile (routing, storage auth, API URL).
- [ ] Ajuster le backend (CORS/HTTPS) pour les origins Capacitor.
- [ ] Ajouter la doc mobile (prerequis, commandes, checklist release).
- [ ] Ajouter CI/CD (Android AAB, iOS IPA) avec fastlane (squelettes + docs secrets).
- [ ] Verifier builds locaux (web + capacitor sync).

## Notes de verification

- A completer pendant le chantier.
- 2026-06-01: decision utilisateur: le plan `035-vague-5-mobile-ops-industrialisation`
  sera traite avec ce chantier mobile.
