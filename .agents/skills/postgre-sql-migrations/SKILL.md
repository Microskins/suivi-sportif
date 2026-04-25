---
name: postgre-sql-migrations
description: Définit les conventions SQL du projet. Garantit que toutes les tables ont les bonnes contraintes, les bons index pour les performances, et que les changements de schéma sont toujours versionnés et reproductibles.
---

<!-- Tip: Use /create-skill in chat to generate content with agent assistance -->

Quand tu génères du SQL :
- Toujours des contraintes REFERENCES avec ON DELETE CASCADE
- Index sur toutes les colonnes profile_id + date
- Migrations numérotées (001_, 002_...) dans le dossier migrations/
- UNIQUE (profile_id, date) sur les tables avec une entrée par jour
- NUMERIC pour les valeurs décimales (poids, macros), SMALLINT pour les entiers courts
- TIMESTAMPTZ (avec timezone) pour les timestamps