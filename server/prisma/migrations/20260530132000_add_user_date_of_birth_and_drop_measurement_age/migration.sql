ALTER TABLE "users"
ADD COLUMN "date_of_birth" TIMESTAMP(3);

ALTER TABLE "body_measurements"
DROP COLUMN IF EXISTS "age_years";
