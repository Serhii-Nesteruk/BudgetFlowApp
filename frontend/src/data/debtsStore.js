// ─── Debts local-storage store ─────────────────────────────────────────────

const KEY = "debts_v1";

export const DEBT_DIRECTIONS = {
  PAYABLE: "payable", // I owe someone
  RECEIVABLE: "receivable", // Someone owes me
};

function normalizeDebt(debt) {
  return {
    ...debt,
    // Backward-compatible migration: all records created before directions
    // existed represented the user's own debts.
    direction: debt.direction || DEBT_DIRECTIONS.PAYABLE,
    paymentHistory: debt.paymentHistory || [],
  };
}

export function loadDebts() {
  try {
    const raw = localStorage.getItem(KEY);
    const debts = raw ? JSON.parse(raw) : getSampleDebts();
    return Array.isArray(debts) ? debts.map(normalizeDebt) : getSampleDebts().map(normalizeDebt);
  } catch {
    return getSampleDebts().map(normalizeDebt);
  }
}

export function saveDebts(debts) {
  localStorage.setItem(KEY, JSON.stringify(debts));
}

// ─── Sample data ─────────────────────────────────────────────────────────────
function getSampleDebts() {
  const today = new Date();
  const fmt = (d) => d.toISOString().slice(0, 10);
  const add = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() + days);
    return fmt(d);
  };
  const sub = (days) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return fmt(d);
  };

  return [
    {
      id: "d1",
      direction: DEBT_DIRECTIONS.PAYABLE,
      type: "one-time", // "one-time" | "installment" | "recurring"
      creditor: "Олег Мороз",
      amount: 5000,
      remaining: 2000,
      dueDate: add(15),
      status: "partial", // "unpaid" | "overdue" | "partial" | "paid"
      priority: 3,
      notes: "Позичив на ремонт",
      paymentHistory: [
        { id: "p1", date: sub(30), amount: 1500, note: "Перша частина" },
        { id: "p2", date: sub(10), amount: 1500, note: "Друга частина" },
      ],
      createdAt: sub(40),
    },
    {
      id: "d2",
      direction: DEBT_DIRECTIONS.PAYABLE,
      type: "installment",
      creditor: "ПриватБанк",
      amount: 24000,
      remaining: 18000,
      dueDate: add(5),
      status: "partial",
      priority: 5,
      notes: "Кредит на телефон",
      totalInstallments: 12,
      paidInstallments: 3,
      monthlyPayment: 2000,
      startDate: sub(90),
      installmentSchedule: generateInstallments(24000, 12, 2000, sub(90)),
      paymentHistory: [
        { id: "p1", date: sub(60), amount: 2000, note: "Платіж 1" },
        { id: "p2", date: sub(30), amount: 2000, note: "Платіж 2" },
        { id: "p3", date: sub(1), amount: 2000, note: "Платіж 3" },
      ],
      createdAt: sub(90),
    },
    {
      id: "d3",
      direction: DEBT_DIRECTIONS.PAYABLE,
      type: "recurring",
      creditor: "Квартирна оренда",
      amount: 8000,
      remaining: 8000,
      dueDate: add(3),
      status: "unpaid",
      priority: 5,
      notes: "Оренда за червень",
      recurringDay: 5,
      recurringPeriod: "monthly",
      paymentHistory: [
        { id: "p1", date: sub(60), amount: 8000, note: "Квітень" },
        { id: "p2", date: sub(30), amount: 8000, note: "Травень" },
      ],
      createdAt: sub(120),
    },
    {
      id: "d4",
      direction: DEBT_DIRECTIONS.PAYABLE,
      type: "one-time",
      creditor: "Сестра Наталя",
      amount: 1200,
      remaining: 1200,
      dueDate: sub(5),
      status: "overdue",
      priority: 4,
      notes: "Повернути до свята",
      paymentHistory: [],
      createdAt: sub(20),
    },
    {
      id: "d5",
      direction: DEBT_DIRECTIONS.PAYABLE,
      type: "recurring",
      creditor: "Комунальні послуги",
      amount: 1800,
      remaining: 0,
      dueDate: add(20),
      status: "paid",
      priority: 4,
      notes: "Газ + світло + вода",
      recurringDay: 25,
      recurringPeriod: "monthly",
      paymentHistory: [{ id: "p1", date: sub(5), amount: 1800, note: "Травень" }],
      createdAt: sub(200),
    },
    {
      id: "d6",
      direction: DEBT_DIRECTIONS.RECEIVABLE,
      type: "one-time",
      creditor: "Андрій Коваль",
      amount: 3200,
      remaining: 2200,
      dueDate: add(9),
      status: "partial",
      priority: 3,
      notes: "Позика на квитки",
      paymentHistory: [{ id: "p1", date: sub(7), amount: 1000, note: "Повернув частину" }],
      createdAt: sub(18),
    },
  ];
}

function generateInstallments(total, count, monthly, startDate) {
  const result = [];
  const start = new Date(startDate);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i + 1);
    result.push({
      index: i + 1,
      date: d.toISOString().slice(0, 10),
      amount: monthly,
      paid: i < 3,
    });
  }
  return result;
}
