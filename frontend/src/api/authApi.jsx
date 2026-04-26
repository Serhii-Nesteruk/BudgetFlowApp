const API_URL = "http://localhost:5091";

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

  return data.token ?? data.Token;
}

export async function registerRequest(name, email, password) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });

  if (!res.ok) {
    const message = await res.text();
    throw new Error(message || "Помилка реєстрації");
  }

  return await res.json();
}