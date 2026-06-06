import { useState, useCallback } from "react";
import { loadDebts, saveDebts } from "../data/debtsStore";

function recalcStatus(debt) {
  if (debt.status === "paid") return "paid";
  const today = new Date().toISOString().slice(0, 10);
  if (debt.remaining <= 0) return "paid";
  if (debt.paymentHistory.length > 0 && debt.remaining < debt.amount) {
    if (debt.dueDate < today) return "overdue";
    return "partial";
  }
  if (debt.dueDate < today) return "overdue";
  return "unpaid";
}

export function useDebts() {
  const [debts, setDebts] = useState(() => loadDebts());

  const persist = useCallback((next) => {   
    setDebts(next);
    saveDebts(next);
  }, []);

  const addDebt = useCallback((data) => {
    const newDebt = {
      ...data,
      id: `d${Date.now()}`,
      remaining: data.type === "installment"
        ? data.amount - (data.paidInstallments || 0) * (data.monthlyPayment || 0)
        : data.amount,
      paymentHistory: [],
      status: "unpaid",
      createdAt: new Date().toISOString().slice(0, 10),
    };
    if (data.type === "installment") {
      newDebt.installmentSchedule = generateInstallments(
        data.amount, data.totalInstallments, data.monthlyPayment, data.startDate
      );
    }
    persist([newDebt, ...debts]);
  }, [debts, persist]);

  const updateDebt = useCallback((id, data) => {
    const next = debts.map(d => d.id === id ? { ...d, ...data, status: recalcStatus({ ...d, ...data }) } : d);
    persist(next);
  }, [debts, persist]);

  const deleteDebt = useCallback((id) => {
    persist(debts.filter(d => d.id !== id));
  }, [debts, persist]);

  const markPaid = useCallback((id) => {
    const next = debts.map(d => {
      if (d.id !== id) return d;
      const payment = { id: `p${Date.now()}`, date: new Date().toISOString().slice(0, 10), amount: d.remaining, note: "Позначено як оплачено" };
      return { ...d, remaining: 0, status: "paid", paymentHistory: [...d.paymentHistory, payment] };
    });
    persist(next);
  }, [debts, persist]);

  const addPayment = useCallback((id, payment) => {
    const next = debts.map(d => {
      if (d.id !== id) return d;
      const newHistory = [...d.paymentHistory, { ...payment, id: `p${Date.now()}` }];
      const newRemaining = Math.max(0, d.remaining - payment.amount);
      const updated = { ...d, remaining: newRemaining, paymentHistory: newHistory };

      if (d.type === "installment" && d.installmentSchedule) {
        const unpaidIdx = d.installmentSchedule.findIndex(s => !s.paid);
        if (unpaidIdx !== -1) {
          const newSchedule = d.installmentSchedule.map((s, i) => i === unpaidIdx ? { ...s, paid: true } : s);
          updated.installmentSchedule = newSchedule;
          updated.paidInstallments = (d.paidInstallments || 0) + 1;
        }
      }
      updated.status = recalcStatus(updated);
      return updated;
    });
    persist(next);
  }, [debts, persist]);

  const addRecurringCharge = useCallback((id, charge) => {
    const next = debts.map(d => {
      if (d.id !== id) return d;
      return { ...d, remaining: charge.amount, amount: charge.amount, dueDate: charge.dueDate, status: "unpaid", notes: charge.note || d.notes };
    });
    persist(next);
  }, [debts, persist]);

  return { debts, addDebt, updateDebt, deleteDebt, markPaid, addPayment, addRecurringCharge };
}

function generateInstallments(total, count, monthly, startDate) {
  const result = [];
  const start = new Date(startDate);
  for (let i = 0; i < count; i++) {
    const d = new Date(start);
    d.setMonth(d.getMonth() + i + 1);
    result.push({ index: i + 1, date: d.toISOString().slice(0, 10), amount: monthly, paid: false });
  }
  return result;
}