import { useCallback, useEffect, useState } from "react";
import {
  addDebtPayment,
  addDebtRecurringCharge,
  createDebt,
  deleteDebt as deleteDebtRequest,
  getDebts,
  markDebtPaid,
  updateDebt as updateDebtRequest,
} from "../api/debtsApi";

function toDateInput(value) {
  return value ? String(value).slice(0, 10) : "";
}

function toUtcDate(value) {
  if (!value) return null;
  return String(value).includes("T") ? value : `${value}T00:00:00Z`;
}

function normalizeDebt(debt) {
  return {
    ...debt,
    id: Number(debt.id),
    direction: debt.direction || "payable",
    currency: debt.currency || "UAH",
    dueDate: toDateInput(debt.dueDate),
    startDate: toDateInput(debt.startDate),
    createdAt: toDateInput(debt.createdAt),
    updatedAt: toDateInput(debt.updatedAt),
    amount: Number(debt.amount || 0),
    remaining: Number(debt.remaining || 0),
    monthlyPayment: debt.monthlyPayment == null ? null : Number(debt.monthlyPayment),
    paymentHistory: (debt.paymentHistory || []).map((payment) => ({
      ...payment,
      id: Number(payment.id),
      date: toDateInput(payment.date),
      amount: Number(payment.amount || 0),
    })),
    installmentSchedule: (debt.installmentSchedule || []).map((item) => ({
      ...item,
      id: Number(item.id),
      date: toDateInput(item.date),
      amount: Number(item.amount || 0),
    })),
  };
}

function toPayload(data) {
  return {
    direction: data.direction || "payable",
    type: data.type || "one-time",
    creditor: data.creditor?.trim() || "",
    amount: Number(data.amount || 0),
    remaining: Number(data.remaining || 0),
    currency: data.currency || "UAH",
    dueDate: toUtcDate(data.dueDate),
    priority: Number(data.priority || 3),
    notes: data.notes?.trim() || "",
    totalInstallments:
      data.totalInstallments == null || data.totalInstallments === ""
        ? null
        : Number(data.totalInstallments),
    paidInstallments:
      data.paidInstallments == null || data.paidInstallments === ""
        ? null
        : Number(data.paidInstallments),
    monthlyPayment:
      data.monthlyPayment == null || data.monthlyPayment === ""
        ? null
        : Number(data.monthlyPayment),
    startDate: toUtcDate(data.startDate),
    recurringDay:
      data.recurringDay == null || data.recurringDay === "" ? null : Number(data.recurringDay),
    recurringPeriod: data.recurringPeriod || null,
  };
}

export function useDebts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDebts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getDebts();
      setDebts((result || []).map(normalizeDebt));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDebts();
  }, [loadDebts]);

  const replaceDebt = useCallback((updated) => {
    const normalized = normalizeDebt(updated);
    setDebts((items) => items.map((item) => (item.id === normalized.id ? normalized : item)));
    return normalized;
  }, []);

  const addDebt = useCallback(async (data) => {
    try {
      setError(null);
      const created = normalizeDebt(await createDebt(toPayload(data)));
      setDebts((items) => [created, ...items]);
      return created;
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const updateDebt = useCallback(
    async (id, data) => {
      try {
        setError(null);
        return replaceDebt(await updateDebtRequest(id, toPayload(data)));
      } catch (e) {
        setError(e.message);
        throw e;
      }
    },
    [replaceDebt]
  );

  const deleteDebt = useCallback(async (id) => {
    try {
      setError(null);
      await deleteDebtRequest(id);
      setDebts((items) => items.filter((item) => item.id !== id));
    } catch (e) {
      setError(e.message);
      throw e;
    }
  }, []);

  const markPaid = useCallback(
    async (id) => {
      try {
        setError(null);
        return replaceDebt(await markDebtPaid(id));
      } catch (e) {
        setError(e.message);
        throw e;
      }
    },
    [replaceDebt]
  );

  const addPayment = useCallback(
    async (id, payment) => {
      try {
        setError(null);
        return replaceDebt(
          await addDebtPayment(id, {
            date: toUtcDate(payment.date),
            amount: Number(payment.amount),
            note: payment.note?.trim() || "",
          })
        );
      } catch (e) {
        setError(e.message);
        throw e;
      }
    },
    [replaceDebt]
  );

  const addRecurringCharge = useCallback(
    async (id, charge) => {
      try {
        setError(null);
        return replaceDebt(
          await addDebtRecurringCharge(id, {
            dueDate: toUtcDate(charge.dueDate || charge.date),
            amount: Number(charge.amount),
            note: charge.note?.trim() || "",
          })
        );
      } catch (e) {
        setError(e.message);
        throw e;
      }
    },
    [replaceDebt]
  );

  return {
    debts,
    loading,
    error,
    reload: loadDebts,
    addDebt,
    updateDebt,
    deleteDebt,
    markPaid,
    addPayment,
    addRecurringCharge,
  };
}
