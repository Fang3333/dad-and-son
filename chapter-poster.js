(function (global) {
  "use strict";

  const PAPER = "#F4F1E9", INK = "#141414", RED = "#A6231A", LINE = "#B9B2A2";
  let lastFocus = null, canvas = null, filename = "world-line.png", backgroundState = [];
  function isOpen() { return !document.getElementById("posterOverlay").hidden; }
  function lines(ctx, text, width) {
    const out = [];
    let line = "";
    for (const char of String(text)) {
      if (char === "\n") { out.push(line); line = ""; continue; }
      if (line && ctx.measureText(line + char).width > width) { out.push(line); line = char; }
      else line += char;
    }
    if (line) out.push(line);
    return out;
  }
  function paragraph(ctx, text, x, y, width, lineHeight, maxLines) {
    const parts = lines(ctx, text, width);
    parts.slice(0, maxLines).forEach((line, i) => {
      if (i === maxLines - 1 && parts.length > maxLines) {
        while (line && ctx.measureText(line + "…").width > width) line = line.slice(0, -1);
        line += "…";
      }
      ctx.fillText(line, x, y + i * lineHeight);
    });
  }
  function font(ctx, size, bold, mono) {
    ctx.font = (bold ? "700 " : "") + size + "px " + (mono ? "Consolas, 'Microsoft YaHei', monospace" : "SimSun, 'Songti SC', serif");
  }
  function build(run) {
    const c = document.createElement("canvas");
    c.width = 1080;
    c.height = 1440;
    c.setAttribute("aria-label", "世界线 " + run.runId + " 的八版文字海报");
    c.setAttribute("role", "img");
    const ctx = c.getContext("2d");
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.textBaseline = "top";
    ctx.fillStyle = RED;
    font(ctx, 24, false, true);
    ctx.fillText("世界线 " + run.runId + " / v" + run.appVersion, 64, 48);
    ctx.fillStyle = INK;
    font(ctx, 70, true);
    ctx.fillText("世界规则修改器", 64, 98);
    font(ctx, 36, true);
    paragraph(ctx, run.ruleName, 64, 184, 952, 42, 1);
    font(ctx, 19, false, true);
    paragraph(ctx, run.assumptions.join(" · "), 64, 240, 952, 26, 2);
    paragraph(ctx, "叠加机制：" + (run.mechanisms.join(" / ") || "无"), 64, 292, 952, 25, 1);
    paragraph(ctx, run.parameters.join(" · "), 64, 323, 952, 24, 2);
    ctx.fillRect(64, 382, 952, 3);

    global.WRM_PRESETS.ERAS.forEach((era, index) => {
      const y = 404 + index * 84;
      const ch = run.chapters.find((chapter) => chapter.n === era.n);
      ctx.fillStyle = RED;
      font(ctx, 22, true, true);
      ctx.fillText(String(era.n).padStart(2, "0"), 64, y);
      ctx.fillStyle = INK;
      font(ctx, 24, true);
      const label = era.n === 8 ? "后人类" : era.name;
      ctx.fillText(label, 106, y);
      if (era.n === 8) { font(ctx, 17, false, true); ctx.fillText("2200", 108, y + 31); }
      font(ctx, 22, false);
      const world = ch ? ch.events.filter((e) => e.ev.track === "world") : [];
      const people = ch ? ch.events.filter((e) => e.ev.track === "personal") : [];
      paragraph(ctx, "世界：" + (ch ? world[0].view.alternate : "未干预，原有进程照旧"), 272, y, 744, 25, 1);
      font(ctx, 20, false);
      paragraph(ctx, "你：" + (ch ? people.map((e) => e.view.alternate).join("；") : "未干预，不编写个人经历"), 272, y + 29, 744, 24, 2);
      ctx.fillStyle = LINE;
      ctx.fillRect(64, y + 78, 952, 1);
    });

    const last = run.chapters[run.chapters.length - 1];
    const pick = last.events.find((e) => e.ev.track === "world");
    ctx.fillStyle = RED;
    font(ctx, 20, true, true);
    ctx.fillText("最离谱改写", 64, 1096);
    ctx.fillStyle = INK;
    font(ctx, 27, true);
    paragraph(ctx, pick.ev.title + "：" + pick.ev.baseline + " → " + pick.view.alternate, 64, 1126, 952, 32, 2);
    ctx.fillStyle = RED;
    font(ctx, 20, true, true);
    ctx.fillText("你的八版一生 / 不同年代的个人切片", 64, 1202);
    ctx.fillStyle = INK;
    font(ctx, 21, false);
    const montage = run.chapters.map((ch) => ch.events.find((e) => e.ev.track === "personal").view.alternate).join("；");
    paragraph(ctx, montage, 64, 1236, 952, 27, 4);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.strokeRect(814, 1360, 202, 42);
    ctx.fillStyle = RED;
    font(ctx, 22, true);
    ctx.fillText("世界线已改写", 836, 1370);
    ctx.fillStyle = INK;
    font(ctx, 18, false, true);
    ctx.fillText("虚构推演，勿对号入座 · 纯文字 / 离线生成", 64, 1372);
    return c;
  }
  function open(run) {
    lastFocus = document.activeElement;
    backgroundState = Array.from(document.querySelectorAll("main, header.masthead, footer")).map((node) => {
      const wasInert = node.inert;
      node.inert = true;
      return { node, wasInert };
    });
    const preview = document.getElementById("posterPreview");
    preview.textContent = "";
    canvas = build(run);
    preview.appendChild(canvas);
    filename = "world-line-" + run.runId + ".png";
    document.getElementById("posterMsg").textContent = "1080 × 1440 · PNG · 只含本次世界线，不含 API 设置";
    document.getElementById("posterOverlay").hidden = false;
    document.getElementById("posterClose").focus();
  }
  function close() {
    if (!isOpen()) return;
    document.getElementById("posterOverlay").hidden = true;
    backgroundState.forEach((entry) => { entry.node.inert = entry.wasInert; });
    backgroundState = [];
    if (lastFocus && lastFocus.isConnected) lastFocus.focus();
    lastFocus = null;
  }
  function download() {
    if (!canvas) return;
    canvas.toBlob((blob) => {
      if (!blob) { document.getElementById("posterMsg").textContent = "导出失败，请重新打开海报"; return; }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      document.getElementById("posterMsg").textContent = "PNG 已交给浏览器下载";
    }, "image/png");
  }
  document.getElementById("posterClose").onclick = close;
  document.getElementById("posterDownload").onclick = download;
  document.getElementById("posterOverlay").addEventListener("click", (e) => { if (e.target.dataset.close) close(); });
  document.addEventListener("keydown", (e) => {
    if (!isOpen()) return;
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
    if (e.key === "Tab") {
      const first = document.getElementById("posterClose"), last = document.getElementById("posterDownload");
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  global.WRM_CHAPTER_POSTER = { open, close, isOpen, build };
})(typeof window !== "undefined" ? window : globalThis);
