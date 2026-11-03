-- Albums photo d'etape: plusieurs par etape, chacun eventuellement lie a une
-- randonnee. Remplace le rattachement direct photo -> trace de la migration
-- precedente: chaque trace qui avait des photos devient un album a son nom,
-- lie a elle, avec les memes photos et la meme photo de reference.

-- CreateTable
CREATE TABLE "trip_albums" (
    "id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "track_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_albums_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "trip_photos" ADD COLUMN     "album_id" TEXT,
ADD COLUMN     "is_album_cover" BOOLEAN NOT NULL DEFAULT false;

-- Reprise des albums de randonnee existants (id uuid derive de la trace).
INSERT INTO "trip_albums" ("id", "stage_id", "position", "name", "track_id")
SELECT md5('album-' || t."id")::uuid::text, t."stage_id",
       ROW_NUMBER() OVER (PARTITION BY t."stage_id" ORDER BY t."created_at") - 1,
       t."name", t."id"
FROM "trip_tracks" t
WHERE EXISTS (SELECT 1 FROM "trip_photos" p WHERE p."track_id" = t."id");

UPDATE "trip_photos"
SET "album_id" = md5('album-' || "track_id")::uuid::text,
    "is_album_cover" = "is_track_cover"
WHERE "track_id" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "trip_photos" DROP CONSTRAINT "trip_photos_track_id_fkey";

-- DropIndex
DROP INDEX "trip_photos_track_id_idx";

-- AlterTable
ALTER TABLE "trip_photos" DROP COLUMN "is_track_cover",
DROP COLUMN "track_id";

-- CreateIndex
CREATE INDEX "trip_albums_stage_id_idx" ON "trip_albums"("stage_id");

-- CreateIndex
CREATE INDEX "trip_albums_track_id_idx" ON "trip_albums"("track_id");

-- CreateIndex
CREATE INDEX "trip_photos_album_id_idx" ON "trip_photos"("album_id");

-- AddForeignKey
ALTER TABLE "trip_photos" ADD CONSTRAINT "trip_photos_album_id_fkey" FOREIGN KEY ("album_id") REFERENCES "trip_albums"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_albums" ADD CONSTRAINT "trip_albums_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "trip_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_albums" ADD CONSTRAINT "trip_albums_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "trip_tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;
