import styles from "./Toolbar.module.css";

export default function Toolbar({
  filterFrom, onFilterFrom,
  filterTo, onFilterTo,
  onClear,
  allPlaces, activePlaceFilter, onPlaceFilter,
}) {
  if (!allPlaces.length && !filterFrom && !filterTo) return null;

  return (
    <div className={styles.toolbar}>
      {/* Date filter row */}
      <div className={styles.dateRow}>
        <span className={styles.label}>Фільтр:</span>
        <input
          type="date"
          className={styles.inputDate}
          value={filterFrom}
          onChange={(e) => onFilterFrom(e.target.value)}
        />
        <span style={{ fontSize: 11, color: "var(--muted)", flexShrink: 0 }}>—</span>
        <input
          type="date"
          className={styles.inputDate}
          value={filterTo}
          onChange={(e) => onFilterTo(e.target.value)}
        />
        <div className={styles.divider} />
        <button className={styles.btnClear} onClick={onClear}>Скинути</button>
      </div>

      {/* Place chips - horizontally scrollable on mobile */}
      {allPlaces.length > 0 && (
        <div className={styles.chipsRow}>
          {allPlaces.map((p) => (
            <button
              key={p}
              className={[styles.chip, activePlaceFilter === p ? styles.chipActive : ""].join(" ")}
              onClick={() => onPlaceFilter(p)}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
