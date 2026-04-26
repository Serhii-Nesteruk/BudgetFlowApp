const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5091";

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
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