/* 第 1 页 · 设定：选规则（3 内置 + 自定义）/ 调四参数 / 干预时间 / 设三假设 / API 设置弹窗。
   全站唯一有表单控件的页面。只渲染与回调，不持有状态；状态由 app.js 保管并写 localStorage。
   Key 只经 WRM_AI 存浏览器；弹窗里 Key 输入框留空表示沿用已保存的 Key，DOM 文本只出现后 4 位掩码。 */
(function (global) {
  "use strict";

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  let currentState = null;

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
    const s = global.WRM_AI.loadSettings();
    const has = global.WRM_AI.hasKey(s);
    const custom = state.ruleId === "custom";
    const valid = customValid(state);
    const ai = document.getElementById("aiGenerateBtn");
    const local = document.getElementById("localBtn");
    ai.disabled = custom && (!has || !valid);
    local.disabled = custom;
    const note = document.getElementById("genNote");
    if (custom && !has) note.textContent = "自定义规则需要 API Key";
    else if (custom && !valid) note.textContent = "填好规则名称和四个参数名，才能用 AI 生成";
    else if (custom) note.textContent = "自定义规则只走 AI；生成失败会提示改用内置规则";
    else note.textContent = "";
    document.getElementById("apiPill").textContent = has
      ? s.model + " · " + global.WRM_AI.masked(s.apiKey)
      : "未配置 API Key";
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
    ai.textContent = on ? "生成中…（最长 30 秒）" : "用 AI 生成这个世界 →";
    if (on) {
      ai.disabled = true;
      local.disabled = true;
    } else if (currentState) {
      refreshGen(currentState);
    }
  }

  /* ---------- API 设置弹窗 ---------- */

  let dlg = null;
  let apiLastFocus = null;
  let apiBound = false;

  function apiOpen() {
    return !document.getElementById("apiOverlay").hidden;
  }

  function fillModelOptions(models, current) {
    const sel = document.getElementById("apiModel");
    sel.textContent = "";
    const list = models.slice();
    if (current && list.indexOf(current) < 0) list.unshift(current);
    if (!list.length) list.push(current || global.WRM_AI.DEFAULTS.model);
    list.forEach((m) => {
      const o = el("option", null, m);
      o.value = m;
      sel.appendChild(o);
    });
    sel.value = current && list.indexOf(current) >= 0 ? current : list[0];
  }

  function openApi() {
    dlg = global.WRM_AI.loadSettings();
    apiLastFocus = document.activeElement;
    document.getElementById("apiProvider").value = dlg.provider;
    document.getElementById("apiBaseUrl").value = dlg.baseUrl;
    const key = document.getElementById("apiKey");
    key.value = "";
    key.type = "password";
    key.placeholder = dlg.apiKey ? "已保存 " + global.WRM_AI.masked(dlg.apiKey) + "（留空沿用）" : "sk-…";
    document.getElementById("apiKeyToggle").textContent = "显示";
    fillModelOptions([dlg.model], dlg.model);
    document.getElementById("apiModel").hidden = false;
    document.getElementById("apiModelManual").hidden = true;
    document.getElementById("apiModelNote").textContent = "";
    document.getElementById("apiTemp").value = String(dlg.temperature);
    document.getElementById("apiTempVal").textContent = String(dlg.temperature);
    document.getElementById("apiRemember").checked = !dlg.remember;
    const msg = document.getElementById("apiTestMsg");
    msg.textContent = "";
    msg.className = "api-testmsg mono";
    document.getElementById("apiOverlay").hidden = false;
    key.focus();
  }

  function closeApi() {
    const ov = document.getElementById("apiOverlay");
    if (ov.hidden) return;
    ov.hidden = true;
    dlg = null;
    if (apiLastFocus && typeof apiLastFocus.focus === "function") apiLastFocus.focus();
    apiLastFocus = null;
  }

  function collect() {
    const manual = document.getElementById("apiModelManual");
    const sel = document.getElementById("apiModel");
    const typed = document.getElementById("apiKey").value.trim();
    return {
      provider: document.getElementById("apiProvider").value,
      baseUrl: document.getElementById("apiBaseUrl").value.trim() || global.WRM_AI.DEFAULTS.baseUrl,
      apiKey: typed || (dlg ? dlg.apiKey : ""),
      model: (!manual.hidden ? manual.value.trim() : sel.value) || (dlg ? dlg.model : global.WRM_AI.DEFAULTS.model),
      temperature: Number(document.getElementById("apiTemp").value),
      remember: !document.getElementById("apiRemember").checked
    };
  }

  function testMsg(text, ok) {
    const msg = document.getElementById("apiTestMsg");
    msg.textContent = text;
    msg.className = "api-testmsg mono" + (ok === true ? " is-ok" : ok === false ? " is-err" : "");
  }

  function bindApi(state, hooks) {
    document.getElementById("apiSettingsBtn").onclick = openApi;
    document.getElementById("apiClose").onclick = closeApi;
    if (apiBound) return;
    apiBound = true;
    document.getElementById("apiOverlay").addEventListener("click", (e) => {
      if (e.target && e.target.dataset && e.target.dataset.close) closeApi();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && apiOpen()) {
        e.stopPropagation();
        closeApi();
      }
    });

    document.getElementById("apiKeyToggle").onclick = () => {
      const key = document.getElementById("apiKey");
      const show = key.type === "password";
      key.type = show ? "text" : "password";
      document.getElementById("apiKeyToggle").textContent = show ? "隐藏" : "显示";
    };

    document.getElementById("apiKeyClear").onclick = () => {
      dlg = global.WRM_AI.clearKey(dlg || global.WRM_AI.loadSettings());
      document.getElementById("apiKey").value = "";
      document.getElementById("apiKey").placeholder = "sk-…";
      testMsg("已清除本机保存的 Key", true);
      refreshGen(state);
      hooks.onChange();
    };

    document.getElementById("apiTemp").oninput = (e) => {
      document.getElementById("apiTempVal").textContent = e.target.value;
    };

    document.getElementById("apiRefreshModels").onclick = async () => {
      const btn = document.getElementById("apiRefreshModels");
      btn.disabled = true;
      btn.textContent = "刷新中…";
      const r = await global.WRM_AI.listModels(collect());
      btn.disabled = false;
      btn.textContent = "刷新模型列表";
      const sel = document.getElementById("apiModel");
      const manual = document.getElementById("apiModelManual");
      const noteEl = document.getElementById("apiModelNote");
      if (r.ok) {
        fillModelOptions(r.models, collect().model);
        sel.hidden = false;
        manual.hidden = true;
        noteEl.textContent = "共 " + r.models.length + " 个模型";
      } else {
        manual.value = collect().model;
        sel.hidden = true;
        manual.hidden = false;
        noteEl.textContent = r.message + "；可手填模型名";
      }
    };

    document.getElementById("apiTest").onclick = async () => {
      const btn = document.getElementById("apiTest");
      btn.disabled = true;
      testMsg("测试中…", null);
      const r = await global.WRM_AI.testConnection(collect());
      btn.disabled = false;
      testMsg(r.ok ? r.message : r.message, r.ok);
    };

    document.getElementById("apiSave").onclick = () => {
      dlg = global.WRM_AI.saveSettings(collect());
      closeApi();
      refreshGen(state);
      hooks.onChange();
    };
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
    bindApi(state, hooks);
  }

  global.WRM_SETUP = {
    render: render,
    refreshVersion: refreshVersion,
    refreshGen: refreshGen,
    defaultParams: defaultParams,
    ruleById: ruleById,
    customValid: customValid,
    customParamMap: customParamMap,
    note: note,
    showFallback: showFallback,
    busy: busy,
    closeApi: closeApi
  };
})(typeof window !== "undefined" ? window : globalThis);