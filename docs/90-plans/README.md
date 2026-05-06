# Plans

Index chronologique des chantiers planifies et executes.

## Chantiers

1. [Compte initial et donnees de base](./001-compte-initial-data.md)
2. [API helpers](./002-api-helpers.md)

## Convention

Chaque nouveau chantier doit avoir une doc `XXX-nom-du-chantier.md`, avec:

- objectif;
- decisions;
- todo list;
- notes de verification.

La todo est cochee au fil de l'implementation. Un commit est fait a la fin de
chaque sous-tache quand le chantier le demande, puis un push a la fin du
chantier.

## Statuts

- Un plan reste dans `docs/90-plans/` meme une fois termine.
- Les docs actives sont mises a jour quand le plan change le comportement du projet.
- Les plans ne remplacent pas `README.md`, `01-getting-started/quick-start.md`,
  `03-api/reference.md` ou `02-architecture/overview.md`; ils expliquent
  l'historique des decisions.
