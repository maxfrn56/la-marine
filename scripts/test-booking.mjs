import puppeteer from "puppeteer-core";

const BASE = "http://localhost:5173";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const browser = await puppeteer.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: "new",
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
page.setDefaultTimeout(20000);
const errors = [];
page.on("console", (m) => {
  if (m.type() === "error" && !/401|favicon/.test(m.text())) errors.push(m.text());
});
page.on("pageerror", (e) => errors.push(e.message));
page.on("dialog", async (d) => d.accept());

const day = String(new Date().getDate() + 11 > 28 ? 18 : new Date().getDate() + 7);

await page.goto(BASE, { waitUntil: "networkidle0" });
await wait(2500);
await page.waitForSelector(".book-fab");
await page.screenshot({ path: "shot-book-fab.png" });
await page.click(".book-fab");
await page.waitForSelector(".book-panel");
await wait(400);

const partyBtn = await page.$(`.book-party button`);
await page.click(".book-party button:nth-child(2)"); // 2 couverts
await wait(200);

const enabledDays = await page.$$(".book-cal-grid button:not(:disabled)");
if (!enabledDays.length) throw new Error("aucun jour cliquable");
await enabledDays[Math.min(6, enabledDays.length - 1)].click();
await page.waitForSelector(".book-slot-group button");
await wait(300);
await page.screenshot({ path: "shot-book-slots.png" });

const evening = await page.evaluateHandle(() => {
  const groups = [...document.querySelectorAll(".book-slot-group")];
  const soir = groups.find((g) => g.textContent.includes("Soir"));
  return soir?.querySelector("button");
});
await evening.asElement().click();
await page.waitForSelector(".book-contact");
await page.type('.book-contact input[autocomplete="name"]', "Léa Moreau");
await page.type('.book-contact input[autocomplete="tel"]', "0687654321");
await page.type('.book-contact input[autocomplete="email"]', "lea.moreau@test.fr");
await page.screenshot({ path: "shot-book-form.png" });
await page.click(".book-submit");
await page.waitForSelector(".book-success", { timeout: 10000 });
const recap = await page.$eval(".book-success", (el) => el.innerText);
console.log("confirmation client :\n", recap.replace(/\n+/g, " | "));
await page.screenshot({ path: "shot-book-success.png" });
const code = recap.match(/LM-[A-Z0-9]+/)?.[0];
await page.click(".book-success .book-submit");
await wait(800);

await page.goto(`${BASE}/admin`, { waitUntil: "networkidle0" });
if (await page.$(".login-card")) {
  await page.type('input[type="email"]', "lamarine1712@gmail.com");
  await page.type('input[type="password"]', "LaMarine1915");
  await page.click(".login-submit");
}
await page.waitForSelector(".rsv-col, .admin-panel");
await wait(800);

const dateValue = await page.$eval('.rsv-daynav input[type="date"]', (el) => el.value);
console.log("admin date du jour :", dateValue);

const foundToday = await page.evaluate((c) => document.body.innerText.includes(c), code);
if (!foundToday) {
  const input = await page.$('.rsv-daynav input[type="date"]');
  const target = await page.evaluate(async (c) => {
    const r = await fetch("/api/admin/reservations?date=" + document.querySelector('.rsv-daynav input[type="date"]').value, { credentials: "same-origin" });
    return c;
  }, code);
  const upcoming = await page.evaluate(async (c) => {
    const from = document.querySelector('.rsv-daynav input[type="date"]').value;
    for (let i = 0; i < 20; i += 1) {
      const d = new Date(from + "T12:00:00Z");
      d.setUTCDate(d.getUTCDate() + i);
      const iso = d.toISOString().slice(0, 10);
      const res = await fetch("/api/admin/reservations?date=" + iso, { credentials: "same-origin" });
      const json = await res.json();
      const names = JSON.stringify(json);
      if (names.includes(c) || names.includes("Léa Moreau")) return iso;
    }
    return null;
  }, code);
  console.log("réservation trouvée le", upcoming);
  if (upcoming) {
    await page.$eval('.rsv-daynav input[type="date"]', (el, v) => {
      el.value = v;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, upcoming);
    await wait(1200);
  }
}

await page.screenshot({ path: "shot-admin-book.png" });
const visible = await page.evaluate(() => document.body.innerText.includes("Léa Moreau"));
console.log("Léa visible dans l’admin :", visible);

const blockBtn = await page.evaluateHandle(() => {
  const slot = [...document.querySelectorAll(".rsv-col li")].find((li) =>
    li.textContent.includes("19h30")
  );
  return slot?.querySelector("button");
});
if (blockBtn.asElement()) {
  await blockBtn.asElement().click();
  await wait(800);
}
console.log("après blocage 19h30 :", await page.evaluate(() =>
  [...document.querySelectorAll(".rsv-col li")].find((li) => li.textContent.includes("19h30"))?.className
));

const cancelBtn = await page.evaluateHandle(() => {
  const card = [...document.querySelectorAll(".rsv-card")].find((c) =>
    c.textContent.includes("Léa Moreau")
  );
  return card?.querySelector(".admin-btn--danger");
});
if (cancelBtn.asElement()) {
  await cancelBtn.asElement().click();
  await wait(1000);
}
console.log("Léa encore là ?", await page.evaluate(() => document.body.innerText.includes("Léa Moreau")));

await page.goto(BASE, { waitUntil: "networkidle0" });
await wait(2000);
console.log(errors.length ? `erreurs console:\n${errors.join("\n")}` : "aucune erreur console");
await browser.close();
