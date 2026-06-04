import { fmtDate, entryTotal, currencySymbol, entryCurrency } from "../data/store";
import styles from "./DetailRow.module.css";

export default function DetailRow({ entry }) {
  const total  = entryTotal(entry);
  const symbol = currencySymbol(entryCurrency(entry));
  return (
    <tr className={styles.row}>
      <td colSpan={6}>
        <div className={styles.inner}>
          <h4 className={styles.heading}>
            Деталі — {fmtDate(entry.date)}&nbsp;·&nbsp;загалом: {total.toFixed(2).replace(/\.00$/, "")} {symbol}
          </h4>
          <table className={styles.dtable}>
            <thead>
              <tr>
                <th>Місце</th>
                <th>Сума</th>
                <th>Деталі / продукти</th>
                <th>Нотатки</th>
              </tr>
            </thead>
            <tbody>
              {entry.places.map((place) => {
                const placeSymbol = currencySymbol(place.currency || entryCurrency(entry));
                return (
                  <tr key={place.id}>
                    <td className={styles.place}>{place.name}</td>
                    <td className={styles.amount}>
                      −{(place.amount || 0).toFixed(2).replace(/\.00$/, "")} {placeSymbol}
                    </td>
                    <td className={styles.detail}>{place.details || "—"}</td>
                    <td className={styles.notes}>{place.notes || ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </td>
    </tr>
  );
}
