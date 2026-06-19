export const THEME_OPTIONS = [
  { value: "system", label: "Як у системі", hint: "Автоматично підлаштовується під пристрій" },
  { value: "light", label: "Світла", hint: "Поточна світла палітра" },
  { value: "dark", label: "Темна", hint: "М'який темний інтерфейс" },
];

const STORAGE_KEY = "budgetflow-ui-theme";
const THEMES = ["system", "light", "dark"];
const DARK_MEDIA = "(prefers-color-scheme: dark)";

export function normalizeTheme(value) {
  return THEMES.includes(value) ? value : "system";
}

export function getStoredTheme() {
  if (typeof window === "undefined") return "system";
  return normalizeTheme(window.localStorage.getItem(STORAGE_KEY));
}

function resolveTheme(theme) {
  if (theme !== "system") return theme;
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.(DARK_MEDIA).matches ? "dark" : "light";
}

export function applyTheme(value, { persist = true } = {}) {
  const normalized = normalizeTheme(value);
  const resolved = resolveTheme(normalized);

  if (typeof document !== "undefined") {
    document.documentElement.dataset.themePreference = normalized;
    document.documentElement.dataset.theme = resolved;
  }

  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, normalized);
  }

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("theme-changed", { detail: { preference: normalized, theme: resolved } })
    );
  }

  return normalized;
}

export function applyStoredTheme() {
  return applyTheme(getStoredTheme(), { persist: false });
}

export function watchSystemTheme() {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};

  const media = window.matchMedia(DARK_MEDIA);
  const sync = () => {
    if (getStoredTheme() === "system") applyTheme("system", { persist: false });
  };

  media.addEventListener?.("change", sync);
  return () => media.removeEventListener?.("change", sync);
}
