/* 可选 AI 叙事层：默认关闭。只写叙述，不碰 metrics/events/edges。
   Key 与开关只存 localStorage；失败静默回退内置文案。
   默认走 OpenAI 兼容接口；可用 localStorage wrm.aiUrl / wrm.aiModel 覆盖。 */
(function (global) {
  "use strict";

  const LS_ON = "wrm.aiOn";
  const LS_KEY = "wrm.aiKey";
  const LS_URL = "wrm.aiUrl";
  const LS_MODEL = "wrm.aiModel";
  const DEFAULT_URL = "https://api.openai.com/v1/chat/completions";
  const DEFAULT_MODEL = "gpt-4o-mini";
  const TIMEOUT = 15000;

  function read(key) {
    try { return global.localStorage.getItem(key); } catch (e) { return null; }
  }
  function write(key, value) {
    try { global.localStorage.setItem(key, value); } catch (e) { /* 隐私模式等场景忽略 */ }
  }

  function enabled() { return read(LS_ON) === "1"; }

  function bind(toggleEl, keyEl) {
    toggleEl.checked = enabled();
    keyEl.value = read(LS_KEY) || "";
    toggleEl.addEventListener("change", () => write(LS_ON, toggleEl.checked ? "1" : "0"));
    keyEl.addEventListener("change", () => write(LS_KEY, keyEl.value.trim()));
  }

  function validate(obj) {
    if (!obj || typeof obj !== "object") return null;
    const dims = obj.dimensions;
    if (!dims || typeof dims !== "object") return null;
    for (const k of ["education", "economy", "society", "individual"]) {
      if (typeof dims[k] !== "string" || !dims[k] || dims[k].length > 200) return null;
    }
    if (!Array.isArray(obj.unintended) || obj.unintended.length !== 3) return null;
    for (const u of obj.unintended) if (typeof u !== "string" || !u || u.length > 200) return null;
    if (typeof obj.conclusion !== "string" || !obj.conclusion || obj.conclusion.length > 160) return null;
    const all = [obj.conclusion, ...obj.unintended, ...Object.values(dims)].join("");
    if (/%|统计显示|据统计/.test(all)) return null;
    return { dimensions: dims, unintended: obj.unintended, conclusion: obj.conclusion };
  }

  function parseContent(text) {
    const stripped = String(text).replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    return validate(JSON.parse(stripped));
  }

  async function request(result) {
    if (!enabled()) return null;
    const key = read(LS_KEY);
    if (!key) return null;
    const payload = {
      rule: result.ruleTitle,
      params: result.params,
      metrics: result.metrics,
      dimensions: Object.keys(result.dimensions).reduce((acc, k) => {
        acc[k] = result.dimensions[k].map((d) => ({ title: d.title, change: d.change, certainty: d.certainty }));
        return acc;
      }, {}),
      events: result.events.map((e) => ({ year: e.year, title: e.title })),
      edges: result.edges.map((e) => ({ from: e.from, to: e.to, relation: e.relation, assumption: e.assumption })),
      unintended: result.unintended.map((u) => u.title)
    };
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const res = await fetch(read(LS_URL) || DEFAULT_URL, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
        body: JSON.stringify({
          model: read(LS_MODEL) || DEFAULT_MODEL,
          temperature: 0.4,
          messages: [
            {
              role: "system",
              content: "你是社会规则推演刊物的编辑。把给定的结构化世界改写成通俗解读。只输出 JSON：" +
                '{"dimensions":{"education":"","economy":"","society":"","individual":""},"unintended":["","",""],"conclusion":""}。' +
                "每段不超过 80 字，长短句交错，至少写到一个具体动作或物件。不得修改或新增任何数字，不得编造统计，不得预测真实未来。" +
                "禁用套话：让我们一起、在这个…的时代、随着…的发展、综上所述、值得注意的是、不难发现、赋能、助力、彰显、不仅…而且。" +
                "情绪写动作，不贴标签；不写排比；结尾收在一个具体画面，不升华。"
            },
            { role: "user", content: JSON.stringify(payload) }
          ]
        })
      });
      if (!res.ok) return null;
      const data = await res.json();
      const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (!content) return null;
      return parseContent(content);
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  global.WRM_AI = { bind, enabled, request, validate };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_AI;
})(typeof window !== "undefined" ? window : globalThis);