/* AI 叙事层：默认启用，只写叙述，不碰 metrics/events/edges。
   唯一通道：Qoder Sites 公共代理（key 在服务端 Secret，访客免填）。
   代理不可用 / 失败返回 null：叙事回退内置文案，来稿解析由界面提示重试。 */
(function (global) {
  "use strict";

  const TIMEOUT = 15000;

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

  const NARRATIVE_SYSTEM = "你是社会规则推演刊物的编辑。把给定的结构化世界改写成通俗解读。只输出 JSON：" +
    '{"dimensions":{"education":"","economy":"","society":"","individual":""},"unintended":["","",""],"conclusion":""}。' +
    "每段不超过 80 字，长短句交错，至少写到一个具体动作或物件。不得修改或新增任何数字，不得编造统计，不得预测真实未来。" +
    "禁用套话：让我们一起、在这个…的时代、随着…的发展、综上所述、值得注意的是、不难发现、赋能、助力、彰显、不仅…而且。" +
    "情绪写动作，不贴标签；不写排比；结尾收在一个具体画面，不升华。";

  async function transport(system, user) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const res = await fetch("/functions/v1/app/ai", {
        method: "POST",
        credentials: "same-origin",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "system", content: system }, { role: "user", content: user }] })
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.ok === true && typeof data.content === "string" && data.content) return data.content;
      return null;
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  }

  async function request(result) {
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
    const content = await transport(NARRATIVE_SYSTEM, JSON.stringify(payload));
    if (!content) return null;
    try {
      return parseContent(content);
    } catch (e) {
      return null;
    }
  }

  global.WRM_AI = { request, validate, transport };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_AI;
})(typeof window !== "undefined" ? window : globalThis);