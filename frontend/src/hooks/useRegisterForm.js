import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerRequest } from "../api/authApi";
import { detectInterfaceLanguage } from "../i18n/language";

export function useRegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      await registerRequest(name, email, password, detectInterfaceLanguage());

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    submit,
  };
}
