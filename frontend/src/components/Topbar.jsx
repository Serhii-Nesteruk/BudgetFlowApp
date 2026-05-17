import styles from "./Topbar.module.css";

const IconCamera = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconSearch = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const IconPlus = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const TAB_LABELS = { table: "Таблиця витрат", stats: "Статистика", budget: "Планування бюджету" };

export default function Topbar({ activeTab, search, onSearch, onAdd, onScanReceipt }) {
  return (
    <header className={styles.topbar}>
      <div className={styles.title}>
        {TAB_LABELS[activeTab]}
      </div>

      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}><IconSearch /></span>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Пошук за місцем, сумою, нотатками…"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className={styles.actions}>
        <button className={styles.btnGhost} onClick={onScanReceipt}>
          <IconCamera />
          Сканувати
        </button>
        <button className={styles.btnPrimary} onClick={onAdd}>
          <IconPlus />
          Додати запис
        </button>
      </div>
    </header>
  );
}
