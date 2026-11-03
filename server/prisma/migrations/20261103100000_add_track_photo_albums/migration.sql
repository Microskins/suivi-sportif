-- Album photo des randonnees: une photo d'etape peut etre rattachee a une
-- trace de la meme etape, et marquee photo de reference (bulle de la carte).

-- AlterTable
ALTER TABLE "trip_photos" ADD COLUMN     "is_track_cover" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "track_id" TEXT;

-- CreateIndex
CREATE INDEX "trip_photos_track_id_idx" ON "trip_photos"("track_id");

-- AddForeignKey
ALTER TABLE "trip_photos" ADD CONSTRAINT "trip_photos_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "trip_tracks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

