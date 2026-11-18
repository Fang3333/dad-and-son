/* 静态图版：号外海报（生产导出器的定格样张）。独立设计产物，不被生产页面引用。
   运行：node design/render-poster.js → design/poster-plate.png (1080x1440)
   依赖：puppeteer-core + 本机 Edge（仅开发时使用）。 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(__dirname, "poster-plate.png");

function resolvePuppeteer() {
  const candidates = [
    process.env.PUPPETEER_CORE,
    "puppeteer-core",
    "C:/Users/Administrator/AppData/Local/Temp/qtest/node_modules/puppeteer-core"
  ].filter(Boolean);
  for (const c of candidates) {
    try { return require(c); } catch (e) { /* 试下一个 */ }
  }
  throw new Error("找不到 puppeteer-core，设 PUPPETEER_CORE 环境变量");
}

function resolveEdge() {
  if (process.env.EDGE_PATH && fs.existsSync(process.env.EDGE_PATH)) return process.env.EDGE_PATH;
  const roots = [
    "C:/Program Files (x86)/Microsoft/EdgeCore",
    "C:/Program Files/Microsoft/EdgeCore",
    "C:/Program Files (x86)/Microsoft/Edge/Application",
    "C:/Program Files/Microsoft/Edge/Application"
  ];
  for (const r of roots) {
    if (!fs.existsSync(r)) continue;
    const direct = path.join(r, "msedge.exe");
    if (fs.existsSync(direct)) return direct;
    for (const d of fs.readdirSync(r)) {
      const p = path.join(r, d, "msedge.exe");
      if (fs.existsSync(p)) return p;
    }
  }
  throw new Error("找不到 Edge，设 EDGE_PATH 环境变量");
}

(async () => {
  const appVersion = (fs.readFileSync(path.join(ROOT, "app.js"), "utf8").match(/APP_VERSION\s*=\s*"([^"]+)"/) || [])[1] || "1.4.0";
  const puppeteer = resolvePuppeteer();
  const browser = await puppeteer.launch({
    executablePath: resolveEdge(),
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files", "--force-prefers-reduced-motion", "--font-render-hinting=none"]
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1440, deviceScaleFactor: 1 });
    await page.goto("file:///" + path.join(ROOT, "index.html").replace(/\\/g, "/"), { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    const dataUrl = await page.evaluate(async (info) => {
      const data = window.WRM_DATA;
      const rule = data.rules.find((r) => r.id === info.ruleId);
      const result = window.WRM_ENGINE.evaluate(info.ruleId, info.params);
      const canvas = await window.WRM_POSTER.build(result, {
        rule, meta: data.meta, appVersion: info.appVersion,
        world: { serial: "#B-003", label: "第 3 版", n: 3 }
      });
      return canvas.toDataURL("image/png");
    }, {
      ruleId: "four-hour",
      params: { hourlyPay: true, secondJob: false, enforceOff: true, productivity: true },
      appVersion
    });
    fs.writeFileSync(OUT, Buffer.from(dataUrl.split(",")[1], "base64"));
    console.log("written:", OUT, fs.statSync(OUT).size, "bytes");
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });