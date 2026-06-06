import RegisterForm from "../components/auth/RegisterForm";
import styles from "../components/auth/Auth.module.css";

export default function RegisterPage() {
  return (
    <main className={styles.main}>
      <RegisterForm />
    </main>
  );
}
