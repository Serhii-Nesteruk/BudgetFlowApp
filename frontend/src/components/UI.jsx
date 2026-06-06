import styles from "./UI.module.css";

export function Btn({
  children,
  variant = "default",
  size = "md",
  onClick,
  type = "button",
  style,
}) {
  return (
    <button
      type={type}
      className={[styles.btn, styles[variant], styles[size]].filter(Boolean).join(" ")}
      onClick={onClick}
      style={style}
    >
      {children}
    </button>
  );
}

export function Tag({ children }) {
  return <span className={styles.tag}>{children}</span>;
}

export function Chip({ label, active, onClick }) {
  return (
    <button
      type="button"
      className={[styles.chip, active ? styles.chipActive : ""].join(" ")}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
