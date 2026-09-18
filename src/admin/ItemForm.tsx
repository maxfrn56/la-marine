import { useState } from "react";
import { motion } from "framer-motion";
import PhotoField from "./PhotoField";
import type { Category, Cocktail, Dish } from "../api/types";

export type DishDraft = Pick<
  Dish,
  "category" | "name" | "description" | "price" | "image" | "featured" | "visible"
>;

export type CocktailDraft = Pick<
  Cocktail,
  "name" | "recipe" | "price" | "image" | "featured" | "visible"
>;

type Props =
  | {
      kind: "dish";
      categories: Category[];
      initial: Dish | null;
      onCancel: () => void;
      onSave: (draft: DishDraft) => Promise<void>;
    }
  | {
      kind: "cocktail";
      initial: Cocktail | null;
      onCancel: () => void;
      onSave: (draft: CocktailDraft) => Promise<void>;
    };

function Toggle({
  checked,
  onChange,
  title,
  hint,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      className={`admin-toggle ${checked ? "admin-toggle--on" : ""}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className="admin-toggle-track">
        <span className="admin-toggle-knob" />
      </span>
      <span className="admin-toggle-text">
        <strong>{title}</strong>
        <em>{hint}</em>
      </span>
    </button>
  );
}

/*
 * Le parent monte ce formulaire avec une `key` par élément : l'état part donc
 * directement des props, sans effet de synchronisation.
 */
export default function ItemForm(props: Props) {
  const isDish = props.kind === "dish";
  const item = props.initial;
  const editing = Boolean(item);
  const defaultCategory = props.kind === "dish" ? props.categories[0]?.slug ?? "" : "";

  const [name, setName] = useState(item?.name ?? "");
  const [text, setText] = useState(
    item ? ("description" in item ? item.description : item.recipe) : ""
  );
  const [price, setPrice] = useState(item?.price ?? "");
  const [category, setCategory] = useState(
    item && "category" in item ? item.category : defaultCategory
  );
  const [image, setImage] = useState<string | null>(item?.image ?? null);
  const [featured, setFeatured] = useState(item?.featured ?? false);
  const [visible, setVisible] = useState(item?.visible ?? true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) {
      setError(isDish ? "Le nom du plat est obligatoire." : "Le nom du cocktail est obligatoire.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      if (props.kind === "dish") {
        await props.onSave({
          category,
          name: name.trim(),
          description: text.trim(),
          price: price.trim(),
          image,
          featured,
          visible,
        });
      } else {
        await props.onSave({
          name: name.trim(),
          recipe: text.trim(),
          price: price.trim(),
          image,
          featured,
          visible,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.form
      className="admin-form"
      onSubmit={submit}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <header className="admin-form-head">
        <h3>
          {editing ? "Modifier" : "Ajouter"} {isDish ? "un plat" : "un cocktail"}
        </h3>
        <button type="button" className="admin-btn admin-btn--quiet" onClick={props.onCancel}>
          Fermer
        </button>
      </header>

      {props.kind === "dish" && (
        <div className="admin-field">
          <span className="admin-label">Rubrique de la carte</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {props.categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="admin-field">
        <span className="admin-label">{isDish ? "Nom du plat" : "Nom du cocktail"}</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={isDish ? "Sole meunière entière" : "Le Vieux Marin"}
          required
        />
      </div>

      <div className="admin-field">
        <span className="admin-label">{isDish ? "Description" : "Composition"}</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder={
            isDish
              ? "Beurre aux algues, pommes grenailles rôties"
              : "Rhum ambré, citron vert, gingembre frais"
          }
        />
      </div>

      <div className="admin-field">
        <span className="admin-label">Prix</span>
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="18 €"
        />
        <p className="admin-hint">
          Texte libre : « 18 € », « 14 / 24 € » ou « selon criée ».
        </p>
      </div>

      <PhotoField value={image} onChange={setImage} />

      <div className="admin-toggles">
        <Toggle
          checked={featured}
          onChange={setFeatured}
          title="En vitrine sur l’accueil"
          hint={
            isDish
              ? "Apparaît dans la sélection de la page d’accueil."
              : "Apparaît dans la section bar de la page d’accueil."
          }
        />
        <Toggle
          checked={visible}
          onChange={setVisible}
          title="Visible sur le site"
          hint="Décochez pour retirer temporairement sans supprimer."
        />
      </div>

      {error && <p className="admin-inline-error">{error}</p>}

      <div className="admin-form-actions">
        <button type="submit" className="admin-btn admin-btn--gold" disabled={busy}>
          {busy ? "Enregistrement…" : editing ? "Enregistrer les modifications" : "Ajouter à la carte"}
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={props.onCancel}>
          Annuler
        </button>
      </div>
    </motion.form>
  );
}
