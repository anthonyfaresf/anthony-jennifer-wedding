/* Test the new alive splash on live production · iPhone emulation. */
const { chromium, devices } = require("playwright");
const URL = "https://anthonyfaresf.github.io/anthony-jennifer-wedding/";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(devices["iPhone 14"]);
  const page = await ctx.newPage();
  page.on("pageerror", (err) => console.log(`[pageerror] ${err.message}`));

  console.log("Loading...");
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(2500); // let stagger reveal settle

  console.log("\n=== SPLASH at multiple scroll positions ===");
  for (const px of [0, 250, 500, 800, 1100, 1500, 1900]) {
    await page.evaluate((y) => window.scrollTo(0, y), px);
    await page.waitForTimeout(800);

    const state = await page.evaluate(() => {
      const lemonsWrap = document.querySelector(".splash-lemons-wrap");
      const textBlock = document.querySelector(".splash-text-block");
      const panelL = document.querySelector(".panel-left");
      const panelR = document.querySelector(".panel-right");
      const cs = (el) => (el ? getComputedStyle(el) : null);
      return {
        scrollY: window.scrollY,
        lemonsTransform: cs(lemonsWrap)?.transform.slice(0, 60),
        lemonsOpacity: cs(lemonsWrap)?.opacity,
        textOpacity: cs(textBlock)?.opacity,
        panelLTransform: cs(panelL)?.transform.slice(0, 60),
        panelRTransform: cs(panelR)?.transform.slice(0, 60),
      };
    });
    console.log(`scroll=${px}px → lemonsOp=${state.lemonsOpacity}  textOp=${state.textOpacity}  panelL=${state.panelLTransform}`);
    await page.screenshot({
      path: `scripts/screenshots/splash-${String(px).padStart(4, "0")}.png`,
      fullPage: false,
    });
  }

  await browser.close();
  console.log("\nDone. Screenshots in scripts/screenshots/splash-*.png");
})();
