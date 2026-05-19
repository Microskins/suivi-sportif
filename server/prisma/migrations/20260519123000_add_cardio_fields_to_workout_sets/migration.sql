-- Add cardio metrics to workout sets
ALTER TABLE "workout_sets"
ADD COLUMN "duration_minutes" DECIMAL(10,2),
ADD COLUMN "avg_kmh" DECIMAL(10,2),
ADD COLUMN "incline_percent" DECIMAL(10,2);
