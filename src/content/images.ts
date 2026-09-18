import carpaccio from "../assets/photos/carpaccio.png";
import entreeVerte from "../assets/photos/entree-verte.png";
import ginTonic from "../assets/photos/gin-tonic.png";
import cocktailFraise from "../assets/photos/cocktail-fraise.png";
import logo from "../assets/photos/logo.png";
import type { Cocktail, Dish } from "../api/types";

/*
 * Les plats sans photo retombent sur un visuel de la maison, choisi selon la
 * rubrique, pour que la carte reste présentable même sans média envoyé.
 */
const DISH_FALLBACKS: Record<string, string> = {
  entrees: entreeVerte,
  ecailler: logo,
  peche: carpaccio,
  douceurs: logo,
};

export function dishImage(dish: Pick<Dish, "image" | "category">) {
  return dish.image ?? DISH_FALLBACKS[dish.category] ?? logo;
}

export function cocktailImage(cocktail: Pick<Cocktail, "image" | "id">) {
  if (cocktail.image) return cocktail.image;
  return cocktail.id % 2 === 0 ? ginTonic : cocktailFraise;
}
