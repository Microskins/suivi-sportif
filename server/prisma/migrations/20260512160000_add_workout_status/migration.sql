-- Add workout status as first-class planning state.
CREATE TYPE "WorkoutStatus" AS ENUM ('PLANNED', 'COMPLETED', 'CANCELED');

ALTER TABLE "workouts"
  ADD COLUMN "status" "WorkoutStatus" NOT NULL DEFAULT 'PLANNED';

-- Backfill explicit status for existing rows.
UPDATE "workouts"
SET "status" = 'COMPLETED'
WHERE "date" <= NOW();
