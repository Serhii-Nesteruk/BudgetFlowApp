import { fmtDate, entryTotal } from "../data/store";
import { Tag } from "./UI";
import DetailRow from "./DetailRow";
import styles from "./ExpenseTable.module.css";

const PER = 20;

const IconEdit   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const IconTrash  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const IconChevron = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;

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
      {/* ── Desktop / tablet: classic table ── */}
      <div className={[styles.tableCard, styles.desktopOnly].join(" ")}>
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
                    <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: "nowrap" }}>
                      <div className={styles.rowActions}>
                        <button className={styles.btnSm} onClick={() => onEdit(entry.id)} title="Редагувати">
                          <IconEdit /><span className={styles.btnLabel}>Редагувати</span>
                        </button>
                        <button className={[styles.btnSm, styles.btnSmDanger].join(" ")} onClick={() => onDelete(entry.id)} title="Видалити">
                          <IconTrash /><span className={styles.btnLabel}>Видалити</span>
                        </button>
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

      {/* ── Mobile: card list ── */}
      <div className={[styles.mobileList, styles.mobileOnly].join(" ")}>
        {!page.length ? (
          <div className={styles.mobileEmpty}>Нічого не знайдено</div>
        ) : (
          page.map((entry) => {
            const isExp  = expandedIds.has(entry.id);
            const ttl    = entryTotal(entry);
            const places = entry.places.map((p) => p.name);
            const detail = entry.places.filter((p) => p.details).map((p) => p.details).join(", ");

            return (
              <div key={entry.id} className={[styles.mobileCard, isExp ? styles.mobileCardExpanded : ""].join(" ")}>
                <div
                  className={styles.mobileCardMain}
                  onClick={() => onToggleExpand(entry.id)}
                >
                  <div className={styles.mobileCardLeft}>
                    <div className={styles.mobileDate}>{fmtDate(entry.date)}</div>
                    <div className={styles.mobilePlaces}>
                      {places.map((p) => <Tag key={p}>{p}</Tag>)}
                    </div>
                    {detail && <div className={styles.mobileDetail}>{detail}</div>}
                  </div>
                  <div className={styles.mobileCardRight}>
                    <div className={styles.mobileAmount}>−{ttl.toFixed(2).replace(/\.00$/, "")} zł</div>
                    <div className={[styles.mobileChevron, isExp ? styles.mobileChevronOpen : ""].join(" ")}>
                      <IconChevron />
                    </div>
                  </div>
                </div>

                {isExp && (
                  <div className={styles.mobileExpanded}>
                    <DetailRow entry={entry} />
                    <div className={styles.mobileActions}>
                      <button className={styles.mobileBtn} onClick={() => onEdit(entry.id)}>
                        <IconEdit /> Редагувати
                      </button>
                      <button className={[styles.mobileBtn, styles.mobileBtnDanger].join(" ")} onClick={() => onDelete(entry.id)}>
                        <IconTrash /> Видалити
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {pageCount > 1 && (
          <div className={styles.mobilePager}>
            <button
              className={styles.mobilePagerBtn}
              onClick={() => setCurPage((p) => Math.max(1, p - 1))}
              disabled={curPage <= 1}
            >← Назад</button>
            <span className={styles.mobilePagerInfo}>{curPage} / {pageCount}</span>
            <button
              className={styles.mobilePagerBtn}
              onClick={() => setCurPage((p) => Math.min(pageCount, p + 1))}
              disabled={curPage >= pageCount}
            >Вперед →</button>
          </div>
        )}
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
