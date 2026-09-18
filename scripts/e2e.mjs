import puppeteer from "puppeteer-core";

const BASE = "http://localhost:5173";
const shots = [];

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });

const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" && !m.text().includes("favicon")) errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(`PAGE ERROR: ${e.message}`));

const shot = async (name) => {
  await page.screenshot({ path: `shot-${name}.png` });
  shots.push(name);
};
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* 1. Connexion admin */
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
await wait(800);
await shot("01-login");

// mauvais mot de passe
await page.type('input[type="email"]', "lamarine1712@gmail.com");
await page.type('input[type="password"]', "mauvais");
await page.click(".login-submit");
await page.waitForSelector(".login-error", { timeout: 5000 });
console.log("erreur affichée :", await page.$eval(".login-error", (el) => el.textContent));

// bon mot de passe, sur un formulaire vierge
await page.reload({ waitUntil: "networkidle0" });
await page.waitForSelector(".login-card");
await page.type('input[type="email"]', "lamarine1712@gmail.com");
await page.type('input[type="password"]', "LaMarine1915");
await page.click(".login-submit");
await page.waitForSelector(".admin-panel", { timeout: 8000 });
await wait(600);
await shot("02-dashboard");

/* 2. Ajout d'un plat, mis en vitrine */
await page.click(".admin-panel-head .admin-btn--gold");
await page.waitForSelector(".admin-form");
await page.select(".admin-field select", "peche");
await page.type(".admin-field input", "Homard bleu grillé");
await page.type(".admin-field textarea", "Beurre d’algues, citron confit du jardin");
const priceInputs = await page.$$(".admin-field input");
await priceInputs[1].type("46 €");
// coche « en vitrine »
await page.click(".admin-toggle");
await wait(200);
await shot("03-formulaire");
await page.click('.admin-form-actions button[type="submit"]');
await page.waitForFunction(
  () => document.querySelector(".admin-toast")?.textContent?.includes("Homard"),
  { timeout: 8000 }
);
console.log("après ajout :", await page.$eval(".admin-toast", (el) => el.textContent.trim()));
await wait(400);
await shot("04-apres-ajout");

/* 3. Vérification sur la home */
await page.goto(BASE, { waitUntil: "networkidle0" });
await wait(7000);
const surHome = await page.evaluate(() =>
  [...document.querySelectorAll(".carte-plat h3")].map((el) => el.textContent)
);
console.log("plats en vitrine sur la home :", JSON.stringify(surHome));

/* 4. Vérification sur la page Carte */
await page.goto(`${BASE}/carte`, { waitUntil: "networkidle0" });
await wait(2500);
const surCarte = await page.evaluate(() =>
  [...document.querySelectorAll(".carte-page-items h3")].map((el) => el.textContent)
);
console.log("présent sur /carte :", surCarte.includes("Homard bleu grillé"));
console.log("nombre de plats sur /carte :", surCarte.length);

/* 5. Modification du prix */
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
await page.waitForSelector(".admin-panel");
await wait(500);
const ligneHomard = await page.evaluateHandle(() =>
  [...document.querySelectorAll(".admin-row")].find((r) =>
    r.textContent.includes("Homard bleu grillé")
  )
);
const boutonModifier = await ligneHomard.$(".admin-btn--ghost");
await boutonModifier.click();
await page.waitForSelector(".admin-form");
await wait(300);
const champs = await page.$$(".admin-field input");
// on sélectionne le contenu existant pour le remplacer
await champs[1].evaluate((el) => {
  el.focus();
  el.setSelectionRange(0, el.value.length);
});
await champs[1].type("52 €");
await page.click('.admin-form-actions button[type="submit"]');
await page.waitForFunction(
  () => document.querySelector(".admin-toast")?.textContent?.includes("mis à jour"),
  { timeout: 8000 }
);
console.log("après modification :", await page.$eval(".admin-toast", (el) => el.textContent.trim()));

await page.goto(`${BASE}/carte`, { waitUntil: "networkidle0" });
await wait(2500);
const prix = await page.evaluate(() => {
  const li = [...document.querySelectorAll(".carte-page-items li")].find((l) =>
    l.textContent.includes("Homard bleu grillé")
  );
  return li?.querySelector(".carte-page-price")?.textContent;
});
console.log("nouveau prix sur /carte :", prix);
await shot("05-carte-publique");

/* 6. Onglet cocktails + ajout */
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
await page.waitForSelector(".admin-tabs");
await wait(400);
const onglets = await page.$$(".admin-tabs button");
await onglets[1].click();
await wait(500);
await shot("06-cocktails");
await page.click(".admin-panel-head .admin-btn--gold");
await page.waitForSelector(".admin-form");
await page.type(".admin-field input", "Le Phare de Teignouse");
await page.type(".admin-field textarea", "Gin de la baie, tonic hysope, romarin brûlé");
const champsCocktail = await page.$$(".admin-field input");
await champsCocktail[1].type("13 €");
await page.click(".admin-toggle");
await page.click('.admin-form-actions button[type="submit"]');
await page.waitForFunction(
  () => document.querySelector(".admin-toast")?.textContent?.includes("Phare"),
  { timeout: 8000 }
);
console.log("cocktail ajouté :", await page.$eval(".admin-toast", (el) => el.textContent.trim()));

await page.goto(`${BASE}/cocktails`, { waitUntil: "networkidle0" });
await wait(2500);
const surCocktails = await page.evaluate(() =>
  [...document.querySelectorAll(".cocktails-list h3")].map((el) => el.textContent)
);
console.log("cocktails publiés :", JSON.stringify(surCocktails));
await shot("07-cocktails-publique");

/* 7. Le cocktail vedette apparaît sur la home */
await page.goto(BASE, { waitUntil: "networkidle0" });
await wait(7000);
const barHome = await page.evaluate(() =>
  [...document.querySelectorAll(".bar-signature-line h3")].map((el) => el.textContent)
);
console.log("cocktails vitrine sur la home :", JSON.stringify(barHome));
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.42));
await wait(1500);
await shot("08-home-bar");

/* 8. Masquage puis suppression */
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
await page.waitForSelector(".admin-panel");
await wait(500);
const ligne = await page.evaluateHandle(() =>
  [...document.querySelectorAll(".admin-row")].find((r) =>
    r.textContent.includes("Homard bleu grillé")
  )
);
await (await ligne.$(".admin-btn--quiet")).click();
await page.waitForFunction(
  () => document.querySelector(".admin-toast")?.textContent?.includes("masqué"),
  { timeout: 8000 }
);
console.log("masquage :", await page.$eval(".admin-toast", (el) => el.textContent.trim()));

await page.goto(`${BASE}/carte`, { waitUntil: "networkidle0" });
await wait(2500);
const apresMasquage = await page.evaluate(() =>
  [...document.querySelectorAll(".carte-page-items h3")].map((el) => el.textContent)
);
console.log("homard encore visible ? ", apresMasquage.includes("Homard bleu grillé"));

/* nettoyage : suppression des deux éléments de test */
page.on("dialog", async (d) => d.accept());
await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
await page.waitForSelector(".admin-panel");
await wait(500);
const aSupprimer = await page.evaluateHandle(() =>
  [...document.querySelectorAll(".admin-row")].find((r) =>
    r.textContent.includes("Homard bleu grillé")
  )
);
await (await aSupprimer.$(".admin-btn--danger")).click();
await page.waitForFunction(
  () =>
    document.querySelector(".admin-toast")?.textContent?.includes("Homard") &&
    document.querySelector(".admin-toast")?.textContent?.includes("supprimé"),
  { timeout: 8000 }
);
console.log("suppression plat :", await page.$eval(".admin-toast", (el) => el.textContent.trim()));

const onglets2 = await page.$$(".admin-tabs button");
await onglets2[1].click();
await wait(600);
const cocktailASupprimer = await page.evaluateHandle(() =>
  [...document.querySelectorAll(".admin-row")].find((r) =>
    r.textContent.includes("Le Phare de Teignouse")
  )
);
await (await cocktailASupprimer.$(".admin-btn--danger")).click();
await page.waitForFunction(
  () =>
    document.querySelector(".admin-toast")?.textContent?.includes("Phare") &&
    document.querySelector(".admin-toast")?.textContent?.includes("supprimé"),
  { timeout: 8000 }
);
console.log("suppression cocktail :", await page.$eval(".admin-toast", (el) => el.textContent.trim()));

/* 9. Déconnexion */
await page.click(".admin-head-right .admin-btn--quiet");
await page.waitForSelector(".login-card", { timeout: 8000 });
console.log("déconnexion : retour à l’écran de connexion");

console.log("\ncaptures :", shots.join(", "));
console.log(errors.length ? `\nERREURS CONSOLE :\n${errors.join("\n")}` : "\naucune erreur console");
await browser.close();
