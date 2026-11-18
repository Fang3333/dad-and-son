/* 第 2–6 页 · 分版长河（只读）：每版一页，章头 + 世界切片 + 事件卡 + 底部导航。
   本页不允许出现 input/select/toggle；唯一按钮是导航（上一版/下一版/圆点）、「修改假设」与连锁反应展开。
   世界名来自引擎 report.title；改写判定来自 WRM_CHAPTERS.resolve。 */
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

  function renderNav(chapter, hooks) {
    const total = global.WRM_CHAPTERS.chapters.length;
    const n = chapter.n;

    const prev = document.getElementById("prevChapter");
    prev.textContent = "← 上一版";
    prev.disabled = n <= 1;
    prev.onclick = () => { if (n > 1) hooks.onPrev(); };

    const next = document.getElementById("nextChapter");
    next.textContent = n >= total ? "回到第 1 版 ↺" : "下一版 →";
    next.onclick = () => hooks.onNext();

    const dots = document.getElementById("chapterDots");
    dots.textContent = "";
    global.WRM_CHAPTERS.chapters.forEach((c) => {
      const b = el("button", "dot" + (c.n === n ? " is-on" : ""));
      b.type = "button";
      b.setAttribute("aria-label", "第 " + c.n + " 版 · " + c.name);
      if (c.n === n) b.setAttribute("aria-current", "step");
      b.onclick = () => hooks.onDot(c.n);
      dots.appendChild(b);
    });
  }

  function render(state, chapterN, hooks) {
    const chapter = global.WRM_CHAPTERS.chapters.find((c) => c.n === chapterN)
      || global.WRM_CHAPTERS.chapters[0];

    const result = global.WRM_ENGINE.evaluate(state.ruleId, state.params);
    document.getElementById("chapterWorld").textContent = result.report.title;
    document.getElementById("chapterRun").textContent =
      "世界线 " + global.WRM_VERSION.runId(state.ruleId);

    const rule = global.WRM_SETUP.ruleById(state.ruleId);
    const paramsText = onLabels(rule.params, (p) => !!state.params[p.id]);
    const assumeText = onLabels(global.WRM_CHAPTERS.assumptions, (a) => state.assumptions[a.id] !== false);
    document.getElementById("chapterSummary").textContent =
      "规则：" + rule.title + " ｜ 参数：" + paramsText + " ｜ 假设：" + assumeText;

    document.getElementById("chapterNo").textContent = "第 " + chapter.n + " 版 / " + global.WRM_CHAPTERS.chapters.length;
    document.getElementById("chapterName").textContent = chapter.name;
    document.getElementById("chapterSpan").textContent = chapter.span;
    document.getElementById("chapterSubtitle").textContent = chapter.subtitle;
    document.getElementById("chapterIntro").textContent = chapter.intro;
    const cs = global.WRM_CHAPTERS.chapterSummary(chapter, state.ruleId, state.params, state.assumptions);
    document.getElementById("chapterCount").textContent =
      "本章改写 " + cs.changed + " / " + cs.total + " 件 · " + global.WRM_CHAPTERS.meta.disclaimer;

    const body = document.getElementById("chapterBody");
    body.textContent = "";
    chapter.events.forEach((ev) => {
      const view = global.WRM_CHAPTERS.resolve(ev, state.ruleId, state.params, state.assumptions);
      body.appendChild(card(ev, view));
    });

    renderNav(chapter, hooks);
    document.getElementById("editAssumptions").onclick = () => hooks.onEdit();
  }

  global.WRM_CHAPTER_PAGE = { render: render };
})(typeof window !== "undefined" ? window : globalThis);