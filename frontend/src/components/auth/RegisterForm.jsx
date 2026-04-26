import { useRegisterForm } from "../../hooks/useRegisterForm";

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
    <form onSubmit={submit}>
      <h1>Реєстрація</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <input
        placeholder="Імʼя"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

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
        {loading ? "Реєстрація..." : "Зареєструватися"}
      </button>
    </form>
  );
}