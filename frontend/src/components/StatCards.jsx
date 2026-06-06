import styles from "./StatCards.module.css";

const IconWallet = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2z" />
    <path d="M16 12a1 1 0 1 0 2 0 1 1 0 0 0-2 0" />
    <path d="M6 2l2 4" />
    <path d="M18 2l-2 4" />
  </svg>
);
const IconAvg = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3v18h18" />
    <path d="M7 16l4-5 4 3 4-7" />
  </svg>
);
const IconMax = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 3l14 9-14 9V3z" />
  </svg>
);

export default function StatCards({ data, summary }) {
  const { total, avg, max } = summary;

  return (
    <div className={styles.bar}>
      <Card
        label="Загальні витрати"
        value={`${total.toFixed(0)} zł`}
        sub={`${data.length} записів`}
        icon={<IconWallet />}
        accent
      />
      <Card
        label="Середня витрата"
        value={`${avg.toFixed(1)} zł`}
        sub="на запис"
        icon={<IconAvg />}
      />
      <Card
        label="Максимальний запис"
        value={`${max.toFixed(0)} zł`}
        sub="найбільша витрата"
        icon={<IconMax />}
      />
    </div>
  );
}

function Card({ label, value, sub, icon, accent }) {
  return (
    <div className={[styles.card, accent ? "" : styles.cardDefault].join(" ")}>
      <div className={styles.icon} style={accent ? {} : { background: "var(--surface2)" }}>
        <span style={{ color: accent ? "rgba(255,255,255,0.7)" : "var(--muted)", display: "flex" }}>
          {icon}
        </span>
      </div>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  );
}
