import { fmtDate, entryTotal } from "../data/store";
import { Btn, Tag } from "./UI";
import DetailRow from "./DetailRow";
import styles from "./ExpenseTable.module.css";

const PER = 20;

export default function ExpenseTable({
  filtered, expandedIds, curPage, setCurPage,
  sortCol, sortDir, onSort,
  onToggleExpand, onEdit, onDelete,
}) {
  const total = filtered.length;
  const pageCount = Math.ceil(total / PER);
  const start = (curPage - 1) * PER;
  const page = filtered.slice(start, start + PER);

  const arrow = (col) => {
    if (sortCol !== col) return <span className={styles.sa}>↕</span>;
    return <span className={[styles.sa, styles.sorted].join(" ")}>{sortDir === 1 ? "↓" : "↑"}</span>;
  };

  return (
    <>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 28, cursor: "default" }} />
              <th onClick={() => onSort("date")}>Дата {arrow("date")}</th>
              <th onClick={() => onSort("value")}>Сума {arrow("value")}</th>
              <th>Місця</th>
              <th>Деталі</th>
              <th style={{ cursor: "default" }}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {!page.length ? (
              <tr>
                <td colSpan={6} className={styles.empty}>Нічого не знайдено</td>
              </tr>
            ) : (
              page.map((entry) => {
                const isExp = expandedIds.has(entry.id);
                const total = entryTotal(entry);
                const placeNames = entry.places.map((p) => p.name);
                // Short detail summary for the row
                const detailSummary = entry.places
                  .filter((p) => p.details)
                  .map((p) => p.details)
                  .join(", ");

                return [
                  <tr
                    key={entry.id}
                    className={[styles.dataRow, isExp ? styles.expanded : ""].join(" ")}
                    onClick={() => onToggleExpand(entry.id)}
                  >
                    <td>
                      <span className={[styles.arrow, isExp ? styles.arrowOpen : ""].join(" ")}>▶</span>
                    </td>
                    <td>{fmtDate(entry.date)}</td>
                    <td className={styles.amount}>−{total.toFixed(2).replace(/\.00$/, "")} zł</td>
                    <td>{placeNames.map((p) => <Tag key={p}>{p}</Tag>)}</td>
                    <td>
                      <span className={styles.detailSummary}>
                        {detailSummary || ""}
                      </span>
                    </td>
                    <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: "nowrap" }}>
                      <Btn size="sm" onClick={() => onEdit(entry.id)}>Редагувати</Btn>{" "}
                      <Btn size="sm" variant="danger" onClick={() => onDelete(entry.id)}>Видалити</Btn>
                    </td>
                  </tr>,
                  isExp && <DetailRow key={entry.id + "_detail"} entry={entry} />,
                ];
              })
            )}
          </tbody>
        </table>
      </div>

      <div className={styles.pager}>
        <span className={styles.pagerInfo}>
          {total
            ? `${start + 1}–${Math.min(start + PER, total)} з ${total}`
            : "0 записів"}
        </span>
        <Btn size="sm" onClick={() => setCurPage((p) => Math.max(1, p - 1))} disabled={curPage <= 1}>
          ← Назад
        </Btn>
        <Btn size="sm" onClick={() => setCurPage((p) => Math.min(pageCount, p + 1))} disabled={curPage >= pageCount}>
          Вперед →
        </Btn>
      </div>
    </>
  );
}
