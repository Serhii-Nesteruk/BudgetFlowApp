import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import LoginForm from "../components/auth/LoginForm";
import styles from "../components/auth/Auth.module.css";

export default function LoginPage() {
  const { initializing, isLoggedIn } = useAuth();

  if (initializing) {
    return null;
  }

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <main className={styles.main}>
      <LoginForm />
    </main>
  );
}
