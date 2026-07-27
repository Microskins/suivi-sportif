import type { BodyMeasurement } from "../../api/client";
import type { BodyMeasurementField, BodySilhouette } from "./body-measurements";

export function measurementValue(
  measurement: BodyMeasurement,
  key: BodyMeasurementField,
  unit: string,
) {
  const value = measurement[key];
  return value === null ? "-" : `${value} ${unit}`;
}

export function formatComputedValue(value: number | null, decimals = 1) {
  if (value === null || Number.isNaN(value) || !Number.isFinite(value)) return "-";
  return value.toFixed(decimals);
}

export function computeBmi(measurement: BodyMeasurement): number | null {
  if (!measurement.weightKg || !measurement.heightCm || measurement.heightCm <= 0) {
    return null;
  }
  const heightM = measurement.heightCm / 100;
  return measurement.weightKg / (heightM * heightM);
}

function toInches(valueCm: number) {
  return valueCm / 2.54;
}

export function computeUsNavyBodyFat(measurement: BodyMeasurement): number | null {
  if (!measurement.heightCm || !measurement.neckCm || !measurement.waistCm) {
    return null;
  }

  const heightIn = toInches(measurement.heightCm);
  const neckIn = toInches(measurement.neckCm);
  const waistIn = toInches(measurement.waistCm);

  if (
    measurement.silhouette === "FEMALE" &&
    measurement.hipsCm !== null &&
    measurement.hipsCm !== undefined
  ) {
    const hipsIn = toInches(measurement.hipsCm);
    const logArg = waistIn + hipsIn - neckIn;
    if (logArg <= 0 || heightIn <= 0) return null;
    const result =
      163.205 * Math.log10(logArg) - 97.684 * Math.log10(heightIn) - 78.387;
    return result > 0 ? result : null;
  }

  const logArg = waistIn - neckIn;
  if (logArg <= 0 || heightIn <= 0) return null;
  const result =
    86.01 * Math.log10(logArg) - 70.041 * Math.log10(heightIn) + 36.76;
  return result > 0 ? result : null;
}

export function computeAgeFromDateOfBirth(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null;
  const birthDate = new Date(dateOfBirth);
  if (Number.isNaN(birthDate.getTime())) return null;

  const now = new Date();
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const monthDelta = now.getUTCMonth() - birthDate.getUTCMonth();
  const dayDelta = now.getUTCDate() - birthDate.getUTCDate();
  if (monthDelta < 0 || (monthDelta === 0 && dayDelta < 0)) {
    age -= 1;
  }
  return age > 0 ? age : null;
}

export function computeMifflinBmr(
  measurement: BodyMeasurement,
  ageYears: number | null,
): number | null {
  if (
    !measurement.weightKg ||
    !measurement.heightCm ||
    !ageYears ||
    measurement.weightKg <= 0 ||
    measurement.heightCm <= 0 ||
    ageYears <= 0
  ) {
    return null;
  }

  const base =
    10 * measurement.weightKg +
    6.25 * measurement.heightCm -
    5 * ageYears;
  return measurement.silhouette === "FEMALE" ? base - 161 : base + 5;
}

export function computeDailyEnergyExpenditure(
  measurement: BodyMeasurement,
  ageYears: number | null,
): number | null {
  const bmr = computeMifflinBmr(measurement, ageYears);
  if (bmr === null) return null;
  const multiplier = measurement.isActiveLifestyle ? 1.55 : 1.2;
  return bmr * multiplier;
}

export function roundOne(value: number) {
  return Math.round(value * 10) / 10;
}

export function classifyBmi(value: number | null) {
  if (value === null) return { label: "Non calcule", detail: "Poids et taille requis." };
  if (value < 18.5) return { label: "Bas", detail: "En dessous de la zone usuelle." };
  if (value < 25) return { label: "Zone standard", detail: "Dans la zone de reference adulte." };
  if (value < 30) return { label: "Eleve", detail: "Au-dessus de la zone standard." };
  return { label: "Tres eleve", detail: "A surveiller avec d'autres indicateurs." };
}

export function classifyBodyFat(value: number | null, silhouette: BodySilhouette) {
  if (value === null) return { label: "Non calculee", detail: "Taille, cou, taille abdominale et parfois hanches requis." };
  const standardMax = silhouette === "FEMALE" ? 31 : 24;
  const athleticMax = silhouette === "FEMALE" ? 24 : 17;
  if (value <= athleticMax) return { label: "Athletique", detail: "Estimation basse a moderee." };
  if (value <= standardMax) return { label: "Moderee", detail: "Estimation dans une zone courante." };
  return { label: "Elevee", detail: "A lire avec les mensurations et l'evolution." };
}

export function calorieGuidance(tdee: number | null) {
  if (tdee === null) {
    return {
      maintenance: "-",
      deficit: "-",
      surplus: "-",
      detail: "Age, poids et taille requis pour estimer une base.",
    };
  }

  return {
    maintenance: `${Math.round(tdee)} kcal`,
    deficit: `${Math.round(tdee - 300)} kcal`,
    surplus: `${Math.round(tdee + 250)} kcal`,
    detail: "Estimations indicatives, a ajuster avec l'evolution reelle.",
  };
}
