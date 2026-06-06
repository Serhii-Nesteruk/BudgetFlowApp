/**
 * budgetMock.js
 * Centralized mock data for the Budget page.
 * Replace these with real API calls when backend is ready.
 * All monetary values are in PLN (zł).
 */

export const MOCK_BUDGET = {
  id: "budget-2025-05",
  month: 5,
  year: 2025,
  label: "Травень 2025",
  totalLimit: 6000,
  startDay: 1,
  endDay: 31,
  todayDay: 17,
};

export const MOCK_INCOME_SOURCES = [
  {
    id: "inc-1",
    name: "Зарплата",
    icon: "briefcase",
    iconBg: "#f0fdf4",
    iconColor: "#16a34a",
    frequency: "Щомісяця · 1-го числа",
    amount: 5500,
    status: "received", // received | pending | partial
  },
  {
    id: "inc-2",
    name: "Фріланс",
    icon: "laptop",
    iconBg: "#eff6ff",
    iconColor: "#1d4ed8",
    frequency: "Непостійно · очікується",
    amount: 1700,
    status: "pending",
  },
];

export const MOCK_MANDATORY_EXPENSES = [
  {
    id: "mand-1",
    name: "Оренда квартири",
    color: "#1a56db",
    amount: 1800,
    paid: 1800,
    paymentType: "auto", // auto | manual
  },
  {
    id: "mand-2",
    name: "Комунальні послуги",
    color: "#1a56db",
    amount: 340,
    paid: 340,
    paymentType: "auto",
  },
  {
    id: "mand-3",
    name: "Страховка",
    color: "#0891b2",
    amount: 120,
    paid: 120,
    paymentType: "manual",
  },
];

export const MOCK_CATEGORIES = [
  {
    id: "cat-1",
    name: "Продукти",
    subLabel: "Biedronka, Lidl, Żabka",
    limit: 1500,
    spent: 1240,
    active: true,
    color: "#16a34a",
  },
  {
    id: "cat-2",
    name: "Транспорт",
    subLabel: "Orlen, PKP, ZTM",
    limit: 500,
    spent: 680,
    active: true,
    color: "#7c3aed",
  },
  {
    id: "cat-3",
    name: "Розваги",
    subLabel: "Netflix, кіно",
    limit: 600,
    spent: 920,
    active: true,
    color: "#c0392b",
  },
  {
    id: "cat-4",
    name: "Кафе та ресторани",
    subLabel: "Starbucks, McDonald's",
    limit: 400,
    spent: 340,
    active: true,
    color: "#b45309",
  },
  {
    id: "cat-5",
    name: "Відпустка (липень)",
    subLabel: "Заплановано · ще не активно",
    limit: 2000,
    spent: 0,
    active: false,
    color: "#6b7280",
  },
];

export const MOCK_ALERTS = [
  {
    id: "alert-1",
    type: "danger", // danger | warn | ok
    icon: "alert-circle",
    title: "Розваги — перевищено на 53%",
    desc: "320 zł понад ліміт. Розгляньте збільшення ліміту або скорочення витрат у червні.",
  },
  {
    id: "alert-2",
    type: "danger",
    icon: "alert-circle",
    title: "Транспорт — перевищено на 36%",
    desc: "180 zł понад ліміт. Можливо, варто переглянути ліміт на наступний місяць.",
  },
  {
    id: "alert-3",
    type: "warn",
    icon: "flame",
    title: "Кафе — 85% бюджету",
    desc: "Залишилось 60 zł на 14 днів — ≈4.3 zł/день.",
  },
  {
    id: "alert-4",
    type: "ok",
    icon: "circle-check",
    title: "Здоров'я — гарний запас",
    desc: "60% бюджету використано, 120 zł резерву для непередбачених витрат.",
  },
];

export const MOCK_BUDGET_PERIODS = [
  {
    id: "period-apr",
    label: "Квітень 2025",
    status: "done", // done | active | draft
    statusLabel: "Завершено",
    spent: 5630,
    limit: 6000,
    badge: "ok", // ok | warn | active | draft
    badgeLabel: "В межах",
  },
  {
    id: "period-may",
    label: "Травень 2025",
    status: "active",
    statusLabel: "Активний",
    spent: 3840,
    limit: 6000,
    badge: "active",
    badgeLabel: "В процесі",
  },
  {
    id: "period-jun",
    label: "Червень 2025",
    status: "draft",
    statusLabel: "Запланований",
    spent: null,
    limit: 6000,
    badge: "draft",
    badgeLabel: "Чернетка",
  },
];

// Derived / computed values used across components
export function computeBudgetSummary(budget, incomeSources, mandatoryExpenses, categories) {
  const totalIncome = incomeSources.reduce((s, i) => s + i.amount, 0);
  const totalSpent =
    categories.filter((c) => c.active).reduce((s, c) => s + Math.min(c.spent, c.limit), 0) +
    mandatoryExpenses.reduce((s, m) => s + m.paid, 0);
  const overflowCategories = categories.filter((c) => c.active && c.spent > c.limit);
  const remaining = budget.totalLimit - totalSpent;
  const spentPct = Math.round((totalSpent / budget.totalLimit) * 100);
  const todayPct = Math.round((budget.todayDay / budget.endDay) * 100);

  return {
    totalIncome,
    totalSpent,
    remaining,
    spentPct,
    todayPct,
    overflowCount: overflowCategories.length,
  };
}

// Timeline bar segments for spending bar
export const MOCK_TIMELINE_SEGMENTS = [
  { label: "Обов'язкові", color: "#1a56db", widthPct: 36 },
  { label: "Продукти", color: "#16a34a", widthPct: 14 },
  { label: "Розваги", color: "#7c3aed", widthPct: 14 },
  { label: "Одяг", color: "#b45309", widthPct: 8 },
  { label: "Перевищення", color: "#c0392b", widthPct: 6 },
];

// Donut chart slices
export const MOCK_DONUT_SLICES = [
  { label: "Обов'язкові", color: "#1a56db", amount: 2260 },
  { label: "Розваги", color: "#c0392b", amount: 920 },
  { label: "Транспорт", color: "#7c3aed", amount: 680 },
  { label: "Кафе", color: "#16a34a", amount: 340 },
  { label: "Одяг", color: "#b45309", amount: 480 },
];
