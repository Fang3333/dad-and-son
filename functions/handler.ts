/* Qoder Sites Edge Function：公共 AI 代理。
   key 只从应用 Secret DEEPSEEK_API_KEY 读取；固定目的地 DeepSeek、固定模型、
   消息长度上限、每 IP 限流 + 全站每日上限 + 同稿缓存。
   纯 ESM 语法（零类型注解），便于在浏览器 / Node 做无凭证逻辑实测。 */

const UPSTREAM = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const MAX_CHARS = 16000;
const MAX_TOKENS = 6000;
const TIMEOUT = 75000;
const DAY_CAP = 500;
const IP_PER_MIN = 10;
const CACHE_TTL = 30 * 60 * 1000;
const CACHE_MAX = 300;

const cache = new Map();
const ipHits = new Map();
let dayKey = "";
let dayCount = 0;

function json(status, obj) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}

function secret() {
  const d = globalThis.Deno;
  return (d && d.env && d.env.get("DEEPSEEK_API_KEY")) || "";
}

function hash(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return String(h);
}

function clientIp(req) {
  const xf = req.headers.get("x-forwarded-for");
  return (xf ? xf.split(",")[0].trim() : req.headers.get("x-real-ip")) || "anon";
}

function rateOk(ip) {
  const now = Date.now();
  const day = new Date(now).toISOString().slice(0, 10);
  if (day !== dayKey) { dayKey = day; dayCount = 0; }
  if (dayCount >= DAY_CAP) return false;
  const arr = (ipHits.get(ip) || []).filter((t) => now - t < 60000);
  if (arr.length >= IP_PER_MIN) { ipHits.set(ip, arr); return false; }
  arr.push(now);
  ipHits.set(ip, arr);
  if (ipHits.size > 5000) ipHits.clear();
  dayCount++;
  return true;
}

function cacheGet(key) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL) { cache.delete(key); return null; }
  return hit.content;
}

function cacheSet(key, content) {
  if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value);
  cache.set(key, { content: content, at: Date.now() });
}

function validMessages(body) {
  if (!body || typeof body !== "object" || !Array.isArray(body.messages)) return null;
  if (body.messages.length < 1 || body.messages.length > 4) return null;
  let total = 0;
  const out = [];
  for (const m of body.messages) {
    if (!m || (m.role !== "system" && m.role !== "user") || typeof m.content !== "string") return null;
    total += m.content.length;
    if (total > MAX_CHARS) return null;
    out.push({ role: m.role, content: m.content });
  }
  return out;
}

export async function handler(req) {
  const url = new URL(req.url);
  const path = url.pathname;

  if (req.method === "GET" && (path.endsWith("/health") || path === "/")) {
    return json(200, { ok: true, configured: Boolean(secret()), dayCount: dayCount, dayCap: DAY_CAP });
  }

  if (path.endsWith("/ai")) {
    if (req.method !== "POST") return json(405, { ok: false, code: "method_not_allowed" });
    /* 同源校验由 Sites 网关负责（伪造 / 缺失 Origin 的写请求到不了这里）；
       函数内 req.url 是内部转发地址，不能拿它比对浏览器 Origin。 */
    const key = secret();
    if (!key) return json(503, { ok: false, code: "service_not_configured" });
    let body = null;
    try { body = await req.json(); } catch (e) { return json(400, { ok: false, code: "bad_json" }); }
    const messages = validMessages(body);
    if (!messages) return json(400, { ok: false, code: "bad_messages" });
    const ck = hash(JSON.stringify(messages));
    const cached = cacheGet(ck);
    if (cached) return json(200, { ok: true, content: cached, cached: true });
    if (!rateOk(clientIp(req))) return json(429, { ok: false, code: "rate_limited" });
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT);
    try {
      const res = await fetch(UPSTREAM, {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + key },
        body: JSON.stringify({ model: MODEL, temperature: 0.8, max_tokens: MAX_TOKENS, messages: messages })
      });
      if (!res.ok) return json(502, { ok: false, code: "upstream_error" });
      const data = await res.json();
      const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
      if (typeof content !== "string" || !content) return json(502, { ok: false, code: "upstream_empty" });
      cacheSet(ck, content);
      return json(200, { ok: true, content: content });
    } catch (e) {
      return json(504, { ok: false, code: "upstream_timeout" });
    } finally {
      clearTimeout(timer);
    }
  }

  return json(404, { ok: false, code: "not_found" });
}