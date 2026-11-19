(function (global) {
  "use strict";

  const ERAS = [
    { id: "primitive", n: 1, name: "原始", start: "约 100 万年前", span: "约 100 万年前—前 3000" },
    { id: "ancient", n: 2, name: "古代", start: "前 3000", span: "前 3000—公元 1000" },
    { id: "earlymodern", n: 3, name: "近代早期", start: "1000", span: "1000—1750" },
    { id: "industrial", n: 4, name: "工业", start: "1750", span: "1750—1950" },
    { id: "modern", n: 5, name: "现代", start: "1950", span: "1950—2049" },
    { id: "future2050", n: 6, name: "2050", start: "2050", span: "2050—2099 · 虚构推演" },
    { id: "future2100", n: 7, name: "2100", start: "2100", span: "2100—2199 · 虚构推演" },
    { id: "posthuman2200", n: 8, name: "2200 后人类", start: "2200", span: "2200 及以后 · 虚构推演" }
  ];
  const RECAP = {
    2: "火种留住了，话学会了，种子埋进土里。",
    3: "文字、钱币和道路都照旧来过。",
    4: "印刷和帆船先把世界连了起来。",
    5: "蒸汽和电灯先亮过了夜。",
    6: "网络与机器学习已进日常，往后都是假设。",
    7: "假设人们已学会与智能设备共同生活。",
    8: "假设人类已在异地定居，开始讨论副本。"
  };
  const mechanisms = [
    { id: "dark-forest", group: "trisolaran", name: "黑暗森林", note: "暴露位置会增加威胁，交换信息要付出隐匿成本。", before: "人们公开传递位置", after: ["炊烟被盖在石缝里", "驿站只收无名信", "海图抹掉回程港口", "车站熄灯传暗号", "直播先遮掉窗外", "农场灯光朝地底照", "火星只收不发信号", "星际副本隐去坐标"] },
    { id: "science-lock", group: "trisolaran", name: "智子锁死", note: "基础实验无法突破，生活只能靠已有工具重新安排。", before: "实验能验证新知识", after: ["石匠只磨祖传石斧", "工坊照旧配方烧炉", "学会改修旧仪器", "工厂靠调班增产", "实验室改租旧设备", "脑机接口靠旧件修", "火星基地拆件互补", "副本学会补旧协议"] },
    { id: "dimension", group: "trisolaran", name: "降维打击", note: "假设生命能在降维后延续，占用空间成为新的手续。", before: "物件可以上下叠放", after: ["山洞铺不开第二张皮", "仓库不能叠第二袋粮", "船舱只许单层铺货", "工厂通道开始收费", "电梯改作平面走廊", "农场摊开占满街道", "火星舱室排成细线", "副本争一条空白边"] },
    { id: "wall-plan", group: "trisolaran", name: "面壁计划", note: "计划只能藏在心里，执行者必须先为不解释的决定备料。", before: "分工前先公开计划", after: ["石匠接到无图的活", "账房只见领料单", "工坊先造不知用途的轮", "仓库按暗单留煤", "采购表隐藏最终用途", "维修机等不到说明书", "气闸预留无名舱位", "副本只领局部权限"] },
    { id: "tech-burst", group: "trisolaran", name: "技术爆炸", note: "工具更新快过学习周期，刚熟练的手艺又要重新考核。", before: "一门手艺够用许久", after: ["新石斧还没磨就过时", "刻字师傅改学活字", "工坊图纸天天换页", "车间刚装机就搬家", "教程还没看完就下架", "脑机课程按晨晚更新", "火星工具箱每日重配", "副本醒来先补版本"] },
    { id: "suspicion", group: "trisolaran", name: "猜疑链", note: "不能判断对方是否守约，承诺要用可核对的物件作凭据。", before: "交易凭一句约定", after: ["换肉先押半块石斧", "驿站逐封验印", "船队互扣一份货单", "工厂交货先验铅封", "合约截图还要见证人", "配送机交换验收记录", "火星气闸逐人复核", "副本签字先验记忆"] },
    { id: "time-dilation", group: "film", name: "时间膨胀", note: "不同地点的时钟走速不同；早期差速区域是虚构前提。", before: "双方按同一日历办事", after: ["洞里一夜洞外换季", "驿差回来账已过期", "船回港时师傅已换", "列车两端各印时刻表", "通勤一次要补几天班", "探亲先校准两地时钟", "火星账单追不上旅客", "副本按各自时钟排班"] },
    { id: "time-view", group: "film", name: "五维回望", note: "假设旧时刻可以观察但不能修改，证据不再等于补救。", before: "过去只能凭回忆描述", after: ["旧火堆可看不可取暖", "旧契约可见不可重签", "沉船账单还在原处", "错装的齿轮只能重看", "聊天能回看不能撤回", "课堂回放不退课时费", "气闸事故演练无删改", "旧副本拒绝重演道歉"] },
    { id: "wandering-earth", group: "film", name: "地球流浪", note: "假设行星持续迁移，能量供应与居住位置都要重新分配。", before: "居所跟着固定季节安排", after: ["种子跟着暖石搬家", "粮仓先登记保温位", "航海表改查迁移方向", "锅炉优先供迁移站", "工位按供热时段排", "垂直农场兼做暖房", "火星接收迁居行李", "星际住址附移动轨迹"] },
    { id: "simulation", group: "film", name: "虚拟舱", note: "假设体验来自模拟，身体维护和主观生活分别记账。", before: "身体与所见处在同一处", after: ["梦里有肉醒来领水", "虚拟粮票不能喂真马", "画里的航程也收船费", "梦里下班身体仍值守", "房租分身体位和景观", "脑机课堂另收醒来费", "火星风景按带宽供应", "副本要求查看舱外账"] },
    { id: "mars-survival", group: "film", name: "火星求生", note: "采用封闭栖居的资源预算机制，不借用任何人物或情节。", before: "用完物资可以向外补给", after: ["洞里每把柴都记账", "封闭粮仓先留种", "船队把废水留下来", "工厂热气回收进食堂", "住户按维修表分工具", "农场把蒸汽收回水箱", "气闸旁贴每日耗气单", "副本也要交散热预算"] },
    { id: "language-time", group: "film", name: "语言即时间", note: "假设语言会改变主观时间感，不把科幻设定当作事实。", before: "一句话按先后顺序理解", after: ["话未说完就听到告别", "账房先想起还款那天", "船信先读到归港一句", "工人从交班句学开工", "约会先讨论告别那刻", "课程从会忘掉处开讲", "火星家书按思念排页", "副本用回忆安排明天"] }
  ];
  const commonParams = [
    { id: "publicRules", label: "公开执行办法", note: "关掉后，办理办法只由经手人解释。", default: true },
    { id: "sharedCost", label: "共同分担成本", note: "关掉后，各家各户自行准备物资。", default: true },
    { id: "exceptions", label: "保留申请例外", note: "打开后，规则保留一条人工申诉通道。", default: false },
    { id: "review", label: "定期复核规则", note: "关掉后，学习与生活沿用旧办法。", default: true }
  ];
  const raw = global.WRM_PRESET_BATCHES || [];
  const all = raw.map((p, i) => {
    const legacy = global.WRM_DATA && global.WRM_DATA.rules.find((r) => r.id === p.id);
    return Object.assign({}, p, {
      index: i + 1,
      title: p.name,
      premise: p.rule,
      category: "本地剧本 " + String(i + 1).padStart(2, "0"),
      question: "规则不变，调一调它怎样落地。",
      params: legacy ? legacy.params : commonParams,
      assumptions: { tech: true, resources: true, cooperate: true },
      intervention: { era: "primitive", yearLabel: "" },
      mechanisms: [],
      eraHooks: p.chapters.map((c, j) => ({ era: ERAS[j].id, world: c.events[0].after, personal: c.events[3].after + "；" + c.events[4].after })),
      signatureEvents: [0, 3, 7].map((n) => p.id + "-" + (n + 1) + "-1")
    });
  });

  function byId(id) { return all.find((p) => p.id === id); }
  function eraById(id) { return ERAS.find((e) => e.id === id) || ERAS[0]; }
  function mechanismById(id) { return mechanisms.find((m) => m.id === id); }
  function configurationError(state) {
    const ids = state.mechanisms || [];
    if (ids.length > 3) return "三体与电影机制合计最多选三个";
    if (ids.some((id) => !mechanismById(id))) return "有一项机制已不可用，请重新选择";
    if (ids.includes("science-lock") && ids.includes("tech-burst")) return "智子锁死与技术爆炸不能同时启用";
    if (state.ruleId === "science-lock" && ids.includes("tech-burst")) return "智子锁死剧本不能叠加技术爆炸";
    if (state.ruleId === "no-language" && ids.includes("language-time")) return "语言消失后不能叠加语言即时间";
    if (state.assumptions.tech === false && ids.includes("tech-burst")) return "技术不再累积时，不能启用技术爆炸";
    return "";
  }

  function annotate(item, text) {
    item.view.chain = item.view.chain ? item.view.chain + "；" + text : text;
  }

  function applyOptions(ch, p, state) {
    const originals = ch.events.map((item) => item.view.alternate);
    const conditions = new Map();
    p.params.forEach((param, i) => {
      const value = state.params[param.id];
      if (typeof value !== "boolean" || value === !!param.default) return;
      const item = ch.events[i === 3 ? 3 : i];
      annotate(item, param.label + (value ? "开启" : "关闭") + "：这件事须按新的办理条件执行");
      const outcomes = {
        diploma: "凭据不再单列毕业证", freeCourse: "你按统一课目练手艺", teacherEval: "师傅的评价变成凭据", employerDegree: "你先补一份学历凭据",
        hourlyPay: "报酬按成品重新结算", secondJob: "下班后又有人接第二份活", enforceOff: "门关了仍有人留活", productivity: "你用旧工具慢慢补进度",
        rationing: "先到的人多领一份", communityProduction: "各家各户自己筹货", blackMarket: "私下交换要搭人情", needsFirst: "你按到场先后领材料",
        publicRules: "办法只由经手人解释", sharedCost: "各家各户单独筹物资", exceptions: "多开一条人工申诉路", review: "你照旧办法重学一遍"
      };
      item.view.alternate = outcomes[param.id] || item.view.alternate;
      item.view.why = param.label.slice(0, 12) + (value ? "开启" : "关闭");
    });
    if (state.assumptions.tech === false) {
      ch.events[3].view.alternate = "你拿旧工具重学新办法";
      ch.events[3].view.why = "技术不再按时补位";
      annotate(ch.events[3], "原计划的工具未能按时更新，学习改用现成材料，进度由手工补上");
    }
    if (state.assumptions.resources === false) {
      ch.events[1].view.alternate = "领用先排队，余量不保证";
      ch.events[1].view.why = "物资不足以兜底";
      annotate(ch.events[1], "这项改写仍执行，但领用改为排队登记；本日没轮到的需求留到下次");
    }
    if (state.assumptions.cooperate === false) {
      ch.events[2].view.alternate = "办事先留一份担保";
      ch.events[2].view.why = "互信不足增加手续";
      annotate(ch.events[2], "参与者不再凭口头约定协作，经手的物件与承诺都要留下可核对的凭据");
    }
    (state.mechanisms || []).filter((id) => id !== p.id && !(p.id === "flat-world" && id === "dimension")).forEach((id, i) => {
      const m = mechanismById(id);
      const item = ch.events[i];
      item.ev.title = m.name;
      item.ev.baseline = m.before;
      item.view.alternate = m.after[ch.n - 1];
      item.view.why = m.name + "改变执行条件";
      conditions.set(item, m.note);
      annotate(item, "叠加机制：" + m.name + "；主规则仍是" + p.name);
    });
    ch.events.forEach((item, i) => {
      if (!item.view.chain) return;
      const reason = conditions.get(item) || item.view.why + "，办事的条件也跟着变了。";
      let detail = "「" + p.name + "」照常执行。本次变成「" + item.view.alternate + "」。" + reason;
      const previous = "原定的「" + originals[i] + "」不再照旧办理。";
      if (Array.from(detail + previous).length <= 120) detail += previous;
      for (const sentence of ["来人先核对这次能办什么，再把手里的物件交出去。", "经手人重新安排交接，原先省下的工夫又花在确认上。", "事情办完了，留下的凭据还得有人保管。"]) {
        if (Array.from(detail).length >= 80) break;
        detail += sentence;
      }
      item.view.detail = detail;
    });
  }

  function resolve(state) {
    const error = configurationError(state);
    if (error) throw new Error(error);
    const p = byId(state.ruleId);
    if (!p) throw new Error("请选择一套本地剧本");
    const start = eraById(state.intervention.era).n;
    return p.chapters.map((c, index) => {
      const era = ERAS[index];
      const ch = {
        n: era.n, era: era.id, name: era.name, span: era.span, subtitle: c.headline,
        personal: c.events[3].after + "；" + c.events[4].after,
        events: c.events.map((e, i) => ({
          ev: { id: p.id + "-" + era.n + "-" + (i + 1), title: e.title, yearLabel: era.start, domain: i < 3 ? ["制度", "生活", "工具"][i] : i === 3 ? "学习" : "恋爱", baseline: e.before, track: i < 3 ? "world" : "personal", hot: false },
          view: { changed: true, alternate: e.after, why: e.why, detail: e.detail, chain: "", keywords: [], certainty: "假设" }
        }))
      };
      applyOptions(ch, p, state);
      ch.personal = ch.events.slice(3).map((e) => e.view.alternate).join("；");
      return ch;
    }).filter((c) => c.n >= start);
  }

  global.WRM_PRESETS = { ERAS, RECAP, all, byId, eraById, mechanisms, mechanismById, configurationError, resolve };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_PRESETS;
})(typeof window !== "undefined" ? window : globalThis);
