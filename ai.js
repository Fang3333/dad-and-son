/* Key 仅存浏览器；错误只用静态文案，不能回显服务商响应。 */
(function (global) {
  "use strict";

  const LS_KEY = "wrm.api";
  const CACHE_KEY = "wrm.aiCache";
  const TIMEOUT_MS = 30000;

  const DEFAULTS = {
    provider: "openai-compatible",
    baseUrl: "https://api.deepseek.com/v1",
    apiKey: "",
    model: "deepseek-chat",
    temperature: 0.8,
    remember: true
  };

  const ERAS = global.WRM_PRESETS.ERAS;
  const RECAP = global.WRM_PRESETS.RECAP;

  const SYSTEM = [
    "你是世界线生成器。只输出 JSON 对象，不要 markdown、不要解释。",
    "结构：{runId, intervention:{era,yearLabel,mode}, chapters:[{n,era,name,headline,changedCount,events:[{track:\"world\"|\"personal\",title,yearLabel,domain,before,after,why,detail,hot}],personalSummary}]}",
    "规则：",
    "1 只生成 intervention 及之后的全部章节，不得缺章。时代编号：" + ERAS.map((e) => e.n + "=" + e.id + "（" + e.name + "）").join("，") + "。",
    "2 每章恰好 5 件：3 件 world + 2 件 personal，changedCount=5。before 与 after 必须有实质变化，未变化的事件换成真正改写的事件。",
    "3 title≤8字，before/after≤18字，why≤16字，detail为80–120字，headline≤18字。",
    "4 个人线用第二人称「你」，两件domain分别为学习、恋爱；均为虚构成年人的生活，每版是独立人生切片。",
    "5 声线像老周：短句、具体物件、冷收尾；不解释笑点，不堆网络梗；黑色幽默只向上扎。",
    "6 不写真实人物私生活、真实学校与公司名、未成年人；热点只用代号 亮哥/猎鹰/不烧心，并标 hot:true。",
    "7 不确定的历史标 certainty:\"推算\"，改写与未来标\"假设\"，不编具体统计数字。",
    "8 科幻只借机制，不出现电影人物、台词、具体情节；机制与参数必须实际影响事件。",
    "9 2050、2100、2200分别写设备维护、异地生活、副本人格等具体细节；原始不能出现现代设备。",
    "10 不用让我们一起、赋能、颠覆、未来已来、在这个时代、总而言之、值得注意的是、综上所述、随着、首先、其次。"
  ].join("\n");

  function ls() { try { return global.localStorage; } catch (e) { return null; } }
  function ss() { try { return global.sessionStorage; } catch (e) { return null; } }

  function sanitize(s) {
    const out = Object.assign({}, DEFAULTS);
    if (!s || typeof s !== "object") return out;
    if (s.provider === "custom" || s.provider === "openai-compatible") out.provider = s.provider;
    if (typeof s.baseUrl === "string" && s.baseUrl.trim()) out.baseUrl = s.baseUrl.trim();
    if (typeof s.apiKey === "string") out.apiKey = s.apiKey;
    if (typeof s.model === "string" && s.model.trim()) out.model = s.model.trim();
    const t = Number(s.temperature);
    if (isFinite(t)) out.temperature = Math.min(1.5, Math.max(0, t));
    out.remember = s.remember !== false;
    return out;
  }

  function loadSettings() {
    let out = sanitize(null);
    const a = ls();
    const b = ss();
    try { if (a && a.getItem(LS_KEY)) out = sanitize(JSON.parse(a.getItem(LS_KEY))); } catch (e) { /* 损坏存储忽略 */ }
    try { if (b && b.getItem(LS_KEY)) out = sanitize(JSON.parse(b.getItem(LS_KEY))); } catch (e) { /* 损坏存储忽略 */ }
    return out;
  }

  function saveSettings(s) {
    const clean = sanitize(s);
    const a = ls();
    const b = ss();
    try { if (a) a.removeItem(LS_KEY); } catch (e) { /* 忽略 */ }
    try { if (b) b.removeItem(LS_KEY); } catch (e) { /* 忽略 */ }
    const target = clean.remember ? a : b;
    try { if (target) target.setItem(LS_KEY, JSON.stringify(clean)); } catch (e) { /* 存储不可用则只留内存 */ }
    return clean;
  }

  function clearKey(s) {
    const clean = sanitize(s);
    clean.apiKey = "";
    return saveSettings(clean);
  }

  function hasKey(s) {
    return !!(s && typeof s.apiKey === "string" && s.apiKey.trim());
  }

  /* 只显示后 4 位；Key 本体不进 DOM 文本 */
  function masked(key) {
    if (!key) return "";
    return "••••••••" + key.slice(-4);
  }

  function errFor(status) {
    if (status === 401) return "API Key 无效或已过期";
    if (status === 403) return "这个 Key 没有该模型权限";
    if (status === 404) return "Base URL 或模型名不对";
    if (status === 429) return "限流，稍后再试";
    return "服务返回 " + status + "，稍后再试或换个模型";
  }

  const CORS_MSG = "浏览器被服务商拦截（CORS）；换一个支持浏览器直连的 Base URL，或本地代理";
  const TIMEOUT_MSG = "超时（30 秒），服务商没响应";

  function base(s) {
    return String(s.baseUrl || DEFAULTS.baseUrl).replace(/\/+$/, "");
  }

  function headers(s) {
    return { "Content-Type": "application/json", "Authorization": "Bearer " + s.apiKey };
  }

  /* 统一请求：网络/CORS/超时/状态码都映射成中文，绝不带 Key 或请求体 */
  async function request(s, path, body, signal) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    const onAbort = () => ctrl.abort();
    if (signal) {
      if (signal.aborted) ctrl.abort();
      else signal.addEventListener("abort", onAbort);
    }
    try {
      const res = await fetch(base(s) + path, {
        method: body ? "POST" : "GET",
        headers: headers(s),
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal
      });
      if (!res.ok) return { ok: false, code: "http-" + res.status, message: errFor(res.status) };
      const json = await res.json();
      return { ok: true, json: json };
    } catch (e) {
      if (ctrl.signal.aborted && !(signal && signal.aborted)) return { ok: false, code: "timeout", message: TIMEOUT_MSG };
      if (e instanceof SyntaxError) return { ok: false, code: "parse", message: "服务返回的不是 JSON" };
      return { ok: false, code: "network", message: CORS_MSG };
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);
    }
  }

  async function listModels(s) {
    if (!hasKey(s)) return { ok: false, code: "nokey", message: "先填 API Key" };
    const r = await request(s, "/models", null);
    if (!r.ok) return r;
    const list = r.json && Array.isArray(r.json.data) ? r.json.data : [];
    const models = list.map((m) => (m && typeof m.id === "string" ? m.id : "")).filter(Boolean);
    if (!models.length) return { ok: false, code: "empty", message: "模型列表为空，可手填模型名" };
    return { ok: true, models: models };
  }

  async function testConnection(s) {
    if (!hasKey(s)) return { ok: false, code: "nokey", message: "先填 API Key" };
    const r = await request(s, "/chat/completions", {
      model: s.model,
      max_tokens: 1,
      messages: [{ role: "user", content: "ping" }]
    });
    if (!r.ok) return r;
    return { ok: true, message: "连接正常" };
  }

  function userMessage(p) {
    const params = (p.params || []).map((x) => x.label + "=" + (x.value ? "开" : "关")).join("，");
    return "规则：" + p.name +
      "\n描述：" + p.description +
      "\n参数：" + params +
      "\n干预时间：" + p.intervention.era + " / " + (p.intervention.yearLabel || "") +
      "\n假设：技术累积=" + !!p.assumptions.tech + "，资源足够=" + !!p.assumptions.resources + "，愿意合作=" + !!p.assumptions.cooperation +
      "\n叠加机制：" + (p.mechanisms || []).map((m) => m.name + "：" + m.description).join("；") +
      "\n请生成 intervention 及之后的全部章节，每章恰好3世界+2个人。";
  }

  function stripFences(text) {
    let t = String(text || "").trim();
    if (t.indexOf("```") === 0) {
      t = t.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "");
    }
    return t.trim();
  }

  async function callOnce(s, p, signal) {
    const r = await request(s, "/chat/completions", {
      model: s.model,
      temperature: s.temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userMessage(p) }
      ]
    }, signal);
    if (!r.ok) return r;
    const content = r.json && r.json.choices && r.json.choices[0] && r.json.choices[0].message
      ? r.json.choices[0].message.content : "";
    let json;
    try { json = JSON.parse(stripFences(content)); } catch (e) { return { ok: false, code: "parse", message: "AI 返回的不是合法 JSON" }; }
    return { ok: true, json: json };
  }

  /* 仅 JSON 解析失败重试 1 次；401/403/429/CORS 不重试 */
  async function generateWorld(s, p, signal) {
    if (!hasKey(s)) return { ok: false, code: "nokey", message: "自定义规则需要 API Key" };
    let r = await callOnce(s, p, signal);
    if (!r.ok && r.code === "parse" && !(signal && signal.aborted)) r = await callOnce(s, p, signal);
    if (!r.ok) return r;
    return { ok: true, json: r.json, model: s.model };
  }

  function eraById(id) {
    return ERAS.find((e) => e.id === id) || ERAS[0];
  }

  function str(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  function normalize(json, eraId) {
    const invalid = () => { throw new Error("AI 返回的章节不完整或不符合五卡格式"); };
    if (!json || !Array.isArray(json.chapters)) return invalid();
    const expected = ERAS.filter((e) => e.n >= eraById(eraId).n);
    if (json.chapters.length !== expected.length) return invalid();
    return expected.map((era) => {
      const matches = json.chapters.filter((c) => c && c.era === era.id && c.n === era.n);
      if (matches.length !== 1) return invalid();
      const ch = matches[0];
      if (!Array.isArray(ch.events) || ch.events.length !== 5) return invalid();
      const world = ch.events.filter((e) => e && e.track === "world");
      const personal = ch.events.filter((e) => e && e.track === "personal");
      if (world.length !== 3 || personal.length !== 2 || !personal.some((e) => e.domain === "学习") || !personal.some((e) => e.domain === "恋爱")) return invalid();
      const events = world.concat(personal).map((e, i) => {
        const limits = { title: 8, before: 18, after: 18, why: 16 };
        if (Object.keys(limits).some((k) => !str(e[k]) || Array.from(str(e[k])).length > limits[k])) return invalid();
        if (str(e.before) === str(e.after) || Array.from(str(e.detail)).length < 80 || Array.from(str(e.detail)).length > 120) return invalid();
        const certainty = era.n > 5 ? "假设" : str(e.certainty) === "推算" ? "推算" : "假设";
        return {
          ev: { id: "ai-" + era.n + "-" + i, title: str(e.title), yearLabel: str(e.yearLabel).slice(0, 16) || era.start,
            domain: str(e.domain).slice(0, 8) || "生活", baseline: str(e.before), track: e.track, hot: !!e.hot },
          view: { changed: true, alternate: str(e.after), why: str(e.why), detail: str(e.detail), chain: str(e.chain).slice(0, 160), keywords: [], certainty }
        };
      });
      return { n: era.n, era: era.id, name: era.name, span: era.span, subtitle: (str(ch.headline) || era.name).slice(0, 18), personal: events.slice(3).map((e) => e.view.alternate).join("；"), events };
    });
  }

  /* ---------- 结果缓存 ---------- */

  function cacheKey(core) {
    const s = JSON.stringify(core);
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h + ((h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24))) >>> 0;
    }
    return ("00000000" + h.toString(16)).slice(-8);
  }

  function cacheAll() {
    const a = ls();
    try {
      if (a) {
        const raw = a.getItem(CACHE_KEY);
        if (raw) {
          const o = JSON.parse(raw);
          if (o && typeof o === "object") return o;
        }
      }
    } catch (e) { /* 忽略损坏缓存 */ }
    return {};
  }

  function cacheGet(key) {
    const all = cacheAll();
    const hit = all[key];
    return hit && hit.json ? hit : null;
  }

  function cacheSet(key, entry) {
    const all = cacheAll();
    all[key] = { json: entry.json, model: entry.model, at: Date.now() };
    const keys = Object.keys(all);
    if (keys.length > 8) {
      keys.sort((x, y) => (all[x].at || 0) - (all[y].at || 0));
      keys.slice(0, keys.length - 8).forEach((k) => { delete all[k]; });
    }
    const a = ls();
    try { if (a) a.setItem(CACHE_KEY, JSON.stringify(all)); } catch (e) { /* 存储满则不缓存 */ }
  }

  global.WRM_AI = {
    DEFAULTS: DEFAULTS,
    ERAS: ERAS,
    RECAP: RECAP,
    SYSTEM: SYSTEM,
    loadSettings: loadSettings,
    saveSettings: saveSettings,
    clearKey: clearKey,
    hasKey: hasKey,
    masked: masked,
    errFor: errFor,
    listModels: listModels,
    testConnection: testConnection,
    generateWorld: generateWorld,
    userMessage: userMessage,
    normalize: normalize,
    eraById: eraById,
    cacheKey: cacheKey,
    cacheGet: cacheGet,
    cacheSet: cacheSet
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_AI;
})(typeof window !== "undefined" ? window : globalThis);