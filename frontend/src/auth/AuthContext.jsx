import { createContext, useEffect, useState } from "react";
import { loginRequest, logoutRequest, telegramWebAppLoginRequest } from "../api/authApi";

export const AuthContext = createContext(null);

function getTelegramWebApp() {
  return window.Telegram?.WebApp ?? null;
}

function prepareTelegramWebApp(telegram) {
  try {
    telegram.ready?.();
    telegram.expand?.();
  } catch {
    // Telegram clients can differ; auth should continue even if UI hooks fail.
  }
}

function waitForTelegramWebAppInitData(timeoutMs = 10000) {
  return new Promise((resolve) => {
    const startedAt = Date.now();

    const check = () => {
      const telegram = getTelegramWebApp();
      if (telegram?.initData || Date.now() - startedAt >= timeoutMs) {
        resolve(telegram);
        return;
      }

      window.setTimeout(check, 100);
    };

    check();
  });
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [initializing, setInitializing] = useState(() => {
    const telegram = getTelegramWebApp();
    return !localStorage.getItem("token") && !!telegram;
  });

  useEffect(() => {
    if (token) {
      setInitializing(false);
      return;
    }

    let cancelled = false;
    async function loginWithTelegram() {
      try {
        const telegram = await waitForTelegramWebAppInitData();
        if (cancelled) return;

        if (!telegram?.initData) {
          setInitializing(false);
          return;
        }

        prepareTelegramWebApp(telegram);
        const tokens = await telegramWebAppLoginRequest(telegram.initData);
        if (cancelled) return;
        localStorage.setItem("token", tokens.token);
        localStorage.setItem("refreshToken", tokens.refreshToken);
        setToken(tokens.token);
      } catch (error) {
        console.error("Telegram autologin failed", error);
        if (!cancelled) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
        }
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    loginWithTelegram();

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function login(email, password) {
    const tokens = await loginRequest(email, password);

    localStorage.setItem("token", tokens.token);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    setToken(tokens.token);
  }

  async function logout() {
    const refreshToken = localStorage.getItem("refreshToken");

    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);

    try {
      await logoutRequest(refreshToken);
    } catch {
      // Local logout should still succeed if the server is unavailable.
    }
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        login,
        logout,
        initializing,
        isLoggedIn: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
