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
      <span className={styles.label}>Фільтр:</span>
      <input
        type="date"
        className={styles.inputDate}
        value={filterFrom}
        onChange={(e) => onFilterFrom(e.target.value)}
      />
      <span style={{ fontSize: 11, color: "var(--muted)" }}>—</span>
      <input
        type="date"
        className={styles.inputDate}
        value={filterTo}
        onChange={(e) => onFilterTo(e.target.value)}
      />

      {allPlaces.length > 0 && (
        <>
          <div className={styles.divider} />
          {allPlaces.map((p) => (
            <button
              key={p}
              className={[styles.chip, activePlaceFilter === p ? styles.chipActive : ""].join(" ")}
              onClick={() => onPlaceFilter(p)}
            >
              {p}
            </button>
          ))}
        </>
      )}

      <button className={styles.btnClear} onClick={onClear}>Скинути</button>
    </div>
  );
}
