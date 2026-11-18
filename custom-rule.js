/* 读者来稿 · 自定义规则：把一句话规则解析成结构化补丁，引擎照算基线后叠补丁。
   默认由公共 AI 代理产出补丁（指标修正 + 四维度 + 6 事件 + 6 边 + 3 意外）；
   代理不可用或两次校验不过返回 null，由界面提示重试，不做关键词近似。
   所有文本最终走 textContent。 */
(function (global) {
  "use strict";

  const METRICS = ["fairness", "efficiency", "freedom", "stability"];
  const DIMS = ["education", "economy", "society", "individual"];
  const RULE_IDS = ["no-exam", "four-hour", "free-goods"];
  const MAX_TEXT = 200;
  const DELTA_LIMIT = 25;

  const EXAMPLES = [
    "取消大学考试，但企业招聘仍看学校名字",
    "每天只工作四小时，允许打第二份工，下班不断联",
    "所有商品免费，按需配给，但允许黑市"
  ];

  const SYSTEM = "你是社会规则推演刊物的来稿编辑。把读者的一句话自定义规则解析成结构化推演补丁。只输出 JSON：" +
    '{"title":"","summary":"","quote":"","base":"no-exam","params":{},"deltas":{"fairness":0,"efficiency":0,"freedom":0,"stability":0},' +
    '"dimensions":{"education":[{"title":"","change":"","causal":""},{"title":"","change":"","causal":""}],"economy":[],"society":[],"individual":[]},' +
    '"events":[{"year":1,"title":"","description":"","causal":""}],"edges":[{"from":1,"to":2,"relation":"","explanation":"","assumption":false}],"unintended":[{"title":"","description":""}]}。' +
    "base 选与来稿最接近的内置规则：no-exam=取消大学考试、four-hour=每天只工作四小时、free-goods=商品不再有价格。" +
    "params 只写该规则的布尔开关，可省略：no-exam 用 diploma/freeCourse/teacherEval/employerDegree；four-hour 用 hourlyPay/secondJob/enforceOff/productivity；free-goods 用 rationing/communityProduction/blackMarket/needsFirst。" +
    "deltas 是对基线世界四项指标（公平/效率/自由/稳定）的整数示意修正，范围 -25 到 25，不得全零，方向必须与 summary 的因果讲法一致。" +
    "dimensions 四个键各 2 条；events 恰 6 条，year 为 1 到 10 的递增整数，第 2 条起 causal 写「上一步为何导致这一步」；" +
    "edges 恰 6 条，from/to 为 1 到 6 的事件序号且 from<to，六条边要把 6 个事件连成一条链，至少 2 条 assumption=true；unintended 恰 3 条。" +
    "字数：title≤14、summary≤90、quote≤50；维度 title≤12、change/causal≤50；事件 title≤12、description/causal≤45；边 relation≤4、explanation≤45；意外 title≤12、description≤50。" +
    "写具体动作与物件，长短句交错；禁用套话与排比；不得编造统计、不得出现百分号、不得写真实人名、不得预测真实未来。这是虚构情景推演。";

  function clamp(n) {
    return Math.max(0, Math.min(100, Math.round(n)));
  }

  function str(v, max, allowEmpty) {
    if (typeof v !== "string") return null;
    const t = v.trim();
    if (!t && !allowEmpty) return null;
    /* 超长按上限截断而非整份拒收：版面字数上限不变，模型偶尔超字不再毁掉整个补丁 */
    return t.length > max ? t.slice(0, max) : t;
  }

  function validatePatch(obj) {
    if (!obj || typeof obj !== "object") return null;
    const title = str(obj.title, 14);
    const summary = str(obj.summary, 90);
    const quote = str(obj.quote, 50);
    if (!title || !summary || !quote) return null;
    if (RULE_IDS.indexOf(obj.base) === -1) return null;

    const params = {};
    if (obj.params && typeof obj.params === "object") {
      for (const k of Object.keys(obj.params)) {
        if (typeof obj.params[k] === "boolean") params[k] = obj.params[k];
      }
    }

    const deltas = {};
    let nonzero = false;
    for (const m of METRICS) {
      const v = obj.deltas && obj.deltas[m];
      if (typeof v !== "number" || !isFinite(v)) return null;
      const d = Math.max(-DELTA_LIMIT, Math.min(DELTA_LIMIT, Math.round(v)));
      deltas[m] = d;
      if (d !== 0) nonzero = true;
    }
    if (!nonzero) return null;

    const dimensions = {};
    for (const dim of DIMS) {
      const list = obj.dimensions && obj.dimensions[dim];
      if (!Array.isArray(list) || list.length !== 2) return null;
      const items = [];
      for (const it of list) {
        if (!it || typeof it !== "object") return null;
        const t = str(it.title, 12);
        const c = str(it.change, 50);
        const ca = str(it.causal, 50);
        if (!t || !c || !ca) return null;
        items.push({ title: t, change: c, causal: ca });
      }
      dimensions[dim] = items;
    }

    if (!Array.isArray(obj.events) || obj.events.length !== 6) return null;
    const events = [];
    let prevYear = 0;
    for (let i = 0; i < 6; i++) {
      const e = obj.events[i];
      if (!e || typeof e !== "object") return null;
      if (typeof e.year !== "number" || !isFinite(e.year)) return null;
      const year = Math.round(e.year);
      if (year < 1 || year > 10 || year <= prevYear) return null;
      prevYear = year;
      const t = str(e.title, 12);
      const d = str(e.description, 45);
      const ca = str(e.causal, 45, i === 0);
      if (!t || !d || ca === null) return null;
      events.push({ year: year, title: t, description: d, causal: ca || "" });
    }

    if (!Array.isArray(obj.edges) || obj.edges.length !== 6) return null;
    const edges = [];
    const adj = {};
    for (let i = 1; i <= 6; i++) adj[i] = [];
    let assumed = 0;
    for (const e of obj.edges) {
      if (!e || typeof e !== "object") return null;
      const from = Math.round(Number(e.from));
      const to = Math.round(Number(e.to));
      if (!(from >= 1 && from <= 6 && to >= 1 && to <= 6 && from < to)) return null;
      const rel = str(e.relation, 4);
      const exp = str(e.explanation, 45);
      if (!rel || !exp || typeof e.assumption !== "boolean") return null;
      if (e.assumption) assumed++;
      edges.push({ from: from, to: to, relation: rel, explanation: exp, assumption: e.assumption });
      adj[from].push(to);
      adj[to].push(from);
    }
    if (assumed < 2) return null;
    const seen = { 1: true };
    const queue = [1];
    while (queue.length) {
      const cur = queue.shift();
      for (const nx of adj[cur]) if (!seen[nx]) { seen[nx] = true; queue.push(nx); }
    }
    for (let i = 1; i <= 6; i++) if (!seen[i]) return null;

    if (!Array.isArray(obj.unintended) || obj.unintended.length !== 3) return null;
    const unintended = [];
    for (const u of obj.unintended) {
      if (!u || typeof u !== "object") return null;
      const t = str(u.title, 12);
      const d = str(u.description, 50);
      if (!t || !d) return null;
      unintended.push({ title: t, description: d });
    }

    const all = [title, summary, quote]
      .concat(DIMS.reduce((acc, d) => acc.concat(dimensions[d].map((x) => x.title + x.change + x.causal)), []))
      .concat(events.map((e) => e.title + e.description + e.causal))
      .concat(edges.map((e) => e.relation + e.explanation))
      .concat(unintended.map((u) => u.title + u.description))
      .join("");
    if (/%|据统计|统计显示/.test(all)) return null;

    return { title, summary, quote, base: obj.base, params, deltas, dimensions, events, edges, unintended };
  }

  function tryPatch(raw) {
    if (!raw) return null;
    try {
      const stripped = String(raw).replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
      return validatePatch(JSON.parse(stripped));
    } catch (e) {
      return null;
    }
  }

  async function parseAI(text) {
    if (!global.WRM_AI || !global.WRM_AI.transport) return null;
    const raw = await global.WRM_AI.transport(SYSTEM, "读者来稿：" + text);
    const first = tryPatch(raw);
    if (first || !raw) return first;
    /* 校验不过时带上一稿让模型自修一次；仍不过返回 null，由界面提示重试 */
    const repaired = await global.WRM_AI.transport(SYSTEM,
      "读者来稿：" + text +
      "\n上一稿补丁未通过校验。常见问题：边 from>=to、六条边没把事件 1-6 连成一条链、assumption=true 少于 2 条、事件 year 不递增、字数超限。请修正后重新输出完整 JSON。上一稿：\n" +
      String(raw).slice(0, 6000));
    return tryPatch(repaired);
  }

  /* 基线由引擎照算；补丁只叠指标修正与内容改写，不碰引擎与 data.js。 */
  function build(text, patch, ruleId, params) {
    const base = global.WRM_ENGINE.evaluate(ruleId, params);
    const out = Object.assign({}, base);
    out.metrics = {};
    for (const m of METRICS) out.metrics[m] = clamp(base.metrics[m] + patch.deltas[m]);
    out.match = "custom";
    out.custom = { text: text, source: "ai", base: ruleId, title: patch.title };
    out.dimensions = {};
    for (const dim of DIMS) {
      out.dimensions[dim] = patch.dimensions[dim].map((it, i) => ({
        title: it.title, change: it.change, causal: it.causal,
        certainty: i === 0 ? "假设" : "不确定"
      }));
    }
    out.events = patch.events.map((e, i) => ({
      id: "e" + (i + 1), year: e.year, title: e.title, description: e.description,
      certainty: i < 3 ? "假设" : "不确定"
    }));
    out.edges = patch.edges.map((e) => ({
      from: "e" + e.from, to: "e" + e.to, relation: e.relation,
      strength: e.assumption ? 2 : 3, assumption: e.assumption, explanation: e.explanation
    }));
    out.unintended = patch.unintended;
    out.report = { title: patch.title, quote: patch.quote, summary: patch.summary, confidence: "低" };
    return out;
  }

  global.WRM_CUSTOM = {
    MAX_TEXT: MAX_TEXT,
    EXAMPLES: EXAMPLES,
    SYSTEM: SYSTEM,
    validatePatch: validatePatch,
    parseAI: parseAI,
    build: build
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_CUSTOM;
})(typeof window !== "undefined" ? window : globalThis);