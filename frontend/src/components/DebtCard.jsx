import { useState } from "react";
import styles from "./DebtCard.module.css";
import { convertAmount, formatCurrency } from "../hooks/useCurrencyRates";

const STATUS_CFG = {
  payable: {
    unpaid: { label: "Не оплачено", cls: "unpaid" },
    overdue: { label: "Прострочено", cls: "overdue" },
    partial: { label: "Частково оплачено", cls: "partial" },
    paid: { label: "Оплачено", cls: "paid" },
  },
  receivable: {
    unpaid: { label: "Не повернуто", cls: "unpaid" },
    overdue: { label: "Прострочено", cls: "overdue" },
    partial: { label: "Частково повернуто", cls: "partial" },
    paid: { label: "Повернуто", cls: "paid" },
  },
};

const TYPE_ICON = { "one-time": "💸", installment: "🏦", recurring: "🔁" };
const PRI_COLOR = ["", "#6b7280", "#3b82f6", "#f59e0b", "#ef4444", "#7c3aed"];

export default function DebtCard({
  debt,
  onEdit,
  onDelete,
  onMarkPaid,
  onAddPayment,
  onAddRecurring,
  rates,
  displayCurrency = "PLN",
}) {
  const [expanded, setExpanded] = useState(false);
  const direction = debt.direction || "payable";
  const isReceivable = direction === "receivable";
  const sc = STATUS_CFG[direction]?.[debt.status] || STATUS_CFG.payable.unpaid;
  const progress = debt.amount > 0 ? ((debt.amount - debt.remaining) / debt.amount) * 100 : 0;
  const today = new Date().toISOString().slice(0, 10);
  const daysLeft = Math.round((new Date(debt.dueDate) - new Date()) / 86400000);
  const overdue = debt.dueDate < today && debt.status !== "paid";
  const money = (value) =>
    formatCurrency(convertAmount(value, debt.currency, displayCurrency, rates), displayCurrency);

  return (
    <div
      className={[
        styles.card,
        styles[`status_${sc.cls}`],
        isReceivable ? styles.direction_receivable : styles.direction_payable,
      ].join(" ")}
    >
      {/* ── Top row ── */}
      <div className={styles.topRow}>
        <div className={styles.leftGroup}>
          <span className={styles.typeIcon}>{TYPE_ICON[debt.type]}</span>
          <div className={styles.meta}>
            <span className={styles.creditor}>{debt.creditor}</span>
            <div className={styles.tags}>
              <span
                className={[
                  styles.directionBadge,
                  isReceivable ? styles.directionBadgeReceivable : "",
                ].join(" ")}
              >
                {isReceivable ? "Вам винні" : "Ви винні"}
              </span>
              <span className={[styles.badge, styles[`badge_${sc.cls}`]].join(" ")}>
                {sc.label}
              </span>
              <span
                className={styles.priDot}
                style={{ background: PRI_COLOR[debt.priority] }}
                title={`Пріоритет ${debt.priority}`}
              />
            </div>
          </div>
        </div>
        <div className={styles.amountGroup}>
          <span className={styles.remaining}>{money(debt.remaining)}</span>
          {debt.remaining !== debt.amount && (
            <span className={styles.total}>з {money(debt.amount)}</span>
          )}
        </div>
      </div>

      {/* ── Progress bar (shown for installment and partial) ── */}
      {(debt.type === "installment" || debt.status === "partial") && debt.amount > 0 && (
        <div className={styles.progressWrap}>
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.progressLabel}>
            {Math.round(progress)}% {isReceivable ? "повернуто" : "сплачено"}
          </span>
        </div>
      )}

      {/* ── Due date ── */}
      <div className={styles.dueRow}>
        <span className={[styles.dueLabel, overdue ? styles.dueLabelOverdue : ""].join(" ")}>
          {overdue
            ? `⚠ Прострочено на ${Math.abs(daysLeft)} дн.`
            : debt.status === "paid"
              ? isReceivable
                ? "✓ Повернуто"
                : "✓ Оплачено"
              : daysLeft === 0
                ? "⚡ Сьогодні"
                : `📅 ${debt.dueDate}${daysLeft > 0 ? ` · залишилось ${daysLeft} дн.` : ""}`}
        </span>
        {debt.type === "installment" && (
          <span className={styles.installInfo}>
            {debt.paidInstallments}/{debt.totalInstallments} платежів
          </span>
        )}
        {debt.notes && (
          <span className={styles.notePreview} title={debt.notes}>
            📝 {debt.notes}
          </span>
        )}
      </div>

      {/* ── Actions ── */}
      <div className={styles.actions}>
        <div className={styles.actLeft}>
          <button className={styles.actBtn} onClick={() => setExpanded((e) => !e)}>
            {expanded ? "Згорнути ▲" : "Деталі ▼"}
          </button>
        </div>
        <div className={styles.actRight}>
          {debt.status !== "paid" && debt.type === "recurring" && (
            <button
              className={[styles.actBtn, styles.actBtnSecondary].join(" ")}
              onClick={() => onAddRecurring(debt.id)}
            >
              + Нарахування
            </button>
          )}
          {debt.status !== "paid" && (
            <button
              className={[styles.actBtn, styles.actBtnSecondary].join(" ")}
              onClick={() => onAddPayment(debt.id)}
            >
              {isReceivable ? "+ Повернення" : "+ Платіж"}
            </button>
          )}
          {debt.status !== "paid" && (
            <button
              className={[styles.actBtn, styles.actBtnPaid].join(" ")}
              onClick={() => onMarkPaid(debt.id)}
            >
              {isReceivable ? "✓ Повернуто" : "✓ Оплачено"}
            </button>
          )}
          <button className={styles.actIconBtn} onClick={() => onEdit(debt.id)} title="Редагувати">
            ✏
          </button>
          <button
            className={[styles.actIconBtn, styles.actIconDanger].join(" ")}
            onClick={() => onDelete(debt.id)}
            title="Видалити"
          >
            🗑
          </button>
        </div>
      </div>

      {/* ── Expanded details ── */}
      {expanded && (
        <div className={styles.expanded}>
          {debt.type === "installment" && debt.installmentSchedule?.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>Графік платежів</div>
              <div className={styles.scheduleGrid}>
                {debt.installmentSchedule.map((s) => (
                  <div
                    key={s.index}
                    className={[
                      styles.scheduleItem,
                      s.paid
                        ? styles.scheduleItemPaid
                        : s.date < today
                          ? styles.scheduleItemOverdue
                          : "",
                    ].join(" ")}
                  >
                    <span className={styles.scheduleNum}>#{s.index}</span>
                    <span className={styles.scheduleDate}>{s.date}</span>
                    <span className={styles.scheduleAmt}>{money(s.amount)}</span>
                    <span className={styles.scheduleMark}>
                      {s.paid ? "✓" : s.date < today ? "!" : "·"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {debt.paymentHistory?.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionTitle}>
                {isReceivable ? "Історія повернень" : "Історія сплат"}
              </div>
              <div className={styles.historyList}>
                {[...debt.paymentHistory].reverse().map((p) => (
                  <div key={p.id} className={styles.histItem}>
                    <span className={styles.histDate}>{p.date}</span>
                    <span className={styles.histNote}>{p.note || "—"}</span>
                    <span className={styles.histAmt}>{money(p.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {debt.paymentHistory?.length === 0 && debt.type !== "installment" && (
            <div className={styles.emptyHistory}>
              {isReceivable ? "Повернень ще не було" : "Платежів ще не було"}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
