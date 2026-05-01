/* Hero section visual QA — scrolls through the new wine-cheers hero on
 * mobile + desktop, captures multiple scroll positions to verify the
 * scroll-scrubbed video playback + text reveals. */
const { chromium, devices } = require("playwright");

const BASE = process.env.BASE || "http://localhost:3000";

const VIEWPORTS = [
  { label: "mobile", ctx: { ...devices["iPhone 14"] } },
  { label: "desktop", ctx: { viewport: { width: 1280, height: 800 } } },
];

const STEPS = [
  { label: "00-top", scrollTo: 0 },
  { label: "01-early", scrollTo: 250 },
  { label: "02-mid", scrollTo: 500 },
  { label: "03-mid-late", scrollTo: 800 },
  { label: "04-late", scrollTo: 1100 },
  { label: "05-cheers", scrollTo: 1400 },
  { label: "06-handoff", scrollTo: 1700 },
];

(async () => {
  const browser = await chromium.launch();

  for (const v of VIEWPORTS) {
    const ctx = await browser.newContext(v.ctx);
    const page = await ctx.newPage();
    page.on("pageerror", (err) => console.error(`[${v.label}] pageerror:`, err.message));
    page.on("console", (msg) => {
      if (msg.type() === "error") console.error(`[${v.label}] console.error:`, msg.text());
    });

    await page.goto(BASE, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);

    for (const step of STEPS) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: "instant" }), step.scrollTo);
      await page.waitForTimeout(1500);
      const out = `scripts/screenshots/hero-${v.label}-${step.label}.png`;
      await page.screenshot({ path: out, fullPage: false });
      console.log(`saved ${out}`);
    }

    await ctx.close();
  }

  await browser.close();
  console.log("done");
})();
