import { apiFetch } from "./apiClient";

export function getGroupedTransactions() {
  return apiFetch("/transactions/grouped");
}

export function createTransaction(payload) {
  return apiFetch("/transactions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateTransaction(id, payload) {
  return apiFetch(`/transactions/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteTransaction(id) {
  return apiFetch(`/transactions/${id}`, {
    method: "DELETE",
  });
}
