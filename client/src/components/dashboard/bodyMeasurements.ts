import type { BodyMeasurement } from "../../api/client";

export const bodyMeasurementFields = [
  ["weightKg", "Poids", "kg"],
  ["heightCm", "Taille", "cm"],
  ["chestCm", "Poitrine", "cm"],
  ["waistCm", "Taille abdominale", "cm"],
  ["hipsCm", "Hanches", "cm"],
  ["neckCm", "Cou", "cm"],
  ["shouldersCm", "Epaules", "cm"],
  ["leftArmCm", "Bras gauche", "cm"],
  ["rightArmCm", "Bras droit", "cm"],
  ["leftForearmCm", "Avant-bras gauche", "cm"],
  ["rightForearmCm", "Avant-bras droit", "cm"],
  ["leftThighCm", "Cuisse gauche", "cm"],
  ["rightThighCm", "Cuisse droite", "cm"],
  ["leftCalfCm", "Mollet gauche", "cm"],
  ["rightCalfCm", "Mollet droit", "cm"],
] as const;

export type BodyMeasurementField = (typeof bodyMeasurementFields)[number][0];
export type BodySilhouette = BodyMeasurement["silhouette"];

export const bodySilhouetteOptions: Array<[BodySilhouette, string]> = [
  ["MALE", "Homme"],
  ["FEMALE", "Femme"],
];
