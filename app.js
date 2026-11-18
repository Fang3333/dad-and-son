/* 世界规则修改器 · 一屏一章编排
   第 1 页 #setup 唯一可编辑；第 2–6 页 #chapter/1..5 只读且不滚动，hash 路由、浏览器前进后退可用。
   状态（规则/参数/假设）存 localStorage，回到设定页原样恢复；每次生成世界线编号 +1 并回第 1 版。
   不改 world-rule/data.js 与 engine.js 的结构；引擎只用来取世界名。 */
(function (global) {
  "use strict";

  const APP_VERSION = "2.2.0";
  const APP_UPDATED = "2026-11-18";
  const LS = "wrm.setup";

  const state = {
    ruleId: "no-exam",
    params: {},
    assumptions: { tech: true, resources: true, cooperate: true }
  };
  const view = { generated: false, chapter: 1 };

  function save() {
    try {
      global.localStorage.setItem(LS, JSON.stringify({
        ruleId: state.ruleId, params: state.params, assumptions: state.assumptions
      }));
    } catch (e) { /* 存储不可用则只留内存 */ }
  }

  function load() {
    state.params = global.WRM_SETUP.defaultParams(global.WRM_SETUP.ruleById(state.ruleId));
    try {
      const raw = global.localStorage.getItem(LS);
      if (!raw) return;
      const s = JSON.parse(raw);
      if (!s || !global.WRM_DATA.rules.some((r) => r.id === s.ruleId)) return;
      state.ruleId = s.ruleId;
      const rule = global.WRM_SETUP.ruleById(state.ruleId);
      const params = global.WRM_SETUP.defaultParams(rule);
      rule.params.forEach((p) => {
        if (s.params && typeof s.params[p.id] === "boolean") params[p.id] = s.params[p.id];
      });
      state.params = params;
      global.WRM_CHAPTERS.assumptions.forEach((a) => {
        if (s.assumptions && typeof s.assumptions[a.id] === "boolean") state.assumptions[a.id] = s.assumptions[a.id];
      });
    } catch (e) { /* 忽略损坏存储 */ }
  }

  function chapterCount() {
    return global.WRM_CHAPTERS.chapters.length;
  }

  function showSetup() {
    document.getElementById("setup").hidden = false;
    document.getElementById("chapter").hidden = true;
    document.body.classList.remove("on-chapter");
    global.WRM_SETUP.refreshVersion(state.ruleId);
    global.scrollTo(0, 0);
    const t = document.getElementById("setupTitle");
    if (t) t.focus();
  }

  function showChapter(n) {
    const direction = n >= view.chapter ? "next" : "prev";
    view.chapter = n;
    global.WRM_CHAPTER_PAGE.render(state, n, {
      onEdit: backToSetup,
      onPrev: () => goChapter(n - 1),
      onNext: () => goChapter(n >= chapterCount() ? 1 : n + 1),
      onDot: (k) => goChapter(k)
    }, direction);
    document.getElementById("setup").hidden = true;
    document.getElementById("chapter").hidden = false;
    document.body.classList.add("on-chapter");
    global.scrollTo(0, 0);
    const t = document.getElementById("chapterName");
    if (t) t.focus();
  }

  function goChapter(n) {
    if (n < 1 || n > chapterCount()) return;
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
      showChapter(parseInt(m[1], 10));
    } else {
      if (global.location.hash !== "#setup") {
        try { global.history.replaceState(null, "", "#setup"); } catch (e) { global.location.hash = "#setup"; }
      }
      showSetup();
    }
  }

  function generate() {
    const err = document.getElementById("appError");
    err.hidden = true;
    try {
      global.WRM_ENGINE.evaluate(state.ruleId, state.params);
      global.WRM_VERSION.bump();
      save();
      view.generated = true;
      goChapter(1);
    } catch (e) {
      err.textContent = "生成失败：" + (e && e.message ? e.message : e);
      err.hidden = false;
    }
  }

  function onKey(e) {
    if (document.getElementById("chapter").hidden) return;
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (e.key === "ArrowRight") {
      goChapter(view.chapter >= chapterCount() ? 1 : view.chapter + 1);
    } else if (e.key === "ArrowLeft") {
      if (view.chapter > 1) goChapter(view.chapter - 1);
    }
  }

  function boot() {
    global.WRM_VERSION.load();
    load();
    global.WRM_SETUP.render(state, { onChange: save, onGenerate: generate });
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