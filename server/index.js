import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import multer from "multer";
import { randomBytes } from "node:crypto";
import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import db, {
  CATEGORIES,
  DATA_DIR,
  UPLOADS_DIR,
  hashPassword,
  verifyPassword,
} from "./db.js";

const here = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 4000);
const COOKIE = "lm_session";

/* Le secret est persisté pour que les sessions survivent à un redémarrage. */
function loadSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const file = join(DATA_DIR, ".jwt-secret");
  if (!existsSync(file)) writeFileSync(file, randomBytes(48).toString("hex"), { mode: 0o600 });
  return readFileSync(file, "utf8").trim();
}
const SECRET = loadSecret();

const app = express();
// Derrière le reverse proxy de l'hébergeur, pour reconnaître les requêtes HTTPS.
app.set("trust proxy", 1);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

/* ---------- upload des photos de plats ---------- */

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
      const ext = (extname(file.originalname) || ".jpg").toLowerCase();
      cb(null, `${Date.now()}-${randomBytes(4).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: 6 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /^image\/(jpe?g|png|webp|avif|gif)$/.test(file.mimetype);
    cb(ok ? null : new Error("Format d’image non supporté"), ok);
  },
});

app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "7d" }));

/* ---------- authentification ---------- */

function sign(admin) {
  return jwt.sign({ sub: admin.id, email: admin.email, name: admin.name }, SECRET, {
    expiresIn: "7d",
  });
}

function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE];
  if (!token) return res.status(401).json({ error: "Session expirée, reconnectez-vous." });
  try {
    req.admin = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Session expirée, reconnectez-vous." });
  }
}

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body ?? {};
  const admin = db
    .prepare("SELECT * FROM admins WHERE lower(email) = lower(?)")
    .get(String(email ?? "").trim());

  if (!admin || !verifyPassword(String(password ?? ""), admin.password_hash)) {
    return res.status(401).json({ error: "Identifiants incorrects." });
  }

  res.cookie(COOKIE, sign(admin), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 3600 * 1000,
  });
  res.json({ admin: { email: admin.email, name: admin.name } });
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE);
  res.json({ ok: true });
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ admin: { email: req.admin.email, name: req.admin.name } });
});

app.post("/api/auth/password", requireAuth, (req, res) => {
  const { current, next } = req.body ?? {};
  const admin = db.prepare("SELECT * FROM admins WHERE id = ?").get(req.admin.sub);
  if (!admin || !verifyPassword(String(current ?? ""), admin.password_hash)) {
    return res.status(400).json({ error: "Mot de passe actuel incorrect." });
  }
  if (String(next ?? "").length < 8) {
    return res.status(400).json({ error: "Le nouveau mot de passe doit faire 8 caractères minimum." });
  }
  db.prepare("UPDATE admins SET password_hash = ? WHERE id = ?").run(
    hashPassword(String(next)),
    admin.id
  );
  res.json({ ok: true });
});

/* ---------- lecture publique ---------- */

const mapDish = (row) => ({
  id: row.id,
  category: row.category,
  name: row.name,
  description: row.description,
  price: row.price,
  image: row.image,
  featured: Boolean(row.featured),
  visible: Boolean(row.visible),
  position: row.position,
});

const mapCocktail = (row) => ({
  id: row.id,
  name: row.name,
  recipe: row.recipe,
  price: row.price,
  image: row.image,
  featured: Boolean(row.featured),
  visible: Boolean(row.visible),
  position: row.position,
});

app.get("/api/menu", (_req, res) => {
  const dishes = db
    .prepare("SELECT * FROM dishes WHERE visible = 1 ORDER BY category, position, id")
    .all()
    .map(mapDish);
  res.json({ categories: CATEGORIES, dishes });
});

app.get("/api/cocktails", (_req, res) => {
  const cocktails = db
    .prepare("SELECT * FROM cocktails WHERE visible = 1 ORDER BY position, id")
    .all()
    .map(mapCocktail);
  res.json({ cocktails });
});

/* ---------- administration ---------- */

/*
 * Une photo remplacée ou supprimée n'a plus de raison d'occuper le disque :
 * on l'efface dès qu'aucun plat ni cocktail ne la référence.
 */
function pruneUpload(url) {
  if (!url || !url.startsWith("/uploads/")) return;

  const stillUsed =
    db.prepare("SELECT 1 FROM dishes WHERE image = ? LIMIT 1").get(url) ??
    db.prepare("SELECT 1 FROM cocktails WHERE image = ? LIMIT 1").get(url);
  if (stillUsed) return;

  const file = join(UPLOADS_DIR, basename(url));
  rmSync(file, { force: true });
}

app.get("/api/admin/dishes", requireAuth, (_req, res) => {
  res.json({
    categories: CATEGORIES,
    dishes: db
      .prepare("SELECT * FROM dishes ORDER BY category, position, id")
      .all()
      .map(mapDish),
  });
});

app.get("/api/admin/cocktails", requireAuth, (_req, res) => {
  res.json({
    cocktails: db
      .prepare("SELECT * FROM cocktails ORDER BY position, id")
      .all()
      .map(mapCocktail),
  });
});

const categorySlugs = CATEGORIES.map((c) => c.slug);

const text = (v) => String(v ?? "").trim();
const flag = (v, fallback) => (v === undefined ? fallback : v ? 1 : 0);

/*
 * Construit la ligne à écrire. `partial` : seuls les champs fournis sont
 * retenus (mise à jour). Sinon, les absents prennent leur valeur par défaut.
 */
function buildPayload(body, fields, { partial }) {
  const out = {};
  for (const [key, parse] of Object.entries(fields)) {
    if (partial && !(key in body)) continue;
    out[key] = parse(body[key]);
  }
  return out;
}

const DISH_FIELDS = {
  category: (v) => {
    const slug = text(v);
    if (!categorySlugs.includes(slug)) throw new Error("Catégorie inconnue.");
    return slug;
  },
  name: (v) => {
    const name = text(v);
    if (!name) throw new Error("Le nom du plat est obligatoire.");
    return name;
  },
  description: text,
  price: text,
  image: (v) => (v ? String(v) : null),
  featured: (v) => flag(v, 0),
  visible: (v) => flag(v, 1),
  position: (v) => Number(v) || 0,
};

function dishPayload(body, { partial } = { partial: false }) {
  return buildPayload(body, DISH_FIELDS, { partial });
}

app.post("/api/admin/dishes", requireAuth, (req, res) => {
  try {
    const data = dishPayload(req.body ?? {});
    const nextPosition =
      data.position ||
      (db
        .prepare("SELECT COALESCE(MAX(position), 0) + 1 AS p FROM dishes WHERE category = ?")
        .get(data.category).p);
    const info = db
      .prepare(
        `INSERT INTO dishes (category, name, description, price, image, featured, visible, position)
         VALUES (@category, @name, @description, @price, @image, @featured, @visible, @position)`
      )
      .run({ ...data, position: nextPosition });
    res.status(201).json({
      dish: mapDish(db.prepare("SELECT * FROM dishes WHERE id = ?").get(info.lastInsertRowid)),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/api/admin/dishes/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM dishes WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Plat introuvable." });
  try {
    const data = dishPayload(req.body ?? {}, { partial: true });
    const keys = Object.keys(data);
    if (keys.length) {
      db.prepare(
        `        UPDATE dishes SET ${keys.map((k) => `${k} = @${k}`).join(", ")},
         updated_at = datetime('now') WHERE id = @id`
      ).run({ ...data, id: existing.id });
    }
    if ("image" in data && data.image !== existing.image) pruneUpload(existing.image);
    res.json({
      dish: mapDish(db.prepare("SELECT * FROM dishes WHERE id = ?").get(existing.id)),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/admin/dishes/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT image FROM dishes WHERE id = ?").get(req.params.id);
  const info = db.prepare("DELETE FROM dishes WHERE id = ?").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: "Plat introuvable." });
  pruneUpload(existing?.image);
  res.json({ ok: true });
});

const COCKTAIL_FIELDS = {
  name: (v) => {
    const name = text(v);
    if (!name) throw new Error("Le nom du cocktail est obligatoire.");
    return name;
  },
  recipe: text,
  price: text,
  image: (v) => (v ? String(v) : null),
  featured: (v) => flag(v, 0),
  visible: (v) => flag(v, 1),
  position: (v) => Number(v) || 0,
};

function cocktailPayload(body, { partial } = { partial: false }) {
  return buildPayload(body, COCKTAIL_FIELDS, { partial });
}

app.post("/api/admin/cocktails", requireAuth, (req, res) => {
  try {
    const data = cocktailPayload(req.body ?? {});
    const nextPosition =
      data.position ||
      db.prepare("SELECT COALESCE(MAX(position), 0) + 1 AS p FROM cocktails").get().p;
    const info = db
      .prepare(
        `INSERT INTO cocktails (name, recipe, price, image, featured, visible, position)
         VALUES (@name, @recipe, @price, @image, @featured, @visible, @position)`
      )
      .run({ ...data, position: nextPosition });
    res.status(201).json({
      cocktail: mapCocktail(
        db.prepare("SELECT * FROM cocktails WHERE id = ?").get(info.lastInsertRowid)
      ),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.patch("/api/admin/cocktails/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT * FROM cocktails WHERE id = ?").get(req.params.id);
  if (!existing) return res.status(404).json({ error: "Cocktail introuvable." });
  try {
    const data = cocktailPayload(req.body ?? {}, { partial: true });
    const keys = Object.keys(data);
    if (keys.length) {
      db.prepare(
        `        UPDATE cocktails SET ${keys.map((k) => `${k} = @${k}`).join(", ")},
         updated_at = datetime('now') WHERE id = @id`
      ).run({ ...data, id: existing.id });
    }
    if ("image" in data && data.image !== existing.image) pruneUpload(existing.image);
    res.json({
      cocktail: mapCocktail(db.prepare("SELECT * FROM cocktails WHERE id = ?").get(existing.id)),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/admin/cocktails/:id", requireAuth, (req, res) => {
  const existing = db.prepare("SELECT image FROM cocktails WHERE id = ?").get(req.params.id);
  const info = db.prepare("DELETE FROM cocktails WHERE id = ?").run(req.params.id);
  if (!info.changes) return res.status(404).json({ error: "Cocktail introuvable." });
  pruneUpload(existing?.image);
  res.json({ ok: true });
});

app.post("/api/admin/upload", requireAuth, (req, res) => {
  upload.single("photo")(req, res, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    if (!req.file) return res.status(400).json({ error: "Aucun fichier reçu." });
    res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

/* ---------- site compilé (production) ---------- */

const DIST = join(here, "..", "dist");
if (existsSync(DIST)) {
  app.use(express.static(DIST));
  // Les routes React (/carte, /admin…) sont rendues côté client.
  app.get(/^\/(?!api|uploads).*/, (_req, res) => res.sendFile(join(DIST, "index.html")));
}

app.listen(PORT, () => {
  console.log(`API La Marine → http://localhost:${PORT}`);
});
