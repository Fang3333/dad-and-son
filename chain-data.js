/* 因果长河数据：5 时代 / 13 主线节点 / 12 主线边 / 3 现代热点支线。
   只供 UI 消费，不改 world-rule/data.js 与 engine.js。
   所有节点为情景推演锚点，不是史实；改写部分为虚构。 */
(function (global) {
  "use strict";

  const eras = [
    { id: "primitive", name: "原始", span: "约 100 万年前—前 3000", tone: "短句 · 拟声 · 身体", band: "#E4D8C0" },
    { id: "ancient", name: "古代", span: "前 3000—公元 1000", tone: "史书 · 竹简 · 诏令", band: "#DCCBA6" },
    { id: "earlymodern", name: "近代早期", span: "1000—1750", tone: "报纸 · 电报 · 书信", band: "#C7D0D6" },
    { id: "industrial", name: "工业", span: "1750—1950", tone: "时刻表 · 工厂告示 · 电讯", band: "#D6D2C6" },
    { id: "modern", name: "现代", span: "1950—现在", tone: "推送 · 弹幕 · 系统通知", band: "#E2C8C2" }
  ];

  const nodes = [
    {
      id: "fire", era: "primitive", order: 1, yearLabel: "约公元前 40 万年", title: "火",
      anchor: "直立人把雷击留下的火种搬进山洞，开始喂它柴。",
      narrative: "火灭了。洞里只剩牙齿碰石头的声音。",
      cause: "火能煮软肉、吓走兽，夜里敢睡沉了。",
      effect: "煮食省下的力气长进脑子，人开始围着一堆火说话。",
      certainty: "推算", sensitiveTo: []
    },
    {
      id: "farm", era: "primitive", order: 2, yearLabel: "约公元前 9000 年", title: "农业",
      anchor: "新月沃地的人把野麦穗选大、埋进土里，等它明年再长。",
      narrative: "第一粒种子埋下去，人第一次决定明年在哪里。",
      cause: "存粮让人不再跟着兽群走，房子和仓库先立起来。",
      effect: "余粮养出不种地的人：陶匠、祭司、记账的手。",
      certainty: "推算", sensitiveTo: ["free-goods:rationing"]
    },
    {
      id: "writing", era: "ancient", order: 3, yearLabel: "约公元前 3200 年", title: "文字",
      anchor: "苏美尔人在湿泥板上压出楔形记号，先记的是粮和羊。",
      narrative: "史官刻下：王命铸鼎。鼎成，民不知其重。",
      cause: "账记在泥上，人脑记不住的债有了凭据。",
      effect: "命令能传到看不见的地方，王权长出牙齿。",
      certainty: "推算", sensitiveTo: ["no-exam:diploma"]
    },
    {
      id: "money", era: "ancient", order: 4, yearLabel: "约公元前 600 年", title: "货币",
      anchor: "吕底亚把琥珀金敲成带狮头的小块，按重量付给士兵。",
      narrative: "贝壳被串起来，第一次有人为「以后」定价。",
      cause: "一枚钱把「欠你多少」写成双方都认的数。",
      effect: "陌生人之间也能成交，市场跨过村口。",
      certainty: "推算", sensitiveTo: ["free-goods"]
    },
    {
      id: "empire", era: "ancient", order: 5, yearLabel: "公元前 221 年", title: "帝国·道路",
      anchor: "秦把车轨统一成六尺，驰道从咸阳铺到旧六国。",
      narrative: "路修到山那边，税吏比商队先到。",
      cause: "路、文字、钱凑齐，一个命令能管到千里外。",
      effect: "统一度量省了换算，也省了地方说不的余地。",
      certainty: "推算", sensitiveTo: ["free-goods:communityProduction"]
    },
    {
      id: "print", era: "earlymodern", order: 6, yearLabel: "1450 年", title: "印刷",
      anchor: "古登堡把活字排进压板，一页圣经比抄写员快百倍。",
      narrative: "一页纸从压板里出来，抄写员的手停在半空。",
      cause: "同一页纸能印一千份，知识不再靠手抄传。",
      effect: "读的人多了，问「为什么」的人也跟着多。",
      certainty: "推算", sensitiveTo: ["no-exam"]
    },
    {
      id: "sail", era: "earlymodern", order: 7, yearLabel: "1492 年", title: "航海",
      anchor: "三艘船离开帕洛斯港，横渡大西洋去找一条新路。",
      narrative: "船离开港口，地图上多了一条回家的线。",
      cause: "罗盘和星盘把海路变成可重复的航线。",
      effect: "作物和病跟着船跨了半球，餐桌换了内容。",
      certainty: "推算", sensitiveTo: ["free-goods:blackMarket"]
    },
    {
      id: "science", era: "earlymodern", order: 8, yearLabel: "1687 年", title: "科学革命",
      anchor: "《自然哲学的数学原理》出版，把天上和地上写成同一组方程。",
      narrative: "苹果掉下来，这一次有人拿笔算它。",
      cause: "实验加数学，让「我以为」变成「量给你看」。",
      effect: "自然被拆成可算的零件，机器有了图纸。",
      certainty: "推算", sensitiveTo: ["no-exam:freeCourse"]
    },
    {
      id: "steam", era: "industrial", order: 9, yearLabel: "1776 年", title: "蒸汽机",
      anchor: "瓦特给纽科门机加了分离冷凝器，煤耗降了一大半。",
      narrative: "伦敦，昨日电——蒸汽机第三次爆炸，工厂主说这是必要的代价。",
      cause: "烧煤就能出力，工厂不必再建在河边。",
      effect: "人围着机器排班，钟点比日出管用。",
      certainty: "假设", sensitiveTo: ["four-hour"]
    },
    {
      id: "rail", era: "industrial", order: 10, yearLabel: "1825 年", title: "铁路",
      anchor: "斯托克顿到达灵顿的火车拉了煤也拉了人，时速二十四公里。",
      narrative: "火车把时间切成时刻表，迟到第一次成为罪。",
      cause: "铁轨把城市连成一条线，货和人按点走。",
      effect: "各地改用同一个钟点，「晚点」成了新词。",
      certainty: "推算", sensitiveTo: ["four-hour:hourlyPay"]
    },
    {
      id: "electric", era: "industrial", order: 11, yearLabel: "1882 年", title: "电力",
      anchor: "珍珠街电站送电，曼哈顿一平方英里的灯同时亮起。",
      narrative: "灯泡亮起，夜晚第一次可以被买卖。",
      cause: "电顺着线走，动力和光能送到每户。",
      effect: "夜班和夜生活出现，一天被拉成两段。",
      certainty: "推算", sensitiveTo: ["four-hour:enforceOff"]
    },
    {
      id: "compute", era: "modern", order: 12, yearLabel: "1969 年", title: "计算机·互联网",
      anchor: "打孔卡把世界折成一行行孔，阿帕网再把四台机器连起来。",
      narrative: "机房嗡嗡响，世界被折进一张打孔卡。第一封邮件发出去，收件人问：这玩意儿有什么用？",
      cause: "机器算完再互相说话，距离不再花钱。",
      effect: "信息、钱、命令都以比特走，慢的环节被逐个删掉。",
      certainty: "推算", sensitiveTo: ["four-hour:productivity", "no-exam:teacherEval"]
    },
    {
      id: "ai", era: "modern", order: 13, yearLabel: "2020 年代", title: "AI",
      anchor: "大模型把海量文本压成权重，再按下一个词的概率往外吐。",
      narrative: "您有一条新的世界线通知：第 3 版已生成，是否覆盖第 2 版？",
      cause: "算力加数据够大，机器能接住没写过的问法。",
      effect: "判断被外包给模型，人开始复核机器的答案。",
      certainty: "不确定", sensitiveTo: ["no-exam:employerDegree", "four-hour:secondJob"]
    }
  ];

  const edges = [
    { from: "fire", to: "farm", relation: "余粮", strength: 0.8, assumption: "火煮食省下的时间被用来驯化植物", explanation: "煮食让人定居有余力，才轮到把种子埋下去。" },
    { from: "farm", to: "writing", relation: "记账", strength: 0.8, assumption: "余粮需要记录分配", explanation: "粮多了记不住，泥板先记粮和羊。" },
    { from: "writing", to: "money", relation: "凭据", strength: 0.7, assumption: "记债的符号被简化成可交换的凭据", explanation: "账能写下，欠多少就能写成双方认的数。" },
    { from: "money", to: "empire", relation: "税收", strength: 0.7, assumption: "统一货币降低征税成本", explanation: "钱统一了，税吏能按同一个数收千里外。" },
    { from: "empire", to: "print", relation: "需求", strength: 0.6, assumption: "统一政令需要大量复制文本", explanation: "命令要传千里，手抄不够，压板顶上。" },
    { from: "print", to: "sail", relation: "知识", strength: 0.6, assumption: "印刷的地图和航海表降低远航风险", explanation: "海图能印一千份，船敢离开海岸线。" },
    { from: "sail", to: "science", relation: "样本", strength: 0.6, assumption: "新大陆的物种和观测冲击旧解释", explanation: "带回的样本旧书解释不了，只能重新量。" },
    { from: "science", to: "steam", relation: "图纸", strength: 0.7, assumption: "力学和热学给机器提供可算的设计", explanation: "自然被算成零件，蒸汽机有了图纸。" },
    { from: "steam", to: "rail", relation: "动力", strength: 0.8, assumption: "蒸汽机装上轮子和铁轨", explanation: "出力不用靠河，火车把城市连成线。" },
    { from: "rail", to: "electric", relation: "网络", strength: 0.6, assumption: "铁路的调度需求催生电信与供电网", explanation: "按点走需要统一信号，线和电跟着铺。" },
    { from: "electric", to: "compute", relation: "开关", strength: 0.7, assumption: "电力让电子开关成为可能", explanation: "电送到每户，也算得动每秒亿次的开关。" },
    { from: "compute", to: "ai", relation: "算力", strength: 0.8, assumption: "网络攒下的数据和算力喂出模型", explanation: "比特攒够多，没写过的问法机器也能接。" }
  ];

  const hotBranches = [
    { id: "hot-liang", era: "modern", title: "亮哥的头发", cardId: "hot-liang-hair" },
    {
      id: "hot-falcon", era: "modern", title: "猎鹰退休",
      card: {
        id: "branch-falcon", category: "科技", code: "火星哥", title: "猎鹰退休",
        realLine: "星舰稳定回收后，猎鹰九号逐步退出一线发射。",
        altLine: "四小时轮班下发射场改班次，猎鹰最后一次落地被火星哥送进博物馆，门票免费。",
        memeTags: ["猎鹰退休", "门票免费"], memeLevel: "S",
        heatProof: { source: "公开航天发射记录", date: "2024", metric: "猎鹰九号年度发射次数" },
        safety: "public-pro", note: "虚构改写，勿对号入座"
      }
    },
    {
      id: "hot-heartburn", era: "modern", title: "不烧心",
      card: {
        id: "branch-heartburn", category: "生活", code: "摊主", title: "不烧心",
        realLine: "AI 短剧里一句台词火了：「贵是贵点，但吃了不烧心。」",
        altLine: "商品不再有价格后，摊主把话改口：「都免费了，但吃了不烧心。」",
        memeTags: ["不烧心", "贵是贵点"], memeLevel: "S",
        heatProof: { source: "虚构短剧台词设定", date: "2026", metric: "示意 · 非统计" },
        safety: "fiction", note: "虚构改写，勿对号入座"
      }
    }
  ];

  function nodeById(id) {
    return nodes.find((n) => n.id === id) || null;
  }

  function changedNodes(ruleId, params) {
    const out = [];
    for (const n of nodes) {
      const hit = (n.sensitiveTo || []).some((token) => {
        const parts = token.split(":");
        if (parts[0] !== ruleId) return false;
        return parts.length === 1 || Boolean(params && params[parts[1]]);
      });
      if (hit) out.push(n.id);
    }
    return out;
  }

  global.WRM_CHAIN = {
    version: "1.4.1",
    disclaimer: "情景推演，不是史实。节点为示意锚点，改写部分为虚构。",
    eras, nodes, edges, hotBranches, nodeById, changedNodes
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_CHAIN;
})(typeof window !== "undefined" ? window : globalThis);