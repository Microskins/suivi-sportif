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
