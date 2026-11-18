/* 第 2–6 页 · 一屏一章（只读）：100dvh 不滚动。
   只渲染 changed 事件；不足 2 件显示空态。卡片左「原来」右「现在」，点击开 fixed 浮层看 detail。
   本页不允许出现 input/select/toggle；唯一按钮是导航（上一版/下一版/圆点）、「修改假设」与浮层关闭。
   改写判定来自 WRM_CHAPTERS.resolve；世界线编号来自 WRM_VERSION.runId。 */
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
    document.getElementById("ovChain").textContent = view.chain;
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

  /* ---------- 渲染 ---------- */

  function render(state, chapterN, hooks, direction) {
    closeOverlay();

    const chapter = global.WRM_CHAPTERS.chapters.find((c) => c.n === chapterN)
      || global.WRM_CHAPTERS.chapters[0];
    const total = global.WRM_CHAPTERS.chapters.length;

    document.getElementById("chapterRun").textContent =
      "世界线 " + global.WRM_VERSION.runId(state.ruleId);
    document.getElementById("chapterNo").textContent = "第 " + chapter.n + " 版 / " + total;
    document.getElementById("chapterBig").textContent = pad2(chapter.n);
    document.getElementById("chapterName").textContent = chapter.name;
    document.getElementById("chapterSubtitle").textContent = chapter.subtitle;
    document.getElementById("chapterSpan").textContent = chapter.span;

    const changed = [];
    chapter.events.forEach((ev) => {
      const view = global.WRM_CHAPTERS.resolve(ev, state.ruleId, state.params, state.assumptions);
      if (view.changed) changed.push({ ev: ev, view: view });
    });

    document.getElementById("chapterCount").textContent =
      "本版改写 " + changed.length + " 件 · " + global.WRM_CHAPTERS.meta.disclaimer;

    const body = document.getElementById("chapterBody");
    body.textContent = "";
    body.dataset.count = String(changed.length);
    if (changed.length < 2) {
      body.appendChild(emptyState());
    } else {
      changed.forEach((item, i) => body.appendChild(card(item.ev, item.view, i)));
    }

    renderNav(chapter, hooks);
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