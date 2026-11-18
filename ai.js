/* API 适配层（v2.3）：OpenAI 兼容协议，浏览器直连。
   Key 只存浏览器（localStorage wrm.api 或 sessionStorage wrm.api），不进 URL、不进日志、不进错误文案。
   listModels / testConnection / generateWorld；30 秒超时；仅 JSON 解析失败重试 1 次。
   结果缓存 wrm.aiCache：按 规则+干预+假设+模型 哈希，避免重复扣费；「重新生成」绕过缓存。
   本文件不 console 任何内容；错误信息只含静态中文与状态码。 */
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

  const ERAS = [
    { id: "primitive", n: 1, name: "原始", start: "约 100 万年前", span: "约 100 万年前—前 3000" },
    { id: "ancient", n: 2, name: "古代", start: "前 3000", span: "前 3000—公元 1000" },
    { id: "earlymodern", n: 3, name: "近代早期", start: "1000", span: "1000—1750" },
    { id: "industrial", n: 4, name: "工业", start: "1750", span: "1750—1950" },
    { id: "modern", n: 5, name: "现代", start: "1950", span: "1950—现在" }
  ];

  /* 干预点之前的「前情」，本地确定性文案，≤30 字 */
  const RECAP = {
    2: "火种留住了，话学会了，种子埋进土里。",
    3: "文字、钱币和道路都照旧来过。",
    4: "印刷和帆船先把世界连了起来。",
    5: "蒸汽和电灯先亮过了夜。"
  };

  const SYSTEM = [
    "你是世界线生成器。只输出 JSON 对象，不要 markdown、不要解释。",
    "结构：{runId, intervention:{era,yearLabel,mode}, chapters:[{n,era,name,headline,changedCount,events:[{track:\"world\"|\"personal\",title,yearLabel,domain,before,after,why,detail,hot}],personalSummary}]}",
    "规则：",
    "1 只生成 intervention 及之后的章节；era 取 primitive/ancient/earlymodern/industrial/modern，n 对应 1–5。",
    "2 每章 2–3 件 world + 2–3 件 personal，全部是 changed；changedCount = world + personal 数量。",
    "3 before/after ≤18 字，why ≤16 字，detail 60–100 字，headline ≤18 字。",
    "4 个人线用第二人称「你」，覆盖学习/恋爱/工作，每章至少一件学习、一件恋爱。",
    "5 声线像老周：短句、具体物件、冷收尾；不解释笑点，不堆网络梗；黑色幽默只向上扎。",
    "6 不写真实人物私生活、真实学校与公司名、未成年人；热点只用代号 亮哥/猎鹰/不烧心，并标 hot:true。",
    "7 不确定的历史标 certainty:\"推算\"，不编具体统计数字。"
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
    let res;
    try {
      res = await fetch(base(s) + path, {
        method: body ? "POST" : "GET",
        headers: headers(s),
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal
      });
    } catch (e) {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", onAbort);
      if (ctrl.signal.aborted && !(signal && signal.aborted)) return { ok: false, code: "timeout", message: TIMEOUT_MSG };
      return { ok: false, code: "network", message: CORS_MSG };
    }
    clearTimeout(timer);
    if (signal) signal.removeEventListener("abort", onAbort);
    if (!res.ok) return { ok: false, code: "http-" + res.status, message: errFor(res.status) };
    let json = null;
    try { json = await res.json(); } catch (e) { return { ok: false, code: "parse", message: "服务返回的不是 JSON" }; }
    return { ok: true, json: json };
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
      "\n请生成 intervention 及之后的章节。";
  }

  function stripFences(text) {
    let t = String(text || "").trim();
    if (t.indexOf("```") === 0) {
      t = t.replace(/^```[a-zA-Z]*\s*/, "").replace(/\s*```$/, "");
    }
    return t.trim();
  }

  async function callOnce(s, p) {
    const r = await request(s, "/chat/completions", {
      model: s.model,
      temperature: s.temperature,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userMessage(p) }
      ]
    });
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
    let r = await callOnce(s, p);
    if (!r.ok && r.code === "parse") r = await callOnce(s, p);
    if (!r.ok) return r;
    return { ok: true, json: r.json, model: s.model };
  }

  function eraById(id) {
    return ERAS.find((e) => e.id === id) || ERAS[0];
  }

  function str(v) {
    return typeof v === "string" ? v.trim() : "";
  }

  /* 校验并归一 AI JSON：只留 intervention 及之后、每章 ≥2 件；字段截断防溢出 */
  function normalize(json, eraId) {
    if (!json || !Array.isArray(json.chapters)) throw new Error("AI 返回的结构不对");
    const startN = eraById(eraId).n;
    const seen = {};
    const out = [];
    json.chapters.forEach((ch) => {
      if (!ch || typeof ch !== "object") return;
      const era = eraById(str(ch.era));
      if (!ERAS.some((e) => e.id === str(ch.era)) || era.n < startN || seen[era.n]) return;
      const raw = Array.isArray(ch.events) ? ch.events : [];
      const events = [];
      raw.forEach((e) => {
        if (!e || typeof e !== "object") return;
        const title = str(e.title);
        const before = str(e.before);
        const after = str(e.after);
        const why = str(e.why);
        if (!title || !before || !after || !why || events.length >= 6) return;
        const certainty = str(e.certainty) || "推算";
        events.push({
          ev: {
            id: "ai-" + era.n + "-" + events.length,
            yearLabel: str(e.yearLabel) || era.start,
            title: title.slice(0, 14),
            domain: str(e.domain) || "社会",
            baseline: before.slice(0, 44),
            alternate: after.slice(0, 44),
            track: e.track === "personal" ? "personal" : "world",
            hot: !!e.hot,
            certainty: certainty
          },
          view: {
            changed: true,
            alternate: after.slice(0, 44),
            why: why.slice(0, 40),
            chain: str(e.chain),
            detail: str(e.detail) || after,
            keywords: [],
            certainty: certainty
          }
        });
      });
      if (events.length < 2) return;
      seen[era.n] = true;
      out.push({
        n: era.n,
        era: era.id,
        name: str(ch.name) || era.name,
        span: era.span,
        subtitle: (str(ch.headline) || era.name).slice(0, 24),
        personal: str(ch.personalSummary).slice(0, 60),
        events: events
      });
    });
    out.sort((a, b) => a.n - b.n);
    if (!out.length) throw new Error("AI 没返回可用章节");
    return out;
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