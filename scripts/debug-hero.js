const { chromium, devices } = require("playwright");
const URL = "https://anthonyfaresf.github.io/anthony-jennifer-wedding/";
(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(devices["iPhone 14"]);
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2000);
  console.log("\n=== HERO appearance progression ===");
  for (const px of [600, 850, 1100, 1400, 1700, 2000, 2300]) {
    await page.evaluate((y) => window.scrollTo(0, y), px);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `scripts/screenshots/hero-${String(px).padStart(4,"0")}.png`, fullPage: false });
    console.log(`scroll=${px}px → captured`);
  }
  await browser.close();
})();
