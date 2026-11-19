/* Key 输入框留空表示沿用已保存的 Key；普通文本只显示掩码。 */
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
    return global.WRM_PRESETS.byId(id) || global.WRM_PRESETS.all[0];
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

  function selectPreset(state, id, hooks) {
    const p = global.WRM_PRESETS.byId(id);
    state.ruleId = p.id;
    state.params = defaultParams(p);
    state.assumptions = Object.assign({}, p.assumptions);
    state.intervention = Object.assign({}, p.intervention);
    state.mechanisms = p.mechanisms.slice();
    render(state, hooks);
    hooks.onChange();
  }

  function renderRules(state, hooks) {
    const box = document.getElementById("ruleCards");
    box.textContent = "";
    const library = { id: "library", title: "本地剧本", category: "18 套 · 全部离线", premise: "太阳熄灭，月球坠落，或让芹菜开口。" };
    const rules = global.WRM_PRESETS.all.slice(0, 3).concat([library, ruleById("custom")]);
    rules.forEach((r) => {
      const selected = r.id === "library" ? !!state.libraryOpen : r.id === state.ruleId;
      const card = el("button", "rule-card" + (selected ? " is-on" : ""));
      card.type = "button";
      card.dataset.rule = r.id;
      card.setAttribute("aria-pressed", String(selected));
      card.appendChild(el("span", "rule-cat mono", r.category));
      card.appendChild(el("strong", "rule-title", r.title));
      card.appendChild(el("span", "rule-premise", r.hook || r.premise));
      card.onclick = () => {
        if (r.id === "library") {
          state.libraryOpen = !state.libraryOpen;
          render(state, hooks);
        } else if (r.id === "custom") {
          state.ruleId = "custom";
          state.params = customParamMap(state);
          render(state, hooks);
        } else {
          selectPreset(state, r.id, hooks);
          return;
        }
        hooks.onChange();
      };
      box.appendChild(card);
    });
  }

  function renderPresets(state, hooks) {
    document.getElementById("presetDesk").hidden = !state.libraryOpen;
    const box = document.getElementById("presetCards");
    box.textContent = "";
    global.WRM_PRESETS.all.forEach((p) => {
      const card = el("button", "preset-card rule-card" + (p.id === state.ruleId ? " is-on" : ""));
      card.type = "button";
      card.dataset.preset = p.id;
      card.setAttribute("aria-pressed", String(p.id === state.ruleId));
      card.appendChild(el("span", "rule-cat mono", String(p.index).padStart(2, "0") + " / 18"));
      card.appendChild(el("strong", "rule-title", p.name));
      card.appendChild(el("span", "rule-premise", p.hook));
      card.onclick = () => selectPreset(state, p.id, hooks);
      box.appendChild(card);
    });
    document.getElementById("randomPreset").onclick = () => {
      const choices = global.WRM_PRESETS.all.filter((p) => p.id !== state.ruleId);
      selectPreset(state, choices[Math.floor(Math.random() * choices.length)].id, hooks);
    };
    const p = global.WRM_PRESETS.byId(state.ruleId);
    document.getElementById("selectedPreset").textContent = p ? "已选「" + p.name + "」 · " + p.hook : "自定义规则 · 只在生成时调用你配置的模型";
  }

  function renderMechanisms(state, hooks) {
    const ids = state.mechanisms;
    ["trisolaran", "film"].forEach((group) => {
      const box = document.getElementById(group === "film" ? "filmChoices" : "trisolaranChoices");
      box.textContent = "";
      global.WRM_PRESETS.mechanisms.filter((m) => m.group === group).forEach((m) => {
        const selected = ids.includes(m.id);
        const b = el("button", "mechanism-btn era-btn" + (selected ? " is-on" : ""), m.name);
        b.type = "button";
        b.dataset.mechanism = m.id;
        b.title = m.note;
        b.setAttribute("aria-pressed", String(selected));
        b.onclick = () => {
          if (!selected && state.mechanisms.length >= 3) {
            document.getElementById("mechanismNote").textContent = "最多选三个；先取消一项，再选新的。";
            return;
          }
          state.mechanisms = selected ? state.mechanisms.filter((id) => id !== m.id) : state.mechanisms.concat(m.id);
          renderMechanisms(state, hooks);
          refreshGen(state);
          hooks.onChange();
        };
        box.appendChild(b);
      });
    });
    document.getElementById("mechanismNote").textContent = global.WRM_PRESETS.configurationError(state) || "已选 " + ids.length + " / 3 · 只借机制，全部是虚构推演。";
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
      ? "从原始起改写；八个版本全显示。"
      : "从" + era.name + "（" + (state.intervention.yearLabel || era.start) + "）起改写；之前的章节不显示。";
  }

  function renderAssumptions(state, hooks) {
    const box = document.getElementById("assumeToggles");
    box.textContent = "";
    global.WRM_CHAPTERS.assumptions.forEach((a) => {
      const notes = { tech: "关闭后，学习改用旧工具，进度靠手工补。", resources: "关闭后，领用改为排队登记，不保证余量。", cooperate: "关闭后，办事须留下担保，口头约定不再算数。" };
      box.appendChild(switchRow(a.label, notes[a.id], state.assumptions[a.id] !== false, (next) => {
        state.assumptions[a.id] = next;
        renderMechanisms(state, hooks);
        refreshGen(state);
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
    const error = global.WRM_PRESETS.configurationError(state);
    ai.hidden = !custom;
    ai.disabled = !custom || !has || !valid || !!error;
    local.hidden = custom;
    local.disabled = custom || !!error;
    local.textContent = "生成这个世界 → · 本地剧本";
    const regen = document.getElementById("regenBtn");
    regen.hidden = !custom || !state.hasAIRun;
    regen.disabled = ai.disabled;
    const note = document.getElementById("genNote");
    if (error) note.textContent = error;
    else if (custom && !has) note.textContent = "自定义规则需要 API Key";
    else if (custom && !valid) note.textContent = "填好规则名称和四个参数名，才能用 AI 生成";
    else if (custom) note.textContent = "自定义规则只走 AI；生成失败可改用本地剧本";
    else note.textContent = "八版各五件 · 全部离线 · 不调用 API";
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

  let busyControls = [];
  function busy(on) {
    const ai = document.getElementById("aiGenerateBtn");
    ai.textContent = on ? "生成中…（单次请求 30 秒）" : "用 AI 生成这个世界 →";
    if (on) {
      busyControls = Array.from(document.querySelectorAll("#setup button,#setup input,#setup select")).filter((n) => !n.disabled);
      busyControls.forEach((n) => { n.disabled = true; });
    } else {
      busyControls.forEach((n) => { n.disabled = false; });
      busyControls = [];
      if (currentState) refreshGen(currentState);
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
      testMsg("已清除本机保存的 Key", null);
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
      const dialog = dlg;
      const settings = collect();
      const r = await global.WRM_AI.listModels(settings);
      btn.disabled = false;
      btn.textContent = "刷新模型列表";
      if (!apiOpen() || dlg !== dialog) return;
      const current = collect();
      if (current.baseUrl !== settings.baseUrl || current.apiKey !== settings.apiKey || current.provider !== settings.provider) {
        document.getElementById("apiModelNote").textContent = "接口或 Key 已更改，请重新刷新模型列表";
        return;
      }
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
      const dialog = dlg;
      const settings = collect();
      const r = await global.WRM_AI.testConnection(settings);
      btn.disabled = false;
      if (!apiOpen() || dlg !== dialog) return;
      const current = collect();
      if (current.baseUrl !== settings.baseUrl || current.apiKey !== settings.apiKey || current.model !== settings.model || current.provider !== settings.provider) {
        testMsg("连接设置已更改，请重新测试", null);
        return;
      }
      testMsg(r.message, r.ok);
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
    renderPresets(state, hooks);
    renderCustom(state, hooks);
    renderParams(state, hooks);
    renderIntervention(state, hooks);
    renderAssumptions(state, hooks);
    renderMechanisms(state, hooks);
    refreshVersion(state.ruleId);
    refreshGen(state);
    document.getElementById("aiGenerateBtn").onclick = () => hooks.onGenerateAI();
    document.getElementById("localBtn").onclick = () => hooks.onGenerateLocal();
    document.getElementById("regenBtn").onclick = () => hooks.onRegenerate();
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