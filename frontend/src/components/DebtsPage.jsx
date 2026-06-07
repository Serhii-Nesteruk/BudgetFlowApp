import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { useDebts } from "../hooks/useDebts";
import DebtCard from "./DebtCard";
import DebtsModal from "./DebtsModal";
import PaymentModal from "./PaymentModal";
import styles from "./DebtsPage.module.css";
import { convertAmount, formatCurrency } from "../hooks/useCurrencyRates";

const DIRECTION_FILTERS = [
  { value: "payable", label: "Я винен", hint: "Мої зобов’язання" },
  { value: "receivable", label: "Винні мені", hint: "Мої позики" },
];

const STATUS_FILTERS = [
  { value: "all", label: "Всі" },
  { value: "unpaid", label: "Не закрито" },
  { value: "overdue", label: "Прострочено" },
  { value: "partial", label: "Частково" },
  { value: "paid", label: "Закрито" },
];

const TYPE_FILTERS = [
  { value: "all", label: "Всі типи" },
  { value: "one-time", label: "💸 Разові" },
  { value: "installment", label: "🏦 Кредити" },
  { value: "recurring", label: "🔁 Регулярні" },
];

const SORT_OPTIONS = [
  { value: "priority", label: "Пріоритет" },
  { value: "dueDate", label: "Термін" },
  { value: "amount", label: "Сума" },
  { value: "status", label: "Статус" },
];

const STATUS_ORDER = { overdue: 0, unpaid: 1, partial: 2, paid: 3 };

export default function DebtsPage({ rates, baseCurrency = "PLN" }) {
  const {
    debts,
    loading,
    error,
    addDebt,
    updateDebt,
    deleteDebt,
    markPaid,
    addPayment,
    addRecurringCharge,
  } = useDebts();

  const [direction, setDirection] = useState("payable");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("priority");

  const [modalOpen, setModalOpen] = useState(false);
  const [editDebt, setEditDebt] = useState(null);
  const [payModal, setPayModal] = useState({ open: false, debtId: null, mode: "payment" });

  const directionDebts = useMemo(
    () => debts.filter((d) => (d.direction || "payable") === direction),
    [debts, direction]
  );

  // ── Stats ──────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const active = directionDebts.filter((d) => d.status !== "paid");
    const totalRemaining = active.reduce(
      (s, d) => s + convertAmount(d.remaining, d.currency, baseCurrency, rates),
      0
    );
    const overdue = directionDebts.filter((d) => d.status === "overdue").length;
    const dueThisMonth = active.filter((d) => {
      const today = new Date();
      const due = new Date(d.dueDate);
      return due.getFullYear() === today.getFullYear() && due.getMonth() === today.getMonth();
    }).length;
    return { totalRemaining, overdue, dueThisMonth, total: directionDebts.length };
  }, [directionDebts, rates, baseCurrency]);

  const directionCounts = useMemo(
    () => ({
      payable: debts.filter((d) => (d.direction || "payable") === "payable" && d.status !== "paid")
        .length,
      receivable: debts.filter((d) => d.direction === "receivable" && d.status !== "paid").length,
    }),
    [debts]
  );

  // ── Filter + sort ──────────────────────────────────────────────────────
  const visible = useMemo(() => {
    let list = [...directionDebts];
    if (statusFilter !== "all") list = list.filter((d) => d.status === statusFilter);
    if (typeFilter !== "all") list = list.filter((d) => d.type === typeFilter);

    list.sort((a, b) => {
      if (sortBy === "priority") return b.priority - a.priority;
      if (sortBy === "dueDate") return a.dueDate.localeCompare(b.dueDate);
      if (sortBy === "amount") return b.remaining - a.remaining;
      if (sortBy === "status") return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      return 0;
    });
    return list;
  }, [directionDebts, statusFilter, typeFilter, sortBy]);

  // ── Handlers ───────────────────────────────────────────────────────────
  function handleDirectionChange(next) {
    setDirection(next);
    setStatusFilter("all");
    setTypeFilter("all");
  }
  function handleAdd() {
    setEditDebt(null);
    setModalOpen(true);
  }
  function handleEdit(id) {
    setEditDebt(debts.find((d) => d.id === id));
    setModalOpen(true);
  }
  async function handleSave(data) {
    try {
      if (editDebt) await updateDebt(editDebt.id, data);
      else await addDebt(data);
      setModalOpen(false);
    } catch {
      // The hook exposes the API error below the controls.
    }
  }
  function handleDelete(id) {
    const debt = debts.find((d) => d.id === id);
    const text =
      debt?.direction === "receivable" ? "Видалити запис про позику?" : "Видалити цей борг?";
    if (window.confirm(text)) deleteDebt(id).catch(() => {});
  }

  function handleAddPayment(id) {
    setPayModal({ open: true, debtId: id, mode: "payment" });
  }
  function handleAddRecurring(id) {
    setPayModal({ open: true, debtId: id, mode: "recurring" });
  }
  async function handlePaySave(data) {
    const { debtId, mode } = payModal;
    try {
      if (mode === "payment") await addPayment(debtId, data);
      else await addRecurringCharge(debtId, data);
      setPayModal({ open: false, debtId: null, mode: "payment" });
    } catch {
      // The hook exposes the API error below the controls.
    }
  }

  const payDebt = debts.find((d) => d.id === payModal.debtId) || null;
  const isReceivable = direction === "receivable";

  return (
    <div className={styles.page}>
      {/* ── Direction switch ── */}
      <div className={styles.directionPanel}>
        <div>
          <div className={styles.directionEyebrow}>Борговий баланс</div>
          <div className={styles.directionTitle}>Контролюй обидві сторони</div>
        </div>
        <div className={styles.directionSwitch}>
          {DIRECTION_FILTERS.map((item) => (
            <button
              key={item.value}
              className={[
                styles.directionBtn,
                direction === item.value ? styles.directionBtnActive : "",
                item.value === "receivable" ? styles.directionBtnReceivable : "",
              ].join(" ")}
              onClick={() => handleDirectionChange(item.value)}
            >
              <span className={styles.directionBtnText}>{item.label}</span>
              <span className={styles.directionBtnMeta}>
                {item.hint} · {directionCounts[item.value]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Summary cards ── */}
      <div
        className={[styles.summaryRow, isReceivable ? styles.summaryRowReceivable : ""].join(" ")}
      >
        <SumCard
          label={isReceivable ? "Мені мають повернути" : "Загальний борг"}
          value={formatCurrency(stats.totalRemaining, baseCurrency)}
          accent={isReceivable ? "green" : "red"}
        />
        <SumCard
          label="Прострочено"
          value={stats.overdue}
          accent={stats.overdue > 0 ? "red" : "gray"}
        />
        <SumCard
          label={isReceivable ? "Повернень цього міс" : "Платежів цього міс"}
          value={stats.dueThisMonth}
          accent="blue"
        />
        <SumCard
          label={isReceivable ? "Всього позик" : "Всього боргів"}
          value={stats.total}
          accent="gray"
        />
      </div>

      {/* ── Controls ── */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              className={[
                styles.filterBtn,
                statusFilter === f.value ? styles.filterBtnActive : "",
              ].join(" ")}
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
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            {TYPE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                ↕ {o.label}
              </option>
            ))}
          </select>
          <button className={[styles.addBtn, styles.controlsAddBtn].join(" ")} onClick={handleAdd}>
            {isReceivable ? "+ Записати позику" : "+ Новий борг"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 14, color: "#b42318", fontWeight: 700 }}>⚠ {error}</div>
      )}

      {/* ── List ── */}
      {loading ? (
        <div className={styles.empty}>
          <p>Завантаження боргів…</p>
        </div>
      ) : visible.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>{isReceivable ? "🤝" : "🎉"}</span>
          <p>{isReceivable ? "Ніхто нічого не винен" : "Боргів не знайдено"}</p>
          {statusFilter === "all" && typeFilter === "all" && (
            <button className={styles.addBtn} onClick={handleAdd}>
              {isReceivable ? "Записати першу позику" : "Додати перший борг"}
            </button>
          )}
        </div>
      ) : (
        <div className={styles.list}>
          {visible.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onMarkPaid={(id) => markPaid(id).catch(() => {})}
              onAddPayment={handleAddPayment}
              onAddRecurring={handleAddRecurring}
              rates={rates}
              displayCurrency={baseCurrency}
            />
          ))}
        </div>
      )}

      {createPortal(
        <button
          className={styles.mobileAddBtn}
          type="button"
          onClick={handleAdd}
          aria-label={isReceivable ? "Записати позику" : "Додати борг"}
        >
          <span>＋</span>
          {isReceivable ? "Позика" : "Борг"}
        </button>,
        document.body
      )}

      {/* ── Modals ── */}
      <DebtsModal
        open={modalOpen}
        debt={editDebt}
        defaultDirection={direction}
        defaultCurrency={baseCurrency}
        onSave={handleSave}
        onClose={() => setModalOpen(false)}
      />
      <PaymentModal
        open={payModal.open}
        debt={payDebt}
        mode={payModal.mode}
        rates={rates}
        displayCurrency={baseCurrency}
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
