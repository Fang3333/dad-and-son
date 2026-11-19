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
    $("ovArchive").replaceChildren();
    $("ovArchive").hidden = true;
    $("ovWhyBlock").hidden = false;
    $("ovMeta").textContent = [
      ev.track === "personal" ? "生活短讯" : "本版要闻", ev.yearLabel, ev.domain, view.certainty
    ].filter(Boolean).join(" · ");
    $("ovTitle").textContent = ev.title || "事件详情";
    $("ovFiction").hidden = !ev.hot;
    const names = (ev.ruleTags || []).map((id) => { const rule = global.WRM_PRESETS.byId(id); return rule ? rule.name : id; });
    const dormant = (ev.dormant || []).map((id) => { const rule = global.WRM_PRESETS.byId(id); return rule ? rule.name : id; });
    $("ovDetail").textContent = (ev.baseline ? "原来：" + ev.baseline + "\n\n" : "") + (view.detail || view.alternate || "") + (names.length ? "\n涉及规则：" + names.join("、") + "。" : "") + (dormant.length ? "\n尚未生效：" + dormant.join("、") + "。" : "");
    $("ovWhy").textContent = (view.why || "") + (typeof ev.conflict === "string" && ev.conflict ? "\n冲突裁定：" + ev.conflict : "");
    $("ovChain").textContent = view.chain || "";
    $("ovChainBlock").hidden = !view.chain;
    $("evOverlay").hidden = false;
    $("evOverlay").querySelector(".overlay-panel").scrollTop = 0;
    $("ovClose").focus({ preventScroll: true });
  }

  function openArchive(edition, chapter) {
    openOverlay({ title: "本版存档", yearLabel: chapter.name }, { detail: "沿用的后果和暂未生效的规则保留在这里，不计作本版新消息。", certainty: "情景推演" });
    $("ovWhyBlock").hidden = true;
    const archive = $("ovArchive");
    archive.hidden = false;
    const entries = edition.carried.concat(edition.dormant.map((item) => ({ item, reason: "尚未生效" })));
    entries.forEach(({ item, reason }) => {
      const section = el("section", "archive-entry");
      section.appendChild(el("p", "archive-reason mono", reason));
      section.appendChild(el("h4", "archive-title", item.ev.title));
      section.appendChild(el("p", "archive-news", item.view.alternate));
      section.appendChild(el("p", "archive-baseline", "原来：" + item.ev.baseline));
      section.appendChild(el("p", "archive-detail", item.view.detail));
      const rules = item.ev.ruleTags.map((id) => global.WRM_PRESETS.byId(id).name);
      section.appendChild(el("p", "archive-rules", "涉及规则：" + rules.join("、")));
      archive.appendChild(section);
    });
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
    node.setAttribute("aria-label", (personal ? "生活短讯" : "本版要闻") + " · " + ev.title + " · 查看改写详情");
    node.dataset.event = ev.id;
    node.dataset.track = personal ? "personal" : "world";
    node.style.animationDelay = (index * 40) + "ms";

    const top = el("div", "ev-top");
    const meta = el("div", "ev-meta");
    meta.appendChild(el("span", "ev-domain mono", ev.domain));
    if (!personal) meta.appendChild(el("span", "ev-rulecount mono", ev.ruleTags.length + " 条规则"));
    if (ev.conflict) meta.appendChild(el("span", "stamp", "冲突"));
    top.appendChild(meta);
    top.appendChild(el("h3", "ev-title", ev.title));
    if (!personal && ev.ruleTags && ev.ruleTags.length) {
      const tags = el("div", "rule-tags");
      ev.ruleTags.slice(0, 2).forEach((id) => {
        const rule = global.WRM_PRESETS.byId(id);
        const tag = el("span", "rule-tag", rule ? rule.name : id);
        tag.dataset.rule = id;
        tags.appendChild(tag);
      });
      if (ev.ruleTags.length > 2) tags.appendChild(el("span", "tag-more", "+" + (ev.ruleTags.length - 2)));
      top.appendChild(tags);
    }
    node.appendChild(top);

    const body = el("div", "ev-body");
    const before = el("p", "ev-before", "原来 · " + ev.baseline);
    const after = el("p", "ev-news");
    after.appendChild(markKeywords(view.alternate, view.keywords));
    body.appendChild(before);
    body.appendChild(after);
    node.appendChild(body);

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
    box.dataset.count = String(items.length);
    items.forEach((item, index) => box.appendChild(card(item.ev, item.view, offset + index)));
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
      const era = global.WRM_PRESETS.ERAS.find((entry) => entry.n === k);
      button.setAttribute("aria-label", "第 " + k + " 版 · " + era.name);
      button.title = era.name;
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

  let pageAnimations = [], outgoingPage = null;
  const motion = global.matchMedia("(prefers-reduced-motion: reduce)");

  function cancelTransition() {
    pageAnimations.forEach((animation) => animation.cancel());
    pageAnimations = [];
    if (outgoingPage) outgoingPage.remove();
    outgoingPage = null;
  }
  motion.addEventListener("change", cancelTransition);
  global.addEventListener("resize", cancelTransition);

  function capturePage(direction) {
    cancelTransition();
    if (!direction || motion.matches || $("chapter").hidden) return null;
    const main = document.querySelector(".chapter-main");
    const rect = main.getBoundingClientRect();
    const pageRect = $("chapter").getBoundingClientRect();
    const copy = main.cloneNode(true);
    copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach((node) => node.removeAttribute("id"));
    copy.querySelectorAll("[tabindex]").forEach((node) => node.setAttribute("tabindex", "-1"));
    copy.classList.add("page-leaf");
    copy.setAttribute("aria-hidden", "true");
    copy.inert = true;
    Object.assign(copy.style, { left: (rect.left - pageRect.left) + "px", top: (rect.top - pageRect.top) + "px", width: rect.width + "px", height: rect.height + "px" });
    const colors = global.getComputedStyle(main);
    copy.style.setProperty("--edition-ink", colors.getPropertyValue("--edition-ink"));
    copy.style.setProperty("--edition-paper", colors.getPropertyValue("--edition-paper"));
    return copy;
  }

  function turnPage(copy, direction) {
    if (!copy) return;
    const main = document.querySelector(".chapter-main");
    const step = direction === "prev" ? -1 : 1;
    copy.style.height = Math.min(parseFloat(copy.style.height), main.getBoundingClientRect().height) + "px";
    $("chapter").appendChild(copy);
    outgoingPage = copy;
    const timing = { duration: 360, easing: "cubic-bezier(.22,.7,.2,1)" };
    const leave = copy.animate([
      { transform: "translateX(0)", opacity: 1 },
      { transform: "translateX(" + (-step * 42) + "px)", opacity: 0 }
    ], timing);
    const enter = main.animate([
      { transform: "translateX(" + (step * 42) + "px)", opacity: 0 },
      { transform: "translateX(0)", opacity: 1 }
    ], timing);
    pageAnimations = [leave, enter];
    leave.onfinish = () => {
      copy.remove();
      if (outgoingPage === copy) { outgoingPage = null; pageAnimations = []; }
    };
  }

  function editionSummary(chapter, edition) {
    const carried = edition.carried.map((entry) => entry.item);
    const lead = carried.find((item) => item.ev.track === "world") || carried[0];
    if (lead) return chapter.name + "，" + lead.view.alternate;
    const dormant = edition.dormant[0];
    return dormant ? "本版规则尚缺生效条件：" + dormant.view.why : "本版没有新增后果，已有安排继续运行。";
  }

  function render(state, n, hooks, direction, run) {
    closeOverlay();
    const ns = run.ns;
    const chapterN = ns.includes(Number(n)) ? Number(n) : ns[0];
    const chapter = run.chapters.find((entry) => entry.n === chapterN);
    if (!chapter) return;
    const previousPage = capturePage(direction);
    const firstChapter = run.chapters.find((entry) => entry.n === ns[0]) || chapter;
    const edition = global.WRM_PRESETS.edition(run, chapterN);
    const items = edition.visible;
    const world = items.filter((item) => item.ev.track !== "personal");
    const personal = items.filter((item) => item.ev.track === "personal");

    $("chapterRun").textContent = "世界线 " + run.id.slice(3);
    $("chapterRule").textContent = run.ruleName;
    $("chapterNo").textContent = "第 " + chapterN + " 版 / 10";
    $("chapterPath").textContent = "路径 " + (run.path || "尚无分叉");
    const select = $("runSelect");
    select.replaceChildren();
    hooks.runs.forEach((entry) => {
      const option = el("option", "", "世界线 " + entry.id.slice(3) + " · " + (entry.path || "起始"));
      option.value = entry.id;
      select.appendChild(option);
    });
    select.value = run.id;
    select.disabled = hooks.busy;
    select.onchange = () => hooks.onSelectRun(select.value);
    $("chapterSource").textContent = run.kind === "ai" ? "由 " + run.model + " 生成" : "冷面号外 · 本地剧本";
    $("chapterBig").textContent = String(chapterN).padStart(2, "0");
    $("chapterName").textContent = chapter.name;
    $("chapterSubtitle").textContent = items.length ? items[0].ev.title + "。" : "世界没停，只是暂时没有新麻烦。";
    const preceding = run.chapters.find((entry) => entry.n === ns[ns.indexOf(chapterN) - 1]);
    $("chapterBridge").textContent = preceding ? preceding.name + " → " + chapter.name : "从这里改写世界";
    $("editionLabel").textContent = chapterN >= 8 ? "未来特刊 · 假设" : "平行档案 · 假设";
    $("emptySummary").textContent = editionSummary(chapter, edition);
    $("emptyNote").textContent = edition.carried.length ? "以上为沿用近况，不计作新增新闻。旧闻全文见本版存档。" : "待生效的规则保留在存档中，不编造已经发生的后果。";
    $("chapterSpan").textContent = chapter.span || "";
    $("chapterCount").textContent = "新消息 " + items.length + " 则 · " + (chapterN >= 8 ? "未来畅想" : "情景推演");

    const intervention = run.intervention || {};
    $("chapterIntervention").hidden = false;
    $("chapterIntervention").textContent = "干预点：" + [intervention.yearLabel, firstChapter.name].filter(Boolean).join(" · ");
    const recap = $("chapterRecap");
    recap.hidden = chapterN !== ns[0] || !run.recap;
    recap.textContent = recap.hidden ? "" : "前情：" + run.recap;
    $("worldSection").hidden = !world.length;
    $("personalSection").hidden = !personal.length;
    $("editionEmpty").hidden = !!items.length;
    const body = $("chapterBody");
    body.dataset.count = String(items.length);
    body.dataset.world = String(world.length);
    body.dataset.personal = String(personal.length);
    const archiveCount = edition.carried.length + edition.dormant.length;
    $("editionArchive").hidden = !archiveCount;
    $("archiveNote").textContent = [edition.carried.length ? "沿用 " + edition.carried.length + " 则" : "", edition.dormant.length ? "待生效 " + edition.dormant.length + " 则" : ""].filter(Boolean).join(" · ");
    $("archiveBtn").onclick = () => openArchive(edition, chapter);
    $("archiveBtn").disabled = hooks.busy;
    renderTrack("worldCards", world, 0);
    renderTrack("personalCards", personal, world.length);
    renderNav(chapterN, ns, hooks);
    const branch = global.WRM_PRESETS.BRANCHES.find((point) => point.n === chapterN);
    $("branchPoint").hidden = !branch;
    $("branchOptions").replaceChildren();
    if (branch) {
      $("branchTitle").textContent = "分叉点 · " + chapter.name;
      $("branchNote").textContent = "选择后生成新世界线，当前线保留。";
      branch.options.forEach((option) => {
        const chosen = run.recipe.branchPath.includes(option.key);
        const button = el("button", "text-btn branch-option" + (chosen ? " is-on" : ""), option.label);
        button.type = "button";
        button.dataset.branch = option.key;
        button.setAttribute("aria-pressed", String(chosen));
        button.disabled = hooks.busy || chosen;
        button.onclick = () => hooks.onBranch(option.key);
        $("branchOptions").appendChild(button);
      });
    }
    $("editAssumptions").disabled = hooks.busy;
    $("editAssumptions").onclick = () => hooks.onEdit();

    const section = $("chapter");
    section.dataset.era = chapter.era || "";
    section.dataset.future = String(chapterN >= 8);
    section.dataset.direction = direction || "";
    $("chapterDots").style.setProperty("--progress", ns.length > 1 ? (ns.indexOf(chapterN) / (ns.length - 1) * 100) + "%" : "0%");
    turnPage(previousPage, direction);
  }

  bindOverlay();
  global.WRM_CHAPTER_PAGE = { render, closeOverlay, overlayOpen, cancelTransition };
})(typeof window !== "undefined" ? window : globalThis);
