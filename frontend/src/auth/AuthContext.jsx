import { createContext, useState } from "react";
import { loginRequest } from "../api/authApi";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  async function login(email, password) {
    const jwt = await loginRequest(email, password);

    localStorage.setItem("token", jwt);
    setToken(jwt);
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
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