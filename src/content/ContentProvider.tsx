import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCocktails, getMenu } from "../api/client";
import type { Category, Cocktail, Dish } from "../api/types";
import { ContentContext, type ContentValue } from "./context";

export function ContentProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [menu, bar] = await Promise.all([getMenu(), getCocktails()]);
      setCategories(menu.categories);
      setDishes(menu.dishes);
      setCocktails(bar.cocktails);
      setError(null);
    } catch {
      setError("La carte n’a pas pu être chargée.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<ContentValue>(() => {
    const byPosition = (a: { position: number }, b: { position: number }) =>
      a.position - b.position;

    return {
      categories,
      dishes,
      cocktails,
      loading,
      error,
      refresh,
      dishesOf: (slug) => dishes.filter((d) => d.category === slug).sort(byPosition),
      featuredDishes: dishes.filter((d) => d.featured).sort(byPosition),
      featuredCocktails: cocktails.filter((c) => c.featured).sort(byPosition),
    };
  }, [categories, dishes, cocktails, loading, error, refresh]);

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}
