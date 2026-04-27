import { useLoginForm } from "../../hooks/useLoginForm";
import styles from "./Auth.module.css";
import { Link } from "react-router-dom";

export default function LoginForm() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    submit,
  } = useLoginForm();

  return (
    <form onSubmit={submit} className={styles.form}>
      <h1 className={styles.title}>Вхід</h1>

      {error && <p className={styles.error}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />

      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />

      <button disabled={loading} className={styles.button}>
        {loading ? "Вхід..." : "Увійти"}
      </button>

      <div className={styles.switch}>
        Немає акаунту? <Link to="/register">Зареєструватися</Link>
      </div>
    </form>
  );
}