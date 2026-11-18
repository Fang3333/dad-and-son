/*
  长河数据 v0.1 · 两页式第 2 页的唯一内容源
  ------------------------------------------------------------
  5 个时代 × 15 件大事。每件固定三段：原来(baseline) / 现在(alternate) / 为什么(why)，
  外加一句连锁反应(chain)。情景推演，不是史实。

  改写判定：rewrites[ruleId] 是变体数组，按顺序取第一个 when 命中的变体；
  when 缺省 = 任何参数都命中；needs 里的世界假设被关闭时，这条改不动（未改写）。
  顶层 alternate/changed/why 是「未改写」时的默认展示，运行时由 resolve() 覆盖。
  不改 world-rule/data.js 与 engine.js 的结构。
*/
(function (global) {
  "use strict";

  const ERAS = [
    { id: "primitive", name: "原始", span: "约 100 万年前—公元前 3000 年" },
    { id: "ancient", name: "古代", span: "公元前 3000—公元 1000" },
    { id: "earlymodern", name: "近代早期", span: "1000—1750" },
    { id: "industrial", name: "工业", span: "1750—1950" },
    { id: "modern", name: "现代", span: "1950—现在" }
  ];

  const ASSUMPTIONS = [
    { id: "tech", label: "技术会继续累积", note: "长河下游的技术仍会按时出现，改写只换讲法，不抽掉技术本身。" },
    { id: "resources", label: "资源足够", note: "免费、短工时、配给都有物质兜底，不会先被短缺压垮。" },
    { id: "cooperate", label: "群体愿意合作", note: "人们愿意按新规则互相配合，而不是先钻空子。" }
  ];

  const EVENTS = [
    /* ---------------- 原始 ---------------- */
    {
      id: "fire", era: "primitive", yearLabel: "约 100 万年前", title: "火", domain: "生存",
      bigEvent: "人类学会用火。",
      baseline: "火被保留下来，熟食、取暖、夜间防御出现。",
      alternate: "这条没变。", changed: false,
      why: "考试、工时、价格都管不到山洞里的火。",
      chain: "熟食和取暖让聚落变大，农业有了起点。",
      hotTags: [], certainty: "推算", hot: false, rewrites: {}
    },
    {
      id: "farm", era: "primitive", yearLabel: "约 1 万年前", title: "农业", domain: "生存",
      bigEvent: "第一粒种子埋进土里。",
      baseline: "第一粒种子埋下去，人第一次决定明年在哪里。",
      alternate: "这条没变。", changed: false,
      why: "取消考试和缩短工时，都动不了土里的种子。",
      chain: "余粮养活了不种地的人，城市和文字有了底子。",
      hotTags: [], certainty: "推算", hot: false,
      rewrites: {
        "free-goods": [{
          needs: ["resources", "cooperate"], certainty: "假设",
          alternate: "粮食不再标价，村社的公仓按人头分粮；埋种子的人不再盘算明年能卖多少。",
          why: "「商品免费」管到了粮仓：粮食是最早的商品。",
          chain: "余粮进公仓，配给的雏形比城市出现得更早。"
        }]
      }
    },
    {
      id: "settle", era: "primitive", yearLabel: "约 8000 年前", title: "定居", domain: "生存",
      bigEvent: "人不再跟着兽群走，盖起固定的村落。",
      baseline: "泥屋一间间立起来，陶罐埋在火塘边，孩子认得自家的门。",
      alternate: "这条没变。", changed: false,
      why: "村落怎么盖，和考场、班次、价签无关。",
      chain: "定居让存粮和手艺有了地方，分工从村里长出来。",
      hotTags: [], certainty: "推算", hot: false,
      rewrites: {
        "four-hour": [{
          needs: ["cooperate"], certainty: "假设",
          alternate: "村规约定：打猎、种地，每人每天只干四小时；剩下的时间补网、看孩子，村子不大，但没人累垮。",
          why: "四小时规则管到了村落的分工。",
          chain: "多出来的时间给了手艺，陶器和编织出现得更早。"
        }]
      }
    },

    /* ---------------- 古代 ---------------- */
    {
      id: "writing", era: "ancient", yearLabel: "约公元前 3000 年", title: "文字", domain: "制度",
      bigEvent: "史官把芦苇笔压进泥板。",
      baseline: "史官刻下王命，税收和律法可以跨年传递。",
      alternate: "这条没变。", changed: false,
      why: "有没有考试，税都要记账；文字不挂钩当前规则。",
      chain: "账目能记下来，粮仓和军队就能数清楚，帝国有了一本账。",
      hotTags: [], certainty: "推算", hot: false, rewrites: {}
    },
    {
      id: "money", era: "ancient", yearLabel: "约公元前 700 年", title: "货币", domain: "经济",
      bigEvent: "贝壳被串起来，铜钱被铸出来。",
      baseline: "贝壳被串起来，交换不再需要双方同时想要对方的东西。",
      alternate: "这条没变。", changed: false,
      why: "考场和班次管不到贝壳；货币只认价格。",
      chain: "陌生人之间也能成交，市场跨过村口。",
      hotTags: [], certainty: "推算", hot: false,
      rewrites: {
        "free-goods": [
          {
            when: { blackMarket: true }, needs: ["resources"], certainty: "假设",
            alternate: "官价没了，贝壳和铜钱却没消失；它们转进巷子，成了黑市里的硬通货。",
            why: "商品免费，但允许黑市：价格只是搬了家。",
            chain: "巷子里的汇率比官方的秤还准，商人换个地方继续做。"
          },
          {
            needs: ["resources"], certainty: "推算",
            alternate: "钱被收起来，商品不再标价；长途贸易变成运输，税收直接收粮和布。",
            why: "「商品免费」抽掉了货币存在的理由。",
            chain: "市场缩成配给点，商人阶层失去位置。"
          }
        ]
      }
    },
    {
      id: "empire", era: "ancient", yearLabel: "公元前 221 年", title: "帝国·道路", domain: "制度",
      bigEvent: "道路修成网，书同文，车同轨。",
      baseline: "道路压直了地平线，诏令沿着驿站跑，税粮沿着同一条路进都城。",
      alternate: "这条没变。", changed: false,
      why: "道路和驿站不认考场，只认诏令。",
      chain: "统一的文字和车轨，让市场半径跟着帝国变大。",
      hotTags: [], certainty: "推算", hot: false,
      rewrites: {
        "no-exam": [{
          needs: ["cooperate"], certainty: "假设",
          alternate: "朝廷选官不再考策论，改靠荐举和试职；道路照样跑诏令，只是不再跑赶考的人。",
          why: "「取消考试」管到了选官：考场搬进了朝廷。",
          chain: "荐举让门第成了门票，官员流动变慢。"
        }]
      }
    },

    /* ---------------- 近代早期 ---------------- */
    {
      id: "print", era: "earlymodern", yearLabel: "1450 年", title: "印刷", domain: "文化",
      bigEvent: "古登堡的压板压出第一页书。",
      baseline: "一页纸从压板里出来，抄写员的手停在半空。",
      alternate: "这条没变。", changed: false,
      why: "压板印什么，由读者决定，不由考场决定。",
      chain: "书变便宜，科学革命有了读者。",
      hotTags: [], certainty: "推算", hot: false,
      rewrites: {
        "no-exam": [
          {
            when: { diploma: true }, certainty: "推算",
            alternate: "考试没了，毕业证还在；印刷机日夜印证书和推荐信模板，纸价先涨了一轮。",
            why: "仍发毕业证：证书成了新的印刷畅销品。",
            chain: "印刷业围着证书转，手册和图谱反而少了。"
          },
          {
            certainty: "推算",
            alternate: "印刷机照样转，只是不再印备考范文，改印手册、图谱和项目指南；知识绕开考场流传。",
            why: "考试取消，印刷的指挥棒从题库转向动手的材料。",
            chain: "识字率照样上升，只是上升不再为了考场。"
          }
        ]
      }
    },
    {
      id: "sail", era: "earlymodern", yearLabel: "1492 年", title: "航海", domain: "国际",
      bigEvent: "远洋帆船跨过大西洋。",
      baseline: "船帆消失在海平线，作物和病跟着船跨了半球，餐桌换了内容。",
      alternate: "这条没变。", changed: false,
      why: "航线认风和洋流，不认考场和班次。",
      chain: "世界市场被航线缝起来，白银流向作坊。",
      hotTags: [], certainty: "推算", hot: false,
      rewrites: {
        "free-goods": [{
          needs: ["resources", "cooperate"], certainty: "假设",
          alternate: "货船照样开，只是舱里不再装待价而沽的商品，改装配给的粮和布；货单上写的是人头，不是价格。",
          why: "商品免费后，海外贸易变成海外调拨。",
          chain: "航海少了利润驱动，新航线开得慢了。"
        }]
      }
    },
    {
      id: "science", era: "earlymodern", yearLabel: "1687 年", title: "科学革命", domain: "技术",
      bigEvent: "《原理》出版，天体运行可以计算。",
      baseline: "牛顿把运动定律写进书里，彗星不再负责预告灾祸。",
      alternate: "这条没变。", changed: false,
      why: "定律不考试，它只等观测。",
      chain: "自然可以被计算，蒸汽和电力有了理论起点。",
      hotTags: [], certainty: "推算", hot: false,
      rewrites: {
        "no-exam": [{
          when: { teacherEval: true }, needs: ["cooperate"], certainty: "假设",
          offWhy: "教师评价权没保留，学会的新门票还没立起来，这条暂时改不动。",
          alternate: "学会不再用辩论考试筛人，改看实验记录和论文；科学革命照样来，只是门票换了。",
          why: "大学考场取消，教师评价权保留：学会的门票换成实验记录。",
          chain: "同行评议提前成型，名声比分数更早成为硬通货。"
        }]
      }
    },

    /* ---------------- 工业 ---------------- */
    {
      id: "steam", era: "industrial", yearLabel: "1776 年", title: "蒸汽机", domain: "技术",
      bigEvent: "瓦特的蒸汽机开始转动。",
      baseline: "蒸汽机第一次把煤变成运动，工厂不再只靠河流。",
      alternate: "这条没变。", changed: false,
      why: "锅炉只认煤和水，不认考场。",
      chain: "动力脱离地理，内陆城市围着煤矿长出来。",
      hotTags: [], certainty: "推算", hot: false,
      rewrites: {
        "four-hour": [{
          when: { enforceOff: true }, needs: ["cooperate"], certainty: "假设",
          offWhy: "没有强制下班，四小时的班表在工厂里落不了地。",
          alternate: "蒸汽机照样转，只是厂门规定：每人每天只看四小时机器；班次翻倍，汽笛一天多响几回。",
          why: "四小时规则管到了工厂的班表。",
          chain: "轮班制提前普及，工人的诉求从工钱变成时间。"
        }]
      }
    },
    {
      id: "rail", era: "industrial", yearLabel: "1830 年", title: "铁路", domain: "经济",
      bigEvent: "利物浦—曼彻斯特铁路通车。",
      baseline: "火车把时间切成时刻表，迟到第一次成为罪。",
      alternate: "这条没变。", changed: false,
      why: "铁轨不考试，也不打卡。",
      chain: "标准时间统一了全国的钟，市场半径又大一圈。",
      hotTags: [], certainty: "推算", hot: false,
      rewrites: {
        "four-hour": [{
          needs: ["cooperate"], certainty: "推算",
          alternate: "时刻表重写：乘务组每天只值四小时，车照样开，班次却密了一倍，货在编组站排起队。",
          why: "四小时规则管到了乘务组的排班。",
          chain: "运力变紧，市场半径缩回去一圈。"
        }]
      }
    },
    {
      id: "electric", era: "industrial", yearLabel: "1882 年", title: "电力", domain: "技术",
      bigEvent: "珍珠街电站点亮第一盏街灯。",
      baseline: "电顺着线走，动力和光能送到每户。",
      alternate: "这条没变。", changed: false,
      why: "电站发不发电，和考试、工时、价格无关。",
      chain: "流水线和夜班出现，城市开始不睡觉。",
      hotTags: [], certainty: "推算", hot: false, rewrites: {}
    },

    /* ---------------- 现代 ---------------- */
    {
      id: "compute", era: "modern", yearLabel: "1969 年", title: "计算机·互联网", domain: "技术",
      bigEvent: "阿帕网发出第一封邮件。",
      baseline: "第一封邮件发出去，收件人问：这玩意儿有什么用？",
      alternate: "这条没变。", changed: false,
      why: "网线不认考场，只认协议。",
      chain: "平台、直播和 AI 都顺着网线长出来，现代按了快进。",
      hotTags: [], certainty: "推算", hot: false,
      rewrites: {
        "no-exam": [{
          when: { employerDegree: false }, needs: ["tech"], certainty: "推算",
          offWhy: "企业仍看学历，平台不敢把文凭栏撤掉。",
          alternate: "网课照样上，只是不再发结业考证书；平台改晒项目仓库和代码提交记录，简历里的学历栏空了。",
          why: "考试取消、企业不看学历：互联网的凭据从证书换成作品。",
          chain: "平台按作品招人，包装产业跟着搬上网。"
        }],
        "four-hour": [{
          when: { enforceOff: true }, needs: ["tech", "cooperate"], certainty: "假设",
          offWhy: "没有强制断联，运维的四小时班表落不了地。",
          alternate: "机房照样嗡嗡响，只是运维每天只值四小时；夜里十点后的报警排队到天亮，互联网每天慢四小时。",
          why: "四小时规则管到了运维的班表。",
          chain: "全天候在线的承诺打了折，用户学会等。"
        }],
        "free-goods": [{
          when: { rationing: true }, needs: ["tech", "resources"], certainty: "假设",
          offWhy: "按需配给没开，数字商品还在黑市里标价。",
          alternate: "带宽和算力不再标价，平台按需分配流量；付费推广消失，推荐位成了新的票证。",
          why: "商品免费，数字商品最先被配给。",
          chain: "广告模式塌了，平台靠配额活着。"
        }]
      }
    },
    {
      id: "liang", era: "modern", yearLabel: "2023 年", title: "亮哥的头发", domain: "娱乐",
      bigEvent: "亮哥的直播间被弹幕刷了屏。",
      baseline: "亮哥一开播，弹幕不刷商品，刷“做头发”。",
      alternate: "这条没变。", changed: false,
      why: "亮哥的头发和考场无关。",
      chain: "弹幕梗比商品传得快，直播间成了段子现场。",
      hotTags: ["做头发", "直播带货"], certainty: "假设", hot: true,
      rewrites: {
        "four-hour": [{
          when: { enforceOff: true }, needs: ["cooperate"], certainty: "假设",
          offWhy: "没有强制下班，亮哥的四小时播不满也停不下。",
          alternate: "四小时工作制后，亮哥每天只播四小时；弹幕还在刷，他干脆把发型师请进直播间，现场剪了个寸头，人数翻倍。",
          why: "四小时工作制改变了直播时长。",
          chain: "直播行业开始卖“剪头发现场”，不卖羽绒服。"
        }],
        "free-goods": [{
          needs: ["resources"], certainty: "假设",
          alternate: "羽绒服免费之后，直播间没货可卖；亮哥改播剪头发，弹幕照样刷“做头发”。",
          why: "商品免费，直播带货失去了货。",
          chain: "直播从卖货转向卖现场，段子成了正经营生。"
        }]
      }
    },
    {
      id: "heartburn", era: "modern", yearLabel: "2024 年", title: "不烧心", domain: "社会",
      bigEvent: "一句短剧台词刷了屏。",
      baseline: "AI 短剧台词“贵是贵点，但吃了不烧心”刷屏。",
      alternate: "这条没变。", changed: false,
      why: "台词烧不烧心，和考场、班次无关。",
      chain: "梗从屏幕走进摊位，买卖开始互相演。",
      hotTags: ["不烧心", "AI 短剧"], certainty: "假设", hot: true,
      rewrites: {
        "free-goods": [{
          needs: ["resources", "cooperate"], certainty: "假设",
          alternate: "商品免费后，摊主改口“都免费了，但吃了不烧心”；顾客反而更怀疑，队伍更长。",
          why: "商品免费规则改写了买卖关系。",
          chain: "短剧开始拍“免费摊主”，台词变成“不要钱，但更不烧心”。"
        }]
      }
    }
  ];

  function assumptionLabel(id) {
    const a = ASSUMPTIONS.find((x) => x.id === id);
    return a ? a.label : id;
  }

  function matchWhen(when, params) {
    if (!when) return true;
    return Object.keys(when).every((k) => !!params[k] === when[k]);
  }

  /* 返回 {changed, alternate, why, chain, certainty, blocked} */
  function resolve(ev, ruleId, params, assumptions) {
    const raw = ev.rewrites ? ev.rewrites[ruleId] : null;
    const list = raw ? (Array.isArray(raw) ? raw : [raw]) : [];
    for (let i = 0; i < list.length; i++) {
      const v = list[i];
      if (!matchWhen(v.when, params)) continue;
      const blocked = (v.needs || []).filter((id) => assumptions && assumptions[id] === false);
      if (blocked.length) {
        return {
          changed: false, alternate: "这条没变。",
          why: "假设「" + blocked.map(assumptionLabel).join("」「") + "」关闭，这条改不动。",
          chain: ev.chain, certainty: ev.certainty, blocked: blocked
        };
      }
      return {
        changed: true, alternate: v.alternate, why: v.why,
        chain: v.chain || ev.chain, certainty: v.certainty || ev.certainty, blocked: []
      };
    }
    const offWhy = list.length && list[0].offWhy ? list[0].offWhy : ev.why;
    return { changed: false, alternate: "这条没变。", why: offWhy, chain: ev.chain, certainty: ev.certainty, blocked: [] };
  }

  function summary(ruleId, params, assumptions) {
    let changed = 0;
    EVENTS.forEach((ev) => { if (resolve(ev, ruleId, params, assumptions).changed) changed++; });
    return { changed: changed, total: EVENTS.length };
  }

  global.WRM_RIVER = {
    meta: { version: "0.1.0", disclaimer: "情景推演，不是史实。" },
    eras: ERAS,
    assumptions: ASSUMPTIONS,
    events: EVENTS,
    resolve: resolve,
    summary: summary
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_RIVER;
})(typeof window !== "undefined" ? window : globalThis);