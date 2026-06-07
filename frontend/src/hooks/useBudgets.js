import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addBudgetCategory,
  addBudgetIncomeSource,
  addBudgetMandatoryExpense,
  addBudgetPlannedExpense,
  createBudget as createBudgetRequest,
  deleteBudget as deleteBudgetRequest,
  deleteBudgetCategory,
  deleteBudgetIncomeSource,
  deleteBudgetMandatoryExpense,
  getBudgets,
  setBudgetSharing,
  planBudgetNextMonths,
  shareBudgetWithUser,
  updateBudgetCategory,
  updateBudget as updateBudgetRequest,
} from "../api/budgetsApi";
import { convertAmount } from "./useCurrencyRates";

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : "";
}

function toUtcDate(value) {
  if (!value) return null;
  return String(value).includes("T") ? value : `${value}T00:00:00Z`;
}

function normalizeLabel(value) {
  return String(value || "")
    .trim()
    .toLocaleLowerCase("uk-UA");
}

function uniqLabels(values) {
  return [...new Set((values || []).map(normalizeLabel).filter(Boolean))];
}

function textLabels(...values) {
  return [
    ...new Set(
      values
        .filter(Boolean)
        .flatMap((value) => String(value).split(/[,;\n#]/g))
        .flatMap((value) => {
          const normalized = normalizeLabel(value);
          return normalized ? [normalized, ...normalized.split(/\s+/g)] : [];
        })
        .filter(Boolean)
    ),
  ];
}

function flattenExpenseEntries(entries, rates, displayCurrency) {
  return (entries || []).flatMap((entry) =>
    (entry.places || []).map((place) => {
      const originalCurrency = place.currency || entry.currency || "PLN";
      return {
        id: `expense-${place.id}`,
        date: dateOnly(entry.date),
        desc: place.name || "Витрата",
        placeName: place.name || "Витрата",
        placeLabel: normalizeLabel(place.name),
        amount: convertAmount(place.amount, originalCurrency, displayCurrency, rates),
        originalAmount: Number(place.amount || 0),
        originalCurrency,
        currency: displayCurrency,
        type: "expense",
        labels: uniqLabels([
          ...(place.tags || []),
          ...textLabels(place.name, place.details, place.notes),
        ]),
        details: place.details || "",
        notes: place.notes || "",
        source: "table",
        isActual: true,
      };
    })
  );
}

function inBudgetPeriod(transaction, budget) {
  if (!transaction.date) return false;
  if (budget.type === "monthly") {
    const prefix = `${budget.year}-${String(budget.month).padStart(2, "0")}`;
    return transaction.date.startsWith(prefix);
  }
  if (!budget.startDate || !budget.endDate) return true;
  return transaction.date >= budget.startDate && transaction.date <= budget.endDate;
}

function normalizeBudget(dto, allExpenseTransactions, rates, displayCurrency) {
  const sourceCurrency = dto.currency || displayCurrency;
  const money = (value) => convertAmount(value, sourceCurrency, displayCurrency, rates);

  const categories = (dto.categories || []).map((category) => ({
    ...category,
    id: Number(category.id),
    limit: money(category.limit),
    active: category.isActive ?? true,
    labels: (category.labels || []).map(normalizeLabel),
  }));

  const mandatoryExpenses = (dto.mandatoryExpenses || []).map((item) => ({
    ...item,
    id: Number(item.id),
    budgetCategoryId: item.budgetCategoryId == null ? null : Number(item.budgetCategoryId),
    amount: money(item.amount),
    dueDate: dateOnly(item.dueDate),
    dateLabel: item.dueDate
      ? new Date(item.dueDate).toLocaleDateString("uk-UA", { day: "numeric", month: "long" })
      : "Без дати",
    paid: item.isPaid,
  }));

  const plannedExpenses = (dto.plannedExpenses || []).map((item) => ({
    ...item,
    id: Number(item.id),
    budgetCategoryId: item.budgetCategoryId == null ? null : Number(item.budgetCategoryId),
    date: dateOnly(item.date),
    desc: item.name || "Запланована витрата",
    planned: money(item.amount),
    actual: item.isPaid ? money(item.amount) : null,
    category:
      categories.find((category) => category.id === Number(item.budgetCategoryId))?.name ||
      "Без категорії",
  }));

  const budget = {
    ...dto,
    id: Number(dto.id),
    storageCurrency: sourceCurrency,
    currency: displayCurrency,
    totalLimit: money(dto.totalLimit),
    startDate: dateOnly(dto.startDate),
    endDate: dateOnly(dto.endDate),
    autoCreateNextMonthly: dto.autoCreateNextMonthly ?? true,
    categories,
    incomeSources: (dto.incomeSources || []).map((item) => ({
      ...item,
      id: Number(item.id),
      amount: money(item.amount),
      expectedDate: dateOnly(item.expectedDate),
      status: item.isReceived ? "received" : "pending",
      icon: "💰",
    })),
    mandatoryExpenses,
    plannedExpenses,
    sharedUsers: dto.sharedUsers || [],
    participants: ["Ви", ...(dto.sharedUsers || []).map((item) => item.name || item.email)],
  };

  const tableTransactions = allExpenseTransactions.filter((item) => inBudgetPeriod(item, budget));
  const mandatoryTransactions = mandatoryExpenses.map((item) => ({
    id: `mandatory-${item.id}`,
    date: item.dueDate,
    desc: item.name,
    placeName: item.name,
    amount: Number(item.amount || 0),
    currency: displayCurrency,
    type: "expense",
    labels: [],
    categoryId: item.budgetCategoryId,
    source: "mandatory",
    isActual: true,
  }));
  const paidPlannedTransactions = plannedExpenses
    .filter((item) => item.actual != null)
    .map((item) => ({
      id: `planned-${item.id}`,
      date: dateOnly(item.date),
      desc: item.desc,
      placeName: item.desc,
      amount: Number(item.actual || 0),
      currency: displayCurrency,
      type: "expense",
      labels: textLabels(item.category, item.notes),
      categoryId: item.budgetCategoryId,
      source: "manual",
      isActual: true,
    }));

  return {
    ...budget,
    transactions: [...tableTransactions, ...mandatoryTransactions, ...paidPlannedTransactions],
  };
}

function categoryPayload(category, amount = (value) => Number(value || 0)) {
  return {
    name: category.name,
    icon: category.icon || "✦",
    color: category.color || "#00b86b",
    limit: amount(category.limit),
    isActive: category.active ?? category.isActive ?? true,
    labels: category.labels || [],
  };
}

function incomePayload(item, amount = (value) => Number(value || 0)) {
  return {
    name: item.name,
    amount: amount(item.amount),
    frequency: item.frequency || "",
    expectedDate: toUtcDate(item.expectedDate),
    isReceived: item.status === "received" || item.isReceived === true,
  };
}

function mandatoryPayload(item, amount = (value) => Number(value || 0)) {
  return {
    budgetCategoryId: item.budgetCategoryId || null,
    name: item.name,
    amount: amount(item.amount),
    dueDate: toUtcDate(item.dueDate || item.date),
    frequency: item.frequency || "",
    isPaid: item.paid ?? item.isPaid ?? false,
  };
}

function plannedPayload(item, amount = (value) => Number(value || 0)) {
  return {
    budgetCategoryId: item.budgetCategoryId || null,
    name: item.name || item.desc,
    amount: amount(item.amount ?? item.planned ?? 0),
    date: toUtcDate(item.date),
    isPaid: item.isPaid ?? true,
    notes: item.notes || (item.labels || []).join(", "),
  };
}

function budgetPayload(budget, rates, displayCurrency) {
  const storageCurrency = budget.storageCurrency || budget.currency || displayCurrency || "PLN";
  const amount = (value) =>
    convertAmount(value, displayCurrency || storageCurrency, storageCurrency, rates);
  return {
    type: budget.type,
    name: budget.name,
    currency: storageCurrency,
    totalLimit: amount(budget.totalLimit),
    month: budget.type === "monthly" ? Number(budget.month) : null,
    year: budget.type === "monthly" ? Number(budget.year) : null,
    startDate: budget.type === "event" ? toUtcDate(budget.startDate) : null,
    endDate: budget.type === "event" ? toUtcDate(budget.endDate) : null,
    telegramEnabled: Boolean(budget.telegramEnabled),
    warningThreshold: Number(budget.warningThreshold || 80),
    autoCreateNextMonthly: budget.autoCreateNextMonthly ?? true,
    sharingEnabled: Boolean(budget.sharingEnabled),
    categories: (budget.categories || []).map((item) => categoryPayload(item, amount)),
    incomeSources: (budget.incomeSources || []).map((item) => incomePayload(item, amount)),
    mandatoryExpenses: (budget.mandatoryExpenses || []).map((item) =>
      mandatoryPayload(item, amount)
    ),
    plannedExpenses: (budget.plannedExpenses || []).map((item) => plannedPayload(item, amount)),
  };
}

export function useBudgets(expenseEntries = [], rates, displayCurrency = "PLN") {
  const [rawBudgets, setRawBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const expenseTransactions = useMemo(
    () => flattenExpenseEntries(expenseEntries, rates, displayCurrency),
    [expenseEntries, rates, displayCurrency]
  );

  const availablePlaceLabels = useMemo(() => {
    const map = new Map();
    for (const transaction of expenseTransactions) {
      if (!transaction.placeLabel) continue;
      map.set(transaction.placeLabel, transaction.placeName);
    }
    return [...map.entries()]
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "uk-UA"));
  }, [expenseTransactions]);

  const budgets = useMemo(
    () =>
      rawBudgets.map((budget) =>
        normalizeBudget(budget, expenseTransactions, rates, displayCurrency)
      ),
    [rawBudgets, expenseTransactions, rates, displayCurrency]
  );

  const loadBudgets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setRawBudgets((await getBudgets()) || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const replaceBudget = useCallback((updated) => {
    setRawBudgets((items) => {
      const exists = items.some((item) => Number(item.id) === Number(updated.id));
      return exists
        ? items.map((item) => (Number(item.id) === Number(updated.id) ? updated : item))
        : [updated, ...items];
    });
    return updated;
  }, []);

  const run = useCallback(
    async (request) => {
      try {
        setError(null);
        return replaceBudget(await request());
      } catch (e) {
        setError(e.message);
        throw e;
      }
    },
    [replaceBudget]
  );

  const storageAmount = useCallback(
    (budgetId, value) => {
      const raw = rawBudgets.find((item) => Number(item.id) === Number(budgetId));
      return convertAmount(value, displayCurrency, raw?.currency || displayCurrency, rates);
    },
    [rawBudgets, displayCurrency, rates]
  );

  const createBudget = useCallback(
    async (budget) =>
      run(() =>
        createBudgetRequest(
          budgetPayload(
            { ...budget, currency: displayCurrency, storageCurrency: displayCurrency },
            rates,
            displayCurrency
          )
        )
      ),
    [run, displayCurrency, rates]
  );
  const updateBudget = useCallback(
    async (budget) =>
      run(() => updateBudgetRequest(budget.id, budgetPayload(budget, rates, displayCurrency))),
    [run, displayCurrency, rates]
  );

  const deleteBudget = useCallback(async (id) => {
    try {
      setError(null);
      await deleteBudgetRequest(id);
      setRawBudgets((items) => items.filter((item) => Number(item.id) !== Number(id)));
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const addCategory = useCallback(
    (budgetId, item) =>
      run(() =>
        addBudgetCategory(
          budgetId,
          categoryPayload(item, (value) => storageAmount(budgetId, value))
        )
      ),
    [run, storageAmount]
  );
  const updateCategory = useCallback(
    (budgetId, categoryId, item) =>
      run(() =>
        updateBudgetCategory(
          budgetId,
          categoryId,
          categoryPayload(item, (value) => storageAmount(budgetId, value))
        )
      ),
    [run, storageAmount]
  );
  const addIncome = useCallback(
    (budgetId, item) =>
      run(() =>
        addBudgetIncomeSource(
          budgetId,
          incomePayload(item, (value) => storageAmount(budgetId, value))
        )
      ),
    [run, storageAmount]
  );
  const addMandatory = useCallback(
    (budgetId, item) =>
      run(() =>
        addBudgetMandatoryExpense(
          budgetId,
          mandatoryPayload(item, (value) => storageAmount(budgetId, value))
        )
      ),
    [run, storageAmount]
  );
  const addPlanned = useCallback(
    (budgetId, item) =>
      run(() =>
        addBudgetPlannedExpense(
          budgetId,
          plannedPayload(item, (value) => storageAmount(budgetId, value))
        )
      ),
    [run, storageAmount]
  );

  const copyStructure = useCallback(
    async (target, source) => {
      if (!source) return null;
      let updated = target;
      for (const category of target.categories || [])
        updated = await deleteBudgetCategory(target.id, category.id);
      for (const income of target.incomeSources || [])
        updated = await deleteBudgetIncomeSource(target.id, income.id);
      for (const item of target.mandatoryExpenses || [])
        updated = await deleteBudgetMandatoryExpense(target.id, item.id);
      for (const category of source.categories || [])
        updated = await addBudgetCategory(
          target.id,
          categoryPayload(category, (value) => storageAmount(target.id, value))
        );
      for (const income of source.incomeSources || [])
        updated = await addBudgetIncomeSource(
          target.id,
          incomePayload({ ...income, status: "pending" }, (value) =>
            storageAmount(target.id, value)
          )
        );
      for (const item of source.mandatoryExpenses || [])
        updated = await addBudgetMandatoryExpense(
          target.id,
          mandatoryPayload({ ...item, paid: false }, (value) => storageAmount(target.id, value))
        );
      replaceBudget(updated);
      return updated;
    },
    [replaceBudget, storageAmount]
  );

  const share = useCallback(
    async (budgetId, email) => run(() => shareBudgetWithUser(budgetId, email)),
    [run]
  );
  const enableSharing = useCallback(
    async (budgetId, regenerateToken = false) =>
      run(() => setBudgetSharing(budgetId, true, regenerateToken)),
    [run]
  );

  const planNextMonths = useCallback(
    async (budgetId, months) => {
      try {
        setError(null);
        const items = await planBudgetNextMonths(budgetId, months);
        await loadBudgets();
        return items || [];
      } catch (e) {
        setError(e.message);
        throw e;
      }
    },
    [loadBudgets]
  );

  return {
    budgets,
    availablePlaceLabels,
    loading,
    error,
    reload: loadBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
    addCategory,
    updateCategory,
    addIncome,
    addMandatory,
    addPlanned,
    copyStructure,
    share,
    enableSharing,
    planNextMonths,
  };
}
