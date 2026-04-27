import { useRegisterForm } from "../../hooks/useRegisterForm";
import styles from "./Auth.module.css";

export default function RegisterForm() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    submit,
  } = useRegisterForm();

  return (
    <form onSubmit={submit} className={styles.form}>
      <h1 className={styles.title}>Реєстрація</h1>

      {error && <p className={styles.error}>{error}</p>}

      <input
        placeholder="Імʼя"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className={styles.input}
      />

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
        {loading ? "Реєстрація..." : "Зареєструватися"}
      </button>
    </form>
  );
}