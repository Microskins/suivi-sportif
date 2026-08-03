import type {
  UserGoalDirection,
  UserGoalDomain,
  UserGoalMetric,
} from "../../api/client";

export const userGoalDomainOptions: Array<[UserGoalDomain, string]> = [
  ["SPORT", "Sport"],
  ["BODY", "Corps"],
];

export const userGoalDirectionOptions: Array<[UserGoalDirection, string]> = [
  ["AT_MOST", "Au plus"],
  ["AT_LEAST", "Au moins"],
  ["EXACT", "Exactement"],
];

export const userGoalMetricOptions: Array<{
  value: UserGoalMetric;
  label: string;
  domain: UserGoalDomain;
  unit: string;
  defaultDirection: UserGoalDirection;
}> = [
  {
    value: "SPORT_WORKOUTS_PER_WEEK",
    label: "Séances par semaine",
    domain: "SPORT",
    unit: "séance(s)",
    defaultDirection: "AT_LEAST",
  },
  {
    value: "SPORT_MINUTES_PER_WEEK",
    label: "Minutes par semaine",
    domain: "SPORT",
    unit: "min",
    defaultDirection: "AT_LEAST",
  },
  {
    value: "SPORT_EXERCISE_ONE_REP_MAX_KG",
    label: "1RM estime",
    domain: "SPORT",
    unit: "kg",
    defaultDirection: "AT_LEAST",
  },
  {
    value: "SPORT_EXERCISE_TEN_REP_MAX_KG",
    label: "10RM",
    domain: "SPORT",
    unit: "kg",
    defaultDirection: "AT_LEAST",
  },
  {
    value: "SPORT_EXERCISE_MAX_REPS",
    label: "Max reps",
    domain: "SPORT",
    unit: "rep(s)",
    defaultDirection: "AT_LEAST",
  },
  {
    value: "BODY_WEIGHT_KG",
    label: "Poids",
    domain: "BODY",
    unit: "kg",
    defaultDirection: "AT_MOST",
  },
  {
    value: "BODY_BMI",
    label: "IMC",
    domain: "BODY",
    unit: "",
    defaultDirection: "AT_MOST",
  },
  {
    value: "BODY_FAT_PERCENT",
    label: "Masse grasse",
    domain: "BODY",
    unit: "%",
    defaultDirection: "AT_MOST",
  },
];
