/* 报告卡与解读槽。只读 engine 输出与 meta，不改数值。 */
(function (global) {
  "use strict";

  const DIM_LABELS = { education: "教育", economy: "经济", society: "社会", individual: "个人" };

  function node(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text !== undefined) n.textContent = text;
    return n;
  }

  function pickTimeline(events) {
    const sorted = events.slice().sort((a, b) => a.year - b.year);
    const n = sorted.length;
    const idx = [0, Math.floor(n / 3), Math.floor((2 * n) / 3), n - 1];
    const seen = [];
    for (const i of idx) if (!seen.includes(i)) seen.push(i);
    return seen.map((i) => sorted[i]);
  }

  function render(card, result, ctx) {
    card.replaceChildren();
    card.appendChild(node("p", "report-kicker mono", "世界线档案 / " + (result.custom ? "读者来稿" : result.presetKey) + "-014"));
    if (ctx.world) card.appendChild(node("p", "report-world mono", "世界线 " + ctx.world.serial + " · " + ctx.world.label));
    card.appendChild(node("h3", "report-title", result.report.title));
    card.appendChild(node("p", "report-rule mono", "规则：" + ctx.ruleTitle + " · " + ctx.matchText));

    const tl = node("ol", "timeline");
    for (const e of pickTimeline(result.events)) {
      const li = node("li");
      li.appendChild(node("span", "year", "第 " + e.year + " 年"));
      li.appendChild(node("span", "t-title", e.title));
      li.appendChild(node("span", "t-desc", e.description));
      tl.appendChild(li);
    }
    card.appendChild(tl);

    const conclusions = node("ol", "report-conclusions");
    result.unintended.forEach((u) => {
      conclusions.appendChild(node("li", null, u.title + "：" + u.description));
    });
    card.appendChild(conclusions);

    card.appendChild(node("p", "report-quote", result.report.quote));
    card.appendChild(node("p", "report-confidence mono", "推演置信度：" + result.report.confidence + " · 指标为示意分数"));
    card.appendChild(node("span", "stamp press", "情景推演 不是预测"));
  }

  function renderNarrative(slot, payload) {
    slot.replaceChildren();
    slot.className = "narrative";
    if (payload && payload.dimensions && typeof payload.conclusion === "string") {
      for (const key of Object.keys(DIM_LABELS)) {
        const text = payload.dimensions[key];
        if (typeof text === "string" && text) {
          slot.appendChild(node("p", null, DIM_LABELS[key] + "：" + text));
        }
      }
      if (Array.isArray(payload.unintended)) {
        payload.unintended.forEach((u, i) => {
          if (typeof u === "string" && u) slot.appendChild(node("p", null, "意外 0" + (i + 1) + "：" + u));
        });
      }
      slot.appendChild(node("p", null, payload.conclusion));
      slot.appendChild(node("p", "note", "AI 叙事，只换讲法，不改指标与因果。"));
      return;
    }
    const result = payload;
    slot.appendChild(node("p", null, result.report.summary));
    if (result.edges && result.edges[0]) {
      slot.appendChild(node("p", null, "因果链示例：" + result.edges[0].explanation));
    }
  }

  global.WRM_REPORT = { render, renderNarrative, DIM_LABELS };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_REPORT;
})(typeof window !== "undefined" ? window : globalThis);