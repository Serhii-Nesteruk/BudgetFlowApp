import { refreshTokenRequest } from "./authApi";

const API_URL = import.meta.env.VITE_API_URL ?? "";

export async function apiFetch(path, options = {}) {
  return sendApiRequest(path, options, true);
}

async function sendApiRequest(path, options = {}, canRefresh) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { "Content-Type": "application/json; charset=utf-8" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    if (canRefresh && (await refreshAuthToken())) {
      return sendApiRequest(path, options, false);
    }

    clearAuthAndRedirect();
    throw new Error("Сесія закінчилась");
  }

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Помилка запиту");
  }

  if (res.status === 204) {
    return null;
  }

  return await res.json();
}

async function refreshAuthToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) {
    return false;
  }

  try {
    const tokens = await refreshTokenRequest(refreshToken);
    localStorage.setItem("token", tokens.token);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    return true;
  } catch {
    return false;
  }
}

function clearAuthAndRedirect() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  window.location.href = "/login";
}
