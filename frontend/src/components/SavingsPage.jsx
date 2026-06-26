import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { convertAmount, formatCurrency } from "../hooks/useCurrencyRates";
import { useSavingsGoals } from "../hooks/useSavingsGoals";
import styles from "./SavingsPage.module.css";

const ICONS = [
  "🫙",
  "💻",
  "🚗",
  "🏠",
  "✈️",
  "🎓",
  "🎁",
  "🎸",
  "📱",
  "💍",
  "🚲",
  "🌴",
  "🛋️",
  "🧳",
  "🎯",
  "✨",
];
const CURRENCIES = ["PLN", "EUR", "USD", "UAH", "GBP"];

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLocaleLowerCase("uk-UA");
const today = () => new Date().toISOString().slice(0, 10);

function flattenExpenses(expenses) {
  return (expenses || []).flatMap((entry) =>
    (entry.places || []).map((place) => ({
      id: place.id,
      date: entry.date,
      name: place.name || "Витрата",
      amount: Number(place.amount || 0),
      currency: place.currency || entry.currency || "PLN",
      tags: (place.tags || []).map(normalize),
      details: place.details || "",
      notes: place.notes || "",
    }))
  );
}

function automaticEntries(goal, expenses, rates) {
  const goalTags = new Set((goal.tags || []).map(normalize));
  if (!goalTags.size) return [];

  return flattenExpenses(expenses)
    .filter((item) => item.tags.some((tag) => goalTags.has(tag)))
    .map((item) => ({
      id: `table-${item.id}`,
      source: "table",
      date: item.date,
      amount: convertAmount(item.amount, item.currency, goal.currency, rates),
      originalAmount: item.amount,
      originalCurrency: item.currency,
      note: item.name,
      tags: item.tags,
    }));
}

function manualEntries(goal, rates) {
  return (goal.entries || []).map((entry) => ({
    ...entry,
    source: "manual",
    amount: convertAmount(entry.amount, entry.currency || goal.currency, goal.currency, rates),
    originalAmount: Number(entry.amount || 0),
    originalCurrency: entry.currency || goal.currency,
  }));
}

function buildGoalView(goal, expenses, rates) {
  const history = [...manualEntries(goal, rates), ...automaticEntries(goal, expenses, rates)].sort(
    (a, b) => String(b.date).localeCompare(String(a.date))
  );

  const saved = history.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const target = Number(goal.targetAmount || 0);
  const progress = target ? Math.min(100, Math.round((saved / target) * 100)) : 0;

  return { ...goal, history, saved, progress };
}

export default function SavingsPage({ expenses, rates, baseCurrency = "PLN" }) {
  const { goals, loading, error, createGoal, updateGoal, removeGoal, addEntry, removeEntry } =
    useSavingsGoals();
  const [goalModal, setGoalModal] = useState(null);
  const [openedId, setOpenedId] = useState(null);

  const views = useMemo(
    () => goals.map((goal) => buildGoalView(goal, expenses, rates)),
    [goals, expenses, rates]
  );

  const availableTags = useMemo(() => {
    const tags = new Set();
    flattenExpenses(expenses).forEach((item) => item.tags.forEach((tag) => tags.add(tag)));
    return [...tags].sort((a, b) => a.localeCompare(b, "uk"));
  }, [expenses]);

  const opened = views.find((goal) => goal.id === openedId) || null;
  const totalSaved = views.reduce(
    (sum, goal) => sum + convertAmount(goal.saved, goal.currency, baseCurrency, rates),
    0
  );

  async function saveGoal(payload) {
    if (goalModal?.id) await updateGoal(goalModal.id, payload);
    else await createGoal(payload);
    setGoalModal(null);
  }

  async function deleteGoal(goal) {
    if (!window.confirm(`Видалити накопичення «${goal.name}»?`)) return;
    await removeGoal(goal.id);
    if (openedId === goal.id) setOpenedId(null);
  }

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <span className={styles.eyebrow}>Цілі без зайвого шуму</span>
          <h1>Накопичення</h1>
          <p>
            Створюй банки для великих покупок і додавай внески вручну або тегами з таблиці витрат.
          </p>
        </div>
        <button className={styles.primaryButton} type="button" onClick={() => setGoalModal({})}>
          ＋ Нова банка
        </button>
      </section>

      <section className={styles.summaryRow}>
        <article>
          <span>Усього накопичено</span>
          <strong>{formatCurrency(totalSaved, baseCurrency)}</strong>
        </article>
        <article>
          <span>Активних банок</span>
          <strong>{views.length}</strong>
        </article>
        <article>
          <span>Автоматичні теги</span>
          <strong>{views.reduce((sum, goal) => sum + (goal.tags?.length || 0), 0)}</strong>
        </article>
      </section>

      {error && <div className={styles.error}>⚠ {error}</div>}

      {loading ? (
        <div className={styles.empty}>Завантаження накопичень…</div>
      ) : views.length === 0 ? (
        <section className={styles.empty}>
          <span>🫙</span>
          <h2>Поки що немає жодної банки</h2>
          <p>Створи першу ціль, наприклад «На MacBook», і додавай внески у кілька кліків.</p>
          <button className={styles.primaryButton} type="button" onClick={() => setGoalModal({})}>
            Створити першу банку
          </button>
        </section>
      ) : (
        <section className={styles.grid}>
          {views.map((goal) => (
            <button
              className={styles.goalCard}
              type="button"
              key={goal.id}
              onClick={() => setOpenedId(goal.id)}
            >
              <div className={styles.goalCardTop}>
                <span className={styles.goalIcon}>{goal.icon || "🫙"}</span>
                <span className={styles.goalArrow}>↗</span>
              </div>
              <div>
                <h2>{goal.name}</h2>
                <p>{goal.description || "Особиста фінансова ціль"}</p>
              </div>
              <div className={styles.goalAmount}>{formatCurrency(goal.saved, goal.currency)}</div>
              {goal.targetAmount ? (
                <>
                  <div className={styles.progress}>
                    <span style={{ width: `${goal.progress}%` }} />
                  </div>
                  <div className={styles.progressMeta}>
                    <span>{goal.progress}%</span>
                    <span>ціль {formatCurrency(goal.targetAmount, goal.currency)}</span>
                  </div>
                </>
              ) : (
                <div className={styles.progressMeta}>
                  <span>Без фінального ліміту</span>
                </div>
              )}
              {!!goal.tags?.length && (
                <div className={styles.cardTags}>
                  {goal.tags.slice(0, 3).map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                  {goal.tags.length > 3 && <span>+{goal.tags.length - 3}</span>}
                </div>
              )}
            </button>
          ))}
        </section>
      )}

      {goalModal && (
        <GoalModal
          goal={goalModal.id ? goals.find((goal) => goal.id === goalModal.id) : null}
          baseCurrency={baseCurrency}
          availableTags={availableTags}
          onSave={saveGoal}
          onClose={() => setGoalModal(null)}
        />
      )}
      {opened && (
        <GoalDetails
          goal={opened}
          onClose={() => setOpenedId(null)}
          onEdit={() => {
            setOpenedId(null);
            setGoalModal(opened);
          }}
          onDelete={() => deleteGoal(opened)}
          onAddEntry={(payload) => addEntry(opened.id, payload)}
          onDeleteEntry={(entryId) => removeEntry(opened.id, entryId)}
        />
      )}
    </div>
  );
}

function GoalModal({ goal, baseCurrency, availableTags, onSave, onClose }) {
  const [name, setName] = useState(goal?.name || "");
  const [description, setDescription] = useState(goal?.description || "");
  const [targetAmount, setTargetAmount] = useState(
    goal?.targetAmount ? String(goal.targetAmount) : ""
  );
  const [currency, setCurrency] = useState(goal?.currency || baseCurrency || "PLN");
  const [icon, setIcon] = useState(goal?.icon || "🫙");
  const [tags, setTags] = useState(goal?.tags || []);
  const [customTag, setCustomTag] = useState("");

  function addTag(raw) {
    const value = normalize(raw);
    if (!value || tags.some((tag) => normalize(tag) === value)) return;
    setTags((current) => [...current, value]);
    setCustomTag("");
  }

  function submit(event) {
    event.preventDefault();
    if (!name.trim()) return;
    onSave({
      id: goal?.id || 0,
      name: name.trim(),
      description: description.trim(),
      targetAmount: targetAmount ? Number(targetAmount) : null,
      currency,
      icon,
      tags,
      entries: goal?.entries || [],
    });
  }

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <form className={styles.modal} onSubmit={submit}>
        <div className={styles.modalHeader}>
          <div>
            <span className={styles.eyebrow}>Накопичення</span>
            <h2>{goal ? "Редагувати банку" : "Нова банка"}</h2>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.modalBody}>
          <label>
            <span>Назва</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Наприклад, На MacBook"
              autoFocus
            />
          </label>
          <label>
            <span>Опис</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Коротка нотатка для себе"
              rows={2}
            />
          </label>
          <div className={styles.formGrid}>
            <label>
              <span>Цільова сума · необов’язково</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={targetAmount}
                onChange={(event) => setTargetAmount(event.target.value)}
                placeholder="0"
              />
            </label>
            <label>
              <span>Валюта</span>
              <select value={currency} onChange={(event) => setCurrency(event.target.value)}>
                {CURRENCIES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>
          <div>
            <span className={styles.fieldLabel}>Фігурка</span>
            <div className={styles.iconPicker}>
              {ICONS.map((item) => (
                <button
                  type="button"
                  className={icon === item ? styles.iconActive : ""}
                  key={item}
                  onClick={() => setIcon(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className={styles.fieldLabel}>Теги з таблиці витрат</span>
            <p className={styles.help}>
              Якщо запис у таблиці матиме один із цих тегів, він автоматично додасться до банки.
            </p>
            {!!availableTags.length && (
              <div className={styles.suggestionTags}>
                {availableTags.map((tag) => (
                  <button
                    type="button"
                    className={
                      tags.some((item) => normalize(item) === tag) ? styles.tagSelected : ""
                    }
                    key={tag}
                    onClick={() =>
                      tags.some((item) => normalize(item) === tag)
                        ? setTags(tags.filter((item) => normalize(item) !== tag))
                        : addTag(tag)
                    }
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
            <div className={styles.customTagRow}>
              <input
                value={customTag}
                onChange={(event) => setCustomTag(event.target.value)}
                placeholder="Власний тег, наприклад: на макбук"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag(customTag);
                  }
                }}
              />
              <button type="button" onClick={() => addTag(customTag)}>
                Додати
              </button>
            </div>
            {!!tags.length && (
              <div className={styles.selectedTags}>
                {tags.map((tag) => (
                  <span key={tag}>
                    #{tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((item) => item !== tag))}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.secondaryButton} type="button" onClick={onClose}>
            Скасувати
          </button>
          <button className={styles.primaryButton} type="submit">
            Зберегти
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
}

function GoalDetails({ goal, onClose, onEdit, onDelete, onAddEntry, onDeleteEntry }) {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(today());
  const [note, setNote] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (!Number(amount)) return;
    await onAddEntry({
      amount: Number(amount),
      currency: goal.currency,
      date: `${date}T00:00:00Z`,
      note: note.trim(),
    });
    setAmount("");
    setNote("");
  }

  return createPortal(
    <div
      className={styles.overlay}
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section className={[styles.modal, styles.detailsModal].join(" ")}>
        <div className={styles.modalHeader}>
          <div className={styles.detailsTitle}>
            <span className={styles.detailsIcon}>{goal.icon || "🫙"}</span>
            <div>
              <span className={styles.eyebrow}>Банка</span>
              <h2>{goal.name}</h2>
            </div>
          </div>
          <button type="button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className={styles.detailsHero}>
          <span>Накопичено</span>
          <strong>{formatCurrency(goal.saved, goal.currency)}</strong>
          {goal.targetAmount && (
            <small>
              із {formatCurrency(goal.targetAmount, goal.currency)} · {goal.progress}%
            </small>
          )}
        </div>
        <form className={styles.entryForm} onSubmit={submit}>
          <label>
            <span>Сума внеску ({goal.currency})</span>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0"
            />
          </label>
          <label>
            <span>Дата</span>
            <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </label>
          <label className={styles.entryNote}>
            <span>Нотатка</span>
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Наприклад, відклав із зарплати"
            />
          </label>
          <button className={styles.primaryButton} type="submit">
            ＋ Додати внесок
          </button>
        </form>
        <div className={styles.historyHeader}>
          <div>
            <span className={styles.eyebrow}>Історія</span>
            <h3>Записи банки</h3>
          </div>
          <span>{goal.history.length}</span>
        </div>
        <div className={styles.history}>
          {goal.history.length ? (
            goal.history.map((entry) => (
              <article className={styles.historyItem} key={entry.id}>
                <div className={entry.source === "table" ? styles.sourceAuto : styles.sourceManual}>
                  {entry.source === "table" ? "↗" : "＋"}
                </div>
                <div className={styles.historyCopy}>
                  <strong>
                    {entry.note ||
                      (entry.source === "table" ? "Запис із таблиці витрат" : "Ручний внесок")}
                  </strong>
                  <span>
                    {String(entry.date).slice(0, 10)} ·{" "}
                    {entry.source === "table" ? "автоматично за тегом" : "додано вручну"}
                  </span>
                </div>
                <b>{formatCurrency(entry.amount, goal.currency)}</b>
                {entry.source === "manual" && (
                  <button
                    className={styles.deleteEntry}
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                  >
                    ×
                  </button>
                )}
              </article>
            ))
          ) : (
            <div className={styles.historyEmpty}>Поки що записів немає</div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.dangerButton} type="button" onClick={onDelete}>
            Видалити банку
          </button>
          <button className={styles.secondaryButton} type="button" onClick={onEdit}>
            Редагувати
          </button>
          <button className={styles.primaryButton} type="button" onClick={onClose}>
            Готово
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}
