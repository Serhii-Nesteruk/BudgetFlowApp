import { entryTotal } from "../data/store";
import styles from "./StatCards.module.css";

export default function StatCards({ data }) {
  const total = data.reduce((s, e) => s + entryTotal(e), 0);
  const avg = data.length ? total / data.length : 0;
  const max = data.length ? Math.max(...data.map((e) => entryTotal(e))) : 0;

  return (
    <div className={styles.bar}>
      <Card label="Загальні витрати" value={`${total.toFixed(0)} zł`} sub={`${data.length} записів`} />
      <Card label="Середня витрата" value={`${avg.toFixed(1)} zł`} sub="на запис" />
      <Card label="Максимальний запис" value={`${max.toFixed(0)} zł`} sub="найбільша витрата" />
    </div>
  );
}

function Card({ label, value, sub }) {
  return (
    <div className={styles.card}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  );
}
