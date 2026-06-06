import { fmtDate, entryTotal, currencySymbol, entryCurrency } from "../data/store";
import styles from "./DetailRow.module.css";

function PlaceCards({ entry }) {
  return (
    <div className={styles.placesGrid}>
      {entry.places.map((place) => {
        const placeSymbol = currencySymbol(place.currency || entryCurrency(entry));
        return (
          <div key={place.id} className={styles.placeCard}>
            <div className={styles.placeTop}>
              <span className={styles.placeName}>{place.name}</span>
              <span className={styles.placeAmount}>
                −{(place.amount || 0).toFixed(2).replace(/\.00$/, "")} {placeSymbol}
              </span>
            </div>
            {place.details && <div className={styles.placeDetail}>{place.details}</div>}
            {place.notes && <div className={styles.placeNotes}>{place.notes}</div>}
            {!!place.tags?.length && (
              <div className={styles.placeTags}>
                {place.tags.map((tag) => (
                  <span key={tag}>#{tag}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function DetailsContent({ entry, compact = false }) {
  const total = entryTotal(entry);
  const symbol = currencySymbol(entryCurrency(entry));

  return (
    <div className={compact ? styles.compactInner : styles.inner}>
      <div className={styles.header}>
        <div>
          <div className={styles.eyebrow}>Записані місця</div>
          <h4 className={styles.heading}>{fmtDate(entry.date)}</h4>
        </div>
        <div className={styles.totalBadge}>
          <span className={styles.totalLabel}>Разом</span>
          <strong>
            {total.toFixed(2).replace(/\.00$/, "")} {symbol}
          </strong>
        </div>
      </div>
      <PlaceCards entry={entry} />
    </div>
  );
}

export default function DetailRow({ entry, compact = false }) {
  if (compact) return <DetailsContent entry={entry} compact />;

  return (
    <tr className={styles.row}>
      <td colSpan={6}>
        <DetailsContent entry={entry} />
      </td>
    </tr>
  );
}
