import prisma from "../index.js";
import type {
  BodyMeasurementResponse,
  CreateBodyMeasurementInput,
  UpdateBodyMeasurementInput,
} from "../../schemas/index.js";

type BodyMeasurement = {
  chestCm: unknown | null;
  createdAt: Date;
  date: Date;
  heightCm: unknown | null;
  hipsCm: unknown | null;
  id: string;
  leftArmCm: unknown | null;
  leftCalfCm: unknown | null;
  leftForearmCm: unknown | null;
  leftThighCm: unknown | null;
  neckCm: unknown | null;
  notes: string | null;
  rightArmCm: unknown | null;
  rightCalfCm: unknown | null;
  rightForearmCm: unknown | null;
  rightThighCm: unknown | null;
  shouldersCm: unknown | null;
  silhouette: "MALE" | "FEMALE";
  updatedAt: Date;
  userId: string;
  waistCm: unknown | null;
  weightKg: unknown | null;
};

const decimalFields = [
  "weightKg",
  "heightCm",
  "chestCm",
  "waistCm",
  "hipsCm",
  "neckCm",
  "shouldersCm",
  "leftArmCm",
  "rightArmCm",
  "leftForearmCm",
  "rightForearmCm",
  "leftThighCm",
  "rightThighCm",
  "leftCalfCm",
  "rightCalfCm",
] as const;

function numberOrNull(value: unknown | null): number | null {
  return value === null ? null : Number(value);
}

function formatBodyMeasurement(
  measurement: BodyMeasurement,
): BodyMeasurementResponse {
  return {
    id: measurement.id,
    userId: measurement.userId,
    date: measurement.date.toISOString(),
    silhouette: measurement.silhouette,
    weightKg: numberOrNull(measurement.weightKg),
    heightCm: numberOrNull(measurement.heightCm),
    chestCm: numberOrNull(measurement.chestCm),
    waistCm: numberOrNull(measurement.waistCm),
    hipsCm: numberOrNull(measurement.hipsCm),
    neckCm: numberOrNull(measurement.neckCm),
    shouldersCm: numberOrNull(measurement.shouldersCm),
    leftArmCm: numberOrNull(measurement.leftArmCm),
    rightArmCm: numberOrNull(measurement.rightArmCm),
    leftForearmCm: numberOrNull(measurement.leftForearmCm),
    rightForearmCm: numberOrNull(measurement.rightForearmCm),
    leftThighCm: numberOrNull(measurement.leftThighCm),
    rightThighCm: numberOrNull(measurement.rightThighCm),
    leftCalfCm: numberOrNull(measurement.leftCalfCm),
    rightCalfCm: numberOrNull(measurement.rightCalfCm),
    notes: measurement.notes,
    createdAt: measurement.createdAt.toISOString(),
    updatedAt: measurement.updatedAt.toISOString(),
  };
}

function measurementData(
  data: CreateBodyMeasurementInput | UpdateBodyMeasurementInput,
) {
  const result: Record<string, unknown> = {};

  if (data.date !== undefined) {
    result.date = new Date(data.date);
  }

  if (data.silhouette !== undefined) {
    result.silhouette = data.silhouette;
  }

  for (const field of decimalFields) {
    if (data[field] !== undefined) {
      result[field] = data[field];
    }
  }

  if (data.notes !== undefined) {
    result.notes = data.notes;
  }

  return result;
}

export async function getBodyMeasurements(
  userId: string,
): Promise<BodyMeasurementResponse[]> {
  const measurements = await prisma.bodyMeasurement.findMany({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return measurements.map(formatBodyMeasurement);
}

export async function getLatestBodyMeasurement(
  userId: string,
): Promise<BodyMeasurementResponse | null> {
  const measurement = await prisma.bodyMeasurement.findFirst({
    where: { userId },
    orderBy: { date: "desc" },
  });

  return measurement ? formatBodyMeasurement(measurement) : null;
}

export async function getBodyMeasurementById(
  id: string,
  userId: string,
): Promise<BodyMeasurementResponse | null> {
  const measurement = await prisma.bodyMeasurement.findFirst({
    where: { id, userId },
  });

  return measurement ? formatBodyMeasurement(measurement) : null;
}

export async function createBodyMeasurement(
  userId: string,
  data: CreateBodyMeasurementInput,
): Promise<BodyMeasurementResponse> {
  const measurement = await prisma.bodyMeasurement.create({
    data: {
      userId,
      date: new Date(data.date),
      ...measurementData(data),
    },
  });

  return formatBodyMeasurement(measurement);
}

export async function updateBodyMeasurement(
  id: string,
  userId: string,
  data: UpdateBodyMeasurementInput,
): Promise<BodyMeasurementResponse | null> {
  const existing = await prisma.bodyMeasurement.findFirst({
    where: { id, userId },
  });
  if (!existing) return null;

  const measurement = await prisma.bodyMeasurement.update({
    where: { id },
    data: measurementData(data),
  });

  return formatBodyMeasurement(measurement);
}

export async function deleteBodyMeasurement(
  id: string,
  userId: string,
): Promise<boolean> {
  const existing = await prisma.bodyMeasurement.findFirst({
    where: { id, userId },
  });
  if (!existing) return false;

  await prisma.bodyMeasurement.delete({ where: { id } });
  return true;
}
