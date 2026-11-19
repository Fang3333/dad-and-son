(function (global) {
  "use strict";

  const PAPER = "#F4F1E9", INK = "#141414", RED = "#A6231A", LINE = "#B9B2A2";
  let lastFocus = null, canvas = null, filename = "world-line.png", backgroundState = [];
  function isOpen() { const overlay = document.getElementById("posterOverlay"); return !!overlay && !overlay.hidden; }
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
  function font(ctx, size, bold, mono) {
    ctx.font = (bold ? "700 " : "") + size + "px " + (mono ? "Consolas, 'Microsoft YaHei', monospace" : "SimSun, 'Songti SC', serif");
  }
  /* 所有区块先测量再落字；缩字号而不裁掉规则、路径或时代。 */
  function textBox(ctx, text, x, y, width, height, size, bold, mono) {
    let parts, lineHeight;
    for (;;) {
      font(ctx, size, bold, mono);
      parts = lines(ctx, text, width);
      lineHeight = Math.ceil(size * 1.25);
      if (parts.length * lineHeight <= height && parts.every((part) => ctx.measureText(part).width <= width)) break;
      if (size <= 1) throw new Error("海报文字过长，无法在画布内排版");
      size = Math.max(1, size - 0.5);
    }
    parts.forEach((part, i) => ctx.fillText(part, x, y + i * lineHeight));
  }
  function chips(ctx, names, x, y, width, height) {
    let size = 20, placed;
    for (;;) {
      font(ctx, size, true);
      let left = 0, top = 0, rowHeight = 0;
      placed = names.map((name, i) => {
        const parts = lines(ctx, String(i + 1).padStart(2, "0") + " " + name, width - 16);
        const w = Math.min(width, Math.max(...parts.map((part) => ctx.measureText(part).width)) + 16);
        const h = parts.length * Math.ceil(size * 1.25) + 8;
        if (left && left + w > width) { left = 0; top += rowHeight + 4; rowHeight = 0; }
        const chip = { parts, x: left, y: top, w, h };
        left += w + 6;
        rowHeight = Math.max(rowHeight, h);
        return chip;
      });
      if (!placed.length || Math.max(...placed.map((item) => item.y + item.h)) <= height) break;
      if (size <= 1) throw new Error("规则名称过长，无法在海报内排版");
      size = Math.max(1, size - 0.5);
    }
    ctx.strokeStyle = LINE;
    ctx.lineWidth = 1;
    placed.forEach((item) => {
      ctx.strokeRect(x + item.x, y + item.y, item.w, item.h);
      item.parts.forEach((part, i) => ctx.fillText(part, x + item.x + 8, y + item.y + 4 + i * Math.ceil(size * 1.25)));
    });
  }
  function joined(items, separator) { return Array.isArray(items) ? items.join(separator) : String(items || ""); }
  function cards(items, track) { return items.filter((item) => item.ev && item.ev.track === track); }
  function title(item) { return item && item.ev ? String(item.ev.title || "") : ""; }
  function newsSummary(edition, track) {
    const visible = cards(edition.visible, track).filter((item) => item.view && item.view.changed === true);
    const carried = cards(edition.carried.map((entry) => entry.item), track).length;
    const dormant = cards(edition.dormant, track).length;
    const statuses = [carried ? "沿用" + carried + "条" : "", dormant ? "休眠" + dormant + "组" : ""].filter(Boolean);
    const headlines = visible.map(title).filter(Boolean).join("；");
    return (headlines || (track === "world" ? "无新增世界新闻" : "无新增生活短讯")) + (statuses.length ? " · " + statuses.join("／") : "");
  }
  function build(run) {
    const P = global.WRM_PRESETS, eras = P.ERAS;
    const recipe = run.recipe || {};
    const chapters = run.chapters || [];
    const runId = run.runId || run.id || "未编号";
    const c = document.createElement("canvas");
    c.width = 1080;
    c.height = 1440;
    c.setAttribute("aria-label", "世界线 " + runId + " 的十版文字海报");
    c.setAttribute("role", "img");
    const ctx = c.getContext("2d");
    if (!ctx) throw new Error("浏览器不支持文字海报画布");
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.textBaseline = "top";
    ctx.fillStyle = RED;
    textBox(ctx, "世界线 " + runId + " / v" + (run.appVersion || "2.6.0") + (run.parentId ? " / 源自 " + run.parentId : ""), 64, 40, 952, 30, 21, false, true);
    ctx.fillStyle = INK;
    textBox(ctx, "世界规则修改器", 64, 82, 952, 78, 62, true);
    textBox(ctx, run.ruleName || (recipe.rules || []).length + "条规则同时生效", 64, 163, 952, 30, 24, true);
    const names = Array.isArray(run.ruleNames) && run.ruleNames.length ? run.ruleNames : (recipe.rules || []);
    chips(ctx, names, 64, 201, 952, 151);
    textBox(ctx, "世界假设：" + (joined(run.assumptions, " · ") || "未提供"), 64, 364, 952, 40, 18, false, true);
    textBox(ctx, "叠加机制：" + (joined(run.mechanisms, " / ") || "无"), 64, 410, 952, 40, 18, false, true);
    textBox(ctx, "执行参数：" + (joined(run.parameters, " · ") || "未提供"), 64, 456, 952, 40, 18, false, true);
    const rawPath = run.path || recipe.branchPath || [];
    const path = Array.isArray(rawPath) ? rawPath.map((p) => typeof p === "string" ? p : [p.id, p.label || p.name].filter(Boolean).join(" ")).join(" → ") : String(rawPath);
    ctx.fillStyle = RED;
    textBox(ctx, "分叉路径：" + (path || "尚未选择"), 64, 502, 952, 40, 18, true, true);
    ctx.fillStyle = INK;
    ctx.fillRect(64, 551, 952, 2);

    // 分叉的 intervention 是重写起点；未干预区间仍按 recipe 的最初起点判断。
    const startId = recipe.startEra || run.start || (run.intervention && run.intervention.era);
    const start = eras.find((e) => e.id === startId || e.n === startId);
    const first = start ? start.n : (chapters.length ? Math.min(...chapters.map((ch) => ch.n)) : 1);
    const rowData = eras.map((era) => {
      const untouched = era.n < first, ch = chapters.find((chapter) => chapter.n === era.n);
      return { era, untouched, edition: !untouched && ch ? P.edition(run, era.n) : null };
    });
    rowData.forEach(({ era, untouched, edition }, index) => {
      const y = 563 + index * 48;
      ctx.fillStyle = RED;
      textBox(ctx, String(era.n).padStart(2, "0"), 64, y + 8, 34, 28, 20, true, true);
      ctx.fillStyle = INK;
      textBox(ctx, era.name, 106, y + 8, 156, 28, 20, true);
      const worldText = untouched ? "未干预，原有进程照旧" : edition ? newsSummary(edition, "world") : "本版未推演";
      const personalText = untouched ? "未干预，不编写生活短讯" : edition ? newsSummary(edition, "personal") : "本版未推演";
      textBox(ctx, "世界：" + worldText, 280, y, 736, 22, 17);
      textBox(ctx, "生活：" + personalText, 280, y + 24, 736, 22, 17);
      ctx.fillStyle = LINE;
      ctx.fillRect(64, y + 47, 952, 1);
    });

    const candidates = rowData.filter((row) => row.edition).flatMap((row) => row.edition.visible)
      .filter((item) => item.ev && item.view && item.view.changed === true && item.ev.baseline !== item.view.alternate);
    const pick = candidates.find((item) => item.conflict || item.view.conflict || item.ev.conflict || item.ev.hot) || candidates[candidates.length - 1];
    ctx.fillStyle = RED;
    textBox(ctx, "最离谱改写", 64, 1060, 952, 26, 20, true, true);
    ctx.fillStyle = INK;
    textBox(ctx, pick ? pick.ev.title + "：" + pick.ev.baseline + " → " + pick.view.alternate : "本次无新增改写；沿用与休眠均未冒充新闻。", 64, 1092, 952, 60, 25, true);
    ctx.fillStyle = RED;
    textBox(ctx, "生活短讯摘录 / 仅收录各版新增", 64, 1164, 952, 26, 20, true, true);
    ctx.fillStyle = INK;
    const montage = rowData.filter((row) => row.edition).flatMap(({ era, edition }) =>
      cards(edition.visible, "personal").filter((item) => item.view && item.view.changed === true).map((item) => era.name + "：" + title(item))).join(" / ");
    textBox(ctx, montage || "无新增生活短讯", 64, 1198, 952, 134, 20);
    ctx.strokeStyle = RED;
    ctx.lineWidth = 2;
    ctx.strokeRect(814, 1360, 202, 42);
    ctx.fillStyle = RED;
    textBox(ctx, candidates.length ? "世界线已改写" : "本次无新增", 832, 1369, 166, 28, 22, true);
    ctx.fillStyle = INK;
    textBox(ctx, "虚构推演，勿对号入座 · 纯文字 / 离线制图", 64, 1372, 728, 24, 18, false, true);
    return c;
  }
  function open(run) {
    const nextCanvas = build(run);
    const overlay = document.getElementById("posterOverlay");
    if (!isOpen()) {
      lastFocus = document.activeElement;
      backgroundState = Array.from(document.querySelectorAll("main, header.masthead, footer")).filter((node) => !node.contains(overlay)).map((node) => {
        const wasInert = node.inert;
        node.inert = true;
        return { node, wasInert };
      });
    }
    const preview = document.getElementById("posterPreview");
    preview.textContent = "";
    canvas = nextCanvas;
    preview.appendChild(canvas);
    filename = "world-line-" + String(run.runId || run.id || "untitled").replace(/[^a-zA-Z0-9_-]/g, "_") + ".png";
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
      if (document.activeElement !== first && document.activeElement !== last) { e.preventDefault(); (e.shiftKey ? last : first).focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  global.WRM_CHAPTER_POSTER = { open, close, isOpen, build };
})(typeof window !== "undefined" ? window : globalThis);
