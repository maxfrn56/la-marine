import type { Admin, Category, Cocktail, Dish } from "./types";

export class ApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    credentials: "same-origin",
    headers: init?.body instanceof FormData ? undefined : { "Content-Type": "application/json" },
    ...init,
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new ApiError(payload?.error ?? "Une erreur est survenue, réessayez.");
  }

  return response.json() as Promise<T>;
}

const body = (data: unknown) => JSON.stringify(data);

/* ---------- lecture publique ---------- */

export const getMenu = () =>
  request<{ categories: Category[]; dishes: Dish[] }>("/api/menu");

export const getCocktails = () => request<{ cocktails: Cocktail[] }>("/api/cocktails");

/* ---------- session ---------- */

export const login = (email: string, password: string) =>
  request<{ admin: Admin }>("/api/auth/login", {
    method: "POST",
    body: body({ email, password }),
  });

export const logout = () => request<{ ok: true }>("/api/auth/logout", { method: "POST" });

export const me = () => request<{ admin: Admin }>("/api/auth/me");

export const changePassword = (current: string, next: string) =>
  request<{ ok: true }>("/api/auth/password", {
    method: "POST",
    body: body({ current, next }),
  });

/* ---------- administration ---------- */

export const adminDishes = () =>
  request<{ categories: Category[]; dishes: Dish[] }>("/api/admin/dishes");

export const createDish = (data: Partial<Dish>) =>
  request<{ dish: Dish }>("/api/admin/dishes", { method: "POST", body: body(data) });

export const updateDish = (id: number, data: Partial<Dish>) =>
  request<{ dish: Dish }>(`/api/admin/dishes/${id}`, { method: "PATCH", body: body(data) });

export const deleteDish = (id: number) =>
  request<{ ok: true }>(`/api/admin/dishes/${id}`, { method: "DELETE" });

export const adminCocktails = () => request<{ cocktails: Cocktail[] }>("/api/admin/cocktails");

export const createCocktail = (data: Partial<Cocktail>) =>
  request<{ cocktail: Cocktail }>("/api/admin/cocktails", { method: "POST", body: body(data) });

export const updateCocktail = (id: number, data: Partial<Cocktail>) =>
  request<{ cocktail: Cocktail }>(`/api/admin/cocktails/${id}`, {
    method: "PATCH",
    body: body(data),
  });

export const deleteCocktail = (id: number) =>
  request<{ ok: true }>(`/api/admin/cocktails/${id}`, { method: "DELETE" });

export async function uploadPhoto(file: File) {
  const form = new FormData();
  form.append("photo", file);
  return request<{ url: string }>("/api/admin/upload", { method: "POST", body: form });
}
