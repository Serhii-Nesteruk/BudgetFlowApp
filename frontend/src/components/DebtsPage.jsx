import { useState, useMemo } from "react";
import { useDebts } from "../hooks/useDebts";
import DebtCard from "./DebtCard";
import DebtsModal from "./DebtsModal";
import PaymentModal from "./PaymentModal";
import styles from "./DebtsPage.module.css";

const STATUS_FILTERS = [
  { value: "all",     label: "Всі" },
  { value: "unpaid",  label: "Не оплачено" },
  { value: "overdue", label: "Прострочено" },
  { value: "partial", label: "Частково" },
  { value: "paid",    label: "Оплачено" },
];

const TYPE_FILTERS = [
  { value: "all",         label: "Всі типи" },
  { value: "one-time",    label: "💸 Разові" },
  { value: "installment", label: "🏦 Кредити" },
  { value: "recurring",   label: "🔁 Регулярні" },
];

const SORT_OPTIONS = [
  { value: "priority", label: "Пріоритет" },
  { value: "dueDate",  label: "Термін" },
  { value: "amount",   label: "Сума" },
  { value: "status",   label: "Статус" },
];

const STATUS_ORDER = { overdue: 0, unpaid: 1, partial: 2, paid: 3 };

export default function DebtsPage() {
  const { debts, addDebt, updateDebt, deleteDebt, markPaid, addPayment, addRecurringCharge } = useDebts();

  const [statusFilter, setStatusFilter]     = useState("all");
  const [typeFilter, setTypeFilter]         = useState("all");
  const [sortBy, setSortBy]                 = useState("priority");

  const [modalOpen, setModalOpen]           = useState(false);
  const [editDebt, setEditDebt]             = useState(null);

  const [payModal, setPayModal]             = useState({ open: false, debtId: null, mode: "payment" });

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = debts.filter(d => d.status !== "paid");
    const totalRemaining = active.reduce((s, d) => s + d.remaining, 0);
    const overdue = debts.filter(d => d.status === "overdue").length;
    const dueThisMonth = active.filter(d => {
      const today = new Date();
      const due = new Date(d.dueDate);
      return due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth();
    }).length;
    return { totalRemaining, overdue, dueThisMonth, total: debts.length };
  }, [debts]);

  // ── Filter + sort ──────────────────────────────────────────────────────
  const visible = useMemo(() => {
    let list = [...debts];
    if (statusFilter !== "all") list = list.filter(d => d.status === statusFilter);
    if (typeFilter !== "all")   list = list.filter(d => d.type === typeFilter);

    list.sort((a, b) => {
      if (sortBy === "priority") return b.priority - a.priority;
      if (sortBy === "dueDate")  return a.dueDate.localeCompare(b.dueDate);
      if (sortBy === "amount")   return b.remaining - a.remaining;
      if (sortBy === "status")   return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      return 0;
    });
    return list;
  }, [debts, statusFilter, typeFilter, sortBy]);

  // ── Handlers ───────────────────────────────────────────────────────────
  function handleAdd()        { setEditDebt(null); setModalOpen(true); }
  function handleEdit(id)     { setEditDebt(debts.find(d => d.id === id)); setModalOpen(true); }
  function handleSave(data)   { editDebt ? updateDebt(editDebt.id, data) : addDebt(data); setModalOpen(false); }
  function handleDelete(id)   { if (window.confirm("Видалити цей борг?")) deleteDebt(id); }

  function handleAddPayment(id)   { setPayModal({ open: true, debtId: id, mode: "payment" }); }
  function handleAddRecurring(id) { setPayModal({ open: true, debtId: id, mode: "recurring" }); }
  function handlePaySave(data) {
    const { debtId, mode } = payModal;
    if (mode === "payment")   addPayment(debtId, data);
    else                      addRecurringCharge(debtId, data);
    setPayModal({ open: false, debtId: null, mode: "payment" });
  }

  const payDebt = debts.find(d => d.id === payModal.debtId) || null;

  return (
    <div className={styles.page}>
      {/* ── Summary cards ── */}
      <div className={styles.summaryRow}>
        <SumCard label="Загальний борг"    value={`₴${stats.totalRemaining.toLocaleString("uk-UA")}`} accent="red" />
        <SumCard label="Прострочено"       value={stats.overdue}       accent={stats.overdue > 0 ? "red" : "gray"} />
        <SumCard label="Платежів цього міс" value={stats.dueThisMonth} accent="blue" />
        <SumCard label="Всього боргів"     value={stats.total}         accent="gray" />
      </div>

      {/* ── Controls ── */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              className={[styles.filterBtn, statusFilter === f.value ? styles.filterBtnActive : ""].join(" ")}
              onClick={() => setStatusFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className={styles.rightControls}>
          <select
            className={styles.select}
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            {TYPE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>

          <select
            className={styles.select}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>↕ {o.label}</option>)}
          </select>

          <button className={styles.addBtn} onClick={handleAdd}>
            + Новий борг
          </button>
        </div>
      </div>

      {/* ── List ── */}
      {visible.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🎉</span>
          <p>Боргів не знайдено</p>
          {statusFilter === "all" && typeFilter === "all" && (
            <button className={styles.addBtn} onClick={handleAdd}>Додати перший борг</button>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {visible.map(debt => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkPaid={markPaid}
              onAddPayment={handleAddPayment}
              onAddRecurring={handleAddRecurring}
            />
          ))}
        </div>
      )}

      {/* ── Modals ── */}
      <DebtsModal
        open={modalOpen}
        debt={editDebt}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />

      <PaymentModal
        open={payModal.open}
        debt={payDebt}
        mode={payModal.mode}
        onSave={handlePaySave}
        onClose={() => setPayModal({ open: false, debtId: null, mode: "payment" })}
      />
    </div>
  );
}

function SumCard({ label, value, accent }) {
  return (
    <div className={[styles.sumCard, styles[`sumCard_${accent}`]].join(" ")}>
      <span className={styles.sumValue}>{value}</span>
      <span className={styles.sumLabel}>{label}</span>
    </div>
  );
}
