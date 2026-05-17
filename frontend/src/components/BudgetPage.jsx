/**
 * BudgetPage.jsx
 *
 * Budget planning page.
 * All data currently comes from budgetMock.js.
 * To connect to the backend, replace the mock imports with real API calls
 * (e.g. useBudget() hook that fetches from /api/budgets/:year/:month).
 *
 * Sub-components are kept in this file for locality; split into separate
 * files if the team grows or the components are needed elsewhere.
 */

import { useState, useMemo } from "react";
import s from "./BudgetPage.module.css";
import {
  MOCK_BUDGET,
  MOCK_INCOME_SOURCES,
  MOCK_MANDATORY_EXPENSES,
  MOCK_CATEGORIES,
  MOCK_ALERTS,
  MOCK_BUDGET_PERIODS,
  MOCK_TIMELINE_SEGMENTS,
  MOCK_DONUT_SLICES,
  computeBudgetSummary,
} from "../data/budgetMock";

// ─── Tiny icon wrappers (inline SVG, no external dep) ────────────────────────
const Ico = {
  ChevronLeft: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),
  ChevronRight: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  ),
  Copy: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  ),
  Plus: () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  Calendar: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Bell: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  ),
  Sliders: () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  ),
  Check: () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),
  ArrowUp: () => (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  TrendingUp: () => (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M23 6l-9.5 9.5-5-5L1 18" /><path d="M17 6h6v6" />
    </svg>
  ),
  AlertTri: () => (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Flame: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 3z" />
    </svg>
  ),
  CircleCheck: () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" />
    </svg>
  ),
  Briefcase: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" /><line x1="12" y1="12" x2="12" y2="12" />
    </svg>
  ),
  Laptop: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M2 20h20" />
    </svg>
  ),
};

// ─── Derived helpers ──────────────────────────────────────────────────────────
function fmt(n) {
  return n.toLocaleString("uk-UA") + " zł";
}

function getCategoryStatus(cat) {
  if (!cat.active) return { label: "не активно", cls: s.statusInactive };
  const pct = Math.round((cat.spent / cat.limit) * 100);
  const over = cat.spent - cat.limit;
  if (over > 0) return { label: `⚠ Перевищено +${fmt(over)}`, cls: s.statusOver };
  if (pct >= 80) return { label: `${pct}% — обережно`, cls: s.statusWarn };
  return { label: `${pct}% — ok`, cls: s.statusOk };
}

function buildDonutPath(slices, cx, cy, r) {
  const total = slices.reduce((s, sl) => s + sl.amount, 0);
  const circ = 2 * Math.PI * r;
  let offset = 0;
  return slices.map((sl) => {
    const dash = (sl.amount / total) * circ;
    const path = { dash, offset, color: sl.color };
    offset += dash;
    return path;
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetricCards({ summary, budget }) {
  return (
    <div className={s.metrics}>
      <div className={`${s.mc} ${s.dark}`}>
        <div className={s.mcLbl}>Загальний бюджет</div>
        <div className={s.mcVal}>{fmt(budget.totalLimit)}</div>
        <div className={s.mcSub}>{budget.label.toLowerCase()}</div>
      </div>
      <div className={s.mc}>
        <div className={s.mcLbl}>Очікуваний дохід</div>
        <div className={s.mcVal}>{fmt(summary.totalIncome)}</div>
        <div className={`${s.badge} ${s.badgeOk}`}>
          <Ico.ArrowUp /> +{fmt(summary.totalIncome - budget.totalLimit)} резерв
        </div>
      </div>
      <div className={s.mc}>
        <div className={s.mcLbl}>Витрачено</div>
        <div className={s.mcVal}>{fmt(summary.totalSpent)}</div>
        <div className={`${s.badge} ${s.badgeWarn}`}>
          <Ico.TrendingUp /> {summary.spentPct}% бюджету
        </div>
      </div>
      <div className={s.mc}>
        <div className={s.mcLbl}>Перевищень</div>
        <div className={s.mcVal}>{summary.overflowCount} кат.</div>
        {summary.overflowCount > 0 ? (
          <div className={`${s.badge} ${s.badgeDanger}`}><Ico.AlertTri /> Увага</div>
        ) : (
          <div className={`${s.badge} ${s.badgeOk}`}><Ico.Check /> Норма</div>
        )}
      </div>
    </div>
  );
}

function TimelineCard({ budget, segments, summary }) {
  const todayPct = summary.todayPct;
  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <span className={s.cardTitle}>Таймлайн бюджету — {budget.label.split(" ")[0].toLowerCase()}</span>
        <button className={s.cardAction}><Ico.Calendar /> Змінити діапазон</button>
      </div>
      <div className={s.timelineWrap}>
        <div className={s.tlHeader}>
          <span className={s.tlPeriod}>1 — {budget.endDay} {budget.label.split(" ")[0].toLowerCase()} {budget.year}</span>
          <span className={s.tlMeta}>День {budget.todayDay} з {budget.endDay} · залишилось {budget.endDay - budget.todayDay} днів</span>
        </div>

        {/* Income bar */}
        <div className={s.tlBarLabel}>Очікуваний дохід</div>
        <div className={s.tlBarWrap}>
          <div className={s.tlTrack}>
            <div style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%", background:"#16a34a", opacity:0.85, borderRadius:"100px" }} />
          </div>
          <div className={s.tlToday} style={{ left: `${todayPct}%` }} />
        </div>

        {/* Spending bar */}
        <div className={s.tlBarLabel}>Витрати по категоріям</div>
        <div className={s.tlBarWrap}>
          <div className={s.tlTrack}>
            {segments.map((seg, i) => {
              const left = segments.slice(0, i).reduce((acc, p) => acc + p.widthPct, 0);
              const isLast = i === segments.length - 1;
              return (
                <div
                  key={seg.label}
                  style={{
                    position: "absolute", top: 0, left: `${left}%`, width: `${seg.widthPct}%`,
                    height: "100%", background: seg.color,
                    borderRadius: isLast ? "0 100px 100px 0" : 0,
                  }}
                />
              );
            })}
          </div>
          <div className={s.tlToday} style={{ left: `${todayPct}%` }} />
        </div>

        <div className={s.tlMonths}>
          {["1 тра", "8 тра", "15 тра", `${budget.todayDay} тра`, "22 тра", "29 тра", "31 тра"].map((m, i) => (
            <span key={i} className={i === 3 ? `${s.tlMonth} ${s.tlMonthToday}` : s.tlMonth}>
              {i === 3 ? `${m} ◆` : m}
            </span>
          ))}
        </div>

        <div className={s.tlLegend}>
          {[
            { color: "#16a34a", label: "Дохід / ліміт" },
            { color: "#1a56db", label: "Обов'язкові витрати" },
            { color: "#7c3aed", label: "Вільні витрати" },
            { color: "#b45309", label: "Одяг / інше" },
            { color: "#c0392b", label: "Перевищення" },
          ].map((l) => (
            <div key={l.label} className={s.tlLegItem}>
              <div className={s.tlLegDot} style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function IncomeCard({ sources, onAdd }) {
  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <span className={s.cardTitle}>Очікувані доходи</span>
        <button className={s.cardAction} onClick={onAdd}><Ico.Plus /> Додати</button>
      </div>
      {sources.map((src) => (
        <div key={src.id} className={s.incomeRow}>
          <div className={s.incomeLeft}>
            <div className={s.incomeIcon} style={{ background: src.iconBg, color: src.iconColor }}>
              {src.icon === "briefcase" ? <Ico.Briefcase /> : <Ico.Laptop />}
            </div>
            <div>
              <div className={s.incomeName}>{src.name}</div>
              <div className={s.incomeFreq}>{src.frequency}</div>
            </div>
          </div>
          <div>
            <div className={`${s.incomeAmt} ${src.status !== "received" ? s.incomeAmtPending : ""}`}>
              +{fmt(src.amount)}
            </div>
            <div className={`${s.incomeStatus} ${src.status === "received" ? s.statusReceived : s.statusPending}`}>
              {src.status === "received" ? "✓ Отримано" : "⏳ Очікується"}
            </div>
          </div>
        </div>
      ))}
      <button className={s.incomeAdd} onClick={onAdd}>
        <Ico.Plus /> Додати джерело доходу
      </button>
    </div>
  );
}

function MandatoryCard({ expenses, onAdd }) {
  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <span className={s.cardTitle}>Обов'язкові витрати</span>
        <button className={s.cardAction} onClick={onAdd}><Ico.Plus /> Додати</button>
      </div>
      {expenses.map((exp) => {
        const pct = Math.min(100, Math.round((exp.paid / exp.amount) * 100));
        return (
          <div key={exp.id} className={s.mandRow}>
            <div className={s.mandTop}>
              <div className={s.mandLeft}>
                <div className={s.mandDot} style={{ background: exp.color }} />
                <div className={s.mandName}>{exp.name}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className={`${s.mandBadge} ${exp.paymentType === "auto" ? s.mandBadgeAuto : s.mandBadgeManual}`}>
                  {exp.paymentType === "auto" ? "Авто" : "Вручну"}
                </span>
                <span className={s.mandRight}>{fmt(exp.amount)}</span>
              </div>
            </div>
            <div className={s.progTrack}>
              <div className={s.progFill} style={{ width: `${pct}%`, background: exp.color }} />
            </div>
          </div>
        );
      })}
      <button className={s.incomeAdd} onClick={onAdd}>
        <Ico.Plus /> Додати обов'язкову статтю
      </button>
    </div>
  );
}

function CategoryControlCard({ categories, onAdd }) {
  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <span className={s.cardTitle}>Контроль за категоріями</span>
        <button className={s.cardAction}><Ico.Sliders /> Сортувати</button>
      </div>
      {categories.map((cat) => {
        const st = getCategoryStatus(cat);
        const spent = cat.active ? `${fmt(cat.spent)} / ${fmt(cat.limit)}` : "";
        return (
          <div key={cat.id} className={s.catCheckRow}>
            <div className={`${s.checkbox} ${cat.active ? s.checkboxChecked : ""}`}>
              {cat.active && <Ico.Check />}
            </div>
            <div className={s.catCheckInfo}>
              <div className={`${s.catCheckName} ${!cat.active ? s.catCheckNameInactive : ""}`}>{cat.name}</div>
              <div className={s.catCheckSub}>{cat.active ? `${cat.subLabel} · ${spent}` : cat.subLabel}</div>
            </div>
            <div className={s.catCheckRight}>
              <span className={`${s.catCheckLimit} ${!cat.active ? s.catCheckLimitInactive : ""}`}>{fmt(cat.limit)}</span>
              <span className={`${s.catCheckStatus} ${st.cls}`}>{st.label}</span>
            </div>
          </div>
        );
      })}
      <button className={s.incomeAdd} onClick={onAdd}>
        <Ico.Plus /> Додати категорію бюджету
      </button>
    </div>
  );
}

const ALERT_ICONS = {
  "alert-circle": <Ico.AlertCircle />,
  "flame": <Ico.Flame />,
  "circle-check": <Ico.CircleCheck />,
};

function AlertsCard({ alerts }) {
  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <span className={s.cardTitle}>Контроль перевищень</span>
        <button className={s.cardAction}><Ico.Bell /> Сповіщення</button>
      </div>
      {alerts.map((al) => (
        <div key={al.id} className={s.alertRow}>
          <div className={`${s.alertIcon} ${al.type === "danger" ? s.alertIconDanger : al.type === "warn" ? s.alertIconWarn : s.alertIconOk}`}>
            {ALERT_ICONS[al.icon]}
          </div>
          <div>
            <div className={s.alertTitle}>{al.title}</div>
            <div className={s.alertDesc}>{al.desc}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ slices, totalSpent, totalLimit }) {
  const cx = 44, cy = 44, r = 33;
  const circ = 2 * Math.PI * r;
  const paths = buildDonutPath(slices, cx, cy, r);
  const remaining = totalLimit - totalSpent;

  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <span className={s.cardTitle}>Розподіл витрат</span>
      </div>
      <div className={s.donutSection}>
        <div className={s.donutWrap}>
          <svg width="88" height="88" viewBox="0 0 88 88" style={{ flexShrink: 0 }} aria-label="Donut chart">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--surface2)" strokeWidth="12" />
            {paths.map((p, i) => (
              <circle
                key={i}
                cx={cx} cy={cy} r={r}
                fill="none"
                stroke={slices[i].color}
                strokeWidth="12"
                strokeDasharray={`${p.dash} ${circ - p.dash}`}
                strokeDashoffset={-p.offset}
                transform={`rotate(-90 ${cx} ${cy})`}
              />
            ))}
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="12" fontWeight="500" fill="var(--text)" fontFamily="var(--mono)">
              {totalSpent.toLocaleString("uk-UA")}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fontSize="8" fill="var(--muted)" fontFamily="var(--font)">
              витрачено
            </text>
          </svg>
          <div className={s.donutLegend}>
            {slices.map((sl) => (
              <div key={sl.label} className={s.legRow}>
                <div className={s.legDot} style={{ background: sl.color }} />
                <span className={s.legName}>{sl.label}</span>
                <span className={s.legVal}>{sl.amount.toLocaleString("uk-UA")} zł</span>
              </div>
            ))}
          </div>
        </div>
        <div className={s.donutFoot}>
          Загальний бюджет: <strong>{fmt(totalLimit)}</strong> · Залишилось <strong>{fmt(Math.max(0, remaining))}</strong>
        </div>
      </div>
    </div>
  );
}

function BudgetPeriodsCard({ periods, onNew }) {
  return (
    <div className={s.card}>
      <div className={s.cardHead}>
        <span className={s.cardTitle}>Заплановані бюджети</span>
        <button className={s.cardAction} onClick={onNew}><Ico.Plus /> Новий</button>
      </div>
      <div className={s.periodList}>
        {periods.map((p) => {
          const isDark = p.status === "active";
          const isDraft = p.status === "draft";
          return (
            <div
              key={p.id}
              className={`${s.periodItem} ${isDark ? s.periodActive : isDraft ? s.periodDraft : s.periodDone}`}
            >
              <div>
                <div className={`${s.periodLabel} ${isDark ? s.periodLabelActive : isDraft ? s.periodLabelDraft : ""}`}>
                  {p.label}
                </div>
                <div className={`${s.periodStatus} ${isDark ? s.periodStatusActive : ""}`}>
                  {p.statusLabel}
                </div>
              </div>
              <div className={s.periodRight}>
                <div className={`${s.periodAmt} ${isDark ? s.periodAmtActive : isDraft ? s.periodAmtDraft : ""}`}>
                  {p.spent !== null ? `${p.spent.toLocaleString("uk-UA")} / ${p.limit.toLocaleString("uk-UA")} zł` : `${p.limit.toLocaleString("uk-UA")} zł`}
                </div>
                <span
                  className={`${s.periodBadge} ${
                    p.badge === "ok" ? s.periodBadgeOk :
                    p.badge === "active" ? s.periodBadgeActive :
                    s.periodBadgeDraft
                  }`}
                >
                  {p.badgeLabel}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Page root ────────────────────────────────────────────────────────────────

export default function BudgetPage() {
  // TODO: replace with useBudget(year, month) hook when API is ready
  const budget = MOCK_BUDGET;
  const incomeSources = MOCK_INCOME_SOURCES;
  const mandatoryExpenses = MOCK_MANDATORY_EXPENSES;
  const categories = MOCK_CATEGORIES;
  const alerts = MOCK_ALERTS;
  const periods = MOCK_BUDGET_PERIODS;
  const timelineSegments = MOCK_TIMELINE_SEGMENTS;
  const donutSlices = MOCK_DONUT_SLICES;

  const summary = useMemo(
    () => computeBudgetSummary(budget, incomeSources, mandatoryExpenses, categories),
    [budget, incomeSources, mandatoryExpenses, categories]
  );

  // Placeholder handlers — wire to modals / API later
  const noop = () => {};

  return (
    <div className={s.pg}>
      {/* ── Topbar ── */}
      <div className={s.topbar}>
        <span className={s.topbarTitle}>Планування бюджету</span>
        <div className={s.monthNav}>
          <button className={s.monthNavArrow} aria-label="Попередній місяць"><Ico.ChevronLeft /></button>
          {budget.label}
          <button className={s.monthNavArrow} aria-label="Наступний місяць"><Ico.ChevronRight /></button>
        </div>
        <div className={s.btnRow}>
          <button className={s.btnOutline}><Ico.Copy /> Скопіювати з квітня</button>
          <button className={s.btnDark} onClick={noop}><Ico.Plus /> Новий бюджет</button>
        </div>
      </div>

      {/* ── Summary metrics ── */}
      <MetricCards summary={summary} budget={budget} />

      {/* ── Timeline ── */}
      <TimelineCard budget={budget} segments={timelineSegments} summary={summary} />

      {/* ── Two-column section ── */}
      <div className={s.twoCol}>
        <div className={s.colLeft}>
          <IncomeCard sources={incomeSources} onAdd={noop} />
          <MandatoryCard expenses={mandatoryExpenses} onAdd={noop} />
          <CategoryControlCard categories={categories} onAdd={noop} />
        </div>
        <div className={s.colRight}>
          <AlertsCard alerts={alerts} />
          <DonutChart
            slices={donutSlices}
            totalSpent={summary.totalSpent}
            totalLimit={budget.totalLimit}
          />
          <BudgetPeriodsCard periods={periods} onNew={noop} />
        </div>
      </div>
    </div>
  );
}
