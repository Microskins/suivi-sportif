ALTER TYPE "UserGoalMetric" ADD VALUE IF NOT EXISTS 'SPORT_EXERCISE_ONE_REP_MAX_KG';
ALTER TYPE "UserGoalMetric" ADD VALUE IF NOT EXISTS 'SPORT_EXERCISE_TEN_REP_MAX_KG';
ALTER TYPE "UserGoalMetric" ADD VALUE IF NOT EXISTS 'SPORT_EXERCISE_MAX_REPS';

ALTER TABLE "user_goals" ADD COLUMN "exercise_id" TEXT;

CREATE INDEX "user_goals_exercise_id_idx" ON "user_goals"("exercise_id");

ALTER TABLE "user_goals"
  ADD CONSTRAINT "user_goals_exercise_id_fkey"
  FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
