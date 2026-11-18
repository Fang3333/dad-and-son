/* 主交互：八版报纸翻页状态机 + 选规则 / 调参数 / 生成 / 对比 / 报告 / 海报 / AI / 热点。
   只消费 WRM_DATA / WRM_ENGINE，不改数据结构；所有数据文本走 textContent。 */
(function (global) {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const APP_VERSION = "1.2.0";
  const APP_UPDATED = "2026-11-18";
  const LS_STATE = "wrm.state";
  const LS_HOT = "wrm.hotPicks";
  const HOT_CATS = ["直播", "科技", "财经", "社会", "教育", "娱乐", "生活"];
  const DIM_ORDER = ["education", "economy", "society", "individual"];
  const DIM_LABELS = { education: "教育", economy: "经济", society: "社会", individual: "个人" };
  const PAGE_COUNT = 8;
  const PAGE_NAMES = ["头版", "教育", "经济", "社会·个人", "因果", "热点", "对比", "档案"];

  const state = {
    ruleId: null, paramsA: null, paramsB: null, resultA: null, resultB: null,
    page: 1, hotFilter: "all", hotWindow: 0, hotPicks: [], causalExpanded: false
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
    const desk = $("editDesk");
    if (desk) desk.open = true;
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

  /* ---------- 翻页状态机 ---------- */

  function updatePager() {
    $("pageLabel").textContent = "第 " + state.page + " / " + PAGE_COUNT + " 版 · " + PAGE_NAMES[state.page - 1];
    $("progressFill").style.width = (state.page / PAGE_COUNT * 100) + "%";
    $("prevBtn").disabled = state.page === 1;
    $("nextBtn").disabled = state.page === PAGE_COUNT;
    const dots = $("pageDots");
    dots.replaceChildren();
    for (let i = 1; i <= PAGE_COUNT; i++) {
      const d = node("span", "dot" + (i === state.page ? " is-on" : "") + (i < state.page ? " is-done" : ""));
      dots.appendChild(d);
    }
  }

  function goToPage(n, focus) {
    const next = Math.max(1, Math.min(PAGE_COUNT, n));
    state.page = next;
    for (let i = 1; i <= PAGE_COUNT; i++) {
      const sec = $("page-" + i);
      const active = i === next;
      sec.hidden = !active;
      sec.classList.toggle("is-active", active);
      if (active) {
        sec.classList.remove("turn");
        void sec.offsetWidth;
        sec.classList.add("turn");
      }
    }
    updatePager();
    global.scrollTo(0, 0);
    if (focus !== false) {
      const title = $("title-" + next);
      if (title) title.focus({ preventScroll: true });
    }
  }

  function bindPager() {
    $("prevBtn").addEventListener("click", () => goToPage(state.page - 1));
    $("nextBtn").addEventListener("click", () => goToPage(state.page + 1));
    document.addEventListener("keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target;
      const tag = t && t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (t && t.isContentEditable)) return;
      if (e.key === "ArrowRight") { e.preventDefault(); goToPage(state.page + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); goToPage(state.page - 1); }
    });
  }

  /* ---------- 页头规则条 / 编辑台 ---------- */

  function matchText(r) {
    return r.match === "exact" ? "示例世界 " + r.presetKey : "近似推演 · 基于示例 " + r.basePresetKey;
  }

  function renderStrip() {
    const r = state.resultA;
    $("stripRule").textContent = rule().title;
    const badge = $("stripBadge");
    badge.textContent = matchText(r);
    badge.className = "badge mono" + (r.match === "nearest" ? " is-nearest" : "");
    const wrap = $("stripParams");
    wrap.replaceChildren();
    rule().params.forEach((p) => {
      const on = Boolean(r.params[p.id]);
      const chip = node("span", "strip-chip" + (on ? " is-on" : ""));
      chip.appendChild(node("i", "chip-dot"));
      chip.appendChild(document.createTextNode(p.label + (on ? " 开" : " 关")));
      wrap.appendChild(chip);
    });
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
      });
      li.appendChild(btn);
      list.appendChild(li);
    }
  }

  function effectText(p) {
    const parts = engine().METRICS
      .filter((m) => p.effect && p.effect[m])
      .map((m) => engine().METRIC_LABELS[m] + fmt(p.effect[m]));
    return "权重示意 " + (parts.length ? parts.join(" · ") : "不影响指标");
  }

  function renderParams(grid, params, onChange) {
    grid.replaceChildren();
    for (const p of rule().params) {
      const cell = node("div", "param");
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = Boolean(params[p.id]);
      input.addEventListener("change", () => {
        params[p.id] = input.checked;
        if (onChange) onChange();
      });
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
        renderParams($("paramGridB"), state.paramsB, runCompare);
        runCompare();
      });
      wrap.appendChild(btn);
    }
  }

  function selectRule(id) {
    state.ruleId = id;
    state.hotFilter = "all";
    state.hotWindow = 0;
    state.causalExpanded = false;
    const r = rule();
    state.paramsA = engine().defaultParams(r);
    state.paramsB = clone(r.presets.B.params);
    $("paramsNote").textContent = r.question;
    renderRuleList();
    renderParams($("paramGrid"), state.paramsA, () => generate(false));
    renderParams($("paramGridB"), state.paramsB, runCompare);
    renderPresetBtns();
  }

  /* ---------- 指标 ---------- */

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

  /* ---------- 第 1 版 头版 ---------- */

  function renderPage1() {
    const r = state.resultA;
    $("title-1").textContent = r.report.title;
    const baseMetrics = rule().presets[r.basePresetKey].metrics;
    const metrics = $("p1Metrics");
    metrics.replaceChildren();
    for (const m of engine().METRICS) {
      const delta = r.metrics[m] - baseMetrics[m];
      const deltaText = r.match === "nearest" && delta !== 0 ? "较示例 " + fmt(delta) : "";
      metrics.appendChild(metricRow(m, r.metrics[m], deltaText));
    }
    $("p1Lead").textContent = r.report.summary;
    $("p1Match").textContent = matchText(r) + "。" +
      (r.match === "nearest"
        ? "指标按参数权重近似修正，事件与因果跟随最近预设。"
        : "参数与示例预设完全一致。");
  }

  /* ---------- 第 2/3/4 版 维度 ---------- */

  function dimBlock(item) {
    const box = node("article", "dim-block");
    const head = node("div", "dim-head");
    head.appendChild(node("h3", null, item.title));
    const cert = node("span", "certainty mono", item.certainty);
    if (item.certainty === "假设") cert.classList.add("is-assumption");
    if (item.certainty === "不确定") cert.classList.add("is-uncertain");
    head.appendChild(cert);
    box.appendChild(head);
    box.appendChild(node("p", "change", item.change));
    box.appendChild(node("p", "causal", item.causal));
    return box;
  }

  function renderDimPage(container, items) {
    container.replaceChildren();
    container.appendChild(dimBlock(items[0]));
    if (items[1]) {
      const det = document.createElement("details");
      det.className = "more-dim";
      det.appendChild(node("summary", "more-summary mono", "还有一条"));
      det.appendChild(dimBlock(items[1]));
      container.appendChild(det);
    }
  }

  function renderPage4() {
    const wrap = $("p4Body");
    wrap.replaceChildren();
    const dims = state.resultA.dimensions;
    [["society", "社会"], ["individual", "个人"]].forEach(([key, label]) => {
      const col = node("div", "dual-col");
      col.appendChild(node("h3", "dual-head", label));
      const body = node("div", "dim-page");
      renderDimPage(body, dims[key]);
      col.appendChild(body);
      wrap.appendChild(col);
    });
  }

  /* ---------- 第 5 版 因果 ---------- */

  function causalView() {
    const r = state.resultA;
    if (state.causalExpanded) return r;
    const ids = ["e1", "e2", "e3"];
    const events = r.events.filter((e) => ids.indexOf(e.id) !== -1);
    const edges = r.edges.filter((e) =>
      (e.from === "e1" && e.to === "e2") || (e.from === "e2" && e.to === "e3"));
    return Object.assign({}, r, { events, edges });
  }

  function renderPage5() {
    const view = causalView();
    global.WRM_CAUSAL.render($("causalSvg"), $("causalList"), $("causalLegend"), view);
    const btn = $("causalToggle");
    btn.textContent = state.causalExpanded ? "收起 · 只看关键 3 节点" : "展开全部 6 节点";
    btn.setAttribute("aria-expanded", String(state.causalExpanded));
    $("p5Note").textContent = state.causalExpanded
      ? "完整 10 年链：6 个事件、6 条因果边。"
      : "先看 3 个关键节点、2 条边；展开全部看完整链。";
  }

  /* ---------- 第 6 版 热点副刊 ---------- */

  const hotCards = () => (global.WRM_HOT_EVENTS ? global.WRM_HOT_EVENTS.cards : []);
  const hotSafetyLabel = (s) => {
    const labels = global.WRM_HOT_EVENTS && global.WRM_HOT_EVENTS.safetyLabels;
    return (labels && labels[s]) || "公开梗源";
  };
  const hotForRule = () => hotCards().filter((c) => c.ruleFit.indexOf(state.ruleId) !== -1);
  const hotFiltered = () => hotForRule().filter((c) => state.hotFilter === "all" || c.category === state.hotFilter);

  function readHotPicks() {
    try {
      const raw = global.localStorage.getItem(LS_HOT);
      const arr = raw ? JSON.parse(raw) : null;
      if (Array.isArray(arr)) {
        const valid = arr.filter((id) => hotCards().some((c) => c.id === id));
        return valid.length ? valid : null;
      }
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
    renderPage6();
    renderHotArchive();
  }

  function buildHotCard(card) {
    const picked = state.hotPicks.indexOf(card.id) !== -1;
    const el = node("article", "hotcard");
    const head = node("div", "hotcard-head");
    head.appendChild(node("span", "hot-level mono", (card.memeLevel || "S") + " 级主梗"));
    head.appendChild(node("span", "hot-code mono", card.code));
    head.appendChild(node("span", "hot-cat mono", card.category));
    head.appendChild(node("span", "hot-safety mono", hotSafetyLabel(card.safety)));
    el.appendChild(head);
    el.appendChild(node("h4", null, card.title));
    const real = node("p", "hot-real");
    real.appendChild(node("span", "hot-tag", "现实｜"));
    real.appendChild(document.createTextNode(card.realLine));
    el.appendChild(real);
    const alt = node("p", "hot-alt");
    alt.appendChild(node("span", "hot-tag", "本世界｜"));
    alt.appendChild(document.createTextNode(card.altLine));
    el.appendChild(alt);
    if (card.memeTags && card.memeTags.length) {
      const tags = node("div", "hot-tags");
      card.memeTags.forEach((t) => tags.appendChild(node("span", null, t)));
      el.appendChild(tags);
    }
    if (card.heatProof) {
      const proof = node("p", "hot-proof mono");
      proof.appendChild(node("span", "hot-tag", "梗源｜"));
      const hp = card.heatProof;
      proof.appendChild(document.createTextNode(
        [hp.source, hp.date, hp.metric].filter(Boolean).join(" · ")
      ));
      el.appendChild(proof);
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
      const btn = node("button", "hot-filter", label + " " + count);
      btn.type = "button";
      btn.setAttribute("aria-pressed", String(state.hotFilter === key));
      btn.addEventListener("click", () => {
        state.hotFilter = key;
        state.hotWindow = 0;
        renderPage6();
      });
      wrap.appendChild(btn);
    };
    mk("all", "全部", cards.length);
    HOT_CATS.forEach((cat) => {
      const n = cards.filter((c) => c.category === cat).length;
      if (n) mk(cat, cat, n);
    });
  }

  function renderPage6() {
    renderHotFilters();
    const cards = hotFiltered();
    const grid = $("hotGrid");
    grid.replaceChildren();
    const pages = Math.max(1, Math.ceil(cards.length / 2));
    if (state.hotWindow >= pages) state.hotWindow = 0;
    const start = state.hotWindow * 2;
    const slice = cards.slice(start, start + 2);
    if (!slice.length) {
      grid.appendChild(node("p", "note hot-empty", "这条规则下没有该分类的改写卡。换个分类看看。"));
    } else {
      slice.forEach((c) => grid.appendChild(buildHotCard(c)));
    }
    $("hotWindowNote").textContent = cards.length
      ? "第 " + (start + 1) + "–" + Math.min(start + 2, cards.length) + " 张 / 共 " + cards.length + " 张 · 一次只看两张。"
      : "共 0 张。";
    $("hotMore").disabled = cards.length <= 2;
  }

  function renderHotArchive() {
    const grid = $("hotArchive");
    grid.replaceChildren();
    const picks = state.hotPicks.map((id) => hotCards().find((c) => c.id === id)).filter(Boolean);
    $("hotArchiveNote").textContent = picks.length
      ? "已收 " + picks.length + " 张 · 最多 3 张，再收会挤掉最早的一张。摘录跟着档案走，不随规则切换清空。"
      : "还没收卡。去第 6 版热点副刊点「收进档案」，这里会留下摘录。";
    picks.forEach((c) => grid.appendChild(buildHotCard(c)));
  }

  /* ---------- 第 7 版 对比 ---------- */

  function compareCol(el, letter, r) {
    el.replaceChildren();
    const preset = rule().presets[r.presetKey];
    const name = r.match === "exact" ? preset.name : r.report.title;
    el.appendChild(node("h3", null, "世界 " + letter + " · " + name));
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

  /* ---------- 第 8 版 报告 / 叙事 / 海报 ---------- */

  function renderPage8() {
    global.WRM_REPORT.render($("reportCard"), state.resultA, {
      ruleTitle: rule().title,
      matchText: matchText(state.resultA)
    });
    renderHotArchive();
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

  /* ---------- 生成 ---------- */

  function generate(scroll) {
    state.resultA = engine().evaluate(state.ruleId, state.paramsA);
    state.causalExpanded = false;
    state.hotWindow = 0;
    renderStrip();
    renderPage1();
    renderDimPage($("p2Body"), state.resultA.dimensions.education);
    renderDimPage($("p3Body"), state.resultA.dimensions.economy);
    renderPage4();
    renderPage5();
    renderPage6();
    runCompare();
    renderPage8();
    refreshNarrative();
    saveState();
    goToPage(1, scroll !== false);
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
      renderParams($("paramGrid"), state.paramsA, () => generate(false));
      renderParams($("paramGridB"), state.paramsB, runCompare);
    }
    const savedPicks = readHotPicks();
    state.hotPicks = savedPicks !== null ? savedPicks : hotForRule().slice(0, 2).map((c) => c.id);
    saveHotPicks();

    bindPager();
    $("generateBtn").addEventListener("click", () => {
      $("editDesk").open = false;
      syncEditToggle();
      generate(true);
    });
    $("compareBtn").addEventListener("click", runCompare);
    $("posterBtn").addEventListener("click", exportPoster);
    $("causalToggle").addEventListener("click", () => {
      state.causalExpanded = !state.causalExpanded;
      renderPage5();
    });
    $("hotMore").addEventListener("click", () => {
      const pages = Math.max(1, Math.ceil(hotFiltered().length / 2));
      state.hotWindow = (state.hotWindow + 1) % pages;
      renderPage6();
    });
    $("editToggle").addEventListener("click", () => {
      const desk = $("editDesk");
      desk.open = !desk.open;
      syncEditToggle();
    });
    $("editDesk").addEventListener("toggle", syncEditToggle);
    global.WRM_AI.bind($("aiToggle"), $("aiKey"));
    $("aiToggle").addEventListener("change", refreshNarrative);

    generate(false);
    goToPage(1, false);
  }

  function syncEditToggle() {
    const open = $("editDesk").open;
    const btn = $("editToggle");
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "收起编辑台" : "编辑规则与参数";
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

  global.WRM_APP = { state, generate, runCompare, goToPage };
  init();
})(typeof window !== "undefined" ? window : globalThis);