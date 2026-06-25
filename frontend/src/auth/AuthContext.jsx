import { createContext, useState } from "react";
import { loginRequest, logoutRequest } from "../api/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

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
        isLoggedIn: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
