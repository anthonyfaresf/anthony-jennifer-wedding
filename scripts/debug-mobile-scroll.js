/* Test mobile scrub on live production — multiple scroll positions, frame img check. */
const { chromium, devices } = require("playwright");
const URL = "https://anthonyfaresf.github.io/anthony-jennifer-wedding/";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(devices["iPhone 14"]);
  const page = await ctx.newPage();
  page.on("pageerror", (err) => console.log(`[pageerror] ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error" || msg.type() === "warn") {
      console.log(`[${msg.type()}] ${msg.text()}`);
    }
  });

  console.log("Loading...");
  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);

  console.log("\n=== HERO scrub test (image sequence) ===");
  for (const px of [0, 300, 600, 900, 1200, 1500]) {
    await page.evaluate((y) => window.scrollTo(0, y), px);
    await page.waitForTimeout(800);
    const state = await page.evaluate(() => {
      // First img inside #hero is the FrameSequence img
      const hero = document.querySelector("#hero");
      const img = hero?.querySelector("img");
      if (!img) return null;
      const m = img.src.match(/f-(\d+)\.jpg/);
      return {
        scrollY: window.scrollY,
        frame: m ? m[1] : null,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
      };
    });
    console.log(`scroll=${px}px → frame=${state?.frame} complete=${state?.complete} natW=${state?.naturalWidth}`);
    await page.screenshot({ path: `scripts/screenshots/mobile-scroll-${px}.png`, fullPage: false });
  }

  console.log("\n=== STORY scenes scrub test ===");
  for (const px of [2000, 3000, 4000, 5000]) {
    await page.evaluate((y) => window.scrollTo(0, y), px);
    await page.waitForTimeout(800);
    const state = await page.evaluate(() => {
      const visible = Array.from(document.querySelectorAll(".scene-frame"))
        .map((img, i) => {
          const r = img.getBoundingClientRect();
          if (r.bottom < 0 || r.top > window.innerHeight) return null;
          const m = img.src.match(/(scene-\d+-\w+)\/f-(\d+)\.jpg/);
          return {
            i,
            scene: m ? m[1] : null,
            frame: m ? m[2] : null,
            opacity: getComputedStyle(img).opacity,
          };
        })
        .filter(Boolean);
      return { scrollY: window.scrollY, visible };
    });
    console.log(`scroll=${px}px → ${JSON.stringify(state.visible)}`);
    await page.screenshot({ path: `scripts/screenshots/mobile-story-${px}.png`, fullPage: false });
  }

  await browser.close();
  console.log("\nDone.");
})();
