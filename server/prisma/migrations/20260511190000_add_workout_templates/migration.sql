-- CreateTable
CREATE TABLE "workout_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "level" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "description" TEXT,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workout_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_template_exercises" (
    "id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "duration_seconds" INTEGER,
    "rest" INTEGER NOT NULL DEFAULT 60,
    "weight" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "workout_template_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workout_templates_name_key" ON "workout_templates"("name");

-- CreateIndex
CREATE INDEX "workout_templates_display_order_idx" ON "workout_templates"("display_order");

-- CreateIndex
CREATE INDEX "workout_templates_category_idx" ON "workout_templates"("category");

-- CreateIndex
CREATE UNIQUE INDEX "workout_template_exercises_template_id_exercise_id_key" ON "workout_template_exercises"("template_id", "exercise_id");

-- CreateIndex
CREATE INDEX "workout_template_exercises_exercise_id_idx" ON "workout_template_exercises"("exercise_id");

-- AddForeignKey
ALTER TABLE "workout_template_exercises" ADD CONSTRAINT "workout_template_exercises_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "workout_templates"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_template_exercises" ADD CONSTRAINT "workout_template_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
