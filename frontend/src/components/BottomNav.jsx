import { useEffect, useState } from "react";
import styles from "./BottomNav.module.css";

const IconTable   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/></svg>;
const IconChart   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></svg>;
const IconDebt    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M16 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0z"/><path d="M6 10h.01M18 14h.01"/></svg>;
const IconBudget  = () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 18.5z"/><path d="M4 6h13"/><path d="M15 12h5"/><circle cx="16.5" cy="12" r=".65" fill="currentColor" stroke="none"/></svg>;
const IconSettings= () => <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>;
const IconMore    = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>;
const IconPlus    = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
const IconChevron = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;

export default function BottomNav({ activeTab, onTabChange, onScanReceipt, onAdd }) {
  const [moreOpen, setMoreOpen] = useState(false);
  const moreActive = activeTab === "budget" || activeTab === "settings";

  useEffect(() => {
    if (!moreOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMoreOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moreOpen]);

  function selectTab(tab) {
    setMoreOpen(false);
    onTabChange(tab);
  }

  return (
    <>
      <nav className={styles.nav} aria-label="Мобільна навігація">
        <div className={styles.side}>
          <TabBtn icon={<IconTable />} label="Таблиця" active={activeTab === "table"} onClick={() => selectTab("table")} />
          <TabBtn icon={<IconChart />} label="Статистика" active={activeTab === "stats"} onClick={() => selectTab("stats")} />
        </div>

        <div className={styles.fabWrap}>
          <button className={styles.fabBtn} onClick={onAdd} aria-label="Додати запис">
            <IconPlus />
          </button>
        </div>

        <div className={styles.side}>
          <TabBtn icon={<IconDebt />} label="Борги" active={activeTab === "debts"} onClick={() => selectTab("debts")} />
          <TabBtn
            icon={<IconMore />}
            label="Ще"
            active={moreActive || moreOpen}
            onClick={() => setMoreOpen((open) => !open)}
            ariaExpanded={moreOpen}
          />
        </div>
      </nav>

      <div
        className={[styles.moreLayer, moreOpen ? styles.moreLayerOpen : ""].join(" ")}
        aria-hidden={!moreOpen}
      >
        <button className={styles.backdrop} type="button" onClick={() => setMoreOpen(false)} aria-label="Закрити меню" />
        <section className={styles.moreSheet} aria-label="Додаткові розділи">
          <div className={styles.sheetHandle} />
          <div className={styles.sheetHeader}>
            <div>
              <strong>Ще</strong>
              <span>Додаткові розділи застосунку</span>
            </div>
            <button className={styles.closeBtn} type="button" onClick={() => setMoreOpen(false)} aria-label="Закрити меню">×</button>
          </div>

          <div className={styles.moreGrid}>
            <MoreItem
              icon={<IconBudget />}
              title="Бюджети"
              description="Ліміти, категорії та планування"
              active={activeTab === "budget"}
              onClick={() => selectTab("budget")}
            />
            <MoreItem
              icon={<IconSettings />}
              title="Налаштування"
              description="Профіль, Telegram і сповіщення"
              active={activeTab === "settings"}
              onClick={() => selectTab("settings")}
            />
          </div>
        </section>
      </div>
    </>
  );
}

function TabBtn({ icon, label, active, onClick, ariaExpanded }) {
  return (
    <button
      className={[styles.tabBtn, active ? styles.tabBtnActive : ""].join(" ")}
      onClick={onClick}
      aria-expanded={ariaExpanded}
    >
      <span className={styles.tabIcon}>{icon}</span>
      <span className={styles.tabLabel}>{label}</span>
    </button>
  );
}

function MoreItem({ icon, title, description, active, onClick }) {
  return (
    <button
      type="button"
      className={[styles.moreItem, active ? styles.moreItemActive : ""].join(" ")}
      onClick={onClick}
    >
      <span className={styles.moreItemIcon}>{icon}</span>
      <span className={styles.moreItemCopy}>
        <strong>{title}</strong>
        <span>{description}</span>
      </span>
      <span className={styles.moreItemArrow}><IconChevron /></span>
    </button>
  );
}
