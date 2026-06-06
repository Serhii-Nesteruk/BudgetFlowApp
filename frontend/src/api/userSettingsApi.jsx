import { apiFetch } from "./apiClient";

export function getUserSettings() {
  return apiFetch("/users/settings");
}

export function updateUserSettings(payload) {
  return apiFetch("/users/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function generateTelegramConnectionCode() {
  return apiFetch("/users/settings/telegram/connection-code", { method: "POST" });
}

export function deleteTelegramAccount(id) {
  return apiFetch(`/users/settings/telegram/accounts/${id}`, { method: "DELETE" });
}

export function verifyTelegramConnectionCode(payload) {
  return apiFetch("/users/settings/telegram/verify", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
