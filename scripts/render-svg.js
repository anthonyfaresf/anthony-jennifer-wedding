const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

(async () => {
  const svgPath = process.argv[2];
  const outPath = process.argv[3];
  const widthPx = parseInt(process.argv[4] || "2400", 10);

  const svg = fs.readFileSync(svgPath, "utf8");
  // viewBox="0 0 297.75 419.249996" → aspect 297.75/419.25 ≈ 0.71
  const aspect = 297.75 / 419.249996;
  const heightPx = Math.round(widthPx / aspect);

  const html = `<!doctype html><html><head><style>
    html,body{margin:0;padding:0;background:transparent}
    svg{display:block;width:${widthPx}px;height:${heightPx}px}
  </style></head><body>${svg}</body></html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: widthPx, height: heightPx } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(300);
  const buf = await page.screenshot({ omitBackground: true, type: "png", fullPage: false });
  fs.writeFileSync(outPath, buf);
  await browser.close();
  console.log(`Rendered ${widthPx}x${heightPx} -> ${outPath}`);
})();
