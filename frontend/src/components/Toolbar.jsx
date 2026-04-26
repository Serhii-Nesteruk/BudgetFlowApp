import { Btn, Chip } from "./UI";
import styles from "./Toolbar.module.css";

export default function Toolbar({
  search, onSearch,
  filterFrom, onFilterFrom,
  filterTo, onFilterTo,
  onClear,
  allPlaces, activePlaceFilter, onPlaceFilter,
}) {
  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className={styles.input}
            placeholder="Пошук за місцем, сумою, датою, нотатками…"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <input
          type="date"
          className={styles.inputDate}
          value={filterFrom}
          onChange={(e) => onFilterFrom(e.target.value)}
        />
        <input
          type="date"
          className={styles.inputDate}
          value={filterTo}
          onChange={(e) => onFilterTo(e.target.value)}
        />
        <Btn onClick={onClear}>Скинути</Btn>
      </div>

      {allPlaces.length > 0 && (
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>Місця:</span>
          {allPlaces.map((p) => (
            <Chip
              key={p}
              label={p}
              active={activePlaceFilter === p}
              onClick={() => onPlaceFilter(p)}
            />
          ))}
        </div>
      )}
    </>
  );
}
