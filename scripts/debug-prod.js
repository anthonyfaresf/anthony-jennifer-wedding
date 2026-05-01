/* Debug live production site — capture console + network errors + video state. */
const { chromium, devices } = require("playwright");

const URL = "https://anthonyfaresf.github.io/anthony-jennifer-wedding/";

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext(devices["iPhone 14"]);
  const page = await ctx.newPage();

  const consoleLines = [];
  page.on("console", (msg) => consoleLines.push(`[${msg.type()}] ${msg.text()}`));
  page.on("pageerror", (err) => consoleLines.push(`[pageerror] ${err.message}`));

  const failedRequests = [];
  page.on("requestfailed", (req) =>
    failedRequests.push(`${req.method()} ${req.url()} → ${req.failure()?.errorText}`)
  );
  const responses = [];
  page.on("response", (res) => {
    const url = res.url();
    if (/\.(mp4|jpg|png|css|js)/.test(url)) {
      responses.push(`${res.status()}  ${url}`);
    }
  });

  await page.goto(URL, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForTimeout(3000);

  // Inspect the hero video element
  const videoState = await page.evaluate(() => {
    const v = document.querySelector("video");
    if (!v) return { found: false };
    return {
      found: true,
      src: v.src,
      currentSrc: v.currentSrc,
      poster: v.poster,
      readyState: v.readyState,
      paused: v.paused,
      duration: v.duration,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      networkState: v.networkState,
      error: v.error ? { code: v.error.code, message: v.error.message } : null,
      computedDisplay: getComputedStyle(v).display,
      computedOpacity: getComputedStyle(v).opacity,
      computedVisibility: getComputedStyle(v).visibility,
      offsetWidth: v.offsetWidth,
      offsetHeight: v.offsetHeight,
    };
  });

  console.log("=== VIDEO STATE ===");
  console.log(JSON.stringify(videoState, null, 2));
  console.log("\n=== CONSOLE ===");
  consoleLines.slice(0, 30).forEach((l) => console.log(l));
  console.log("\n=== FAILED REQUESTS ===");
  failedRequests.slice(0, 20).forEach((l) => console.log(l));
  console.log("\n=== KEY RESPONSES ===");
  responses.filter((r) => /mp4|hero/.test(r)).slice(0, 10).forEach((l) => console.log(l));

  await page.screenshot({ path: "scripts/screenshots/prod-debug-mobile.png", fullPage: false });

  await browser.close();
})();
