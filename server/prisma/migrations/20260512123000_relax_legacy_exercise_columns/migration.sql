-- Legacy compatibility fix:
-- old columns are still present in some prod DBs and can block inserts from current Prisma model.
ALTER TABLE "exercises"
  ALTER COLUMN "muscle_group" DROP NOT NULL;

ALTER TABLE "exercises"
  ALTER COLUMN "equipment" DROP NOT NULL;
