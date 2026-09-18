export type Category = {
  slug: string;
  label: string;
  script: string;
};

export type Dish = {
  id: number;
  category: string;
  name: string;
  description: string;
  price: string;
  image: string | null;
  featured: boolean;
  visible: boolean;
  position: number;
};

export type Cocktail = {
  id: number;
  name: string;
  recipe: string;
  price: string;
  image: string | null;
  featured: boolean;
  visible: boolean;
  position: number;
};

export type Admin = {
  email: string;
  name: string;
};
