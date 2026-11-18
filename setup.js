/* 第 1 页 · 设定：选规则 / 调四参数 / 设三假设。全站唯一有表单控件的页面。
   只渲染与回调，不持有状态；状态由 app.js 保管并写 localStorage。 */
(function (global) {
  "use strict";

  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  function ruleById(id) {
    return global.WRM_DATA.rules.find((r) => r.id === id) || global.WRM_DATA.rules[0];
  }

  function defaultParams(rule) {
    const p = {};
    rule.params.forEach((x) => { p[x.id] = !!x.default; });
    return p;
  }

  function refreshVersion() {
    const slot = document.getElementById("setupVersion");
    if (!slot) return;
    const v = global.WRM_VERSION;
    slot.textContent = v.current() > 0
      ? "世界线 " + v.label() + " · " + v.semver()
      : "世界线尚未生成 · 点下方按钮出第 1 版";
  }

  function renderRules(state, hooks) {
    const box = document.getElementById("ruleCards");
    box.textContent = "";
    global.WRM_DATA.rules.forEach((r) => {
      const card = el("button", "rule-card" + (r.id === state.ruleId ? " is-on" : ""));
      card.type = "button";
      card.setAttribute("aria-pressed", r.id === state.ruleId ? "true" : "false");
      card.appendChild(el("span", "rule-cat mono", r.category));
      card.appendChild(el("strong", "rule-title", r.title));
      card.appendChild(el("span", "rule-premise", r.premise));
      card.addEventListener("click", () => {
        if (state.ruleId === r.id) return;
        state.ruleId = r.id;
        state.params = defaultParams(r);
        renderRules(state, hooks);
        renderParams(state, hooks);
        hooks.onChange();
      });
      box.appendChild(card);
    });
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

  function renderParams(state, hooks) {
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

  function renderAssumptions(state, hooks) {
    const box = document.getElementById("assumeToggles");
    box.textContent = "";
    global.WRM_RIVER.assumptions.forEach((a) => {
      box.appendChild(switchRow(a.label, a.note, state.assumptions[a.id] !== false, (next) => {
        state.assumptions[a.id] = next;
        hooks.onChange();
      }));
    });
  }

  function render(state, hooks) {
    renderRules(state, hooks);
    renderParams(state, hooks);
    renderAssumptions(state, hooks);
    refreshVersion();
    const btn = document.getElementById("generateBtn");
    btn.onclick = () => hooks.onGenerate();
  }

  global.WRM_SETUP = { render: render, refreshVersion: refreshVersion, defaultParams: defaultParams, ruleById: ruleById };
})(typeof window !== "undefined" ? window : globalThis);