// Reprise des voyages du site Voyage en base (aeroports, voyages, vols, etapes).
//
//   npm run db:seed:voyages -w server
//
// Ecrit en .mjs pour tourner tel quel dans le conteneur de production, comme
// prod-seed.mjs. Relancable sans risque:
// - les aeroports sont crees ou mis a jour;
// - un voyage dont le slug existe deja n'est pas touche: les modifications
//   faites depuis l'ecran d'admin ne sont jamais ecrasees.
// Les voyages sont rattaches au premier compte de VOYAGE_ADMIN_EMAILS, qui
// doit deja exister (inscription sur le site).
import { readFile } from "node:fs/promises";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const data = JSON.parse(
    await readFile(new URL("./voyages-seed.json", import.meta.url), "utf8"),
  );

  const adminEmail = (process.env.VOYAGE_ADMIN_EMAILS ?? "").split(",")[0].trim();
  if (!adminEmail) {
    throw new Error("VOYAGE_ADMIN_EMAILS est vide: impossible de choisir le proprietaire.");
  }
  const owner = await prisma.user.findFirst({
    where: { email: { equals: adminEmail, mode: "insensitive" } },
    select: { id: true },
  });
  if (!owner) {
    throw new Error(`Aucun compte ${adminEmail}: inscrivez-vous d'abord sur le site.`);
  }

  for (const airport of data.airports) {
    await prisma.airport.upsert({
      where: { code: airport.code },
      create: airport,
      update: airport,
    });
  }

  for (const trip of data.trips) {
    const existing = await prisma.trip.findUnique({ where: { slug: trip.slug } });
    if (existing) {
      console.log(`= ${trip.slug} existe deja, laisse intact`);
      continue;
    }
    await prisma.trip.create({
      data: {
        userId: owner.id,
        slug: trip.slug,
        title: trip.title,
        country: trip.country,
        description: trip.description,
        stubLabel: trip.stubLabel,
        startDate: trip.startDate ? new Date(trip.startDate) : null,
        endDate: trip.endDate ? new Date(trip.endDate) : null,
        published: trip.published,
        flights: {
          create: trip.flights.map((flight, position) => ({ position, ...flight })),
        },
        stages: {
          create: trip.stages.map((stage, position) => ({
            position,
            code: stage.code,
            dayLabel: stage.dayLabel,
            dateLabel: stage.dateLabel,
            title: stage.title,
            detail: stage.detail,
            highlights: stage.highlights,
            longitude: stage.coordinates[0],
            latitude: stage.coordinates[1],
            route: stage.route,
          })),
        },
      },
    });
    console.log(`+ ${trip.slug} cree`);
  }
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
