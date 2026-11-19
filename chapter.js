(function (global) {
  "use strict";

  const $ = (id) => document.getElementById(id);

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function markKeywords(text, keywords) {
    const frag = document.createDocumentFragment();
    const words = (Array.isArray(keywords) ? keywords : []).filter((word) => typeof word === "string" && word);
    let rest = String(text || "");
    while (rest.length) {
      let best = null;
      words.forEach((word) => {
        const index = rest.indexOf(word);
        if (index >= 0 && (!best || index < best.index || (index === best.index && word.length > best.word.length))) {
          best = { index: index, word: word };
        }
      });
      if (!best) {
        frag.appendChild(document.createTextNode(rest));
        break;
      }
      if (best.index) frag.appendChild(document.createTextNode(rest.slice(0, best.index)));
      frag.appendChild(el("em", "kw", best.word));
      rest = rest.slice(best.index + best.word.length);
    }
    return frag;
  }

  /* 详情浮层：保留原焦点，关闭后归还；Tab 与程序焦点均不能跑到背景。 */
  let lastFocus = null;
  let backgroundState = [];

  function overlayOpen() {
    const overlay = $("evOverlay");
    return !!overlay && !overlay.hidden;
  }

  function focusableInOverlay() {
    return Array.from($("evOverlay").querySelectorAll(
      'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter((node) => !node.closest("[hidden]") && node.getClientRects().length > 0);
  }

  function openOverlay(ev, view) {
    if (!overlayOpen()) {
      lastFocus = document.activeElement;
      backgroundState = Array.from(document.querySelectorAll("main, header.masthead, footer")).map((node) => {
        const wasInert = node.inert;
        node.inert = true;
        return { node: node, wasInert: wasInert };
      });
    }
    $("ovMeta").textContent = [
      ev.track === "personal" ? "个人小事" : "世界大事", ev.yearLabel, ev.domain, view.certainty
    ].filter(Boolean).join(" · ");
    $("ovTitle").textContent = ev.title || "事件详情";
    $("ovFiction").hidden = !ev.hot;
    $("ovDetail").textContent = view.detail || view.alternate || "";
    $("ovWhy").textContent = view.why || "";
    $("ovChain").textContent = view.chain || "";
    $("ovChainBlock").hidden = !view.chain;
    $("evOverlay").hidden = false;
    $("evOverlay").querySelector(".overlay-panel").scrollTop = 0;
    $("ovClose").focus({ preventScroll: true });
  }

  function closeOverlay() {
    if (!overlayOpen()) return;
    $("evOverlay").hidden = true;
    backgroundState.forEach((entry) => { entry.node.inert = entry.wasInert; });
    backgroundState = [];
    const target = lastFocus;
    lastFocus = null;
    if (target && target.isConnected && !target.closest("[hidden]") && typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }
  }

  function bindOverlay() {
    $("ovClose").addEventListener("click", closeOverlay);
    $("evOverlay").addEventListener("click", (event) => {
      if (event.target.dataset && event.target.dataset.close) closeOverlay();
    });
    document.addEventListener("keydown", (event) => {
      if (!overlayOpen()) return;
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        closeOverlay();
      } else if (event.key === "Tab") {
        const nodes = focusableInOverlay();
        const first = nodes[0] || $("ovClose");
        const last = nodes[nodes.length - 1] || first;
        const active = document.activeElement;
        if (!nodes.includes(active) || (event.shiftKey ? active === first : active === last)) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus({ preventScroll: true });
        }
      }
    }, true);
    document.addEventListener("focusin", (event) => {
      if (overlayOpen() && !$("evOverlay").contains(event.target)) {
        $("ovClose").focus({ preventScroll: true });
      }
    });
  }

  function card(ev, view, index) {
    const personal = ev.track === "personal";
    const node = el("div", "ev-card");
    node.setAttribute("role", "button");
    node.setAttribute("tabindex", "0");
    node.setAttribute("aria-haspopup", "dialog");
    node.setAttribute("aria-controls", "evOverlay");
    node.setAttribute("aria-label", (personal ? "个人小事" : "世界大事") + " · " + ev.title + " · 查看改写详情");
    node.dataset.event = ev.id;
    node.dataset.track = personal ? "personal" : "world";
    node.style.animationDelay = (index * 40) + "ms";

    const top = el("div", "ev-top");
    const meta = el("div", "ev-meta");
    meta.appendChild(el("span", "ev-year mono", ev.yearLabel));
    meta.appendChild(el("span", "ev-domain mono", ev.domain));
    const track = el("span", "ev-track mono", personal ? "私" : "世界");
    track.setAttribute("aria-label", personal ? "个人线" : "世界线");
    meta.appendChild(track);
    meta.appendChild(el("span", "stamp stamp-change", "已改写"));
    top.appendChild(meta);
    top.appendChild(el("h3", "ev-title", ev.title));
    node.appendChild(top);

    const halves = el("div", "ev-halves");
    const before = el("div", "ev-before");
    before.appendChild(el("span", "ev-half-label mono", "原来"));
    before.appendChild(el("p", "ev-text", ev.baseline));
    const now = el("div", "ev-now");
    now.appendChild(el("span", "ev-half-label mono", "现在"));
    const after = el("p", "ev-text");
    after.appendChild(markKeywords(view.alternate, view.keywords));
    now.appendChild(after);
    halves.appendChild(before);
    halves.appendChild(now);
    node.appendChild(halves);

    const open = () => openOverlay(ev, view);
    node.addEventListener("click", open);
    node.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
    return node;
  }

  function renderTrack(id, items, offset) {
    const box = $(id);
    box.replaceChildren();
    items.forEach((item, index) => box.appendChild(card(item.ev, item.view, offset + index)));
    if (!items.length) {
      box.appendChild(el("p", "track-empty", "本轨暂无事件"));
    }
  }

  function renderNav(n, ns, hooks) {
    const index = ns.indexOf(n);
    const last = index === ns.length - 1;
    const prev = $("prevChapter");
    prev.disabled = index <= 0;
    prev.onclick = () => { if (!prev.disabled) hooks.onPrev(); };

    const next = $("nextChapter");
    next.textContent = last ? (ns[0] === 1 ? "回到第 1 版 ↺" : "回到起始版 ↺") : "下一版 →";
    next.setAttribute("aria-label", last ? "回到起始版，第 " + ns[0] + " 版" : "下一版，第 " + ns[index + 1] + " 版");
    next.onclick = () => hooks.onNext();

    const dots = $("chapterDots");
    dots.replaceChildren();
    ns.forEach((k) => {
      const button = el("button", "dot" + (k === n ? " is-on" : ""));
      button.type = "button";
      button.dataset.page = String(k);
      button.setAttribute("aria-label", "第 " + k + " 版");
      if (k === n) button.setAttribute("aria-current", "step");
      button.onclick = () => hooks.onDot(k);
      dots.appendChild(button);
    });

    const poster = $("posterBtn");
    poster.classList.toggle("is-last", last);
    poster.textContent = last ? "生成本期海报" : "生成海报";
    poster.disabled = typeof hooks.onPoster !== "function";
    poster.onclick = () => { if (!poster.disabled) hooks.onPoster(); };
  }

  function render(state, n, hooks, direction, run) {
    closeOverlay();
    const ns = run.ns;
    const chapterN = ns.includes(Number(n)) ? Number(n) : ns[0];
    const chapter = run.chapters.find((entry) => entry.n === chapterN);
    if (!chapter) return;
    const firstChapter = run.chapters.find((entry) => entry.n === ns[0]) || chapter;
    const items = chapter.events.filter((item) => item.view.changed);
    const world = items.filter((item) => item.ev.track !== "personal");
    const personal = items.filter((item) => item.ev.track === "personal");

    $("chapterRun").textContent = "世界线 " + run.runId;
    $("chapterRule").textContent = run.ruleName;
    $("chapterNo").textContent = "第 " + chapterN + " 版 / 8";
    $("chapterSource").textContent = run.kind === "ai" ? "由 " + run.model + " 生成" : "本地剧本";
    $("chapterBig").textContent = String(chapterN).padStart(2, "0");
    $("chapterName").textContent = chapter.name;
    $("chapterSubtitle").textContent = chapter.subtitle || "";
    $("chapterSpan").textContent = chapter.span || "";
    $("chapterCount").textContent = "本版改写 " + items.length + " 件 · 世界 " + world.length + " / 个人 " + personal.length + " · 情景推演";

    const intervention = run.intervention || {};
    $("chapterIntervention").hidden = false;
    $("chapterIntervention").textContent = "干预点：" + [intervention.yearLabel, firstChapter.name].filter(Boolean).join(" · ");
    const recap = $("chapterRecap");
    recap.hidden = chapterN !== ns[0] || !run.recap;
    recap.textContent = recap.hidden ? "" : "前情：" + run.recap;
    $("chapterPersonal").hidden = !chapter.personal;
    $("chapterPersonal").textContent = chapter.personal || "";

    $("chapterBody").dataset.count = String(items.length);
    renderTrack("worldCards", world, 0);
    renderTrack("personalCards", personal, world.length);
    renderNav(chapterN, ns, hooks);
    $("editAssumptions").onclick = () => hooks.onEdit();

    const section = $("chapter");
    section.dataset.era = chapter.era || "";
    section.classList.remove("turn-next", "turn-prev");
    if (direction) {
      void section.offsetWidth;
      section.classList.add(direction === "prev" ? "turn-prev" : "turn-next");
    }
  }

  bindOverlay();
  global.WRM_CHAPTER_PAGE = { render: render, closeOverlay: closeOverlay, overlayOpen: overlayOpen };
})(typeof window !== "undefined" ? window : globalThis);
