/* 世界规则修改器 · 一屏一章编排（v2.3）
   第 1 页 #setup 唯一可编辑；第 2–6 页 #chapter/1..5 只读且不滚动，hash 路由、浏览器前进后退可用。
   状态（规则/自定义/参数/干预时间/假设）存 localStorage，回到设定页原样恢复；每次生成世界线编号 +1。
   生成两条路：本地模板（内置 3 规则）与 AI（OpenAI 兼容，Key 只存浏览器）；AI 失败内置回退本地、自定义提示改用内置。
   干预时间之前的章节不渲染；AI 结果按 规则+干预+假设+模型 哈希缓存，「重新生成」绕过缓存。
   不改 world-rule/data.js 与 engine.js 的结构；引擎只用来取世界名。 */
(function (global) {
  "use strict";

  const APP_VERSION = "2.3.0";
  const APP_UPDATED = "2026-11-19";
  const LS = "wrm.setup";

  const state = {
    ruleId: "no-exam",
    params: {},
    custom: {
      name: "",
      description: "",
      params: [
        { key: "p1", label: "", value: true },
        { key: "p2", label: "", value: false },
        { key: "p3", label: "", value: true },
        { key: "p4", label: "", value: false }
      ]
    },
    intervention: { era: "primitive", yearLabel: "" },
    assumptions: { tech: true, resources: true, cooperate: true }
  };
  const view = { generated: false, chapter: 1, run: null };

  function save() {
    try {
      global.localStorage.setItem(LS, JSON.stringify({
        ruleId: state.ruleId,
        params: state.params,
        custom: state.custom,
        intervention: state.intervention,
        assumptions: state.assumptions
      }));
    } catch (e) { /* 存储不可用则只留内存 */ }
  }

  function load() {
    state.params = global.WRM_SETUP.defaultParams(global.WRM_SETUP.ruleById(state.ruleId));
    try {
      const raw = global.localStorage.getItem(LS);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!s) return;
      const known = s.ruleId === "custom" || global.WRM_DATA.rules.some((r) => r.id === s.ruleId);
      if (!known) return;
      state.ruleId = s.ruleId;
      if (s.custom && typeof s.custom === "object") {
        if (typeof s.custom.name === "string") state.custom.name = s.custom.name.slice(0, 20);
        if (typeof s.custom.description === "string") state.custom.description = s.custom.description.slice(0, 120);
        if (Array.isArray(s.custom.params)) {
          state.custom.params.forEach((p, i) => {
            const old = s.custom.params[i];
            if (old && typeof old === "object") {
              if (typeof old.label === "string") p.label = old.label.slice(0, 12);
              if (typeof old.value === "boolean") p.value = old.value;
            }
          });
        }
      }
      if (s.intervention && global.WRM_AI.ERAS.some((e) => e.id === s.intervention.era)) {
        state.intervention.era = s.intervention.era;
        if (typeof s.intervention.yearLabel === "string") state.intervention.yearLabel = s.intervention.yearLabel.slice(0, 8);
      }
      if (state.ruleId === "custom") {
        state.params = global.WRM_SETUP.customParamMap(state);
      } else {
        const rule = global.WRM_SETUP.ruleById(state.ruleId);
        const params = global.WRM_SETUP.defaultParams(rule);
        rule.params.forEach((p) => {
          if (s.params && typeof s.params[p.id] === "boolean") params[p.id] = s.params[p.id];
        });
        state.params = params;
      }
      global.WRM_CHAPTERS.assumptions.forEach((a) => {
        if (s.assumptions && typeof s.assumptions[a.id] === "boolean") state.assumptions[a.id] = s.assumptions[a.id];
      });
    } catch (e) { /* 忽略损坏存储 */ }
  }

  function ns() {
    return view.run ? view.run.ns : [1, 2, 3, 4, 5];
  }

  function showSetup() {
    document.getElementById("setup").hidden = false;
    document.getElementById("chapter").hidden = true;
    document.body.classList.remove("on-chapter");
    global.WRM_SETUP.refreshVersion(state.ruleId);
    global.WRM_SETUP.refreshGen(state);
    global.scrollTo(0, 0);
    const t = document.getElementById("setupTitle");
    if (t) t.focus();
  }

  function showChapter(n) {
    const direction = n >= view.chapter ? "next" : "prev";
    view.chapter = n;
    const list = ns();
    const i = list.indexOf(n);
    global.WRM_CHAPTER_PAGE.render(state, n, {
      onEdit: backToSetup,
      onRegen: () => generateAI(true),
      onPrev: () => goChapter(list[i - 1]),
      onNext: () => goChapter(i >= list.length - 1 ? list[0] : list[i + 1]),
      onDot: (k) => goChapter(k)
    }, direction, view.run);
    document.getElementById("setup").hidden = true;
    document.getElementById("chapter").hidden = false;
    document.body.classList.add("on-chapter");
    global.scrollTo(0, 0);
    const t = document.getElementById("chapterName");
    if (t) t.focus();
  }

  function goChapter(n) {
    const list = ns();
    if (list.indexOf(n) < 0) return;
    const target = "#chapter/" + n;
    if (global.location.hash === target) {
      showChapter(n);
    } else {
      global.location.hash = target;
    }
  }

  function backToSetup() {
    if (global.location.hash === "#setup") {
      showSetup();
    } else {
      global.location.hash = "#setup";
    }
  }

  function route() {
    const m = global.location.hash.match(/^#chapter\/([1-5])$/);
    if (m && view.generated) {
      let n = parseInt(m[1], 10);
      const list = ns();
      if (list.indexOf(n) < 0) {
        n = list[0];
        try { global.history.replaceState(null, "", "#chapter/" + n); } catch (e) { /* 忽略 */ }
      }
      showChapter(n);
    } else {
      if (global.location.hash !== "#setup") {
        try { global.history.replaceState(null, "", "#setup"); } catch (e) { global.location.hash = "#setup"; }
      }
      showSetup();
    }
  }

  /* ---------- 生成 ---------- */

  function startN() {
    return global.WRM_AI.eraById(state.intervention.era).n;
  }

  function interventionFor(start) {
    return start > 1 ? { era: state.intervention.era, yearLabel: state.intervention.yearLabel } : null;
  }

  function localRun() {
    const start = startN();
    const list = [];
    for (let n = start; n <= 5; n++) list.push(n);
    return {
      kind: "local",
      model: "",
      start: start,
      ns: list,
      chapters: null,
      intervention: interventionFor(start),
      recap: start > 1 ? global.WRM_AI.RECAP[start] : null
    };
  }

  function aiRun(chapters, model) {
    const list = chapters.map((c) => c.n);
    const start = list[0];
    return {
      kind: "ai",
      model: model,
      start: start,
      ns: list,
      chapters: chapters,
      intervention: interventionFor(start),
      recap: start > 1 ? global.WRM_AI.RECAP[start] : null
    };
  }

  function finishRun(run, noteText) {
    global.WRM_VERSION.bump();
    save();
    view.run = run;
    view.generated = true;
    global.WRM_SETUP.busy(false);
    global.WRM_SETUP.showFallback(false);
    global.WRM_SETUP.note(noteText || "");
    goChapter(run.start);
  }

  function generateLocal(noteText) {
    const err = document.getElementById("appError");
    err.hidden = true;
    try {
      global.WRM_ENGINE.evaluate(state.ruleId, state.params);
      finishRun(localRun(), noteText);
    } catch (e) {
      global.WRM_SETUP.busy(false);
      err.textContent = "生成失败：" + (e && e.message ? e.message : e);
      err.hidden = false;
    }
  }

  function payload() {
    const intervention = { era: state.intervention.era, yearLabel: state.intervention.yearLabel, mode: "from" };
    const assumptions = {
      tech: !!state.assumptions.tech,
      resources: !!state.assumptions.resources,
      cooperation: !!state.assumptions.cooperate
    };
    if (state.ruleId === "custom") {
      return {
        name: state.custom.name.trim(),
        description: state.custom.description.trim(),
        params: state.custom.params.map((p) => ({ key: p.key, label: p.label.trim(), value: !!p.value })),
        intervention: intervention,
        assumptions: assumptions
      };
    }
    const rule = global.WRM_SETUP.ruleById(state.ruleId);
    return {
      name: rule.title,
      description: rule.premise,
      params: rule.params.map((p) => ({ key: p.id, label: p.label, value: !!state.params[p.id] })),
      intervention: intervention,
      assumptions: assumptions
    };
  }

  function cacheCore(settings) {
    return {
      rule: state.ruleId === "custom"
        ? { name: state.custom.name.trim(), description: state.custom.description.trim(), params: state.custom.params }
        : { id: state.ruleId, params: state.params },
      intervention: state.intervention,
      assumptions: state.assumptions,
      model: settings.model,
      temperature: settings.temperature
    };
  }

  async function generateAI(force) {
    const err = document.getElementById("appError");
    err.hidden = true;
    const settings = global.WRM_AI.loadSettings();
    const custom = state.ruleId === "custom";
    if (!global.WRM_AI.hasKey(settings)) {
      if (custom) {
        global.WRM_SETUP.note("自定义规则需要 API Key");
        return;
      }
      generateLocal("未配置 API Key，已用本地模板");
      return;
    }
    if (custom && !global.WRM_SETUP.customValid(state)) {
      global.WRM_SETUP.note("填好规则名称和四个参数名，才能用 AI 生成");
      return;
    }
    global.WRM_SETUP.busy(true);
    global.WRM_SETUP.showFallback(false);
    const regen = document.getElementById("regenBtn");
    regen.disabled = true;

    const key = global.WRM_AI.cacheKey(cacheCore(settings));
    const hit = force ? null : global.WRM_AI.cacheGet(key);
    if (hit) {
      try {
        const chapters = global.WRM_AI.normalize(hit.json, state.intervention.era);
        finishRun(aiRun(chapters, hit.model || settings.model), "命中本地缓存，未扣费；「重新生成」可强制重跑");
        return;
      } catch (e) { /* 缓存损坏则重跑 */ }
    }

    const r = await global.WRM_AI.generateWorld(settings, payload());
    if (r.ok) {
      try {
        const chapters = global.WRM_AI.normalize(r.json, state.intervention.era);
        global.WRM_AI.cacheSet(key, { json: r.json, model: r.model });
        finishRun(aiRun(chapters, r.model), "");
        return;
      } catch (e) {
        r.ok = false;
        r.message = e.message;
      }
    }
    global.WRM_SETUP.busy(false);
    regen.disabled = false;
    if (custom) {
      global.WRM_SETUP.note("AI 不可用：" + r.message + "；自定义规则需要 Key");
      global.WRM_SETUP.showFallback(true);
      return;
    }
    generateLocal("AI 生成失败（" + r.message + "），已用本地模板");
  }

  function useBuiltin() {
    state.ruleId = "no-exam";
    state.params = global.WRM_SETUP.defaultParams(global.WRM_SETUP.ruleById("no-exam"));
    save();
    global.WRM_SETUP.render(state, hooks);
    global.WRM_SETUP.showFallback(false);
    global.WRM_SETUP.note("已改用内置规则：取消大学考试");
  }

  function onKey(e) {
    if (document.getElementById("chapter").hidden) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    const list = ns();
    const i = list.indexOf(view.chapter);
    if (e.key === "ArrowRight") {
      goChapter(i >= list.length - 1 ? list[0] : list[i + 1]);
    } else if (e.key === "ArrowLeft") {
      if (i > 0) goChapter(list[i - 1]);
    }
  }

  const hooks = {
    onChange: save,
    onGenerateAI: () => generateAI(false),
    onGenerateLocal: () => generateLocal(""),
    onFallback: useBuiltin
  };

  function boot() {
    global.WRM_VERSION.load();
    load();
    global.WRM_SETUP.render(state, hooks);
    document.getElementById("disclaimer").textContent =
      global.WRM_CHAPTERS.meta.disclaimer + global.WRM_DATA.meta.disclaimer;
    document.getElementById("metaVersion").textContent =
      "v" + APP_VERSION + " · " + APP_UPDATED +
      " · 数据 v" + global.WRM_DATA.meta.version +
      " · 长河 v" + global.WRM_CHAPTERS.meta.version;
    global.addEventListener("hashchange", route);
    global.addEventListener("keydown", onKey);
    route();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : globalThis);