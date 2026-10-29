-- Mode de transport des trajets d'un voyage (avion ou voiture), avion par
-- defaut: les trajets existants restent des vols.

-- CreateEnum
CREATE TYPE "TravelMode" AS ENUM ('AVION', 'VOITURE');

-- AlterTable
ALTER TABLE "trip_flights" ADD COLUMN     "mode" "TravelMode" NOT NULL DEFAULT 'AVION';
