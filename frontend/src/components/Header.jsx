import { Btn } from "./UI";
import styles from "./Header.module.css";

export default function Header({ activeTab, onTabChange, onAdd }) {
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
        <Btn variant="primary" onClick={onAdd}>+ Додати запис</Btn>
      </div>
    </header>
  );
}
