/* 第 2–6 页 · 一屏一章（只读）：100dvh 不滚动。
   只渲染 changed 事件；不足 2 件显示空态。卡片左「原来」右「现在」，点击开 fixed 浮层看 detail。
   本页不允许出现 input/select/toggle；按钮只有导航、「修改假设」、「重新生成」（AI _run）与浮层关闭。
   run.kind=local 时改写判定来自 WRM_CHAPTERS.resolve；run.kind=ai 时渲染归一后的 AI 章节。
   干预时间之前的章节不渲染：导航圆点只摆 run.ns。 */
(function (global) {
  "use strict";

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  /* 只把 keywords 命中的词包成深红 <em>，其余保持墨色 */
  function markKeywords(text, kws) {
    const frag = document.createDocumentFragment();
    let rest = text;
    while (rest.length) {
      let best = null;
      (kws || []).forEach((k) => {
        const idx = rest.indexOf(k);
        if (k && idx >= 0 && (!best || idx < best.idx)) best = { idx: idx, k: k };
      });
      if (!best) {
        frag.appendChild(document.createTextNode(rest));
        break;
      }
      if (best.idx > 0) frag.appendChild(document.createTextNode(rest.slice(0, best.idx)));
      frag.appendChild(el("em", "kw", best.k));
      rest = rest.slice(best.idx + best.k.length);
    }
    return frag;
  }

  /* ---------- 详情浮层 ---------- */

  let lastFocus = null;

  function overlayOpen() {
    return !document.getElementById("evOverlay").hidden;
  }

  function openOverlay(ev, view) {
    lastFocus = document.activeElement;
    document.getElementById("ovMeta").textContent =
      ev.yearLabel + " · " + ev.domain + " · " + view.certainty;
    document.getElementById("ovTitle").textContent = ev.title;
    document.getElementById("ovFiction").hidden = !ev.hot;
    document.getElementById("ovDetail").textContent = view.detail || view.alternate;
    document.getElementById("ovWhy").textContent = view.why;
    document.getElementById("ovChain").textContent = view.chain || "";
    document.getElementById("ovChainBlock").hidden = !view.chain;
    document.getElementById("evOverlay").hidden = false;
    document.getElementById("ovClose").focus();
  }

  function closeOverlay() {
    const ov = document.getElementById("evOverlay");
    if (ov.hidden) return;
    ov.hidden = true;
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    lastFocus = null;
  }

  function bindOverlay() {
    document.getElementById("ovClose").addEventListener("click", closeOverlay);
    document.getElementById("evOverlay").addEventListener("click", (e) => {
      if (e.target && e.target.dataset && e.target.dataset.close) closeOverlay();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && overlayOpen()) {
        e.stopPropagation();
        closeOverlay();
      }
    });
  }

  /* ---------- 事件卡 ---------- */

  function card(ev, view, index) {
    const c = el("div", "ev-card");
    c.setAttribute("role", "button");
    c.setAttribute("tabindex", "0");
    c.dataset.event = ev.id;
    c.setAttribute("aria-label", ev.title + " · 已改写 · 查看详情");
    c.style.animationDelay = (index * 40) + "ms";

    const top = el("div", "ev-top");
    top.appendChild(el("span", "ev-year mono", ev.yearLabel));
    top.appendChild(el("h3", "ev-title", ev.title));
    top.appendChild(el("span", "ev-domain mono", ev.domain));
    if (ev.track === "personal") top.appendChild(el("span", "ev-track mono", "个人线"));
    c.appendChild(top);
    c.appendChild(el("span", "stamp stamp-change", "已改写"));

    const halves = el("div", "ev-halves");

    const before = el("div", "ev-before");
    const bl = el("div", "ev-half-label");
    bl.appendChild(el("span", "mono", "原来"));
    before.appendChild(bl);
    before.appendChild(el("p", "ev-text", ev.baseline));
    halves.appendChild(before);

    const now = el("div", "ev-now");
    const nl = el("div", "ev-half-label");
    nl.appendChild(el("span", "mono", "现在"));
    nl.appendChild(el("span", "ev-more mono", "详情 ↗"));
    now.appendChild(nl);
    const nowText = el("p", "ev-text");
    nowText.appendChild(markKeywords(view.alternate, view.keywords));
    now.appendChild(nowText);
    halves.appendChild(now);

    c.appendChild(halves);

    const open = () => openOverlay(ev, view);
    c.addEventListener("click", open);
    c.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    });
    return c;
  }

  function emptyState() {
    const box = el("div", "chapter-empty");
    box.appendChild(el("p", "chapter-empty-title", "这一版没有改动"));
    box.appendChild(el("p", "chapter-empty-note mono", "规则没够着这个时代，或假设被关掉了 · 情景推演，不是史实"));
    return box;
  }

  /* ---------- 导航 ---------- */

  function renderNav(n, ns, hooks) {
    const first = ns[0];
    const last = ns[ns.length - 1];

    const prev = document.getElementById("prevChapter");
    prev.textContent = "← 上一版";
    prev.disabled = n <= first;
    prev.onclick = () => { if (n > first) hooks.onPrev(); };

    const next = document.getElementById("nextChapter");
    next.textContent = n >= last ? "回到第 1 版 ↺" : "下一版 →";
    next.onclick = () => hooks.onNext();

    const dots = document.getElementById("chapterDots");
    dots.textContent = "";
    ns.forEach((k) => {
      const b = el("button", "dot" + (k === n ? " is-on" : ""));
      b.type = "button";
      b.setAttribute("aria-label", "第 " + k + " 版");
      if (k === n) b.setAttribute("aria-current", "step");
      b.onclick = () => hooks.onDot(k);
      dots.appendChild(b);
    });
  }

  /* ---------- 渲染 ---------- */

  function render(state, chapterN, hooks, direction, run) {
    closeOverlay();

    const ns = run.ns;
    let name, subtitle, span, personal = "", items;
    if (run.kind === "ai") {
      const ch = run.chapters.find((c) => c.n === chapterN) || run.chapters[0];
      name = ch.name;
      subtitle = ch.subtitle;
      span = ch.span;
      personal = ch.personal || "";
      items = ch.events;
    } else {
      const ch = global.WRM_CHAPTERS.chapters.find((c) => c.n === chapterN)
        || global.WRM_CHAPTERS.chapters[0];
      name = ch.name;
      subtitle = ch.subtitle;
      span = ch.span;
      items = [];
      ch.events.forEach((ev) => {
        const view = global.WRM_CHAPTERS.resolve(ev, state.ruleId, state.params, state.assumptions);
        if (view.changed) items.push({ ev: ev, view: view });
      });
    }

    document.getElementById("chapterRun").textContent =
      "世界线 " + global.WRM_VERSION.runId(state.ruleId);
    document.getElementById("chapterNo").textContent = "第 " + chapterN + " 版 / 5";
    document.getElementById("chapterSource").textContent =
      run.kind === "ai" ? "由 " + run.model + " 生成" : "本地模板";
    const regen = document.getElementById("regenBtn");
    regen.hidden = run.kind !== "ai";
    regen.disabled = false;
    regen.onclick = () => hooks.onRegen();

    document.getElementById("chapterBig").textContent = pad2(chapterN);
    document.getElementById("chapterName").textContent = name;
    document.getElementById("chapterSubtitle").textContent = subtitle;
    document.getElementById("chapterSpan").textContent = span;

    const showIntervention = !!run.intervention && ns[0] > 1;
    const iv = document.getElementById("chapterIntervention");
    iv.hidden = !showIntervention;
    const recap = document.getElementById("chapterRecap");
    recap.hidden = !showIntervention;
    document.getElementById("chapterSpan").hidden = showIntervention;
    if (showIntervention) {
      const era = global.WRM_AI.eraById(run.intervention.era);
      iv.textContent = "干预点：" + (run.intervention.yearLabel || era.start) + " · " + era.name;
      recap.textContent = "前情：" + (run.recap || "");
    }

    const ps = document.getElementById("chapterPersonal");
    ps.hidden = !personal;
    ps.textContent = personal;

    document.getElementById("chapterCount").textContent =
      "本版改写 " + items.length + " 件 · " + global.WRM_CHAPTERS.meta.disclaimer;

    const body = document.getElementById("chapterBody");
    body.textContent = "";
    body.dataset.count = String(items.length);
    if (items.length < 2) {
      body.appendChild(emptyState());
    } else {
      items.forEach((item, i) => body.appendChild(card(item.ev, item.view, i)));
    }

    renderNav(chapterN, ns, hooks);
    document.getElementById("editAssumptions").onclick = () => hooks.onEdit();

    const sec = document.getElementById("chapter");
    sec.classList.remove("turn-next", "turn-prev");
    if (direction) {
      void sec.offsetWidth;
      sec.classList.add(direction === "prev" ? "turn-prev" : "turn-next");
    }
  }

  bindOverlay();
  global.WRM_CHAPTER_PAGE = { render: render, closeOverlay: closeOverlay };
})(typeof window !== "undefined" ? window : globalThis);