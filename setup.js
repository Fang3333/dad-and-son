/* 第 1 页 · 设定：选规则（3 内置 + 自定义）/ 调四参数 / 干预时间 / 设三假设。
   全站唯一有表单控件的页面。只渲染与回调，不持有状态；状态由 app.js 保管并写 localStorage。
   AI 唯一通道 = 站点公共代理（访客免填 Key）；顶部 pill 显示代理可用性，由 app.js 探测后写入。 */
(function (global) {
  "use strict";

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  let currentState = null;
  const proxy = { available: null, configured: true };

  function ruleById(id) {
    if (id === "custom") {
      return { id: "custom", title: "自定义规则", category: "AI 规则", premise: "自己写一条规则，AI 推演世界线", params: [], question: "" };
    }
    return global.WRM_DATA.rules.find((r) => r.id === id) || global.WRM_DATA.rules[0];
  }

  function defaultParams(rule) {
    const p = {};
    (rule.params || []).forEach((x) => { p[x.id] = !!x.default; });
    return p;
  }

  function customValid(state) {
    const c = state.custom;
    if (!c || !c.name || !c.name.trim()) return false;
    return (c.params || []).length === 4 && c.params.every((p) => p.label && p.label.trim());
  }

  function refreshVersion(ruleId) {
    const slot = document.getElementById("setupVersion");
    if (!slot) return;
    const v = global.WRM_VERSION;
    slot.textContent = v.current() > 0
      ? "世界线 " + v.runId(ruleId) + " · 再生成编号 +1"
      : "世界线尚未生成 · 点下方按钮出第 1 版";
  }

  function renderRules(state, hooks) {
    const box = document.getElementById("ruleCards");
    box.textContent = "";
    const rules = global.WRM_DATA.rules.concat([ruleById("custom")]);
    rules.forEach((r) => {
      const card = el("button", "rule-card" + (r.id === state.ruleId ? " is-on" : ""));
      card.type = "button";
      card.dataset.rule = r.id;
      card.setAttribute("aria-pressed", r.id === state.ruleId ? "true" : "false");
      card.appendChild(el("span", "rule-cat mono", r.category));
      card.appendChild(el("strong", "rule-title", r.title));
      card.appendChild(el("span", "rule-premise", r.premise));
      card.addEventListener("click", () => {
        if (state.ruleId === r.id) return;
        state.ruleId = r.id;
        state.params = r.id === "custom" ? customParamMap(state) : defaultParams(r);
        renderRules(state, hooks);
        renderCustom(state, hooks);
        renderParams(state, hooks);
        refreshVersion(state.ruleId);
        refreshGen(state);
        hooks.onChange();
      });
      box.appendChild(card);
    });
  }

  function customParamMap(state) {
    const p = {};
    (state.custom.params || []).forEach((x) => { p[x.key] = !!x.value; });
    return p;
  }

  function switchRow(label, note, on, onFlip) {
    const row = el("div", "switch-row");
    const btn = el("button", "switch" + (on ? " is-on" : ""));
    btn.type = "button";
    btn.setAttribute("role", "switch");
    btn.setAttribute("aria-checked", on ? "true" : "false");
    btn.setAttribute("aria-label", label);
    btn.appendChild(el("span", "switch-state mono", on ? "开" : "关"));
    btn.addEventListener("click", () => {
      const next = btn.getAttribute("aria-checked") !== "true";
      btn.setAttribute("aria-checked", next ? "true" : "false");
      btn.classList.toggle("is-on", next);
      btn.querySelector(".switch-state").textContent = next ? "开" : "关";
      onFlip(next);
    });
    const txt = el("div", "switch-text");
    txt.appendChild(el("span", "switch-label", label));
    if (note) txt.appendChild(el("span", "switch-note", note));
    row.appendChild(btn);
    row.appendChild(txt);
    return row;
  }

  function renderCustom(state, hooks) {
    const desk = document.getElementById("customDesk");
    desk.hidden = state.ruleId !== "custom";
    if (desk.hidden) return;
    const name = document.getElementById("customName");
    const desc = document.getElementById("customDesc");
    name.value = state.custom.name || "";
    desc.value = state.custom.description || "";
    name.oninput = () => { state.custom.name = name.value; refreshGen(state); hooks.onChange(); };
    desc.oninput = () => { state.custom.description = desc.value; hooks.onChange(); };

    const box = document.getElementById("customParams");
    box.textContent = "";
    state.custom.params.forEach((p, i) => {
      const row = el("div", "custom-param");
      const input = el("input", "api-input");
      input.type = "text";
      input.maxLength = 12;
      input.placeholder = "参数 " + (i + 1) + " 名称（必填）";
      input.value = p.label || "";
      input.setAttribute("aria-label", "参数 " + (i + 1) + " 名称");
      input.oninput = () => { p.label = input.value; refreshGen(state); hooks.onChange(); };
      row.appendChild(input);
      row.appendChild(switchRow("参数 " + (i + 1) + " 开关", null, !!p.value, (next) => {
        p.value = next;
        state.params[p.key] = next;
        hooks.onChange();
      }));
      box.appendChild(row);
    });
  }

  function renderParams(state, hooks) {
    const block = document.getElementById("paramBlock");
    block.hidden = state.ruleId === "custom";
    if (block.hidden) return;
    const rule = ruleById(state.ruleId);
    document.getElementById("paramNote").textContent = rule.question;
    const box = document.getElementById("paramToggles");
    box.textContent = "";
    rule.params.forEach((p) => {
      box.appendChild(switchRow(p.label, p.note, !!state.params[p.id], (next) => {
        state.params[p.id] = next;
        hooks.onChange();
      }));
    });
  }

  function renderIntervention(state, hooks) {
    const box = document.getElementById("eraBtns");
    box.textContent = "";
    global.WRM_AI.ERAS.forEach((era) => {
      const b = el("button", "era-btn" + (state.intervention.era === era.id ? " is-on" : ""));
      b.type = "button";
      b.dataset.era = era.id;
      b.textContent = era.name;
      b.setAttribute("aria-pressed", state.intervention.era === era.id ? "true" : "false");
      b.onclick = () => {
        state.intervention.era = era.id;
        renderIntervention(state, hooks);
        hooks.onChange();
      };
      box.appendChild(b);
    });
    const year = document.getElementById("yearInput");
    year.value = state.intervention.yearLabel || "";
    year.oninput = () => {
      state.intervention.yearLabel = year.value.trim();
      interventionNote(state);
      hooks.onChange();
    };
    interventionNote(state);
  }

  function interventionNote(state) {
    const era = global.WRM_AI.eraById(state.intervention.era);
    const slot = document.getElementById("interventionNote");
    slot.textContent = era.n === 1
      ? "从原始起改写；五个版本全显示。"
      : "从" + era.name + "（" + (state.intervention.yearLabel || era.start) + "）起改写；之前的章节不显示。";
  }

  function renderAssumptions(state, hooks) {
    const box = document.getElementById("assumeToggles");
    box.textContent = "";
    global.WRM_CHAPTERS.assumptions.forEach((a) => {
      box.appendChild(switchRow(a.label, a.note, state.assumptions[a.id] !== false, (next) => {
        state.assumptions[a.id] = next;
        hooks.onChange();
      }));
    });
  }

  /* ---------- 生成按钮门控 ---------- */

  function refreshGen(state) {
    const custom = state.ruleId === "custom";
    const valid = customValid(state);
    const ai = document.getElementById("aiGenerateBtn");
    const local = document.getElementById("localBtn");
    ai.disabled = custom && !valid;
    local.disabled = custom;
    const note = document.getElementById("genNote");
    if (custom && !valid) note.textContent = "填好规则名称和四个参数名，才能用 AI 生成";
    else if (custom) note.textContent = "自定义规则只走 AI（公共代理，免填 Key）；生成失败会提示改用内置规则";
    else note.textContent = "";
    renderProxyPill();
  }

  function renderProxyPill() {
    const pill = document.getElementById("apiPill");
    if (!pill) return;
    pill.classList.remove("is-ok", "is-err");
    if (proxy.available === null) {
      pill.textContent = "公共 AI 代理 · 检测中…";
    } else if (proxy.available && proxy.configured) {
      pill.textContent = "公共 AI 代理 · deepseek-chat · 免填 Key";
      pill.classList.add("is-ok");
    } else if (proxy.available) {
      pill.textContent = "公共 AI 代理 · 未配置 Key";
      pill.classList.add("is-err");
    } else {
      pill.textContent = "公共 AI 代理不可用 · 本地模板仍可玩";
      pill.classList.add("is-err");
    }
  }

  function setProxy(h) {
    proxy.available = !!(h && h.available);
    proxy.configured = !h || h.configured !== false;
    renderProxyPill();
    if (currentState) refreshGen(currentState);
  }

  function note(text) {
    document.getElementById("genNote").textContent = text || "";
  }

  function showFallback(on) {
    document.getElementById("fallbackBtn").hidden = !on;
  }

  function busy(on) {
    const ai = document.getElementById("aiGenerateBtn");
    const local = document.getElementById("localBtn");
    ai.textContent = on ? "生成中…（最长 80 秒）" : "用 AI 生成这个世界 →";
    if (on) {
      ai.disabled = true;
      local.disabled = true;
    } else if (currentState) {
      refreshGen(currentState);
    }
  }

  function render(state, hooks) {
    currentState = state;
    renderRules(state, hooks);
    renderCustom(state, hooks);
    renderParams(state, hooks);
    renderIntervention(state, hooks);
    renderAssumptions(state, hooks);
    refreshVersion(state.ruleId);
    refreshGen(state);
    document.getElementById("aiGenerateBtn").onclick = () => hooks.onGenerateAI();
    document.getElementById("localBtn").onclick = () => hooks.onGenerateLocal();
    document.getElementById("fallbackBtn").onclick = () => hooks.onFallback();
  }

  global.WRM_SETUP = {
    render: render,
    refreshVersion: refreshVersion,
    refreshGen: refreshGen,
    setProxy: setProxy,
    defaultParams: defaultParams,
    ruleById: ruleById,
    customValid: customValid,
    customParamMap: customParamMap,
    note: note,
    showFallback: showFallback,
    busy: busy
  };
})(typeof window !== "undefined" ? window : globalThis);