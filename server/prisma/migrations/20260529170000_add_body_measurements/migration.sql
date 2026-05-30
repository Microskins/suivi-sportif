-- Add body measurements history
CREATE TYPE "BodySilhouette" AS ENUM ('MALE', 'FEMALE');

CREATE TABLE "body_measurements" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "silhouette" "BodySilhouette" NOT NULL DEFAULT 'MALE',
    "weight_kg" DECIMAL(10,2),
    "height_cm" DECIMAL(10,2),
    "chest_cm" DECIMAL(10,2),
    "waist_cm" DECIMAL(10,2),
    "hips_cm" DECIMAL(10,2),
    "neck_cm" DECIMAL(10,2),
    "shoulders_cm" DECIMAL(10,2),
    "left_arm_cm" DECIMAL(10,2),
    "right_arm_cm" DECIMAL(10,2),
    "left_forearm_cm" DECIMAL(10,2),
    "right_forearm_cm" DECIMAL(10,2),
    "left_thigh_cm" DECIMAL(10,2),
    "right_thigh_cm" DECIMAL(10,2),
    "left_calf_cm" DECIMAL(10,2),
    "right_calf_cm" DECIMAL(10,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "body_measurements_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "body_measurements_user_id_date_idx" ON "body_measurements"("user_id", "date");

ALTER TABLE "body_measurements"
ADD CONSTRAINT "body_measurements_user_id_fkey"
FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
