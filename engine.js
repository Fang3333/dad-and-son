/* ============================================================
   engine.js —— 技术组负责
   ------------------------------------------------------------
   这里面是「推演规则 + 页面渲染」。日常只需要改三个函数：
   1) adjustRate()   设置如何影响成功率
   2) calcScore()    不同目标的评分权重
   3) makeEvent()    随机事件怎么挑
   其余渲染 / 导出 / 存档逻辑跑通后尽量别动。
   ============================================================ */

let state = {
  scene: null,
  settings: { tier: "985", interest: "学术", goal: "保研深造", time: 3 },
  branches: [],
  events: []
};

let branchSeq = 0;
const MAX_BRANCHES = 6;
const SAVE_KEY = "multiverse_last";
const TIME_LABELS = ["1 · 偶尔想想", "2 · 课余投入", "3 · 认真平衡", "4 · 大量投入", "5 · 全力冲刺"];

/* ---------- 小工具 ---------- */
function esc(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function iconOf(type) {
  return { best: "★", positive: "＋", challenge: "！", decision: "◆", other: "·" }[type] || "·";
}
function typeName(type) {
  return { best: "最优结果", positive: "正面结果", challenge: "挑战", decision: "决策点", other: "其他选项" }[type] || "选项";
}
function typeColor(type) {
  return { best: "#34d399", positive: "#38bdf8", challenge: "#fb7185", decision: "#a78bfa" }[type] || "#a78bfa";
}
function download(name, content, mime) {
  const blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
}
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(t._timer);
  t._timer = setTimeout(function () { t.classList.remove("show"); }, 2200);
}
function setStep(n) {
  const pill = document.getElementById("stepPill");
  if (!pill) return;
  pill.innerHTML = n === 1
    ? '<b class="on">① 选问题</b><span>→</span><b>② 看人生</b>'
    : '<b>① 选问题</b><span>→</span><b class="on">② 看人生</b>';
}

/* ---------- 技术组可改 ①：成功率怎么算 ---------- */
function adjustRate(base, routeKey, stageIndex) {
  let r = base;
  const interest = state.settings.interest;
  // 场景自带 match 表：兴趣偏向命中哪条路线，哪条 +5
  const match = state.scene.match && state.scene.match[interest];
  if (match === routeKey) r += 5;
  if (interest === "都行") r += 2;
  r += (state.settings.time - 3) * 2;   // 时间投入 1~5，3 是中等
  r += stageIndex * 1;                  // 越往后越明朗
  r += (state.scene.mod || 0);          // 层次修正：专科 +4 / 985 -2
  return clamp(Math.round(r), 8, 96);
}

/* ---------- 技术组可改 ②：结局评分 ---------- */
function calcScore(attrs) {
  const goal = state.settings.goal;
  let s;
  if (goal === "保研深造") s = attrs.skill * 1.5 + attrs.mood * 0.5 + attrs.wealth * 0.3;
  else if (goal === "高薪就业") s = attrs.wealth * 1.5 + attrs.skill * 0.8 + attrs.mood * 0.2;
  else s = attrs.mood * 2 + attrs.skill * 0.4 + attrs.wealth * 0.2;
  return Math.round(s);
}

/* ---------- AI 推荐的可解释理由（给横幅用） ---------- */
function recommendReason(winner) {
  const weights = {
    "保研深造": { skill: 1.5, mood: 0.5, wealth: 0.3 },
    "高薪就业": { wealth: 1.5, skill: 0.8, mood: 0.2 },
    "开心就好": { mood: 2, skill: 0.4, wealth: 0.2 }
  }[state.settings.goal] || { skill: 1, mood: 1, wealth: 1 };
  const second = state.branches.filter(function (b) { return b.id !== winner.id; })
    .sort(function (a, b) { return b.score - a.score; })[0];
  if (!second) return "按你的目标「" + state.settings.goal + "」加权评分";
  const diffs = DATA.attributes.map(function (at) {
    return { name: at.name, d: (winner.attrs[at.key] || 0) - (second.attrs[at.key] || 0), w: weights[at.key] || 0 };
  }).filter(function (x) { return x.d !== 0; })
    .sort(function (a, b) { return Math.abs(b.d * b.w) - Math.abs(a.d * a.w); });
  const top = diffs[0];
  const gap = Math.max(0, winner.score - second.score);
  let out = "按你的目标「" + state.settings.goal + "」加权评分";
  if (top) out += "，关键在" + top.name + (top.d > 0 ? "高" : "低") + Math.abs(top.d) + "（权重 ×" + top.w + "）";
  return out + "，比第二名领先 " + gap + " 分";
}

/* ---------- 技术组可改 ③：随机事件怎么挑 ---------- */
function makeEvent(at) {
  const list = DATA.events.filter(function (e) {
    const from = typeof e.from === "number" ? e.from : 0;
    const to = typeof e.to === "number" ? e.to : DATA.stages.length - 1;
    return at >= from && at <= to;
  });
  const pool = list.length ? list : DATA.events;
  return pool[Math.floor(Math.random() * pool.length)];
}
// 每局抽 2 个事件，落在不同阶段，且不重复
function drawEvents() {
  const n = DATA.stages.length;
  const ats = [];
  while (ats.length < 2) {
    const a = Math.floor(Math.random() * n);
    if (ats.indexOf(a) < 0) ats.push(a);
  }
  const used = [];
  return ats.map(function (at) {
    let ev = makeEvent(at), guard = 0;
    while (used.indexOf(ev) >= 0 && guard++ < 12) ev = makeEvent(at);
    used.push(ev);
    return { ev: ev, at: at };
  });
}

/* ---------- 生成一条路线 ---------- */
function makeBranch(plan, forkFrom, origin) {
  const scene = state.scene;
  const attrs = Object.assign({}, DATA.start);
  const nodes = [];
  const timeFactor = 0.8 + state.settings.time * 0.08;

  for (let i = 0; i < DATA.stages.length; i++) {
    const routeKey = plan[i];
    const st = scene.routes[routeKey][i];
    const delta = {};
    for (const k in st.delta) {
      delta[k] = k === "skill" ? Math.round(st.delta[k] * timeFactor) : st.delta[k];
    }
    const eventTexts = [];
    state.events.forEach(function (e) {
      if (e.at !== i) return;
      for (const k in e.ev.delta) delta[k] = (delta[k] || 0) + e.ev.delta[k];
      eventTexts.push(e.ev.text);
    });
    for (const k in attrs) attrs[k] = clamp(attrs[k] + (delta[k] || 0), 0, 100);
    nodes.push({
      stageIndex: i, routeKey: routeKey,
      title: st.title, text: st.text, type: st.type,
      delta: delta, rate: adjustRate(st.rate, routeKey, i),
      attrs: Object.assign({}, attrs),
      hasEvent: eventTexts.length > 0, eventTexts: eventTexts
    });
  }

  branchSeq++;
  const allA = plan.every(function (p) { return p === "A"; });
  const allB = plan.every(function (p) { return p === "B"; });
  const org = origin || "base";
  const name = allA ? "路线 A · " + scene.A.short
    : allB ? "路线 B · " + scene.B.short
    : org === "random" ? "随机人生 " + branchSeq
    : "平行分支 " + branchSeq;
  const endingKey = plan[plan.length - 1];
  return {
    id: branchSeq, name: name, plan: plan, nodes: nodes,
    attrs: attrs, score: calcScore(attrs),
    ending: scene.endings[endingKey],
    forkFrom: forkFrom || null, origin: org
  };
}

function generate(sceneId) {
  state.scene = DATA.scenes.find(function (s) { return s.id === sceneId; }) || DATA.scenes[0];
  state.events = drawEvents();
  branchSeq = 0;
  const n = DATA.stages.length;
  state.branches = [makeBranch(Array(n).fill("A")), makeBranch(Array(n).fill("B"))];
  renderTree();
  window.scrollTo({ top: 0 });
}

/* ---------- 自定义问题：按关键词匹配最接近的剧本模板 ---------- */
function matchSceneByText(text) {
  const q = String(text || "");
  const pool = DATA.scenes.filter(function (s) { return !s.tier || s.tier === state.settings.tier; });
  let best = null, bestScore = 0;
  pool.forEach(function (s) {
    let score = 0;
    (s.keywords || []).forEach(function (k) {
      if (k && q.indexOf(k) >= 0) score++;
    });
    if (score > bestScore) { bestScore = score; best = s; }
  });
  return { scene: best || pool[0] || DATA.scenes[0], score: bestScore };
}

function generateCustom() {
  const el = document.getElementById("customQ");
  if (!el) return;
  const q = (el.value || "").trim();
  if (q.length < 5) {
    toast("再多写几个字吧，比如「大学四年科研还是实习」");
    el.focus();
    return;
  }
  const m = matchSceneByText(q);
  const scene = JSON.parse(JSON.stringify(m.scene));
  scene.custom = true;
  scene.id = "custom";
  scene.baseId = m.scene.id;
  scene.question = q;
  state.scene = scene;
  state.events = drawEvents();
  branchSeq = 0;
  const n = DATA.stages.length;
  state.branches = [makeBranch(Array(n).fill("A")), makeBranch(Array(n).fill("B"))];
  renderTree();
  window.scrollTo({ top: 0 });
  toast(m.score > 0
    ? "已匹配到剧本模板：" + m.scene.tag + "（" + m.scene.A.short + " vs " + m.scene.B.short + "）"
    : "没匹配到关键词，先用「" + m.scene.tag + "」模板推演");
}

function changeDecision(branchId, stageIndex) {
  if (state.branches.length >= MAX_BRANCHES) {
    toast("最多 " + MAX_BRANCHES + " 条平行分支，先删一条或点「新决定」重开");
    return;
  }
  const b = state.branches.find(function (x) { return x.id === branchId; });
  if (!b) return;
  const plan = b.plan.slice();
  for (let i = stageIndex; i < plan.length; i++) plan[i] = plan[i] === "A" ? "B" : "A";
  state.branches.push(makeBranch(plan, { branchId: branchId, stageIndex: stageIndex }, "fork"));
  renderTree();
  const area = document.getElementById("treeArea");
  if (area) area.scrollTo({ left: area.scrollWidth, behavior: "smooth" });
  toast("已生成一条新的平行人生分支 ✦");
}

function randomBranch() {
  if (state.branches.length >= MAX_BRANCHES) {
    toast("最多 " + MAX_BRANCHES + " 条平行分支，先删一条或点「新决定」重开");
    return;
  }
  const n = DATA.stages.length;
  let plan, tries = 0;
  do {
    plan = Array.from({ length: n }, function () { return Math.random() < 0.5 ? "A" : "B"; });
    tries++;
  } while (tries < 10 && state.branches.some(function (b) { return b.plan.join("") === plan.join(""); }));
  state.branches.push(makeBranch(plan, null, "random"));
  renderTree();
  const area = document.getElementById("treeArea");
  if (area) area.scrollTo({ left: area.scrollWidth, behavior: "smooth" });
  toast("掷骰子掷出一条随机人生 🌱");
}

function removeBranch(branchId) {
  const i = state.branches.findIndex(function (x) { return x.id === branchId; });
  if (i < 0 || state.branches[i].origin === "base") return;
  state.branches.splice(i, 1);
  renderTree();
  toast("这条平行人生已收回");
}

function rerollEvent() {
  state.events = drawEvents();
  const old = state.branches.map(function (b) { return { plan: b.plan, forkFrom: b.forkFrom, origin: b.origin }; });
  branchSeq = 0;
  state.branches = old.map(function (o) { return makeBranch(o.plan, o.forkFrom, o.origin); });
  renderTree();
  toast("命运重新洗牌：" + state.events.map(function (e) { return e.ev.title; }).join(" / "));
}

/* ---------- 设定控件 ---------- */
function setSetting(key, value) {
  state.settings[key] = value;
  renderInput();
}
function setTime(v) {
  state.settings.time = Number(v);
  const el = document.getElementById("timeVal");
  if (el) el.textContent = TIME_LABELS[state.settings.time - 1];
}

/* ---------- 页面：输入区 ---------- */
function renderInput() {
  setStep(1);
  const main = document.getElementById("main");
  const saved = readSave();

  const restoreHTML = saved ?
    '<div class="restore anim">' +
      '<span class="r-text">✦ 检测到上次保存的推演：' + esc(saved.question) + '</span>' +
      '<span class="r-btns">' +
        '<button class="btn green small" onclick="restoreSaved()">继续上次</button>' +
        '<button class="btn small" onclick="dismissRestore()">忽略</button>' +
      '</span>' +
    '</div>' : "";

  const tierScenes = DATA.scenes.filter(function (s) { return !s.tier || s.tier === state.settings.tier; });
  const scenesHTML = tierScenes.map(function (s, i) {
    return '<button class="scene-card anim" style="animation-delay:' + (0.12 + i * 0.08) + 's" onclick="generate(\'' + s.id + '\')">' +
      '<span class="scene-tag">' + esc(s.tag) + '</span>' +
      '<span class="scene-q">' + esc(s.question) + '</span>' +
      '<span class="scene-routes"><span class="rt rt-a">A · ' + esc(s.A.short) + '</span><span class="vs">VS</span><span class="rt rt-b">B · ' + esc(s.B.short) + '</span></span>' +
      '<span class="scene-go">开始推演 →</span></button>';
  }).join("");

  function seg(key, options) {
    return '<div class="seg">' + options.map(function (o) {
      return '<button class="' + (state.settings[key] === o ? "on" : "") + '" onclick="setSetting(\'' + key + '\',\'' + esc(o) + '\')">' + esc(o) + '</button>';
    }).join("") + '</div>';
  }

  const nameHTML = DATA.product.name.split(" · ").map(function (p) {
    return '<span style="display:inline-block">' + esc(p) + '</span>';
  }).join(" · ");

  main.innerHTML =
    '<section class="hero">' +
      '<div class="hero-en anim">' + esc(DATA.product.enName) + '</div>' +
      '<h1 class="anim" style="animation-delay:.06s">' + nameHTML + '</h1>' +
      '<p class="hero-sub anim" style="animation-delay:.12s">' + esc(DATA.product.slogan) + '</p>' +
      '<div class="hero-chips anim" style="animation-delay:.18s">' +
        '<span><b>' + tierScenes.length + '</b> 个人生剧本</span>' +
        '<span><b>' + DATA.stages.length + '</b> 段时光推演</span>' +
        '<span><b>' + DATA.events.length + '</b> 种随机际遇</span>' +
        '<span>完全离线 · 无需 API</span>' +
      '</div>' +
    '</section>' +
    restoreHTML +
    '<section class="panel anim" style="animation-delay:.2s">' +
      '<div class="panel-title"><span class="num">1</span>先选层次，再选一个你正在纠结的问题 <small>点卡片立即开始推演</small></div>' +
      '<div class="tier-row"><span class="set-label">我的大学层次</span>' + seg("tier", DATA.settings.tiers) +
        '<span class="tier-note">' + (state.settings.tier === "专科" ? "赛道人少，成功率 +4" : "同侪更卷，成功率 -2") + '</span></div>' +
      '<div class="scene-grid">' + scenesHTML + '</div>' +
      '<div class="custom-box">' +
        '<span class="cq-label">没找到你的问题？直接写一个：</span>' +
        '<input id="customQ" type="text" maxlength="80" placeholder="例如：大学四年，进实验室做科研，还是早点去实习？" onkeydown="if(event.key===\'Enter\'){generateCustom()}">' +
        '<button class="btn primary" onclick="generateCustom()">用我的问题推演 →</button>' +
        '<span class="cq-hint">系统会按关键词在当前层次（' + esc(state.settings.tier) + '）的 ' + tierScenes.length + ' 个剧本里匹配模板，结果页会标明匹配到哪一个；人生阶段按「入学 → 五年后」推演。</span>' +
      '</div>' +
    '</section>' +
    '<section class="panel anim" style="animation-delay:.28s">' +
      '<div class="panel-title"><span class="num">2</span>设定你自己 <small>影响每条路的成功率与评分</small></div>' +
      '<div class="settings-card"><div class="settings">' +
        '<div class="set-group"><span class="set-label">我的兴趣偏向</span>' + seg("interest", DATA.settings.interests) + '</div>' +
        '<div class="set-group"><span class="set-label">我最想要</span>' + seg("goal", DATA.settings.goals) + '</div>' +
        '<div class="set-group"><span class="set-label">' + esc(DATA.settings.timeLabel) + '</span>' +
          '<div class="time-wrap">' +
            '<input id="setTime" type="range" min="1" max="5" step="1" value="' + state.settings.time + '" oninput="setTime(this.value)" aria-label="时间投入">' +
            '<span class="time-val" id="timeVal">' + TIME_LABELS[state.settings.time - 1] + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<p class="hint">提示：不用想太多，随便选一个也能玩。设定会保存在本页，推演途中随时可以回来改。</p></div>' +
    '</section>' +
    '<p class="disclaimer">' + esc(DATA.product.disclaimer) + '</p>';
}

/* ---------- 页面：结果树 ---------- */
function renderTree() {
  setStep(2);
  const main = document.getElementById("main");
  const s = state.scene;
  const scores = state.branches.map(function (b) { return b.score; });
  const best = Math.max.apply(null, scores);
  const winner = state.branches.find(function (b) { return b.score === best; });

  const toolbar =
    '<div class="toolbar anim">' +
      '<button class="btn" onclick="renderInput()">← 新决定</button>' +
      '<button class="btn" onclick="rerollEvent()" title="重新抽两个随机事件，所有分支重算">🎲 换个运气</button>' +
      '<button class="btn" onclick="randomBranch()" title="每个阶段随机选 A/B，掷出一条全新人生">🌱 随机人生</button>' +
      '<button class="btn green" onclick="saveTree()">💾 保存路线</button>' +
      '<button class="btn" onclick="exportJSON()">导出 JSON</button>' +
      '<button class="btn primary" onclick="exportPNG()">导出图片</button>' +
      '<span class="spacer"></span>' +
      '<span class="btn" style="cursor:default;color:var(--muted)">平行宇宙 ' + state.branches.length + ' / ' + MAX_BRANCHES + '</span>' +
    '</div>';

  const head =
    '<div class="result-head anim" style="animation-delay:.05s">' +
      '<div class="result-tag">你的问题 · YOUR QUESTION</div>' +
      '<h2>' + esc(s.question) + '</h2>' +
      '<div class="result-meta">' +
        '<span>层次：' + esc(state.settings.tier) + '</span>' +
        '<span>兴趣：' + esc(state.settings.interest) + '</span>' +
        '<span>目标：' + esc(state.settings.goal) + '</span>' +
        '<span>时间投入：' + state.settings.time + '/5</span>' +
        state.events.map(function (e) {
          return '<span class="event-chip">✦ ' + esc(DATA.stages[e.at]) + ' · ' + esc(e.ev.title) + '</span>';
        }).join("") +
        (s.custom ? '<span>✦ 匹配模板：' + esc(s.tag) + '</span>' : '') +
      '</div>' +
    '</div>';

  const banner =
    '<div class="ai-banner anim" style="animation-delay:.1s">' +
      '<span class="trophy">🏆</span>' +
      '<span>AI 推荐：<b>' + esc(winner.name) + '</b> —— ' + esc(winner.ending.title) + '（评分 <b>' + winner.score + '</b>）</span>' +
      '<span class="why">' + esc(recommendReason(winner)) + '</span>' +
    '</div>';

  const legend =
    '<div class="legend anim" style="animation-delay:.14s">' +
      '<span class="lg"><span class="dot" style="background:#a78bfa"></span>决策点</span>' +
      '<span class="lg"><span class="dot" style="background:#34d399"></span>最优结果 ★</span>' +
      '<span class="lg"><span class="dot" style="background:#38bdf8"></span>正面结果</span>' +
      '<span class="lg"><span class="dot" style="background:#fb7185"></span>挑战</span>' +
      '<span class="lg"><span class="dot" style="background:#fbbf24"></span>随机事件</span>' +
      '<span class="fork-hint">┄┄ 粉色虚线 = 平行分支的改决定位置</span>' +
    '</div>';

  const cols = state.branches.map(function (b, bi) {
    const isBest = b.score === best;
    const stages = b.nodes.map(function (n, ni) {
      const a = n.attrs;
      const d = n.delta;
      const dText = DATA.attributes.map(function (at) {
        const v = d[at.key] || 0;
        if (!v) return "";
        return '<span class="delta ' + (v > 0 ? "up" : "down") + '">' + esc(at.name) + (v > 0 ? "+" : "") + v + '</span>';
      }).join("");
      return '<div class="node node-' + esc(n.type) + ' anim" style="animation-delay:' + (0.16 + bi * 0.07 + ni * 0.06) + 's" id="node-' + b.id + '-' + n.stageIndex + '">' +
          '<div class="node-top"><span class="node-icon">' + iconOf(n.type) + '</span>' +
          '<span class="node-type">' + typeName(n.type) + '</span>' +
          '<span class="node-stage">' + esc(DATA.stages[n.stageIndex]) + '</span></div>' +
          '<div class="node-title">' + esc(n.title) + '</div>' +
          '<div class="node-text">' + esc(n.text) + n.eventTexts.map(function (t) { return '<br><span class="event-inline">✦ ' + esc(t) + '</span>'; }).join("") + '</div>' +
          '<div class="node-deltas">' + dText + '</div>' +
          '<div class="node-bottom">' +
            '<span class="rate">成功率 <b>' + n.rate + '%</b></span>' +
            '<span class="attrs">技' + a.skill + ' / 资' + a.wealth + ' / 心' + a.mood + '</span>' +
          '</div>' +
          '<button class="change-btn" onclick="changeDecision(' + b.id + ',' + n.stageIndex + ')">在这里改决定 ↗</button>' +
        '</div>';
    }).join('<div class="connector"><span></span><i>▼</i></div>');

    const bars = DATA.attributes.map(function (at) {
      return '<div class="bar-row"><span>' + esc(at.name) + '</span><div class="bar-track">' +
        '<div class="bar-fill" data-w="' + b.attrs[at.key] + '" style="background:' + at.color + '"></div>' +
        '</div><b>' + b.attrs[at.key] + '</b></div>';
    }).join("");

    const dots = b.plan.map(function (p, i) {
      return '<span class="pd pd-' + p.toLowerCase() + '" title="' + esc(DATA.stages[i]) + '：' + (p === "A" ? esc(s.A.short) : esc(s.B.short)) + '"></span>';
    }).join("");

    return '<div class="branch">' +
        '<div class="branch-head ' + (isBest ? "winner" : "") + ' anim" style="animation-delay:' + (0.1 + bi * 0.07) + 's" id="head-' + b.id + '">' +
          (b.origin !== "base" ? '<button class="branch-del" title="删除这条分支" onclick="removeBranch(' + b.id + ')">✕</button>' : '') +
          '<div class="branch-name">' + esc(b.name) + (isBest ? ' <span class="crown">AI 推荐</span>' : '') + '</div>' +
          '<div class="plan-dots" aria-label="各阶段选择">' + dots + '</div>' +
          '<div class="branch-score">结局评分<b>' + b.score + '</b></div>' +
          '<div class="bars">' + bars + '</div>' +
        '</div>' +
        '<div class="connector"><span></span><i>▼</i></div>' +
        stages +
        '<div class="ending anim" style="animation-delay:' + (0.4 + bi * 0.07) + 's" id="end-' + b.id + '">' +
          '<div class="ending-label">结局 · ENDING</div>' +
          '<div class="ending-title">' + esc(b.ending.title) + '</div>' +
          '<div class="ending-text">' + esc(b.ending.text) + '</div>' +
        '</div>' +
      '</div>';
  }).join("");

  main.innerHTML = toolbar + head + banner + legend +
    '<div class="tree-area" id="treeArea">' +
      '<svg class="lines" id="lines"></svg>' +
      '<div class="branch-grid">' + cols + '</div>' +
    '</div>' +
    '<p class="disclaimer">' + esc(DATA.product.disclaimer) + '</p>';

  requestAnimationFrame(function () {
    document.querySelectorAll(".bar-fill").forEach(function (el) {
      el.style.width = el.getAttribute("data-w") + "%";
    });
    drawLines();
  });
}

/* ---------- 分支血缘连线（粉色虚线） ---------- */
function drawLines() {
  const area = document.getElementById("treeArea");
  const svg = document.getElementById("lines");
  if (!area || !svg) return;
  const base = area.getBoundingClientRect();
  const w = area.scrollWidth, h = area.scrollHeight;
  svg.setAttribute("width", w); svg.setAttribute("height", h);
  svg.setAttribute("viewBox", "0 0 " + w + " " + h);
  let out = "";
  function pos(el) {
    const r = el.getBoundingClientRect();
    return {
      left: r.left - base.left + area.scrollLeft,
      right: r.right - base.left + area.scrollLeft,
      cy: r.top - base.top + area.scrollTop + r.height / 2
    };
  }
  state.branches.forEach(function (b) {
    if (!b.forkFrom) return;
    const src = document.getElementById("node-" + b.forkFrom.branchId + "-" + b.forkFrom.stageIndex);
    const dst = document.getElementById("head-" + b.id);
    if (!src || !dst) return;
    const p = pos(src), q = pos(dst);
    const x1 = p.right, y1 = p.cy, x2 = q.left, y2 = q.cy;
    const mx = (x1 + x2) / 2;
    out += '<path d="M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2 + '" stroke="#f471b5" stroke-width="1.6" stroke-dasharray="5 5" fill="none" opacity="0.75"/>' +
      '<circle cx="' + x1 + '" cy="' + y1 + '" r="3.5" fill="#f471b5"/>' +
      '<circle cx="' + x2 + '" cy="' + y2 + '" r="3.5" fill="#f471b5"/>';
  });
  svg.innerHTML = out;
}
window.addEventListener("resize", drawLines);

/* ---------- 存档 / 恢复 ---------- */
function readSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const d = JSON.parse(raw);
    if (!d || !d.sceneId || !Array.isArray(d.plans)) return null;
    let sc = DATA.scenes.find(function (s) { return s.id === d.sceneId; });
    if (!sc && d.custom) sc = DATA.scenes.find(function (s) { return s.id === d.baseSceneId; });
    if (!sc) return null;
    d.question = d.custom && d.sceneQuestion ? d.sceneQuestion : sc.question;
    return d;
  } catch (e) { return null; }
}
function saveTree() {
  try {
    const plans = state.branches.map(function (b) {
      let parentIndex = -1;
      if (b.forkFrom) {
        for (let i = 0; i < state.branches.length; i++) {
          if (state.branches[i].id === b.forkFrom.branchId) { parentIndex = i; break; }
        }
      }
      return {
        plan: b.plan, origin: b.origin,
        forkFrom: b.forkFrom ? { parentIndex: parentIndex, stageIndex: b.forkFrom.stageIndex } : null
      };
    });
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      sceneId: state.scene.id,
      baseSceneId: state.scene.baseId || state.scene.id,
      custom: !!state.scene.custom,
      sceneQuestion: state.scene.question,
      settings: state.settings,
      events: state.events,
      plans: plans
    }));
    toast("已保存到本机浏览器，下次打开可继续");
  } catch (e) { toast("保存失败：浏览器不允许本地存储"); }
}
function restoreSaved() {
  const d = readSave();
  if (!d) { toast("没有找到存档"); renderInput(); return; }
  let sc = DATA.scenes.find(function (s) { return s.id === d.sceneId; }) ||
           DATA.scenes.find(function (s) { return s.id === d.baseSceneId; }) ||
           DATA.scenes[0];
  if (d.custom) {
    sc = JSON.parse(JSON.stringify(sc));
    sc.custom = true;
    sc.id = "custom";
    sc.baseId = d.baseSceneId;
    sc.question = d.sceneQuestion || sc.question;
  }
  state.scene = sc;
  state.settings = Object.assign({ tier: "985", interest: "学术", goal: "保研深造", time: 3 }, d.settings);
  if (sc.tier) state.settings.tier = sc.tier;
  state.events = Array.isArray(d.events) && d.events.length ? d.events : drawEvents();
  branchSeq = 0;
  state.branches = d.plans.map(function (p) {
    return makeBranch(p.plan, null, p.origin || "fork");
  });
  d.plans.forEach(function (p, i) {
    if (!p.forkFrom || typeof p.forkFrom.parentIndex !== "number") return;
    const parent = state.branches[p.forkFrom.parentIndex];
    if (parent) state.branches[i].forkFrom = { branchId: parent.id, stageIndex: p.forkFrom.stageIndex };
  });
  renderTree();
  toast("已恢复上次的推演 ✦");
}
function dismissRestore() {
  try { localStorage.removeItem(SAVE_KEY); } catch (e) {}
  renderInput();
}

/* ---------- 导出 JSON ---------- */
function exportJSON() {
  const out = {
    product: DATA.product.name,
    version: DATA.version,
    generatedAt: new Date().toLocaleString("zh-CN"),
    question: state.scene.question,
    settings: state.settings,
    events: state.events.map(function (e) { return { stage: DATA.stages[e.at], title: e.ev.title }; }),
    disclaimer: DATA.product.disclaimer,
    branches: state.branches.map(function (b) {
      return {
        name: b.name, score: b.score, forkFrom: b.forkFrom, origin: b.origin,
        nodes: b.nodes.map(function (n) {
          return { stage: DATA.stages[n.stageIndex], title: n.title, type: typeName(n.type), rate: n.rate, delta: n.delta, attributes: n.attrs };
        }),
        ending: b.ending
      };
    })
  };
  download("平行人生_" + Date.now() + ".json", JSON.stringify(out, null, 2), "application/json;charset=utf-8");
  toast("JSON 已导出");
}

/* ---------- 导出图片（Canvas 手绘，零依赖） ---------- */
function exportPNG() {
  const pad = 44, colW = 280, gap = 28;
  const cols = state.branches.length;
  const W = Math.max(1000, pad * 2 + cols * colW + (cols - 1) * gap);
  const headH = 118, nodeH = 132, endH = 88, vGap = 18;
  const H = 150 + headH + vGap + DATA.stages.length * (nodeH + vGap) + endH + 64;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d");

  const g = x.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, "#17112e"); g.addColorStop(1, "#1d1440");
  x.fillStyle = g; x.fillRect(0, 0, W, H);

  x.fillStyle = "#ede9ff"; x.font = "bold 30px sans-serif";
  x.fillText(DATA.product.name, pad, 54);
  x.fillStyle = "#b9aee6"; x.font = "17px sans-serif";
  wrapText(x, state.scene.question, pad, 90, W - 2 * pad, 26);
  x.fillStyle = "#fbbf24"; x.font = "13px sans-serif";
  x.fillText("层次 " + state.settings.tier + " · 兴趣 " + state.settings.interest + " · 目标 " + state.settings.goal + " · 时间 " + state.settings.time + "/5 · 事件：" + state.events.map(function (e) { return DATA.stages[e.at] + "·" + e.ev.title; }).join(" / "), pad, 132);

  const best = Math.max.apply(null, state.branches.map(function (b) { return b.score; }));
  const startX = (W - (cols * colW + (cols - 1) * gap)) / 2;

  state.branches.forEach(function (b, bi) {
    const bx = startX + bi * (colW + gap);
    let y = 150;
    x.fillStyle = b.score === best ? "#1d3a30" : "#332a63";
    roundRect(x, bx, y, colW, headH, 12); x.fill();
    x.strokeStyle = b.score === best ? "#34d399" : "#5a4b9e"; x.lineWidth = 1.5; x.stroke();
    x.fillStyle = "#fff"; x.font = "bold 17px sans-serif";
    x.fillText(cut(b.name, 15) + (b.score === best ? "  🏆" : ""), bx + 14, y + 28);
    x.fillStyle = "#34d399"; x.font = "bold 15px sans-serif";
    x.fillText("评分 " + b.score, bx + 14, y + 52);
    DATA.attributes.forEach(function (at, ai) {
      const by = y + 66 + ai * 16;
      x.fillStyle = "#a89fd6"; x.font = "11px sans-serif";
      x.fillText(at.name, bx + 14, by + 9);
      x.fillStyle = "rgba(255,255,255,.12)"; roundRect(x, bx + 46, by, colW - 90, 7, 3); x.fill();
      x.fillStyle = at.color; roundRect(x, bx + 46, by, (colW - 90) * b.attrs[at.key] / 100, 7, 3); x.fill();
      x.fillStyle = "#f1edff"; x.font = "11px sans-serif";
      x.fillText(String(b.attrs[at.key]), bx + colW - 36, by + 9);
    });
    y += headH + vGap;

    b.nodes.forEach(function (n, ni) {
      x.fillStyle = "#241c46"; roundRect(x, bx, y, colW, nodeH, 10); x.fill();
      x.strokeStyle = "#3d3170"; x.lineWidth = 1; x.stroke();
      x.fillStyle = typeColor(n.type); x.fillRect(bx, y + 8, 3, nodeH - 16);
      x.fillStyle = "#b6a8e8"; x.font = "12px sans-serif";
      x.fillText(DATA.stages[ni] + " · " + typeName(n.type) + (n.hasEvent ? " · ✦事件" : ""), bx + 14, y + 22);
      x.fillStyle = "#f2efff"; x.font = "bold 15px sans-serif";
      x.fillText(cut(n.title, 17), bx + 14, y + 46);
      x.fillStyle = "#a99fd0"; x.font = "12px sans-serif";
      wrapText(x, n.text, bx + 14, y + 68, colW - 28, 17);
      const dStr = DATA.attributes.map(function (at) {
        const v = n.delta[at.key] || 0;
        return v ? at.name + (v > 0 ? "+" : "") + v : "";
      }).filter(Boolean).join("  ");
      x.fillStyle = "#7de2b8"; x.font = "12px sans-serif";
      x.fillText(cut(dStr, 24), bx + 14, y + 104);
      x.fillStyle = "#a78bfa";
      x.fillText("成功率 " + n.rate + "%   技" + n.attrs.skill + " 资" + n.attrs.wealth + " 心" + n.attrs.mood, bx + 14, y + 122);
      if (ni < b.nodes.length - 1) {
        x.strokeStyle = "#5a4b9e"; x.beginPath();
        x.moveTo(bx + colW / 2, y + nodeH); x.lineTo(bx + colW / 2, y + nodeH + vGap); x.stroke();
      }
      y += nodeH + vGap;
    });

    x.fillStyle = "#3a2f66"; roundRect(x, bx, y, colW, endH, 10); x.fill();
    x.fillStyle = "#a78bfa"; x.font = "11px sans-serif";
    x.fillText("结局 · ENDING", bx + 14, y + 22);
    x.fillStyle = "#fff"; x.font = "bold 15px sans-serif";
    x.fillText(cut(b.ending.title, 16), bx + 14, y + 44);
    x.fillStyle = "#cdc4f0"; x.font = "12px sans-serif";
    wrapText(x, b.ending.text, bx + 14, y + 64, colW - 28, 16);
  });

  x.fillStyle = "#8b80b5"; x.font = "12px sans-serif";
  x.fillText(DATA.product.disclaimer, pad, H - 24);
  const vTag = "v" + DATA.version;
  x.fillText(vTag, W - pad - x.measureText(vTag).width, H - 24);

  const a = document.createElement("a");
  a.download = "平行人生_" + Date.now() + ".png";
  a.href = c.toDataURL("image/png");
  document.body.appendChild(a); a.click(); a.remove();
  toast("图片已导出，可直接贴进 PPT");
}
function roundRect(ctx, x, y, w, h, r) {
  if (w <= 0) return;
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
}
function cut(s, n) { return s.length > n ? s.slice(0, n) + "…" : s; }
function wrapText(ctx, text, x, y, maxW, lh) {
  const lines = [];
  let line = "";
  for (const ch of text) {
    if (ctx.measureText(line + ch).width > maxW && line) { lines.push(line); line = ch; }
    else line += ch;
  }
  if (line) lines.push(line);
  // 行首不落标点：把孤标点挂回上一行末
  const noStart = "，。、；！？：…）】」』%,.;!?:)]";
  for (let i = 1; i < lines.length; i++) {
    while (lines[i] && noStart.indexOf(lines[i][0]) >= 0) {
      lines[i - 1] += lines[i][0];
      lines[i] = lines[i].slice(1);
    }
  }
  const out = lines.filter(function (ln) { return ln; });
  out.forEach(function (ln, i) { ctx.fillText(ln, x, y + i * lh); });
}

/* ---------- 更新日志弹窗 ---------- */
function showChangelog() {
  const old = document.getElementById("clMask");
  if (old) old.remove();
  const mask = document.createElement("div");
  mask.id = "clMask";
  mask.className = "mask";
  const entries = (DATA.changelog || []).map(function (c, i) {
    const current = c.version === DATA.version;
    return '<div class="cl-entry' + (current ? '' : ' old') + '">' +
      '<span class="cl-dot"></span>' +
      '<div><span class="cl-ver">v' + esc(c.version) + '</span>' +
      '<span class="cl-date">' + esc(c.date) + '</span>' +
      '<span class="cl-tag cl-tag-' + esc(c.tag) + '">' + esc(c.tag) + '</span>' +
      (current ? ' <span class="cl-cur">当前版本</span>' : '') + '</div>' +
      '<ul class="cl-items">' + c.items.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join("") + '</ul>' +
    '</div>';
  }).join("");
  mask.innerHTML = '<div class="modal"><div class="cl-head"><h3>✦ 更新日志</h3></div>' +
    '<p class="cl-sub">版本遵循 semver · 完整记录见仓库 CHANGELOG.md</p>' +
    '<div class="cl-list">' + entries + '</div>' +
    '<p class="hint">' + esc(DATA.product.disclaimer) + '</p>' +
    '<button class="btn primary" onclick="document.getElementById(\'clMask\').remove()">知道了</button></div>';
  mask.onclick = function (e) { if (e.target === mask) mask.remove(); };
  document.body.appendChild(mask);
}

/* ---------- 说明弹窗 ---------- */
function showHelp() {
  const old = document.getElementById("helpMask");
  if (old) old.remove();
  const mask = document.createElement("div");
  mask.id = "helpMask";
  mask.className = "mask";
  mask.innerHTML = '<div class="modal"><h3>✦ 怎么玩</h3>' +
    '<ol><li>先选<b>大学层次（专科 / 985）</b>，再选一个两难问题 + 设定<b>兴趣 / 目标 / 时间</b>，点问题卡开始推演。</li>' +
    '<li>系统生成两条人生路线，每条 ' + DATA.stages.length + ' 个阶段，三项属性一路累加。</li>' +
    '<li><b>点任意节点的「在这里改决定」</b>：从这一步改走另一条路，生成一条平行分支（最多 ' + MAX_BRANCHES + ' 条），粉色虚线标出它从哪里分叉。</li>' +
    '<li>分支右上角 <b>✕</b> 可以删掉不想要的平行人生。</li>' +
    '<li><b>🎲 换个运气</b>：重抽两个随机事件（落在不同人生阶段），所有分支重新推演，同一问题每次玩都不一样。</li>' +
    '<li><b>🌱 随机人生</b>：每个阶段掷硬币选 A/B，一键掷出一条完全随机的人生。</li>' +
    '<li>顶部评分按你的目标加权，带「AI 推荐」的是当前最高分；改设定会改变推荐。</li>' +
    '<li>💾 保存后下次打开能继续；导出 JSON / 图片可直接贴进答辩 PPT。</li></ol>' +
    '<p class="hint">' + esc(DATA.product.disclaimer) + '</p>' +
    '<button class="btn primary" onclick="document.getElementById(\'helpMask\').remove()">知道了</button></div>';
  mask.onclick = function (e) { if (e.target === mask) mask.remove(); };
  document.body.appendChild(mask);
}
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const m = document.getElementById("helpMask") || document.getElementById("clMask");
    if (m) m.remove();
  }
});

/* ---------- 星空背景（单个 rAF 循环，像素比封顶） ---------- */
function initStars() {
  const canvas = document.getElementById("stars");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let stars = [], meteor = null, nextMeteor = 4000, last = 0, W = 0, H = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(150, Math.floor(W * H / 11000));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.3 + 0.3,
        a: Math.random() * 0.5 + 0.2,
        ph: Math.random() * Math.PI * 2,
        sp: Math.random() * 1.2 + 0.4,
        vx: -(Math.random() * 0.05 + 0.01),
        vy: -(Math.random() * 0.03 + 0.005),
        hue: Math.random() < 0.82 ? "241,237,255" : (Math.random() < 0.5 ? "167,139,250" : "244,113,181")
      });
    }
    if (reduced) draw(0);
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const tw = 0.6 + 0.4 * Math.sin(t * 0.001 * s.sp + s.ph);
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(" + s.hue + "," + (s.a * tw).toFixed(3) + ")";
      ctx.fill();
    }
    if (meteor) {
      const p = meteor;
      const grad = ctx.createLinearGradient(p.x, p.y, p.x - p.len, p.y - p.len * 0.45);
      grad.addColorStop(0, "rgba(244,113,181," + (0.8 * p.life) + ")");
      grad.addColorStop(1, "rgba(244,113,181,0)");
      ctx.strokeStyle = grad; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.len, p.y - p.len * 0.45); ctx.stroke();
    }
  }

  function tick(t) {
    requestAnimationFrame(tick);
    if (document.hidden) { last = t; return; }
    const dt = Math.min(50, t - last); last = t;
    for (const s of stars) {
      s.x += s.vx * dt * 0.06; s.y += s.vy * dt * 0.06;
      if (s.x < -3) s.x = W + 3;
      if (s.y < -3) s.y = H + 3;
    }
    nextMeteor -= dt;
    if (!meteor && nextMeteor <= 0) {
      meteor = { x: W * (0.3 + Math.random() * 0.6), y: H * Math.random() * 0.35, len: 0, life: 1 };
      nextMeteor = 6000 + Math.random() * 7000;
    }
    if (meteor) {
      meteor.x += dt * 0.45; meteor.y += dt * 0.2;
      meteor.len = Math.min(130, meteor.len + dt * 0.3);
      meteor.life -= dt * 0.0009;
      if (meteor.life <= 0 || meteor.x > W + 150) meteor = null;
    }
    draw(t);
  }

  window.addEventListener("resize", resize);
  resize();
  if (!reduced) requestAnimationFrame(tick);
}

/* ---------- 启动 ---------- */
initStars();
(function () {
  const v = document.getElementById("verLabel");
  if (v) v.textContent = "v" + DATA.version;
})();
renderInput();