import { useState } from "react";
import styles from "./PaymentModal.module.css";

export default function PaymentModal({ open, debt, mode, onSave, onClose }) {
  // mode: "payment" | "recurring"
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), amount: "", note: "" });
  const [err, setErr] = useState({});

  if (!open || !debt) return null;

  const isRecurring = mode === "recurring";
  const isReceivable = debt.direction === "receivable";

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function validate() {
    const e = {};
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = "Вкажіть суму";
    if (!form.date) e.date = "Вкажіть дату";
    setErr(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({ ...form, amount: Number(form.amount) });
    setForm({ date: new Date().toISOString().slice(0, 10), amount: "", note: "" });
  }

  const title = isRecurring ? "Нове нарахування" : (isReceivable ? "Додати повернення" : "Додати платіж");
  const amtLabel = isRecurring ? "Сума нарахування (₴)" : (isReceivable ? "Сума повернення (₴)" : "Сума платежу (₴)");
  const defAmt = isRecurring ? debt.amount : (debt.type === "installment" ? debt.monthlyPayment : debt.remaining);

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <div className={styles.title}>{title}</div>
            <div className={styles.sub}>{debt.creditor}</div>
          </div>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          {!isRecurring && (
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Залишок:</span>
              <span className={styles.infoVal}>₴{debt.remaining.toLocaleString("uk-UA")}</span>
            </div>
          )}

          <div className={styles.row}>
            <label className={styles.label}>{isRecurring ? "Дата нарахування" : (isReceivable ? "Дата повернення" : "Дата платежу")}</label>
            <input className={[styles.input, err.date ? styles.inputErr : ""].join(" ")} type="date" value={form.date} onChange={e => set("date", e.target.value)} />
            {err.date && <span className={styles.err}>{err.date}</span>}
          </div>

          <div className={styles.row}>
            <label className={styles.label}>{amtLabel}</label>
            <div className={styles.amtRow}>
              <input className={[styles.input, err.amount ? styles.inputErr : ""].join(" ")} type="number" min="0" step="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder={defAmt || "0.00"} />
              {defAmt && <button className={styles.fillBtn} type="button" onClick={() => set("amount", String(defAmt))}>₴{Number(defAmt).toLocaleString("uk-UA")}</button>}
            </div>
            {err.amount && <span className={styles.err}>{err.amount}</span>}
          </div>

          {isRecurring && (
            <div className={styles.row}>
              <label className={styles.label}>Термін оплати нарахування</label>
              <input className={styles.input} type="date" value={form.dueDate || ""} onChange={e => set("dueDate", e.target.value)} />
            </div>
          )}

          <div className={styles.row}>
            <label className={styles.label}>Нотатка</label>
            <input className={styles.input} value={form.note} onChange={e => set("note", e.target.value)} placeholder={isRecurring ? "Червень 2025…" : (isReceivable ? "Повернув частину…" : "Часткова оплата…")} />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose}>Скасувати</button>
          <button className={styles.btnSave} onClick={handleSubmit}>{isRecurring ? "Створити нарахування" : (isReceivable ? "Зберегти повернення" : "Зберегти платіж")}</button>
        </div>
      </div>
    </div>
  );
}
