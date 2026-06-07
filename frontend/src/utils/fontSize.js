export const FONT_SIZE_OPTIONS = [
  { value: "compact", label: "Компактний", hint: "Трохи більше простору на екрані" },
  { value: "normal", label: "Стандартний", hint: "Оптимальний розмір для більшості екранів" },
  { value: "large", label: "Збільшений", hint: "Комфортніше читати без перебудови інтерфейсу" },
  { value: "mega_large", label: "Максимальний", hint: "Максимально збільшений" },
];

const FONT_SCALE = {
  compact: 0.95,
  normal: 1,
  large: 1.1,
  mega_large: 1.25,
};

const STORAGE_KEY = "budgetflow-ui-font-size";

export function normalizeFontSize(value) {
  return Object.hasOwn(FONT_SCALE, value) ? value : "normal";
}

export function getStoredFontSize() {
  if (typeof window === "undefined") return null;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored ? normalizeFontSize(stored) : null;
}

export function applyFontSize(value, { persist = true } = {}) {
  const normalized = normalizeFontSize(value);

  if (typeof document !== "undefined") {
    document.documentElement.dataset.fontSize = normalized;
    document.documentElement.style.setProperty("--ui-font-scale", String(FONT_SCALE[normalized]));
  }

  if (persist && typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, normalized);
  }

  return normalized;
}

export function applyStoredFontSize() {
  return applyFontSize(getStoredFontSize() || "normal", { persist: false });
}
