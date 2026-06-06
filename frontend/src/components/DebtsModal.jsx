import { useState, useEffect } from "react";
import styles from "./DebtsModal.module.css";

const DIRECTIONS = [
  { value: "payable", label: "Я винен", hint: "Моє зобов’язання", icon: "↗" },
  { value: "receivable", label: "Винні мені", hint: "Моя позика", icon: "↙" },
];

const TYPES = [
  { value: "one-time",     label: "Разовий борг",       icon: "💸" },
  { value: "installment",  label: "Кредит / Розстрочка", icon: "🏦" },
  { value: "recurring",    label: "Регулярний платіж",  icon: "🔁" },
];
const PRIORITIES = [1, 2, 3, 4, 5];

function makeEmpty(direction = "payable", currency = "PLN") {
  return {
    direction,
    type: "one-time",
    currency,
    creditor: "",
    amount: "",
    dueDate: "",
    priority: 3,
    notes: "",
    totalInstallments: "",
    monthlyPayment: "",
    startDate: "",
    recurringDay: "1",
    recurringPeriod: "monthly",
  };
}

export default function DebtModal({ open, debt, defaultDirection = "payable", defaultCurrency = "PLN", onSave, onClose }) {
  const [form, setForm] = useState(() => makeEmpty(defaultDirection, defaultCurrency));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!open) return;
    if (debt) {
      setForm({
        direction: debt.direction || "payable",
        type: debt.type || "one-time",
        currency: debt.currency || defaultCurrency,
        creditor: debt.creditor || "",
        amount: debt.amount || "",
        dueDate: debt.dueDate || "",
        priority: debt.priority || 3,
        notes: debt.notes || "",
        totalInstallments: debt.totalInstallments || "",
        monthlyPayment: debt.monthlyPayment || "",
        startDate: debt.startDate || "",
        recurringDay: debt.recurringDay || "1",
        recurringPeriod: debt.recurringPeriod || "monthly",
      });
    } else {
      setForm(makeEmpty(defaultDirection, defaultCurrency));
    }
    setErrors({});
  }, [open, debt, defaultDirection, defaultCurrency]);

  if (!open) return null;

  const isReceivable = form.direction === "receivable";

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function validate() {
    const e = {};
    if (!form.creditor.trim()) e.creditor = isReceivable ? "Вкажіть, хто винен" : "Вкажіть кредитора";
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = "Вкажіть суму";
    if (!form.dueDate) e.dueDate = "Вкажіть дату";
    if (form.type === "installment") {
      if (!form.totalInstallments || isNaN(Number(form.totalInstallments))) e.totalInstallments = "Вкажіть кількість";
      if (!form.monthlyPayment || isNaN(Number(form.monthlyPayment))) e.monthlyPayment = "Вкажіть суму платежу";
      if (!form.startDate) e.startDate = "Вкажіть початок";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    onSave({
      direction: form.direction,
      type: form.type,
      creditor: form.creditor.trim(),
      amount: Number(form.amount),
      currency: form.currency || defaultCurrency,
      dueDate: form.dueDate,
      priority: form.priority,
      notes: form.notes.trim(),
      ...(form.type === "installment" && {
        totalInstallments: Number(form.totalInstallments),
        paidInstallments: debt?.paidInstallments || 0,
        monthlyPayment: Number(form.monthlyPayment),
        startDate: form.startDate,
      }),
      ...(form.type === "recurring" && {
        recurringDay: Number(form.recurringDay),
        recurringPeriod: form.recurringPeriod,
      }),
    });
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{debt ? "Редагувати запис" : (isReceivable ? "Записати позику" : "Новий борг")}</h2>
          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <div className={styles.directionGrid}>
            {DIRECTIONS.map(item => (
              <button
                key={item.value}
                type="button"
                className={[styles.directionBtn, form.direction === item.value ? styles.directionBtnActive : ""].join(" ")}
                onClick={() => set("direction", item.value)}
              >
                <span className={styles.directionIcon}>{item.icon}</span>
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.hint}</small>
                </span>
              </button>
            ))}
          </div>

          {!debt && (
            <div className={styles.typeGrid}>
              {TYPES.map(t => (
                <button key={t.value} type="button" className={[styles.typeBtn, form.type === t.value ? styles.typeBtnActive : ""].join(" ")} onClick={() => set("type", t.value)}>
                  <span className={styles.typeIcon}>{t.icon}</span>
                  <span className={styles.typeLabel}>{t.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className={styles.row}>
            <label className={styles.label}>{isReceivable ? "Хто винен мені *" : "Кому винен *"}</label>
            <input
              className={[styles.input, errors.creditor ? styles.inputErr : ""].join(" ")}
              value={form.creditor}
              onChange={e => set("creditor", e.target.value)}
              placeholder={isReceivable ? "Іван Петров, колега…" : "ПриватБанк, Іван Петров…"}
            />
            {errors.creditor && <span className={styles.err}>{errors.creditor}</span>}
          </div>

          <div className={styles.cols2}>
            <div className={styles.row}>
              <label className={styles.label}>Сума *</label>
              <input className={[styles.input, errors.amount ? styles.inputErr : ""].join(" ")} type="number" min="0" step="0.01" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0.00" />
              <select className={styles.input} value={form.currency || defaultCurrency} onChange={e => set("currency", e.target.value)}><option value="PLN">PLN</option><option value="UAH">UAH</option><option value="USD">USD</option><option value="EUR">EUR</option></select>
              {errors.amount && <span className={styles.err}>{errors.amount}</span>}
            </div>
            <div className={styles.row}>
              <label className={styles.label}>{form.type === "installment" ? "Дата першого платежу *" : (isReceivable ? "Повернути до *" : "Термін оплати *")}</label>
              <input className={[styles.input, errors.dueDate ? styles.inputErr : ""].join(" ")} type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} />
              {errors.dueDate && <span className={styles.err}>{errors.dueDate}</span>}
            </div>
          </div>

          {form.type === "installment" && (
            <div className={styles.cols2}>
              <div className={styles.row}>
                <label className={styles.label}>Кількість платежів *</label>
                <input className={[styles.input, errors.totalInstallments ? styles.inputErr : ""].join(" ")} type="number" min="1" value={form.totalInstallments} onChange={e => set("totalInstallments", e.target.value)} placeholder="12" />
                {errors.totalInstallments && <span className={styles.err}>{errors.totalInstallments}</span>}
              </div>
              <div className={styles.row}>
                <label className={styles.label}>Щомісячний платіж *</label>
                <input className={[styles.input, errors.monthlyPayment ? styles.inputErr : ""].join(" ")} type="number" min="0" value={form.monthlyPayment} onChange={e => set("monthlyPayment", e.target.value)} placeholder="2000" />
                {errors.monthlyPayment && <span className={styles.err}>{errors.monthlyPayment}</span>}
              </div>
              <div className={styles.row}>
                <label className={styles.label}>Дата початку *</label>
                <input className={[styles.input, errors.startDate ? styles.inputErr : ""].join(" ")} type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} />
                {errors.startDate && <span className={styles.err}>{errors.startDate}</span>}
              </div>
            </div>
          )}

          {form.type === "recurring" && (
            <div className={styles.cols2}>
              <div className={styles.row}>
                <label className={styles.label}>День місяця</label>
                <input className={styles.input} type="number" min="1" max="31" value={form.recurringDay} onChange={e => set("recurringDay", e.target.value)} placeholder="1" />
              </div>
              <div className={styles.row}>
                <label className={styles.label}>Період</label>
                <select className={styles.input} value={form.recurringPeriod} onChange={e => set("recurringPeriod", e.target.value)}>
                  <option value="monthly">Щомісяця</option>
                  <option value="quarterly">Щокварталу</option>
                  <option value="yearly">Щорічно</option>
                </select>
              </div>
            </div>
          )}

          <div className={styles.row}>
            <label className={styles.label}>Пріоритет</label>
            <div className={styles.priorityRow}>
              {PRIORITIES.map(p => (
                <button key={p} type="button" className={[styles.priBtn, form.priority === p ? styles.priBtnActive : ""].join(" ")} onClick={() => set("priority", p)}>{p}</button>
              ))}
              <span className={styles.priHint}>{form.priority <= 2 ? "Низький" : form.priority === 3 ? "Середній" : form.priority === 4 ? "Високий" : "Критичний"}</span>
            </div>
          </div>

          <div className={styles.row}>
            <label className={styles.label}>Нотатки</label>
            <textarea className={styles.textarea} value={form.notes} onChange={e => set("notes", e.target.value)} placeholder="Деталі…" rows={2} />
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.btnCancel} onClick={onClose}>Скасувати</button>
          <button className={styles.btnSave} onClick={handleSubmit}>{debt ? "Зберегти" : (isReceivable ? "Записати позику" : "Додати борг")}</button>
        </div>
      </div>
    </div>
  );
}
