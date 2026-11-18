/* 主交互：状态 + 选规则 / 调参数 / 生成世界 / 双世界对比 / 报告 / 海报 / AI 开关。
   只消费 WRM_DATA / WRM_ENGINE，不改数据结构；所有数据文本走 textContent。 */
(function (global) {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const APP_VERSION = "1.0.0";
  const APP_UPDATED = "2026-11-18";
  const LS_STATE = "wrm.state";
  const LS_HOT = "wrm.hotPicks";
  const HOT_CATS = ["财经", "科技", "社会", "教育", "娱乐", "生活"];
  const DIM_ORDER = ["education", "economy", "society", "individual"];
  const DIM_LABELS = { education: "教育", economy: "经济", society: "社会", individual: "个人" };

  const state = {
    ruleId: null, paramsA: null, paramsB: null, resultA: null, resultB: null,
    hotFilter: "all", hotPicks: []
  };
  let narrativeSeq = 0;

  const engine = () => global.WRM_ENGINE;
  const data = () => global.WRM_DATA;
  const rule = () => engine().getRule(state.ruleId);
  const clone = (o) => Object.assign({}, o);
  const fmt = (n) => (n > 0 ? "+" : "") + n;

  function node(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function fail(msg) {
    const e = $("appError");
    e.textContent = msg;
    e.hidden = false;
  }

  function readState() {
    try {
      const raw = global.localStorage.getItem(LS_STATE);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveState() {
    try {
      global.localStorage.setItem(LS_STATE, JSON.stringify({
        ruleId: state.ruleId, paramsA: state.paramsA, paramsB: state.paramsB
      }));
    } catch (e) { /* 忽略存储不可用 */ }
  }

  /* ---------- 静态区 ---------- */

  function renderFooterMeta() {
    const meta = data().meta;
    $("metaScale").textContent = meta.scaleNote;
    $("metaPreset").textContent = meta.presetNote;
    const dl = $("certaintyLegend");
    dl.replaceChildren();
    for (const key of Object.keys(meta.certaintyLegend)) {
      dl.appendChild(node("dt", null, key));
      dl.appendChild(node("dd", null, meta.certaintyLegend[key]));
    }
    $("disclaimer").textContent = meta.disclaimer;
    $("metaVersion").textContent =
      "v" + APP_VERSION + " · " + APP_UPDATED + " · 数据 v" + meta.version;
  }

  function renderRuleList() {
    const list = $("ruleList");
    list.replaceChildren();
    for (const r of engine().listRules()) {
      const li = document.createElement("li");
      const btn = node("button", "rule-item");
      btn.type = "button";
      btn.setAttribute("aria-current", String(r.id === state.ruleId));
      btn.appendChild(node("span", "cat", r.category));
      btn.appendChild(document.createTextNode(r.title));
      btn.addEventListener("click", () => {
        if (state.ruleId === r.id) return;
        selectRule(r.id);
        generate(false);
        runCompare();
      });
      li.appendChild(btn);
      list.appendChild(li);
    }
  }

  function renderHero() {
    const r = rule();
    $("heroKicker").textContent = "规则实验 / " + r.category;
    $("heroTitle").textContent = "如果" + r.title;
    $("heroDek").textContent = r.premise;
    $("paramsNote").textContent = r.question;
  }

  /* ---------- 参数 ---------- */

  function effectText(p) {
    const parts = engine().METRICS
      .filter((m) => p.effect && p.effect[m])
      .map((m) => engine().METRIC_LABELS[m] + fmt(p.effect[m]));
    return "权重示意 " + (parts.length ? parts.join(" · ") : "不影响指标");
  }

  function renderParams(grid, params) {
    grid.replaceChildren();
    for (const p of rule().params) {
      const cell = node("div", "param");
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = Boolean(params[p.id]);
      input.addEventListener("change", () => { params[p.id] = input.checked; });
      label.appendChild(input);
      label.appendChild(document.createTextNode(p.label));
      cell.appendChild(label);
      cell.appendChild(node("p", "note", p.note));
      cell.appendChild(node("span", "param-effect mono", effectText(p)));
      grid.appendChild(cell);
    }
  }

  function renderPresetBtns() {
    const wrap = $("presetBtns");
    wrap.replaceChildren();
    for (const preset of engine().presets(state.ruleId)) {
      const btn = node("button", "preset", "载入示例 " + preset.key + " · " + preset.name);
      btn.type = "button";
      btn.addEventListener("click", () => {
        state.paramsB = clone(preset.params);
        renderParams($("paramGridB"), state.paramsB);
        runCompare();
      });
      wrap.appendChild(btn);
    }
  }

  function selectRule(id) {
    state.ruleId = id;
    state.hotFilter = "all";
    const r = rule();
    state.paramsA = engine().defaultParams(r);
    state.paramsB = clone(r.presets.B.params);
    renderRuleList();
    renderHero();
    renderParams($("paramGrid"), state.paramsA);
    renderParams($("paramGridB"), state.paramsB);
    renderPresetBtns();
  }

  /* ---------- 世界 ---------- */

  function metricRow(m, value, deltaText) {
    const box = node("div", "metric");
    box.appendChild(node("span", "m-label mono", engine().METRIC_LABELS[m]));
    const row = node("div", "m-row");
    const bar = node("div", "bar");
    const fill = document.createElement("i");
    fill.style.width = value + "%";
    bar.appendChild(fill);
    row.appendChild(bar);
    row.appendChild(node("span", "m-value", String(value)));
    box.appendChild(row);
    if (deltaText) box.appendChild(node("span", "delta mono", deltaText));
    return box;
  }

  function matchText(r) {
    return r.match === "exact" ? "示例世界 " + r.presetKey : "近似推演 · 基于示例 " + r.basePresetKey;
  }

  function renderWorld() {
    const r = state.resultA;
    const baseMetrics = rule().presets[r.basePresetKey].metrics;
    const maxYear = r.events.reduce((n, e) => Math.max(n, e.year), 0);
    $("worldTitle").textContent = r.report.title + " · 第 " + maxYear + " 年";
    $("worldMeta").textContent = rule().title + " ｜ " +
      rule().params.map((p) => p.label + (r.params[p.id] ? "开" : "关")).join(" ");
    const badge = $("matchBadge");
    badge.textContent = matchText(r);
    badge.className = "badge mono" + (r.match === "nearest" ? " is-nearest" : "");

    const metrics = $("worldMetrics");
    metrics.replaceChildren();
    for (const m of engine().METRICS) {
      const delta = r.metrics[m] - baseMetrics[m];
      const deltaText = r.match === "nearest" && delta !== 0 ? "较示例 " + fmt(delta) : "";
      metrics.appendChild(metricRow(m, r.metrics[m], deltaText));
    }

    const grid = $("worldGrid");
    grid.replaceChildren();
    for (const key of DIM_ORDER) {
      const dim = node("div", "dim");
      const head = node("div", "dim-head");
      head.appendChild(node("h4", null, DIM_LABELS[key]));
      dim.appendChild(head);
      for (const item of r.dimensions[key]) {
        const box = node("div", "item");
        const ihead = node("div", "dim-head");
        ihead.appendChild(node("h5", null, item.title));
        const cert = node("span", "certainty mono", item.certainty);
        if (item.certainty === "假设") cert.classList.add("is-assumption");
        if (item.certainty === "不确定") cert.classList.add("is-uncertain");
        ihead.appendChild(cert);
        box.appendChild(ihead);
        box.appendChild(node("p", "change", item.change));
        box.appendChild(node("p", "causal", item.causal));
        dim.appendChild(box);
      }
      grid.appendChild(dim);
    }

    global.WRM_CAUSAL.render($("causalSvg"), $("causalList"), $("causalLegend"), r);

    const un = $("unintendedList");
    un.replaceChildren();
    r.unintended.forEach((u, i) => {
      const li = document.createElement("li");
      li.appendChild(node("span", "idx", "意外 0" + (i + 1)));
      const body = document.createElement("div");
      body.appendChild(node("h5", null, u.title));
      body.appendChild(node("p", null, u.description));
      li.appendChild(body);
      un.appendChild(li);
    });
  }

  function generate(scroll) {
    state.resultA = engine().evaluate(state.ruleId, state.paramsA);
    renderWorld();
    renderReport();
    renderHot();
    refreshNarrative();
    $("world").hidden = false;
    $("compare").hidden = false;
    $("archive").hidden = false;
    saveState();
    if (scroll) $("world").scrollIntoView();
  }

  /* ---------- 对比 ---------- */

  function compareCol(el, letter, r) {
    el.replaceChildren();
    const preset = rule().presets[r.presetKey];
    const name = r.match === "exact" ? preset.name : r.report.title;
    el.appendChild(node("h4", null, "世界 " + letter + " · " + name));
    el.appendChild(node("p", "tagline", r.match === "exact" ? preset.tagline : matchText(r)));
    for (const m of engine().METRICS) el.appendChild(metricRow(m, r.metrics[m], ""));
  }

  function runCompare() {
    state.resultB = engine().evaluate(state.ruleId, state.paramsB);
    const cmp = engine().compare(state.ruleId, state.paramsA, state.paramsB);
    compareCol($("compareA"), "A", cmp.a);
    compareCol($("compareB"), "B", cmp.b);
    $("compareDiff").textContent = "差异（A − B）：" +
      engine().METRICS.map((m) => engine().METRIC_LABELS[m] + " " + fmt(cmp.diff[m])).join(" / ");
    const top = $("compareTop");
    top.replaceChildren();
    if (!cmp.top.length) {
      top.appendChild(node("li", null, "两个世界指标一致。换一组参数再比。"));
      return;
    }
    for (const t of cmp.top) {
      const li = document.createElement("li");
      li.appendChild(document.createTextNode(t.label + " "));
      li.appendChild(node("span", "t-delta", fmt(t.delta)));
      top.appendChild(li);
    }
  }

  /* ---------- 报告 / 叙事 / 海报 ---------- */

  function renderReport() {
    global.WRM_REPORT.render($("reportCard"), state.resultA, {
      ruleTitle: rule().title,
      matchText: matchText(state.resultA)
    });
  }

  function refreshNarrative() {
    const seq = ++narrativeSeq;
    const slot = $("narrativeSlot");
    const result = state.resultA;
    if (!global.WRM_AI.enabled()) {
      global.WRM_REPORT.renderNarrative(slot, result);
      return;
    }
    slot.replaceChildren();
    slot.className = "narrative";
    slot.appendChild(node("p", "note", "AI 解读请求中…"));
    global.WRM_AI.request(result).then((narrative) => {
      if (seq !== narrativeSeq) return;
      if (narrative) {
        global.WRM_REPORT.renderNarrative(slot, narrative);
      } else {
        global.WRM_REPORT.renderNarrative(slot, result);
        slot.appendChild(node("p", "note", "AI 未响应，已用内置文案。"));
      }
    });
  }

  function exportPoster() {
    const btn = $("posterBtn");
    btn.disabled = true;
    btn.textContent = "导出中…";
    global.WRM_POSTER.download(state.resultA, { rule: rule(), meta: data().meta, appVersion: APP_VERSION })
      .then((name) => {
        btn.textContent = "已下载 " + name;
        setTimeout(() => { btn.textContent = "下载海报 PNG"; }, 2400);
      })
      .catch((err) => fail("海报导出失败：" + err.message))
      .finally(() => { btn.disabled = false; });
  }

  /* ---------- 副刊 · 热点改写 ---------- */

  const hotCards = () => (global.WRM_HOT ? global.WRM_HOT.cards : []);
  const hotForRule = () => hotCards().filter((c) => c.ruleFit.indexOf(state.ruleId) !== -1);

  function readHotPicks() {
    try {
      const raw = global.localStorage.getItem(LS_HOT);
      const arr = raw ? JSON.parse(raw) : null;
      if (Array.isArray(arr)) return arr.filter((id) => hotCards().some((c) => c.id === id));
    } catch (e) { /* 忽略存储不可用 */ }
    return null;
  }

  function saveHotPicks() {
    try {
      global.localStorage.setItem(LS_HOT, JSON.stringify(state.hotPicks));
    } catch (e) { /* 忽略存储不可用 */ }
  }

  function toggleHotPick(id) {
    const i = state.hotPicks.indexOf(id);
    if (i !== -1) state.hotPicks.splice(i, 1);
    else {
      state.hotPicks.push(id);
      if (state.hotPicks.length > 3) state.hotPicks.shift();
    }
    saveHotPicks();
    renderHotGrid();
    renderHotArchive();
  }

  function buildHotCard(card) {
    const picked = state.hotPicks.indexOf(card.id) !== -1;
    const el = node("article", "hotcard");
    const head = node("div", "hotcard-head");
    head.appendChild(node("span", "hot-code mono", card.code));
    head.appendChild(node("span", "hot-cat mono", card.category));
    if (card.sensitivity === "medium") head.appendChild(node("span", "hot-sens mono", "敏感级 中"));
    el.appendChild(head);
    el.appendChild(node("h5", null, card.title));
    const real = node("p", "hot-real");
    real.appendChild(node("span", "hot-tag", "现实｜"));
    real.appendChild(document.createTextNode(card.realLine));
    el.appendChild(real);
    const alt = node("p", "hot-alt");
    alt.appendChild(node("span", "hot-tag", "改写｜"));
    alt.appendChild(document.createTextNode(card.altLine));
    el.appendChild(alt);
    if (card.memeTags && card.memeTags.length) {
      const tags = node("div", "hot-tags");
      card.memeTags.forEach((t) => tags.appendChild(node("span", null, t)));
      el.appendChild(tags);
    }
    el.appendChild(node("p", "hot-note", card.note));
    const btn = node("button", "hot-pick", picked ? "已收进档案" : "收进档案");
    btn.type = "button";
    btn.setAttribute("aria-pressed", String(picked));
    btn.addEventListener("click", () => toggleHotPick(card.id));
    el.appendChild(btn);
    return el;
  }

  function renderHotFilters() {
    const wrap = $("hotFilters");
    wrap.replaceChildren();
    const cards = hotForRule();
    const mk = (key, label, count) => {
      const btn = node("button", "hot-filter", label + (count === undefined ? "" : " " + count));
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(state.hotFilter === key));
      btn.addEventListener("click", () => {
        state.hotFilter = key;
        renderHotFilters();
        renderHotGrid();
      });
      wrap.appendChild(btn);
    };
    mk("all", "全部", cards.length);
    HOT_CATS.forEach((cat) => {
      const n = cards.filter((c) => c.category === cat).length;
      if (n) mk(cat, cat, n);
    });
  }

  function renderHotGrid() {
    const grid = $("hotGrid");
    grid.replaceChildren();
    const cards = hotForRule().filter((c) => state.hotFilter === "all" || c.category === state.hotFilter);
    if (!cards.length) {
      grid.appendChild(node("p", "note hot-empty", "这条规则下没有该分类的改写卡。换个分类看看。"));
      return;
    }
    cards.forEach((c) => grid.appendChild(buildHotCard(c)));
  }

  function renderHotArchive() {
    const grid = $("hotArchive");
    grid.replaceChildren();
    const picks = state.hotPicks
      .map((id) => hotCards().find((c) => c.id === id))
      .filter(Boolean);
    $("hotArchiveNote").textContent = picks.length
      ? "已收 " + picks.length + " 张 · 最多 3 张，再收会挤掉最早的一张。摘录跟着档案走，不随规则切换清空。"
      : "还没收卡。去世界页副刊点「收进档案」，这里会留下摘录。";
    picks.forEach((c) => grid.appendChild(buildHotCard(c)));
  }

  function renderHot() {
    renderHotFilters();
    renderHotGrid();
    renderHotArchive();
  }

  /* ---------- 启动 ---------- */

  function boot() {
    renderFooterMeta();
    const rules = engine().listRules();
    const saved = readState();
    const savedRule = saved && rules.some((r) => r.id === saved.ruleId) ? saved.ruleId : rules[0].id;
    selectRule(savedRule);
    if (saved && saved.ruleId === savedRule) {
      if (saved.paramsA) state.paramsA = clone(saved.paramsA);
      if (saved.paramsB) state.paramsB = clone(saved.paramsB);
      renderParams($("paramGrid"), state.paramsA);
      renderParams($("paramGridB"), state.paramsB);
    }
    $("generateBtn").addEventListener("click", () => generate(true));
    $("compareBtn").addEventListener("click", runCompare);
    $("posterBtn").addEventListener("click", exportPoster);
    const savedPicks = readHotPicks();
    state.hotPicks = savedPicks !== null ? savedPicks : hotForRule().slice(0, 2).map((c) => c.id);
    saveHotPicks();
    global.WRM_AI.bind($("aiToggle"), $("aiKey"));
    $("aiToggle").addEventListener("change", refreshNarrative);
    generate(false);
    runCompare();
  }

  function init() {
    if (!global.WRM_DATA || !global.WRM_ENGINE) {
      fail("数据或引擎未加载：请确认 world-rule/data.js 与 world-rule/engine.js 能正常访问。");
      return;
    }
    try {
      boot();
    } catch (err) {
      fail("初始化失败：" + err.message);
    }
  }

  global.WRM_APP = { state, generate, runCompare };
  init();
})(typeof window !== "undefined" ? window : globalThis);