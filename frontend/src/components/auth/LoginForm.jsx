import { useLoginForm } from "../../hooks/useLoginForm";

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
    <form onSubmit={submit}>
      <h1>Вхід</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Пароль"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button disabled={loading}>
        {loading ? "Вхід..." : "Увійти"}
      </button>
    </form>
  );
}