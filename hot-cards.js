/* 热点改写卡 · 国民梗主梗数据 v1.2.0（WRM_HOT_EVENTS）
   只做 S 级主梗，每条带 heatProof（公开梗源现象 + 公开口径数字）。
   真实人物只用代号、只写公开职业事件；其余为虚构或公开现象。
   每张卡均为虚构改写，勿对号入座。UI 只消费本文件，不改 world-rule/data.js 与 engine.js。 */
(function (global) {
  "use strict";

  const cards = [
    {
      id: "hot-liang-live",
      category: "直播",
      code: "亮哥",
      title: "亮哥播满12小时",
      realLine: "亮哥自嘲无戏可拍，转身把直播间播成顶流：一场连播12小时，战报销售额5.7亿，下播还在喊「上链接」。",
      altLine: "四小时工作制后，亮哥直播到点被强制下播；5.7亿改成「四小时限定」，粉丝第一次在直播间看到主播准时下班。",
      memeTags: ["上链接", "5.7亿", "播12小时"],
      memeLevel: "S",
      heatProof: { source: "平台公开直播战报与媒体报道", date: "2024-06", metric: "单场直播销售额约5.7亿元、连播约12小时" },
      ruleFit: ["four-hour"],
      safety: "public-pro",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-mars-launch",
      category: "科技",
      code: "火星哥",
      title: "火星哥又发射了",
      realLine: "火星哥的星舰又一次试飞，猎鹰火箭海上回收已成常态；倒计时归零那一刻，全网跟着屏住呼吸。",
      altLine: "四小时工作制漂洋过海，火星哥发射窗口也限四小时；倒计时到点没点火就改明天，观众第一次看到火箭「准时下班」。",
      memeTags: ["星舰", "猎鹰回收", "倒计时"],
      memeLevel: "S",
      heatProof: { source: "官方发射直播与公开航天报道", date: "2024-2025", metric: "星舰多次试飞、猎鹰火箭海上回收常态化" },
      ruleFit: ["four-hour"],
      safety: "public-pro",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-leather-keynote",
      category: "科技",
      code: "皮衣哥",
      title: "皮衣哥发布会拖堂",
      realLine: "皮衣哥发布会讲了三小时，皮衣换了四件，股价跟着换；网友说买的不是显卡，是那件皮衣。",
      altLine: "四小时工作制落地后，皮衣哥发布会限时四小时含换装；超时自动断电，他第一次在台上说完「谢谢」，而不是「再讲一点」。",
      memeTags: ["皮衣", "发布会拖堂", "刀法"],
      memeLevel: "S",
      heatProof: { source: "公开科技发布会文化·国民二创母题", date: "2023-2025", metric: "皮衣+发布会成全网二创热点话题" },
      ruleFit: ["four-hour"],
      safety: "fiction",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-gold",
      category: "财经",
      code: "黄金",
      title: "黄金和房价谁先硬",
      realLine: "金价屡创新高，金店排队囤金豆的年轻人比买金镯的大妈还多；中介朋友圈开始转发金条图。",
      altLine: "价格消失后，金条按克配给、房子按户配给；中介改行做「需要评估师」，上门问你到底更需要安全感，还是更需要安全感。",
      memeTags: ["金价新高", "囤金豆", "安全感"],
      memeLevel: "S",
      heatProof: { source: "公开行情与媒体报道", date: "2024-2025", metric: "金价屡创新高、年轻人囤金豆上热搜" },
      ruleFit: ["free-goods"],
      safety: "public-data",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-ev-price",
      category: "财经",
      code: "某电车厂",
      title: "某电车厂又降价",
      realLine: "某电车厂一周降价两次，喊出「电比油低」，老车主拉横幅要求补差价，售后电话被打爆。",
      altLine: "价格消失后，某电车厂改按「需要」排产：提车先填用车理由，理由写得感人的优先；横幅没处挂，因为售后也免费了。",
      memeTags: ["价格战", "电比油低", "补差价"],
      memeLevel: "S",
      heatProof: { source: "车企公开降价公告与媒体报道", date: "2024", metric: "多轮官方降价、价格战屡上热搜" },
      ruleFit: ["free-goods"],
      safety: "fiction",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-civil-exam",
      category: "社会",
      code: "考公热",
      title: "考公报名挤崩服务器",
      realLine: "考公报名开闸十分钟服务器挤崩，热门岗位千里挑一；应届生边刷新边背行测，把「上岸」挂嘴边。",
      altLine: "取消考试后，考公改抽「服务情景签」：抽到「帮大妈找猫」就现场演；行测培训班改开表演课，申论老师教哭戏。",
      memeTags: ["考公", "上岸", "千里挑一"],
      memeLevel: "S",
      heatProof: { source: "公开报名数据与媒体报道", date: "2024-2025", metric: "报名人数连创新高、热门岗千里挑一" },
      ruleFit: ["no-exam"],
      safety: "public-data",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-village-coffee",
      category: "社会",
      code: "村咖",
      title: "村咖开进村委会隔壁",
      realLine: "村咖开在村委会隔壁，拿铁二十八，拍照的人比喝的人多；县城青年把咖啡馆当新景点打卡。",
      altLine: "四小时工作制后，村咖下午两点就打烊；店主把剩下四小时用来种咖啡豆，拿铁降到八块，拍照的人终于坐下喝了一口。",
      memeTags: ["村咖", "县城打卡", "两点打烊"],
      memeLevel: "S",
      heatProof: { source: "文旅公开报道与平台打卡热榜", date: "2024-2025", metric: "村咖成文旅热搜、打卡量级话题" },
      ruleFit: ["four-hour"],
      safety: "public-data",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-postgrad",
      category: "教育",
      code: "考研",
      title: "考研人数又新高",
      realLine: "考研报名高位运行，自习室座位摇号，摇中比上岸还难；「二战」「三战」成了评论区高频词。",
      altLine: "取消考试后，考研改「申请+面谈」：自习室座位不再摇号，改排研究计划答辩；背书的人少了，讲故事的人多了。",
      memeTags: ["考研", "上岸", "二战"],
      memeLevel: "S",
      heatProof: { source: "公开报名数据与媒体报道", date: "2024-2025", metric: "考研报名高位、自习室一座难求" },
      ruleFit: ["no-exam"],
      safety: "public-data",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-campus-hire",
      category: "教育",
      code: "校招",
      title: "校招笔试又加一轮",
      realLine: "校招笔试加到第四轮，应届生把行测刷成肌肉记忆；「第一学历」像一道看不见的门槛挂在简历上。",
      altLine: "取消考试后，校招笔试取消，改「工位试用半天」：HR 发现刷题库的肌肉记忆没用，会问问题的人半天就露馅，也会半天就发光。",
      memeTags: ["校招", "行测", "第一学历"],
      memeLevel: "S",
      heatProof: { source: "企业公开招聘流程与媒体报道", date: "2024-2025", metric: "校招笔试多轮、行测题库热销" },
      ruleFit: ["no-exam"],
      safety: "public-data",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-jini-concert",
      category: "娱乐",
      code: "姬霓",
      title: "姬霓演唱会门票秒没",
      realLine: "虚构歌手姬霓的演唱会门票三秒售罄，黄牛票价够买一块显卡；粉丝举着灯牌合唱「姬霓太美」。",
      altLine: "价格消失后，姬霓演唱会门票按「热爱配给」：申请要写一段你和这首歌的故事；黄牛失业转行代写，写得比粉丝还感人。",
      memeTags: ["姬霓太美", "演唱会", "热爱配给"],
      memeLevel: "S",
      heatProof: { source: "虚构歌手·原型为全网神曲二创现象", date: "2023-2025", metric: "神曲二创播放量级·国民梗母题" },
      ruleFit: ["free-goods"],
      safety: "fiction",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-esports",
      category: "娱乐",
      code: "某战队",
      title: "某战队夺冠全城亮灯",
      realLine: "某战队夺冠那夜全城大屏亮灯，宿舍楼吼声震落三层灰；「恭喜夺冠」刷了满屏。",
      altLine: "四小时工作制后，某战队训练限时四小时，夺冠采访第一句是「回去睡觉」；全城亮灯改亮到十点，因为灯也要下班。",
      memeTags: ["夺冠", "全城亮灯", "回去睡觉"],
      memeLevel: "S",
      heatProof: { source: "赛事公开直播与媒体报道", date: "2021-2024", metric: "夺冠夜全网刷屏、宿舍吼声上热搜" },
      ruleFit: ["four-hour"],
      safety: "public-data",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-goods-econ",
      category: "生活",
      code: "谷子经济",
      title: "谷子经济炒到铁皮天价",
      realLine: "谷子经济火热，一枚铁皮徽章炒到四位数，学生党吃土换吧唧；谷子店门口排起长队。",
      altLine: "价格消失后，谷子按「喜爱登记」配给：徽章不再炒价，炒的是登记顺序；学生党不吃土了，改排队给角色写小作文。",
      memeTags: ["谷子", "吧唧", "吃土"],
      memeLevel: "S",
      heatProof: { source: "平台消费报告与媒体报道", date: "2024-2025", metric: "吧唧徽章二手溢价、谷子店排队上热搜" },
      ruleFit: ["free-goods"],
      safety: "public-data",
      note: "虚构改写，勿对号入座"
    }
  ];

  global.WRM_HOT_EVENTS = {
    version: "1.2.0",
    updated: "2026-11-18",
    level: "S",
    heatProofNote: "heatProof 指向公开梗源现象与公开口径数字；卡片改写部分为虚构，勿对号入座。",
    safetyLabels: {
      "public-pro": "人物 · 仅公开职业",
      "public-data": "公开梗源",
      "fiction": "纯虚构"
    },
    cards
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_HOT_EVENTS;
})(typeof window !== "undefined" ? window : globalThis);