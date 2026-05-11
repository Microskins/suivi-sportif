-- This migration aligns the DB schema with the current Prisma datamodel around exercises.
-- Notes:
-- - We keep legacy columns (`muscle_group`, `equipment`) for now. Prisma ignores extra columns.
-- - We do NOT backfill the new normalized relations in SQL to avoid requiring extensions/privileges.

-- CreateEnum
CREATE TYPE "ExerciseDifficulty" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('STRENGTH', 'CARDIO', 'MOBILITY');

-- CreateEnum
CREATE TYPE "MuscleRole" AS ENUM ('PRIMARY', 'SECONDARY');

-- CreateEnum
CREATE TYPE "ExerciseMediaType" AS ENUM ('IMAGE', 'VIDEO', 'GIF');

-- Add the new enum-based columns on exercises.
ALTER TABLE "exercises"
  ADD COLUMN "exercise_type" "ExerciseType" NOT NULL DEFAULT 'STRENGTH';

-- Convert difficulty from legacy text values to enum values.
ALTER TABLE "exercises"
  ALTER COLUMN "difficulty" TYPE "ExerciseDifficulty"
  USING (
    CASE lower("difficulty")
      WHEN 'beginner' THEN 'BEGINNER'
      WHEN 'intermediate' THEN 'INTERMEDIATE'
      WHEN 'advanced' THEN 'ADVANCED'
      ELSE 'BEGINNER'
    END
  )::"ExerciseDifficulty";

-- CreateTable
CREATE TABLE "exercise_categories" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "exercise_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_category_on_exercise" (
  "exercise_id" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  CONSTRAINT "exercise_category_on_exercise_pkey" PRIMARY KEY ("exercise_id","category_id")
);

-- CreateTable
CREATE TABLE "muscles" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "muscles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_muscles" (
  "exercise_id" TEXT NOT NULL,
  "muscle_id" TEXT NOT NULL,
  "role" "MuscleRole" NOT NULL DEFAULT 'PRIMARY',
  CONSTRAINT "exercise_muscles_pkey" PRIMARY KEY ("exercise_id","muscle_id")
);

-- CreateTable
CREATE TABLE "equipment" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_equipment" (
  "exercise_id" TEXT NOT NULL,
  "equipment_id" TEXT NOT NULL,
  CONSTRAINT "exercise_equipment_pkey" PRIMARY KEY ("exercise_id","equipment_id")
);

-- CreateTable
CREATE TABLE "exercise_instructions" (
  "id" TEXT NOT NULL,
  "exercise_id" TEXT NOT NULL,
  "step_order" INTEGER NOT NULL,
  "instruction" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "exercise_instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercise_media" (
  "id" TEXT NOT NULL,
  "exercise_id" TEXT NOT NULL,
  "media_type" "ExerciseMediaType" NOT NULL,
  "url" TEXT NOT NULL,
  "is_main" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "exercise_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exercise_categories_name_key" ON "exercise_categories"("name");

-- CreateIndex
CREATE INDEX "exercise_category_on_exercise_category_id_idx" ON "exercise_category_on_exercise"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "muscles_name_key" ON "muscles"("name");

-- CreateIndex
CREATE INDEX "exercise_muscles_muscle_id_idx" ON "exercise_muscles"("muscle_id");

-- CreateIndex
CREATE INDEX "exercise_muscles_role_idx" ON "exercise_muscles"("role");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_name_key" ON "equipment"("name");

-- CreateIndex
CREATE INDEX "exercise_equipment_equipment_id_idx" ON "exercise_equipment"("equipment_id");

-- CreateIndex
CREATE INDEX "exercise_instructions_exercise_id_idx" ON "exercise_instructions"("exercise_id");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_instructions_exercise_id_step_order_key" ON "exercise_instructions"("exercise_id", "step_order");

-- CreateIndex
CREATE INDEX "exercise_media_exercise_id_idx" ON "exercise_media"("exercise_id");

-- CreateIndex
CREATE INDEX "exercise_media_media_type_idx" ON "exercise_media"("media_type");

-- CreateIndex
CREATE INDEX "exercises_name_idx" ON "exercises"("name");

-- CreateIndex
CREATE INDEX "exercises_difficulty_idx" ON "exercises"("difficulty");

-- CreateIndex
CREATE INDEX "exercises_exercise_type_idx" ON "exercises"("exercise_type");

-- CreateIndex (missing on legacy schema, but needed for typical queries)
CREATE INDEX "workout_exercises_exercise_id_idx" ON "workout_exercises"("exercise_id");

-- CreateIndex (missing on legacy schema, but needed for typical queries)
CREATE INDEX "workout_sets_workout_exercise_id_idx" ON "workout_sets"("workout_exercise_id");

-- AddForeignKey
ALTER TABLE "exercise_category_on_exercise" ADD CONSTRAINT "exercise_category_on_exercise_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_category_on_exercise" ADD CONSTRAINT "exercise_category_on_exercise_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "exercise_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_muscles" ADD CONSTRAINT "exercise_muscles_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_muscles" ADD CONSTRAINT "exercise_muscles_muscle_id_fkey" FOREIGN KEY ("muscle_id") REFERENCES "muscles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_equipment" ADD CONSTRAINT "exercise_equipment_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_equipment" ADD CONSTRAINT "exercise_equipment_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_instructions" ADD CONSTRAINT "exercise_instructions_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_media" ADD CONSTRAINT "exercise_media_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
