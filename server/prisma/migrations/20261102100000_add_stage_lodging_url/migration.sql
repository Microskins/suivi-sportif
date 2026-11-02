-- Lien du logement (Airbnb...) ou l'on a dormi a chaque etape, facultatif.

-- AlterTable
ALTER TABLE "trip_stages" ADD COLUMN     "lodging_url" TEXT;
