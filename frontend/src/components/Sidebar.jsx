import { entryTotal } from "../data/store";
import styles from "./Sidebar.module.css";

const IconTable    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>;
const IconChart    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></svg>;
const IconCamera   = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
const IconStore    = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l1-6h16l1 6"/><path d="M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/><path d="M5 21V9m14 12V9"/><rect x="9" y="14" width="6" height="7" rx="1"/></svg>;

export default function Sidebar({ activeTab, onTabChange, allPlaces, activePlaceFilter, onPlaceFilter, onScanReceipt, data }) {
  const placeTotals = {};
  data.forEach(e => e.places.forEach(p => {
    placeTotals[p.name] = (placeTotals[p.name] || 0) + 1;
  }));

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <span className={styles.logoSub}>Особисті фінанси</span>
        <span className={styles.logoTitle}>Витрати</span>
      </div>

      <nav className={styles.nav}>
        <div className={styles.section}>
          <span className={styles.sectionLabel}>Основне</span>
          <NavItem icon={<IconTable />} label="Таблиця витрат" active={activeTab === "table"} onClick={() => onTabChange("table")} />
          <NavItem icon={<IconChart />} label="Статистика" active={activeTab === "stats"} onClick={() => onTabChange("stats")} />
        </div>

        {allPlaces.length > 0 && (
          <div className={styles.section}>
            <span className={styles.sectionLabel}>Місця</span>
            {allPlaces.map((place) => (
              <NavItem
                key={place}
                icon={<IconStore />}
                label={place}
                badge={placeTotals[place]}
                active={activePlaceFilter === place}
                onClick={() => onPlaceFilter(place)}
              />
            ))}
          </div>
        )}
      </nav>

      <div className={styles.bottom}>
        <button className={styles.scanBtn} onClick={onScanReceipt}>
          <IconCamera />
          Сканувати чек
        </button>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, badge, active, onClick }) {
  return (
    <button className={[styles.navItem, active ? styles.navItemActive : ""].join(" ")} onClick={onClick}>
      <span className={styles.navIcon}>{icon}</span>
      <span className={styles.navLabel}>{label}</span>
      {badge !== undefined && <span className={styles.navBadge}>{badge}</span>}
    </button>
  );
}
