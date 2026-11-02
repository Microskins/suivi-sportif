-- Repas (restaurants, pubs...) de chaque etape, facultatifs: points de la carte.

-- AlterTable
ALTER TABLE "trip_stages" ADD COLUMN     "meals" JSONB NOT NULL DEFAULT '[]';
