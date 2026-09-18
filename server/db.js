import Database from "better-sqlite3";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = join(here, "data");
export const UPLOADS_DIR = join(DATA_DIR, "uploads");

mkdirSync(UPLOADS_DIR, { recursive: true });

const db = new Database(join(DATA_DIR, "la-marine.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS dishes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    price TEXT NOT NULL DEFAULT '',
    image TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    position INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS cocktails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    recipe TEXT NOT NULL DEFAULT '',
    price TEXT NOT NULL DEFAULT '',
    image TEXT,
    featured INTEGER NOT NULL DEFAULT 0,
    visible INTEGER NOT NULL DEFAULT 1,
    position INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

/* ---------- mots de passe (scrypt, sans dépendance native) ---------- */

export function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${key}`;
}

export function verifyPassword(password, stored) {
  const [salt, key] = String(stored).split(":");
  if (!salt || !key) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}

/* ---------- catégories de la carte ---------- */

export const CATEGORIES = [
  { slug: "entrees", label: "Pour commencer", script: "Mise en bouche" },
  { slug: "ecailler", label: "L’écailler", script: "Vue sur le port" },
  { slug: "peche", label: "Le retour de pêche", script: "Selon la criée" },
  { slug: "douceurs", label: "Douceurs", script: "Pour finir en beauté" },
];

/* ---------- amorçage ---------- */

const SEED_DISHES = [
  ["entrees", "Huîtres creuses de la baie", "N°3 de Quiberon, vinaigre à l’échalote — les 6 / les 12", "14 / 24 €", 1],
  ["entrees", "Crème de petits pois", "Burrata crémeuse, huile fumée & tuile croustillante", "13 €", 1],
  ["entrees", "Foie gras de la maison", "Chutney d’oignons de Roscoff, brioche toastée", "15 €", 0],
  ["entrees", "Rillettes de sardine fumée", "Citron confit, pain de seigle grillé", "11 €", 0],
  ["entrees", "Soupe de poissons de roche", "Rouille, croûtons & emmental râpé", "12 €", 0],
  ["ecailler", "Le plateau du marin", "Huîtres, bulots, crevettes bouquet, bigorneaux & tourteau", "36 €", 0],
  ["ecailler", "La planche maxi", "Le grand format à partager, comme les habitués", "48 €", 1],
  ["ecailler", "Bulots de casier", "Mayonnaise maison au citron", "12 €", 0],
  ["ecailler", "Crevettes bouquet", "Beurre demi-sel de la presqu’île", "13 €", 0],
  ["peche", "Sole meunière entière", "Beurre aux algues, pommes grenailles rôties", "34 €", 1],
  ["peche", "Carpaccio de lieu jaune", "Agrumes, radis, pickles d’oignon rouge & sésame noir", "16 €", 1],
  ["peche", "Pavé de thon de ligne", "Mi-cuit, écrasé de pommes de terre au chorizo", "26 €", 0],
  ["peche", "Moules de bouchot", "Marinières ou à la crème, frites maison", "16 €", 0],
  ["peche", "La pêche du jour", "À l’ardoise, selon l’arrivage du matin", "selon criée", 0],
  ["douceurs", "Far breton de grand-mère", "Aux pruneaux, comme il se doit", "8 €", 0],
  ["douceurs", "Kouign-amann tiède", "Caramel au beurre salé, glace vanille", "9 €", 0],
  ["douceurs", "Riz au lait de la maison", "Caramel laitier & éclats de sablé breton", "8 €", 0],
  ["douceurs", "Café gourmand", "Trois douceurs du moment", "10 €", 0],
];

const SEED_COCKTAILS = [
  ["Le Vieux Marin", "Rhum ambré, citron vert, gingembre frais, sucre de canne", "11 €", 1],
  ["La Quiberonnaise", "Gin, fraises écrasées, basilic, mousse citronnée", "12 €", 1],
  ["Port Maria Spritz", "Apéritif d’algues bretonnes, prosecco, zeste d’orange", "10 €", 1],
  ["L’Abordage", "Whisky tourbé, caramel au beurre salé, bitter cacao", "12 €", 0],
  ["La Sirène", "Vodka, curaçao, tonic hysope, écume de mer", "11 €", 0],
];

function seed() {
  const admins = db.prepare("SELECT COUNT(*) AS n FROM admins").get().n;
  if (admins === 0) {
    db.prepare(
      "INSERT INTO admins (email, password_hash, name) VALUES (?, ?, ?)"
    ).run(
      "lamarine1712@gmail.com",
      hashPassword("LaMarine1915"),
      "David Le Ruyet"
    );
  }

  const dishes = db.prepare("SELECT COUNT(*) AS n FROM dishes").get().n;
  if (dishes === 0) {
    const insert = db.prepare(
      `INSERT INTO dishes (category, name, description, price, featured, position)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    const perCategory = {};
    const run = db.transaction(() => {
      for (const [category, name, description, price, featured] of SEED_DISHES) {
        perCategory[category] = (perCategory[category] ?? 0) + 1;
        insert.run(category, name, description, price, featured, perCategory[category]);
      }
    });
    run();
  }

  const cocktails = db.prepare("SELECT COUNT(*) AS n FROM cocktails").get().n;
  if (cocktails === 0) {
    const insert = db.prepare(
      `INSERT INTO cocktails (name, recipe, price, featured, position)
       VALUES (?, ?, ?, ?, ?)`
    );
    const run = db.transaction(() => {
      SEED_COCKTAILS.forEach(([name, recipe, price, featured], i) => {
        insert.run(name, recipe, price, featured, i + 1);
      });
    });
    run();
  }
}

seed();

export default db;
