/* Story section visual QA — scrolls through the 6 scenes at mobile + desktop. */
const { chromium, devices } = require("playwright");

const BASE = process.env.BASE || "http://localhost:3000";

const VIEWPORTS = [
  { label: "mobile", ctx: { ...devices["iPhone 14"] } },
  { label: "desktop", ctx: { viewport: { width: 1280, height: 800 } } },
];

const SCROLL_STEPS = [
  { label: "story-top", scrollTo: "#story" },
  { label: "scene-01", scrollPx: 600 },
  { label: "scene-02", scrollPx: 800 },
  { label: "scene-03", scrollPx: 800 },
  { label: "scene-04", scrollPx: 800 },
  { label: "scene-05", scrollPx: 800 },
  { label: "scene-06", scrollPx: 800 },
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

    for (const step of SCROLL_STEPS) {
      if (step.scrollTo) {
        await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          el?.scrollIntoView({ behavior: "instant", block: "start" });
        }, step.scrollTo);
      } else {
        await page.evaluate((px) => window.scrollBy(0, px), step.scrollPx);
      }
      await page.waitForTimeout(2200); // GSAP entrances + autoplay kick-in
      const out = `scripts/screenshots/${v.label}-${step.label}.png`;
      await page.screenshot({ path: out, fullPage: false });
      console.log(`saved ${out}`);
    }

    await ctx.close();
  }

  await browser.close();
  console.log("done");
})();
