/* 世界规则修改器 · 两页式编排
   第 1 页 #setup 唯一可编辑；第 2 页 #river 只读。
   状态（规则/参数/假设）存 localStorage，回到设定页原样恢复；每次生成版本 +1。
   不改 world-rule/data.js 与 engine.js 的结构；引擎只用来取世界名。 */
(function (global) {
  "use strict";

  const APP_VERSION = "2.0.0";
  const APP_UPDATED = "2026-11-18";
  const LS = "wrm.setup";

  const state = {
    ruleId: "no-exam",
    params: {},
    assumptions: { tech: true, resources: true, cooperate: true }
  };

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
      global.WRM_RIVER.assumptions.forEach((a) => {
        if (s.assumptions && typeof s.assumptions[a.id] === "boolean") state.assumptions[a.id] = s.assumptions[a.id];
      });
    } catch (e) { /* 忽略损坏存储 */ }
  }

  function show(page) {
    document.getElementById("setup").hidden = page !== "setup";
    document.getElementById("river").hidden = page !== "river";
    global.scrollTo(0, 0);
    const title = document.getElementById(page === "setup" ? "setupTitle" : "riverWorld");
    if (title) title.focus();
  }

  function backToSetup() {
    global.WRM_SETUP.refreshVersion();
    show("setup");
  }

  function generate() {
    const err = document.getElementById("appError");
    err.hidden = true;
    try {
      global.WRM_ENGINE.evaluate(state.ruleId, state.params);
      global.WRM_VERSION.bump();
      save();
      global.WRM_RIVER_PAGE.render(state, { onEdit: backToSetup });
      show("river");
    } catch (e) {
      err.textContent = "生成失败：" + (e && e.message ? e.message : e);
      err.hidden = false;
    }
  }

  function boot() {
    global.WRM_VERSION.load();
    load();
    global.WRM_SETUP.render(state, { onChange: save, onGenerate: generate });
    document.getElementById("disclaimer").textContent =
      global.WRM_RIVER.meta.disclaimer + global.WRM_DATA.meta.disclaimer;
    document.getElementById("metaVersion").textContent =
      "v" + APP_VERSION + " · " + APP_UPDATED +
      " · 数据 v" + global.WRM_DATA.meta.version +
      " · 长河 v" + global.WRM_RIVER.meta.version;
    show("setup");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : globalThis);