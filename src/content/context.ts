import { createContext, useContext } from "react";
import type { Category, Cocktail, Dish } from "../api/types";

export type ContentValue = {
  categories: Category[];
  dishes: Dish[];
  cocktails: Cocktail[];
  loading: boolean;
  error: string | null;
  /** Recharge la carte : appelé après chaque modification côté admin. */
  refresh: () => Promise<void>;
  dishesOf: (categorySlug: string) => Dish[];
  featuredDishes: Dish[];
  featuredCocktails: Cocktail[];
};

export const ContentContext = createContext<ContentValue | null>(null);

export function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent doit être utilisé dans un ContentProvider");
  return context;
}
