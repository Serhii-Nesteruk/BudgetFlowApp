import { fmtDate, entryTotal } from "../data/store";
import { Tag } from "./UI";
import DetailRow from "./DetailRow";
import styles from "./ExpenseTable.module.css";

const PER = 20;

export default function ExpenseTable({
  filtered, expandedIds, curPage, setCurPage,
  sortCol, sortDir, onSort,
  onToggleExpand, onEdit, onDelete,
}) {
  const total     = filtered.length;
  const pageCount = Math.ceil(total / PER);
  const start     = (curPage - 1) * PER;
  const page      = filtered.slice(start, start + PER);

  const arrow = (col) => {
    if (sortCol !== col) return <span className={styles.sa}>↕</span>;
    return <span className={[styles.sa, styles.sorted].join(" ")}>{sortDir === 1 ? "↓" : "↑"}</span>;
  };

  const pageNums = buildPages(curPage, pageCount);

  return (
    <>
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th style={{ width: 32, cursor: "default" }} />
              <th onClick={() => onSort("date")}>Дата {arrow("date")}</th>
              <th onClick={() => onSort("value")}>Сума {arrow("value")}</th>
              <th>Місця</th>
              <th>Деталі</th>
              <th style={{ cursor: "default" }}>Дії</th>
            </tr>
          </thead>
          <tbody>
            {!page.length ? (
              <tr><td colSpan={6} className={styles.empty}>Нічого не знайдено</td></tr>
            ) : (
              page.map((entry) => {
                const isExp  = expandedIds.has(entry.id);
                const ttl    = entryTotal(entry);
                const places = entry.places.map((p) => p.name);
                const detail = entry.places.filter((p) => p.details).map((p) => p.details).join(", ");

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
                    <td className={styles.amount}>−{ttl.toFixed(2).replace(/\.00$/, "")} zł</td>
                    <td>{places.map((p) => <Tag key={p}>{p}</Tag>)}</td>
                    <td><span className={styles.detailSummary}>{detail}</span></td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className={styles.rowActions}>
                        <button className={styles.btnSm} onClick={() => onEdit(entry.id)}>Редагувати</button>
                        <button className={[styles.btnSm, styles.btnSmDanger].join(" ")} onClick={() => onDelete(entry.id)}>Видалити</button>
                      </div>
                    </td>
                  </tr>,
                  isExp && <DetailRow key={entry.id + "_d"} entry={entry} />,
                ];
              })
            )}
          </tbody>
        </table>

        <div className={styles.pager}>
          <span className={styles.pagerInfo}>
            {total ? `${start + 1}–${Math.min(start + PER, total)} з ${total}` : "0 записів"}
          </span>
          <div className={styles.pagerButtons}>
            <button className={styles.pagerBtn} onClick={() => setCurPage((p) => Math.max(1, p - 1))} disabled={curPage <= 1}>← Назад</button>
            {pageNums.map((n, i) =>
              n === "…"
                ? <span key={i} style={{ padding: "4px 2px", color: "var(--muted)", fontSize: 12 }}>…</span>
                : <button
                    key={n}
                    className={[styles.pagerBtn, curPage === n ? styles.pagerBtnActive : ""].join(" ")}
                    onClick={() => setCurPage(n)}
                  >{n}</button>
            )}
            <button className={styles.pagerBtn} onClick={() => setCurPage((p) => Math.min(pageCount, p + 1))} disabled={curPage >= pageCount}>Вперед →</button>
          </div>
        </div>
      </div>
    </>
  );
}

function buildPages(cur, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (cur <= 4)   return [1, 2, 3, 4, 5, "…", total];
  if (cur >= total - 3) return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", cur - 1, cur, cur + 1, "…", total];
}
