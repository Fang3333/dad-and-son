(function (global) {
  "use strict";

  const APP_VERSION = "2.4.0";
  const APP_UPDATED = "2026-11-19";
  const LS = "wrm.setup";
  const state = {
    ruleId: "no-exam", params: {}, mechanisms: [], libraryOpen: false, hasAIRun: false,
    custom: { name: "", description: "", params: [
      { key: "p1", label: "", value: true }, { key: "p2", label: "", value: false },
      { key: "p3", label: "", value: true }, { key: "p4", label: "", value: false }
    ] },
    intervention: { era: "primitive", yearLabel: "" },
    assumptions: { tech: true, resources: true, cooperate: true }
  };
  const view = { generated: false, chapter: 1, run: null, busy: false };

  function save() {
    try {
      global.localStorage.setItem(LS, JSON.stringify({ ruleId: state.ruleId, params: state.params, custom: state.custom,
        intervention: state.intervention, assumptions: state.assumptions, mechanisms: state.mechanisms, libraryOpen: state.libraryOpen }));
    } catch (e) {}
  }

  function load() {
    state.params = global.WRM_SETUP.defaultParams(global.WRM_SETUP.ruleById(state.ruleId));
    try {
      const s = JSON.parse(global.localStorage.getItem(LS) || "null");
      if (!s || (s.ruleId !== "custom" && !global.WRM_PRESETS.byId(s.ruleId))) return;
      state.ruleId = s.ruleId;
      state.libraryOpen = s.libraryOpen === true;
      if (s.custom && typeof s.custom === "object") {
        if (typeof s.custom.name === "string") state.custom.name = s.custom.name.slice(0, 20);
        if (typeof s.custom.description === "string") state.custom.description = s.custom.description.slice(0, 120);
        if (Array.isArray(s.custom.params)) state.custom.params.forEach((p, i) => {
          const old = s.custom.params[i];
          if (old && typeof old.label === "string") p.label = old.label.slice(0, 12);
          if (old && typeof old.value === "boolean") p.value = old.value;
        });
      }
      if (s.intervention && global.WRM_AI.ERAS.some((e) => e.id === s.intervention.era)) {
        state.intervention.era = s.intervention.era;
        if (typeof s.intervention.yearLabel === "string") state.intervention.yearLabel = s.intervention.yearLabel.slice(0, 8);
      }
      if (state.ruleId === "custom") state.params = global.WRM_SETUP.customParamMap(state);
      else {
        const rule = global.WRM_SETUP.ruleById(state.ruleId);
        state.params = global.WRM_SETUP.defaultParams(rule);
        rule.params.forEach((p) => {
          if (s.params && typeof s.params[p.id] === "boolean") state.params[p.id] = s.params[p.id];
        });
      }
      global.WRM_CHAPTERS.assumptions.forEach((a) => {
        if (s.assumptions && typeof s.assumptions[a.id] === "boolean") state.assumptions[a.id] = s.assumptions[a.id];
      });
      if (Array.isArray(s.mechanisms)) state.mechanisms = Array.from(new Set(s.mechanisms.filter((id) => global.WRM_PRESETS.mechanismById(id)))).slice(0, 3);
    } catch (e) {}
  }

  function ns() { return view.run ? view.run.ns : global.WRM_AI.ERAS.map((e) => e.n); }
  function closeOverlays() {
    global.WRM_CHAPTER_PAGE.closeOverlay();
    global.WRM_CHAPTER_POSTER.close();
    global.WRM_SETUP.closeApi();
  }
  function showSetup() {
    closeOverlays();
    document.getElementById("setup").hidden = false;
    document.getElementById("chapter").hidden = true;
    document.body.classList.remove("on-chapter");
    global.WRM_SETUP.refreshVersion(state.ruleId);
    global.WRM_SETUP.refreshGen(state);
    global.scrollTo(0, 0);
    document.getElementById("setupTitle").focus();
  }
  function showChapter(n) {
    closeOverlays();
    const direction = n >= view.chapter ? "next" : "prev";
    view.chapter = n;
    const list = ns();
    const i = list.indexOf(n);
    global.WRM_CHAPTER_PAGE.render(state, n, {
      onEdit: backToSetup,
      onPrev: () => goChapter(list[i - 1]),
      onNext: () => goChapter(i >= list.length - 1 ? list[0] : list[i + 1]),
      onDot: goChapter,
      onPoster: () => global.WRM_CHAPTER_POSTER.open(view.run)
    }, direction, view.run);
    document.getElementById("setup").hidden = true;
    document.getElementById("chapter").hidden = false;
    document.body.classList.add("on-chapter");
    global.scrollTo(0, 0);
    document.getElementById("chapterName").focus();
  }
  function goChapter(n) {
    if (!ns().includes(n)) return;
    const target = "#chapter/" + n;
    if (global.location.hash === target) showChapter(n);
    else global.location.hash = target;
  }
  function backToSetup() {
    if (global.location.hash === "#setup") showSetup();
    else global.location.hash = "#setup";
  }
  function route() {
    const m = global.location.hash.match(/^#chapter\/(\d+)$/);
    if (m && view.generated) {
      let n = Number(m[1]);
      if (!ns().includes(n)) {
        n = ns()[0];
        global.history.replaceState(null, "", "#chapter/" + n);
      }
      showChapter(n);
    } else {
      if (global.location.hash !== "#setup") global.history.replaceState(null, "", "#setup");
      showSetup();
    }
  }

  function makeRun(chapters, kind, model) {
    const start = chapters[0].n;
    const rule = global.WRM_SETUP.ruleById(state.ruleId);
    return {
      kind, model: model || "", start, ns: chapters.map((c) => c.n), chapters,
      intervention: Object.assign({}, state.intervention), recap: global.WRM_AI.RECAP[start] || "",
      ruleId: state.ruleId, ruleName: state.ruleId === "custom" ? state.custom.name.trim() : rule.name,
      ruleDescription: state.ruleId === "custom" ? state.custom.description.trim() : rule.rule,
      assumptions: global.WRM_CHAPTERS.assumptions.map((a) => a.label + (state.assumptions[a.id] ? "：开" : "：关")),
      mechanisms: state.mechanisms.map((id) => global.WRM_PRESETS.mechanismById(id).name),
      parameters: state.ruleId === "custom" ? state.custom.params.map((p) => p.label + (p.value ? "：开" : "：关"))
        : rule.params.map((p) => p.label + (state.params[p.id] ? "：开" : "：关")),
      appVersion: APP_VERSION
    };
  }
  function finishRun(run, noteText) {
    global.WRM_VERSION.bump();
    run.runId = global.WRM_VERSION.runId(run.ruleId);
    state.hasAIRun = run.kind === "ai" || state.hasAIRun;
    save();
    view.run = run;
    view.generated = true;
    view.busy = false;
    global.WRM_SETUP.busy(false);
    global.WRM_SETUP.showFallback(false);
    global.WRM_SETUP.note(noteText || "");
    goChapter(run.start);
  }
  function generateLocal() {
    if (view.busy || state.ruleId === "custom") return;
    const err = document.getElementById("appError");
    err.hidden = true;
    try {
      finishRun(makeRun(global.WRM_PRESETS.resolve(state), "local"), "本地剧本 · 未调用 API");
    } catch (e) {
      err.textContent = global.WRM_PRESETS.configurationError(state) || "本地剧本不可用，请重新选择一套剧本";
      err.hidden = false;
    }
  }
  function payload() {
    return {
      name: state.custom.name.trim(), description: state.custom.description.trim(),
      params: state.custom.params.map((p) => ({ key: p.key, label: p.label.trim(), value: !!p.value })),
      intervention: Object.assign({ mode: "from" }, state.intervention),
      assumptions: { tech: !!state.assumptions.tech, resources: !!state.assumptions.resources, cooperation: !!state.assumptions.cooperate },
      mechanisms: state.mechanisms.map((id) => {
        const m = global.WRM_PRESETS.mechanismById(id);
        return { name: m.name, description: m.note };
      })
    };
  }
  async function generateAI(force) {
    if (view.busy || state.ruleId !== "custom") return;
    document.getElementById("appError").hidden = true;
    const settings = global.WRM_AI.loadSettings();
    const error = global.WRM_PRESETS.configurationError(state);
    if (error) { global.WRM_SETUP.note(error); return; }
    if (!global.WRM_AI.hasKey(settings)) { global.WRM_SETUP.note("自定义规则需要 API Key"); return; }
    if (!global.WRM_SETUP.customValid(state)) { global.WRM_SETUP.note("填好规则名称和四个参数名，才能用 AI 生成"); return; }
    const p = payload();
    const cache = global.WRM_AI.cacheKey({ schema: "eight-five-v1", payload: p, model: settings.model, baseUrl: settings.baseUrl, temperature: settings.temperature });
    view.busy = true;
    global.WRM_SETUP.busy(true);
    global.WRM_SETUP.showFallback(false);
    try {
      const hit = force ? null : global.WRM_AI.cacheGet(cache);
      if (hit) {
        try {
          const chapters = global.WRM_AI.normalize(hit.json, state.intervention.era);
          finishRun(makeRun(chapters, "ai", settings.model), "命中本地缓存，未扣费；重新生成可强制重跑");
          return;
        } catch (e) {}
      }
      const result = await global.WRM_AI.generateWorld(settings, p);
      if (result.ok) {
        try {
          const chapters = global.WRM_AI.normalize(result.json, state.intervention.era);
          global.WRM_AI.cacheSet(cache, { json: result.json, model: result.model });
          finishRun(makeRun(chapters, "ai", result.model), "");
          return;
        } catch (e) {
          result.message = "AI 返回的章节不完整或不符合五卡格式";
        }
      }
      global.WRM_SETUP.note("AI 不可用：" + result.message + "；可改用本地剧本，离线生成");
      global.WRM_SETUP.showFallback(true);
    } catch (e) {
      global.WRM_SETUP.note("AI 生成未完成；可改用本地剧本，离线生成");
      global.WRM_SETUP.showFallback(true);
    } finally {
      view.busy = false;
      const message = document.getElementById("genNote").textContent;
      global.WRM_SETUP.busy(false);
      global.WRM_SETUP.note(message);
    }
  }
  function useBuiltin() {
    state.ruleId = "no-exam";
    state.params = global.WRM_SETUP.defaultParams(global.WRM_SETUP.ruleById(state.ruleId));
    state.mechanisms = [];
    state.libraryOpen = true;
    save();
    global.WRM_SETUP.render(state, hooks);
    global.WRM_SETUP.showFallback(false);
    global.WRM_SETUP.note("已改用本地剧本：取消考试；也可选择另外十七套");
  }
  function onKey(e) {
    if (document.getElementById("chapter").hidden || !document.getElementById("evOverlay").hidden || global.WRM_CHAPTER_POSTER.isOpen()) return;
    const tag = e.target && e.target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    const i = ns().indexOf(view.chapter);
    if (e.key === "ArrowRight") { e.preventDefault(); goChapter(ns()[i >= ns().length - 1 ? 0 : i + 1]); }
    else if (e.key === "ArrowLeft" && i > 0) { e.preventDefault(); goChapter(ns()[i - 1]); }
  }
  const hooks = { onChange: save, onGenerateAI: () => generateAI(false), onRegenerate: () => generateAI(true), onGenerateLocal: generateLocal, onFallback: useBuiltin };
  function boot() {
    global.WRM_VERSION.load();
    load();
    global.WRM_SETUP.render(state, hooks);
    document.getElementById("disclaimer").textContent = "八版都是情景推演，改写与未来部分为虚构，不是史实或预测。勿对号入座。";
    document.getElementById("metaVersion").textContent = "v" + APP_VERSION + " · " + APP_UPDATED + " · 18 套 / 8 版 · 数据 v" + global.WRM_DATA.meta.version;
    global.addEventListener("hashchange", route);
    global.addEventListener("keydown", onKey);
    route();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(typeof window !== "undefined" ? window : globalThis);
