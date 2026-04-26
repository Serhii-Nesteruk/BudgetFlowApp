# Витрати / Expense Tracker — React App

## Запуск

```bash
npm install
npm run dev
```

## Архітектура

```
src/
├── data/
│   └── store.js          # Модель даних, localStorage, утиліти (genId, fmtDate, entryTotal)
├── hooks/
│   └── useExpenses.js    # Весь стан і бізнес-логіка (фільтри, сортування, CRUD)
├── components/
│   ├── UI.jsx / .module.css      # Примітиви: Btn, Tag, Chip
│   ├── Header.jsx / .module.css  # Навігація + кнопка "Додати"
│   ├── StatCards.jsx             # Три карточки зі статистикою
│   ├── Toolbar.jsx               # Пошук, фільтри дат, чіпи місць
│   ├── ExpenseTable.jsx          # Таблиця з expand/collapse рядками
│   ├── DetailRow.jsx             # Розгорнутий вигляд — таблиця по місцях
│   ├── EntryModal.jsx            # Форма додавання/редагування (нова модель)
│   └── StatsTab.jsx              # Графіки, баr-чарти, donut, топ-10
├── styles/
│   └── globals.css       # CSS змінні + body/reset
├── App.jsx               # Кореневий компонент, wiring
└── index.jsx             # ReactDOM.createRoot
```

## Нова модель даних (v4)

**Стара (v3):** `{ id, date, value: -50, food: ["Kaufland", "Żabka"], notes: "..." }`  
→ Сума ділилась порівну між місцями, нотатки були спільні.

**Нова (v4):** 
```js
{
  id: "...",
  date: "2026-04-26",
  places: [
    { id: "p_abc", name: "Kaufland", amount: 43, details: "яблука, сир", notes: "якісь нотатки" },
    { id: "p_xyz", name: "Żabka",    amount: 13, details: "hotdog",      notes: "" }
  ]
}
```

- **Загальна сума** = `sum(places[].amount)` (обчислюється динамічно)
- **Деталі та нотатки** — окремо для кожного місця
- Стара localStorage (exp_v3) автоматично мігрується при першому завантаженні

## Підключення до бекенду

Все збережено в `src/data/store.js`. Замініть `loadData()` і `saveData()` на fetch-виклики до свого API:

```js
export async function loadData() {
  const res = await fetch("/api/expenses");
  return res.json();
}

export async function saveData(data) {
  await fetch("/api/expenses", { method: "PUT", body: JSON.stringify(data), ... });
}
```

У `useExpenses.js` викличте `persist()` після кожної операції — вона вже обгортає `saveData()`.
