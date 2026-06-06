import { apiFetch } from "./apiClient";

export function getSavingsGoals() {
  return apiFetch("/savings-goals");
}

export function createSavingsGoal(payload) {
  return apiFetch("/savings-goals", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSavingsGoal(id, payload) {
  return apiFetch(`/savings-goals/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteSavingsGoal(id) {
  return apiFetch(`/savings-goals/${id}`, {
    method: "DELETE",
  });
}

export function addSavingsEntry(goalId, payload) {
  return apiFetch(`/savings-goals/${goalId}/entries`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteSavingsEntry(goalId, entryId) {
  return apiFetch(`/savings-goals/${goalId}/entries/${entryId}`, {
    method: "DELETE",
  });
}
