/* Key 输入框留空表示沿用已保存的 Key；普通文本只显示掩码。 */
(function (global) {
  "use strict";

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function byId(id) { return document.getElementById(id); }
  function presets() { return global.WRM_PRESETS; }

  const groups = ["教育", "工作", "经济", "生存", "科技", "社会", "未来"];
  const worldAssumptions = [
    { id: "tech", label: "技术会继续累积", note: "关闭后，学习改用旧工具，进度靠手工补。" },
    { id: "resources", label: "资源足够", note: "关闭后，领用改为排队登记，不保证余量。" },
    { id: "cooperate", label: "群体愿意合作", note: "关闭后，办事须留下担保，口头约定不再算数。" }
  ];
  const controlSelector = "button,input,select,textarea";
  let currentRecipe = null;
  let currentHooks = {};
  let isBusy = false;
  const busyControls = new Map();
  let editingRule = null;
  let ruleLastFocus = null;
  let ruleFocusId = null;
  let chaosLastFocus = null;

  function setDisabled(control, disabled) {
    if (isBusy) busyControls.set(control, !!disabled);
    control.disabled = isBusy || !!disabled;
  }

  function lockControls() {
    if (!isBusy) return;
    ["setup", "ruleDialog", "chaosDialog", "apiOverlay"].forEach((id) => {
      const root = byId(id);
      if (!root) return;
      root.querySelectorAll(controlSelector).forEach((control) => {
        if (!busyControls.has(control)) busyControls.set(control, control.disabled);
        control.disabled = true;
      });
    });
  }

  function canFocus(node) {
    return node && node.isConnected && !node.disabled && !node.closest("[hidden],[inert]") && node.getClientRects().length > 0;
  }

  function restoreFocus(node, fallback) {
    if (canFocus(node)) node.focus();
    else if (canFocus(fallback)) fallback.focus();
    else if (canFocus(byId("setupTitle"))) byId("setupTitle").focus();
  }

  function customValid(recipe) {
    const c = recipe && recipe.custom;
    return !!(c && typeof c.name === "string" && c.name.trim() &&
      Array.isArray(c.params) && c.params.length === 4 &&
      c.params.every((p) => p && typeof p.label === "string" && p.label.trim()));
  }

  function configurationError(recipe) {
    const ids = recipe.rules;
    if (!Array.isArray(ids) || ids.length < 3) return "至少选择 3 条规则，才能生成这个世界";
    if (ids.length > 18) return "最多选择 18 条规则";
    if (new Set(ids).size !== ids.length || ids.some((id) => !presets().all.some((p) => p.id === id))) {
      return "请重新选择不重复的内置规则";
    }
    if (!Array.isArray(recipe.assumptions) || recipe.assumptions.length > 3 || new Set(recipe.assumptions).size !== recipe.assumptions.length) {
      return "三体与电影机制合计最多选三个，且不能重复";
    }
    return presets().configurationError(recipe) || "";
  }

  function refreshVersion() {
    const v = global.WRM_VERSION;
    const count = v && typeof v.current === "function" ? v.current() : 0;
    byId("setupVersion").textContent = count > 0
      ? "世界线已生成 " + count + " 版 · 再生成编号 +1"
      : "世界线尚未生成 · 点下方按钮出第 1 版";
  }

  function changed() {
    showFallback(false);
    refreshGen(currentRecipe);
    if (currentHooks.onChange) currentHooks.onChange(currentRecipe);
  }

  function renderChips() {
    const box = byId("ruleChips");
    box.textContent = "";
    currentRecipe.rules.forEach((id) => {
      const rule = presets().all.find((p) => p.id === id);
      if (!rule) return;
      const chip = el("button", "rule-chip", rule.name);
      chip.type = "button";
      chip.dataset.rule = id;
      chip.setAttribute("aria-label", "替换或移除规则：" + rule.name);
      chip.setAttribute("aria-haspopup", "dialog");
      chip.title = rule.hook || "";
      chip.onclick = () => openRules(id, chip);
      box.appendChild(chip);
    });
    lockControls();
  }

  function syncSelection() {
    const ids = currentRecipe.rules;
    const count = "已选 " + ids.length + " / 18 条";
    byId("selectedCount").textContent = count;
    byId("ruleSelectionCount").textContent = count;
    if (!ids.includes(editingRule)) editingRule = null;
    const rule = presets().all.find((p) => p.id === editingRule);
    byId("chipEditor").hidden = !rule;
    byId("chipEditorLabel").textContent = rule ? "替换「" + rule.name + "」：选择一条未选规则，或移除本条" : "";
    byId("ruleList").querySelectorAll("input[data-rule]").forEach((input) => {
      const selected = ids.includes(input.dataset.rule);
      input.checked = selected;
      input.closest("label").classList.toggle("is-on", selected);
      setDisabled(input, editingRule ? selected : !selected && ids.length >= 18);
    });
    setDisabled(byId("removeRule"), !rule);
    setDisabled(byId("clearRules"), ids.length === 0);
    setDisabled(byId("addRule"), ids.length >= 18);
    lockControls();
  }

  function selectionChanged() {
    renderChips();
    syncSelection();
    changed();
  }

  function renderRuleList() {
    const query = byId("ruleSearch").value.trim().toLocaleLowerCase();
    const matches = presets().all.filter((p) => [p.name, p.hook, p.group].some((value) => String(value || "").toLocaleLowerCase().includes(query)));
    const box = byId("ruleList");
    box.textContent = "";
    groups.forEach((group) => {
      const rules = matches.filter((p) => p.group === group);
      if (!rules.length) return;
      const section = el("section", "rule-group");
      section.appendChild(el("h3", "rule-group-title mono", group));
      rules.forEach((rule) => {
        const row = el("label", "rule-row");
        const input = el("input");
        input.type = "checkbox";
        input.dataset.rule = rule.id;
        input.setAttribute("aria-label", rule.name);
        input.onchange = () => {
          if (isBusy) { syncSelection(); return; }
          const ids = currentRecipe.rules;
          const index = ids.indexOf(editingRule);
          if (editingRule && index >= 0) {
            if (ids.includes(rule.id)) { syncSelection(); return; }
            currentRecipe.rules = ids.map((id, i) => i === index ? rule.id : id);
            ruleFocusId = rule.id;
            selectionChanged();
            closeRules();
          } else {
            if (input.checked && !ids.includes(rule.id) && ids.length < 18) currentRecipe.rules = ids.concat(rule.id);
            else if (!input.checked) currentRecipe.rules = ids.filter((id) => id !== rule.id);
            selectionChanged();
          }
        };
        const copy = el("span", "rule-row-copy");
        copy.appendChild(el("strong", "rule-row-name", rule.name));
        copy.appendChild(el("span", "rule-row-hook", rule.hook));
        row.appendChild(input);
        row.appendChild(el("span", "rule-row-number mono", String(presets().all.indexOf(rule) + 1).padStart(2, "0")));
        row.appendChild(copy);
        section.appendChild(row);
      });
      box.appendChild(section);
    });
    if (!matches.length) box.appendChild(el("p", "rule-empty", "没有找到规则，换个关键词试试。"));
    syncSelection();
  }

  function openRules(id, opener) {
    if (isBusy || overlayOpen()) return;
    editingRule = id || null;
    ruleLastFocus = opener || document.activeElement;
    ruleFocusId = id || null;
    byId("ruleSearch").value = "";
    renderRuleList();
    byId("ruleDialog").showModal();
    byId("ruleSearch").focus();
  }

  function closeRules() {
    closeChaos();
    const dialog = byId("ruleDialog");
    if (!dialog.open) return;
    dialog.close();
    const chip = Array.from(byId("ruleChips").querySelectorAll("button")).find((b) => b.dataset.rule === ruleFocusId);
    restoreFocus(ruleLastFocus, chip || byId("addRule"));
    ruleLastFocus = null;
    ruleFocusId = null;
    editingRule = null;
    byId("chipEditor").hidden = true;
  }

  function openChaos() {
    if (isBusy || apiOpen() || byId("chaosDialog").open) return;
    chaosLastFocus = document.activeElement;
    byId("chaosDialog").showModal();
    byId("cancelChaos").focus();
  }

  function closeChaos() {
    const dialog = byId("chaosDialog");
    if (!dialog.open) return;
    dialog.close();
    restoreFocus(chaosLastFocus, byId("ruleDialog").open ? byId("ruleSearch") : byId("allRules"));
    chaosLastFocus = null;
  }

  function bindRules() {
    ["addRule", "shuffleRules", "allRules", "clearRules", "selectAllRules", "doneRules", "closeRules", "removeRule", "confirmChaos", "cancelChaos"].forEach((id) => { byId(id).type = "button"; });
    byId("addRule").onclick = () => openRules(null, byId("addRule"));
    byId("ruleSearch").oninput = renderRuleList;
    byId("closeRules").onclick = byId("doneRules").onclick = () => { if (!isBusy) closeRules(); };
    byId("ruleDialog").oncancel = (e) => { e.preventDefault(); if (!isBusy) closeRules(); };
    byId("chaosDialog").oncancel = (e) => { e.preventDefault(); if (!isBusy) closeChaos(); };
    byId("cancelChaos").onclick = () => { if (!isBusy) closeChaos(); };
    byId("allRules").onclick = byId("selectAllRules").onclick = openChaos;
    byId("confirmChaos").onclick = () => {
      if (isBusy || !byId("chaosDialog").open) return;
      currentRecipe.rules = presets().all.slice(0, 18).map((p) => p.id);
      editingRule = null;
      selectionChanged();
      closeChaos();
    };
    byId("clearRules").onclick = () => {
      if (isBusy) return;
      currentRecipe.rules = [];
      editingRule = null;
      selectionChanged();
    };
    byId("removeRule").onclick = () => {
      if (isBusy || !editingRule) return;
      currentRecipe.rules = currentRecipe.rules.filter((id) => id !== editingRule);
      selectionChanged();
      closeRules();
    };
    byId("shuffleRules").onclick = () => {
      if (isBusy) return;
      const ids = presets().all.map((p) => p.id);
      for (let i = ids.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [ids[i], ids[j]] = [ids[j], ids[i]];
      }
      currentRecipe.rules = ids.slice(0, 3 + Math.floor(Math.random() * 4));
      editingRule = null;
      selectionChanged();
    };
  }

  function switchRow(label, detail, on, onFlip) {
    const row = el("div", "switch-row");
    const btn = el("button", "switch" + (on ? " is-on" : ""));
    btn.type = "button";
    btn.setAttribute("role", "switch");
    btn.setAttribute("aria-checked", String(on));
    btn.setAttribute("aria-label", label);
    btn.appendChild(el("span", "switch-state mono", on ? "开" : "关"));
    btn.onclick = () => {
      if (isBusy) return;
      const next = btn.getAttribute("aria-checked") !== "true";
      btn.setAttribute("aria-checked", String(next));
      btn.classList.toggle("is-on", next);
      btn.querySelector(".switch-state").textContent = next ? "开" : "关";
      onFlip(next);
    };
    const txt = el("div", "switch-text");
    txt.appendChild(el("span", "switch-label", label));
    if (detail) txt.appendChild(el("span", "switch-note", detail));
    row.appendChild(btn);
    row.appendChild(txt);
    return row;
  }

  function renderParams() {
    const box = byId("paramToggles");
    box.textContent = "";
    presets().commonParams.forEach((p) => {
      const key = p.id || p.key;
      box.appendChild(switchRow(p.label, p.note, !!currentRecipe.params[key], (next) => {
        currentRecipe.params[key] = next;
        changed();
      }));
    });
    const assumptions = byId("assumeToggles");
    assumptions.textContent = "";
    worldAssumptions.forEach((a) => {
      assumptions.appendChild(switchRow(a.label, a.note, currentRecipe.worldAssumptions[a.id] !== false, (next) => {
        currentRecipe.worldAssumptions[a.id] = next;
        changed();
      }));
    });
  }

  function renderMechanisms() {
    ["trisolaran", "film"].forEach((group) => {
      const box = byId(group === "film" ? "filmChoices" : "trisolaranChoices");
      box.textContent = "";
      presets().mechanisms.filter((m) => m.group === group).forEach((m) => {
        const b = el("button", "mechanism-btn era-btn", m.name);
        b.type = "button";
        b.dataset.mechanism = m.id;
        b.title = m.note || "";
        b.onclick = () => {
          if (isBusy) return;
          const ids = currentRecipe.assumptions;
          if (!ids.includes(m.id) && ids.length >= 3) {
            byId("mechanismNote").textContent = "最多选三个；先取消一项，再选新的。";
            return;
          }
          currentRecipe.assumptions = ids.includes(m.id) ? ids.filter((id) => id !== m.id) : ids.concat(m.id);
          changed();
        };
        box.appendChild(b);
      });
    });
  }

  function syncMechanisms() {
    ["trisolaranChoices", "filmChoices"].forEach((id) => {
      byId(id).querySelectorAll("button[data-mechanism]").forEach((b) => {
        const selected = currentRecipe.assumptions.includes(b.dataset.mechanism);
        b.classList.toggle("is-on", selected);
        b.setAttribute("aria-pressed", String(selected));
      });
    });
    byId("mechanismNote").textContent = presets().configurationError(currentRecipe) || "已选 " + currentRecipe.assumptions.length + " / 3 · 只借机制，全部是虚构推演。";
  }

  function renderStartEra() {
    const select = byId("startEra");
    select.textContent = "";
    presets().ERAS.forEach((era) => {
      const option = el("option", null, era.name);
      option.value = era.id;
      select.appendChild(option);
    });
    select.value = currentRecipe.startEra;
    select.onchange = () => {
      if (isBusy) { select.value = currentRecipe.startEra; return; }
      currentRecipe.startEra = select.value;
      currentRecipe.branchPath = presets().defaultPath(select.value).slice();
      changed();
    };
  }

  function renderCustom() {
    const checkbox = byId("customEnabled");
    checkbox.checked = !!currentRecipe.custom.enabled;
    checkbox.onchange = () => {
      if (isBusy) { checkbox.checked = !!currentRecipe.custom.enabled; return; }
      currentRecipe.custom.enabled = checkbox.checked;
      changed();
    };
    const name = byId("customName");
    const desc = byId("customDesc");
    name.maxLength = 20;
    desc.maxLength = 120;
    name.value = currentRecipe.custom.name || "";
    desc.value = currentRecipe.custom.description || "";
    name.oninput = () => { if (!isBusy) { currentRecipe.custom.name = name.value; changed(); } };
    desc.oninput = () => { if (!isBusy) { currentRecipe.custom.description = desc.value; changed(); } };
    const box = byId("customParams");
    box.textContent = "";
    currentRecipe.custom.params.forEach((p, i) => {
      const row = el("div", "custom-param");
      const input = el("input", "api-input");
      input.type = "text";
      input.maxLength = 12;
      input.placeholder = "参数 " + (i + 1) + " 名称（必填）";
      input.value = p.label || "";
      input.setAttribute("aria-label", "参数 " + (i + 1) + " 名称");
      input.oninput = () => { if (!isBusy) { currentRecipe.custom.params[i].label = input.value; changed(); } };
      row.appendChild(input);
      row.appendChild(switchRow("参数 " + (i + 1) + " 开关", null, !!p.value, (next) => {
        currentRecipe.custom.params[i].value = next;
        changed();
      }));
      box.appendChild(row);
    });
  }

  function refreshGen(recipe) {
    if (recipe) currentRecipe = recipe;
    if (!currentRecipe) return;
    const s = global.WRM_AI.loadSettings();
    const has = global.WRM_AI.hasKey(s);
    const custom = !!currentRecipe.custom.enabled;
    const error = configurationError(currentRecipe);
    const disabled = !!error || (custom && (!has || !customValid(currentRecipe)));
    const generate = byId("generateBtn");
    generate.textContent = isBusy ? "生成中…" : custom ? "生成这个世界 → · AI 附加约束" : "生成这个世界 →";
    setDisabled(generate, disabled);
    byId("regenBtn").hidden = !custom;
    setDisabled(byId("regenBtn"), !custom || disabled);
    byId("customDesk").hidden = !custom;
    setDisabled(byId("fallbackBtn"), false);
    if (error) note(error);
    else if (custom && !has) note("自定义附加约束需要 API Key；关闭后可完全离线生成");
    else if (custom && !customValid(currentRecipe)) note("填好自定义名称和四个参数名，才能用 AI 生成");
    else if (custom) note("自定义是已选规则的附加约束，不占规则名额；只走 AI，失败会明确提示，不伪造结果");
    else note("本地离线生成 · 不调用 API");
    byId("apiPill").textContent = has ? safeApiText(s.model, s.apiKey) + " · " + maskedKey(s.apiKey) : "未配置 API Key";
    syncMechanisms();
    lockControls();
  }

  function note(text) { byId("genNote").textContent = text || ""; }
  function showFallback(on) { byId("fallbackBtn").hidden = !on; }

  function busy(on) {
    isBusy = !!on;
    if (isBusy) lockControls();
    else {
      busyControls.forEach((disabled, control) => { if (control.isConnected) control.disabled = disabled; });
      busyControls.clear();
    }
    byId("setup").setAttribute("aria-busy", String(isBusy));
    if (currentRecipe) {
      syncSelection();
      refreshGen(currentRecipe);
    }
    refreshApiControls();
  }

  let dlg = null;
  let apiLastFocus = null;
  let apiBound = false;
  let apiRevision = 0;
  let modelRequest = 0;
  let testRequest = 0;
  let modelsLoading = false;
  let testing = false;
  let inertNodes = [];

  function apiOpen() {
    const overlay = byId("apiOverlay");
    return !!overlay && !overlay.hidden;
  }

  function overlayOpen() {
    return apiOpen() || !!byId("ruleDialog").open || !!byId("chaosDialog").open;
  }

  function maskedKey(key) {
    return key && key.length > 4 ? global.WRM_AI.masked(key) : "••••••••";
  }

  function safeApiText(value, extraKey) {
    let text = String(value || "");
    const keys = [extraKey, dlg && dlg.apiKey, byId("apiKey").value.trim()].filter(Boolean);
    keys.forEach((key) => { text = text.split(key).join("[已隐藏]"); });
    return text;
  }

  function fillModelOptions(models, current) {
    const sel = byId("apiModel");
    sel.textContent = "";
    const list = Array.from(new Set(models.filter((m) => typeof m === "string" && m && safeApiText(m) === m)));
    if (current && safeApiText(current) === current && !list.includes(current)) list.unshift(current);
    if (!list.length) list.push(global.WRM_AI.DEFAULTS.model);
    list.forEach((m) => {
      const option = el("option", null, m);
      option.value = m;
      sel.appendChild(option);
    });
    sel.value = list.includes(current) ? current : list[0];
  }

  function apiPanel() { return byId("apiOverlay").querySelector('[role="dialog"]'); }

  function apiFocusables() {
    return Array.from(apiPanel().querySelectorAll('button,input,select,textarea,a[href],[tabindex]')).filter((n) => n.tabIndex >= 0 && canFocus(n));
  }

  function focusApi() {
    const target = apiFocusables()[0] || apiPanel();
    target.focus();
  }

  function makeApiModal() {
    const overlay = byId("apiOverlay");
    apiPanel().tabIndex = -1;
    let node = overlay;
    inertNodes = [];
    while (node.parentElement) {
      Array.from(node.parentElement.children).forEach((sibling) => {
        if (sibling !== node) {
          inertNodes.push([sibling, sibling.inert]);
          sibling.inert = true;
        }
      });
      if (node.parentElement === document.body) break;
      node = node.parentElement;
    }
  }

  function refreshApiControls() {
    setDisabled(byId("apiRefreshModels"), modelsLoading);
    byId("apiRefreshModels").textContent = modelsLoading ? "刷新中…" : "刷新模型列表";
    setDisabled(byId("apiTest"), testing);
  }

  function invalidateApiRequests() {
    modelRequest += 1;
    testRequest += 1;
    apiRevision += 1;
    modelsLoading = false;
    testing = false;
    refreshApiControls();
  }

  function openApi() {
    if (isBusy || overlayOpen()) return;
    dlg = global.WRM_AI.loadSettings();
    apiLastFocus = document.activeElement;
    invalidateApiRequests();
    byId("apiProvider").value = dlg.provider;
    byId("apiBaseUrl").value = dlg.baseUrl;
    const key = byId("apiKey");
    key.value = "";
    key.type = "password";
    key.placeholder = dlg.apiKey ? "已保存 " + maskedKey(dlg.apiKey) + "（留空沿用）" : "sk-…";
    byId("apiKeyToggle").textContent = "显示";
    fillModelOptions([dlg.model], dlg.model);
    byId("apiModel").hidden = false;
    byId("apiModelManual").hidden = true;
    byId("apiModelManual").value = "";
    byId("apiModelNote").textContent = "";
    byId("apiTemp").value = String(dlg.temperature);
    byId("apiTempVal").textContent = String(dlg.temperature);
    byId("apiRemember").checked = !dlg.remember;
    testMsg("", null);
    byId("apiOverlay").hidden = false;
    makeApiModal();
    key.focus();
  }

  function closeApi() {
    const overlay = byId("apiOverlay");
    const wasOpen = apiOpen();
    overlay.hidden = true;
    byId("apiKey").value = "";
    byId("apiKey").type = "password";
    byId("apiKey").placeholder = "sk-…";
    byId("apiKeyToggle").textContent = "显示";
    dlg = null;
    invalidateApiRequests();
    inertNodes.forEach(([node, wasInert]) => { node.inert = wasInert; });
    inertNodes = [];
    if (wasOpen) restoreFocus(apiLastFocus, byId("apiSettingsBtn"));
    apiLastFocus = null;
  }

  function closeDialogs() {
    closeChaos();
    closeRules();
    closeApi();
  }

  function collect() {
    const manual = byId("apiModelManual");
    const typed = byId("apiKey").value.trim();
    return {
      provider: byId("apiProvider").value,
      baseUrl: byId("apiBaseUrl").value.trim() || global.WRM_AI.DEFAULTS.baseUrl,
      apiKey: typed || (dlg ? dlg.apiKey : ""),
      model: (!manual.hidden ? manual.value.trim() : byId("apiModel").value) || (dlg ? dlg.model : global.WRM_AI.DEFAULTS.model),
      temperature: Number(byId("apiTemp").value),
      remember: !byId("apiRemember").checked
    };
  }

  function apiSettingsError(settings) {
    try {
      const url = new URL(settings.baseUrl);
      if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
        return "Base URL 需为 HTTP(S) 地址，不能包含账号、查询参数或片段";
      }
      if (settings.apiKey && (settings.baseUrl.includes(settings.apiKey) || decodeURIComponent(settings.baseUrl).includes(settings.apiKey))) {
        return "Base URL 不能包含 API Key";
      }
    } catch (e) { return "请填写有效的 Base URL"; }
    if (settings.apiKey && settings.model.includes(settings.apiKey)) return "模型名不能包含 API Key";
    return "";
  }

  function apiError(result) {
    const messages = {
      "http-401": "API Key 无效或已过期",
      "http-403": "这个 Key 没有该模型权限",
      "http-404": "Base URL 或模型名不对",
      "http-429": "限流，稍后再试",
      timeout: "超时（30 秒），服务商没响应",
      network: "浏览器被服务商拦截（CORS）；换一个支持浏览器直连的 Base URL，或本地代理",
      parse: "服务返回的不是 JSON",
      empty: "模型列表为空",
      nokey: "先填 API Key"
    };
    return result && Object.prototype.hasOwnProperty.call(messages, result.code) ? messages[result.code] : "服务请求失败，稍后再试或换个模型";
  }

  function testMsg(text, ok) {
    const msg = byId("apiTestMsg");
    msg.textContent = text;
    msg.className = "api-testmsg mono" + (ok === true ? " is-ok" : ok === false ? " is-err" : "");
  }

  function apiUnchanged(settings, revision, includeModel) {
    const current = collect();
    return apiRevision === revision && current.baseUrl === settings.baseUrl && current.apiKey === settings.apiKey && current.provider === settings.provider &&
      (!includeModel || current.model === settings.model);
  }

  function bindApi() {
    byId("apiSettingsBtn").onclick = openApi;
    byId("apiClose").onclick = () => { if (!isBusy) closeApi(); };
    if (apiBound) return;
    apiBound = true;
    byId("apiOverlay").addEventListener("click", (e) => {
      if (!isBusy && e.target && e.target.dataset && e.target.dataset.close) closeApi();
    });
    document.addEventListener("keydown", (e) => {
      if (!apiOpen()) return;
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!isBusy) closeApi();
      } else if (e.key === "Tab") {
        const controls = apiFocusables();
        const index = controls.indexOf(document.activeElement);
        if (!controls.length || index < 0 || (!e.shiftKey && index === controls.length - 1) || (e.shiftKey && index === 0)) {
          e.preventDefault();
          (controls.length ? controls[e.shiftKey ? controls.length - 1 : 0] : apiPanel()).focus();
        }
      }
    }, true);
    document.addEventListener("focusin", (e) => {
      if (apiOpen() && !apiPanel().contains(e.target)) focusApi();
    });
    ["apiProvider", "apiBaseUrl", "apiKey", "apiModel", "apiModelManual", "apiTemp"].forEach((id) => {
      const invalidateResult = () => {
        apiRevision += 1;
        testMsg("", null);
        byId("apiModelNote").textContent = "";
      };
      byId(id).addEventListener("input", invalidateResult);
      byId(id).addEventListener("change", invalidateResult);
    });
    byId("apiKeyToggle").onclick = () => {
      if (isBusy) return;
      const key = byId("apiKey");
      const show = key.type === "password";
      key.type = show ? "text" : "password";
      byId("apiKeyToggle").textContent = show ? "隐藏" : "显示";
    };
    byId("apiKeyClear").onclick = () => {
      if (isBusy || !dlg) return;
      dlg = global.WRM_AI.clearKey(dlg);
      byId("apiKey").value = "";
      byId("apiKey").type = "password";
      byId("apiKey").placeholder = "sk-…";
      byId("apiKeyToggle").textContent = "显示";
      invalidateApiRequests();
      byId("apiModelNote").textContent = "";
      testMsg("已清除本机保存的 Key", null);
      changed();
    };
    byId("apiTemp").oninput = (e) => { byId("apiTempVal").textContent = e.target.value; };
    byId("apiRefreshModels").onclick = async () => {
      if (isBusy || !dlg || modelsLoading) return;
      const settings = collect();
      const error = apiSettingsError(settings);
      if (error) { byId("apiModelNote").textContent = error; return; }
      const dialog = dlg;
      const revision = apiRevision;
      const request = ++modelRequest;
      modelsLoading = true;
      refreshApiControls();
      let result;
      try { result = await global.WRM_AI.listModels(settings); }
      catch (e) { result = { ok: false }; }
      if (!apiOpen() || dlg !== dialog || request !== modelRequest) return;
      modelsLoading = false;
      refreshApiControls();
      if (!apiUnchanged(settings, revision, false)) {
        byId("apiModelNote").textContent = "连接设置已更改，请重新刷新模型列表";
        return;
      }
      const manual = byId("apiModelManual");
      if (result && result.ok && Array.isArray(result.models)) {
        fillModelOptions(result.models, collect().model);
        byId("apiModel").hidden = false;
        manual.hidden = true;
        byId("apiModelNote").textContent = "可选 " + byId("apiModel").options.length + " 个模型";
      } else {
        manual.value = safeApiText(collect().model);
        byId("apiModel").hidden = true;
        manual.hidden = false;
        byId("apiModelNote").textContent = apiError(result) + "；可手填模型名";
      }
    };
    byId("apiTest").onclick = async () => {
      if (isBusy || !dlg || testing) return;
      const settings = collect();
      const error = apiSettingsError(settings);
      if (error) { testMsg(error, false); return; }
      const dialog = dlg;
      const revision = apiRevision;
      const request = ++testRequest;
      testing = true;
      refreshApiControls();
      testMsg("测试中…", null);
      let result;
      try { result = await global.WRM_AI.testConnection(settings); }
      catch (e) { result = { ok: false }; }
      if (!apiOpen() || dlg !== dialog || request !== testRequest) return;
      testing = false;
      refreshApiControls();
      if (!apiUnchanged(settings, revision, true)) {
        testMsg("连接设置已更改，请重新测试", null);
        return;
      }
      testMsg(result && result.ok ? "连接正常" : apiError(result), !!(result && result.ok));
    };
    byId("apiSave").onclick = () => {
      if (isBusy || !dlg) return;
      const settings = collect();
      const error = apiSettingsError(settings);
      if (error) { testMsg(error, false); return; }
      global.WRM_AI.saveSettings(settings);
      closeApi();
      changed();
    };
  }

  function render(recipe, hooks) {
    currentRecipe = recipe;
    currentHooks = hooks || {};
    bindRules();
    renderChips();
    renderRuleList();
    renderParams();
    renderStartEra();
    renderCustom();
    renderMechanisms();
    bindApi();
    refreshVersion();
    refreshGen(recipe);
    byId("advanced").onclick = (e) => { if (isBusy && e.target.closest("summary")) e.preventDefault(); };
    ["generateBtn", "regenBtn", "fallbackBtn"].forEach((id) => { byId(id).type = "button"; });
    byId("generateBtn").onclick = () => {
      refreshGen(currentRecipe);
      if (!byId("generateBtn").disabled && currentHooks.onGenerate) currentHooks.onGenerate();
    };
    byId("regenBtn").onclick = () => {
      refreshGen(currentRecipe);
      if (!byId("regenBtn").disabled && currentHooks.onRegenerate) currentHooks.onRegenerate();
    };
    byId("fallbackBtn").onclick = () => { if (!isBusy && currentHooks.onFallback) currentHooks.onFallback(); };
    lockControls();
  }

  global.WRM_SETUP = {
    render: render,
    refreshGen: refreshGen,
    refreshVersion: refreshVersion,
    busy: busy,
    note: note,
    showFallback: showFallback,
    closeApi: closeApi,
    closeDialogs: closeDialogs,
    overlayOpen: overlayOpen,
    customValid: customValid
  };
})(typeof window !== "undefined" ? window : globalThis);
