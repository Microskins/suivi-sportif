CREATE TYPE "UserGoalDomain" AS ENUM ('SPORT', 'BODY');

CREATE TYPE "UserGoalMetric" AS ENUM (
  'SPORT_WORKOUTS_PER_WEEK',
  'SPORT_MINUTES_PER_WEEK',
  'BODY_WEIGHT_KG',
  'BODY_BMI',
  'BODY_FAT_PERCENT'
);

CREATE TYPE "UserGoalDirection" AS ENUM ('AT_MOST', 'AT_LEAST', 'EXACT');

CREATE TABLE "user_goals" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "domain" "UserGoalDomain" NOT NULL,
  "metric" "UserGoalMetric" NOT NULL,
  "direction" "UserGoalDirection" NOT NULL DEFAULT 'AT_MOST',
  "name" TEXT NOT NULL,
  "target_value" DECIMAL(10,2) NOT NULL,
  "start_date" TIMESTAMP(3) NOT NULL,
  "end_date" TIMESTAMP(3),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_goals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "user_goals_user_id_domain_is_active_idx" ON "user_goals"("user_id", "domain", "is_active");
CREATE INDEX "user_goals_user_id_metric_idx" ON "user_goals"("user_id", "metric");
CREATE INDEX "user_goals_user_id_start_date_idx" ON "user_goals"("user_id", "start_date");

ALTER TABLE "user_goals"
  ADD CONSTRAINT "user_goals_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
