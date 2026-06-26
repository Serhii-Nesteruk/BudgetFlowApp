const API_URL = import.meta.env.VITE_API_URL ?? "";

export async function loginRequest(email, password) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Неправильний email або пароль");
  }

  const data = await res.json();

  return normalizeAuthResponse(data);
}

export async function telegramWebAppLoginRequest(initData) {
  const res = await fetch(`${API_URL}/auth/telegram-webapp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ initData }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Telegram-акаунт не підключено");
  }

  return normalizeAuthResponse(await res.json());
}

export async function refreshTokenRequest(refreshToken) {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Сесія закінчилась");
  }

  return normalizeAuthResponse(await res.json());
}

export async function logoutRequest(refreshToken) {
  if (!refreshToken) return;

  await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });
}

export async function registerRequest(name, email, password, language) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password, language }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Помилка реєстрації");
  }

  return await res.json();
}

function normalizeAuthResponse(data) {
  return {
    token: data.token ?? data.Token,
    refreshToken: data.refreshToken ?? data.RefreshToken,
  };
}
