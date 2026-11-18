/* 第 2 页 · 长河（只读）：5 时代 × 事件卡，固定三段 原来/现在/为什么 + 可展开连锁反应。
   本页不允许出现 input/select/toggle；唯一按钮是「修改假设」，唯一展开件是连锁反应。
   世界名来自引擎 report.title；改写判定来自 WRM_RIVER.resolve。 */
(function (global) {
  "use strict";

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function onLabels(items, isOn) {
    const on = items.filter(isOn).map((x) => x.label);
    if (!on.length) return "全关";
    return on.join(" · ") + (on.length < items.length ? "（其余关）" : "");
  }

  function renderSummary(state) {
    const rule = global.WRM_SETUP.ruleById(state.ruleId);
    const paramsText = onLabels(rule.params, (p) => !!state.params[p.id]);
    const assumeText = onLabels(global.WRM_RIVER.assumptions, (a) => state.assumptions[a.id] !== false);
    document.getElementById("riverSummary").textContent =
      "规则：" + rule.title + " ｜ 参数：" + paramsText + " ｜ 假设：" + assumeText;
    const s = global.WRM_RIVER.summary(state.ruleId, state.params, state.assumptions);
    document.getElementById("riverCount").textContent =
      "本版改写 " + s.changed + " / " + s.total + " 件 · " + global.WRM_RIVER.meta.disclaimer;
  }

  function row(label, text, cls) {
    const r = el("div", "ev-row" + (cls ? " " + cls : ""));
    r.appendChild(el("span", "ev-label mono", label));
    r.appendChild(el("p", "ev-text", text));
    return r;
  }

  function card(ev, view) {
    const c = el("article", "ev-card " + (view.changed ? "is-changed" : "is-same"));
    c.dataset.event = ev.id;
    c.dataset.changed = view.changed ? "1" : "0";

    const head = el("div", "ev-head");
    head.appendChild(el("span", "ev-year mono", ev.yearLabel));
    head.appendChild(el("h4", "ev-title", ev.title));
    head.appendChild(el("span", "ev-domain mono", ev.domain));
    head.appendChild(el("span", "ev-cert mono", view.certainty));
    head.appendChild(el("span", "stamp " + (view.changed ? "stamp-change" : "stamp-same"), view.changed ? "已改写" : "未改写"));
    if (ev.hot) head.appendChild(el("span", "stamp stamp-fiction", "虚构"));
    c.appendChild(head);

    c.appendChild(el("p", "ev-big", ev.bigEvent));
    c.appendChild(row("原来", ev.baseline));
    c.appendChild(row("现在", view.alternate, "ev-now"));
    c.appendChild(row("为什么", view.why));

    if (ev.hot) {
      const tags = el("p", "ev-hotnote mono");
      tags.textContent = "代号人物 · 虚构改写，勿对号入座 · " + ev.hotTags.join(" / ");
      c.appendChild(tags);
    }

    const desk = el("details", "ev-chain");
    desk.appendChild(el("summary", "mono", "连锁反应"));
    desk.appendChild(el("p", "ev-text", view.chain));
    c.appendChild(desk);
    return c;
  }

  function render(state, hooks) {
    const result = global.WRM_ENGINE.evaluate(state.ruleId, state.params);
    const world = document.getElementById("riverWorld");
    world.textContent = result.report.title;
    document.getElementById("riverVersion").textContent =
      global.WRM_VERSION.label() + " · " + global.WRM_VERSION.semver();
    renderSummary(state);

    const body = document.getElementById("riverBody");
    body.textContent = "";
    global.WRM_RIVER.eras.forEach((era) => {
      const sec = el("section", "era-block");
      const head = el("header", "era-head");
      head.appendChild(el("h3", "era-name", era.name));
      head.appendChild(el("span", "era-span mono", era.span));
      sec.appendChild(head);
      global.WRM_RIVER.events
        .filter((ev) => ev.era === era.id)
        .forEach((ev) => {
          const view = global.WRM_RIVER.resolve(ev, state.ruleId, state.params, state.assumptions);
          sec.appendChild(card(ev, view));
        });
      body.appendChild(sec);
    });

    document.getElementById("editAssumptions").onclick = () => hooks.onEdit();
  }

  global.WRM_RIVER_PAGE = { render: render };
})(typeof window !== "undefined" ? window : globalThis);