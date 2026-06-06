import styles from "./BottomNav.module.css";

const IconTable   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>;
const IconChart   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></svg>;
const IconWallet  = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 12V8H6a2 2 0 0 1 0-4h14v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/></svg>;
const IconDebt    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M6 10h.01M18 14h.01"/></svg>;
const IconSettings= () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconPlus    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;

export default function BottomNav({ activeTab, onTabChange, onScanReceipt, onAdd }) {
  return (
    <nav className={styles.nav}>
      {/* Left side: 2 tabs */}
      <div className={styles.side}>
        <TabBtn icon={<IconTable />}   label="Таблиця"    active={activeTab === "table"}    onClick={() => onTabChange("table")} />
        <TabBtn icon={<IconChart />}   label="Статистика" active={activeTab === "stats"}    onClick={() => onTabChange("stats")} />
      </div>

      {/* Center FAB */}
      <div className={styles.fabWrap}>
        <button className={styles.fabBtn} onClick={onAdd} aria-label="Додати запис">
          <IconPlus />
        </button>
      </div>

      {/* Right side: 2 tabs */}
      <div className={styles.side}>
        <TabBtn icon={<IconDebt />}   label="Борги"      active={activeTab === "debts"}    onClick={() => onTabChange("debts")} />
        <TabBtn icon={<IconSettings />}label="Налашт."    active={activeTab === "settings"} onClick={() => onTabChange("settings")} />
      </div>
    </nav>
  );
}

function TabBtn({ icon, label, active, onClick }) {
  return (
    <button className={[styles.tabBtn, active ? styles.tabBtnActive : ""].join(" ")} onClick={onClick}>
      <span className={styles.tabIcon}>{icon}</span>
      <span className={styles.tabLabel}>{label}</span>
    </button>
  );
}
