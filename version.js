/* 世界线修订版本号：规则或参数每改一次 +1，同参数重跑不增版；localStorage 持久化，历史最多 5 版。
   只记录引擎输出的快照，不改 data.js / engine.js。 */
(function (global) {
  "use strict";

  const LS = "wrm.worldVersion";
  const MAX = 5;
  const LETTER = { "no-exam": "A", "four-hour": "B", "free-goods": "C", custom: "D" };

  const state = { current: 0, label: "", semver: "", at: 0, history: [] };

  function save() {
    try { global.localStorage.setItem(LS, JSON.stringify(state)); } catch (e) { /* 存储不可用则只留内存 */ }
  }

  function load() {
    try {
      const raw = global.localStorage.getItem(LS);
      if (!raw) return false;
      const s = JSON.parse(raw);
      if (s && Array.isArray(s.history) && s.history.length && typeof s.current === "number") {
        state.current = s.current;
        state.history = s.history.slice(-MAX);
        sync();
        return true;
      }
    } catch (e) { /* 忽略损坏存储 */ }
    return false;
  }

  function entry(n, ruleId, params, metrics, changedNodes, label) {
    return {
      n: n, at: Date.now(), ruleId: ruleId,
      params: Object.assign({}, params),
      metrics: Object.assign({}, metrics),
      changedNodes: (changedNodes || []).slice(),
      label: label
    };
  }

  function sync() {
    const e = get(state.current);
    state.label = "第 " + state.current + " 版";
    state.semver = "v0." + state.current;
    state.at = e ? e.at : Date.now();
  }

  function init(result, ruleId, params, changedNodes) {
    state.history = [entry(1, ruleId, params, result.metrics, changedNodes, "初版")];
    state.current = 1;
    sync(); save();
    return state.history[0];
  }

  function reset(metrics, ruleId, params, changedNodes) {
    state.history = [entry(1, ruleId, params, metrics, changedNodes, "清空重编号")];
    state.current = 1;
    sync(); save();
    return state.history[0];
  }

  function sameParams(a, b) {
    const ka = Object.keys(a);
    return ka.length === Object.keys(b).length &&
      ka.every((k) => {
        if (typeof a[k] === "string" || typeof b[k] === "string") return a[k] === b[k];
        return Boolean(a[k]) === Boolean(b[k]);
      });
  }

  function bump(opts) {
    const prev = state.history[state.history.length - 1];
    if (!opts.force && prev && prev.ruleId === opts.ruleId && sameParams(prev.params, opts.params)) return prev;
    const n = state.current + 1;
    const e = entry(n, opts.ruleId, opts.params, opts.metrics, opts.changedNodes, opts.label || "修订");
    state.history.push(e);
    if (state.history.length > MAX) state.history = state.history.slice(-MAX);
    state.current = n;
    sync(); save();
    return e;
  }

  function get(n) {
    return state.history.find((h) => h.n === n) || null;
  }

  function serial(ruleId, n) {
    return "#" + (LETTER[ruleId] || "A") + "-" + String(n).padStart(3, "0");
  }

  function timeText(at) {
    const d = new Date(at);
    const p = (x) => String(x).padStart(2, "0");
    return p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  global.WRM_VERSION = {
    state: state,
    load: load, init: init, reset: reset, bump: bump, get: get, serial: serial, timeText: timeText,
    current: function () { return state.current; },
    history: function () { return state.history; },
    MAX: MAX
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_VERSION;
})(typeof window !== "undefined" ? window : globalThis);