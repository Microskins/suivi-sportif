// Mise en forme des dates d'un voyage (dates ISO AAAA-MM-JJ, facultatives).

const parse = (isoDate: string) => new Date(`${isoDate}T00:00:00Z`);

const day = (date: Date) => date.getUTCDate();
const month = (date: Date, style: "long" | "short") =>
  date.toLocaleDateString("fr-FR", { month: style, timeZone: "UTC" });

// "19—27 octobre 2026", "28 sept.—3 oct. 2026", ou null sans dates.
export function formatTripDates(
  startDate: string | null,
  endDate: string | null,
) {
  if (!startDate) {
    return null;
  }
  const start = parse(startDate);
  const year = start.getUTCFullYear();
  if (!endDate || endDate === startDate) {
    return `${day(start)} ${month(start, "long")} ${year}`;
  }
  const end = parse(endDate);
  if (start.getUTCFullYear() !== end.getUTCFullYear()) {
    return `${day(start)} ${month(start, "short")} ${year}—${day(end)} ${month(end, "short")} ${end.getUTCFullYear()}`;
  }
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${day(start)}—${day(end)} ${month(end, "long")} ${year}`;
  }
  return `${day(start)} ${month(start, "short")}—${day(end)} ${month(end, "short")} ${year}`;
}

// Nombre de jours, bornes incluses.
export function tripDays(startDate: string | null, endDate: string | null) {
  if (!startDate || !endDate) {
    return null;
  }
  return (
    Math.round(
      (parse(endDate).getTime() - parse(startDate).getTime()) / 86400000,
    ) + 1
  );
}

// "Oct. 2026"
export function tripPeriod(startDate: string | null) {
  if (!startDate) {
    return null;
  }
  const label = parse(startDate).toLocaleDateString("fr-FR", {
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
  return label.charAt(0).toUpperCase() + label.slice(1);
}
