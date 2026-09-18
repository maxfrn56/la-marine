import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import * as api from "../api/client";
import type { Category, Cocktail, Dish } from "../api/types";
import { useAuth } from "./authContext";
import { useContent } from "../content/context";
import ItemForm, { type CocktailDraft, type DishDraft } from "./ItemForm";
import AccountForm from "./AccountForm";
import logo from "../assets/photos/logo.png";
import "./Admin.css";

type Tab = "carte" | "cocktails" | "compte";

const TABS: { id: Tab; label: string }[] = [
  { id: "carte", label: "La carte" },
  { id: "cocktails", label: "Les cocktails" },
  { id: "compte", label: "Mon compte" },
];

/* Ligne d'un plat ou d'un cocktail dans les listes du dashboard. */
function Row({
  title,
  detail,
  price,
  image,
  featured,
  visible,
  onEdit,
  onDelete,
  onToggleVisible,
}: {
  title: string;
  detail: string;
  price: string;
  image: string | null;
  featured: boolean;
  visible: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisible: () => void;
}) {
  return (
    <motion.li
      className={`admin-row ${visible ? "" : "admin-row--hidden"}`}
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="admin-row-thumb">
        {image ? <img src={image} alt="" /> : <span aria-hidden>✦</span>}
      </div>

      <div className="admin-row-main">
        <h4>
          {title}
          {featured && <span className="admin-tag admin-tag--gold">Vitrine</span>}
          {!visible && <span className="admin-tag">Masqué</span>}
        </h4>
        {detail && <p>{detail}</p>}
      </div>

      <span className="admin-row-price">{price}</span>

      <div className="admin-row-actions">
        <button type="button" className="admin-btn admin-btn--quiet" onClick={onToggleVisible}>
          {visible ? "Masquer" : "Afficher"}
        </button>
        <button type="button" className="admin-btn admin-btn--ghost" onClick={onEdit}>
          Modifier
        </button>
        <button type="button" className="admin-btn admin-btn--danger" onClick={onDelete}>
          Supprimer
        </button>
      </div>
    </motion.li>
  );
}

export default function AdminDashboard() {
  const { admin, signOut } = useAuth();
  const { refresh } = useContent();

  const [tab, setTab] = useState<Tab>("carte");
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  const [dishForm, setDishForm] = useState<{ open: boolean; item: Dish | null }>({
    open: false,
    item: null,
  });
  const [cocktailForm, setCocktailForm] = useState<{ open: boolean; item: Cocktail | null }>({
    open: false,
    item: null,
  });

  const load = useCallback(async () => {
    try {
      const [menu, bar] = await Promise.all([api.adminDishes(), api.adminCocktails()]);
      setCategories(menu.categories);
      setDishes(menu.dishes);
      setCocktails(bar.cocktails);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  // Toute modification est répercutée sur le site public (accueil inclus).
  const announce = useCallback(
    async (message: string) => {
      await Promise.all([load(), refresh()]);
      setFlash(message);
    },
    [load, refresh]
  );

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 4000);
    return () => clearTimeout(timer);
  }, [flash]);

  /* ---------- plats ---------- */

  const saveDish = async (draft: DishDraft) => {
    if (dishForm.item) {
      await api.updateDish(dishForm.item.id, draft);
      await announce(`« ${draft.name} » a été mis à jour.`);
    } else {
      await api.createDish(draft);
      await announce(`« ${draft.name} » a été ajouté à la carte.`);
    }
    setDishForm({ open: false, item: null });
  };

  const removeDish = async (dish: Dish) => {
    if (!window.confirm(`Supprimer « ${dish.name} » de la carte ?`)) return;
    try {
      await api.deleteDish(dish.id);
      await announce(`« ${dish.name} » a été supprimé.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  const toggleDish = async (dish: Dish) => {
    try {
      await api.updateDish(dish.id, { visible: !dish.visible });
      await announce(
        dish.visible
          ? `« ${dish.name} » est masqué sur le site.`
          : `« ${dish.name} » est de nouveau visible.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Modification impossible.");
    }
  };

  /* ---------- cocktails ---------- */

  const saveCocktail = async (draft: CocktailDraft) => {
    if (cocktailForm.item) {
      await api.updateCocktail(cocktailForm.item.id, draft);
      await announce(`« ${draft.name} » a été mis à jour.`);
    } else {
      await api.createCocktail(draft);
      await announce(`« ${draft.name} » a été ajouté à la carte du bar.`);
    }
    setCocktailForm({ open: false, item: null });
  };

  const removeCocktail = async (cocktail: Cocktail) => {
    if (!window.confirm(`Supprimer « ${cocktail.name} » de la carte du bar ?`)) return;
    try {
      await api.deleteCocktail(cocktail.id);
      await announce(`« ${cocktail.name} » a été supprimé.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Suppression impossible.");
    }
  };

  const toggleCocktail = async (cocktail: Cocktail) => {
    try {
      await api.updateCocktail(cocktail.id, { visible: !cocktail.visible });
      await announce(
        cocktail.visible
          ? `« ${cocktail.name} » est masqué sur le site.`
          : `« ${cocktail.name} » est de nouveau visible.`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Modification impossible.");
    }
  };

  const stats = [
    { value: dishes.length, label: "Plats à la carte" },
    { value: dishes.filter((d) => d.featured).length, label: "Plats en vitrine" },
    { value: cocktails.length, label: "Cocktails" },
    { value: dishes.filter((d) => !d.visible).length, label: "Plats masqués" },
  ];

  return (
    <div className="admin">
      <header className="admin-head">
        <div className="admin-brand">
          <img src={logo} alt="La Marine" />
          <div>
            <span className="script">La Marine</span>
            <small>Poste de pilotage</small>
          </div>
        </div>

        <div className="admin-head-right">
          <span className="admin-who">
            Bonjour <strong>{admin?.name}</strong>
          </span>
          <Link to="/" className="admin-btn admin-btn--ghost">
            Voir le site
          </Link>
          <button type="button" className="admin-btn admin-btn--quiet" onClick={() => void signOut()}>
            Déconnexion
          </button>
        </div>
      </header>

      <div className="admin-body container">
        <ul className="admin-stats">
          {stats.map((stat) => (
            <li key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </li>
          ))}
        </ul>

        <nav className="admin-tabs">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={tab === item.id ? "is-active" : ""}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {error && <p className="admin-inline-error">{error}</p>}
        {loading && <p className="admin-loading">Chargement…</p>}

        {/* ---------- onglet carte ---------- */}
        {tab === "carte" && !loading && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>La carte du restaurant</h2>
                <p>
                  Les plats cochés « vitrine » alimentent la sélection de la page
                  d’accueil. Tout est visible immédiatement sur le site.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn--gold"
                onClick={() => setDishForm({ open: true, item: null })}
              >
                + Ajouter un plat
              </button>
            </div>

            {dishForm.open && (
              <ItemForm
                key={dishForm.item?.id ?? "nouveau-plat"}
                kind="dish"
                categories={categories}
                initial={dishForm.item}
                onCancel={() => setDishForm({ open: false, item: null })}
                onSave={saveDish}
              />
            )}

            {categories.map((category) => {
              const list = dishes.filter((d) => d.category === category.slug);
              return (
                <div className="admin-group" key={category.slug}>
                  <header className="admin-group-head">
                    <h3>{category.label}</h3>
                    <span className="script">{category.script}</span>
                    <em>{list.length} plat{list.length > 1 ? "s" : ""}</em>
                  </header>

                  {list.length === 0 ? (
                    <p className="admin-empty">Aucun plat dans cette rubrique.</p>
                  ) : (
                    <ul className="admin-rows">
                      <AnimatePresence initial={false}>
                        {list.map((dish) => (
                          <Row
                            key={dish.id}
                            title={dish.name}
                            detail={dish.description}
                            price={dish.price}
                            image={dish.image}
                            featured={dish.featured}
                            visible={dish.visible}
                            onEdit={() => setDishForm({ open: true, item: dish })}
                            onDelete={() => void removeDish(dish)}
                            onToggleVisible={() => void toggleDish(dish)}
                          />
                        ))}
                      </AnimatePresence>
                    </ul>
                  )}
                </div>
              );
            })}
          </section>
        )}

        {/* ---------- onglet cocktails ---------- */}
        {tab === "cocktails" && !loading && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>La carte du bar</h2>
                <p>
                  Les cocktails en vitrine s’affichent dans la section bar de la
                  page d’accueil, et le premier illustre la page Cocktails.
                </p>
              </div>
              <button
                type="button"
                className="admin-btn admin-btn--gold"
                onClick={() => setCocktailForm({ open: true, item: null })}
              >
                + Ajouter un cocktail
              </button>
            </div>

            {cocktailForm.open && (
              <ItemForm
                key={cocktailForm.item?.id ?? "nouveau-cocktail"}
                kind="cocktail"
                initial={cocktailForm.item}
                onCancel={() => setCocktailForm({ open: false, item: null })}
                onSave={saveCocktail}
              />
            )}

            {cocktails.length === 0 ? (
              <p className="admin-empty">Aucun cocktail pour le moment.</p>
            ) : (
              <ul className="admin-rows">
                <AnimatePresence initial={false}>
                  {cocktails.map((cocktail) => (
                    <Row
                      key={cocktail.id}
                      title={cocktail.name}
                      detail={cocktail.recipe}
                      price={cocktail.price}
                      image={cocktail.image}
                      featured={cocktail.featured}
                      visible={cocktail.visible}
                      onEdit={() => setCocktailForm({ open: true, item: cocktail })}
                      onDelete={() => void removeCocktail(cocktail)}
                      onToggleVisible={() => void toggleCocktail(cocktail)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
        )}

        {/* ---------- onglet compte ---------- */}
        {tab === "compte" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Mon compte</h2>
                <p>Adresse de connexion : {admin?.email}</p>
              </div>
            </div>
            <AccountForm />
          </section>
        )}
      </div>

      {/* La confirmation suit le restaurateur, où qu'il soit dans la page. */}
      <AnimatePresence>
        {flash && (
          <motion.p
            className="admin-toast"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            role="status"
          >
            {flash}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
