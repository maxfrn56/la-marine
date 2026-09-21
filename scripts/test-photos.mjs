import puppeteer from "puppeteer-core";
import { statSync } from "node:fs";

const BASE = "http://localhost:5173";
const GROSSE_PHOTO = "src/assets/photos/carpaccio.png";

/* Repères de progression et garde-fou : le script ne doit jamais rester bloqué. */
let etape = "démarrage";
const step = (nom) => {
  etape = nom;
  console.log(`· ${nom}`);
};
const debut = Date.now();
const watchdog = setTimeout(() => {
  console.error(`\nBLOCAGE à l'étape « ${etape} » après ${Math.round((Date.now() - debut) / 1000)}s`);
  process.exit(1);
}, 150000);
watchdog.unref?.();

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
const page = await browser.newPage();
page.setDefaultTimeout(15000);
await page.setViewport({ width: 1440, height: 1000 });
page.on("dialog", async (d) => d.accept());
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("401")) errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(`PAGE ERROR: ${e.message}`));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const poidsOrigine = statSync(GROSSE_PHOTO).size;
console.log(`photo d'origine : ${(poidsOrigine / 1024).toFixed(0)} Ko`);

/* --- connexion --- */
step("connexion admin");
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
await page.type('input[type="email"]', "lamarine1712@gmail.com");
await page.type('input[type="password"]', "LaMarine1915");
await page.click(".login-submit");
await page.waitForSelector(".admin-panel", { timeout: 8000 });

/* --- photo sur un plat NON mis en vitrine (le cas signalé) --- */
step("ouverture du plat Foie gras");
const ligne = await page.evaluateHandle(() =>
  [...document.querySelectorAll(".admin-row")].find(
    (r) => r.textContent.includes("Foie gras") // plat non vitrine
  )
);
await (await ligne.$(".admin-btn--ghost")).click();
await page.waitForSelector(".admin-form");
await wait(800);
step("envoi de la photo du plat");
await (await page.$('.admin-form input[type="file"]')).uploadFile(GROSSE_PHOTO);
await page.waitForFunction(() => Boolean(document.querySelector(".admin-photo-preview img")), {
  timeout: 15000,
});
const url = await page.$eval(".admin-photo-preview img", (el) => el.getAttribute("src"));
console.log("envoyée sous :", url);

const info = await page.evaluate(async (u) => {
  const r = await fetch(u);
  const b = await r.blob();
  return { type: b.type, ko: Math.round(b.size / 1024) };
}, url);
console.log(`stockée : ${info.ko} Ko en ${info.type}`);
console.log(
  `réduction : ${(100 - (info.ko * 1024 * 100) / poidsOrigine).toFixed(0)} %`
);

await wait(500);
await page.click('.admin-form-actions button[type="submit"]');
await page.waitForFunction(
  () => document.querySelector(".admin-toast")?.textContent?.includes("mis à jour"),
  { timeout: 8000 }
);

/* --- vérification de l'affichage sur /carte --- */
step("vérification sur /carte");
await page.goto(`${BASE}/carte`, { waitUntil: "networkidle0" });
await wait(2500);
const surCarte = await page.evaluate(() => {
  const li = [...document.querySelectorAll(".carte-page-items li")].find((l) =>
    l.textContent.includes("Foie gras")
  );
  const img = li?.querySelector(".carte-page-thumb img");
  return {
    vignettePresente: Boolean(img),
    src: img?.getAttribute("src") ?? null,
    affichee: img ? img.naturalWidth > 0 : false,
  };
});
console.log("sur /carte :", surCarte);
await page.evaluate(() => {
  document
    .querySelector(".carte-page-thumb")
    ?.scrollIntoView({ block: "center" });
});
await wait(1200);
await page.screenshot({ path: "shot-carte-photo.png" });

/* --- même chose pour un cocktail --- */
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
await page.waitForSelector(".admin-tabs");
await wait(500);
await (await page.$$(".admin-tabs button"))[1].click();
await wait(600);
step("ouverture du cocktail Abordage");
const ligneC = await page.evaluateHandle(() =>
  [...document.querySelectorAll(".admin-row")].find((r) => r.textContent.includes("L’Abordage"))
);
await (await ligneC.$(".admin-btn--ghost")).click();
await page.waitForSelector(".admin-form");
await wait(800);
await (await page.$('.admin-form input[type="file"]')).uploadFile("src/assets/photos/gin-tonic.png");
await page.waitForFunction(() => Boolean(document.querySelector(".admin-photo-preview img")), {
  timeout: 15000,
});
await wait(500);
await page.click('.admin-form-actions button[type="submit"]');
await page.waitForFunction(
  () => document.querySelector(".admin-toast")?.textContent?.includes("mis à jour"),
  { timeout: 8000 }
);

step("vérification sur /cocktails");
await page.goto(`${BASE}/cocktails`, { waitUntil: "networkidle0" });
await wait(2500);
console.log("sur /cocktails :", await page.evaluate(() => {
  const li = [...document.querySelectorAll(".cocktails-list li")].find((l) =>
    l.textContent.includes("Abordage")
  );
  const img = li?.querySelector(".cocktails-thumb img");
  return { vignettePresente: Boolean(img), affichee: img ? img.naturalWidth > 0 : false };
}));
await page.evaluate(() => document.querySelector(".cocktails-thumb")?.scrollIntoView({ block: "center" }));
await wait(1200);
await page.screenshot({ path: "shot-cocktails-photo.png" });

/* --- rendu mobile --- */
step("rendu mobile");
await page.setViewport({ width: 390, height: 844 });
await page.goto(`${BASE}/carte`, { waitUntil: "networkidle0" });
await wait(2500);
await page.evaluate(() => document.querySelector(".carte-page-thumb")?.scrollIntoView({ block: "center" }));
await wait(1000);
await page.screenshot({ path: "shot-carte-mobile.png" });
await page.goto(`${BASE}/cocktails`, { waitUntil: "networkidle0" });
await wait(2500);
await page.evaluate(() => document.querySelector(".cocktails-thumb")?.scrollIntoView({ block: "center" }));
await wait(1000);
await page.screenshot({ path: "shot-cocktails-mobile.png" });

/* --- remise en état --- */
await page.setViewport({ width: 1440, height: 1000 });
step("remise en état");
for (const [onglet, nom] of [[0, "Foie gras"], [1, "L’Abordage"]]) {
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
  await page.waitForSelector(".admin-tabs");
  await wait(500);
  await (await page.$$(".admin-tabs button"))[onglet].click();
  await wait(600);
  const l = await page.evaluateHandle(
    (n) => [...document.querySelectorAll(".admin-row")].find((r) => r.textContent.includes(n)),
    nom
  );
  await (await l.$(".admin-btn--ghost")).click();
  await page.waitForSelector(".admin-form");
  await wait(800);
  await page.click(".admin-photo-actions .admin-btn--quiet");
  await page.waitForFunction(() => Boolean(document.querySelector(".admin-photo-empty")));
  await wait(400);
  await page.click('.admin-form-actions button[type="submit"]');
  await wait(2000);
}
console.log("remise en état effectuée");

clearTimeout(watchdog);
console.log(errors.length ? `\nERREURS :\n${errors.join("\n")}` : "\naucune erreur console");
await browser.close();
