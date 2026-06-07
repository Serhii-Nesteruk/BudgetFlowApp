import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { formatCurrency } from "../hooks/useCurrencyRates";
import { useBudgets } from "../hooks/useBudgets";
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
const DOW_UA = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"];
const CATEGORY_PRESETS = [
  {
    name: "Продукти",
    icon: "🛒",
    color: "#00b86b",
    defaultLimit: 1600,
    labels: ["biedronka", "lidl", "супермаркет"],
  },
  {
    name: "Транспорт",
    icon: "🚕",
    color: "#2563eb",
    defaultLimit: 600,
    labels: ["pkp", "ztm", "orlen"],
  },
  {
    name: "Житло",
    icon: "🏠",
    color: "#7c3aed",
    defaultLimit: 2200,
    labels: ["оренда", "комунальні"],
  },
  {
    name: "Кафе",
    icon: "☕",
    color: "#f59e0b",
    defaultLimit: 500,
    labels: ["кафе", "ресторан", "starbucks"],
  },
  { name: "Розваги", icon: "🎬", color: "#ec4899", defaultLimit: 400, labels: ["кіно", "netflix"] },
  {
    name: "Здоров’я",
    icon: "🩺",
    color: "#0891b2",
    defaultLimit: 350,
    labels: ["аптека", "лікар"],
  },
];
const EVENT_PRESETS = [
  {
    name: "Проживання",
    icon: "🏡",
    color: "#7c3aed",
    defaultLimit: 1200,
    labels: ["готель", "будиночок"],
  },
  { name: "Дорога", icon: "🚆", color: "#2563eb", defaultLimit: 700, labels: ["квитки", "pkp"] },
  { name: "Їжа", icon: "🥐", color: "#00b86b", defaultLimit: 600, labels: ["продукти", "кафе"] },
  { name: "Розваги", icon: "🎟️", color: "#ec4899", defaultLimit: 500, labels: ["екскурсія"] },
];
const CATEGORY_ICONS = [
  "🛒",
  "🥐",
  "☕",
  "🍽️",
  "🚕",
  "🚆",
  "⛽",
  "🏠",
  "🏡",
  "💡",
  "📱",
  "🩺",
  "💊",
  "🎬",
  "🎟️",
  "🎁",
  "🎓",
  "✈️",
  "🏋️",
  "🐾",
  "🧾",
  "✦",
];

function uid(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
function normalizeLabel(label) {
  return String(label || "")
    .trim()
    .toLocaleLowerCase("uk-UA");
}
function uniq(values) {
  return [...new Set(values.filter(Boolean).map(normalizeLabel))];
}
function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}
function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
function defaultMonthlyRange(year, month) {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  return {
    startDate,
    endDate: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}
function formatDateRange(startDate, endDate) {
  if (!startDate || !endDate) return "Період не вказаний";
  const options = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(`${startDate}T00:00:00`).toLocaleDateString("uk-UA", options)} — ${new Date(`${endDate}T00:00:00`).toLocaleDateString("uk-UA", options)}`;
}
function daysBetweenInclusive(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  return Math.max(
    1,
    Math.floor((new Date(`${endDate}T00:00:00`) - new Date(`${startDate}T00:00:00`)) / 86400000) + 1
  );
}
function formatAmount(value, currency) {
  return formatCurrency(value, currency);
}
function makeCategories(presets, limits) {
  return presets.map((preset, index) => ({
    id: uid("cat"),
    ...preset,
    limit: Number(limits[index] ?? preset.defaultLimit ?? 0),
    active: true,
  }));
}
function defaultPresetLimits(presets) {
  return Object.fromEntries(
    presets.map((preset, index) => [index, String(preset.defaultLimit ?? 0)])
  );
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
  return (
    [...budgets]
      .filter((budget) => budget.type === "monthly" && budget.id !== excludeId)
      .sort((a, b) => b.year * 12 + b.month - (a.year * 12 + a.month))[0] || null
  );
}
function findMonthlyBudgetForPeriod(budgets, year, month) {
  return (
    (budgets || []).find(
      (budget) =>
        budget.type === "monthly" &&
        Number(budget.year) === Number(year) &&
        Number(budget.month) === Number(month)
    ) || null
  );
}
function findPreviousMonthlyBudgetForPeriod(budgets, year, month) {
  const targetIndex = Number(year) * 12 + Number(month);
  return (
    [...(budgets || [])]
      .filter(
        (budget) =>
          budget.type === "monthly" && Number(budget.year) * 12 + Number(budget.month) < targetIndex
      )
      .sort(
        (a, b) => Number(b.year) * 12 + Number(b.month) - (Number(a.year) * 12 + Number(a.month))
      )[0] || null
  );
}
function findNextAvailableMonthlyPeriod(budgets, startDate = new Date()) {
  const cursor = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  for (let index = 0; index < 48; index += 1) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth() + 1;
    if (!findMonthlyBudgetForPeriod(budgets, year, month)) return { year, month };
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return { year: startDate.getFullYear(), month: startDate.getMonth() + 1 };
}

function monthlyPeriodIndex(budget) {
  return Number(budget?.year || 0) * 12 + Number(budget?.month || 0);
}
function currentMonthlyPeriodIndex(now = new Date()) {
  return now.getFullYear() * 12 + (now.getMonth() + 1);
}
function monthlyLifecycle(budget, now = new Date()) {
  if (budget.type !== "monthly") return "event";
  const fallback = defaultMonthlyRange(budget.year, budget.month);
  const startDate = budget.startDate || fallback.startDate;
  const endDate = budget.endDate || fallback.endDate;
  const today = now.toISOString().slice(0, 10);
  if (today < startDate) return "planned";
  if (today > endDate) return "history";
  return "active";
}

function lifecycleLabel(lifecycle) {
  return { active: "Активний", planned: "Запланований", history: "Завершений" }[lifecycle] || "";
}
function futureMonthLabels(budget, count) {
  if (!budget?.year || !budget?.month) return [];
  const start = new Date(Number(budget.year), Number(budget.month) - 1, 1);
  return Array.from({ length: count }, (_, index) => {
    const date = new Date(start.getFullYear(), start.getMonth() + index + 1, 1);
    return `${MONTHS_UA[date.getMonth()]} ${date.getFullYear()}`;
  });
}

function transactionMatchesCategory(transaction, category) {
  if (transaction.categoryId && Number(transaction.categoryId) === Number(category.id)) return true;
  const categoryLabels = new Set((category.labels || []).map(normalizeLabel));
  if (!categoryLabels.size) return false;
  if (transaction.placeLabel && categoryLabels.has(normalizeLabel(transaction.placeLabel)))
    return true;
  return (transaction.labels || []).some((label) => categoryLabels.has(normalizeLabel(label)));
}
function categoryTransactions(budget, category) {
  return (budget.transactions || []).filter(
    (transaction) =>
      transaction.type === "expense" && transactionMatchesCategory(transaction, category)
  );
}
function spentForCategory(budget, category) {
  return categoryTransactions(budget, category).reduce(
    (sum, transaction) => sum + Number(transaction.amount || 0),
    0
  );
}
function budgetSummary(budget) {
  const actualSpent = (budget.transactions || [])
    .filter((transaction) => transaction.type === "expense")
    .reduce((sum, transaction) => sum + Number(transaction.amount || 0), 0);
  const remaining = Number(budget.totalLimit || 0) - actualSpent;
  const progress = budget.totalLimit ? Math.round((actualSpent / budget.totalLimit) * 100) : 0;
  const overCategories = (budget.categories || []).filter(
    (category) => spentForCategory(budget, category) > category.limit
  ).length;
  const fallback = defaultMonthlyRange(budget.year, budget.month);
  const startDate = budget.startDate || fallback.startDate;
  const endDate = budget.endDate || fallback.endDate;
  const today = new Date().toISOString().slice(0, 10);
  const totalDays = daysBetweenInclusive(startDate, endDate);
  let daysLeft = Math.max(0, daysBetweenInclusive(today > startDate ? today : startDate, endDate));
  let elapsed = Math.max(1, totalDays - daysLeft + 1);
  let forecast = actualSpent;

  if (today < startDate) {
    daysLeft = totalDays;
    elapsed = 1;
  } else if (today > endDate) {
    daysLeft = 0;
    elapsed = totalDays;
  } else {
    forecast = Math.round((actualSpent / elapsed) * totalDays);
  }

  const dailyLimit = daysLeft > 0 ? Math.max(0, remaining) / daysLeft : 0;
  return { actualSpent, remaining, progress, overCategories, daysLeft, dailyLimit, forecast };
}

function sourceLabel(source) {
  return (
    { table: "Таблиця витрат", manual: "Додано вручну", mandatory: "Обов’язкова витрата" }[
      source
    ] || "Витрата"
  );
}

function TypeBadge({ type }) {
  return (
    <span className={`budgetType ${type}`}>{type === "monthly" ? "Щомісячний" : "Подійний"}</span>
  );
}

function Portfolio({ budgets, currency, onOpen, onCreate }) {
  const [expanded, setExpanded] = useState(false);
  const sorted = useMemo(
    () =>
      [...budgets].sort((a, b) => {
        if (a.type !== b.type) return a.type === "monthly" ? -1 : 1;
        if (a.type === "event")
          return String(b.startDate || "").localeCompare(String(a.startDate || ""));
        const order = { active: 0, planned: 1, history: 2 };
        const aState = monthlyLifecycle(a);
        const bState = monthlyLifecycle(b);
        if (order[aState] !== order[bState]) return order[aState] - order[bState];
        return aState === "history"
          ? monthlyPeriodIndex(b) - monthlyPeriodIndex(a)
          : monthlyPeriodIndex(a) - monthlyPeriodIndex(b);
      }),
    [budgets]
  );
  const visible = expanded ? sorted : sorted.slice(0, 5);
  const monthly = visible.filter((budget) => budget.type === "monthly");
  const events = visible.filter((budget) => budget.type === "event");
  const activeCount = budgets.filter(
    (budget) => budget.type === "event" || monthlyLifecycle(budget) === "active"
  ).length;
  const plannedCount = budgets.filter((budget) => monthlyLifecycle(budget) === "planned").length;
  const totalPlanned = budgets.reduce((sum, budget) => sum + Number(budget.totalLimit || 0), 0);

  return (
    <div className="budgetShell portfolioShell">
      <section className="portfolioHero">
        <div>
          <span className="eyebrow">Планування без зайвих таблиць</span>
          <h1>Ваші бюджети</h1>
          <p>
            Поточний місяць завжди під рукою. Майбутні плани зберігаються як чернетки й автоматично
            стають активними у свій час.
          </p>
        </div>
        <button className="primaryButton" type="button" onClick={onCreate}>
          ＋ Створити бюджет
        </button>
      </section>

      <section className="portfolioStats">
        <div>
          <span>Активних бюджетів</span>
          <strong>{activeCount}</strong>
        </div>
        <div>
          <span>Запланованих місяців</span>
          <strong>{plannedCount}</strong>
        </div>
        <div>
          <span>Усього заплановано</span>
          <strong>{formatAmount(totalPlanned, currency)}</strong>
        </div>
      </section>

      <section className="portfolioSection">
        <div className="sectionTitleRow">
          <div>
            <span className="eyebrow">Щомісяця</span>
            <h2>Регулярний контроль</h2>
          </div>
        </div>
        <div className="budgetGrid">
          {monthly.map((budget) => (
            <BudgetTile key={budget.id} budget={budget} currency={currency} onOpen={onOpen} />
          ))}
          <button className="createTile" type="button" onClick={onCreate}>
            <span>＋</span>
            <b>Новий щомісячний бюджет</b>
            <small>Створити за кілька кліків</small>
          </button>
        </div>
      </section>

      <section className="portfolioSection">
        <div className="sectionTitleRow">
          <div>
            <span className="eyebrow">Події та цілі</span>
            <h2>Окремі плани</h2>
          </div>
        </div>
        <div className="budgetGrid">
          {events.map((budget) => (
            <BudgetTile key={budget.id} budget={budget} currency={currency} onOpen={onOpen} />
          ))}
          <button className="createTile eventTile" type="button" onClick={onCreate}>
            <span>＋</span>
            <b>Нова подія або ціль</b>
            <small>Поїздка, ремонт чи покупка</small>
          </button>
        </div>
      </section>

      {budgets.length > 5 && (
        <button
          className="softButton full portfolioExpand"
          type="button"
          onClick={() => setExpanded((value) => !value)}
        >
          {expanded ? "Згорнути список" : `Показати всі бюджети · ${budgets.length}`}
        </button>
      )}
    </div>
  );
}

function BudgetTile({ budget, currency, onOpen }) {
  const summary = budgetSummary(budget);
  const lifecycle = monthlyLifecycle(budget);
  const dateLabel = formatDateRange(budget.startDate, budget.endDate);
  return (
    <button
      className={`budgetTile ${budget.type} ${lifecycle}`}
      type="button"
      onClick={() => onOpen(budget.id)}
    >
      <div className="budgetTileTop">
        <TypeBadge type={budget.type} />
        {budget.type === "monthly" && (
          <span className={`budgetLifecycle ${lifecycle}`}>{lifecycleLabel(lifecycle)}</span>
        )}
        <span className="budgetTileArrow">↗</span>
      </div>
      <div className="budgetTileBody">
        <h3>{budget.name}</h3>
        <p>{dateLabel}</p>
        {lifecycle === "planned" && (
          <small className="plannedHint">
            Поки що це чернетка. Вона стане активною автоматично.
          </small>
        )}
      </div>
      <div className="tileProgress">
        <span style={{ width: `${clamp(summary.progress)}%` }} />
      </div>
      <div className="budgetTileBottom">
        <strong>{formatAmount(summary.actualSpent, currency)}</strong>
        <span>із {formatAmount(budget.totalLimit, currency)}</span>
      </div>
      {budget.participants.length > 1 && (
        <div className="participantsMini">👥 {budget.participants.length} учасники</div>
      )}
    </button>
  );
}

function BudgetDashboard({
  budget,
  currency,
  availablePlaceLabels,
  onBack,
  onUpdate,
  onDelete,
  previousMonthlyBudget,
  onCopyStructure,
  onAddCategoryApi,
  onUpdateCategoryApi,
  onDeleteCategoryApi,
  onAddPlannedApi,
  onUpdatePlannedApi,
  onDeletePlannedApi,
  onAddMandatoryApi,
  onUpdateMandatoryApi,
  onDeleteMandatoryApi,
  onAddIncomeApi,
  onUpdateIncomeApi,
  onDeleteIncomeApi,
  onShare,
  onPlanNextMonths,
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [eventView, setEventView] = useState("overview");
  const [modalType, setModalType] = useState(null);
  const [modalItem, setModalItem] = useState(null);
  const [modalInitialDate, setModalInitialDate] = useState("");
  const [categoryDetails, setCategoryDetails] = useState(null);
  const [toast, setToast] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [planningOpen, setPlanningOpen] = useState(false);
  const summary = useMemo(() => budgetSummary(budget), [budget]);

  function showToast(message) {
    setToast(message);
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => setToast(""), 2200);
  }

  function openModal(type, item = null, date = "") {
    setModalType(type);
    setModalItem(item);
    setModalInitialDate(date);
  }

  function closeModal() {
    setModalType(null);
    setModalItem(null);
    setModalInitialDate("");
  }

  async function updateBudget(patch) {
    try {
      await onUpdate({ ...budget, ...patch });
    } catch (error) {
      showToast(`Не вдалося зберегти: ${error.message}`);
    }
  }

  async function copyPreviousMonth() {
    if (!previousMonthlyBudget)
      return showToast("Немає попереднього місячного бюджету для копіювання");
    try {
      await onCopyStructure(budget, previousMonthlyBudget);
      showToast("Структуру минулого місяця скопійовано ✓");
    } catch (error) {
      showToast(`Не вдалося скопіювати: ${error.message}`);
    }
  }

  async function saveCategory(category) {
    try {
      if (category.id) await onUpdateCategoryApi(budget.id, category.id, category);
      else await onAddCategoryApi(budget.id, { active: true, ...category });
      showToast(category.id ? "Категорію оновлено ✓" : "Категорію додано ✓");
      setCategoryDetails(null);
      closeModal();
    } catch (error) {
      showToast(`Не вдалося зберегти категорію: ${error.message}`);
    }
  }

  async function removeCategory(category) {
    if (!window.confirm(`Видалити категорію «${category.name}»?`)) return;
    try {
      await onDeleteCategoryApi(budget.id, category.id);
      setCategoryDetails(null);
      showToast("Категорію видалено ✓");
    } catch (error) {
      showToast(`Не вдалося видалити категорію: ${error.message}`);
    }
  }

  async function saveTransaction(transaction) {
    try {
      const payload = { ...transaction, name: transaction.desc, isPaid: true };
      if (transaction.id) await onUpdatePlannedApi(budget.id, transaction.id, payload);
      else await onAddPlannedApi(budget.id, payload);
      showToast(transaction.id ? "Витрату оновлено ✓" : "Витрату додано ✓");
      closeModal();
    } catch (error) {
      showToast(`Не вдалося зберегти витрату: ${error.message}`);
    }
  }

  async function removeTransaction(item) {
    if (!window.confirm(`Видалити витрату «${item.desc}»?`)) return;
    try {
      await onDeletePlannedApi(budget.id, item.id);
      showToast("Витрату видалено ✓");
    } catch (error) {
      showToast(`Не вдалося видалити витрату: ${error.message}`);
    }
  }

  async function saveMandatory(item) {
    try {
      const payload = { paid: false, ...item };
      if (item.id) await onUpdateMandatoryApi(budget.id, item.id, payload);
      else await onAddMandatoryApi(budget.id, payload);
      showToast(item.id ? "Обов’язкову витрату оновлено ✓" : "Обов’язкову витрату додано ✓");
      closeModal();
    } catch (error) {
      showToast(`Не вдалося зберегти витрату: ${error.message}`);
    }
  }

  async function removeMandatory(item) {
    if (!window.confirm(`Видалити обов’язкову витрату «${item.name}»?`)) return;
    try {
      await onDeleteMandatoryApi(budget.id, item.id);
      showToast("Обов’язкову витрату видалено ✓");
    } catch (error) {
      showToast(`Не вдалося видалити витрату: ${error.message}`);
    }
  }

  async function saveIncome(item) {
    try {
      const payload = { status: "pending", icon: "💰", ...item };
      if (item.id) await onUpdateIncomeApi(budget.id, item.id, payload);
      else await onAddIncomeApi(budget.id, payload);
      showToast(item.id ? "Дохід оновлено ✓" : "Дохід додано ✓");
      closeModal();
    } catch (error) {
      showToast(`Не вдалося зберегти дохід: ${error.message}`);
    }
  }

  async function removeIncome(item) {
    if (!window.confirm(`Видалити дохід «${item.name}»?`)) return;
    try {
      await onDeleteIncomeApi(budget.id, item.id);
      showToast("Дохід видалено ✓");
    } catch (error) {
      showToast(`Не вдалося видалити дохід: ${error.message}`);
    }
  }

  async function shareBudget() {
    try {
      const email = window.prompt(
        "Email користувача, якому надати доступ. Залиш поле порожнім, щоб лише скопіювати посилання.",
        ""
      );
      const updated = await onShare(budget, email?.trim());
      const link = `${window.location.origin}${window.location.pathname}?budgetShare=${updated.shareToken}`;
      await navigator.clipboard?.writeText(link);
      showToast(
        email?.trim() ? "Користувача додано, посилання скопійовано ✓" : "Посилання скопійовано ✓"
      );
    } catch (error) {
      showToast(`Не вдалося поділитися: ${error.message}`);
    }
  }

  async function planNextMonths(months) {
    try {
      const planned = await onPlanNextMonths(budget.id, months);
      setPlanningOpen(false);
      showToast(`План на ${months} міс. готовий · ${planned.length} бюджетів ✓`);
    } catch (error) {
      showToast(`Не вдалося запланувати місяці: ${error.message}`);
    }
  }

  return (
    <div className="budgetShell dashboardShell">
      <header className="dashboardHeader">
        <button className="backButton" type="button" onClick={onBack}>
          ← Усі бюджети
        </button>
        <div className="dashboardActions">
          {budget.type === "monthly" && (
            <button className="softButton" type="button" onClick={copyPreviousMonth}>
              ⎘ Скопіювати минулий місяць
            </button>
          )}
          {budget.type === "monthly" && monthlyLifecycle(budget) !== "history" && (
            <button className="softButton" type="button" onClick={() => setPlanningOpen(true)}>
              ◷ Планувати наперед
            </button>
          )}
          {budget.type === "event" && (
            <button className="softButton" type="button" onClick={shareBudget}>
              ↗ Поділитися
            </button>
          )}
          <button className="softButton" type="button" onClick={() => setEditOpen(true)}>
            ✎ Редагувати
          </button>
          <button
            className="primaryButton compact"
            type="button"
            onClick={() => openModal("quick")}
          >
            ＋ Додати
          </button>
        </div>
      </header>

      <section className={`dashboardHero ${budget.type}`}>
        <div className="heroMain">
          <div className="heroMeta">
            <TypeBadge type={budget.type} />
            {budget.type === "monthly" && (
              <span className={`budgetLifecycle ${monthlyLifecycle(budget)}`}>
                {lifecycleLabel(monthlyLifecycle(budget))}
              </span>
            )}
            <span>{formatDateRange(budget.startDate, budget.endDate)}</span>
          </div>
          <h1>{budget.name}</h1>
          <p className="heroLabel">Залишилось</p>
          <strong className="heroAmount">{formatAmount(summary.remaining, currency)}</strong>
          <div className="heroProgress">
            <span style={{ width: `${clamp(summary.progress)}%` }} />
          </div>
          <p className="heroProgressText">
            Використано {formatAmount(summary.actualSpent, currency)} із{" "}
            {formatAmount(budget.totalLimit, currency)} · {summary.progress}%
          </p>
        </div>
        <div className="heroSide">
          <div>
            <span>Днів залишилось</span>
            <strong>{summary.daysLeft}</strong>
          </div>
          <div>
            <span>Доступно на день</span>
            <strong>{formatAmount(summary.dailyLimit, currency)}</strong>
          </div>
          {budget.type === "monthly" && (
            <div>
              <span>Прогноз на кінець</span>
              <strong>{formatAmount(summary.forecast, currency)}</strong>
            </div>
          )}
          {budget.type === "event" && (
            <div>
              <span>Учасників</span>
              <strong>{budget.participants.length}</strong>
            </div>
          )}
        </div>
      </section>

      {budget.type === "monthly" && monthlyLifecycle(budget) === "planned" && (
        <div className="plannedBudgetNotice">
          <span>◷</span>
          <div>
            <b>Це запланований бюджет-чернетка</b>
            <small>
              Налаштуйте його заздалегідь. У день початку періоду він автоматично стане активним.
            </small>
          </div>
        </div>
      )}

      {budget.type === "event" && (
        <nav className="eventTabs">
          {[
            ["overview", "Огляд"],
            ["list", "Список"],
            ["calendar", "Календар"],
          ].map(([value, label]) => (
            <button
              className={eventView === value ? "active" : ""}
              key={value}
              type="button"
              onClick={() => setEventView(value)}
            >
              {label}
            </button>
          ))}
        </nav>
      )}

      {budget.type === "event" && eventView === "list" ? (
        <PlannedExpensesTable
          budget={budget}
          currency={currency}
          onAdd={() => openModal("transaction")}
          onEdit={(item) => openModal("transaction", item)}
          onDelete={removeTransaction}
        />
      ) : budget.type === "event" && eventView === "calendar" ? (
        <BudgetCalendar
          budget={budget}
          currency={currency}
          expanded
          onSelectDate={(date) => openModal("transaction", null, date)}
        />
      ) : (
        <div className="dashboardGrid">
          <main className="dashboardMain">
            <CategoriesSection
              budget={budget}
              currency={currency}
              onAdd={() => openModal("category")}
              onOpenCategory={setCategoryDetails}
            />
            {budget.type === "monthly" && (
              <MandatorySection
                items={budget.mandatoryExpenses}
                currency={currency}
                onAdd={() => openModal("mandatory")}
                onEdit={(item) => openModal("mandatory", item)}
                onDelete={removeMandatory}
              />
            )}
            {budget.type === "monthly" && (
              <PlannedExpensesTable
                budget={budget}
                currency={currency}
                compact
                onAdd={() => openModal("transaction")}
                onEdit={(item) => openModal("transaction", item)}
                onDelete={removeTransaction}
              />
            )}
            {budget.type === "event" && (
              <PlannedExpensesTable
                budget={budget}
                currency={currency}
                compact
                onAdd={() => openModal("transaction")}
                onEdit={(item) => openModal("transaction", item)}
                onDelete={removeTransaction}
              />
            )}
            <section className="glassSection calendarFold">
              <button
                className="foldButton"
                type="button"
                onClick={() => setCalendarOpen((value) => !value)}
              >
                <span>
                  <b>Календар витрат</b>
                  <small>
                    {budget.type === "monthly"
                      ? "Переглянути транзакції по днях"
                      : "Переглянути план події"}
                  </small>
                </span>
                <i>{calendarOpen ? "−" : "+"}</i>
              </button>
              {calendarOpen && (
                <BudgetCalendar
                  budget={budget}
                  currency={currency}
                  expanded
                  onSelectDate={(date) => openModal("transaction", null, date)}
                />
              )}
            </section>
          </main>
          <aside className="dashboardAside">
            <AssistantCard budget={budget} summary={summary} currency={currency} />
            {budget.type === "monthly" && (
              <IncomeSection
                sources={budget.incomeSources}
                currency={currency}
                onAdd={() => openModal("income")}
                onEdit={(item) => openModal("income", item)}
                onDelete={removeIncome}
              />
            )}
            <TelegramCard
              budget={budget}
              onToggle={() => updateBudget({ telegramEnabled: !budget.telegramEnabled })}
            />
            {budget.type === "event" && <ParticipantsCard budget={budget} onShare={shareBudget} />}
          </aside>
        </div>
      )}

      {modalType && (
        <BudgetActionModal
          type={modalType}
          initialItem={modalItem}
          budget={budget}
          currency={currency}
          availablePlaceLabels={availablePlaceLabels}
          initialDate={modalInitialDate}
          onClose={closeModal}
          onChoose={(type) => openModal(type)}
          onSaveCategory={saveCategory}
          onSaveTransaction={saveTransaction}
          onSaveMandatory={saveMandatory}
          onSaveIncome={saveIncome}
        />
      )}
      {categoryDetails && (
        <CategoryExpensesModal
          budget={budget}
          category={categoryDetails}
          currency={currency}
          availablePlaceLabels={availablePlaceLabels}
          onSaveCategory={saveCategory}
          onDeleteCategory={removeCategory}
          onClose={() => setCategoryDetails(null)}
        />
      )}
      {editOpen && (
        <BudgetEditModal
          budget={budget}
          currency={currency}
          onClose={() => setEditOpen(false)}
          onSave={async (patch) => {
            try {
              await onUpdate({ ...budget, ...patch });
              setEditOpen(false);
              showToast("Бюджет оновлено ✓");
            } catch (error) {
              showToast(`Не вдалося зберегти: ${error.message}`);
            }
          }}
          onDelete={async () => {
            try {
              await onDelete(budget.id);
            } catch (error) {
              showToast(`Не вдалося видалити: ${error.message}`);
            }
          }}
        />
      )}
      {planningOpen && (
        <PlanMonthsModal
          budget={budget}
          onClose={() => setPlanningOpen(false)}
          onPlan={planNextMonths}
        />
      )}
      <div className={`budgetToast ${toast ? "show" : ""}`}>{toast}</div>
    </div>
  );
}

function CategoriesSection({ budget, currency, onAdd, onOpenCategory }) {
  const ordered = useMemo(
    () =>
      [...budget.categories].sort((a, b) => {
        const aSpent = spentForCategory(budget, a);
        const bSpent = spentForCategory(budget, b);
        return (b.limit ? bSpent / b.limit : 0) - (a.limit ? aSpent / a.limit : 0);
      }),
    [budget]
  );
  return (
    <section className="glassSection">
      <div className="sectionHeader">
        <div>
          <span className="eyebrow">Автоматичний контроль</span>
          <h2>Категорії бюджету</h2>
          <p>
            Витрати автоматично потрапляють у категорії за вибраними місцями та кастомними мітками.
          </p>
        </div>
        <button className="iconButton" type="button" onClick={onAdd}>
          ＋
        </button>
      </div>
      <div className="categoryGrid">
        {ordered.map((category) => {
          const spent = spentForCategory(budget, category);
          const pct = category.limit ? Math.round((spent / category.limit) * 100) : 0;
          const state = pct > 100 ? "danger" : pct >= 80 ? "warn" : "ok";
          return (
            <button
              className={`categoryCard ${state}`}
              key={category.id}
              type="button"
              onClick={() => onOpenCategory(category)}
            >
              <div className="categoryTop">
                <span
                  className="categoryIcon"
                  style={{ background: `${category.color}18`, color: category.color }}
                >
                  {category.icon || "#"}
                </span>
                <span className={`categoryState ${state}`}>{pct}%</span>
              </div>
              <h3>{category.name}</h3>
              <p>
                <strong>{formatAmount(spent, currency)}</strong> із{" "}
                {formatAmount(category.limit, currency)}
              </p>
              <div className="categoryProgress">
                <span style={{ width: `${clamp(pct)}%`, background: category.color }} />
              </div>
              <div className="tagRow">
                {(category.labels || []).slice(0, 3).map((label) => (
                  <span key={label}>#{label}</span>
                ))}
                {category.labels?.length > 3 && <span>+{category.labels.length - 3}</span>}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function MandatorySection({ items, currency, onAdd, onEdit, onDelete }) {
  return (
    <section className="glassSection compactSection">
      <div className="sectionHeader">
        <div>
          <span className="eyebrow">Регулярні платежі</span>
          <h2>Обов’язкові витрати</h2>
          <p>Стають оплаченими лише після реальної транзакції з відповідною міткою.</p>
        </div>
        <button className="textButton" type="button" onClick={onAdd}>
          ＋ Додати
        </button>
      </div>
      <div className="simpleList">
        {items.map((item) => (
          <div className="simpleRow managedRow" key={item.id}>
            <span className={`statusDot ${item.paid ? "paid" : "pending"}`} />
            <div>
              <b>{item.name}</b>
              <small>
                {item.dateLabel || "Без дати"}
                {item.matchLabel ? ` · #${item.matchLabel}` : " · додайте мітку"}
              </small>
              <small>{item.paid ? "Оплачено реальною транзакцією" : "Очікує транзакцію"}</small>
            </div>
            <strong>{formatAmount(item.amount, currency)}</strong>
            <div className="rowActions">
              <button type="button" onClick={() => onEdit(item)} aria-label="Редагувати">
                ✎
              </button>
              <button
                className="danger"
                type="button"
                onClick={() => onDelete(item)}
                aria-label="Видалити"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function IncomeSection({ sources, currency, onAdd, onEdit, onDelete }) {
  return (
    <section className="glassSection asideSection">
      <div className="sectionHeader mini">
        <div>
          <span className="eyebrow">Надходження</span>
          <h2>Очікувані доходи</h2>
        </div>
        <button className="iconButton small" type="button" onClick={onAdd}>
          ＋
        </button>
      </div>
      <div className="simpleList">
        {sources.map((item) => (
          <div className="simpleRow income managedRow" key={item.id}>
            <span className="incomeEmoji">{item.icon}</span>
            <div>
              <b>{item.name}</b>
              <small>
                {item.status === "received"
                  ? "Отримано"
                  : item.expectedDate
                    ? `Очікується ${item.expectedDate}`
                    : "Очікується"}
              </small>
            </div>
            <strong>+{formatAmount(item.amount, currency)}</strong>
            <div className="rowActions">
              <button type="button" onClick={() => onEdit(item)} aria-label="Редагувати">
                ✎
              </button>
              <button
                className="danger"
                type="button"
                onClick={() => onDelete(item)}
                aria-label="Видалити"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function AssistantCard({ budget, summary, currency }) {
  const worst = [...budget.categories].sort(
    (a, b) =>
      (b.limit ? spentForCategory(budget, b) / b.limit : 0) -
      (a.limit ? spentForCategory(budget, a) / a.limit : 0)
  )[0];
  const worstPct = worst?.limit
    ? Math.round((spentForCategory(budget, worst) / worst.limit) * 100)
    : 0;
  return (
    <section className="assistantCard">
      <div className="assistantIcon">✦</div>
      <div>
        <span className="eyebrow">Фінансовий асистент</span>
        <h2>
          {summary.overCategories ? "Є категорії, які потребують уваги" : "Бюджет під контролем"}
        </h2>
        <p>
          {worst && worstPct >= 80
            ? `Найбільше навантаження зараз у категорії «${worst.name}» — ${worstPct}%.`
            : `Темп витрат виглядає стабільно. Доступно близько ${formatAmount(summary.dailyLimit, currency)} на день.`}
        </p>
      </div>
    </section>
  );
}
function TelegramCard({ budget, onToggle }) {
  return (
    <section className="telegramCard">
      <div className="telegramIcon">↗</div>
      <div>
        <h3>Нагадування в Telegram</h3>
        <p>
          {budget.telegramEnabled
            ? `Бот попередить при ${budget.warningThreshold}% ліміту.`
            : "Сповіщення вимкнені."}
        </p>
      </div>
      <button
        className={`switch ${budget.telegramEnabled ? "on" : ""}`}
        type="button"
        onClick={onToggle}
      >
        <span />
      </button>
    </section>
  );
}
function ParticipantsCard({ budget, onShare }) {
  return (
    <section className="glassSection asideSection participantsCard">
      <span className="eyebrow">Спільний бюджет</span>
      <h2>Учасники</h2>
      <div className="avatarRow">
        {budget.participants.map((name) => (
          <span title={name} key={name}>
            {name.slice(0, 1)}
          </span>
        ))}
      </div>
      <p>Доступ відкривається тільки користувачам зі списку.</p>
      <button className="softButton full" type="button" onClick={onShare}>
        ↗ Поділитися
      </button>
    </section>
  );
}

function BudgetCalendar({ budget, currency, expanded = false, onSelectDate }) {
  const firstDate = budget.startDate;
  const lastDate = budget.endDate;
  if (!firstDate || !lastDate)
    return <div className="emptyCalendar">Вкажіть період бюджету, щоб побачити календар.</div>;
  const days = daysBetweenInclusive(firstDate, lastDate);
  const firstDow = (new Date(`${firstDate}T00:00:00`).getDay() + 6) % 7;
  const planned = budget.plannedExpenses || [];
  return (
    <div className={`budgetCalendar ${expanded ? "expanded" : ""}`}>
      <div className="calendarHint">Натисніть на день, щоб швидко додати витрату.</div>
      <div className="calendarDow">
        {DOW_UA.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="calendarGrid">
        {Array.from({ length: firstDow }).map((_, i) => (
          <span className="calendarDay empty" key={`e-${i}`} />
        ))}
        {Array.from({ length: days }).map((_, i) => {
          const date = addDays(firstDate, i);
          const actual = (budget.transactions || []).filter((item) => item.date === date);
          const expected = planned.filter((item) => item.date === date && item.actual == null);
          const total = actual.reduce((sum, item) => sum + Number(item.amount || 0), 0);
          return (
            <button
              className={`calendarDay ${actual.length ? "filled" : ""} ${expected.length ? "planned" : ""}`}
              key={date}
              type="button"
              onClick={() => onSelectDate?.(date)}
            >
              <b>{new Date(`${date}T00:00:00`).getDate()}</b>
              {actual.length > 0 && <small>{formatAmount(total, currency)}</small>}
              {expected.length > 0 && <i>{expected.length} запл.</i>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlannedExpensesTable({ budget, currency, onAdd, onEdit, onDelete, compact = false }) {
  const items = budget.plannedExpenses || [];
  return (
    <section className={`glassSection plannedSection ${compact ? "compact" : ""}`}>
      <div className="sectionHeader">
        <div>
          <span className="eyebrow">
            {budget.type === "monthly" ? "Окремий облік" : "План події"}
          </span>
          <h2>{budget.type === "monthly" ? "Додані вручну витрати" : "Заплановані витрати"}</h2>
        </div>
        <button className="textButton" type="button" onClick={onAdd}>
          ＋ Додати
        </button>
      </div>
      <div className="plannedList">
        {items.map((item) => (
          <div className="plannedRow" key={item.id}>
            <time>
              {item.date
                ? new Date(`${item.date}T00:00:00`).toLocaleDateString("uk-UA", {
                    day: "numeric",
                    month: "short",
                  })
                : "—"}
            </time>
            <div>
              <b>{item.desc}</b>
              <small>{item.category}</small>
            </div>
            <span>{formatAmount(item.planned, currency)}</span>
            <strong>{item.actual == null ? "—" : formatAmount(item.actual, currency)}</strong>
            <div className="rowActions">
              <button type="button" onClick={() => onEdit(item)} aria-label="Редагувати">
                ✎
              </button>
              <button
                className="danger"
                type="button"
                onClick={() => onDelete(item)}
                aria-label="Видалити"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function LabelPicker({ options, selected, onChange }) {
  const [custom, setCustom] = useState("");
  function toggle(value) {
    onChange(
      selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]
    );
  }
  function addCustom() {
    const value = normalizeLabel(custom);
    if (!value) return;
    onChange(uniq([...selected, value]));
    setCustom("");
  }
  return (
    <div className="labelPicker">
      <div className="labelOptions">
        {options.map((option) => (
          <button
            type="button"
            key={option.value}
            className={selected.includes(option.value) ? "selected" : ""}
            onClick={() => toggle(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="customLabelRow">
        <input
          value={custom}
          onChange={(event) => setCustom(event.target.value)}
          placeholder="Своя мітка"
        />
        <button type="button" onClick={addCustom}>
          ＋
        </button>
      </div>
      {selected.length > 0 && (
        <div className="selectedLabels">
          {selected.map((label) => (
            <span key={label}>
              #{label}
              <button type="button" onClick={() => toggle(label)}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function BudgetActionModal({
  type,
  initialItem,
  budget,
  currency,
  availablePlaceLabels,
  initialDate,
  onClose,
  onChoose,
  onSaveCategory,
  onSaveTransaction,
  onSaveMandatory,
  onSaveIncome,
}) {
  const defaultDate =
    initialDate ||
    initialItem?.date ||
    initialItem?.dueDate ||
    (budget.type === "event" ? budget.startDate : new Date().toISOString().slice(0, 10));
  const isEditing = Boolean(initialItem?.id);
  const [form, setForm] = useState({
    id: initialItem?.id,
    name: initialItem?.name || "",
    amount: String(initialItem?.amount ?? initialItem?.planned ?? ""),
    limit: String(initialItem?.limit ?? ""),
    icon: initialItem?.icon || "✦",
    labels: initialItem?.labels || [],
    matchLabel: initialItem?.matchLabel || "",
    date: defaultDate,
    desc: initialItem?.desc || initialItem?.name || "",
    budgetCategoryId: initialItem?.budgetCategoryId || "",
    frequency: initialItem?.frequency || "",
    expectedDate: initialItem?.expectedDate || defaultDate,
    status: initialItem?.status || "pending",
  });

  function submit(event) {
    event.preventDefault();
    if (type === "category")
      onSaveCategory({
        id: form.id,
        name: form.name.trim(),
        icon: form.icon || "✦",
        color: initialItem?.color || "#00b86b",
        limit: Number(form.limit) || 0,
        labels: form.labels,
      });
    if (type === "transaction")
      onSaveTransaction({
        id: form.id,
        desc: form.desc.trim(),
        amount: Number(form.amount) || 0,
        date: form.date,
        budgetCategoryId: form.budgetCategoryId || null,
        labels: form.labels,
      });
    if (type === "mandatory")
      onSaveMandatory({
        id: form.id,
        name: form.name.trim(),
        amount: Number(form.amount) || 0,
        dueDate: form.date,
        budgetCategoryId: form.budgetCategoryId || null,
        frequency: form.frequency,
        matchLabel: form.matchLabel,
      });
    if (type === "income")
      onSaveIncome({
        id: form.id,
        name: form.name.trim(),
        amount: Number(form.amount) || 0,
        expectedDate: form.expectedDate,
        frequency: form.frequency || "очікується",
        status: form.status,
      });
  }

  return createPortal(
    <div className="budgetModalOverlay" onMouseDown={onClose}>
      <div className="budgetModal" onMouseDown={(event) => event.stopPropagation()}>
        {type === "quick" ? (
          <>
            <div className="modalHead">
              <div>
                <span className="eyebrow">Швидка дія</span>
                <h2>Що додати?</h2>
              </div>
              <button onClick={onClose}>×</button>
            </div>
            <div className="quickGrid">
              <button onClick={() => onChoose("category")}>
                <span>🏷️</span>
                <b>Категорію</b>
                <small>Ліміт і мітки</small>
              </button>
              <button onClick={() => onChoose("transaction")}>
                <span>🧾</span>
                <b>Витрату</b>
                <small>Записати вручну</small>
              </button>
              {budget.type === "monthly" && (
                <button onClick={() => onChoose("mandatory")}>
                  <span>📌</span>
                  <b>Обов’язкову</b>
                  <small>Платіж за міткою</small>
                </button>
              )}
              {budget.type === "monthly" && (
                <button onClick={() => onChoose("income")}>
                  <span>💰</span>
                  <b>Дохід</b>
                  <small>Очікуване надходження</small>
                </button>
              )}
            </div>
          </>
        ) : (
          <form onSubmit={submit}>
            <div className="modalHead">
              <div>
                <span className="eyebrow">{isEditing ? "Редагування" : "Новий запис"}</span>
                <h2>
                  {type === "category"
                    ? "Категорія бюджету"
                    : type === "transaction"
                      ? "Витрата"
                      : type === "mandatory"
                        ? "Обов’язкова витрата"
                        : "Очікуваний дохід"}
                </h2>
              </div>
              <button type="button" onClick={onClose}>
                ×
              </button>
            </div>

            {type === "transaction" ? (
              <>
                <label>
                  Назва
                  <input
                    value={form.desc}
                    onChange={(event) => setForm({ ...form, desc: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Сума ({currency})
                  <input
                    value={form.amount}
                    onChange={(event) => setForm({ ...form, amount: event.target.value })}
                    type="number"
                    required
                  />
                </label>
                <label>
                  Дата
                  <input
                    value={form.date}
                    onChange={(event) => setForm({ ...form, date: event.target.value })}
                    type="date"
                    required
                  />
                </label>
                <label>
                  Категорія
                  <select
                    value={form.budgetCategoryId}
                    onChange={(event) => setForm({ ...form, budgetCategoryId: event.target.value })}
                  >
                    <option value="">Без категорії</option>
                    {budget.categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
              </>
            ) : (
              <>
                <label>
                  Назва
                  <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                  />
                </label>
                <label>
                  Сума {type === "category" ? "ліміту" : ""} ({currency})
                  <input
                    value={type === "category" ? form.limit : form.amount}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        [type === "category" ? "limit" : "amount"]: event.target.value,
                      })
                    }
                    type="number"
                    required
                  />
                </label>
                {type === "category" && (
                  <>
                    <div className="categoryIconField">
                      <span>Іконка</span>
                      <IconPicker
                        value={form.icon}
                        onChange={(icon) => setForm({ ...form, icon })}
                      />
                    </div>
                    <label>
                      Мітки місць
                      <small>Оберіть місця з таблиці витрат або додайте власну мітку.</small>
                      <LabelPicker
                        options={availablePlaceLabels}
                        selected={form.labels}
                        onChange={(labels) => setForm({ ...form, labels })}
                      />
                    </label>
                  </>
                )}
                {type === "mandatory" && (
                  <>
                    <label>
                      Дата платежу
                      <input
                        value={form.date}
                        onChange={(event) => setForm({ ...form, date: event.target.value })}
                        type="date"
                        required
                      />
                    </label>
                    <label>
                      Категорія
                      <select
                        value={form.budgetCategoryId}
                        onChange={(event) =>
                          setForm({ ...form, budgetCategoryId: event.target.value })
                        }
                        required
                      >
                        <option value="">Оберіть категорію</option>
                        {budget.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Мітка для автоматичного зарахування
                      <small>
                        Коли транзакція з цією міткою з’явиться у таблиці витрат у межах періоду
                        бюджету, платіж стане оплаченим.
                      </small>
                      <LabelPicker
                        options={availablePlaceLabels}
                        selected={form.matchLabel ? [form.matchLabel] : []}
                        onChange={(labels) =>
                          setForm({ ...form, matchLabel: labels[labels.length - 1] || "" })
                        }
                      />
                    </label>
                    <label>
                      Періодичність
                      <input
                        value={form.frequency}
                        onChange={(event) => setForm({ ...form, frequency: event.target.value })}
                        placeholder="Щомісяця"
                      />
                    </label>
                  </>
                )}
                {type === "income" && (
                  <>
                    <label>
                      Очікувана дата
                      <input
                        value={form.expectedDate}
                        onChange={(event) => setForm({ ...form, expectedDate: event.target.value })}
                        type="date"
                      />
                    </label>
                    <label>
                      Періодичність
                      <input
                        value={form.frequency}
                        onChange={(event) => setForm({ ...form, frequency: event.target.value })}
                        placeholder="Щомісяця · 1-го числа"
                      />
                    </label>
                    {isEditing && (
                      <label>
                        Статус
                        <select
                          value={form.status}
                          onChange={(event) => setForm({ ...form, status: event.target.value })}
                        >
                          <option value="pending">Очікується</option>
                          <option value="received">Отримано</option>
                        </select>
                      </label>
                    )}
                  </>
                )}
              </>
            )}
            <div className="modalActions">
              <button className="softButton" type="button" onClick={onClose}>
                Скасувати
              </button>
              <button className="primaryButton compact" type="submit">
                {isEditing ? "Зберегти" : "Додати"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

function IconPicker({ value, onChange }) {
  return (
    <div className="categoryIconPicker" role="radiogroup" aria-label="Іконка категорії">
      {CATEGORY_ICONS.map((icon) => (
        <button
          aria-checked={value === icon}
          aria-label={`Обрати іконку ${icon}`}
          className={value === icon ? "selected" : ""}
          key={icon}
          onClick={() => onChange(icon)}
          role="radio"
          type="button"
        >
          {icon}
        </button>
      ))}
    </div>
  );
}

function CategoryExpensesModal({
  budget,
  category,
  currency,
  availablePlaceLabels,
  onSaveCategory,
  onDeleteCategory,
  onClose,
}) {
  const [form, setForm] = useState({
    id: category.id,
    name: category.name || "",
    icon: category.icon || "✦",
    color: category.color || "#00b86b",
    limit: String(category.limit ?? ""),
    labels: category.labels || [],
  });
  const items = categoryTransactions(budget, { ...category, labels: form.labels });
  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  function save() {
    onSaveCategory({
      ...category,
      name: form.name.trim() || category.name,
      icon: form.icon || "✦",
      color: form.color || "#00b86b",
      limit: Number(form.limit) || 0,
      labels: form.labels,
    });
  }

  return createPortal(
    <div className="budgetModalOverlay" onMouseDown={onClose}>
      <section
        className="budgetModal categoryExpenseModal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modalHead">
          <div>
            <span className="eyebrow">Категорія</span>
            <h2>
              {form.icon} {form.name || category.name}
            </h2>
            <p>
              {formatAmount(total, currency)} · {items.length} витрат
            </p>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="categorySettingsGrid">
          <label>
            Назва
            <input
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
            />
          </label>
          <div className="categoryIconField">
            <span>Іконка</span>
            <IconPicker value={form.icon} onChange={(icon) => setForm({ ...form, icon })} />
          </div>
          <label>
            Ліміт ({currency})
            <input
              value={form.limit}
              min="0"
              type="number"
              onChange={(event) => setForm({ ...form, limit: event.target.value })}
            />
          </label>
          <label>
            Колір
            <input
              className="categoryColorInput"
              value={form.color}
              type="color"
              onChange={(event) => setForm({ ...form, color: event.target.value })}
            />
          </label>
        </div>

        <div className="categoryLabelsEdit">
          <b>Мітки місць</b>
          <small>Виберіть місця з таблиці або додайте власну мітку.</small>
          <LabelPicker
            options={availablePlaceLabels}
            selected={form.labels}
            onChange={(labels) => setForm({ ...form, labels })}
          />
        </div>

        <div className="categoryExpenseList">
          {items.length === 0 ? (
            <p className="emptyList">Поки немає витрат, що відповідають міткам цієї категорії.</p>
          ) : (
            items.map((item) => (
              <div className="categoryExpenseRow" key={item.id}>
                <div>
                  <b>{item.desc}</b>
                  <small>
                    {item.date || "Без дати"} · {sourceLabel(item.source)}
                  </small>
                </div>
                <strong>{formatAmount(item.amount, currency)}</strong>
              </div>
            ))
          )}
        </div>
        <div className="modalActions splitActions categoryModalActions">
          <button className="dangerButton" type="button" onClick={() => onDeleteCategory(category)}>
            Видалити категорію
          </button>
          <span />
          <button className="softButton" type="button" onClick={onClose}>
            Скасувати
          </button>
          <button className="primaryButton compact" type="button" onClick={save}>
            Зберегти
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

function PlanMonthsModal({ budget, onClose, onPlan }) {
  const [months, setMonths] = useState(3);
  const labels = futureMonthLabels(budget, months);
  return createPortal(
    <div className="budgetModalOverlay" onMouseDown={onClose}>
      <div className="budgetModal planMonthsModal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="modalHead">
          <div>
            <span className="eyebrow">Планування наперед</span>
            <h2>Створити чернетки наступних місяців</h2>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="planMonthsIntro">
          Ми скопіюємо структуру цього бюджету. Кожен місяць можна редагувати окремо, а коли він
          настане — чернетка автоматично стане активним бюджетом.
        </p>
        <div className="planHorizonGrid">
          {[3, 6, 12].map((value) => (
            <button
              className={months === value ? "selected" : ""}
              type="button"
              key={value}
              onClick={() => setMonths(value)}
            >
              <b>{value}</b>
              <small>місяці</small>
            </button>
          ))}
        </div>
        <div className="planPreview">
          <b>Буде підготовлено</b>
          <div>
            {labels.slice(0, 6).map((label) => (
              <span key={label}>{label}</span>
            ))}
            {labels.length > 6 && <span>＋ ще {labels.length - 6}</span>}
          </div>
          <small>Якщо для певного місяця бюджет уже існує, він залишиться без змін.</small>
        </div>
        <div className="modalActions">
          <button className="softButton" type="button" onClick={onClose}>
            Скасувати
          </button>
          <button className="primaryButton compact" type="button" onClick={() => onPlan(months)}>
            Запланувати {months} міс. →
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

function BudgetEditModal({ budget, currency, onClose, onSave, onDelete }) {
  const [form, setForm] = useState({
    name: budget.name || "",
    totalLimit: String(budget.totalLimit || ""),
    startDate: budget.startDate || "",
    endDate: budget.endDate || "",
    warningThreshold: String(budget.warningThreshold || 80),
    autoCreateNextMonthly: budget.autoCreateNextMonthly ?? true,
  });

  function submit(event) {
    event.preventDefault();
    onSave({
      name: form.name.trim() || budget.name,
      totalLimit: Number(form.totalLimit) || 0,
      startDate: form.startDate,
      endDate: form.endDate,
      warningThreshold: Number(form.warningThreshold) || 80,
      autoCreateNextMonthly: form.autoCreateNextMonthly,
    });
  }

  function remove() {
    if (window.confirm(`Видалити бюджет «${budget.name}»?`)) onDelete();
  }

  return createPortal(
    <div className="budgetModalOverlay" onMouseDown={onClose}>
      <form
        className="budgetModal"
        onSubmit={submit}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="modalHead">
          <div>
            <span className="eyebrow">Налаштування</span>
            <h2>Редагувати бюджет</h2>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <label>
          Назва
          <input
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
        </label>
        <label>
          Загальний ліміт ({currency})
          <input
            value={form.totalLimit}
            onChange={(event) => setForm({ ...form, totalLimit: event.target.value })}
            type="number"
            min="0"
            required
          />
        </label>
        <div className="budgetPeriodFields">
          <label>
            Початок періоду
            <input
              value={form.startDate}
              onChange={(event) => setForm({ ...form, startDate: event.target.value })}
              type="date"
              required
            />
          </label>
          <label>
            Завершення періоду
            <input
              value={form.endDate}
              onChange={(event) => setForm({ ...form, endDate: event.target.value })}
              type="date"
              required
            />
          </label>
        </div>
        {budget.type === "monthly" && (
          <small className="fieldHint">
            Період може бути довільним: наприклад від зарплати до зарплати або довшим за календарний
            місяць.
          </small>
        )}
        <label>
          Попереджати в Telegram при
          <input
            value={form.warningThreshold}
            onChange={(event) => setForm({ ...form, warningThreshold: event.target.value })}
            type="number"
            min="1"
            max="100"
          />
        </label>
        {budget.type === "monthly" && (
          <label className="checkboxRow">
            <input
              type="checkbox"
              checked={form.autoCreateNextMonthly}
              onChange={(event) =>
                setForm({ ...form, autoCreateNextMonthly: event.target.checked })
              }
            />
            <span>Автоматично створювати наступний період з цією структурою</span>
          </label>
        )}
        <div className="modalActions splitActions">
          <button className="dangerButton" type="button" onClick={remove}>
            Видалити бюджет
          </button>
          <span />
          <button className="softButton" type="button" onClick={onClose}>
            Скасувати
          </button>
          <button className="primaryButton compact" type="submit">
            Зберегти
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

function BudgetWizard({ currency, budgets, onClose, onCreate, onOpenExisting }) {
  const initialPeriod = useMemo(() => findNextAvailableMonthlyPeriod(budgets), [budgets]);
  const initialRange = useMemo(
    () => defaultMonthlyRange(initialPeriod.year, initialPeriod.month),
    [initialPeriod]
  );
  const [step, setStep] = useState(1);
  const [type, setType] = useState("monthly");
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("6000");
  const [telegram, setTelegram] = useState(true);
  const [selected, setSelected] = useState([0, 1, 3]);
  const [categoryLimits, setCategoryLimits] = useState(() => defaultPresetLimits(CATEGORY_PRESETS));
  const [copyPrevious, setCopyPrevious] = useState(false);
  const [month, setMonth] = useState(initialPeriod.month);
  const [year, setYear] = useState(initialPeriod.year);
  const [startDate, setStartDate] = useState(initialRange.startDate);
  const [endDate, setEndDate] = useState(initialRange.endDate);
  const presets = type === "monthly" ? CATEGORY_PRESETS : EVENT_PRESETS;
  const existingMonthlyBudget =
    type === "monthly" ? findMonthlyBudgetForPeriod(budgets, year, month) : null;
  const previousMonthlyBudget =
    type === "monthly" ? findPreviousMonthlyBudgetForPeriod(budgets, year, month) : null;
  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const min = Math.min(current - 1, Number(year));
    const max = Math.max(current + 4, Number(year));
    return Array.from({ length: max - min + 1 }, (_, index) => min + index);
  }, [year]);

  function setMonthlyPeriod(nextYear, nextMonth) {
    const range = defaultMonthlyRange(nextYear, nextMonth);
    setYear(Number(nextYear));
    setMonth(Number(nextMonth));
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setCopyPrevious(false);
  }

  function toggle(index) {
    setSelected((value) =>
      value.includes(index) ? value.filter((i) => i !== index) : [...value, index]
    );
  }

  function toggleCopyPrevious() {
    setCopyPrevious((value) => {
      const next = !value;
      if (next && previousMonthlyBudget) setLimit(String(previousMonthlyBudget.totalLimit || 0));
      return next;
    });
  }

  function selectType(nextType) {
    const nextPresets = nextType === "monthly" ? CATEGORY_PRESETS : EVENT_PRESETS;
    const now = new Date().toISOString().slice(0, 10);
    setType(nextType);
    setSelected([0, 1, 3].filter((index) => index < nextPresets.length));
    setCategoryLimits(defaultPresetLimits(nextPresets));
    setCopyPrevious(false);
    if (nextType === "monthly") {
      const range = defaultMonthlyRange(year, month);
      setStartDate(range.startDate);
      setEndDate(range.endDate);
    } else {
      setStartDate(now);
      setEndDate(addDays(now, 3));
    }
  }

  function finish() {
    if (existingMonthlyBudget || !startDate || !endDate || endDate < startDate) return;
    const copied =
      type === "monthly" && copyPrevious ? cloneBudgetStructure(previousMonthlyBudget) : null;
    const categories =
      copied?.categories ||
      makeCategories(
        selected.map((index) => presets[index]),
        selected.map((index) => Number(categoryLimits[index] ?? presets[index]?.defaultLimit ?? 0))
      );
    onCreate({
      id: uid("budget"),
      type,
      name:
        name.trim() ||
        (type === "monthly" ? `Бюджет на ${MONTHS_UA[month - 1].toLowerCase()}` : "Нова подія"),
      currency,
      month: type === "monthly" ? Number(month) : null,
      year: type === "monthly" ? Number(year) : null,
      startDate,
      endDate,
      totalLimit: Number(limit) || copied?.totalLimit || 0,
      telegramEnabled: telegram,
      warningThreshold: 80,
      autoCreateNextMonthly: type === "monthly",
      participants: ["Ви"],
      categories,
      transactions: [],
      incomeSources: copied?.incomeSources || [],
      mandatoryExpenses: copied?.mandatoryExpenses || [],
      plannedExpenses: [],
    });
  }

  function next() {
    if (step === 2 && (existingMonthlyBudget || !startDate || !endDate || endDate < startDate))
      return;
    if (step === 4) finish();
    else setStep((value) => value + 1);
  }

  return createPortal(
    <div className="budgetModalOverlay wizardOverlay">
      <div className="budgetWizard">
        <div className="wizardTop">
          <div>
            <span className="eyebrow">Крок {step} із 4</span>
            <div className="wizardProgress">
              <span style={{ width: `${step * 25}%` }} />
            </div>
          </div>
          <button onClick={onClose}>×</button>
        </div>

        {step === 1 && (
          <section>
            <h2>Для чого створюємо бюджет?</h2>
            <p>Почніть із шаблону. Усе можна змінити пізніше.</p>
            <div className="typeChoice">
              <button
                className={type === "monthly" ? "selected" : ""}
                type="button"
                onClick={() => selectType("monthly")}
              >
                <span>◷</span>
                <b>Регулярний бюджет</b>
                <small>Місяць або довільний період</small>
              </button>
              <button
                className={type === "event" ? "selected" : ""}
                type="button"
                onClick={() => selectType("event")}
              >
                <span>✦</span>
                <b>Для події</b>
                <small>Поїздка, ремонт або ціль</small>
              </button>
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <h2>
              {type === "monthly" ? "Оберіть період і суму" : "Назвіть подію та задайте ліміт"}
            </h2>
            <p>
              {type === "monthly"
                ? "Можна планувати календарний місяць або власний цикл, наприклад від зарплати до зарплати."
                : "Достатньо основного. Деталі додасте вже в бюджеті."}
            </p>
            {type === "monthly" && (
              <>
                <div className="monthlyPeriodGrid">
                  <label>
                    Базовий місяць
                    <select
                      value={month}
                      onChange={(event) => setMonthlyPeriod(year, Number(event.target.value))}
                    >
                      {MONTHS_UA.map((label, index) => (
                        <option value={index + 1} key={label}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Рік
                    <select
                      value={year}
                      onChange={(event) => setMonthlyPeriod(Number(event.target.value), month)}
                    >
                      {yearOptions.map((value) => (
                        <option value={value} key={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                {existingMonthlyBudget && (
                  <div className="budgetExistsNotice">
                    <div>
                      <b>
                        Бюджет на {MONTHS_UA[month - 1].toLowerCase()} {year} вже існує
                      </b>
                      <small>
                        Створювати дубль не потрібно. Відкрийте наявний бюджет або виберіть інший
                        базовий місяць.
                      </small>
                    </div>
                    <button type="button" onClick={() => onOpenExisting(existingMonthlyBudget.id)}>
                      Відкрити
                    </button>
                  </div>
                )}
              </>
            )}
            {type === "event" && (
              <label>
                Назва
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Поїздка в гори"
                />
              </label>
            )}
            <div className="budgetPeriodFields">
              <label>
                Початок періоду
                <input
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                  type="date"
                  required
                />
              </label>
              <label>
                Завершення періоду
                <input
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                  type="date"
                  required
                />
              </label>
            </div>
            {endDate && startDate && endDate < startDate && (
              <small className="validationHint">Дата завершення не може бути раніше початку.</small>
            )}
            <label>
              Загальний ліміт ({currency})
              <input
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                type="number"
              />
            </label>
            {type === "monthly" && (
              <button
                className={`copyPreviousChoice ${copyPrevious ? "selected" : ""}`}
                type="button"
                disabled={!previousMonthlyBudget}
                onClick={toggleCopyPrevious}
              >
                <span>⎘</span>
                <div>
                  <b>Скопіювати попередній бюджет</b>
                  <small>
                    {previousMonthlyBudget
                      ? `Категорії, мітки, доходи та регулярні платежі з «${previousMonthlyBudget.name}»`
                      : "Перед обраним місяцем ще немає регулярного бюджету"}
                  </small>
                </div>
                <i>{copyPrevious ? "✓" : ""}</i>
              </button>
            )}
          </section>
        )}

        {step === 3 && (
          <section>
            <h2>Додамо базові категорії?</h2>
            <p>
              Кожна категорія має власний ліміт. Після створення ви зможете змінити іконку, колір і
              мітки.
            </p>
            <div className="presetGrid">
              {presets.map((item, index) => {
                const isSelected = selected.includes(index);
                return (
                  <div className={`presetCard ${isSelected ? "selected" : ""}`} key={item.name}>
                    <button
                      className={isSelected ? "selected" : ""}
                      type="button"
                      onClick={() => toggle(index)}
                    >
                      <span>{item.icon}</span>
                      <b>{item.name}</b>
                      <small>
                        {item.labels
                          .slice(0, 2)
                          .map((label) => `#${label}`)
                          .join(" · ")}
                      </small>
                    </button>
                    {isSelected && (
                      <label className="presetLimitField">
                        Ліміт ({currency})
                        <input
                          value={categoryLimits[index] ?? ""}
                          min="0"
                          type="number"
                          onChange={(event) =>
                            setCategoryLimits({ ...categoryLimits, [index]: event.target.value })
                          }
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {step === 4 && (
          <section>
            <h2>Нагадувати в Telegram?</h2>
            <p>Бот напише, коли категорія наблизиться до ліміту.</p>
            <button
              className={`telegramChoice ${telegram ? "selected" : ""}`}
              type="button"
              onClick={() => setTelegram((value) => !value)}
            >
              <span>↗</span>
              <div>
                <b>{telegram ? "Нагадування увімкнені" : "Нагадування вимкнені"}</b>
                <small>
                  {telegram ? "Попереджати при 80% ліміту" : "Можна налаштувати пізніше"}
                </small>
              </div>
              <i>{telegram ? "✓" : ""}</i>
            </button>
          </section>
        )}

        <footer>
          <button
            className="softButton"
            type="button"
            onClick={() => (step === 1 ? onClose() : setStep((value) => value - 1))}
          >
            {step === 1 ? "Скасувати" : "← Назад"}
          </button>
          <button
            className="primaryButton compact"
            type="button"
            disabled={
              step === 2 &&
              (Boolean(existingMonthlyBudget) || !startDate || !endDate || endDate < startDate)
            }
            onClick={next}
          >
            {step === 4 ? "Створити бюджет" : "Продовжити →"}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}

export default function BudgetPlanner({ expenses = [], rates, baseCurrency = "PLN" }) {
  const {
    budgets,
    availablePlaceLabels,
    loading,
    error,
    createBudget: createBudgetApi,
    updateBudget: updateBudgetApi,
    deleteBudget: deleteBudgetApi,
    addCategory,
    updateCategory,
    removeCategory,
    addIncome,
    updateIncome,
    removeIncome,
    addMandatory,
    updateMandatory,
    removeMandatory,
    addPlanned,
    updatePlanned,
    removePlanned,
    copyStructure,
    share,
    enableSharing,
    planNextMonths,
  } = useBudgets(expenses, rates, baseCurrency);
  const [activeId, setActiveId] = useState(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const activeBudget = budgets.find((item) => item.id === activeId);
  const previousMonthlyBudget = findLatestMonthlyBudget(budgets, activeBudget?.id);
  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("budgetShare");
    if (!token) return;
    const shared = budgets.find(
      (item) => String(item.shareToken).toLowerCase() === token.toLowerCase()
    );
    if (shared) setActiveId(shared.id);
  }, [budgets]);
  async function createBudget(budget) {
    try {
      const created = await createBudgetApi(budget);
      setWizardOpen(false);
      setActiveId(Number(created.id));
    } catch (error) {
      window.alert(`Не вдалося створити бюджет: ${error.message}`);
    }
  }
  async function deleteBudget(id) {
    await deleteBudgetApi(id);
    setActiveId(null);
  }
  async function shareBudget(budget, email) {
    let updated = budget;
    if (email) updated = await share(budget.id, email);
    if (!updated.sharingEnabled) updated = await enableSharing(budget.id);
    return updated;
  }
  if (loading)
    return (
      <section className="budgetPlanner">
        <div className="budgetShell">
          <p>Завантаження бюджетів…</p>
        </div>
      </section>
    );
  return (
    <section className="budgetPlanner">
      {error && (
        <div className="budgetShell">
          <p style={{ color: "#b42318", fontWeight: 700 }}>⚠ {error}</p>
        </div>
      )}
      {activeBudget ? (
        <BudgetDashboard
          budget={activeBudget}
          currency={baseCurrency}
          availablePlaceLabels={availablePlaceLabels}
          onBack={() => setActiveId(null)}
          onUpdate={updateBudgetApi}
          onDelete={deleteBudget}
          previousMonthlyBudget={previousMonthlyBudget}
          onCopyStructure={copyStructure}
          onAddCategoryApi={addCategory}
          onUpdateCategoryApi={updateCategory}
          onDeleteCategoryApi={removeCategory}
          onAddPlannedApi={addPlanned}
          onUpdatePlannedApi={updatePlanned}
          onDeletePlannedApi={removePlanned}
          onAddMandatoryApi={addMandatory}
          onUpdateMandatoryApi={updateMandatory}
          onDeleteMandatoryApi={removeMandatory}
          onAddIncomeApi={addIncome}
          onUpdateIncomeApi={updateIncome}
          onDeleteIncomeApi={removeIncome}
          onShare={shareBudget}
          onPlanNextMonths={planNextMonths}
        />
      ) : (
        <Portfolio
          budgets={budgets}
          currency={baseCurrency}
          onOpen={setActiveId}
          onCreate={() => setWizardOpen(true)}
        />
      )}
      {wizardOpen && (
        <BudgetWizard
          currency={baseCurrency}
          budgets={budgets}
          onClose={() => setWizardOpen(false)}
          onCreate={createBudget}
          onOpenExisting={(id) => {
            setWizardOpen(false);
            setActiveId(Number(id));
          }}
        />
      )}
    </section>
  );
}
