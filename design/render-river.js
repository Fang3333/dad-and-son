/* 静态图版：因果长河（Strata Ledger）。独立设计产物，不被生产页面引用。
   运行：node design/render-river.js  → design/river-plate.png (2400x1350)
   依赖：puppeteer-core + 本机 Edge（仅开发时使用）。 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(__dirname, "river-plate.png");

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

const DRAW = function (scenario) {
  const chain = window.WRM_CHAIN;
  const W = 2400, H = 1350, M = 120;
  const SERIF = '"Source Han Serif SC","Noto Serif CJK SC","Songti SC",SimSun,serif';
  const MONO = '"IBM Plex Mono","JetBrains Mono",Consolas,monospace';
  const C = { paper: "#F4F1E9", ink: "#141414", muted: "#5A564C", rule: "#B9B2A2", accent: "#A6231A" };
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");
  const changed = new Set(chain.changedNodes(scenario.ruleId, scenario.params));

  ctx.fillStyle = C.paper;
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = "alphabetic";

  /* 纸面颗粒与纤维 */
  let seed = 20261118;
  const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  ctx.fillStyle = C.ink;
  for (let i = 0; i < 14000; i++) {
    ctx.globalAlpha = 0.02 + rnd() * 0.03;
    const r = 0.4 + rnd() * 0.9;
    ctx.beginPath(); ctx.arc(rnd() * W, rnd() * H, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = C.muted;
  ctx.lineWidth = 0.6;
  for (let i = 0; i < 70; i++) {
    ctx.globalAlpha = 0.03;
    const x = rnd() * W, y = rnd() * H, len = 30 + rnd() * 140;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + len, y + (rnd() - 0.5) * 2); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  const line = (y, w, color, x0, x1) => {
    ctx.strokeStyle = color || C.ink; ctx.lineWidth = w;
    ctx.beginPath(); ctx.moveTo(x0 === undefined ? M : x0, y); ctx.lineTo(x1 === undefined ? W - M : x1, y); ctx.stroke();
  };

  /* 顶端双线与图版名 */
  line(96, 3); line(104, 1);
  ctx.textAlign = "left"; ctx.fillStyle = C.ink;
  ctx.font = "700 40px " + SERIF;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "6px";
  ctx.fillText("因果长河", M, 162);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  ctx.font = "13px " + MONO; ctx.fillStyle = C.muted;
  ctx.fillText("5 时代 / 13 节点 / 12 边 / 3 支线", M, 190);
  ctx.textAlign = "right";
  ctx.fillText("CHAIN PLATE 01 · " + scenario.ruleId, W - M, 162);
  ctx.fillText(scenario.versionLabel, W - M, 190);
  ctx.textAlign = "left";

  /* 五道地层 */
  const bandTop = 300, bandBottom = 1060, riverY = 680;
  const innerW = W - M * 2;
  const counts = chain.eras.map((e) => chain.nodes.filter((n) => n.era === e.id).length);
  const total = counts.reduce((a, b) => a + b, 0);
  const cols = [];
  let acc = M;
  chain.eras.forEach((e, i) => {
    const w = innerW * counts[i] / total;
    cols.push({ era: e, x: acc, w, k: counts[i] });
    acc += w;
  });

  cols.forEach((c) => {
    ctx.globalAlpha = 0.5; ctx.fillStyle = c.era.band;
    ctx.fillRect(c.x, bandTop, c.w, bandBottom - bandTop);
    ctx.globalAlpha = 1;
    /* 地层内的账簿横线 */
    ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.045; ctx.lineWidth = 1;
    for (let y = bandTop + 44; y < bandBottom; y += 44) {
      ctx.beginPath(); ctx.moveTo(c.x + 1, y); ctx.lineTo(c.x + c.w - 1, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(c.x, bandTop); ctx.lineTo(c.x, bandBottom); ctx.stroke();
    /* 地层顶端刻度 */
    ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.25;
    for (let x = c.x + 10; x < c.x + c.w - 4; x += 20) {
      ctx.beginPath(); ctx.moveTo(x, bandTop); ctx.lineTo(x, bandTop + (x % 100 < 20 ? 10 : 5)); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center"; ctx.fillStyle = C.ink;
    ctx.font = "700 26px " + SERIF;
    ctx.fillText(c.era.name, c.x + c.w / 2, 254);
    ctx.font = "13px " + MONO; ctx.fillStyle = C.muted;
    ctx.fillText(c.era.span, c.x + c.w / 2, 280);
  });
  ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(W - M, bandTop); ctx.lineTo(W - M, bandBottom); ctx.stroke();
  ctx.textAlign = "left";

  /* 主墨线 */
  line(riverY, 2, C.ink);

  /* 十三个登记记号 */
  const pos = {};
  let order = 0;
  cols.forEach((c) => {
    const ns = chain.nodes.filter((n) => n.era === c.era.id).sort((a, b) => a.order - b.order);
    ns.forEach((n, i) => {
      const x = c.x + c.w * (i + 0.5) / c.k;
      pos[n.id] = x;
      const isChanged = changed.has(n.id);
      const above = order % 2 === 0;
      const tY = above ? bandTop + 130 : bandBottom - 130;
      const yY = above ? bandTop + 102 : bandBottom - 102;
      const oY = above ? bandTop + 76 : bandBottom - 76;
      ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, above ? tY + 16 : riverY + 16);
      ctx.lineTo(x, above ? riverY - 16 : tY - 16);
      ctx.stroke();

      if (isChanged) {
        ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, riverY, 15, 0, Math.PI * 2); ctx.stroke();
        ctx.fillStyle = C.accent;
        ctx.beginPath(); ctx.arc(x, riverY, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(x + 20, riverY - 6, 12, 12);
      } else {
        ctx.fillStyle = C.ink;
        ctx.beginPath(); ctx.arc(x, riverY, 8, 0, Math.PI * 2); ctx.fill();
      }

      ctx.textAlign = "center";
      ctx.fillStyle = isChanged ? C.accent : C.ink;
      ctx.font = "700 24px " + SERIF;
      if (ctx.measureText(n.title).width > 168) ctx.font = "700 20px " + SERIF;
      ctx.fillText(n.title, x, tY);
      ctx.fillStyle = C.muted; ctx.font = "13px " + MONO;
      ctx.fillText(n.yearLabel, x, yY);
      ctx.fillStyle = isChanged ? C.accent : C.rule;
      ctx.font = "12px " + MONO;
      ctx.fillText(String(n.order).padStart(2, "0") + (isChanged ? " · 改写" : ""), x, oY);
      order++;
    });
  });
  ctx.textAlign = "left";

  /* 墨线上的量度刻度 */
  const xs = Object.values(pos);
  ctx.strokeStyle = C.ink; ctx.globalAlpha = 0.3; ctx.lineWidth = 1;
  for (let x = M + 10; x < W - M - 4; x += 20) {
    if (xs.some((nx) => Math.abs(nx - x) < 26)) continue;
    ctx.beginPath(); ctx.moveTo(x, riverY - 4); ctx.lineTo(x, riverY + 4); ctx.stroke();
  }
  ctx.globalAlpha = 1;

  /* 十二条边的强度刻度 */
  const barBase = 1040;
  ctx.strokeStyle = C.rule; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(M, barBase); ctx.lineTo(W - M, barBase); ctx.stroke();
  chain.edges.forEach((e) => {
    const x = (pos[e.from] + pos[e.to]) / 2;
    const h = Math.round(e.strength * 50);
    ctx.fillStyle = C.ink;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(x - 11, barBase - h, 22, h);
    ctx.globalAlpha = 1;
    ctx.fillRect(x - 15, barBase - h - 3, 30, 2);
  });
  ctx.fillStyle = C.muted; ctx.font = "12px " + MONO;
  ctx.fillText("边强度", M, barBase + 22);

  /* 底部登记区：图例 / 方章 / 三条支线 */
  line(1112, 1, C.rule);
  const legendY = 1176;
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(M + 10, legendY - 5, 8, 0, Math.PI * 2); ctx.fill();
  ctx.font = "14px " + MONO; ctx.fillStyle = C.muted;
  ctx.fillText("登记", M + 30, legendY);
  ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(M + 110, legendY - 5, 13, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.accent;
  ctx.beginPath(); ctx.arc(M + 110, legendY - 5, 5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = C.muted;
  ctx.fillText("改写", M + 134, legendY);

  ctx.save();
  ctx.translate(M + 330, legendY - 6);
  ctx.rotate(-6 * Math.PI / 180);
  ctx.strokeStyle = C.accent; ctx.lineWidth = 3;
  ctx.strokeRect(-128, -30, 256, 60);
  ctx.fillStyle = C.accent; ctx.font = "700 21px " + SERIF; ctx.textAlign = "center";
  ctx.fillText("情景推演 不是史实", 0, 8);
  ctx.restore();
  ctx.textAlign = "left";

  const railY = 1140, markY = 1176;
  const aiX = pos.ai;
  ctx.strokeStyle = C.accent; ctx.lineWidth = 1.5; ctx.setLineDash([7, 6]);
  ctx.beginPath(); ctx.moveTo(aiX, riverY + 18); ctx.lineTo(aiX, railY); ctx.stroke();
  const bx = [M + 1080, M + 1380, M + 1680];
  ctx.beginPath(); ctx.moveTo(bx[0], railY); ctx.lineTo(aiX, railY); ctx.stroke();
  bx.forEach((x) => { ctx.beginPath(); ctx.moveTo(x, railY); ctx.lineTo(x, markY - 12); ctx.stroke(); });
  ctx.setLineDash([]);
  chain.hotBranches.forEach((b, i) => {
    const x = bx[i];
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
    ctx.strokeRect(x - 9, markY - 9, 18, 18);
    ctx.fillStyle = C.paper; ctx.fillRect(x - 6, markY - 6, 12, 12);
    ctx.fillStyle = C.ink; ctx.font = "15px " + SERIF; ctx.textAlign = "center";
    ctx.fillText(b.title, x, markY + 34);
    ctx.fillStyle = C.muted; ctx.font = "11px " + MONO;
    ctx.fillText("支线 0" + (i + 1), x, markY + 56);
  });
  ctx.textAlign = "left";

  /* 底端双线与版权行 */
  line(1256, 3); line(1264, 1);
  ctx.fillStyle = C.muted; ctx.font = "13px " + MONO;
  ctx.fillText(chain.disclaimer, M, 1300);
  ctx.textAlign = "right";
  ctx.fillText("STRATA LEDGER · 2400 × 1350 · " + scenario.plateDate, W - M, 1300);
  ctx.textAlign = "left";

  return canvas.toDataURL("image/png");
};

(async () => {
  const puppeteer = resolvePuppeteer();
  const browser = await puppeteer.launch({
    executablePath: resolveEdge(),
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files", "--force-prefers-reduced-motion", "--font-render-hinting=none"]
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 2400, height: 1350, deviceScaleFactor: 1 });
    await page.goto("file:///" + path.join(ROOT, "index.html").replace(/\\/g, "/"), { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);
    const scenario = {
      ruleId: "four-hour",
      params: { hourlyPay: true, secondJob: false, enforceOff: true, productivity: true },
      versionLabel: "第 3 版 · v0.3",
      plateDate: "2026-11-18"
    };
    const dataUrl = await page.evaluate(DRAW, scenario);
    fs.writeFileSync(OUT, Buffer.from(dataUrl.split(",")[1], "base64"));
    console.log("written:", OUT, fs.statSync(OUT).size, "bytes");
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });