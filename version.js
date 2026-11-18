/* 世界线编号（分版长河）：每次「生成这个世界」编号 +1，localStorage 持久化。
   runId = 字母(随规则 A/B/C) + "-" + 三位编号；翻章节不增编号，只有生成才增。
   不做历史条、不做旧版预览。兼容旧存储里的 current 字段。 */
(function (global) {
  "use strict";

  const LS = "wrm.worldVersion";
  const state = { current: 0, at: 0 };

  const LETTER = { "no-exam": "A", "four-hour": "B", "free-goods": "C", "custom": "D" };

  function save() {
    try { global.localStorage.setItem(LS, JSON.stringify(state)); } catch (e) { /* 存储不可用则只留内存 */ }
  }

  function load() {
    try {
      const raw = global.localStorage.getItem(LS);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (s && typeof s.current === "number" && s.current > 0) {
        state.current = s.current;
        state.at = typeof s.at === "number" ? s.at : Date.now();
        return true;
      }
    } catch (e) { /* 忽略损坏存储 */ }
    return false;
  }

  function bump() {
    state.current += 1;
    state.at = Date.now();
    save();
    return state.current;
  }

  function pad3(n) {
    return String(n).padStart(3, "0");
  }

  function letterFor(ruleId) {
    return LETTER[ruleId] || "A";
  }

  function runId(ruleId) {
    return letterFor(ruleId) + "-" + pad3(state.current);
  }

  global.WRM_VERSION = {
    state: state,
    load: load,
    bump: bump,
    current: function () { return state.current; },
    letterFor: letterFor,
    runId: runId,
    semver: function () { return "v0." + state.current; }
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_VERSION;
})(typeof window !== "undefined" ? window : globalThis);