import { useRef, useState } from "react";
import { uploadPhoto } from "../api/client";
import { prepareImage } from "./prepareImage";

type Props = {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
};

export default function PhotoField({ value, onChange, label = "Photo" }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pick = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const { url } = await uploadPhoto(await prepareImage(file));
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Envoi impossible.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div className="admin-field">
      <span className="admin-label">{label}</span>

      <div className="admin-photo">
        <div className="admin-photo-preview">
          {value ? (
            <img src={value} alt="" />
          ) : (
            <span className="admin-photo-empty">Aucune photo</span>
          )}
        </div>

        <div className="admin-photo-actions">
          <input
            ref={input}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => void pick(e.target.files?.[0])}
          />
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => input.current?.click()}
            disabled={busy}
          >
            {busy ? "Traitement…" : value ? "Remplacer" : "Choisir une photo"}
          </button>
          {value && (
            <button
              type="button"
              className="admin-btn admin-btn--quiet"
              onClick={() => onChange(null)}
            >
              Retirer
            </button>
          )}
          <p className="admin-hint">
            JPG, PNG ou WebP. Les photos sont allégées automatiquement : prenez
            la meilleure, sans vous soucier de son poids.
          </p>
          {error && <p className="admin-inline-error">{error}</p>}
        </div>
      </div>
    </div>
  );
}
