/* ============================================================
   life_engine.js —— 《人生：无限分岔》技术组负责
   规则驱动，零依赖。显性六属性 + 隐性变量 + 宿命三层 +
   蝴蝶回响 + 突发事件 + 结局与人生复盘。
   ============================================================ */

const L = {
  SAVE: "life_run_v1",
  s: null,

  rnd(n) { return Math.floor(Math.random() * n); },
  clamp(v) { return Math.max(0, Math.min(100, Math.round(v))); },
  esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); },

  stageOf(age) {
    for (const st of LIFE.stages) if (age >= st.from && age <= st.to) return st.name;
    return "老年";
  },

  cond(c) {
    if (!c) return false;
    let v;
    if (c.bond) v = this.s.bonds[c.v] || 0;
    else if (c.v in this.s.attrs) v = this.s.attrs[c.v];
    else v = this.s.hid[c.v] || 0;
    return c.op === "<=" ? v <= c.val : v >= c.val;
  },

  roll() {
    const fam = LIFE.families[this.rnd(LIFE.families.length)];
    const j = () => this.rnd(9) - 4;
    this.s = {
      gender: this.rnd(2) ? "女" : "男",
      familyId: fam.id,
      attrs: { health: this.clamp(55 + j()), intellect: this.clamp(35 + j()), eq: this.clamp(30 + j()), wealth: this.clamp(fam.wealth + j()), looks: this.clamp(50 + j()), luck: this.clamp(45 + j()) },
      hid: { extrovert: fam.tilt.extrovert, rational: fam.tilt.rational, cautious: fam.tilt.cautious, moral: 50, knot: 18, reputation: 5 },
      bonds: Object.assign({}, fam.bonds),
      flags: {},
      nodeIdx: 0,
      round: { kind: "node" },
      eventCd: 3 + this.rnd(3),
      usedEvents: [],
      keyLog: [],
      rounds: 0,
      ending: null
    };
    this.save();
    this.render();
  },

  family() { return LIFE.families[this.s.familyId]; },

  nodeSpec() {
    const n = LIFE.nodes[this.s.nodeIdx];
    if (!n) return null;
    let spec = { scene: n.scene, choices: n.choices };
    if (n.variants) {
      for (const k in n.variants) {
        const [fk, fv] = k.split(":");
        if (this.s.flags[fk] === fv) { spec = n.variants[k]; break; }
      }
    }
    let scene = spec.scene.replace("{relic}", this.family().relic);
    if (n.age === 0) scene += " " + this.family().line;
    if (n.echo && this.s.flags[n.echo.flag]) scene += " " + n.echo.lines[this.s.flags[n.echo.flag]];
    return Object.assign({}, n, { scene: scene, choices: spec.choices });
  },

  apply(o) {
    const s = this.s;
    for (const k in (o.fx || {})) s.attrs[k] = this.clamp(s.attrs[k] + o.fx[k]);
    for (const k in (o.hid || {})) s.hid[k] = this.clamp(s.hid[k] + o.hid[k]);
    if (o.moral) s.hid.moral = this.clamp(s.hid.moral + o.moral);
    if (o.knot) s.hid.knot = this.clamp(s.hid.knot + o.knot);
    for (const k in (o.bond || {})) s.bonds[k] = this.clamp((s.bonds[k] || 30) + o.bond[k]);
    for (const f of [o.flag, o.flag2]) {
      if (!f) continue;
      const [k, v] = f.split(":");
      if (k === "reputation") s.hid.reputation = this.clamp(s.hid.reputation + Number(v));
      else if (/^\d+$/.test(v)) s.flags[k] = (s.flags[k] || 0) + Number(v);
      else s.flags[k] = v;
    }
    if (s.attrs.health <= 0) s.ending = "early";
  },

  choose(i) {
    const n = this.nodeSpec();
    const c = n.choices[i];
    if (!c || this.cond(c.lock)) return;
    if (n.key) {
      this.s.keyLog.push({ age: n.age, t: c.t, alts: n.choices.map(x => ({ t: x.t, cf: x.cf || "" })) , chosen: i });
    }
    this.apply(c);
    this.s.rounds++;
    this.afterRound(n.age);
  },

  cont() {
    const r = this.s.round;
    if (r.kind === "event") this.apply(r.ev);
    else if (r.kind === "force") this.apply(r.force);
    this.s.rounds++;
    this.afterRound(r.age);
  },

  afterRound(age) {
    const s = this.s;
    if (s.ending) { this.save(); this.render(); return; }
    if (s.round.kind === "event") {
      s.round = { kind: "node" };
      this.save(); this.render(); return;
    }
    if (s.round.kind === "force") {
      s.nodeIdx++;
    } else {
      s.nodeIdx++;
    }
    if (s.nodeIdx >= LIFE.nodes.length) {
      s.ending = this.evalEnding();
      this.save(); this.render(); return;
    }
    const nextAge = LIFE.nodes[s.nodeIdx].age;
    if (nextAge >= 30 && !("child" in s.bonds)) s.bonds.child = 50;
    s.eventCd--;
    if (s.eventCd <= 0) {
      const pool = LIFE.events.filter(e => nextAge >= e.from && nextAge <= e.to && s.usedEvents.indexOf(e.id) < 0);
      if (pool.length) {
        const ev = pool[this.rnd(pool.length)];
        s.usedEvents.push(ev.id);
        s.eventCd = 3 + this.rnd(3);
        s.round = { kind: "event", ev: ev, age: nextAge };
        this.save(); this.render(); return;
      }
      s.eventCd = 2;
    }
    s.round = { kind: "node", age: nextAge };
    this.save(); this.render();
  },

  evalEnding() {
    const s = this.s;
    const bondVals = Object.keys(s.bonds).filter(k => s.bonds[k] > 0).map(k => s.bonds[k]);
    const bondAvg = bondVals.length ? bondVals.reduce((a, b) => a + b, 0) / bondVals.length : 0;
    for (const e of LIFE.endings) {
      const t = e.test;
      if (t.healthMax !== undefined && !(s.attrs.health <= t.healthMax)) continue;
      if (t.moralMin !== undefined && !(s.hid.moral >= t.moralMin)) continue;
      if (t.contribMin !== undefined && !((s.flags.contrib || 0) >= t.contribMin)) continue;
      if (t.wealthMin !== undefined && !(s.attrs.wealth >= t.wealthMin)) continue;
      if (t.knotMin !== undefined && !(s.hid.knot >= t.knotMin)) continue;
      if (t.fatherMax !== undefined && !((s.bonds.father || 0) <= t.fatherMax)) continue;
      if (t.bondAvgMin !== undefined && !(bondAvg >= t.bondAvgMin)) continue;
      if (t.healthMin !== undefined && !(s.attrs.health >= t.healthMin)) continue;
      if (t.family !== undefined && s.familyId !== t.family) continue;
      if (t.honestMin !== undefined && !((s.flags.honest || 0) >= t.honestMin)) continue;
      return e.id;
    }
    return "platform";
  },

  counterfactuals() {
    const out = [];
    for (const k of this.s.keyLog) {
      const alt = k.alts.find((a, i) => i !== k.chosen && a.cf);
      if (alt) out.push({ age: k.age, t: alt.t, cf: alt.cf });
      if (out.length >= 2) break;
    }
    return out;
  },

  save() { try { localStorage.setItem(this.SAVE, JSON.stringify(this.s)); } catch (e) {} },
  readSave() { try { return JSON.parse(localStorage.getItem(this.SAVE)); } catch (e) { return null; } },
  resume() { const s = this.readSave(); if (s) { this.s = s; this.render(); } },
  clearSave() { try { localStorage.removeItem(this.SAVE); } catch (e) {} },

  /* ---------- 渲染 ---------- */
  panelHTML() {
    const s = this.s;
    return '<div class="lf-panel">' + LIFE.attrs.map(a =>
      '<div class="lf-attr"><span class="lf-an">' + a.name + '</span><span class="lf-av">' + s.attrs[a.key] + '</span>' +
      '<span class="lf-bar"><i style="width:' + s.attrs[a.key] + '%"></i></span></div>').join("") + '</div>';
  },

  voiceHTML(n) {
    const s = this.s;
    const trigger = n && n.voice && (n.key || s.hid.knot >= 40);
    if (!trigger) return "";
    const p = LIFE.personas[this.family().persona];
    const line = p.lines[s.rounds % p.lines.length];
    return '<div class="lf-voice"><span class="lf-vn">🗣 内在声音 · ' + this.esc(p.name) + '</span><p>“' + this.esc(line) + '”</p></div>';
  },

  choicesHTML(list, locked, handler) {
    const fn = handler || "L.choose";
    return '<div class="lf-choices">' + list.map((c, i) => {
      const isLock = locked && this.cond(c.lock);
      if (isLock) {
        return '<div class="lf-choice locked"><span class="lf-key">' + "ABCD"[i] + '</span><div><s>' + this.esc(c.t) + '</s>' +
          '<span class="lf-lock">' + this.esc(c.lockText) + '</span></div></div>';
      }
      return '<button class="lf-choice" onclick="' + fn + '(' + i + ')"><span class="lf-key">' + "ABCD"[i] + '</span><div>' + this.esc(c.t) +
        (c.hint ? '<span class="lf-hint">' + this.esc(c.hint) + '</span>' : '') + '</div></button>';
    }).join("") + '</div>';
  },

  chooseEvent(i) {
    const r = this.s.round;
    const c = r.ev.choices && r.ev.choices[i];
    if (!c) return;
    this.apply(c);
    this.s.rounds++;
    this.afterRound(r.age);
  },

  render() {
    const app = document.getElementById("app");
    const s = this.s;
    if (!s) { this.renderStart(); return; }
    if (s.ending) { this.renderEnding(); return; }
    const r = s.round;
    let age, stage, body;
    if (r.kind === "event") {
      age = r.age; stage = this.stageOf(age);
      const ev = r.ev;
      body = '<div class="lf-event"><span class="lf-en">⚡ 突发事件 · ' + this.esc(ev.type) + '</span><p>' + this.esc(ev.text) + '</p></div>' +
        (ev.auto
          ? '<div class="lf-fate">宿命 · 自动事件：没有选项。你只能在场。</div><button class="lf-cont" onclick="L.cont()">（旁观）</button>'
          : this.choicesHTML(ev.choices, false, "L.chooseEvent"));
    } else {
      const n = this.nodeSpec();
      age = n.age; stage = this.stageOf(age);
      const forced = n.force && this.cond(n.force.when);
      if (forced) s.round = { kind: "force", force: n.force, age: age };
      body = '<div class="lf-scene"><p>' + this.esc(n.scene) + '</p></div>' +
        (forced
          ? '<div class="lf-fate">宿命 · 强制路径：选项没有出现。身体替他做了决定。</div><div class="lf-forced"><p>' + this.esc(n.force.text) + '</p></div><button class="lf-cont" onclick="L.cont()">（旁观）</button>'
          : this.voiceHTML(n) + '<div class="lf-ask">❓ 请选择' + (n.key ? ' <span class="lf-keytag">关键抉择</span>' : '') + '</div>' + this.choicesHTML(n.choices, true));
    }
    const hint = r.kind === "event" ? "信息不全。先选，再知道。" : (this.nodeSpec() || {}).hint || "";
    app.innerHTML =
      '<div class="lf-head"><span class="lf-stage">📍 ' + stage + '（' + age + '岁）</span>' +
      '<span class="lf-meta">' + this.esc(s.gender) + ' · ' + this.esc(this.family().label) + ' · 第 ' + (s.rounds + 1) + ' 回合</span></div>' +
      this.panelHTML() +
      (hint ? '<p class="lf-hintline">（' + this.esc(hint) + '）</p>' : '') +
      body +
      '<p class="lf-dis">' + this.esc(DATA.product.disclaimer) + '</p>';
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  renderStart() {
    const saved = this.readSave();
    document.getElementById("app").innerHTML =
      '<div class="lf-hero"><h1>人生：无限分岔</h1>' +
      '<p class="lf-slogan">从出生到死亡。你以为能选的地方，主角有时已经替你选了。</p>' +
      '<div class="lf-cards">' +
      '<div class="lf-card"><b>六显性 · 多隐性</b><span>健康智力情商财富外貌运气可见；性格、道德、心结、好感在暗处走。</span></div>' +
      '<div class="lf-card"><b>宿命三层</b><span>锁死的选项、消失的选项、没有选项的事件。少数，但有力。</span></div>' +
      '<div class="lf-card"><b>蝴蝶回响</b><span>零岁的一个夜里决定，六岁和十八岁各还一次。</span></div>' +
      '<div class="lf-card"><b>人生复盘</b><span>结局之后回放关键选择链，附两条「如果当初」。</span></div>' +
      '</div>' +
      (saved && !saved.ending ? '<div class="lf-resume">上一局还在半路（' + this.stageOf(saved.round && saved.round.age || LIFE.nodes[saved.nodeIdx || 0].age) + '）。<button class="lf-btn small" onclick="L.resume()">继续</button><button class="lf-btn small ghost" onclick="L.clearSave();L.renderStart()">丢掉</button></div>' : '') +
      '<button class="lf-btn big" onclick="L.roll()">掷骰开局</button>' +
      '<p class="lf-note">性别、家庭出身每局随机。时代锚定 2007 年出生。零依赖，离线可玩。</p>' +
      '<p class="lf-dis">' + this.esc(DATA.product.disclaimer) + '</p></div>';
  },

  renderEnding() {
    const s = this.s;
    const e = LIFE.endings.find(x => x.id === s.ending) || LIFE.endings[LIFE.endings.length - 1];
    const idx = LIFE.endings.indexOf(e) + 1;
    const cf = this.counterfactuals();
    document.getElementById("app").innerHTML =
      '<div class="lf-end"><span class="lf-etype">' + this.esc(e.type) + '结局</span>' +
      '<h2>结局 ' + idx + ' · ' + this.esc(e.name) + '</h2>' +
      '<p class="lf-etext">' + this.esc(e.text) + '</p>' +
      '<div class="lf-review"><h3>人生复盘</h3>' +
      '<ol>' + s.keyLog.map(k => '<li><b>' + k.age + '岁</b> ' + this.esc(k.t) + '</li>').join("") + '</ol>' +
      (cf.length ? '<h3>如果当初</h3>' + cf.map(c => '<p class="lf-cf"><b>' + c.age + '岁</b>若选「' + this.esc(c.t) + '」：' + this.esc(c.cf) + '</p>').join("") : '') +
      '<p class="lf-eline">' + this.esc(e.line) + '</p></div>' +
      this.panelHTML() +
      '<div class="lf-endbtns"><button class="lf-btn big" onclick="L.clearSave();L.roll()">再掷一局</button>' +
      '<button class="lf-btn ghost" onclick="L.exportReview()">导出复盘 JSON</button></div>' +
      '<p class="lf-dis">' + this.esc(DATA.product.disclaimer) + '</p></div>';
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  exportReview() {
    const s = this.s;
    const e = LIFE.endings.find(x => x.id === s.ending);
    const out = {
      product: "人生：无限分岔", version: DATA.version,
      gender: s.gender, family: this.family().label,
      ending: e ? { id: e.id, name: e.name, type: e.type } : null,
      attrs: s.attrs, keyChoices: s.keyLog.map(k => ({ age: k.age, chose: k.t })),
      counterfactuals: this.counterfactuals(),
      generatedAt: new Date().toLocaleString("zh-CN")
    };
    const blob = new Blob([JSON.stringify(out, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "人生复盘_" + Date.now() + ".json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  },

  help() {
    const old = document.getElementById("helpMask");
    if (old) { old.remove(); return; }
    const mask = document.createElement("div");
    mask.id = "helpMask";
    mask.className = "mask";
    mask.innerHTML = '<div class="modal"><h3>∞ 引擎规范 · v2</h3>' +
      '<h4>状态系统</h4><ul>' +
      '<li>显性六属性（0~100，可见）：健康 / 智力 / 情商 / 财富 / 外貌 / 运气。</li>' +
      '<li>隐性变量（不显示数值）：内向↔外向、理性↔感性、谨慎↔冒险、道德、心结、人际好感、声望。</li>' +
      '<li>属性互相关联：长期压力降健康，健康过低连锁影响其余判定。</li></ul>' +
      '<h4>宿命三层（少数而有力）</h4><ul>' +
      '<li>锁定选项：隐性变量过阈值，选项灰置，标注「主角下不了手」——看得到，走不过去。</li>' +
      '<li>强制路径：条件达成时选项不出现，剧情自行推进，玩家只能旁观。</li>' +
      '<li>自动事件：体检报告、突发灾难、故人离世——连选择权都没有。</li>' +
      '<li>锁因叙事写身体、本能与旧阴影，不写"系统禁止"。</li></ul>' +
      '<h4>内在声音与命题</h4><ul>' +
      '<li>每个家庭出身带一个内在声音（旧模式的另一个自己），关键时刻浮现争辩。</li>' +
      '<li>命题转译成两难而非说教：课题分离 / 被讨厌的勇气 / 共同体感觉 / 目的论。</li></ul>' +
      '<h4>节奏与回响</h4><ul>' +
      '<li>七阶段：婴儿→童年→少年→青年→成年→中年→老年。每阶段至少一个【关键抉择】。</li>' +
      '<li>每 3~5 回合插入突发事件，信息不全时被迫抉择。</li>' +
      '<li>蝴蝶效应：早期选择标记会在多年后的节点回响。</li></ul>' +
      '<h4>结局与复盘</h4><ul>' +
      '<li>结局覆盖圆满 / 遗憾 / 悲剧 / 反转 / 开放 / 彩蛋，健康归零提前落幕。</li>' +
      '<li>结局后回放关键选择链，附两条「如果当初」反事实。</li></ul>' +
      '<h4>写作铁律</h4><ul>' +
      '<li>短句为主，情绪藏在动作与物件里；不升华、不说教、不剧透。</li>' +
      '<li>叙事不用 emoji；不堆"突然/竟然/没想到"；不用套话与网络黑话。</li>' +
      '<li>绝不替玩家做决定（宿命层除外）；每次只推进一个节点。</li></ul>' +
      '<button class="lf-btn" onclick="document.getElementById(\'helpMask\').remove()">知道了</button></div>';
    mask.onclick = e => { if (e.target === mask) mask.remove(); };
    document.body.appendChild(mask);
  },

  changelog() {
    const old = document.getElementById("clMask");
    if (old) { old.remove(); return; }
    const mask = document.createElement("div");
    mask.id = "clMask";
    mask.className = "mask";
    const entries = (DATA.changelog || []).map(c =>
      '<div class="cl-entry' + (c.version === DATA.version ? '' : ' old') + '"><span class="cl-dot"></span>' +
      '<div><span class="cl-ver">v' + this.esc(c.version) + '</span><span class="cl-date">' + this.esc(c.date) + '</span>' +
      '<span class="cl-tag cl-tag-' + this.esc(c.tag) + '">' + this.esc(c.tag) + '</span>' +
      (c.version === DATA.version ? ' <span class="cl-cur">当前版本</span>' : '') + '</div>' +
      '<ul class="cl-items">' + c.items.map(t => '<li>' + this.esc(t) + '</li>').join("") + '</ul></div>').join("");
    mask.innerHTML = '<div class="modal"><h3>✦ 更新日志</h3><p class="cl-sub">版本遵循 semver · 完整记录见仓库 CHANGELOG.md</p>' +
      '<div class="cl-list">' + entries + '</div>' +
      '<button class="lf-btn" onclick="document.getElementById(\'clMask\').remove()">知道了</button></div>';
    mask.onclick = e => { if (e.target === mask) mask.remove(); };
    document.body.appendChild(mask);
  }
};

document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    const m = document.getElementById("clMask") || document.getElementById("helpMask");
    if (m) m.remove();
  }
});

(function () {
  const v = document.getElementById("verLabel");
  if (v) v.textContent = "v" + DATA.version;
  const saved = L.readSave();
  if (saved && saved.round) { L.s = saved; L.render(); } else L.renderStart();
})();