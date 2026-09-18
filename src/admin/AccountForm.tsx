import { useState } from "react";
import { changePassword } from "../api/client";

export default function AccountForm() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setDone(false);

    if (next !== confirm) {
      setError("Les deux nouveaux mots de passe ne correspondent pas.");
      return;
    }

    setBusy(true);
    try {
      await changePassword(current, next);
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Modification impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="admin-form" onSubmit={submit}>
      <header className="admin-form-head">
        <h3>Changer de mot de passe</h3>
      </header>

      <div className="admin-field">
        <span className="admin-label">Mot de passe actuel</span>
        <input
          type="password"
          value={current}
          onChange={(e) => setCurrent(e.target.value)}
          autoComplete="current-password"
          required
        />
      </div>

      <div className="admin-field">
        <span className="admin-label">Nouveau mot de passe</span>
        <input
          type="password"
          value={next}
          onChange={(e) => setNext(e.target.value)}
          autoComplete="new-password"
          required
        />
        <p className="admin-hint">8 caractères minimum.</p>
      </div>

      <div className="admin-field">
        <span className="admin-label">Confirmer le nouveau mot de passe</span>
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          autoComplete="new-password"
          required
        />
      </div>

      {error && <p className="admin-inline-error">{error}</p>}
      {done && <p className="admin-flash">Mot de passe modifié.</p>}

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn--gold" disabled={busy}>
          {busy ? "Enregistrement…" : "Mettre à jour"}
        </button>
      </div>
    </form>
  );
}
