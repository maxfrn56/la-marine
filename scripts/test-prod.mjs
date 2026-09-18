import puppeteer from "puppeteer-core";

const BASE = "http://localhost:4000";

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(`PAGE ERROR: ${e.message}`));
page.on("dialog", async (d) => d.accept());
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* 1. URL directe /admin servie par le serveur (fallback SPA) */
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
await page.waitForSelector(".login-card", { timeout: 8000 });
console.log("accès direct à /admin en production : ok");

await page.type('input[type="email"]', "lamarine1712@gmail.com");
await page.type('input[type="password"]', "LaMarine1915");
await page.click(".login-submit");
await page.waitForSelector(".admin-panel", { timeout: 8000 });
console.log("connexion en production : ok");

/* 2. Upload d'une photo sur un plat existant */
const ligne = await page.evaluateHandle(() =>
  [...document.querySelectorAll(".admin-row")].find((r) =>
    r.textContent.includes("Sole meunière entière")
  )
);
await (await ligne.$(".admin-btn--ghost")).click();
await page.waitForSelector(".admin-form");
const fileInput = await page.$('.admin-form input[type="file"]');
await fileInput.uploadFile("src/assets/photos/carpaccio.png");
await page.waitForFunction(
  () => Boolean(document.querySelector(".admin-photo-preview img")),
  { timeout: 10000 }
);
const apercu = await page.$eval(".admin-photo-preview img", (el) => el.getAttribute("src"));
console.log("photo envoyée, aperçu :", apercu);

await wait(600); // laisse la mise en page se stabiliser après l'aperçu
await page.click('.admin-form-actions button[type="submit"]');
await page.waitForFunction(
  () => document.querySelector(".admin-toast")?.textContent?.includes("mis à jour"),
  { timeout: 8000 }
);
console.log("plat enregistré avec sa photo");

/* 3. La photo remonte-t-elle sur le site ? */
const { image } = await page.evaluate(async () => {
  const r = await fetch("/api/menu");
  const d = await r.json();
  return { image: d.dishes.find((x) => x.name === "Sole meunière entière")?.image };
});
console.log("photo exposée par l’API publique :", image);
const statut = await page.evaluate(
  async (url) => (await fetch(url)).status,
  image
);
console.log("la photo est bien servie :", statut === 200);

/* 4. La vignette apparaît dans le dashboard */
await page.reload({ waitUntil: "networkidle0" });
await page.waitForSelector(".admin-row-thumb img", { timeout: 8000 });
console.log("vignette visible dans la liste : ok");
await page.screenshot({ path: "shot-09-prod-photo.png" });

/* 5. On remet le plat sans photo */
const ligne2 = await page.evaluateHandle(() =>
  [...document.querySelectorAll(".admin-row")].find((r) =>
    r.textContent.includes("Sole meunière entière")
  )
);
await (await ligne2.$(".admin-btn--ghost")).click();
await page.waitForSelector(".admin-form");
await wait(800); // le formulaire finit son animation d'ouverture
await page.click(".admin-photo-actions .admin-btn--quiet");
await page.waitForFunction(
  () => Boolean(document.querySelector(".admin-photo-empty")),
  { timeout: 5000 }
);
await wait(400); // la mise en page se resserre après le retrait
await page.click('.admin-form-actions button[type="submit"]');
await page.waitForFunction(
  async () => {
    const d = await (await fetch("/api/menu")).json();
    return d.dishes.find((x) => x.name === "Sole meunière entière")?.image === null;
  },
  { timeout: 8000 }
);
console.log("photo retirée, état initial rétabli");

/* 6. Les pages publiques répondent en production */
for (const route of ["/", "/carte", "/cocktails", "/histoire"]) {
  const res = await page.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
  console.log(`${route} → ${res.status()}`);
}

console.log(errors.length ? `\nERREURS :\n${errors.join("\n")}` : "\naucune erreur console");
await browser.close();
