-- Voyages: aeroports, voyages, vols, etapes, traces GPS et photos.
-- Le statut realise / a venir n'est pas stocke: il se deduit des dates.

-- CreateEnum
CREATE TYPE "TripTrackKind" AS ENUM ('TRAJET', 'RANDONNEE');

-- CreateTable
CREATE TABLE "airports" (
    "code" VARCHAR(3) NOT NULL,
    "city" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "airports_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "trips" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stub_label" TEXT NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "trips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_flights" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "from_code" VARCHAR(3) NOT NULL,
    "to_code" VARCHAR(3) NOT NULL,

    CONSTRAINT "trip_flights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_stages" (
    "id" TEXT NOT NULL,
    "trip_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "code" VARCHAR(4) NOT NULL,
    "day_label" TEXT NOT NULL,
    "date_label" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "highlights" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "route" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "trip_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_tracks" (
    "id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "kind" "TripTrackKind" NOT NULL,
    "name" TEXT NOT NULL,
    "file_name" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trip_photos" (
    "id" TEXT NOT NULL,
    "stage_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "file_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "byte_size" INTEGER NOT NULL,
    "alt" TEXT NOT NULL,
    "caption" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "trip_photos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "trips_slug_key" ON "trips"("slug");

-- CreateIndex
CREATE INDEX "trips_user_id_idx" ON "trips"("user_id");

-- CreateIndex
CREATE INDEX "trips_published_idx" ON "trips"("published");

-- CreateIndex
CREATE UNIQUE INDEX "trip_flights_trip_id_position_key" ON "trip_flights"("trip_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "trip_stages_trip_id_position_key" ON "trip_stages"("trip_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "trip_tracks_file_name_key" ON "trip_tracks"("file_name");

-- CreateIndex
CREATE INDEX "trip_tracks_stage_id_idx" ON "trip_tracks"("stage_id");

-- CreateIndex
CREATE UNIQUE INDEX "trip_photos_file_name_key" ON "trip_photos"("file_name");

-- CreateIndex
CREATE INDEX "trip_photos_stage_id_idx" ON "trip_photos"("stage_id");

-- AddForeignKey
ALTER TABLE "trips" ADD CONSTRAINT "trips_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_flights" ADD CONSTRAINT "trip_flights_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_flights" ADD CONSTRAINT "trip_flights_from_code_fkey" FOREIGN KEY ("from_code") REFERENCES "airports"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_flights" ADD CONSTRAINT "trip_flights_to_code_fkey" FOREIGN KEY ("to_code") REFERENCES "airports"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_stages" ADD CONSTRAINT "trip_stages_trip_id_fkey" FOREIGN KEY ("trip_id") REFERENCES "trips"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_tracks" ADD CONSTRAINT "trip_tracks_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "trip_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trip_photos" ADD CONSTRAINT "trip_photos_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "trip_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

