import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./App";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./auth/ProtectedRoute";

import "./styles/globals.css";
import { applyStoredFontSize } from "./utils/fontSize";
import { applyStoredTheme, watchSystemTheme } from "./utils/theme";
import { applyLanguage, getInitialLanguage, startDomTranslator } from "./i18n/language";

applyStoredFontSize();
applyStoredTheme();
watchSystemTheme();
applyLanguage(getInitialLanguage());
startDomTranslator();

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <App />
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
