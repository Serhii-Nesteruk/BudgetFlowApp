import { apiFetch } from "./apiClient";

export const getBudgets = () => apiFetch("/budgets");
export const getBudget = (id) => apiFetch(`/budgets/${id}`);
export const getSharedBudget = (token) => apiFetch(`/budgets/shared/${token}`);

export const createBudget = (payload) => apiFetch("/budgets", {
  method: "POST",
  body: JSON.stringify(payload),
});
export const updateBudget = (id, payload) => apiFetch(`/budgets/${id}`, {
  method: "PUT",
  body: JSON.stringify(payload),
});
export const deleteBudget = (id) => apiFetch(`/budgets/${id}`, { method: "DELETE" });

const child = (id, segment, payload) => apiFetch(`/budgets/${id}/${segment}`, {
  method: "POST",
  body: JSON.stringify(payload),
});

export const addBudgetCategory = (id, payload) => child(id, "categories", payload);
export const updateBudgetCategory = (id, categoryId, payload) => apiFetch(`/budgets/${id}/categories/${categoryId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteBudgetCategory = (id, categoryId) => apiFetch(`/budgets/${id}/categories/${categoryId}`, { method: "DELETE" });

export const addBudgetIncomeSource = (id, payload) => child(id, "income-sources", payload);
export const updateBudgetIncomeSource = (id, itemId, payload) => apiFetch(`/budgets/${id}/income-sources/${itemId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteBudgetIncomeSource = (id, itemId) => apiFetch(`/budgets/${id}/income-sources/${itemId}`, { method: "DELETE" });

export const addBudgetMandatoryExpense = (id, payload) => child(id, "mandatory-expenses", payload);
export const updateBudgetMandatoryExpense = (id, itemId, payload) => apiFetch(`/budgets/${id}/mandatory-expenses/${itemId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteBudgetMandatoryExpense = (id, itemId) => apiFetch(`/budgets/${id}/mandatory-expenses/${itemId}`, { method: "DELETE" });

export const addBudgetPlannedExpense = (id, payload) => child(id, "planned-expenses", payload);
export const updateBudgetPlannedExpense = (id, itemId, payload) => apiFetch(`/budgets/${id}/planned-expenses/${itemId}`, { method: "PUT", body: JSON.stringify(payload) });
export const deleteBudgetPlannedExpense = (id, itemId) => apiFetch(`/budgets/${id}/planned-expenses/${itemId}`, { method: "DELETE" });

export const shareBudgetWithUser = (id, email) => apiFetch(`/budgets/${id}/shared-users`, {
  method: "POST",
  body: JSON.stringify({ email }),
});
export const removeSharedBudgetUser = (id, userId) => apiFetch(`/budgets/${id}/shared-users/${userId}`, { method: "DELETE" });
export const setBudgetSharing = (id, enabled, regenerateToken = false) => apiFetch(`/budgets/${id}/sharing?enabled=${enabled}&regenerateToken=${regenerateToken}`, { method: "POST" });

export const planBudgetNextMonths = (id, months) => apiFetch(`/budgets/${id}/plan-next-months`, {
  method: "POST",
  body: JSON.stringify({ months }),
});
