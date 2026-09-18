import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "./authContext";
import logo from "../assets/photos/logo.png";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <motion.form
        className="login-card"
        onSubmit={onSubmit}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <img src={logo} alt="La Marine" className="login-logo" />
        <span className="section-label">Espace restaurateur</span>
        <h1 className="script">La Marine</h1>
        <p className="login-intro">
          Connectez-vous pour mettre à jour la carte et les cocktails.
        </p>

        <label>
          <span>Adresse e-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            required
          />
        </label>

        <label>
          <span>Mot de passe</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="login-error">{error}</p>}

        <button type="submit" className="login-submit" disabled={busy}>
          {busy ? "Connexion…" : "Entrer dans le poste de pilotage"}
        </button>

        <Link to="/" className="login-back">
          ← Retour au site
        </Link>
      </motion.form>
    </div>
  );
}
