/* 主交互：八版报纸翻页状态机 + 选规则 / 调参数 / 生成 / 对比 / 报告 / 海报 / AI / 热点。
   只消费 WRM_DATA / WRM_ENGINE，不改数据结构；所有数据文本走 textContent。 */
(function (global) {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const APP_VERSION = "1.6.0";
  const APP_UPDATED = "2026-11-18";
  const LS_STATE = "wrm.state";
  const LS_HOT = "wrm.hotPicks";
  const LS_APP = "wrm.appVersion";
  const HOT_CATS = ["直播", "科技", "财经", "社会", "教育", "娱乐", "生活"];
  const DIM_ORDER = ["education", "economy", "society", "individual"];
  const DIM_LABELS = { education: "教育", economy: "经济", society: "社会", individual: "个人" };
  const PAGE_COUNT = 8;
  const PAGE_NAMES = ["头版", "教育", "经济", "社会·个人", "因果长河", "热点", "对比", "档案"];

  const state = {
    ruleId: null, paramsA: null, paramsB: null, resultA: null, resultB: null,
    page: 1, hotFilter: "all", hotPicks: [], causalExpanded: false,
    previewN: null, openNodes: {}, branchOpen: null, custom: null
  };
  let narrativeSeq = 0;
  const vcUserPicked = { a: false, b: false };

  const engine = () => global.WRM_ENGINE;
  const data = () => global.WRM_DATA;
  const chain = () => global.WRM_CHAIN;
  const version = () => global.WRM_VERSION;
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
        ruleId: state.ruleId, paramsA: state.paramsA, paramsB: state.paramsB, custom: state.custom
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
    if (r.custom) {
      return (r.custom.source === "ai" ? "自定义来稿 · AI 推演" : "自定义来稿 · 关键词解析") +
        " · 基于示例 " + r.basePresetKey;
    }
    return r.match === "exact" ? "示例世界 " + r.presetKey : "近似推演 · 基于示例 " + r.basePresetKey;
  }

  function renderStrip() {
    const r = state.resultA;
    $("stripRule").textContent = r.custom ? r.custom.title : rule().title;
    const badge = $("stripBadge");
    badge.textContent = matchText(r);
    badge.className = "badge mono" + (r.custom ? " is-custom" : (r.match === "nearest" ? " is-nearest" : ""));
    const wrap = $("stripParams");
    wrap.replaceChildren();
    if (r.custom) {
      const src = node("span", "strip-chip is-on");
      src.appendChild(node("i", "chip-dot"));
      src.appendChild(document.createTextNode(r.custom.source === "ai" ? "来稿 · AI 解析" : "来稿 · 关键词解析"));
      wrap.appendChild(src);
    }
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
      const deltaText = (r.match === "nearest" || r.custom) && delta !== 0 ? "较示例 " + fmt(delta) : "";
      metrics.appendChild(metricRow(m, r.metrics[m], deltaText));
    }
    $("p1Lead").textContent = r.report.summary;
    $("p1Match").textContent = matchText(r) + "。" +
      (r.custom
        ? (r.custom.source === "ai"
          ? "指标 = 示例基线 + 来稿修正；事件、维度与意外后果由 AI 按来稿改写，置信度低。"
          : "未启用 AI：只路由到最接近的内置规则，内容跟随示例，零 API 调用。")
        : (r.match === "nearest"
          ? "指标按参数权重近似修正，事件与因果跟随最近预设。"
          : "参数与示例预设完全一致。"));
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
    items.forEach((item) => container.appendChild(dimBlock(item)));
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

  /* ---------- 第 5 版 因果长河 + 世界线版本 ---------- */

  function effectiveEntry() {
    const v = version();
    const n = state.previewN !== null ? state.previewN : v.current();
    return v.get(n) || v.get(v.current());
  }

  function worldTag() {
    const v = version();
    const n = v.current();
    const e = v.get(n);
    return { serial: v.serial(e ? e.ruleId : state.ruleId, n), label: "第 " + n + " 版", n: n };
  }

  function renderRiver() {
    const c = chain();
    const entry = effectiveEntry();
    const changed = entry ? entry.changedNodes : [];
    const river = $("river");
    const keepScroll = river.scrollLeft;
    river.replaceChildren();
    const track = node("div", "river-track");
    track.appendChild(node("div", "river-line"));
    c.eras.forEach((era) => {
      const group = node("div", "era-group");
      group.dataset.era = era.id;
      group.style.background = era.band;
      const head = node("div", "era-head");
      head.appendChild(node("span", "era-name", era.name));
      head.appendChild(node("span", "era-span", era.span));
      head.appendChild(node("span", "era-tone", era.tone));
      group.appendChild(head);
      const row = node("div", "era-row");
      const eraNodes = c.nodes.filter((n) => n.era === era.id).sort((a, b) => a.order - b.order);
      eraNodes.forEach((n) => row.appendChild(buildRiverNode(n, changed.indexOf(n.id) !== -1, entry)));
      group.appendChild(row);
      if (era.id === "modern") {
        const br = node("div", "branch-row");
        br.appendChild(node("span", "branch-label", "热点支线 · 点开看梗卡（虚构改写）"));
        c.hotBranches.forEach((b) => {
          const btn = node("button", "branch", b.title);
          btn.type = "button";
          btn.dataset.branch = b.id;
          btn.setAttribute("aria-pressed", String(state.branchOpen === b.id));
          br.appendChild(btn);
        });
        group.appendChild(br);
      }
      track.appendChild(group);
    });
    river.appendChild(track);
    river.scrollLeft = keepScroll;
    $("p5RiverNote").textContent = c.disclaimer + " 共 " + c.eras.length + " 个时代、" +
      c.nodes.length + " 个主线节点、" + c.edges.length + " 条主线边、" + c.hotBranches.length +
      " 条热点支线。深红框 + 「已改写」= 被当前规则/参数影响的节点，「改写自」写明具体规则与参数；节点「承」行是上游因果边；点节点展开三层。";
  }

  function rewriteSource(n, entry) {
    if (!entry) return "";
    if (entry.ruleId === "custom") {
      return "自定义来稿 · 「" + String((entry.params && entry.params.text) || "").slice(0, 18) + "」";
    }
    const r = engine().getRule(entry.ruleId);
    const hits = (n.sensitiveTo || []).filter((t) => {
      const p = t.split(":");
      return p[0] === entry.ruleId && (p.length === 1 || Boolean(entry.params[p[1]]));
    });
    if (!hits.length) return "";
    const names = hits.map((t) => {
      const p = t.split(":");
      if (p.length === 1) return "整条规则";
      const param = r.params.find((x) => x.id === p[1]);
      return param ? param.label : p[1];
    });
    return r.title + " · " + names.join(" / ");
  }

  function buildRiverNode(n, isChanged, entry) {
    const box = node("article", "rnode" + (isChanged ? " is-changed" : "") + (state.openNodes[n.id] ? " is-open" : ""));
    box.dataset.node = n.id;
    if (isChanged) {
      box.appendChild(node("span", "stamp-mini", "已改写"));
      const src = rewriteSource(n, entry);
      if (src) box.appendChild(node("span", "rnode-why", "改写自 " + src));
    }
    const head = node("button", "rnode-head");
    head.type = "button";
    head.dataset.node = n.id;
    head.setAttribute("aria-expanded", String(Boolean(state.openNodes[n.id])));
    head.appendChild(node("span", "rnode-order", "节点 " + String(n.order).padStart(2, "0")));
    head.appendChild(node("span", "rnode-title", n.title));
    head.appendChild(node("span", "rnode-year", n.yearLabel));
    const inc = chain().edges.find((e) => e.to === n.id);
    if (inc) {
      const from = chain().nodeById(inc.from);
      head.appendChild(node("span", "rnode-in", "承「" + (from ? from.title : inc.from) + "」· " + inc.relation));
    }
    head.appendChild(node("span", "rnode-hint", "点开 · 锚点 / 本世界线 / 后果"));
    box.appendChild(head);
    const body = node("div", "rnode-body");
    const l1 = node("p", "layer layer-anchor");
    l1.appendChild(node("span", "layer-tag", "史实锚点"));
    l1.appendChild(document.createTextNode(n.anchor));
    const l2 = node("p", "layer layer-narrative");
    l2.appendChild(node("span", "layer-tag", "本世界线"));
    let narrative = n.narrative;
    if (narrative.indexOf("{n}") !== -1) {
      const vn = entry ? entry.n : version().current();
      narrative = narrative.replace("{n}", String(vn)).replace("{prev}", String(Math.max(1, vn - 1)));
    }
    l2.appendChild(document.createTextNode(narrative));
    const l3 = node("p", "layer layer-causal");
    l3.appendChild(node("span", "layer-tag", "因果后果"));
    l3.appendChild(document.createTextNode(n.cause + " → " + n.effect));
    l3.appendChild(node("span", "layer-cert", n.certainty));
    body.appendChild(l1); body.appendChild(l2); body.appendChild(l3);
    box.appendChild(body);
    return box;
  }

  function branchCard(b) {
    if (b.cardId) {
      const found = hotCards().find((c) => c.id === b.cardId);
      if (found) return found;
    }
    return b.card || null;
  }

  function renderBranchPanel() {
    const panel = $("branchPanel");
    panel.replaceChildren();
    const b = chain().hotBranches.find((x) => x.id === state.branchOpen);
    if (!b) { panel.hidden = true; return; }
    const card = branchCard(b);
    panel.hidden = false;
    if (!card) { panel.appendChild(node("p", "note", "支线卡片缺失。")); return; }
    const art = node("article", "hotcard");
    const head = node("div", "hotcard-head");
    head.appendChild(node("span", "hot-level", (card.memeLevel || "S") + " 级主梗"));
    head.appendChild(node("span", "hot-code", card.code));
    head.appendChild(node("span", "hot-cat", card.category));
    head.appendChild(node("span", "hot-safety", hotSafetyLabel(card.safety)));
    art.appendChild(head);
    art.appendChild(node("h4", null, card.title));
    const real = node("p", "hot-real");
    real.appendChild(node("span", "hot-tag", "现实｜"));
    real.appendChild(document.createTextNode(card.realLine));
    const alt = node("p", "hot-alt");
    alt.appendChild(node("span", "hot-tag", "本世界｜"));
    alt.appendChild(document.createTextNode(card.altLine));
    art.appendChild(real); art.appendChild(alt);
    const tags = node("div", "hot-tags");
    (card.memeTags || []).forEach((t) => tags.appendChild(node("span", null, t)));
    art.appendChild(tags);
    if (card.heatProof) {
      const proof = node("p", "hot-proof");
      proof.appendChild(node("span", "hot-tag", "梗源｜"));
      proof.appendChild(document.createTextNode(card.heatProof.source + " · " + card.heatProof.date + " · " + card.heatProof.metric));
      art.appendChild(proof);
    }
    art.appendChild(node("p", "hot-note", (card.note || "虚构改写，勿对号入座") + " · 支线只读，不收进档案。"));
    panel.appendChild(art);
    const close = node("button", "line-btn branch-close", "收起支线");
    close.type = "button";
    close.dataset.branchClose = "1";
    panel.appendChild(close);
  }

  function renderPreviewBanner() {
    const banner = $("previewBanner");
    if (state.previewN === null) { banner.hidden = true; return; }
    banner.hidden = false;
    $("previewText").textContent = "预览 第 " + state.previewN + " 版（只读）· 当前 第 " + version().current() + " 版";
  }

  function renderVersionUI() {
    const v = version();
    const cur = v.current();
    const shown = state.previewN !== null ? state.previewN : cur;
    const e = v.get(shown);
    const badge = $("versionBadge");
    badge.replaceChildren();
    badge.appendChild(node("span", "vb-kicker", "世界线修订"));
    badge.appendChild(node("strong", "vb-n" + (state.previewN !== null ? " is-preview" : ""), "第 " + shown + " 版"));
    badge.appendChild(node("span", "vb-meta", "v0." + shown + " · " + (e ? v.timeText(e.at) : "") + (state.previewN !== null ? " · 只读" : "")));
    const chip = $("pagerVersion");
    chip.textContent = (state.previewN !== null ? "预览 " : "") + "第 " + shown + " 版";
    chip.classList.toggle("is-preview", state.previewN !== null);

    const hist = $("versionHistory");
    hist.replaceChildren();
    v.history().forEach((h) => {
      const btn = node("button", "vbtn" + (h.n === cur ? " is-current" : "") + (h.n === state.previewN ? " is-preview" : ""));
      btn.type = "button";
      btn.dataset.v = String(h.n);
      btn.setAttribute("aria-current", String(h.n === shown));
      btn.appendChild(document.createTextNode("第 " + h.n + " 版"));
      btn.appendChild(node("span", "vlabel", h.label + " · " + v.timeText(h.at)));
      hist.appendChild(btn);
    });

    const selA = $("vcA"), selB = $("vcB");
    const prevA = selA.value, prevB = selB.value;
    selA.replaceChildren(); selB.replaceChildren();
    v.history().forEach((h) => {
      selA.appendChild(node("option", null, "第 " + h.n + " 版"));
      selA.lastChild.value = String(h.n);
      selB.appendChild(node("option", null, "第 " + h.n + " 版"));
      selB.lastChild.value = String(h.n);
    });
    const hs = v.history();
    const curEntry = v.get(cur);
    const sig = (e) => e.ruleId + JSON.stringify(e.metrics) + JSON.stringify(e.changedNodes);
    let defAEntry = null;
    for (let i = hs.length - 2; i >= 0; i--) {
      if (!curEntry || sig(hs[i]) !== sig(curEntry)) { defAEntry = hs[i]; break; }
    }
    const defA = String(defAEntry ? defAEntry.n : (hs.length > 1 ? hs[hs.length - 2].n : cur));
    const defB = String(cur);
    selA.value = vcUserPicked.a && hs.some((h) => String(h.n) === prevA) ? prevA : defA;
    selB.value = vcUserPicked.b && hs.some((h) => String(h.n) === prevB) ? prevB : defB;
    renderVersionCompare();
  }

  function renderVersionCompare() {
    const v = version();
    const a = v.get(parseInt($("vcA").value, 10));
    const b = v.get(parseInt($("vcB").value, 10));
    const out = $("vcOut");
    out.replaceChildren();
    if (!a || !b) { out.appendChild(document.createTextNode("选两个版本看差异。")); return; }
    const line = node("p", null);
    line.appendChild(document.createTextNode("第 " + a.n + " 版 → 第 " + b.n + " 版（B − A）："));
    engine().METRICS.forEach((m) => {
      const d = b.metrics[m] - a.metrics[m];
      line.appendChild(document.createTextNode(" " + engine().METRIC_LABELS[m] + " "));
      line.appendChild(node("span", "vc-delta", fmt(d)));
    });
    out.appendChild(line);
    const setB = b.changedNodes;
    const setA = a.changedNodes;
    const added = setB.filter((id) => setA.indexOf(id) === -1);
    const removed = setA.filter((id) => setB.indexOf(id) === -1);
    const names = (ids) => ids.map((id) => (chain().nodeById(id) || {}).title || id).join("、") || "无";
    out.appendChild(node("p", null, "新增改写：" + names(added) + "；取消改写：" + names(removed) + "。"));
    out.appendChild(node("p", null, "规则：" + (a.ruleId === b.ruleId ? a.ruleId : a.ruleId + " → " + b.ruleId) + "。指标为示意分数，只作同规则内对比。"));
  }

  function renderPage5() {
    renderRiver();
    renderBranchPanel();
    renderPreviewBanner();
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
  const hotByHeat = (list) => list.slice().sort((a, b) => (b.heatScore || 0) - (a.heatScore || 0));

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
    if (card.heatScore) head.appendChild(node("span", "hot-heat mono", "热度 " + card.heatScore));
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
    const cards = hotByHeat(hotFiltered());
    const grid = $("hotGrid");
    grid.replaceChildren();
    const top = cards.slice(0, 3);
    if (!top.length) {
      grid.appendChild(node("p", "note hot-empty", "这个世界没有上头条。换个分类看看。"));
    } else {
      top.forEach((c) => grid.appendChild(buildHotCard(c)));
    }
    $("hotWindowNote").textContent = cards.length
      ? "本规则可挂靠 " + cards.length + " 张 · 按热度取前 " + top.length + " 张，直接读完，不需再点。"
      : "共 0 张。";
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
    const a = state.resultA, b = state.resultB;
    const diff = {};
    for (const m of engine().METRICS) diff[m] = a.metrics[m] - b.metrics[m];
    const top = engine().METRICS
      .map((m) => ({ metric: m, label: engine().METRIC_LABELS[m], delta: diff[m] }))
      .filter((x) => x.delta !== 0)
      .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
      .slice(0, 3);
    compareCol($("compareA"), "A", a);
    compareCol($("compareB"), "B", b);
    $("compareDiff").textContent = "差异（A − B）：" +
      engine().METRICS.map((m) => engine().METRIC_LABELS[m] + " " + fmt(diff[m])).join(" / ");
    const topEl = $("compareTop");
    topEl.replaceChildren();
    if (!top.length) {
      topEl.appendChild(node("li", null, "两个世界指标一致。换一组参数再比。"));
      return;
    }
    for (const t of top) {
      const li = document.createElement("li");
      li.appendChild(document.createTextNode(t.label + " "));
      li.appendChild(node("span", "t-delta", fmt(t.delta)));
      topEl.appendChild(li);
    }
  }

  /* ---------- 第 8 版 报告 / 叙事 / 海报 ---------- */

  function renderPage8() {
    global.WRM_REPORT.render($("reportCard"), state.resultA, {
      ruleTitle: state.resultA.custom ? state.resultA.custom.title : rule().title,
      matchText: matchText(state.resultA),
      world: worldTag()
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
    const posterRule = state.resultA.custom
      ? Object.assign({}, rule(), { title: state.resultA.custom.title, category: "读者来稿" })
      : rule();
    global.WRM_POSTER.download(state.resultA, { rule: posterRule, meta: data().meta, appVersion: APP_VERSION, world: worldTag() })
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

  /* ---------- 编辑台 读者来稿 ---------- */

  function setCustomStatus(text, warn) {
    const el = $("customStatus");
    el.textContent = text || "";
    el.classList.toggle("is-warn", Boolean(warn));
  }

  function customCount() {
    $("customCount").textContent = $("customText").value.length + " / " + global.WRM_CUSTOM.MAX_TEXT;
  }

  function renderCustomDesk() {
    const ta = $("customText");
    if (state.custom && document.activeElement !== ta) ta.value = state.custom.text;
    customCount();
    $("customClear").hidden = !state.custom;
    if (state.custom) {
      setCustomStatus(state.custom.source === "ai"
        ? "当前来稿由 AI 解析：指标 = 基线 + 修正，事件与维度整版改写。"
        : "当前来稿为关键词解析：路由到内置规则，零 API 调用。", state.custom.source === "local");
    }
  }

  async function runCustom() {
    const ta = $("customText");
    const text = ta.value.trim().slice(0, global.WRM_CUSTOM.MAX_TEXT);
    const run = $("customRun");
    if (!text) {
      setCustomStatus("先写一句想改的规则，或点一条示例。", true);
      return;
    }
    run.disabled = true;
    let patch = null;
    if (global.WRM_AI.enabled()) {
      setCustomStatus("AI 解析来稿中…（1–2 次调用，校验不过自动重试一次）");
      patch = await global.WRM_CUSTOM.parseAI(text);
    }
    if (patch) {
      if (patch.base !== state.ruleId) selectRule(patch.base);
      if (Object.keys(patch.params).length) {
        for (const p of rule().params) {
          if (Object.prototype.hasOwnProperty.call(patch.params, p.id)) state.paramsA[p.id] = patch.params[p.id];
        }
        renderParams($("paramGrid"), state.paramsA, () => generate(false));
      }
      state.custom = { text: text, source: "ai", patch: patch };
    } else {
      const loc = global.WRM_CUSTOM.parseLocal(text);
      if (!loc) {
        run.disabled = false;
        setCustomStatus("没认出这条规则改的是什么。试试含「考试 / 工时 / 价格」这类词，或在第 8 版启用 AI 解析。", true);
        return;
      }
      if (loc.base !== state.ruleId) selectRule(loc.base);
      state.custom = { text: text, source: "local", patch: null };
    }
    run.disabled = false;
    $("editDesk").open = false;
    syncEditToggle();
    generate(true);
  }

  function bindCustomDesk() {
    const ta = $("customText");
    const ex = $("customExamples");
    global.WRM_CUSTOM.EXAMPLES.forEach((text) => {
      const btn = node("button", null, text);
      btn.type = "button";
      btn.addEventListener("click", () => {
        ta.value = text;
        customCount();
        ta.focus();
      });
      ex.appendChild(btn);
    });
    ta.addEventListener("input", customCount);
    $("customRun").addEventListener("click", runCustom);
    $("customClear").addEventListener("click", () => {
      state.custom = null;
      setCustomStatus("已清除来稿，回到内置规则。");
      generate(false);
    });
  }

  /* ---------- 生成 ---------- */

  function currentResult() {
    if (state.custom) {
      return global.WRM_CUSTOM.build(
        state.custom.text,
        state.custom.source === "ai" ? state.custom.patch : null,
        state.ruleId, state.paramsA
      );
    }
    return engine().evaluate(state.ruleId, state.paramsA);
  }

  function generate(scroll, opts) {
    state.resultA = currentResult();
    state.causalExpanded = false;
    state.previewN = null;
    if (!opts || opts.record !== false) {
      version().bump({
        ruleId: state.custom ? "custom" : state.ruleId,
        params: state.custom
          ? Object.assign({ text: state.custom.text, base: state.ruleId }, state.paramsA)
          : state.paramsA,
        metrics: state.resultA.metrics,
        changedNodes: chain().changedNodes(state.ruleId, state.paramsA)
      });
    }
    renderStrip();
    renderPage1();
    renderCustomDesk();
    renderDimPage($("p2Body"), state.resultA.dimensions.education);
    renderDimPage($("p3Body"), state.resultA.dimensions.economy);
    renderPage4();
    renderPage5();
    renderVersionUI();
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
    if (saved && saved.custom && typeof saved.custom.text === "string") {
      const c = saved.custom;
      const patch = c.source === "ai" ? global.WRM_CUSTOM.validatePatch(c.patch) : null;
      if (c.source !== "ai" || patch) {
        state.custom = {
          text: c.text.slice(0, global.WRM_CUSTOM.MAX_TEXT),
          source: patch ? "ai" : "local",
          patch: patch
        };
      }
    }
    const savedPicks = readHotPicks();
    state.hotPicks = savedPicks !== null ? savedPicks : [];
    saveHotPicks();

    const hadHistory = version().load();
    if (!hadHistory) {
      const r0 = currentResult();
      version().init(r0, state.custom ? "custom" : state.ruleId,
        state.custom ? Object.assign({ text: state.custom.text, base: state.ruleId }, state.paramsA) : state.paramsA,
        chain().changedNodes(state.ruleId, state.paramsA));
    }
    let prevApp = null;
    try { prevApp = global.localStorage.getItem(LS_APP); } catch (e) { /* 存储不可用 */ }
    if (hadHistory && prevApp !== APP_VERSION) {
      const rNow = currentResult();
      version().bump({
        force: true, label: "引擎修订 v" + APP_VERSION,
        ruleId: state.custom ? "custom" : state.ruleId,
        params: state.custom
          ? Object.assign({ text: state.custom.text, base: state.ruleId }, state.paramsA)
          : state.paramsA,
        metrics: rNow.metrics,
        changedNodes: chain().changedNodes(state.ruleId, state.paramsA)
      });
    }
    try { global.localStorage.setItem(LS_APP, APP_VERSION); } catch (e) { /* 存储不可用 */ }

    bindPager();
    $("river").addEventListener("click", (e) => {
      const head = e.target.closest(".rnode-head");
      if (head) {
        const id = head.dataset.node;
        state.openNodes[id] = !state.openNodes[id];
        renderRiver();
        return;
      }
      const br = e.target.closest(".branch");
      if (br) {
        const id = br.dataset.branch;
        state.branchOpen = state.branchOpen === id ? null : id;
        renderRiver();
        renderBranchPanel();
      }
    });
    $("branchPanel").addEventListener("click", (e) => {
      if (e.target.closest("[data-branch-close]")) {
        state.branchOpen = null;
        renderBranchPanel();
        renderRiver();
      }
    });
    $("versionHistory").addEventListener("click", (e) => {
      const btn = e.target.closest(".vbtn");
      if (!btn) return;
      const n = parseInt(btn.dataset.v, 10);
      state.previewN = n === version().current() ? null : n;
      renderPage5();
      renderVersionUI();
    });
    $("previewBack").addEventListener("click", () => {
      state.previewN = null;
      renderPage5();
      renderVersionUI();
    });
    $("vcA").addEventListener("change", () => { vcUserPicked.a = true; renderVersionCompare(); });
    $("vcB").addEventListener("change", () => { vcUserPicked.b = true; renderVersionCompare(); });
    $("versionReset").addEventListener("click", () => {
      state.previewN = null;
      version().reset(
        state.resultA.metrics,
        state.custom ? "custom" : state.ruleId,
        state.custom ? Object.assign({ text: state.custom.text, base: state.ruleId }, state.paramsA) : state.paramsA,
        chain().changedNodes(state.ruleId, state.paramsA)
      );
      renderPage5();
      renderVersionUI();
    });
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
    $("editToggle").addEventListener("click", () => {
      const desk = $("editDesk");
      desk.open = !desk.open;
      syncEditToggle();
    });
    $("editDesk").addEventListener("toggle", syncEditToggle);
    global.WRM_AI.bind($("aiToggle"), $("aiKey"), $("aiUrl"), $("aiModel"));
    $("aiToggle").addEventListener("change", refreshNarrative);
    bindCustomDesk();

    generate(false, { record: false });
    goToPage(1, false);
  }

  function syncEditToggle() {
    const open = $("editDesk").open;
    const btn = $("editToggle");
    btn.setAttribute("aria-expanded", String(open));
    btn.textContent = open ? "收起编辑台" : "编辑规则与参数";
  }

  function init() {
    if (!global.WRM_DATA || !global.WRM_ENGINE || !global.WRM_CUSTOM) {
      fail("数据或引擎未加载：请确认 world-rule/data.js、world-rule/engine.js 与 custom-rule.js 能正常访问。");
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