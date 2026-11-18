/*
  世界规则修改器 · 规则引擎 v0.1
  ------------------------------------------------------------
  只做三件事：
  1. 按规则 + 参数，选出最接近的预设世界；
  2. 用 params[].effect 对指标做确定性修正；
  3. 对比两个参数组合，给出差异最大的指标。
  约定：不调用 AI；不写死页面；所有输入输出都是普通对象。
*/
(function (global) {
  "use strict";

  const METRICS = ["fairness", "efficiency", "freedom", "stability"];
  const METRIC_LABELS = {
    fairness: "公平",
    efficiency: "效率",
    freedom: "自由",
    stability: "稳定"
  };

  function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function getData() {
    const data = global.WRM_DATA;
    if (!data) throw new Error("WRM_DATA 未加载：请先引入 data.js");
    return data;
  }

  function getRule(ruleId) {
    const rule = getData().rules.find((r) => r.id === ruleId);
    if (!rule) throw new Error("未知规则：" + ruleId);
    return rule;
  }

  function defaultParams(rule) {
    const out = {};
    for (const p of rule.params) out[p.id] = p.default;
    return out;
  }

  function normalizeParams(rule, params) {
    const out = defaultParams(rule);
    if (!params) return out;
    for (const p of rule.params) {
      if (Object.prototype.hasOwnProperty.call(params, p.id)) {
        out[p.id] = Boolean(params[p.id]);
      }
    }
    return out;
  }

  function sameParams(rule, a, b) {
    return rule.params.every((p) => Boolean(a[p.id]) === Boolean(b[p.id]));
  }

  function distance(rule, a, b) {
    return rule.params.reduce((n, p) => n + (Boolean(a[p.id]) === Boolean(b[p.id]) ? 0 : 1), 0);
  }

  function nearestPreset(rule, params) {
    const keys = Object.keys(rule.presets);
    let best = null;
    for (const key of keys) {
      const preset = rule.presets[key];
      const d = distance(rule, preset.params, params);
      if (!best || d < best.distance) best = { key, preset, distance: d };
    }
    return best;
  }

  function exactPreset(rule, params) {
    for (const key of Object.keys(rule.presets)) {
      if (sameParams(rule, rule.presets[key].params, params)) {
        return { key, preset: rule.presets[key] };
      }
    }
    return null;
  }

  /**
   * 评估一个参数组合。
   * @returns {{ruleId, ruleTitle, params, metrics, dimensions, events, edges,
   *            unintended, report, presetKey, match, basePresetKey}}
   */
  function evaluate(ruleId, params) {
    const rule = getRule(ruleId);
    const normalized = normalizeParams(rule, params);
    const exact = exactPreset(rule, normalized);
    const base = exact || nearestPreset(rule, normalized);
    const baseMetrics = base.preset.metrics;

    // 以最近预设为基准，按参数差异做确定性修正。
    // 完全匹配时直接使用预设指标，避免浮点误差。
    const metrics = {};
    for (const m of METRICS) {
      if (exact) {
        metrics[m] = baseMetrics[m];
      } else {
        let delta = 0;
        for (const p of rule.params) {
          const current = Boolean(normalized[p.id]);
          const baseline = Boolean(base.preset.params[p.id]);
          if (current !== baseline) {
            delta += Number(p.effect && p.effect[m] ? p.effect[m] : 0);
          }
        }
        metrics[m] = clamp(baseMetrics[m] + delta);
      }
    }

    return {
      ruleId: rule.id,
      ruleTitle: rule.title,
      category: rule.category,
      params: normalized,
      metrics,
      dimensions: base.preset.dimensions,
      events: base.preset.events,
      edges: base.preset.edges,
      unintended: base.preset.unintended,
      report: base.preset.report,
      presetKey: base.key,
      basePresetKey: base.key,
      match: exact ? "exact" : "nearest"
    };
  }

  /**
   * 对比两个参数组合。
   * @returns {{a, b, diff, top}}
   */
  function compare(ruleId, paramsA, paramsB) {
    const a = evaluate(ruleId, paramsA);
    const b = evaluate(ruleId, paramsB);
    const diff = {};
    for (const m of METRICS) diff[m] = a.metrics[m] - b.metrics[m];

    const top = METRICS
      .map((m) => ({ metric: m, label: METRIC_LABELS[m], delta: diff[m] }))
      .filter((x) => x.delta !== 0)
      .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta))
      .slice(0, 3);

    return { a, b, diff, top };
  }

  function listRules() {
    return getData().rules.map((r) => ({
      id: r.id,
      title: r.title,
      category: r.category,
      icon: r.icon,
      question: r.question,
      params: r.params.map((p) => ({ id: p.id, label: p.label, note: p.note, default: p.default }))
    }));
  }

  /**
   * 返回某条规则的两个预设（用于“示例世界”入口）。
   */
  function presets(ruleId) {
    const rule = getRule(ruleId);
    return Object.keys(rule.presets).map((key) => ({
      key,
      id: rule.presets[key].id,
      name: rule.presets[key].name,
      tagline: rule.presets[key].tagline,
      params: rule.presets[key].params,
      metrics: rule.presets[key].metrics
    }));
  }

  global.WRM_ENGINE = {
    METRICS,
    METRIC_LABELS,
    getData,
    getRule,
    defaultParams,
    evaluate,
    compare,
    listRules,
    presets
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = global.WRM_ENGINE;
  }
})(typeof window !== "undefined" ? window : globalThis);
