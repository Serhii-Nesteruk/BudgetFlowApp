import LoginForm from "../components/auth/LoginForm";
import styles from "../components/auth/Auth.module.css";

export default function LoginPage() {
  return (
    <main className={styles.main}>
      <LoginForm />
    </main>
  );
}
