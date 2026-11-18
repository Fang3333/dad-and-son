/* 世界线海报：Canvas 1080x1440，系统宋体/等宽，先换行再绘制，无外部图片。 */
(function (global) {
  "use strict";

  const W = 1080;
  const H = 1440;
  const M = 72;
  const SERIF = '"Source Han Serif SC","Noto Serif CJK SC","Songti SC",SimSun,serif';
  const MONO = '"IBM Plex Mono","JetBrains Mono",Consolas,monospace';
  const C = {
    paper: "#F4F1E9", paper2: "#ECE6D8", ink: "#141414",
    muted: "#5A564C", rule: "#B9B2A2", accent: "#A6231A",
    success: "#3F5B3A", warn: "#8A5A3B"
  };
  const DIM_LABELS = { education: "教育", economy: "经济", society: "社会", individual: "个人" };
  const CERT_COLOR = { "推算": C.success, "假设": C.warn, "不确定": C.muted };

  function wrapLines(ctx, text, maxW, maxLines) {
    const lines = [];
    let line = "";
    for (const ch of String(text)) {
      if (ctx.measureText(line + ch).width > maxW && line) {
        lines.push(line);
        line = ch;
        if (lines.length === maxLines) break;
      } else {
        line += ch;
      }
    }
    if (lines.length < maxLines && line) lines.push(line);
    if (lines.length === maxLines) {
      const consumed = lines.join("").length;
      if (consumed < String(text).length) {
        let last = lines[maxLines - 1];
        while (ctx.measureText(last + "…").width > maxW && last.length) last = last.slice(0, -1);
        lines[maxLines - 1] = last + "…";
      }
    }
    return lines;
  }

  function drawWrap(ctx, text, x, y, maxW, lineH, maxLines) {
    const lines = wrapLines(ctx, text, maxW, maxLines);
    lines.forEach((line, i) => ctx.fillText(line, x, y + i * lineH));
    return y + lines.length * lineH;
  }

  function hline(ctx, y, width, color) {
    ctx.strokeStyle = color || C.ink;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(M, y);
    ctx.lineTo(W - M, y);
    ctx.stroke();
  }

  function pickTimeline(events) {
    const sorted = events.slice().sort((a, b) => a.year - b.year);
    const n = sorted.length;
    const idx = [0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1];
    const seen = [];
    for (const i of idx) if (!seen.includes(i)) seen.push(i);
    return seen.map((i) => sorted[i]);
  }

  async function build(result, ctxInfo) {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    const rule = ctxInfo.rule;
    const meta = ctxInfo.meta;
    const engine = global.WRM_ENGINE;

    ctx.fillStyle = C.paper;
    ctx.fillRect(0, 0, W, H);
    ctx.textBaseline = "alphabetic";

    hline(ctx, 56, 3);
    hline(ctx, 64, 1);
    ctx.textAlign = "center";
    ctx.fillStyle = C.ink;
    ctx.font = "700 46px " + SERIF;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "8px";
    ctx.fillText(meta.title, W / 2, 122);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.fillStyle = C.muted;
    ctx.font = "16px " + MONO;
    ctx.fillText("World Rule Modifier · 社会规则实验室", W / 2, 152);
    ctx.fillText("号外 · 第 014 期 · 情景推演，不是预测", W / 2, 178);
    ctx.textAlign = "left";
    hline(ctx, 200, 3);
    hline(ctx, 207, 1);

    let y = 248;
    ctx.fillStyle = C.accent;
    ctx.font = "18px " + MONO;
    ctx.fillText("规则实验 / " + rule.category, M, y);
    y += 76;
    ctx.fillStyle = C.ink;
    ctx.font = "700 76px " + SERIF;
    const titleLines = wrapLines(ctx, result.report.title, W - M * 2, 2);
    titleLines.forEach((line, i) => ctx.fillText(line, M, y + i * 88));
    y += (titleLines.length - 1) * 88 + 34;
    ctx.fillStyle = C.muted;
    ctx.font = "17px " + MONO;
    ctx.fillText("规则：" + rule.title, M, y);
    y += 26;
    ctx.font = "15px " + MONO;
    const paramsText = "参数：" + rule.params.map((p) => p.label + (result.params[p.id] ? "开" : "关")).join(" / ");
    y = drawWrap(ctx, paramsText, M, y, W - M * 2, 24, 2);
    y += 16;
    hline(ctx, y, 3);
    y += 34;

    const metricKeys = engine.METRICS;
    const colW = (W - M * 2) / 4;
    metricKeys.forEach((m, i) => {
      const x = M + i * colW;
      ctx.fillStyle = C.muted;
      ctx.font = "15px " + MONO;
      ctx.fillText(engine.METRIC_LABELS[m], x, y);
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y + 12, colW - 30, 12);
      ctx.fillStyle = C.ink;
      ctx.fillRect(x + 1, y + 13, (colW - 32) * result.metrics[m] / 100, 10);
      ctx.font = "700 26px " + MONO;
      ctx.fillText(String(result.metrics[m]), x, y + 62);
    });
    y += 84;
    hline(ctx, y, 1, C.rule);
    y += 34;

    const cellW = (W - M * 2) / 2;
    Object.keys(DIM_LABELS).forEach((key, i) => {
      const cx = M + (i % 2) * cellW;
      const cy = y + Math.floor(i / 2) * 150;
      const item = result.dimensions[key][0];
      ctx.fillStyle = C.ink;
      ctx.font = "700 22px " + SERIF;
      ctx.fillText(DIM_LABELS[key], cx, cy);
      ctx.fillStyle = CERT_COLOR[item.certainty] || C.muted;
      ctx.font = "12px " + MONO;
      ctx.fillText(item.certainty, cx + cellW - 60, cy);
      ctx.fillStyle = C.ink;
      ctx.font = "700 17px " + SERIF;
      ctx.fillText(item.title, cx, cy + 26);
      ctx.fillStyle = C.muted;
      ctx.font = "15px " + SERIF;
      drawWrap(ctx, item.change, cx, cy + 50, cellW - 40, 24, 2);
    });
    y += 300;
    hline(ctx, y, 1, C.rule);
    y += 30;

    const tl = pickTimeline(result.events);
    const tW = (W - M * 2) / tl.length;
    tl.forEach((e, i) => {
      const x = M + i * tW;
      ctx.fillStyle = C.accent;
      ctx.font = "700 15px " + MONO;
      ctx.fillText("第 " + e.year + " 年", x, y);
      ctx.fillStyle = C.ink;
      ctx.font = "700 16px " + SERIF;
      drawWrap(ctx, e.title, x, y + 24, tW - 24, 22, 2);
    });
    y += 82;
    hline(ctx, y, 1, C.rule);
    y += 30;

    result.unintended.forEach((u, i) => {
      ctx.fillStyle = C.accent;
      ctx.font = "15px " + MONO;
      ctx.fillText("意外 0" + (i + 1), M, y);
      ctx.fillStyle = C.ink;
      ctx.font = "700 19px " + SERIF;
      ctx.fillText(u.title, M + 84, y);
      ctx.fillStyle = C.muted;
      ctx.font = "15px " + SERIF;
      const next = drawWrap(ctx, u.description, M + 84, y + 24, W - M * 2 - 84, 24, 2);
      y = next + 14;
    });
    y += 6;

    ctx.fillStyle = C.accent;
    ctx.fillRect(M, y - 20, 4, 52);
    ctx.fillStyle = C.ink;
    ctx.font = "700 20px " + SERIF;
    const quoteEnd = drawWrap(ctx, result.report.quote, M + 20, y, W - M * 2 - 260, 30, 2);

    ctx.save();
    ctx.translate(W - M - 120, y - 10);
    ctx.rotate(-8 * Math.PI / 180);
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 4;
    ctx.strokeRect(-112, -30, 224, 60);
    ctx.fillStyle = C.accent;
    ctx.font = "700 22px " + SERIF;
    ctx.textAlign = "center";
    ctx.fillText("情景推演 不是预测", 0, 8);
    ctx.restore();
    ctx.textAlign = "left";
    y = Math.max(quoteEnd, y + 40) + 20;

    hline(ctx, 1332, 3);
    ctx.fillStyle = C.ink;
    ctx.font = "700 19px " + SERIF;
    ctx.fillText(meta.disclaimer, M, 1364);
    ctx.fillStyle = C.muted;
    ctx.font = "14px " + MONO;
    ctx.fillText("v" + meta.version + " · " + meta.updated + " · fang3333.github.io/dad-and-son", M, 1394);
    return canvas;
  }

  async function download(result, ctxInfo) {
    const canvas = await build(result, ctxInfo);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("海报导出失败：canvas.toBlob 返回空");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "世界线-" + result.presetKey + "014.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
    return a.download;
  }

  global.WRM_POSTER = { build, download, WIDTH: W, HEIGHT: H };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_POSTER;
})(typeof window !== "undefined" ? window : globalThis);