import { Btn } from "./UI";
import styles from "./Header.module.css";

const IconCamera = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" 
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

export default function Header({ activeTab, onTabChange, onAdd, onScanReceipt }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.logo}>
          Витрати <em>/ tracker</em>
        </div>
        <nav className={styles.tabs}>
          <button
            className={[styles.tab, activeTab === "table" ? styles.tabActive : ""].join(" ")}
            onClick={() => onTabChange("table")}
          >
            Таблиця
          </button>
          <button
            className={[styles.tab, activeTab === "stats" ? styles.tabActive : ""].join(" ")}
            onClick={() => onTabChange("stats")}
          >
            Статистика
          </button>
        </nav>
        <div className={styles.actions}>
          <Btn variant="ghost" onClick={onScanReceipt} title="Сканувати чек">
            <IconCamera />
            Сканувати чек
          </Btn>
          <Btn variant="primary" onClick={onAdd}>+ Додати запис</Btn>
        </div>
      </div>
    </header>
  );
}