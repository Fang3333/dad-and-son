/* 因果图：桌面 SVG（viewBox 930x300）+ 手机竖排列表。
   只读 result.events / result.edges，不改数据。 */
(function (global) {
  "use strict";

  const NS = "http://www.w3.org/2000/svg";
  const W = 930;
  const NODE_H = 56;
  const GAP_Y = 18;

  function el(name, attrs, parent) {
    const node = document.createElementNS(NS, name);
    for (const k of Object.keys(attrs || {})) node.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(node);
    return node;
  }

  function layout(events, height) {
    const years = [];
    for (const e of events) if (!years.includes(e.year)) years.push(e.year);
    years.sort((a, b) => a - b);
    const colW = W / years.length;
    const nodeW = Math.min(168, colW - 24);
    const pos = {};
    for (const year of years) {
      const group = events.filter((e) => e.year === year);
      const totalH = group.length * NODE_H + (group.length - 1) * GAP_Y;
      const startY = (height - totalH) / 2;
      group.forEach((e, i) => {
        pos[e.id] = {
          x: years.indexOf(year) * colW + (colW - nodeW) / 2,
          y: startY + i * (NODE_H + GAP_Y),
          w: nodeW,
          col: years.indexOf(year)
        };
      });
    }
    return pos;
  }

  function viewBoxHeight(events) {
    const years = [];
    for (const e of events) if (!years.includes(e.year)) years.push(e.year);
    const maxRows = Math.max(...years.map((y) => events.filter((e) => e.year === y).length));
    return Math.max(120, maxRows * NODE_H + (maxRows - 1) * GAP_Y + 48);
  }

  function titleLines(title, nodeW) {
    const max = Math.max(4, Math.floor((nodeW - 20) / 12));
    const lines = [];
    let rest = title;
    while (rest.length > max && lines.length < 1) {
      lines.push(rest.slice(0, max));
      rest = rest.slice(max);
    }
    if (rest.length > max) rest = rest.slice(0, max - 1) + "…";
    lines.push(rest);
    return lines;
  }

  function edgePath(s, t) {
    const sy = s.y + NODE_H / 2;
    const ty = t.y + NODE_H / 2;
    if (t.col > s.col) {
      const x1 = s.x + s.w, y1 = sy, x2 = t.x - 3, y2 = ty;
      const dx = (x2 - x1) * 0.45;
      return { d: `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 - 7 };
    }
    if (t.col === s.col) {
      const x1 = s.x + s.w / 2, y1 = s.y + NODE_H, x2 = t.x + t.w / 2, y2 = t.y - 3;
      const bend = 46;
      return { d: `M ${x1} ${y1} C ${x1 + bend} ${y1 + 14}, ${x2 + bend} ${y2 - 14}, ${x2} ${y2}`, mx: x1 + bend * 0.75, my: (y1 + y2) / 2 };
    }
    const x1 = s.x, y1 = sy, x2 = t.x + t.w + 3, y2 = ty;
    const dx = (x1 - x2) * 0.45;
    return { d: `M ${x1} ${y1} C ${x1 - dx} ${y1 - 34}, ${x2 + dx} ${y2 - 34}, ${x2} ${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 - 30 };
  }

  function renderSvg(svg, result) {
    svg.replaceChildren();
    const height = viewBoxHeight(result.events);
    svg.setAttribute("viewBox", `0 0 ${W} ${height}`);
    const defs = el("defs", {}, svg);
    for (const kind of ["solid", "assume"]) {
      const marker = el("marker", {
        id: "wrm-arrow-" + kind,
        viewBox: "0 0 10 10",
        refX: 9, refY: 5,
        markerWidth: 9, markerHeight: 9,
        markerUnits: "userSpaceOnUse",
        orient: "auto"
      }, defs);
      el("path", { d: "M 0 0 L 10 5 L 0 10 z", class: "arrow-" + kind }, marker);
    }
    const pos = layout(result.events, height);
    const byId = {};
    for (const e of result.events) byId[e.id] = e;

    for (const edge of result.edges) {
      const s = pos[edge.from], t = pos[edge.to];
      if (!s || !t) continue;
      const p = edgePath(s, t);
      el("path", {
        d: p.d,
        class: "edge" + (edge.assumption ? " is-assumption" : ""),
        "stroke-width": (1 + edge.strength * 0.55).toFixed(2),
        "marker-end": `url(#wrm-arrow-${edge.assumption ? "assume" : "solid"})`
      }, svg);
      const label = el("text", { x: p.mx, y: p.my, class: "edge-label", "text-anchor": "middle" }, svg);
      label.textContent = edge.relation;
    }

    for (const e of result.events) {
      const p = pos[e.id];
      const g = el("g", { class: "node" }, svg);
      el("rect", { x: p.x, y: p.y, width: p.w, height: NODE_H }, g);
      const year = el("text", { x: p.x + 10, y: p.y + 18, class: "n-year" }, g);
      year.textContent = "第 " + e.year + " 年";
      const lines = titleLines(e.title, p.w);
      lines.forEach((line, i) => {
        const t = el("text", { x: p.x + 10, y: p.y + 36 + i * 15, class: "n-title" }, g);
        t.textContent = line;
      });
    }
  }

  function renderList(list, result) {
    list.replaceChildren();
    const byId = {};
    for (const e of result.events) byId[e.id] = e;
    for (const edge of result.edges) {
      const from = byId[edge.from], to = byId[edge.to];
      if (!from || !to) continue;
      const li = document.createElement("li");
      if (edge.assumption) li.className = "is-assumption";
      li.appendChild(document.createTextNode(from.title + " "));
      const rel = document.createElement("span");
      rel.className = "rel";
      rel.textContent = "— " + edge.relation + " → ";
      li.appendChild(rel);
      li.appendChild(document.createTextNode(to.title + (edge.assumption ? "（假设）" : "")));
      const explain = document.createElement("span");
      explain.className = "explain";
      explain.textContent = edge.explanation;
      li.appendChild(explain);
      list.appendChild(li);
    }
  }

  function renderLegend(legend) {
    legend.replaceChildren();
    const solid = document.createElement("span");
    solid.className = "line-solid";
    const dash = document.createElement("span");
    dash.className = "line-dash";
    legend.appendChild(solid);
    legend.appendChild(document.createTextNode("实线 = 规则导致"));
    legend.appendChild(dash);
    legend.appendChild(document.createTextNode("虚线 = 带假设的推断 · 线宽 = 强度"));
  }

  function render(svg, list, legend, result) {
    renderSvg(svg, result);
    renderList(list, result);
    renderLegend(legend);
  }

  global.WRM_CAUSAL = { render };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_CAUSAL;
})(typeof window !== "undefined" ? window : globalThis);