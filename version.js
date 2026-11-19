(function (global) {
  "use strict";
  const LS = "wrm.worldVersion";
  const state = { current: 0, at: 0 };
  function load() {
    try {
      const saved = JSON.parse(global.localStorage.getItem(LS) || "null");
      if (saved && Number.isSafeInteger(saved.current) && saved.current > 0) {
        state.current = saved.current;
        state.at = typeof saved.at === "number" ? saved.at : 0;
        return true;
      }
    } catch (e) {}
    return false;
  }
  function bump() {
    const current = state.current;
    load();
    state.current = Math.max(current, state.current) + 1;
    state.at = Date.now();
    try { global.localStorage.setItem(LS, JSON.stringify(state)); } catch (e) {}
    return state.current;
  }
  function runId() { return "WL-" + String(state.current).padStart(3, "0"); }
  global.WRM_VERSION = { state, load, bump, current: () => state.current, runId };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_VERSION;
})(typeof window !== "undefined" ? window : globalThis);
