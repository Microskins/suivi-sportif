# API data entry

Ces helpers permettent de creer rapidement des donnees via l'API production.

Base par defaut:

```text
https://suivi-sportif.fr
```

Compte de reference:

```text
admin@suivi-sportif.fr
```

Le token JWT est stocke localement dans `scripts/api/.token.json`. Ce fichier
est ignore par Git.

## Lancer les scripts sous Windows

Si l'execution directe de `.ps1` est bloquee par Windows, charge le script via
un scriptblock depuis la racine du repo:

```powershell
$script = Get-Content .\scripts\api\login.ps1 -Raw
& ([scriptblock]::Create($script))
```

Quand l'execution directe est autorisee:

```powershell
.\scripts\api\login.ps1
```

## Login admin

Prompt interactif pour le mot de passe:

```powershell
.\scripts\api\login.ps1
```

Ou avec un mot de passe fourni pour une verification ponctuelle:

```powershell
.\scripts\api\login.ps1 -Password "<password>"
```

## Lister les catalogues

```powershell
.\scripts\api\get-exercises.ps1
.\scripts\api\get-foods.ps1
```

## Creer un exercice

```powershell
.\scripts\api\create-exercise.ps1 `
  -Name "Presse a cuisses" `
  -Description "Poussee guidee pour les jambes." `
  -MuscleGroup legs `
  -Equipment machine `
  -Difficulty beginner
```

## Creer une seance

Sans exercice detaille:

```powershell
.\scripts\api\create-workout.ps1 `
  -Name "Seance libre" `
  -Duration 45 `
  -Notes "Travail general"
```

Avec un exercice et une serie:

```powershell
.\scripts\api\create-workout.ps1 `
  -Name "Jambes" `
  -Duration 60 `
  -ExerciseId "<exercise-id>" `
  -Reps 10 `
  -Weight 80 `
  -Rest 90
```

## Creer un aliment personnel

Les valeurs sont pour 100 g.

```powershell
.\scripts\api\create-food.ps1 `
  -Name "Skyr nature" `
  -CaloriesKcal 60 `
  -ProteinGrams 10 `
  -CarbsGrams 4 `
  -FatGrams 0.2 `
  -ServingUnit "g"
```

## Creer un repas

```powershell
.\scripts\api\create-meal.ps1 `
  -Name "Dejeuner" `
  -MealType lunch `
  -FoodId "<food-id>" `
  -QuantityGrams 150
```

## Creer un objectif nutrition

```powershell
.\scripts\api\create-nutrition-goal.ps1 `
  -Name "Maintien" `
  -DailyCaloriesKcal 2400 `
  -DailyProteinGrams 160 `
  -DailyCarbsGrams 260 `
  -DailyFatGrams 70
```

## Nettoyage manuel si besoin

Les scripts de creation affichent l'objet cree, dont son `id`. Pour supprimer
une donnee de test, utilise l'endpoint `DELETE` correspondant avec le token du
fichier local.
