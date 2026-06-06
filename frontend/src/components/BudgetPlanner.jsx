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
  { name: "Продукти", icon: "🛒", color: "#00b86b", labels: ["biedronka", "lidl", "супермаркет"] },
  { name: "Транспорт", icon: "🚕", color: "#2563eb", labels: ["pkp", "ztm", "orlen"] },
  { name: "Житло", icon: "🏠", color: "#7c3aed", labels: ["оренда", "комунальні"] },
  { name: "Кафе", icon: "☕", color: "#f59e0b", labels: ["кафе", "ресторан", "starbucks"] },
  { name: "Розваги", icon: "🎬", color: "#ec4899", labels: ["кіно", "netflix"] },
  { name: "Здоров’я", icon: "🩺", color: "#0891b2", labels: ["аптека", "лікар"] },
];
const EVENT_PRESETS = [
  { name: "Проживання", icon: "🏡", color: "#7c3aed", labels: ["готель", "будиночок"] },
  { name: "Дорога", icon: "🚆", color: "#2563eb", labels: ["квитки", "pkp"] },
  { name: "Їжа", icon: "🥐", color: "#00b86b", labels: ["продукти", "кафе"] },
  { name: "Розваги", icon: "🎟️", color: "#ec4899", labels: ["екскурсія"] },
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
function formatAmount(value, currency) {
  return formatCurrency(value, currency);
}
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
  const period = monthlyPeriodIndex(budget);
  const current = currentMonthlyPeriodIndex(now);
  if (period === current) return "active";
  if (period > current) return "planned";
  return "history";
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
  const today = new Date();
  let daysLeft = 1;
  let elapsed = 1;
  let forecast = actualSpent;
  if (budget.type === "monthly") {
    const lastDay = new Date(budget.year, budget.month, 0).getDate();
    const lifecycle = monthlyLifecycle(budget, today);
    if (lifecycle === "planned") {
      daysLeft = lastDay;
      forecast = actualSpent;
    } else if (lifecycle === "history") {
      daysLeft = 0;
      elapsed = lastDay;
      forecast = actualSpent;
    } else {
      daysLeft = Math.max(1, lastDay - today.getDate());
      elapsed = Math.max(1, today.getDate());
      forecast = Math.round((actualSpent / elapsed) * lastDay);
    }
  } else if (budget.endDate) {
    daysLeft = Math.max(1, Math.ceil((new Date(`${budget.endDate}T00:00:00`) - today) / 86400000));
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
  const dateLabel =
    budget.type === "monthly"
      ? `${MONTHS_UA[budget.month - 1]} ${budget.year}`
      : `${budget.startDate || "Без дати"} — ${budget.endDate || "Без дати"}`;
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
  onAddPlannedApi,
  onAddMandatoryApi,
  onAddIncomeApi,
  onShare,
  onPlanNextMonths,
}) {
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [eventView, setEventView] = useState("overview");
  const [modalType, setModalType] = useState(null);
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
  async function addCategory(category) {
    try {
      await onAddCategoryApi(budget.id, { active: true, ...category });
      showToast("Категорію додано ✓");
    } catch (error) {
      showToast(`Не вдалося додати категорію: ${error.message}`);
    }
  }
  async function updateCategory(category, labels) {
    try {
      await onUpdateCategoryApi(budget.id, category.id, { ...category, labels });
      showToast("Мітки категорії оновлено ✓");
      setCategoryDetails(null);
    } catch (error) {
      showToast(`Не вдалося оновити мітки: ${error.message}`);
    }
  }
  async function addTransaction(transaction) {
    try {
      await onAddPlannedApi(budget.id, { ...transaction, name: transaction.desc, isPaid: true });
      showToast("Витрату додано ✓");
    } catch (error) {
      showToast(`Не вдалося додати витрату: ${error.message}`);
    }
  }
  async function addMandatory(item) {
    try {
      await onAddMandatoryApi(budget.id, { paid: false, ...item });
      showToast("Обов’язкову витрату додано ✓");
    } catch (error) {
      showToast(`Не вдалося додати витрату: ${error.message}`);
    }
  }
  async function addIncome(item) {
    try {
      await onAddIncomeApi(budget.id, { status: "pending", icon: "💰", ...item });
      showToast("Дохід додано ✓");
    } catch (error) {
      showToast(`Не вдалося додати дохід: ${error.message}`);
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

  function addForDate(date) {
    setModalInitialDate(date);
    setModalType("transaction");
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
            onClick={() => setModalType("quick")}
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
            <span>
              {budget.type === "monthly"
                ? `${MONTHS_UA[budget.month - 1]} ${budget.year}`
                : `${budget.startDate} — ${budget.endDate}`}
            </span>
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
              Налаштуйте його заздалегідь. Першого числа відповідного місяця він автоматично стане
              активним — нічого додатково створювати не потрібно.
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
          onAdd={() => setModalType("transaction")}
        />
      ) : budget.type === "event" && eventView === "calendar" ? (
        <BudgetCalendar budget={budget} currency={currency} expanded onSelectDate={addForDate} />
      ) : (
        <div className="dashboardGrid">
          <main className="dashboardMain">
            <CategoriesSection
              budget={budget}
              currency={currency}
              onAdd={() => setModalType("category")}
              onOpenCategory={setCategoryDetails}
            />
            {budget.type === "monthly" && (
              <MandatorySection
                items={budget.mandatoryExpenses}
                currency={currency}
                onAdd={() => setModalType("mandatory")}
              />
            )}
            {budget.type === "event" && (
              <PlannedExpensesTable
                budget={budget}
                currency={currency}
                compact
                onAdd={() => setModalType("transaction")}
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
                  onSelectDate={addForDate}
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
                onAdd={() => setModalType("income")}
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
          budget={budget}
          currency={currency}
          availablePlaceLabels={availablePlaceLabels}
          initialDate={modalInitialDate}
          onClose={() => {
            setModalType(null);
            setModalInitialDate("");
          }}
          onChoose={setModalType}
          onAddCategory={addCategory}
          onAddTransaction={addTransaction}
          onAddMandatory={addMandatory}
          onAddIncome={addIncome}
        />
      )}
      {categoryDetails && (
        <CategoryExpensesModal
          budget={budget}
          category={categoryDetails}
          currency={currency}
          availablePlaceLabels={availablePlaceLabels}
          onSaveLabels={updateCategory}
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

function MandatorySection({ items, currency, onAdd }) {
  return (
    <section className="glassSection compactSection">
      <div className="sectionHeader">
        <div>
          <span className="eyebrow">Регулярні платежі</span>
          <h2>Обов’язкові витрати</h2>
        </div>
        <button className="textButton" type="button" onClick={onAdd}>
          ＋ Додати
        </button>
      </div>
      <div className="simpleList">
        {items.map((item) => (
          <div className="simpleRow" key={item.id}>
            <span className={`statusDot ${item.paid ? "paid" : "pending"}`} />
            <div>
              <b>{item.name}</b>
              <small>{item.dateLabel || "Без дати"}</small>
            </div>
            <strong>{formatAmount(item.amount, currency)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
function IncomeSection({ sources, currency, onAdd }) {
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
          <div className="simpleRow income" key={item.id}>
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
  const firstDate =
    budget.type === "monthly"
      ? `${budget.year}-${String(budget.month).padStart(2, "0")}-01`
      : budget.startDate;
  const lastDate =
    budget.type === "monthly"
      ? `${budget.year}-${String(budget.month).padStart(2, "0")}-${String(new Date(budget.year, budget.month, 0).getDate()).padStart(2, "0")}`
      : budget.endDate;
  if (!firstDate || !lastDate)
    return <div className="emptyCalendar">Вкажіть період бюджету, щоб побачити календар.</div>;
  const days =
    Math.ceil((new Date(`${lastDate}T00:00:00`) - new Date(`${firstDate}T00:00:00`)) / 86400000) +
    1;
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

function PlannedExpensesTable({ budget, currency, onAdd, compact = false }) {
  const items = budget.plannedExpenses || [];
  return (
    <section className={`glassSection plannedSection ${compact ? "compact" : ""}`}>
      <div className="sectionHeader">
        <div>
          <span className="eyebrow">План події</span>
          <h2>Заплановані витрати</h2>
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
  budget,
  currency,
  availablePlaceLabels,
  initialDate,
  onClose,
  onChoose,
  onAddCategory,
  onAddTransaction,
  onAddMandatory,
  onAddIncome,
}) {
  const defaultDate =
    initialDate ||
    (budget.type === "event" ? budget.startDate : new Date().toISOString().slice(0, 10));
  const [form, setForm] = useState({
    name: "",
    amount: "",
    limit: "",
    labels: [],
    date: defaultDate,
    desc: "",
    budgetCategoryId: "",
    frequency: "",
    expectedDate: defaultDate,
  });
  function submit(event) {
    event.preventDefault();
    if (type === "category")
      onAddCategory({
        name: form.name.trim(),
        icon: "✦",
        color: "#00b86b",
        limit: Number(form.limit) || 0,
        labels: form.labels,
      });
    if (type === "transaction")
      onAddTransaction({
        desc: form.desc.trim(),
        amount: Number(form.amount) || 0,
        date: form.date,
        budgetCategoryId: form.budgetCategoryId || null,
        labels: form.labels,
      });
    if (type === "mandatory")
      onAddMandatory({
        name: form.name.trim(),
        amount: Number(form.amount) || 0,
        dueDate: form.date,
        budgetCategoryId: form.budgetCategoryId || null,
        frequency: form.frequency,
      });
    if (type === "income")
      onAddIncome({
        name: form.name.trim(),
        amount: Number(form.amount) || 0,
        expectedDate: form.expectedDate,
        frequency: form.frequency || "очікується",
      });
    onClose();
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
                  <small>Регулярний платіж</small>
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
                <span className="eyebrow">Новий запис</span>
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
                  <label>
                    Мітки місць
                    <small>Оберіть місця з таблиці витрат або додайте власну мітку.</small>
                    <LabelPicker
                      options={availablePlaceLabels}
                      selected={form.labels}
                      onChange={(labels) => setForm({ ...form, labels })}
                    />
                  </label>
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
                      >
                        <option value="">Без категорії</option>
                        {budget.categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
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
                  </>
                )}
              </>
            )}
            <div className="modalActions">
              <button className="softButton" type="button" onClick={onClose}>
                Скасувати
              </button>
              <button className="primaryButton compact" type="submit">
                Додати
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}

function CategoryExpensesModal({
  budget,
  category,
  currency,
  availablePlaceLabels,
  onSaveLabels,
  onClose,
}) {
  const [labels, setLabels] = useState(category.labels || []);
  const items = categoryTransactions(budget, { ...category, labels });
  const total = items.reduce((sum, item) => sum + Number(item.amount || 0), 0);
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
              {category.icon} {category.name}
            </h2>
            <p>
              {formatAmount(total, currency)} · {items.length} витрат
            </p>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="categoryLabelsEdit">
          <b>Мітки місць</b>
          <small>Виберіть місця з таблиці або додайте власну мітку.</small>
          <LabelPicker options={availablePlaceLabels} selected={labels} onChange={setLabels} />
          <button
            className="primaryButton compact"
            type="button"
            onClick={() => onSaveLabels(category, labels)}
          >
            Зберегти мітки
          </button>
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
      warningThreshold: Number(form.warningThreshold) || 80,
      autoCreateNextMonthly: form.autoCreateNextMonthly,
      ...(budget.type === "event" ? { startDate: form.startDate, endDate: form.endDate } : {}),
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
        {budget.type === "event" && (
          <>
            <label>
              Початок
              <input
                value={form.startDate}
                onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                type="date"
                required
              />
            </label>
            <label>
              Завершення
              <input
                value={form.endDate}
                onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                type="date"
                required
              />
            </label>
          </>
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
            <span>Автоматично створювати бюджет наступного місяця з цією структурою</span>
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
  const [step, setStep] = useState(1);
  const [type, setType] = useState("monthly");
  const [name, setName] = useState("");
  const [limit, setLimit] = useState("6000");
  const [telegram, setTelegram] = useState(true);
  const [selected, setSelected] = useState([0, 1, 3]);
  const [copyPrevious, setCopyPrevious] = useState(false);
  const [month, setMonth] = useState(initialPeriod.month);
  const [year, setYear] = useState(initialPeriod.year);
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
    setType(nextType);
    setCopyPrevious(false);
  }
  function finish() {
    if (existingMonthlyBudget) return;
    const now = new Date();
    const copied =
      type === "monthly" && copyPrevious ? cloneBudgetStructure(previousMonthlyBudget) : null;
    const categories =
      copied?.categories ||
      makeCategories(
        selected.map((index) => presets[index]),
        selected.map(() => Math.round((Number(limit) || 3000) / Math.max(3, selected.length)))
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
      startDate: type === "event" ? now.toISOString().slice(0, 10) : null,
      endDate: type === "event" ? addDays(now.toISOString().slice(0, 10), 3) : null,
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
    if (step === 2 && existingMonthlyBudget) return;
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
                <b>На місяць</b>
                <small>Регулярний контроль витрат</small>
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
              {type === "monthly" ? "Оберіть місяць і суму" : "Назвіть подію та задайте ліміт"}
            </h2>
            <p>Достатньо основного. Деталі додасте вже в бюджеті.</p>
            {type === "monthly" && (
              <>
                <div className="monthlyPeriodGrid">
                  <label>
                    Місяць
                    <select
                      value={month}
                      onChange={(event) => {
                        setMonth(Number(event.target.value));
                        setCopyPrevious(false);
                      }}
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
                      onChange={(event) => {
                        setYear(Number(event.target.value));
                        setCopyPrevious(false);
                      }}
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
                        місяць.
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
                      : "Перед обраним місяцем ще немає місячного бюджету"}
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
            <p>Після створення ви зможете вибрати конкретні місця з таблиці витрат.</p>
            <div className="presetGrid">
              {presets.map((item, index) => (
                <button
                  className={selected.includes(index) ? "selected" : ""}
                  type="button"
                  onClick={() => toggle(index)}
                  key={item.name}
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
              ))}
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
            disabled={step === 2 && Boolean(existingMonthlyBudget)}
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
    addIncome,
    addMandatory,
    addPlanned,
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
          onAddPlannedApi={addPlanned}
          onAddMandatoryApi={addMandatory}
          onAddIncomeApi={addIncome}
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
