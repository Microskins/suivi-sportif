import { apiRequest } from "./api.js";

type DomainToolInput = {
  jwtToken: string;
};

type WithId = DomainToolInput & {
  id: string;
};

export async function listFoods({ jwtToken }: DomainToolInput) {
  return apiRequest({ jwtToken, path: "/api/foods" });
}

export async function getProfile({ jwtToken }: DomainToolInput) {
  return apiRequest({ jwtToken, path: "/api/users/me" });
}

export async function updateProfile({
  jwtToken,
  ...body
}: DomainToolInput & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "PUT",
    path: "/api/users/me",
  });
}

export async function listExercises({ jwtToken }: DomainToolInput) {
  return apiRequest({ jwtToken, path: "/api/exercises" });
}

export async function createFood({
  jwtToken,
  ...body
}: DomainToolInput & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "POST",
    path: "/api/foods",
  });
}

export async function updateFood({
  id,
  jwtToken,
  ...body
}: WithId & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "PUT",
    path: `/api/foods/${id}`,
  });
}

export async function deleteFood({ id, jwtToken }: WithId) {
  return apiRequest({
    jwtToken,
    method: "DELETE",
    path: `/api/foods/${id}`,
  });
}

export async function listMeals({ jwtToken }: DomainToolInput) {
  return apiRequest({ jwtToken, path: "/api/meals" });
}

export async function createMeal({
  jwtToken,
  ...body
}: DomainToolInput & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "POST",
    path: "/api/meals",
  });
}

export async function updateMeal({
  id,
  jwtToken,
  ...body
}: WithId & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "PUT",
    path: `/api/meals/${id}`,
  });
}

export async function deleteMeal({ id, jwtToken }: WithId) {
  return apiRequest({
    jwtToken,
    method: "DELETE",
    path: `/api/meals/${id}`,
  });
}

export async function listNutritionGoals({ jwtToken }: DomainToolInput) {
  return apiRequest({ jwtToken, path: "/api/nutrition-goals" });
}

export async function getActiveNutritionGoal({ jwtToken }: DomainToolInput) {
  return apiRequest({ jwtToken, path: "/api/nutrition-goals/active" });
}

export async function createNutritionGoal({
  jwtToken,
  ...body
}: DomainToolInput & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "POST",
    path: "/api/nutrition-goals",
  });
}

export async function updateNutritionGoal({
  id,
  jwtToken,
  ...body
}: WithId & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "PUT",
    path: `/api/nutrition-goals/${id}`,
  });
}

export async function deleteNutritionGoal({ id, jwtToken }: WithId) {
  return apiRequest({
    jwtToken,
    method: "DELETE",
    path: `/api/nutrition-goals/${id}`,
  });
}

export async function listWorkouts({ jwtToken }: DomainToolInput) {
  return apiRequest({ jwtToken, path: "/api/workouts" });
}

export async function createWorkout({
  jwtToken,
  ...body
}: DomainToolInput & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "POST",
    path: "/api/workouts",
  });
}

export async function updateWorkout({
  id,
  jwtToken,
  ...body
}: WithId & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "PUT",
    path: `/api/workouts/${id}`,
  });
}

export async function deleteWorkout({ id, jwtToken }: WithId) {
  return apiRequest({
    jwtToken,
    method: "DELETE",
    path: `/api/workouts/${id}`,
  });
}

export async function listUserGoals({ jwtToken }: DomainToolInput) {
  return apiRequest({ jwtToken, path: "/api/user-goals" });
}

export async function createUserGoal({
  jwtToken,
  ...body
}: DomainToolInput & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "POST",
    path: "/api/user-goals",
  });
}

export async function updateUserGoal({
  id,
  jwtToken,
  ...body
}: WithId & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "PUT",
    path: `/api/user-goals/${id}`,
  });
}

export async function deleteUserGoal({ id, jwtToken }: WithId) {
  return apiRequest({
    jwtToken,
    method: "DELETE",
    path: `/api/user-goals/${id}`,
  });
}

export async function listBodyMeasurements({ jwtToken }: DomainToolInput) {
  return apiRequest({ jwtToken, path: "/api/body-measurements" });
}

export async function getLatestBodyMeasurement({ jwtToken }: DomainToolInput) {
  return apiRequest({ jwtToken, path: "/api/body-measurements/latest" });
}

export async function createBodyMeasurement({
  jwtToken,
  ...body
}: DomainToolInput & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "POST",
    path: "/api/body-measurements",
  });
}

export async function updateBodyMeasurement({
  id,
  jwtToken,
  ...body
}: WithId & Record<string, unknown>) {
  return apiRequest({
    body,
    jwtToken,
    method: "PUT",
    path: `/api/body-measurements/${id}`,
  });
}

export async function deleteBodyMeasurement({ id, jwtToken }: WithId) {
  return apiRequest({
    jwtToken,
    method: "DELETE",
    path: `/api/body-measurements/${id}`,
  });
}
