import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "./BudgetPlanner.css";

const MONTHS_UA = [
  "Січень", "Лютий", "Березень", "Квітень", "Травень", "Червень",
  "Липень", "Серпень", "Вересень", "Жовтень", "Листопад", "Грудень",
];
const DOW_UA = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const CATEGORY_PRESETS = [
  { name: "Продукти", icon: "🛒", color: "#00b86b", labels: ["продукти", "супермаркет", "biedronka", "lidl"] },
  { name: "Транспорт", icon: "🚕", color: "#2563eb", labels: ["транспорт", "pkp", "ztm", "orlen"] },
  { name: "Житло", icon: "🏠", color: "#7c3aed", labels: ["житло", "оренда", "комунальні"] },
  { name: "Кафе", icon: "☕", color: "#f59e0b", labels: ["кафе", "ресторан", "starbucks"] },
  { name: "Розваги", icon: "🎬", color: "#ec4899", labels: ["розваги", "кіно", "netflix"] },
  { name: "Здоров’я", icon: "🩺", color: "#0891b2", labels: ["здоров'я", "аптека", "лікар"] },
];
const EVENT_PRESETS = [
  { name: "Проживання", icon: "🏡", color: "#7c3aed", labels: ["проживання", "готель", "будиночок"] },
  { name: "Дорога", icon: "🚆", color: "#2563eb", labels: ["дорога", "квитки", "pkp"] },
  { name: "Їжа", icon: "🥐", color: "#00b86b", labels: ["їжа", "продукти", "кафе"] },
  { name: "Розваги", icon: "🎟️", color: "#ec4899", labels: ["розваги", "екскурсія"] },
];

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function fmt(value) {
  return `${Math.round(Number(value) || 0).toLocaleString("uk-UA")} zł`;
}
function normalizeLabel(label) {
  return String(label || "").trim().toLocaleLowerCase("uk-UA");
}
function uniq(values) {
  return [...new Set(values.filter(Boolean))];
}
function parseLabels(value) {
  return uniq(String(value || "").split(/[,\n]/).map(normalizeLabel));
}
function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}
function addDays(dateString, days) {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

const monthlyTransactions = [
  { id: "t1", date: "2026-06-01", desc: "Оренда квартири", amount: 1800, type: "expense", labels: ["оренда", "житло"] },
  { id: "t2", date: "2026-06-02", desc: "Biedronka", amount: 186, type: "expense", labels: ["продукти", "biedronka"] },
  { id: "t3", date: "2026-06-04", desc: "PKP квиток", amount: 120, type: "expense", labels: ["транспорт", "pkp"] },
  { id: "t4", date: "2026-06-05", desc: "Lidl", amount: 244, type: "expense", labels: ["продукти", "lidl"] },
  { id: "t5", date: "2026-06-08", desc: "Netflix", amount: 55, type: "expense", labels: ["розваги", "netflix"] },
  { id: "t6", date: "2026-06-10", desc: "Starbucks", amount: 48, type: "expense", labels: ["кафе", "starbucks"] },
  { id: "t7", date: "2026-06-12", desc: "Orlen", amount: 350, type: "expense", labels: ["транспорт", "orlen"] },
  { id: "t8", date: "2026-06-13", desc: "Кіно", amount: 96, type: "expense", labels: ["розваги", "кіно"] },
  { id: "t9", date: "2026-06-15", desc: "Ресторан", amount: 180, type: "expense", labels: ["кафе", "ресторан"] },
  { id: "t10", date: "2026-06-17", desc: "Biedronka", amount: 322, type: "expense", labels: ["продукти", "biedronka"] },
];

const eventTransactions = [
  { id: "et1", date: "2026-07-12", desc: "Квитки на потяг", amount: 420, type: "expense", labels: ["дорога", "квитки"], planned: 420 },
  { id: "et2", date: "2026-07-12", desc: "Продукти в дорогу", amount: 178, type: "expense", labels: ["їжа", "продукти"], planned: 180 },
  { id: "et3", date: "2026-07-13", desc: "Передплата за будиночок", amount: 900, type: "expense", labels: ["проживання", "будиночок"], planned: 900 },
];

function makeCategories(presets, limits) {
  return presets.map((preset, index) => ({
    id: uid("cat"),
    ...preset,
    limit: limits[index] || 500,
    active: true,
  }));
}

function cloneBudgetStructure(source) {
  if (!source) return null;
  return {
    totalLimit: Number(source.totalLimit) || 0,
    categories: (source.categories || []).map(({ id, ...category }) => ({
      ...category,
      id: uid("cat"),
      labels: [...(category.labels || [])],
    })),
    incomeSources: (source.incomeSources || []).map(({ id, ...income }) => ({
      ...income,
      id: uid("income"),
      status: "pending",
    })),
    mandatoryExpenses: (source.mandatoryExpenses || []).map(({ id, ...expense }) => ({
      ...expense,
      id: uid("mandatory"),
      paid: false,
    })),
  };
}

function findLatestMonthlyBudget(budgets, excludeId = null) {
  return [...budgets]
    .filter((budget) => budget.type === "monthly" && budget.id !== excludeId)
    .sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month))[0] || null;
}

const initialBudgets = [
  {
    id: "budget-monthly-june",
    type: "monthly",
    name: "Бюджет на червень",
    month: 6,
    year: 2026,
    totalLimit: 6000,
    telegramEnabled: true,
    warningThreshold: 80,
    participants: ["Ви"],
    incomeSources: [
      { id: "i1", name: "Зарплата", amount: 5500, status: "received", frequency: "1-го числа", icon: "💼" },
      { id: "i2", name: "Фріланс", amount: 1700, status: "pending", frequency: "очікується", icon: "💻" },
    ],
    mandatoryExpenses: [
      { id: "m1", name: "Оренда квартири", amount: 1800, paid: true, dateLabel: "1 червня" },
      { id: "m2", name: "Комунальні", amount: 340, paid: true, dateLabel: "8 червня" },
      { id: "m3", name: "Страховка", amount: 120, paid: false, dateLabel: "20 червня" },
    ],
    categories: makeCategories(CATEGORY_PRESETS, [1500, 500, 2200, 400, 600, 300]),
    transactions: monthlyTransactions,
  },
  {
    id: "budget-event-mountains",
    type: "event",
    name: "Поїздка в гори",
    startDate: "2026-07-12",
    endDate: "2026-07-16",
    totalLimit: 3500,
    telegramEnabled: true,
    warningThreshold: 80,
    participants: ["Ви", "Марія", "Олег", "Іра"],
    incomeSources: [],
    mandatoryExpenses: [],
    categories: makeCategories(EVENT_PRESETS, [1200, 800, 700, 400]),
    plannedExpenses: [
      { id: "p1", date: "2026-07-12", desc: "Квитки", category: "Дорога", planned: 420, actual: 420 },
      { id: "p2", date: "2026-07-12", desc: "Продукти в дорогу", category: "Їжа", planned: 180, actual: 178 },
      { id: "p3", date: "2026-07-13", desc: "Будиночок", category: "Проживання", planned: 900, actual: 900 },
      { id: "p4", date: "2026-07-14", desc: "Підйомник", category: "Розваги", planned: 260, actual: null },
      { id: "p5", date: "2026-07-15", desc: "Вечеря", category: "Їжа", planned: 250, actual: null },
    ],
    transactions: eventTransactions,
  },
];

function transactionMatchesCategory(transaction, category) {
  const labels = (transaction.labels || []).map(normalizeLabel);
  const categoryLabels = (category.labels || []).map(normalizeLabel);
  return labels.some((label) => categoryLabels.includes(label));
}
function spentForCategory(budget, category) {
  return budget.transactions
    .filter((transaction) => transaction.type === "expense" && transactionMatchesCategory(transaction, category))
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
}
function budgetSummary(budget) {
  const actualSpent = budget.transactions
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const remaining = budget.totalLimit - actualSpent;
  const progress = budget.totalLimit ? Math.round((actualSpent / budget.totalLimit) * 100) : 0;
  const overCategories = budget.categories.filter((category) => spentForCategory(budget, category) > category.limit).length;
  const today = new Date("2026-06-17T00:00:00");
  let daysLeft = 1;
  if (budget.type === "monthly") {
    daysLeft = Math.max(1, new Date(budget.year, budget.month, 0).getDate() - today.getDate());
  } else {
    daysLeft = Math.max(1, Math.ceil((new Date(budget.endDate) - new Date(budget.startDate)) / 86400000) + 1);
  }
  const dailyLimit = Math.max(0, remaining) / daysLeft;
  const elapsed = budget.type === "monthly" ? Math.max(1, today.getDate()) : 1;
  const forecast = budget.type === "monthly" ? Math.round((actualSpent / elapsed) * new Date(budget.year, budget.month, 0).getDate()) : actualSpent;
  return { actualSpent, remaining, progress, overCategories, daysLeft, dailyLimit, forecast };
}

function TypeBadge({ type }) {
  return <span className={`budgetType ${type}`}>{type === "monthly" ? "Щомісячний" : "Подійний"}</span>;
}

function Portfolio({ budgets, onOpen, onCreate }) {
  const monthly = budgets.filter((budget) => budget.type === "monthly");
  const events = budgets.filter((budget) => budget.type === "event");
  const totalPlanned = budgets.reduce((sum, budget) => sum + budget.totalLimit, 0);

  return (
    <div className="budgetShell portfolioShell">
      <section className="portfolioHero">
        <div>
          <span className="eyebrow">Планування без зайвих таблиць</span>
          <h1>Ваші бюджети</h1>
          <p>Контролюйте регулярні витрати та плануйте окремі події в одному місці.</p>
        </div>
        <button className="primaryButton" type="button" onClick={onCreate}>＋ Створити бюджет</button>
      </section>

      <section className="portfolioStats">
        <div><span>Активних бюджетів</span><strong>{budgets.length}</strong></div>
        <div><span>Заплановано</span><strong>{fmt(totalPlanned)}</strong></div>
        <div><span>Спільні бюджети</span><strong>{events.filter((item) => item.participants.length > 1).length}</strong></div>
      </section>

      <section className="portfolioSection">
        <div className="sectionTitleRow">
          <div><span className="eyebrow">Щомісяця</span><h2>Регулярний контроль</h2></div>
        </div>
        <div className="budgetGrid">
          {monthly.map((budget) => <BudgetTile key={budget.id} budget={budget} onOpen={onOpen} />)}
          <button className="createTile" type="button" onClick={onCreate}><span>＋</span><b>Новий щомісячний бюджет</b><small>Створити за кілька кліків</small></button>
        </div>
      </section>

      <section className="portfolioSection">
        <div className="sectionTitleRow">
          <div><span className="eyebrow">Події та цілі</span><h2>Окремі плани</h2></div>
        </div>
        <div className="budgetGrid">
          {events.map((budget) => <BudgetTile key={budget.id} budget={budget} onOpen={onOpen} />)}
          <button className="createTile eventTile" type="button" onClick={onCreate}><span>＋</span><b>Нова подія або ціль</b><small>Поїздка, ремонт чи покупка</small></button>
        </div>
      </section>
    </div>
  );
}

function BudgetTile({ budget, onOpen }) {
  const summary = budgetSummary(budget);
  const dateLabel = budget.type === "monthly"
    ? `${MONTHS_UA[budget.month - 1]} ${budget.year}`
    : `${new Date(budget.startDate).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })} — ${new Date(budget.endDate).toLocaleDateString("uk-UA", { day: "numeric", month: "short" })}`;
  return (
    <button className={`budgetTile ${budget.type}`} type="button" onClick={() => onOpen(budget.id)}>
      <div className="budgetTileTop"><TypeBadge type={budget.type} /><span className="budgetTileArrow">↗</span></div>
      <div className="budgetTileBody"><h3>{budget.name}</h3><p>{dateLabel}</p></div>
      <div className="tileProgress"><span style={{ width: `${clamp(summary.progress)}%` }} /></div>
      <div className="budgetTileBottom"><strong>{fmt(summary.actualSpent)}</strong><span>із {fmt(budget.totalLimit)}</span></div>
      {budget.participants.length > 1 && <div className="participantsMini">👥 {budget.participants.length} учасники</div>}
    </button>
  );
}

function BudgetDashboard({ budget, onBack, onUpdate, onDelete, previousMonthlyBudget }) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [eventView, setEventView] = useState("overview");
  const [modalType, setModalType] = useState(null);
  const [toast, setToast] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const summary = useMemo(() => budgetSummary(budget), [budget]);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2200);
  }
  function updateBudget(patch) {
    onUpdate({ ...budget, ...patch });
  }
  function copyPreviousMonth() {
    const structure = cloneBudgetStructure(previousMonthlyBudget);
    if (!structure) {
      showToast("Немає попереднього місячного бюджету для копіювання");
      return;
    }
    updateBudget(structure);
    showToast("Структуру минулого місяця скопійовано ✓");
  }
  function addCategory(category) {
    updateBudget({ categories: [...budget.categories, { id: uid("cat"), active: true, ...category }] });
    showToast("Категорію додано ✓");
  }
  function addTransaction(transaction) {
    updateBudget({ transactions: [...budget.transactions, { id: uid("tx"), type: "expense", ...transaction }] });
    showToast("Витрату додано ✓");
  }
  function addMandatory(item) {
    updateBudget({ mandatoryExpenses: [...budget.mandatoryExpenses, { id: uid("mandatory"), paid: false, ...item }] });
    showToast("Обов’язкову витрату додано ✓");
  }
  function addIncome(item) {
    updateBudget({ incomeSources: [...budget.incomeSources, { id: uid("income"), status: "pending", icon: "💰", ...item }] });
    showToast("Дохід додано ✓");
  }

  return (
    <div className="budgetShell dashboardShell">
      <header className="dashboardHeader">
        <button className="backButton" type="button" onClick={onBack}>← Усі бюджети</button>
        <div className="dashboardActions">
          {budget.type === "monthly" && <button className="softButton" type="button" onClick={copyPreviousMonth}>⎘ Скопіювати минулий місяць</button>}
          {budget.type === "event" && <button className="softButton" type="button" onClick={() => showToast("Посилання для спільного доступу буде доступне після підключення backend")}>↗ Поділитися</button>}
          <button className="softButton" type="button" onClick={() => setEditOpen(true)}>✎ Редагувати</button>
          <button className="primaryButton compact" type="button" onClick={() => setModalType("quick")}>＋ Додати</button>
        </div>
      </header>

      <section className={`dashboardHero ${budget.type}`}>
        <div className="heroMain">
          <div className="heroMeta"><TypeBadge type={budget.type} /><span>{budget.type === "monthly" ? `${MONTHS_UA[budget.month - 1]} ${budget.year}` : `${budget.startDate} — ${budget.endDate}`}</span></div>
          <h1>{budget.name}</h1>
          <p className="heroLabel">Залишилось</p>
          <strong className="heroAmount">{fmt(summary.remaining)}</strong>
          <div className="heroProgress"><span style={{ width: `${clamp(summary.progress)}%` }} /></div>
          <p className="heroProgressText">Використано {fmt(summary.actualSpent)} із {fmt(budget.totalLimit)} · {summary.progress}%</p>
        </div>
        <div className="heroSide">
          <div><span>Днів залишилось</span><strong>{summary.daysLeft}</strong></div>
          <div><span>Доступно на день</span><strong>{fmt(summary.dailyLimit)}</strong></div>
          {budget.type === "monthly" && <div><span>Прогноз на кінець</span><strong>{fmt(summary.forecast)}</strong></div>}
          {budget.type === "event" && <div><span>Учасників</span><strong>{budget.participants.length}</strong></div>}
        </div>
      </section>

      {budget.type === "event" && (
        <nav className="eventTabs">
          {[['overview','Огляд'],['list','Список'],['calendar','Календар']].map(([value,label]) => (
            <button className={eventView === value ? "active" : ""} key={value} type="button" onClick={() => setEventView(value)}>{label}</button>
          ))}
        </nav>
      )}

      {budget.type === "event" && eventView === "list" ? (
        <PlannedExpensesTable budget={budget} onAdd={() => setModalType("transaction")} />
      ) : budget.type === "event" && eventView === "calendar" ? (
        <BudgetCalendar budget={budget} expanded />
      ) : (
        <div className="dashboardGrid">
          <main className="dashboardMain">
            <CategoriesSection budget={budget} onAdd={() => setModalType("category")} />
            {budget.type === "monthly" && <MandatorySection items={budget.mandatoryExpenses} onAdd={() => setModalType("mandatory")} />}
            {budget.type === "event" && <PlannedExpensesTable budget={budget} compact onAdd={() => setModalType("transaction")} />}
            <section className="glassSection calendarFold">
              <button className="foldButton" type="button" onClick={() => setCalendarOpen((value) => !value)}>
                <span><b>Календар витрат</b><small>{budget.type === "monthly" ? "Переглянути транзакції по днях" : "Переглянути план події"}</small></span>
                <i>{calendarOpen ? "−" : "+"}</i>
              </button>
              {calendarOpen && <BudgetCalendar budget={budget} expanded />}
            </section>
          </main>
          <aside className="dashboardAside">
            <AssistantCard budget={budget} summary={summary} />
            {budget.type === "monthly" && <IncomeSection sources={budget.incomeSources} onAdd={() => setModalType("income")} />}
            <TelegramCard budget={budget} onToggle={() => updateBudget({ telegramEnabled: !budget.telegramEnabled })} />
            {budget.type === "event" && <ParticipantsCard budget={budget} onShare={() => showToast("Спільні бюджети вже закладені в UI. Підключимо після backend ✓")} />}
          </aside>
        </div>
      )}

      {modalType && <BudgetActionModal type={modalType} budget={budget} onClose={() => setModalType(null)} onChoose={setModalType} onAddCategory={addCategory} onAddTransaction={addTransaction} onAddMandatory={addMandatory} onAddIncome={addIncome} />}
      {editOpen && <BudgetEditModal budget={budget} onClose={() => setEditOpen(false)} onSave={(patch) => { updateBudget(patch); setEditOpen(false); showToast("Бюджет оновлено ✓"); }} onDelete={() => onDelete(budget.id)} />}
      <div className={`budgetToast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}

function CategoriesSection({ budget, onAdd }) {
  const ordered = useMemo(() => [...budget.categories].sort((a, b) => {
    const aSpent = spentForCategory(budget, a); const bSpent = spentForCategory(budget, b);
    return bSpent / b.limit - aSpent / a.limit;
  }), [budget]);
  return (
    <section className="glassSection">
      <div className="sectionHeader"><div><span className="eyebrow">Автоматичний контроль</span><h2>Категорії бюджету</h2><p>Витрати потрапляють у категорії за мітками.</p></div><button className="iconButton" type="button" onClick={onAdd}>＋</button></div>
      <div className="categoryGrid">
        {ordered.map((category) => {
          const spent = spentForCategory(budget, category);
          const pct = category.limit ? Math.round((spent / category.limit) * 100) : 0;
          const state = pct > 100 ? "danger" : pct >= 80 ? "warn" : "ok";
          return <article className={`categoryCard ${state}`} key={category.id}>
            <div className="categoryTop"><span className="categoryIcon" style={{ background: `${category.color}18`, color: category.color }}>{category.icon || "#"}</span><span className={`categoryState ${state}`}>{pct}%</span></div>
            <h3>{category.name}</h3>
            <p><strong>{fmt(spent)}</strong> із {fmt(category.limit)}</p>
            <div className="categoryProgress"><span style={{ width: `${clamp(pct)}%`, background: category.color }} /></div>
            <div className="tagRow">{(category.labels || []).slice(0, 3).map((label) => <span key={label}>#{label}</span>)}{category.labels?.length > 3 && <span>+{category.labels.length - 3}</span>}</div>
          </article>;
        })}
      </div>
    </section>
  );
}

function MandatorySection({ items, onAdd }) {
  return <section className="glassSection compactSection">
    <div className="sectionHeader"><div><span className="eyebrow">Регулярні платежі</span><h2>Обов’язкові витрати</h2></div><button className="textButton" type="button" onClick={onAdd}>＋ Додати</button></div>
    <div className="simpleList">{items.map((item) => <div className="simpleRow" key={item.id}><span className={`statusDot ${item.paid ? "paid" : "pending"}`} /><div><b>{item.name}</b><small>{item.dateLabel || "Без дати"}</small></div><strong>{fmt(item.amount)}</strong></div>)}</div>
  </section>;
}
function IncomeSection({ sources, onAdd }) {
  return <section className="glassSection asideSection">
    <div className="sectionHeader mini"><div><span className="eyebrow">Надходження</span><h2>Очікувані доходи</h2></div><button className="iconButton small" type="button" onClick={onAdd}>＋</button></div>
    <div className="simpleList">{sources.map((item) => <div className="simpleRow income" key={item.id}><span className="incomeEmoji">{item.icon}</span><div><b>{item.name}</b><small>{item.status === "received" ? "Отримано" : "Очікується"}</small></div><strong>+{fmt(item.amount)}</strong></div>)}</div>
  </section>;
}
function AssistantCard({ budget, summary }) {
  const worst = [...budget.categories].sort((a,b) => spentForCategory(budget,b)/b.limit - spentForCategory(budget,a)/a.limit)[0];
  const worstPct = worst ? Math.round((spentForCategory(budget,worst)/worst.limit)*100) : 0;
  return <section className="assistantCard">
    <div className="assistantIcon">✦</div><div><span className="eyebrow">Фінансовий асистент</span><h2>{summary.overCategories ? "Є категорії, які потребують уваги" : "Бюджет під контролем"}</h2>
    <p>{worst && worstPct >= 80 ? `Найбільше навантаження зараз у категорії «${worst.name}» — ${worstPct}%.` : `Темп витрат виглядає стабільно. Доступно близько ${fmt(summary.dailyLimit)} на день.`}</p></div>
  </section>;
}
function TelegramCard({ budget, onToggle }) {
  return <section className="telegramCard"><div className="telegramIcon">↗</div><div><h3>Нагадування в Telegram</h3><p>{budget.telegramEnabled ? `Бот попередить при ${budget.warningThreshold}% ліміту.` : "Сповіщення вимкнені."}</p></div><button className={`switch ${budget.telegramEnabled ? "on" : ""}`} type="button" onClick={onToggle}><span /></button></section>;
}
function ParticipantsCard({ budget, onShare }) {
  return <section className="glassSection asideSection participantsCard"><span className="eyebrow">Спільний бюджет</span><h2>Учасники</h2><div className="avatarRow">{budget.participants.map((name) => <span title={name} key={name}>{name.slice(0,1)}</span>)}</div><p>Запрошення за посиланням і ролі вже передбачені структурою.</p><button className="softButton full" type="button" onClick={onShare}>↗ Поділитися</button></section>;
}

function BudgetCalendar({ budget, expanded = false }) {
  const firstDate = budget.type === "monthly" ? `${budget.year}-${String(budget.month).padStart(2,"0")}-01` : budget.startDate;
  const lastDate = budget.type === "monthly" ? `${budget.year}-${String(budget.month).padStart(2,"0")}-${String(new Date(budget.year,budget.month,0).getDate()).padStart(2,"0")}` : budget.endDate;
  const days = Math.ceil((new Date(lastDate) - new Date(firstDate)) / 86400000) + 1;
  const firstDow = (new Date(firstDate).getDay() + 6) % 7;
  return <div className={`budgetCalendar ${expanded ? "expanded" : ""}`}>
    <div className="calendarDow">{DOW_UA.map(day => <span key={day}>{day}</span>)}</div>
    <div className="calendarGrid">{Array.from({length:firstDow}).map((_,i)=><span className="calendarDay empty" key={`e-${i}`} />)}{Array.from({length:days}).map((_,i)=>{
      const date = addDays(firstDate,i); const tx = budget.transactions.filter(item => item.date === date); const total = tx.reduce((sum,item)=>sum+item.amount,0);
      return <span className={`calendarDay ${tx.length ? "filled" : ""}`} key={date}><b>{new Date(date).getDate()}</b>{tx.length > 0 && <small>{fmt(total)}</small>}</span>;
    })}</div>
  </div>;
}
function PlannedExpensesTable({ budget, onAdd, compact = false }) {
  const items = budget.plannedExpenses || [];
  return <section className={`glassSection plannedSection ${compact ? "compact" : ""}`}><div className="sectionHeader"><div><span className="eyebrow">План події</span><h2>Заплановані витрати</h2></div><button className="textButton" type="button" onClick={onAdd}>＋ Додати</button></div><div className="plannedList">{items.map(item=><div className="plannedRow" key={item.id}><time>{new Date(item.date).toLocaleDateString("uk-UA",{day:"numeric",month:"short"})}</time><div><b>{item.desc}</b><small>{item.category}</small></div><span>{fmt(item.planned)}</span><strong>{item.actual == null ? "—" : fmt(item.actual)}</strong></div>)}</div></section>;
}

function BudgetActionModal({ type, budget, onClose, onChoose, onAddCategory, onAddTransaction, onAddMandatory, onAddIncome }) {
  const [form,setForm] = useState({ name:"", amount:"", limit:"", labels:"", date: budget.type === "event" ? budget.startDate : "2026-06-17", desc:"", category:"", frequency:"" });
  function submit(event) {
    event.preventDefault();
    if (type === "category") onAddCategory({ name: form.name.trim(), icon:"✦", color:"#00b86b", limit:Number(form.limit)||0, labels:parseLabels(form.labels) });
    if (type === "transaction") onAddTransaction({ desc:form.desc.trim(), amount:Number(form.amount)||0, date:form.date, labels:parseLabels(form.labels) });
    if (type === "mandatory") onAddMandatory({ name:form.name.trim(), amount:Number(form.amount)||0, dateLabel:form.date });
    if (type === "income") onAddIncome({ name:form.name.trim(), amount:Number(form.amount)||0, frequency:form.frequency || "очікується" });
    onClose();
  }
  return createPortal(<div className="budgetModalOverlay" onMouseDown={onClose}><div className="budgetModal" onMouseDown={event=>event.stopPropagation()}>
    {type === "quick" ? <><div className="modalHead"><div><span className="eyebrow">Швидка дія</span><h2>Що додати?</h2></div><button onClick={onClose}>×</button></div><div className="quickGrid">
      <button onClick={()=>onChoose("category")}><span>🏷️</span><b>Категорію</b><small>Ліміт і мітки</small></button>
      <button onClick={()=>onChoose("transaction")}><span>🧾</span><b>Витрату</b><small>Записати вручну</small></button>
      {budget.type === "monthly" && <button onClick={()=>onChoose("mandatory")}><span>📌</span><b>Обов’язкову</b><small>Регулярний платіж</small></button>}
      {budget.type === "monthly" && <button onClick={()=>onChoose("income")}><span>💰</span><b>Дохід</b><small>Очікуване надходження</small></button>}
    </div></> : <form onSubmit={submit}><div className="modalHead"><div><span className="eyebrow">Новий запис</span><h2>{type === "category" ? "Категорія бюджету" : type === "transaction" ? "Витрата" : type === "mandatory" ? "Обов’язкова витрата" : "Очікуваний дохід"}</h2></div><button type="button" onClick={onClose}>×</button></div>
      {type === "transaction" ? <><label>Назва<input value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} required /></label><label>Сума<input value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} type="number" required /></label><label>Дата<input value={form.date} onChange={e=>setForm({...form,date:e.target.value})} type="date" required /></label><label>Мітки<input value={form.labels} onChange={e=>setForm({...form,labels:e.target.value})} placeholder="продукти, biedronka" /></label></> : <><label>Назва<input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} required /></label><label>Сума {type === "category" ? "ліміту" : ""}<input value={type === "category" ? form.limit : form.amount} onChange={e=>setForm({...form,[type === "category" ? "limit" : "amount"]:e.target.value})} type="number" required /></label>{type === "category" && <label>Мітки<input value={form.labels} onChange={e=>setForm({...form,labels:e.target.value})} placeholder="кафе, ресторан, starbucks" /><small>Витрати з такими мітками автоматично потраплятимуть у категорію.</small></label>}{type === "income" && <label>Періодичність<input value={form.frequency} onChange={e=>setForm({...form,frequency:e.target.value})} placeholder="Щомісяця · 1-го числа" /></label>}</>}
      <div className="modalActions"><button className="softButton" type="button" onClick={onClose}>Скасувати</button><button className="primaryButton compact" type="submit">Додати</button></div></form>}
  </div></div>,document.body);
}

function BudgetEditModal({ budget, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    name: budget.name || "",
    totalLimit: String(budget.totalLimit || ""),
    startDate: budget.startDate || "",
    endDate: budget.endDate || "",
    warningThreshold: String(budget.warningThreshold || 80),
  });
  function submit(event) {
    event.preventDefault();
    onSave({
      name: form.name.trim() || budget.name,
      totalLimit: Number(form.totalLimit) || 0,
      warningThreshold: Number(form.warningThreshold) || 80,
      ...(budget.type === "event" ? { startDate: form.startDate, endDate: form.endDate } : {}),
    });
  }
  function remove() {
    if (window.confirm(`Видалити бюджет «${budget.name}»?`)) onDelete();
  }
  return createPortal(<div className="budgetModalOverlay" onMouseDown={onClose}><form className="budgetModal" onSubmit={submit} onMouseDown={event => event.stopPropagation()}>
    <div className="modalHead"><div><span className="eyebrow">Налаштування</span><h2>Редагувати бюджет</h2></div><button type="button" onClick={onClose}>×</button></div>
    <label>Назва<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required /></label>
    <label>Загальний ліміт<input value={form.totalLimit} onChange={event => setForm({ ...form, totalLimit: event.target.value })} type="number" min="0" required /><b className="inputSuffix">zł</b></label>
    {budget.type === "event" && <><label>Початок<input value={form.startDate} onChange={event => setForm({ ...form, startDate: event.target.value })} type="date" required /></label><label>Завершення<input value={form.endDate} onChange={event => setForm({ ...form, endDate: event.target.value })} type="date" required /></label></>}
    <label>Попереджати в Telegram при<input value={form.warningThreshold} onChange={event => setForm({ ...form, warningThreshold: event.target.value })} type="number" min="1" max="100" /><b className="inputSuffix">%</b></label>
    <div className="modalActions splitActions"><button className="dangerButton" type="button" onClick={remove}>Видалити бюджет</button><span /><button className="softButton" type="button" onClick={onClose}>Скасувати</button><button className="primaryButton compact" type="submit">Зберегти</button></div>
  </form></div>, document.body);
}

function BudgetWizard({ onClose, onCreate, previousMonthlyBudget }) {
  const [step,setStep]=useState(1); const [type,setType]=useState("monthly"); const [name,setName]=useState(""); const [limit,setLimit]=useState("6000"); const [telegram,setTelegram]=useState(true); const [selected,setSelected]=useState([0,1,3]); const [copyPrevious,setCopyPrevious]=useState(false);
  const presets = type === "monthly" ? CATEGORY_PRESETS : EVENT_PRESETS;
  function toggle(index){setSelected(value=>value.includes(index)?value.filter(i=>i!==index):[...value,index]);}
  function toggleCopyPrevious(){setCopyPrevious(value=>{const next=!value;if(next&&previousMonthlyBudget)setLimit(String(previousMonthlyBudget.totalLimit||0));return next;});}
  function finish(){const now=new Date(); const copied=type==="monthly"&&copyPrevious?cloneBudgetStructure(previousMonthlyBudget):null; const categories=copied?.categories||makeCategories(selected.map(index=>presets[index]), selected.map(()=>Math.round((Number(limit)||3000)/Math.max(3,selected.length)))); onCreate({id:uid("budget"),type,name:name.trim() || (type==="monthly"?`Бюджет на ${MONTHS_UA[now.getMonth()].toLowerCase()}`:"Нова подія"),month:now.getMonth()+1,year:now.getFullYear(),startDate:"2026-07-12",endDate:"2026-07-16",totalLimit:Number(limit)||copied?.totalLimit||0,telegramEnabled:telegram,warningThreshold:80,participants:["Ви"],categories,transactions:[],incomeSources:copied?.incomeSources||[],mandatoryExpenses:copied?.mandatoryExpenses||[],plannedExpenses:[]});}
  return createPortal(<div className="budgetModalOverlay wizardOverlay"><div className="budgetWizard"><div className="wizardTop"><div><span className="eyebrow">Крок {step} із 4</span><div className="wizardProgress"><span style={{width:`${step*25}%`}} /></div></div><button onClick={onClose}>×</button></div>
    {step===1&&<section><h2>Для чого створюємо бюджет?</h2><p>Почніть із шаблону. Усе можна змінити пізніше.</p><div className="typeChoice"><button className={type==="monthly"?"selected":""} type="button" onClick={()=>{setType("monthly");setCopyPrevious(false);}}><span>◷</span><b>На місяць</b><small>Регулярний контроль витрат</small></button><button className={type==="event"?"selected":""} type="button" onClick={()=>{setType("event");setCopyPrevious(false);}}><span>✦</span><b>Для події</b><small>Поїздка, ремонт або ціль</small></button></div></section>}
    {step===2&&<section><h2>{type==="monthly"?"Яку суму хочете контролювати?":"Назвіть подію та задайте ліміт"}</h2><p>Достатньо основного. Деталі додасте вже в бюджеті.</p>{type==="event"&&<label>Назва<input value={name} onChange={e=>setName(e.target.value)} placeholder="Поїздка в гори" /></label>}<label>Загальний ліміт<input value={limit} onChange={e=>setLimit(e.target.value)} type="number" /><b className="inputSuffix">zł</b></label>{type==="monthly"&&<button className={`copyPreviousChoice ${copyPrevious?"selected":""}`} type="button" disabled={!previousMonthlyBudget} onClick={toggleCopyPrevious}><span>⎘</span><div><b>Скопіювати минулий місяць</b><small>{previousMonthlyBudget?`Категорії, мітки, доходи та регулярні платежі з «${previousMonthlyBudget.name}»`:`Попереднього місячного бюджету ще немає`}</small></div><i>{copyPrevious?"✓":""}</i></button>}</section>}
    {step===3&&<section><h2>Додамо базові категорії?</h2><p>Мітки вже підготовлені: витрати автоматично потраплятимуть у потрібні категорії.</p><div className="presetGrid">{presets.map((item,index)=><button className={selected.includes(index)?"selected":""} type="button" onClick={()=>toggle(index)} key={item.name}><span>{item.icon}</span><b>{item.name}</b><small>{item.labels.slice(0,2).map(label=>`#${label}`).join(" · ")}</small></button>)}</div></section>}
    {step===4&&<section><h2>Нагадувати в Telegram?</h2><p>Бот напише, коли категорія наблизиться до ліміту.</p><button className={`telegramChoice ${telegram?"selected":""}`} type="button" onClick={()=>setTelegram(value=>!value)}><span>↗</span><div><b>{telegram?"Нагадування увімкнені":"Нагадування вимкнені"}</b><small>{telegram?"Попереджати при 80% ліміту":"Можна налаштувати пізніше"}</small></div><i>{telegram?"✓":""}</i></button></section>}
    <footer><button className="softButton" type="button" onClick={()=>step===1?onClose():setStep(value=>value-1)}>{step===1?"Скасувати":"← Назад"}</button><button className="primaryButton compact" type="button" onClick={()=>step===4?finish():setStep(value=>value+1)}>{step===4?"Створити бюджет":"Продовжити →"}</button></footer>
  </div></div>,document.body);
}

export default function BudgetPlanner() {
  const [budgets,setBudgets]=useState(initialBudgets); const [activeId,setActiveId]=useState(null); const [wizardOpen,setWizardOpen]=useState(false);
  const activeBudget=budgets.find(item=>item.id===activeId);
  const previousMonthlyBudget=findLatestMonthlyBudget(budgets, activeBudget?.id);
  function updateBudget(updated){setBudgets(items=>items.map(item=>item.id===updated.id?updated:item));}
  function createBudget(budget){setBudgets(items=>[...items,budget]);setWizardOpen(false);setActiveId(budget.id);}
  function deleteBudget(id){setBudgets(items=>items.filter(item=>item.id!==id));setActiveId(null);}
  return <section className="budgetPlanner">{activeBudget?<BudgetDashboard budget={activeBudget} onBack={()=>setActiveId(null)} onUpdate={updateBudget} onDelete={deleteBudget} previousMonthlyBudget={previousMonthlyBudget} />:<Portfolio budgets={budgets} onOpen={setActiveId} onCreate={()=>setWizardOpen(true)} />}{wizardOpen&&<BudgetWizard onClose={()=>setWizardOpen(false)} onCreate={createBudget} previousMonthlyBudget={findLatestMonthlyBudget(budgets)} />}</section>;
}
