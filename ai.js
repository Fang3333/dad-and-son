/* AI 适配层（v2.4）：唯一通道 = Qoder Sites 公共代理，访客免填 Key。
   Key 只存服务端 Secret DEEPSEEK_API_KEY，不进前端、不进仓库、不进浏览器存储。
   代理固定目的地 DeepSeek、固定模型与温度；前端只发 messages（system+user）。
   generateWorld：80 秒超时；仅 JSON 解析失败重试 1 次。
   结果缓存 wrm.aiCache：按 规则+干预+假设+模型 哈希，避免重复扣费；「重新生成」绕过缓存。
   本文件不 console 任何内容；错误信息只含静态中文与状态码。 */
(function (global) {
  "use strict";

  const PROXY = "/functions/v1/app/ai";
  const HEALTH = "/functions/v1/app/health";
  const CACHE_KEY = "wrm.aiCache";
  const TIMEOUT_MS = 80000;

  const DEFAULTS = {
    model: "deepseek-chat",
    temperature: 0.8
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

  function errFor(status) {
    if (status === 400) return "请求内容不合规范，稍后再试";
    if (status === 429) return "公共代理限流，稍后再试";
    if (status === 502) return "上游模型服务出错，稍后再试";
    if (status === 503) return "公共代理未配置，暂不可用";
    if (status === 504) return "上游模型服务超时，稍后再试";
    return "公共代理返回 " + status + "，稍后再试";
  }

  const OFFLINE_MSG = "公共代理不可用（当前环境没有云函数或网络不通）";
  const TIMEOUT_MSG = "超时（80 秒），模型没响应";

  /* 统一请求：只发同源代理；网络/超时/状态码都映射成中文，绝不带 Key */
  async function proxyRequest(path, body, timeoutMs) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs || TIMEOUT_MS);
    let res;
    try {
      res = await fetch(path, {
        method: body ? "POST" : "GET",
        credentials: "same-origin",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
        signal: ctrl.signal
      });
    } catch (e) {
      clearTimeout(timer);
      if (ctrl.signal.aborted) return { ok: false, code: "timeout", message: TIMEOUT_MSG };
      return { ok: false, code: "network", message: OFFLINE_MSG };
    }
    clearTimeout(timer);
    let json = null;
    try { json = await res.json(); } catch (e) { /* 非 JSON 按状态码处理 */ }
    if (!res.ok) {
      const code = json && typeof json.code === "string" ? json.code : "";
      return { ok: false, code: code || "http-" + res.status, message: errFor(res.status) };
    }
    return { ok: true, json: json };
  }

  async function health() {
    const r = await proxyRequest(HEALTH, null, 8000);
    if (!r.ok || !r.json || r.json.ok !== true) return { available: false, configured: false };
    return { available: true, configured: r.json.configured !== false };
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

  async function callOnce(p) {
    const r = await proxyRequest(PROXY, {
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userMessage(p) }
      ]
    });
    if (!r.ok) return r;
    const content = r.json && typeof r.json.content === "string" ? r.json.content : "";
    if (!content) return { ok: false, code: "empty", message: "AI 返回为空，稍后再试" };
    let json;
    try { json = JSON.parse(stripFences(content)); } catch (e) { return { ok: false, code: "parse", message: "AI 返回的不是合法 JSON" }; }
    return { ok: true, json: json };
  }

  /* 仅 JSON 解析失败重试 1 次；限流/上游错误/超时不重试 */
  async function generateWorld(p) {
    let r = await callOnce(p);
    if (!r.ok && r.code === "parse") r = await callOnce(p);
    if (!r.ok) return r;
    return { ok: true, json: r.json, model: DEFAULTS.model };
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
    health: health,
    errFor: errFor,
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