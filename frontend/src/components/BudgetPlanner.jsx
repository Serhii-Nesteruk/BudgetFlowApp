import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "./BudgetPlanner.css";

const MONTHS_UA = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

const MONTHS_UA_GEN = [
  "Січня",
  "Лютого",
  "Березня",
  "Квітня",
  "Травня",
  "Червня",
  "Липня",
  "Серпня",
  "Вересня",
  "Жовтня",
  "Листопада",
  "Грудня",
];

const DOW_UA = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];

const initialBudget = {
  year: 2025,
  month: 5,
  totalLimit: 6000,
  todayDay: 17,
  incomeSources: [
    {
      id: "i1",
      name: "Зарплата",
      icon: "💼",
      iconBg: "#eaf3de",
      iconColor: "#2d7a3a",
      frequency: "Щомісяця · 1-го числа",
      amount: 5500,
      status: "received",
    },
    {
      id: "i2",
      name: "Фріланс",
      icon: "💻",
      iconBg: "#E6F1FB",
      iconColor: "#185FA5",
      frequency: "Непостійно · очікується",
      amount: 1700,
      status: "pending",
    },
  ],
  mandatoryExpenses: [
    { id: "m1", name: "Оренда квартири", color: "#185FA5", amount: 1800, paid: 1800, paymentType: "auto" },
    { id: "m2", name: "Комунальні послуги", color: "#185FA5", amount: 340, paid: 340, paymentType: "auto" },
    { id: "m3", name: "Страховка", color: "#0891b2", amount: 120, paid: 120, paymentType: "manual" },
  ],
  categories: [
    { id: "c1", name: "Продукти", sub: "Biedronka, Lidl, Żabka", limit: 1500, spent: 1240, active: true, color: "#2d7a3a" },
    { id: "c2", name: "Транспорт", sub: "Orlen, PKP, ZTM", limit: 500, spent: 680, active: true, color: "#534AB7" },
    { id: "c3", name: "Розваги", sub: "Netflix, кіно", limit: 600, spent: 920, active: true, color: "#A32D2D" },
    { id: "c4", name: "Кафе та ресторани", sub: "Starbucks, McDonald's", limit: 400, spent: 340, active: true, color: "#854F0B" },
    { id: "c5", name: "Відпустка (липень)", sub: "Заплановано · ще не активно", limit: 2000, spent: 0, active: false, color: "#888780" },
  ],
  transactions: [
    { id: "t1", day: 1, desc: "Оренда квартири", cat: "Обов'язкові", amount: -1800, type: "mandatory" },
    { id: "t2", day: 1, desc: "Зарплата", cat: "Дохід", amount: 5500, type: "income" },
    { id: "t3", day: 2, desc: "Biedronka", cat: "Продукти", amount: -87, type: "expense" },
    { id: "t4", day: 3, desc: "Żabka", cat: "Продукти", amount: -34, type: "expense" },
    { id: "t5", day: 5, desc: "Netflix", cat: "Розваги", amount: -55, type: "expense" },
    { id: "t6", day: 7, desc: "PKP квиток", cat: "Транспорт", amount: -120, type: "expense" },
    { id: "t7", day: 8, desc: "Комунальні", cat: "Обов'язкові", amount: -340, type: "mandatory" },
    { id: "t8", day: 10, desc: "Ресторан", cat: "Кафе та ресторани", amount: -180, type: "expense" },
    { id: "t9", day: 12, desc: "Lidl", cat: "Продукти", amount: -210, type: "expense" },
    { id: "t10", day: 14, desc: "Кіно", cat: "Розваги", amount: -95, type: "expense" },
    { id: "t11", day: 15, desc: "Фріланс оплата", cat: "Дохід", amount: 1700, type: "income" },
    { id: "t12", day: 15, desc: "Orlen пальне", cat: "Транспорт", amount: -350, type: "expense" },
    { id: "t13", day: 16, desc: "Starbucks", cat: "Кафе та ресторани", amount: -48, type: "expense" },
    { id: "t14", day: 17, desc: "Lidl закупівля", cat: "Продукти", amount: -320, type: "expense" },
    { id: "t15", day: 17, desc: "Страховка", cat: "Обов'язкові", amount: -120, type: "mandatory" },
  ],
  periods: [
    { id: "p1", label: "Квітень 2025", status: "done", statusLabel: "Завершено", spent: 5630, limit: 6000, badge: "ok", badgeLabel: "В межах" },
    { id: "p2", label: "Травень 2025", status: "active", statusLabel: "Активний", spent: null, limit: 6000, badge: "active", badgeLabel: "В процесі" },
    { id: "p3", label: "Червень 2025", status: "draft", statusLabel: "Запланований", spent: null, limit: 6000, badge: "draft", badgeLabel: "Чернетка" },
  ],
};

const emptyForms = {
  income: { name: "", amount: "", status: "received", frequency: "" },
  mandatory: { name: "", amount: "", paymentType: "auto" },
  category: { name: "", sub: "", limit: "", color: "#2d7a3a" },
  transaction: { desc: "", amount: "", day: "", catId: "", isExpense: true },
  budget: { month: 5, year: 2025, limit: 6000 },
};

function fmt(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("uk-UA")} zł`;
}

function fmtShort(value) {
  return Math.round(Number(value) || 0).toLocaleString("uk-UA");
}

function uid(prefix) {
  return `${prefix}${Date.now()}${Math.random().toString(16).slice(2)}`;
}

function getCategoryStatus(cat) {
  if (!cat.active) return { label: "не активно", cls: "status-inactive" };

  const pct = Math.round((cat.spent / cat.limit) * 100);
  const over = cat.spent - cat.limit;

  if (over > 0) return { label: `⚠ +${fmt(over)}`, cls: "status-over" };
  if (pct >= 80) return { label: `${pct}% — обережно`, cls: "status-warn" };
  return { label: `${pct}% — ok`, cls: "status-ok" };
}

function buildSummary(budget) {
  const totalIncome = budget.incomeSources.reduce((sum, item) => sum + item.amount, 0);
  const totalMandatory = budget.mandatoryExpenses.reduce((sum, item) => sum + item.paid, 0);
  const totalCatSpent = budget.categories
    .filter((cat) => cat.active)
    .reduce((sum, cat) => sum + Math.min(cat.spent, cat.limit), 0);
  const totalSpent = totalMandatory + totalCatSpent;
  const overflowCount = budget.categories.filter((cat) => cat.active && cat.spent > cat.limit).length;
  const spentPct = Math.round((totalSpent / budget.totalLimit) * 100);
  const remaining = budget.totalLimit - totalSpent;

  return { totalIncome, totalSpent, overflowCount, spentPct, remaining };
}

function MetricCards({ budget, summary }) {
  return (
    <div className="metrics">
      <div className="mc dark">
        <div className="mc-lbl">Загальний бюджет</div>
        <div className="mc-val">{fmt(budget.totalLimit)}</div>
        <div className="mc-sub">
          {MONTHS_UA[budget.month - 1].toLowerCase()} {budget.year}
        </div>
      </div>

      <div className="mc">
        <div className="mc-lbl">Очікуваний дохід</div>
        <div className="mc-val">{fmt(summary.totalIncome)}</div>
        <div className="badge badge-ok">↑ +{fmt(summary.totalIncome - budget.totalLimit)} резерв</div>
      </div>

      <div className="mc">
        <div className="mc-lbl">Витрачено</div>
        <div className="mc-val">{fmt(summary.totalSpent)}</div>
        <div className="badge badge-warn">↗ {summary.spentPct}% бюджету</div>
      </div>

      <div className="mc">
        <div className="mc-lbl">Перевищень</div>
        <div className="mc-val">{summary.overflowCount} кат.</div>
        {summary.overflowCount > 0 ? (
          <div className="badge badge-danger">⚠ Увага</div>
        ) : (
          <div className="badge badge-ok">✓ Норма</div>
        )}
      </div>
    </div>
  );
}

function CalendarCard({ budget, selectedDay, calOpen, onToggle, onSelectDay, onOpenModal }) {
  const daysInMonth = new Date(budget.year, budget.month, 0).getDate();
  const firstDow = (new Date(budget.year, budget.month - 1, 1).getDay() + 6) % 7;

  const txByDay = useMemo(() => {
    return budget.transactions.reduce((acc, tx) => {
      acc[tx.day] = acc[tx.day] ? [...acc[tx.day], tx] : [tx];
      return acc;
    }, {});
  }, [budget.transactions]);

  const selectedTransactions = selectedDay ? txByDay[selectedDay] || [] : [];
  const selectedTotal = selectedTransactions.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="card">
      <div className="cal-header" onClick={onToggle}>
        <div className="cal-toggle">
          <span className={`cal-arrow ${calOpen ? "open" : ""}`}>▶</span>
          <span>
            Календар — {MONTHS_UA[budget.month - 1]} {budget.year}
          </span>
        </div>
        <div style={{ display: "flex", gap: 7 }}>
          <button
            className="card-action"
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onOpenModal("transaction");
            }}
          >
            ＋ Транзакція
          </button>
        </div>
      </div>

      <div className={`cal-body ${calOpen ? "open" : ""}`}>
        <div className="cal-grid-wrap">
          <div className="cal-dow">
            {DOW_UA.map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className="cal-grid">
            {Array.from({ length: firstDow }).map((_, index) => (
              <div className="cal-day empty" key={`empty-${index}`} />
            ))}

            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1;
              const transactions = txByDay[day] || [];
              const hasOver = transactions.some((tx) => tx.type === "expense" && tx.amount < -200);
              const hasWarn = transactions.length > 0 && !hasOver && transactions.some((tx) => tx.type === "expense");
              const hasIncome = transactions.some((tx) => tx.type === "income");
              const dotCls = hasOver ? "dot-red" : hasIncome ? "dot-green" : hasWarn ? "dot-amber" : "";
              const hasDot = transactions.length > 0;
              const isToday = day === budget.todayDay && budget.month === 5 && budget.year === 2025;
              const isSelected = day === selectedDay;

              return (
                <button
                  type="button"
                  key={day}
                  className={`cal-day ${isToday ? "today" : ""} ${isSelected && !isToday ? "selected" : ""} ${
                    hasDot ? `has-expense ${dotCls}` : ""
                  }`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelectDay(day);
                  }}
                >
                  {day}
                  {hasDot && <div className="dot" />}
                </button>
              );
            })}
          </div>

          <div className="cal-legend">
            <div className="cal-leg-item">
              <div className="cal-leg-dot" style={{ background: "#E24B4A" }} />
              Перевищення
            </div>
            <div className="cal-leg-item">
              <div className="cal-leg-dot" style={{ background: "#EF9F27" }} />
              Великі витрати
            </div>
            <div className="cal-leg-item">
              <div className="cal-leg-dot" style={{ background: "#639922" }} />
              Дохід
            </div>
          </div>

          <div className="cal-selected-info">
            {!selectedDay || selectedTransactions.length === 0 ? (
              <span style={{ color: "var(--hint)" }}>
                {selectedDay
                  ? `${MONTHS_UA_GEN[budget.month - 1]} ${selectedDay} — немає транзакцій`
                  : "Оберіть день щоб переглянути транзакції"}
              </span>
            ) : (
              <>
                <div style={{ fontWeight: 500, fontSize: 12.5, marginBottom: 7, color: "var(--text)" }}>
                  {MONTHS_UA_GEN[budget.month - 1]} {selectedDay} — {selectedTransactions.length} транзакцій · сальдо{" "}
                  <span style={{ color: selectedTotal >= 0 ? "var(--green-text)" : "var(--red-text)" }}>
                    {selectedTotal >= 0 ? "+" : ""}
                    {fmt(selectedTotal)}
                  </span>
                </div>

                {selectedTransactions.map((tx) => (
                  <div
                    key={tx.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "3px 0",
                      borderBottom: "0.5px solid var(--border)",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 12 }}>{tx.desc}</span>
                      <span style={{ fontSize: 10.5, color: "var(--hint)", marginLeft: 6 }}>{tx.cat}</span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-mono,'monospace')",
                        fontSize: 12,
                        fontWeight: 500,
                        color: tx.amount >= 0 ? "var(--green-text)" : "var(--text)",
                      }}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {fmt(tx.amount)}
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function IncomeCard({ sources, onOpenModal }) {
  const total = sources.reduce((sum, source) => sum + source.amount, 0);

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">
          Очікувані доходи{" "}
          <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>{fmt(total)}</span>
        </span>
        <button className="card-action" type="button" onClick={() => onOpenModal("income")}>
          ＋ Додати
        </button>
      </div>

      {sources.map((source) => (
        <div className="income-row" key={source.id}>
          <div className="income-left">
            <div className="income-icon" style={{ background: source.iconBg, color: source.iconColor }}>
              {source.icon}
            </div>
            <div>
              <div className="income-name">{source.name}</div>
              <div className="income-freq">{source.frequency}</div>
            </div>
          </div>
          <div>
            <div className={`income-amt ${source.status !== "received" ? "pending" : ""}`}>+{fmt(source.amount)}</div>
            <div className={`income-status ${source.status === "received" ? "status-received" : "status-pending"}`}>
              {source.status === "received" ? "✓ Отримано" : "⏳ Очікується"}
            </div>
          </div>
        </div>
      ))}

      <button className="add-btn" type="button" onClick={() => onOpenModal("income")}>
        ＋ Додати джерело доходу
      </button>
    </div>
  );
}

function MandatoryCard({ expenses, onOpenModal }) {
  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Обов'язкові витрати</span>
        <button className="card-action" type="button" onClick={() => onOpenModal("mandatory")}>
          ＋ Додати
        </button>
      </div>

      {expenses.map((expense) => {
        const pct = Math.min(100, Math.round((expense.paid / expense.amount) * 100));

        return (
          <div className="mand-row" key={expense.id}>
            <div className="mand-top">
              <div className="mand-left">
                <div className="mand-dot" style={{ background: expense.color }} />
                <div className="mand-name">{expense.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span className={`mand-badge ${expense.paymentType === "auto" ? "mand-badge-auto" : "mand-badge-manual"}`}>
                  {expense.paymentType === "auto" ? "Авто" : "Вручну"}
                </span>
                <span className="mand-right">{fmt(expense.amount)}</span>
              </div>
            </div>
            <div className="prog-track">
              <div className="prog-fill" style={{ width: `${pct}%`, background: expense.color }} />
            </div>
          </div>
        );
      })}

      <button className="add-btn" type="button" onClick={() => onOpenModal("mandatory")}>
        ＋ Додати обов'язкову статтю
      </button>
    </div>
  );
}

function CategoriesCard({ categories, onOpenModal, onToggleCategory }) {
  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Контроль за категоріями</span>
        <button className="card-action" type="button" onClick={() => onOpenModal("category")}>
          ＋ Нова
        </button>
      </div>

      {categories.map((cat) => {
        const status = getCategoryStatus(cat);
        const pct = cat.active ? Math.min(100, Math.round((cat.spent / cat.limit) * 100)) : 0;
        const barColor = cat.spent > cat.limit ? "#E24B4A" : cat.color;

        return (
          <div className="cat-row" key={cat.id}>
            <div className="cat-row-head">
              <div className="cat-info">
                <button
                  className={`checkbox ${cat.active ? "checked" : ""}`}
                  type="button"
                  onClick={() => onToggleCategory(cat.id)}
                  aria-label={cat.active ? `Деактивувати ${cat.name}` : `Активувати ${cat.name}`}
                >
                  {cat.active ? "✓" : ""}
                </button>
                <div>
                  <div className={`cat-name ${!cat.active ? "inactive" : ""}`}>{cat.name}</div>
                </div>
              </div>
              <div className="cat-right">
                <span className="cat-limit">{fmt(cat.limit)}</span>
                <span className={`cat-status ${status.cls}`}>{status.label}</span>
              </div>
            </div>

            <div style={{ fontSize: 11, color: "var(--hint)", margin: "0 0 5px 24px" }}>
              {cat.sub}
              {cat.active ? ` · ${fmt(cat.spent)} / ${fmt(cat.limit)}` : ""}
            </div>

            {cat.active && (
              <div className="cat-prog-track">
                <div className="prog-fill" style={{ width: `${pct}%`, background: barColor }} />
              </div>
            )}
          </div>
        );
      })}

      <button className="add-btn" type="button" onClick={() => onOpenModal("category")}>
        ＋ Додати категорію
      </button>
    </div>
  );
}

function AlertsCard({ categories }) {
  const alerts = useMemo(() => {
    const items = [];

    categories
      .filter((cat) => cat.active && cat.spent > cat.limit)
      .forEach((cat) => {
        const over = cat.spent - cat.limit;
        const pct = Math.round(((cat.spent - cat.limit) / cat.limit) * 100);
        items.push({
          id: `danger-${cat.id}`,
          type: "danger",
          icon: "⚠",
          title: `${cat.name} — перевищено на ${pct}%`,
          desc: `${fmt(over)} понад ліміт`,
        });
      });

    categories
      .filter((cat) => cat.active && cat.spent <= cat.limit && cat.spent / cat.limit >= 0.8)
      .forEach((cat) => {
        const pct = Math.round((cat.spent / cat.limit) * 100);
        const remaining = cat.limit - cat.spent;
        items.push({
          id: `warn-${cat.id}`,
          type: "warn",
          icon: "🔥",
          title: `${cat.name} — ${pct}% бюджету`,
          desc: `Залишилось ${fmt(remaining)}`,
        });
      });

    if (items.length === 0) {
      items.push({ id: "ok", type: "ok", icon: "✓", title: "Все в нормі", desc: "Жодних перевищень цього місяця" });
    }

    return items;
  }, [categories]);

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Контроль перевищень</span>
        <button className="card-action" type="button">
          🔔 Сповіщення
        </button>
      </div>

      {alerts.map((alert) => (
        <div className="alert-row" key={alert.id}>
          <div className={`alert-icon ${alert.type}`}>{alert.icon}</div>
          <div>
            <div className="alert-title">{alert.title}</div>
            <div className="alert-desc">{alert.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutCard({ budget }) {
  const slices = useMemo(
    () => [
      {
        label: "Обов'язкові",
        color: "#185FA5",
        amount: budget.mandatoryExpenses.reduce((sum, item) => sum + item.paid, 0),
      },
      ...budget.categories
        .filter((cat) => cat.active && cat.spent > 0)
        .map((cat) => ({ label: cat.name, color: cat.color, amount: cat.spent })),
    ],
    [budget.mandatoryExpenses, budget.categories],
  );

  const totalSpent = slices.reduce((sum, slice) => sum + slice.amount, 0);
  const cx = 44;
  const cy = 44;
  const r = 33;
  const circ = 2 * Math.PI * r;
  let offset = 0;

  const paths = slices.map((slice) => {
    const dash = totalSpent > 0 ? (slice.amount / totalSpent) * circ : 0;
    const path = { dash, offset, color: slice.color };
    offset += dash;
    return path;
  });

  const remaining = Math.max(0, budget.totalLimit - totalSpent);

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Розподіл витрат</span>
      </div>

      <div className="donut-section">
        <div className="donut-wrap">
          <svg width="88" height="88" viewBox="0 0 88 88" style={{ flexShrink: 0 }} aria-label="Розподіл витрат">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface2)" strokeWidth="11" />
            {paths.map((path, index) => (
              <circle
                key={slices[index].label}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={path.color}
                strokeWidth="11"
                strokeDasharray={`${path.dash.toFixed(2)} ${(circ - path.dash).toFixed(2)}`}
                strokeDashoffset={(-path.offset).toFixed(2)}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            ))}
            <text
              x={cx}
              y={cy - 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="500"
              fill="var(--text)"
              fontFamily="var(--font-mono,'monospace')"
            >
              {fmtShort(totalSpent)}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="7.5" fill="var(--muted)">
              витрачено
            </text>
          </svg>

          <div className="donut-legend">
            {slices.slice(0, 5).map((slice) => (
              <div className="leg-row" key={slice.label}>
                <div className="leg-dot" style={{ background: slice.color }} />
                <span className="leg-name">{slice.label}</span>
                <span className="leg-val">{fmtShort(slice.amount)} zł</span>
              </div>
            ))}
          </div>
        </div>

        <div className="donut-foot">
          Бюджет: <strong>{fmt(budget.totalLimit)}</strong> · Залишилось: <strong>{fmt(remaining)}</strong>
        </div>
      </div>
    </div>
  );
}

function PeriodsCard({ budget, summary, onOpenModal }) {
  const activeLabel = `${MONTHS_UA[budget.month - 1]} ${budget.year}`;

  const periods = budget.periods.map((period) => {
    if (period.status === "active") {
      return { ...period, label: activeLabel, spent: summary.totalSpent, limit: budget.totalLimit };
    }
    return period;
  });

  return (
    <div className="card">
      <div className="card-head">
        <span className="card-title">Заплановані бюджети</span>
        <button className="card-action" type="button" onClick={() => onOpenModal("budget")}>
          ＋ Новий
        </button>
      </div>

      <div className="period-list">
        {periods.map((period) => (
          <div className={`period-item ${period.status}`} key={period.id}>
            <div>
              <div className={`period-label ${period.status}`}>{period.label}</div>
              <div className="period-status">{period.statusLabel}</div>
            </div>
            <div className="period-right">
              <div className={`period-amt ${period.status}`}>
                {period.spent !== null ? `${fmtShort(period.spent)} / ${fmtShort(period.limit)} zł` : `${fmtShort(period.limit)} zł`}
              </div>
              <span className={`period-badge ${period.badge}`}>{period.badgeLabel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetModal({ type, budget, form, setForm, onClose, onSubmit }) {
  const activeCategories = budget.categories.filter((cat) => cat.active);

  const titleByType = {
    income: "Додати джерело доходу",
    mandatory: "Додати обов'язкову витрату",
    category: "Нова категорія",
    transaction: "Додати транзакцію",
    budget: "Новий бюджет",
  };

  if (!type || typeof document === "undefined") return null;

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  return createPortal(
    <div className="budgetPlanner budgetPlannerModalRoot">
      <div className="modal-overlay open" onClick={onClose}>
        <form className="modal" onSubmit={onSubmit} onClick={(event) => event.stopPropagation()}>
        <div className="modal-title">
          <span>{titleByType[type]}</span>
          <button className="modal-close" type="button" onClick={onClose}>
            ✕
          </button>
        </div>

        {type === "income" && (
          <>
            <div className="form-group">
              <label className="form-label">Назва</label>
              <input className="form-input" value={form.name} onChange={(e) => patch("name", e.target.value)} placeholder="Зарплата, фріланс..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Сума (zł)</label>
                <input className="form-input" value={form.amount} onChange={(e) => patch("amount", e.target.value)} type="number" placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Статус</label>
                <select className="form-select" value={form.status} onChange={(e) => patch("status", e.target.value)}>
                  <option value="received">Отримано</option>
                  <option value="pending">Очікується</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Частота</label>
              <input className="form-input" value={form.frequency} onChange={(e) => patch("frequency", e.target.value)} placeholder="Щомісяця · 1-го числа" />
            </div>
          </>
        )}

        {type === "mandatory" && (
          <>
            <div className="form-group">
              <label className="form-label">Назва</label>
              <input className="form-input" value={form.name} onChange={(e) => patch("name", e.target.value)} placeholder="Оренда, інтернет..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Сума (zł)</label>
                <input className="form-input" value={form.amount} onChange={(e) => patch("amount", e.target.value)} type="number" placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">Тип оплати</label>
                <select className="form-select" value={form.paymentType} onChange={(e) => patch("paymentType", e.target.value)}>
                  <option value="auto">Автоматично</option>
                  <option value="manual">Вручну</option>
                </select>
              </div>
            </div>
          </>
        )}

        {type === "category" && (
          <>
            <div className="form-group">
              <label className="form-label">Назва</label>
              <input className="form-input" value={form.name} onChange={(e) => patch("name", e.target.value)} placeholder="Продукти, спорт..." />
            </div>
            <div className="form-group">
              <label className="form-label">Мітки (магазини, сервіси)</label>
              <input className="form-input" value={form.sub} onChange={(e) => patch("sub", e.target.value)} placeholder="Biedronka, Lidl..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Ліміт (zł)</label>
                <input className="form-input" value={form.limit} onChange={(e) => patch("limit", e.target.value)} type="number" placeholder="500" />
              </div>
              <div className="form-group">
                <label className="form-label">Колір</label>
                <select className="form-select" value={form.color} onChange={(e) => patch("color", e.target.value)}>
                  <option value="#2d7a3a">Зелений</option>
                  <option value="#185FA5">Синій</option>
                  <option value="#534AB7">Фіолетовий</option>
                  <option value="#A32D2D">Червоний</option>
                  <option value="#854F0B">Помаранчевий</option>
                  <option value="#0891b2">Блакитний</option>
                </select>
              </div>
            </div>
          </>
        )}

        {type === "transaction" && (
          <>
            <div className="form-group">
              <label className="form-label">Опис</label>
              <input className="form-input" value={form.desc} onChange={(e) => patch("desc", e.target.value)} placeholder="Biedronka, кафе..." />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Сума (zł)</label>
                <input className="form-input" value={form.amount} onChange={(e) => patch("amount", e.target.value)} type="number" placeholder="0" />
              </div>
              <div className="form-group">
                <label className="form-label">День</label>
                <input className="form-input" value={form.day} onChange={(e) => patch("day", e.target.value)} type="number" min="1" max="31" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Категорія</label>
              <select className="form-select" value={form.catId} onChange={(e) => patch("catId", e.target.value)}>
                {activeCategories.map((cat) => (
                  <option value={cat.id} key={cat.id}>
                    {cat.name}
                  </option>
                ))}
                <option value="income">Дохід</option>
              </select>
            </div>
            <div className="form-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                checked={form.isExpense}
                id="budget-is-expense"
                onChange={(e) => patch("isExpense", e.target.checked)}
                type="checkbox"
                style={{ width: 16, height: 16, cursor: "pointer" }}
              />
              <label htmlFor="budget-is-expense" className="form-label" style={{ margin: 0, cursor: "pointer" }}>
                Витрата (якщо знято — дохід)
              </label>
            </div>
          </>
        )}

        {type === "budget" && (
          <>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Місяць</label>
                <select className="form-select" value={form.month} onChange={(e) => patch("month", Number(e.target.value))}>
                  {MONTHS_UA.map((month, index) => (
                    <option value={index + 1} key={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Рік</label>
                <input className="form-input" value={form.year} onChange={(e) => patch("year", e.target.value)} type="number" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Загальний ліміт (zł)</label>
              <input className="form-input" value={form.limit} onChange={(e) => patch("limit", e.target.value)} type="number" />
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="btn btn-outline" type="button" onClick={onClose}>
            Скасувати
          </button>
          <button className="btn btn-dark" type="submit">
            {type === "budget" ? "Створити" : type === "transaction" ? "Зберегти" : "Додати"}
          </button>
        </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default function BudgetPlanner() {
  const [budget, setBudget] = useState(initialBudget);
  const [calOpen, setCalOpen] = useState(true);
  const [selectedDay, setSelectedDay] = useState(initialBudget.todayDay);
  const [modalType, setModalType] = useState(null);
  const [form, setForm] = useState(emptyForms.income);
  const [toast, setToast] = useState("");

  const summary = useMemo(() => buildSummary(budget), [budget]);

  const showToast = (message) => {
    setToast(message);
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => setToast(""), 2500);
  };

  const openModal = (type) => {
    const defaults = {
      ...emptyForms[type],
    };

    if (type === "transaction") {
      defaults.day = selectedDay || budget.todayDay;
      defaults.catId = budget.categories.find((cat) => cat.active)?.id || "income";
    }

    if (type === "budget") {
      defaults.month = budget.month;
      defaults.year = budget.year;
      defaults.limit = budget.totalLimit;
    }

    setForm(defaults);
    setModalType(type);
  };

  const closeModal = () => setModalType(null);

  const changeMonth = (direction) => {
    setBudget((prev) => {
      let month = prev.month + direction;
      let year = prev.year;

      if (month > 12) {
        month = 1;
        year += 1;
      }

      if (month < 1) {
        month = 12;
        year -= 1;
      }

      return { ...prev, month, year };
    });
    setSelectedDay(null);
  };

  const copyFromPrev = () => {
    showToast("Бюджет скопійовано з попереднього місяця ✓");
  };

  const toggleCategory = (categoryId) => {
    setBudget((prev) => ({
      ...prev,
      categories: prev.categories.map((cat) => (cat.id === categoryId ? { ...cat, active: !cat.active } : cat)),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (modalType === "income") {
      const amount = Number(form.amount) || 0;
      const name = form.name.trim();

      if (!name || !amount) {
        showToast("Заповніть всі поля");
        return;
      }

      setBudget((prev) => ({
        ...prev,
        incomeSources: [
          ...prev.incomeSources,
          {
            id: uid("i"),
            name,
            icon: "💰",
            iconBg: "#eaf3de",
            iconColor: "#2d7a3a",
            frequency: form.frequency || "Непостійно",
            amount,
            status: form.status,
          },
        ],
      }));
      closeModal();
      showToast("Джерело доходу додано ✓");
      return;
    }

    if (modalType === "mandatory") {
      const amount = Number(form.amount) || 0;
      const name = form.name.trim();

      if (!name || !amount) {
        showToast("Заповніть всі поля");
        return;
      }

      setBudget((prev) => ({
        ...prev,
        mandatoryExpenses: [
          ...prev.mandatoryExpenses,
          { id: uid("m"), name, color: "#185FA5", amount, paid: amount, paymentType: form.paymentType },
        ],
      }));
      closeModal();
      showToast("Статтю додано ✓");
      return;
    }

    if (modalType === "category") {
      const limit = Number(form.limit) || 0;
      const name = form.name.trim();

      if (!name || !limit) {
        showToast("Заповніть всі поля");
        return;
      }

      setBudget((prev) => ({
        ...prev,
        categories: [
          ...prev.categories,
          {
            id: uid("c"),
            name,
            sub: form.sub || "",
            limit,
            spent: 0,
            active: true,
            color: form.color,
          },
        ],
      }));
      closeModal();
      showToast("Категорію додано ✓");
      return;
    }

    if (modalType === "transaction") {
      const desc = form.desc.trim();
      const amount = Number(form.amount) || 0;
      const day = Number(form.day) || budget.todayDay;

      if (!desc || !amount) {
        showToast("Заповніть всі поля");
        return;
      }

      setBudget((prev) => {
        const cat = prev.categories.find((item) => item.id === form.catId);
        const catName = cat ? cat.name : form.catId === "income" ? "Дохід" : "Інше";
        const finalAmount = form.catId === "income" ? Math.abs(amount) : form.isExpense ? -Math.abs(amount) : Math.abs(amount);

        return {
          ...prev,
          transactions: [
            ...prev.transactions,
            {
              id: uid("t"),
              day,
              desc,
              cat: catName,
              amount: finalAmount,
              type: form.catId === "income" ? "income" : "expense",
            },
          ],
          categories: prev.categories.map((item) =>
            item.id === form.catId && form.isExpense ? { ...item, spent: item.spent + Math.abs(amount) } : item,
          ),
        };
      });

      setSelectedDay(day);
      closeModal();
      showToast("Транзакцію збережено ✓");
      return;
    }

    if (modalType === "budget") {
      const month = Number(form.month) || budget.month;
      const year = Number(form.year) || budget.year;
      const totalLimit = Number(form.limit) || budget.totalLimit;

      setBudget((prev) => ({
        ...prev,
        month,
        year,
        totalLimit,
        transactions: [],
      }));
      setSelectedDay(null);
      closeModal();
      showToast("Новий бюджет створено ✓");
    }
  };

  return (
    <section className="budgetPlanner">
      <h2 className="sr-only">Сторінка планування бюджету з метриками, календарем і категоріями витрат</h2>

      <div className="pg">
        <div className="topbar">
          <span className="topbar-title">Планування бюджету</span>
          <div className="month-nav">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Попередній місяць">
              ‹
            </button>
            <span>
              {MONTHS_UA[budget.month - 1]} {budget.year}
            </span>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Наступний місяць">
              ›
            </button>
          </div>
          <div style={{ display: "flex", gap: 7 }}>
            <button className="btn btn-outline" type="button" onClick={copyFromPrev}>
              ⎘ Скопіювати з попереднього
            </button>
            <button className="btn btn-dark" type="button" onClick={() => openModal("budget")}>
              ＋ Новий бюджет
            </button>
          </div>
        </div>

        <MetricCards budget={budget} summary={summary} />

        <CalendarCard
          budget={budget}
          selectedDay={selectedDay}
          calOpen={calOpen}
          onToggle={() => setCalOpen((open) => !open)}
          onSelectDay={setSelectedDay}
          onOpenModal={openModal}
        />

        <div className="two-col">
          <div className="col-left">
            <IncomeCard sources={budget.incomeSources} onOpenModal={openModal} />
            <MandatoryCard expenses={budget.mandatoryExpenses} onOpenModal={openModal} />
            <CategoriesCard categories={budget.categories} onOpenModal={openModal} onToggleCategory={toggleCategory} />
          </div>

          <div className="col-right">
            <AlertsCard categories={budget.categories} />
            <DonutCard budget={budget} />
            <PeriodsCard budget={budget} summary={summary} onOpenModal={openModal} />
          </div>
        </div>
      </div>

      <BudgetModal
        type={modalType}
        budget={budget}
        form={form}
        setForm={setForm}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <div className={`toast ${toast ? "show" : ""}`}>{toast}</div>
    </section>
  );
}
