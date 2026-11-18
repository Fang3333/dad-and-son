/* 热点改写卡 · 副刊数据 v1.0.0
   只写代号，不写真人真司真国。每张卡均为虚构改写，勿对号入座。
   UI 只消费本文件，不改 world-rule/data.js 与 engine.js。 */
(function (global) {
  "use strict";

  const cards = [
    {
      id: "hot-nasdaq",
      category: "财经",
      code: "纳指",
      title: "纳指又行了",
      realLine: "纳指创下新高，分析师说「这次不一样」。",
      altLine: "四小时工作制后，纳指交易时间也缩到四小时；收盘后分析师集体下班，波动率反而降了。",
      memeTags: ["这次不一样", "活人感"],
      ruleFit: ["four-hour"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-ai-ipo",
      category: "财经",
      code: "某 AI 公司",
      title: "某 AI 公司敲钟那天",
      realLine: "某 AI 公司 IPO 首日涨三倍，敲钟锤被拍出天价。",
      altLine: "商品不再有价格后，某 AI 公司上市敲的不是钟，是配给窗口铃；中签股民每人领两斤算力，回家炖模型。",
      memeTags: ["敲钟改敲铃", "算力配给"],
      ruleFit: ["free-goods"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-ev-price",
      category: "财经",
      code: "某电车厂",
      title: "某电车厂又降价",
      realLine: "某电车厂一周降价两次，老车主拉横幅要求补差价。",
      altLine: "价格消失后，某电车厂改按「需要」排产：提车先填用车理由，理由写得感人的优先；横幅没处挂，因为售后也免费了。",
      memeTags: ["理由感人优先", "横幅失业"],
      ruleFit: ["free-goods"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-gold-house",
      category: "财经",
      code: "黄金/房价",
      title: "黄金和房价谁先硬",
      realLine: "黄金创新高，房价横盘，中介朋友圈开始转发金条图。",
      altLine: "没有价格后，金条按克配给、房子按户配给；中介改行做「需要评估师」，上门问你到底更需要安全感，还是更需要安全感。",
      memeTags: ["安全感配给", "中介转行"],
      ruleFit: ["free-goods"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-leather-keynote",
      category: "科技",
      code: "皮衣哥",
      title: "皮衣哥发布会又拖堂",
      realLine: "皮衣哥发布会讲了三小时，皮衣换了四件，股价跟着换。",
      altLine: "四小时工作制落地后，皮衣哥发布会限时四小时含换装；超时自动断电，皮衣哥第一次在台上说完「谢谢」，而不是「再讲一点」。",
      memeTags: ["限时换装", "谢谢说完"],
      ruleFit: ["four-hour"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-robot-factory",
      category: "科技",
      code: "皮衣厂",
      title: "机器人进厂第一天",
      realLine: "皮衣厂引入人形机器人搬芯片箱，机器人第一天上岗就学会摸鱼。",
      altLine: "四小时工作制对机器人生效后，皮衣厂的机器人到点集体充电；厂长发现摸鱼不是 bug，是劳动法。",
      memeTags: ["机器人摸鱼", "充电下班"],
      ruleFit: ["four-hour"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-algo",
      category: "科技",
      code: "某短视频平台",
      title: "某短视频平台算法读心",
      realLine: "某短视频平台算法比你妈更懂你，凌晨三点还在喂你猫片。",
      altLine: "四小时工作制后，某短视频平台算法每天只营业四小时；到点推送「下班了」，用户第一次在凌晨三点睡着。",
      memeTags: ["算法下班", "猫片断供"],
      ruleFit: ["four-hour"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-ai-fund",
      category: "科技",
      code: "某 AI 公司",
      title: "某 AI 公司融资故事会",
      realLine: "某 AI 公司一轮融资讲八个故事，估值靠 PPT 页数撑着。",
      altLine: "取消考试后，某 AI 公司融资不再笔试模型能力，改看作品集：路演现场跑分取消，评委翻训练日志像翻成长档案。",
      memeTags: ["PPT 页数估值", "训练日志当档案"],
      ruleFit: ["no-exam"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-civil-exam",
      category: "社会",
      code: "考公热",
      title: "考公报名又挤崩服务器",
      realLine: "考公报名开闸十分钟，服务器挤崩，应届生边刷新边背行测。",
      altLine: "取消考试后，考公改抽「服务情景签」：抽到「帮大妈找猫」就现场演；行测培训班改开表演课，申论老师教哭戏。",
      memeTags: ["情景签", "申论教哭戏"],
      ruleFit: ["no-exam"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-us-election",
      category: "社会",
      code: "漂亮国",
      title: "漂亮国大选计票熬鹰",
      realLine: "漂亮国大选计票拖到凌晨，主播靠咖啡和阴谋论续命。",
      altLine: "四小时工作制漂洋过海，漂亮国计票员到点锁门下班；结果改早八点公布，主播们第一次睡够八小时，阴谋论都少了。",
      memeTags: ["计票下班", "阴谋论减产"],
      ruleFit: ["four-hour"],
      sensitivity: "medium",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-star-collapse",
      category: "社会",
      code: "某顶流",
      title: "某顶流人设翻车",
      realLine: "某顶流「学霸人设」翻车，热搜挂了一天，粉丝连夜删博。",
      altLine: "取消考试后，某顶流的学霸人设无处考证，团队改卖「诚实人设」：直播承认自己也不会做高数，粉丝反而涨了三百万。",
      memeTags: ["诚实人设", "高数不会"],
      ruleFit: ["no-exam"],
      sensitivity: "medium",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-village-coffee",
      category: "社会",
      code: "村咖",
      title: "村咖开进村委会隔壁",
      realLine: "村咖开在村委会隔壁，拿铁二十八，拍照的人比喝的人多。",
      altLine: "四小时工作制后，村咖下午两点就打烊；店主把剩下四小时用来种咖啡豆，拿铁降到八块，拍照的人终于坐下喝了一口。",
      memeTags: ["两点打烊", "坐下喝一口"],
      ruleFit: ["four-hour"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-no-exam",
      category: "教育",
      code: "某名校",
      title: "取消考试第一周",
      realLine: "某名校宣布取消期末考试，家长群安静了十分钟，然后炸了。",
      altLine: "取消考试后，某名校期末改交「学习档案」：家长群前十分钟安静，后十分钟开始晒孩子的项目作品集，晒法跟当年晒分数一模一样。",
      memeTags: ["晒作品集", "安静十分钟"],
      ruleFit: ["no-exam"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-postgrad",
      category: "教育",
      code: "考研",
      title: "考研人数又新高",
      realLine: "考研报名再创新高，自习室座位摇号，摇中比上岸还难。",
      altLine: "取消考试后，考研改「申请+面谈」：自习室座位不再摇号，改排研究计划答辩；背书的人少了，讲故事的人多了。",
      memeTags: ["座位摇号", "讲故事上岸"],
      ruleFit: ["no-exam"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-abroad",
      category: "教育",
      code: "留学",
      title: "留学申请卷到推荐信",
      realLine: "留学申请卷到推荐信，教授邮箱被模板信塞满，抬头全是 Dear Professor。",
      altLine: "取消考试后，留学申请不看 GPA 看「问题集」：申请人交十个自己真正想问的问题；教授回信第一次不用模板，因为问题没法模板。",
      memeTags: ["问题集", "模板信失业"],
      ruleFit: ["no-exam"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-campus-hire",
      category: "教育",
      code: "校招",
      title: "校招笔试又加一轮",
      realLine: "校招笔试加到第四轮，应届生把行测刷成了肌肉记忆。",
      altLine: "取消考试后，校招笔试取消，改「工位试用半天」：HR 发现刷题库的肌肉记忆没用，会问问题的人半天就露馅，也会半天就发光。",
      memeTags: ["工位试用", "肌肉记忆失业"],
      ruleFit: ["no-exam", "four-hour"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-short-drama",
      category: "娱乐",
      code: "短剧",
      title: "短剧一集三分钟还嫌长",
      realLine: "短剧一集三分钟，观众仍开二倍速，编剧把反转塞进片头。",
      altLine: "四小时工作制后，短剧行业规定每集不超过一杯茶的时间；观众不再倍速，因为倍速器到点也下班了。",
      memeTags: ["倍速器下班", "一杯茶一集"],
      ruleFit: ["four-hour"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-concert",
      category: "娱乐",
      code: "某顶流",
      title: "演唱会门票秒没",
      realLine: "某顶流演唱会门票三秒售罄，黄牛票价够买一块皮衣厂显卡。",
      altLine: "价格消失后，演唱会门票按「热爱配给」：申请要写一段你和这首歌的故事；黄牛失业转行做代写，写得比粉丝还感人。",
      memeTags: ["热爱配给", "黄牛代写"],
      ruleFit: ["free-goods"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-esports",
      category: "娱乐",
      code: "某战队",
      title: "某战队夺冠全城亮灯",
      realLine: "某战队夺冠，全城大屏亮灯，宿舍楼吼声震落三层灰。",
      altLine: "四小时工作制后，某战队训练限时四小时，夺冠采访第一句是「回去睡觉」；全城亮灯改亮到十点，因为灯也要下班。",
      memeTags: ["回去睡觉", "灯也下班"],
      ruleFit: ["four-hour"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-game-shutdown",
      category: "娱乐",
      code: "某游戏",
      title: "某游戏停服玩家赛博上坟",
      realLine: "某游戏宣布停服，玩家回新手村排队截图，称「赛博上坟」。",
      altLine: "商品不再有价格后，某游戏停服不再因为亏钱；官方把服务器改成配给制公共乐园，玩家回新手村不是上坟，是领每周两小时的怀旧配额。",
      memeTags: ["怀旧配额", "上坟改领票"],
      ruleFit: ["free-goods"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-tanghulu",
      category: "生活",
      code: "糖葫芦",
      title: "糖葫芦排队两小时",
      realLine: "糖葫芦摊前排两小时队，拍照发圈五分钟，吃完三分钟。",
      altLine: "没有价格后，糖葫芦按「馋度」配给：摊主看你咽几次口水决定给几串；排队两小时的人领一串，路过咽口水三次的人领三串。",
      memeTags: ["馋度配给", "咽口水计数"],
      ruleFit: ["free-goods"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-goods-econ",
      category: "生活",
      code: "谷子经济",
      title: "谷子经济炒到铁皮天价",
      realLine: "谷子经济火热，一枚铁皮徽章炒到四位数，学生党吃土换吧唧。",
      altLine: "价格消失后，谷子按「喜爱登记」配给：徽章不再炒价，炒的是登记顺序；学生党不吃土了，改排队给角色写小作文。",
      memeTags: ["喜爱登记", "小作文换吧唧"],
      ruleFit: ["free-goods"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-milk-tea",
      category: "生活",
      code: "奶茶",
      title: "奶茶联名又排长队",
      realLine: "奶茶联名款开售，队伍绕商场两圈，黄牛代排一小时八十。",
      altLine: "四小时工作制后，奶茶店联名款每天只卖四小时；代排黄牛到点下班，队伍绕两圈变成绕半圈，因为大家也要下班。",
      memeTags: ["代排下班", "绕半圈"],
      ruleFit: ["four-hour"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    },
    {
      id: "hot-rent",
      category: "生活",
      code: "租房",
      title: "租房押一付三又涨价",
      realLine: "租房押一付三，中介说「这价明天就没了」，你签得比抢票快。",
      altLine: "没有价格后，租房按「居住需要」配给：中介改行做「需要访谈」，问你通勤几分钟、养不养猫；押一付三变成押一把钥匙、付一份居住计划。",
      memeTags: ["需要访谈", "押钥匙"],
      ruleFit: ["free-goods"],
      sensitivity: "low",
      note: "虚构改写，勿对号入座"
    }
  ];

  global.WRM_HOT = { version: "1.0.0", updated: "2026-11-18", cards };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_HOT;
})(typeof window !== "undefined" ? window : globalThis);