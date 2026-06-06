import { apiFetch } from "./apiClient";

export function getDebts() {
  return apiFetch("/debts");
}

export function createDebt(payload) {
  return apiFetch("/debts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDebt(id, payload) {
  return apiFetch(`/debts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteDebt(id) {
  return apiFetch(`/debts/${id}`, { method: "DELETE" });
}

export function addDebtPayment(id, payload) {
  return apiFetch(`/debts/${id}/payments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function markDebtPaid(id) {
  return apiFetch(`/debts/${id}/mark-paid`, { method: "POST" });
}

export function addDebtRecurringCharge(id, payload) {
  return apiFetch(`/debts/${id}/recurring-charge`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
