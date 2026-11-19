(function (global) {
  "use strict";

  const APP_VERSION = "2.7.0";
  const P = global.WRM_PRESETS;
  const SETUP_KEY = "wrm.recipe.v25";
  const RUNS_KEY = "wrm.runs.v27";
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const $ = (id) => document.getElementById(id);
  const state = {
    rules: ["no-exam", "four-hour", "free-goods"], startEra: "primitive", assumptions: [],
    worldAssumptions: { tech: true, resources: true, cooperate: true },
    params: Object.fromEntries(P.commonParams.map((p) => [p.id, p.default])),
    branchPath: P.defaultPath("primitive"),
    custom: { enabled: false, name: "", description: "", params: [1, 2, 3, 4].map((n) => ({ key: "p" + n, label: "", value: true })) }
  };
  const runs = [];
  const view = { run: null, chapter: 1, busy: false };
  let toastTimer, turnDirection = "";

  function toast(text) {
    clearTimeout(toastTimer);
    $("toast").textContent = text;
    $("toast").hidden = false;
    toastTimer = setTimeout(() => { $("toast").hidden = true; }, 5000);
  }
  function recipeFrom(raw) {
    if (!raw || !Array.isArray(raw.rules)) return null;
    const next = clone(state);
    next.rules = Array.from(new Set(raw.rules.filter((id) => P.byId(id)))).slice(0, 18);
    next.startEra = P.ERAS.some((era) => era.id === raw.startEra) ? raw.startEra : "primitive";
    next.assumptions = Array.isArray(raw.assumptions) ? Array.from(new Set(raw.assumptions.filter((id) => P.mechanismById(id)))).slice(0, 3) : [];
    Object.keys(next.worldAssumptions).forEach((key) => {
      if (raw.worldAssumptions && typeof raw.worldAssumptions[key] === "boolean") next.worldAssumptions[key] = raw.worldAssumptions[key];
    });
    P.commonParams.forEach((p) => { next.params[p.id] = raw.params && typeof raw.params[p.id] === "boolean" ? raw.params[p.id] : p.default; });
    next.branchPath = P.defaultPath(next.startEra).map((key) => {
      const branch = P.BRANCHES.find((b) => b.options.some((o) => o.key === key));
      return (Array.isArray(raw.branchPath) && raw.branchPath.find((item) => branch.options.some((o) => o.key === item))) || key;
    });
    next.custom = { enabled: false, name: "", description: "", params: [1, 2, 3, 4].map((n) => ({ key: "p" + n, label: "", value: true })) };
    if (raw.custom && typeof raw.custom === "object") {
      next.custom.enabled = raw.custom.enabled === true;
      next.custom.name = Array.from(String(raw.custom.name || "")).slice(0, 20).join("");
      next.custom.description = Array.from(String(raw.custom.description || "")).slice(0, 120).join("");
      next.custom.params.forEach((p, i) => {
        const old = Array.isArray(raw.custom.params) && raw.custom.params[i];
        if (old) { p.label = Array.from(String(old.label || "")).slice(0, 12).join(""); p.value = old.value !== false; }
      });
    }
    return next;
  }
  function save() {
    try { global.localStorage.setItem(SETUP_KEY, JSON.stringify(state)); } catch (e) { toast("浏览器存储不可用；本次会话仍可继续。"); }
  }
  function saveRuns() {
    try { global.localStorage.setItem(RUNS_KEY, JSON.stringify({ currentId: view.run && view.run.id, runs })); }
    catch (e) { toast("世界线暂留本次会话；浏览器未能保存，刷新前可下载海报。"); }
  }
  function validRun(run) {
    if (!run || !/^WL-\d+$/.test(run.id) || run.appVersion !== APP_VERSION || !run.recipe || !Array.isArray(run.chapters)) return false;
    const recipe = recipeFrom(run.recipe);
    if (!recipe || P.configurationError(recipe)) return false;
    const eras = P.ERAS.filter((e) => e.n >= P.eraById(recipe.startEra).n);
    if (run.comparison && (!Number.isInteger(run.comparison.fromN) || !Array.isArray(run.comparison.chapters) || run.comparison.chapters.some((ch) => !ch || !Number.isInteger(ch.n) || !Array.isArray(ch.events) || ch.events.some((e) => !e || typeof e.topic !== "string" || typeof e.outcomeKey !== "string" || typeof e.textKey !== "string")))) return false;
    return run.chapters.length === eras.length && run.chapters.every((ch, i) => ch.n === eras[i].n && ch.era === eras[i].id && Array.isArray(ch.events) && ch.events.length >= 3 && ch.events.length <= 5 && ch.events.every((event) => event.ev && event.view && typeof event.ev.title === "string" && typeof event.ev.topic === "string" && typeof event.ev.outcomeKey === "string" && typeof event.ev.baseline === "string" && typeof event.view.alternate === "string" && typeof event.view.detail === "string" && typeof event.view.changed === "boolean") && ch.events.filter((e) => e.ev.track === "world").length === 3 && ch.events.every((e) => ["world", "personal"].includes(e.ev.track)) && Array.isArray(ch.worldCards) && ch.worldCards.length === 3 && Array.isArray(ch.personalCards) && ch.personalCards.length === ch.events.length - 3);
  }
  function load() {
    try {
      const saved = recipeFrom(JSON.parse(global.localStorage.getItem(SETUP_KEY) || "null"));
      if (saved) Object.assign(state, saved);
      const stored = JSON.parse(global.localStorage.getItem(RUNS_KEY) || "null");
      if (stored && Array.isArray(stored.runs)) {
        const ids = new Set();
        stored.runs.filter(validRun).slice(0, 5).forEach((run) => {
          if (ids.has(run.id)) return;
          ids.add(run.id);
          run.ns = run.chapters.map((c) => c.n);
          run.start = run.ns[0];
          run.path = run.recipe.branchPath.join("-");
          run.runId = run.id;
          runs.push(run);
        });
        view.run = runs.find((run) => run.id === stored.currentId) || runs[0] || null;
      }
    } catch (e) {}
  }
  function closeOverlays() {
    global.WRM_CHAPTER_PAGE.closeOverlay();
    global.WRM_CHAPTER_POSTER.close();
    global.WRM_SETUP.closeApi();
    global.WRM_SETUP.closeDialogs();
  }
  function refreshIdentity() {
    $("setupVersion").textContent = view.run ? "世界线 " + view.run.id.slice(3) + " · 第 " + view.chapter + " 版" : "十个时代 · 四处分叉";
  }
  function showSetup() {
    closeOverlays();
    global.WRM_CHAPTER_PAGE.cancelTransition();
    turnDirection = "";
    $("setup").hidden = false;
    $("chapter").hidden = true;
    document.body.classList.remove("on-chapter");
    $("advanced").open = false;
    global.WRM_SETUP.render(state, hooks);
    refreshIdentity();
    $("setupTitle").focus({ preventScroll: true });
  }
  function showChapter(n, animate) {
    closeOverlays();
    const direction = animate === false || $("chapter").hidden || n === view.chapter ? "" : turnDirection || (n > view.chapter ? "next" : "prev");
    turnDirection = "";
    view.chapter = n;
    const run = view.run;
    const i = run.ns.indexOf(n);
    global.WRM_CHAPTER_PAGE.render(state, n, {
      onEdit: () => { if (!view.busy) global.location.hash = "#setup"; },
      onPrev: () => goChapter(run.ns[i - 1], "prev"),
      onNext: () => goChapter(run.ns[(i + 1) % run.ns.length], "next"),
      onDot: goChapter,
      onPoster: () => global.WRM_CHAPTER_POSTER.open(view.run),
      onBranch: branchRun, onSelectRun: selectRun, runs, busy: view.busy
    }, direction, run);
    $("setup").hidden = true;
    $("chapter").hidden = false;
    document.body.classList.add("on-chapter");
    $("chapterName").focus({ preventScroll: true });
  }
  function goChapter(n, direction) {
    if (view.busy || !view.run || !view.run.ns.includes(n)) return;
    turnDirection = direction || "";
    if (global.location.hash === "#chapter/" + n) showChapter(n);
    else global.location.hash = "#chapter/" + n;
  }
  function route() {
    if (view.busy) return;
    const match = global.location.hash.match(/^#chapter\/(\d+)$/);
    if (match && view.run) {
      const n = view.run.ns.includes(Number(match[1])) ? Number(match[1]) : view.run.start;
      global.history.replaceState(null, "", "#chapter/" + n);
      showChapter(n);
    } else {
      global.history.replaceState(null, "", "#setup");
      showSetup();
    }
  }
  function makeRun(recipe, chapters, kind, model, parent, fromN) {
    return {
      parentId: parent ? parent.id : null,
      comparison: parent ? {
        fromN,
        chapters: parent.chapters.filter((ch) => ch.n >= fromN).map((ch) => ({
          n: ch.n,
          events: ch.events.map((item) => ({ topic: item.ev.topic, outcomeKey: item.ev.outcomeKey, textKey: item.view.alternate.normalize("NFKC").replace(/[\s\p{P}\p{S}]/gu, "") }))
        }))
      } : null,
      recipe: clone(recipe), path: recipe.branchPath.join("-"),
      kind, model: model || "", start: chapters[0].n, ns: chapters.map((c) => c.n), chapters,
      intervention: { era: recipe.startEra }, recap: P.RECAP[chapters[0].n] || "",
      ruleName: recipe.rules.length + " 条规则同时发生", ruleNames: recipe.rules.map((id) => P.byId(id).name),
      assumptions: global.WRM_CHAPTERS.assumptions.map((a) => a.label + (recipe.worldAssumptions[a.id] ? "：开" : "：关")),
      mechanisms: recipe.assumptions.map((id) => P.mechanismById(id).name),
      parameters: P.commonParams.map((p) => p.label + (recipe.params[p.id] ? "：开" : "：关")),
      appVersion: APP_VERSION
    };
  }
  function finishRun(run, chapter) {
    do { global.WRM_VERSION.bump(); run.id = global.WRM_VERSION.runId(); } while (runs.some((r) => r.id === run.id));
    run.runId = run.id;
    runs.unshift(run);
    if (runs.length > 5) runs.length = 5;
    view.run = run;
    view.busy = false;
    Object.assign(state, clone(run.recipe));
    global.WRM_SETUP.busy(false);
    global.WRM_SETUP.showFallback(false);
    save();
    saveRuns();
    global.history.replaceState(null, "", "#chapter/" + chapter);
    showChapter(chapter, false);
  }
  function selectRun(id) {
    if (view.busy) return;
    const run = runs.find((r) => r.id === id);
    if (!run) return;
    view.run = run;
    Object.assign(state, clone(run.recipe));
    save();
    saveRuns();
    const n = run.ns.includes(view.chapter) ? view.chapter : run.start;
    global.history.replaceState(null, "", "#chapter/" + n);
    showChapter(n, false);
  }
  function setBusy(on) {
    view.busy = on;
    global.WRM_SETUP.busy(on);
    document.querySelectorAll("#chapter button, #runSelect").forEach((button) => { button.disabled = on; });
  }
  function payload(recipe, fromN, parent) {
    const era = P.ERAS.find((e) => e.n === fromN);
    const localRecipe = clone(recipe);
    localRecipe.custom.enabled = false;
    const sample = P.resolve(localRecipe, fromN)[0];
    return {
      recipe: clone(recipe), rules: recipe.rules.map((id) => { const r = P.byId(id); return { id, name: r.name, description: r.rule, theme: r.theme }; }),
      groups: sample.worldCards.map((c) => ({ groupId: c.groupId, theme: c.theme, ruleTags: c.ruleTags })),
      intervention: { era: era.id, yearLabel: "", mode: "from" }, branchPath: recipe.branchPath.slice(),
      previousChapters: parent ? parent.chapters.filter((c) => c.n < fromN) : [],
      comparisonChapters: parent ? parent.chapters.filter((c) => c.n >= fromN) : []
    };
  }
  async function generate(force, branch) {
    if (view.busy) return;
    const recipe = branch ? branch.recipe : clone(state);
    const error = P.configurationError(recipe);
    if (error) { global.WRM_SETUP.note(error); return; }
    const fromN = branch ? branch.n : P.eraById(recipe.startEra).n;
    const parent = branch ? branch.parent : null;
    const prefix = parent ? parent.chapters.filter((c) => c.n < fromN) : [];
    $("appError").hidden = true;
    if (!recipe.custom.enabled) {
      const chapters = prefix.concat(P.resolve(recipe, fromN));
      finishRun(makeRun(recipe, chapters, "local", "", parent, fromN), fromN);
      if (branch) toast("已分叉：世界线 " + view.run.id.slice(3) + " · " + P.ERAS.find((e) => e.n === fromN).name + " " + branch.key.slice(-1));
      return;
    }
    const settings = global.WRM_AI.loadSettings();
    if (!global.WRM_AI.hasKey(settings) || !global.WRM_SETUP.customValid(recipe)) {
      const message = "自定义约束需要 API Key、名称和四个参数名；可在高级设置中补全。";
      if (branch) toast(message); else global.WRM_SETUP.note(message);
      return;
    }
    setBusy(true);
    if (branch) $("branchNote").textContent = "正在生成分叉后的章节；原世界线不变。";
    let succeeded = false;
    let message = "";
    try {
      const p = payload(recipe, fromN, parent);
      const key = global.WRM_AI.cacheKey({ schema: "what-if-v27", payload: p, model: settings.model, baseUrl: settings.baseUrl, temperature: settings.temperature });
      const cached = force ? null : global.WRM_AI.cacheGet(key);
      let chapters;
      let model = settings.model;
      if (cached) {
        try { chapters = global.WRM_AI.normalize(cached.json, p.intervention.era, recipe); } catch (e) {}
      }
      if (!chapters) {
        const result = await global.WRM_AI.generateWorld(settings, p);
        if (!result.ok) { message = "AI 不可用：" + result.message; return; }
        try { chapters = global.WRM_AI.normalize(result.json, p.intervention.era, recipe); }
        catch (e) { message = "AI 返回的章节或规则标签不完整，未替换当前世界线。"; return; }
        model = result.model;
        global.WRM_AI.cacheSet(key, { json: result.json, model });
      }
      finishRun(makeRun(recipe, prefix.concat(chapters), "ai", model, parent, fromN), fromN);
      succeeded = true;
      toast(branch ? "已分叉：世界线 " + view.run.id.slice(3) + " · " + P.ERAS.find((e) => e.n === fromN).name + " " + branch.key.slice(-1) : cached ? "命中本地缓存，未调用 API。" : "自定义世界线已生成。");
    } catch (e) { message = "AI 生成未完成，原世界线不变；可关闭自定义后离线生成。"; }
    finally {
      setBusy(false);
      if (!succeeded) {
        history.replaceState(null, "", branch ? "#chapter/" + view.chapter : "#setup");
        if (branch) { showChapter(view.chapter, false); $("branchNote").textContent = message; toast(message); }
        else { global.WRM_SETUP.note(message); global.WRM_SETUP.showFallback(true); }
      } else showChapter(view.chapter, false);
    }
  }
  function branchRun(key) {
    if (view.busy || !view.run) return;
    const point = P.BRANCHES.find((b) => b.n === view.chapter && b.options.some((option) => option.key === key));
    if (!point || view.run.recipe.branchPath.includes(key)) return;
    const recipe = clone(view.run.recipe);
    recipe.branchPath = recipe.branchPath.filter((item) => !point.options.some((option) => option.key === item)).concat(key).sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    generate(false, { recipe, n: point.n, parent: view.run, key });
  }
  const hooks = {
    onChange: save, onGenerate: () => generate(false), onRegenerate: () => generate(true),
    onFallback: () => { state.custom.enabled = false; save(); global.WRM_SETUP.render(state, hooks); global.WRM_SETUP.showFallback(false); }
  };
  function boot() {
    global.WRM_VERSION.load();
    load();
    global.WRM_RECIPE = state;
    global.WRM_RUNS = runs;
    global.WRM_APP = { state, view, generate, branchRun, selectRun };
    global.WRM_SETUP.render(state, hooks);
    $("disclaimer").textContent = "情景推演，不是史实或预测。勿对号入座。";
    $("metaVersion").textContent = "v" + APP_VERSION + " · 十版 / 四处分叉 · 离线可玩";
    global.addEventListener("hashchange", route);
    global.addEventListener("keydown", (event) => {
      if (view.busy || $("chapter").hidden || global.WRM_CHAPTER_PAGE.overlayOpen() || global.WRM_CHAPTER_POSTER.isOpen() || global.WRM_SETUP.overlayOpen() || event.target.closest("input,select,textarea,button")) return;
      const i = view.run.ns.indexOf(view.chapter);
      if (event.key === "ArrowRight") { event.preventDefault(); goChapter(view.run.ns[(i + 1) % view.run.ns.length], "next"); }
      if (event.key === "ArrowLeft" && i > 0) { event.preventDefault(); goChapter(view.run.ns[i - 1], "prev"); }
    });
    route();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
