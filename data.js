/* ============================================================
   data.js —— 内容组负责（只改这个文件，不用碰别的）
   ------------------------------------------------------------
   这里全是「剧本数据」，改文字和数字就行，不需要懂代码。
   时间轴是六段人生：高一 / 高二 / 高三 / 大学 / 毕业时 / 五年后。
   怎么加一个新场景：复制最后一段 { id:'s6', ... } 整块，
   改掉里面的文字，注意逗号别漏、引号别用中文引号。
   每条路线必须写满 6 个节点（和 stages 一一对应）。
   改完保存，刷新网页立刻生效。
   ============================================================ */

const DATA = {
  // 版本号遵循 semver：新功能/新剧本 +次版本，文案数值微调 +修订，大改版 +主版本
  version: "1.0.1",

  // 更新日志：每次更新在最前面追加一条 { version, date, tag, items }
  // tag 只能填：首发 / 新增 / 优化 / 修复 / 变更
  changelog: [
    {
      version: "1.0.1", date: "2026-11-17", tag: "修复",
      items: [
        "补上网站图标（内联 SVG，不新增文件），消除浏览器标签与线上控制台的 favicon 404"
      ]
    },
    {
      version: "1.0.0", date: "2026-11-17", tag: "首发",
      items: [
        "六段人生时间轴：高一 / 高二 / 高三 / 大学 / 毕业时 / 五年后",
        "6 个高中入口剧本：选科、冲竞赛、艺考、重点班、住宿、情感，各含 A/B 双路线与双结局",
        "20 个带时期区间的随机事件，每局抽 2 个落在不同人生阶段",
        "最多 6 条平行分支：任意节点「在这里改决定」、粉色血缘虚线、分支删除、「随机人生」掷骰",
        "兴趣 / 目标 / 时间投入影响成功率与结局评分，AI 推荐横幅随设定变化",
        "本机保存与刷新恢复、JSON / PNG 导出（PNG 可直接贴进答辩 PPT）",
        "星空 + 极光动态背景、分段入场动画、移动端横滑决策树",
        "零依赖、无后端、无 API key，双击 index.html 离线可玩",
        "内置更新日志面板与 CHANGELOG.md，顶栏显示当前版本"
      ]
    }
  ],

  // 产品基本信息（网页上会显示）
  product: {
    name: "时光胶囊 · 平行人生模拟器",
    enName: "Multiverse Life Simulator",
    slogan: "从高中的一次选择出发，推演往后十年的人生",
    disclaimer: "本结果为情景推演，仅供娱乐与自我探索，不是对真实未来的预测。"
  },

  // 三条属性条：名字和颜色可以改，key 不要改
  attributes: [
    { key: "skill",  name: "技能", color: "#a78bfa" },
    { key: "wealth", name: "资源", color: "#34d399" },
    { key: "mood",   name: "心情", color: "#fb7185" }
  ],

  // 初始属性值（0~100），站在高一入学那天
  start: { skill: 30, wealth: 20, mood: 60 },

  // 六段人生阶段（加阶段就要给每条路线补节点，别只改这里）
  stages: ["高一", "高二", "高三", "大学", "毕业时", "五年后"],

  // 设置项的选项（改文字即可）
  settings: {
    interests: ["学术", "实践", "都行"],
    goals: ["保研深造", "高薪就业", "开心就好"],
    timeLabel: "你愿意投入的时间"
  },

  // ----------------------------------------------------------
  // 随机事件池：每局随机抽 2 个，落在不同人生阶段。
  // from / to 是阶段下标（0=高一 … 5=五年后），限定事件发生的时期。
  // 多多益善：照格式往下加就行。
  // ----------------------------------------------------------
  events: [
    { title: "遇到恩师", text: "有位老师愿意额外带你，答疑时间成了你的第二课堂。", delta: { skill: 5, wealth: 0, mood: 4 }, from: 0, to: 2 },
    { title: "月考失利", text: "一次大考砸了，排名掉出心理防线，缓了两周。", delta: { skill: 2, wealth: 0, mood: -6 }, from: 0, to: 2 },
    { title: "家里搬家", text: "父母工作变动，你转学或换了通勤路线，一切重新适应。", delta: { skill: 0, wealth: -3, mood: -4 }, from: 0, to: 3 },
    { title: "交到挚友", text: "遇到一个能聊到凌晨的朋友，很多难关因此没那么难。", delta: { skill: 1, wealth: 0, mood: 6 }, from: 0, to: 5 },
    { title: "竞赛获奖", text: "抱回一块省级奖牌，简历和信心同时加厚。", delta: { skill: 7, wealth: 3, mood: 5 }, from: 1, to: 2 },
    { title: "生了一场病", text: "住院或长休一个月，进度落下，也第一次认真想健康。", delta: { skill: -2, wealth: -3, mood: -5 }, from: 0, to: 5 },
    { title: "政策变动", text: "高考/升学政策调整，原来的计划要重排一遍。", delta: { skill: 3, wealth: 0, mood: -3 }, from: 2, to: 4 },
    { title: "超常发挥", text: "关键一考比平时高了二十分，命运轻轻推了你一把。", delta: { skill: 4, wealth: 2, mood: 8 }, from: 2, to: 3 },
    { title: "拿到奖学金", text: "一笔不算小的钱到账，请全家吃了顿饭。", delta: { skill: 2, wealth: 6, mood: 4 }, from: 3, to: 3 },
    { title: "社团高光", text: "你办的活动全场爆满，第一次感到'我能组织一件事'。", delta: { skill: 4, wealth: 1, mood: 6 }, from: 3, to: 3 },
    { title: "挂科预警", text: "一门课亮红灯，补考前的暑假格外漫长。", delta: { skill: -3, wealth: 0, mood: -6 }, from: 3, to: 3 },
    { title: "实习 offer", text: "第一份像样的实习录用，工牌挂上的那天拍了张照。", delta: { skill: 4, wealth: 7, mood: 2 }, from: 3, to: 4 },
    { title: "行业风口", text: "你所在的赛道突然热了起来，机会主动找上门。", delta: { skill: 3, wealth: 8, mood: 3 }, from: 4, to: 5 },
    { title: "升学缩招", text: "目标院校名额收紧，备选方案被迫启用。", delta: { skill: 2, wealth: -2, mood: -6 }, from: 4, to: 4 },
    { title: "家里支持", text: "父母说'放心去试，家里兜底'，底气一下子足了很多。", delta: { skill: 0, wealth: 6, mood: 3 }, from: 0, to: 5 },
    { title: "经济压力", text: "家里一时紧张，你开始算着花钱、找兼职。", delta: { skill: 1, wealth: -6, mood: -4 }, from: 3, to: 5 },
    { title: "贵人引路", text: "一位前辈把你带进圈子，少走两年弯路。", delta: { skill: 5, wealth: 5, mood: 3 }, from: 4, to: 5 },
    { title: "间歇性摆烂", text: "有一阵子什么都不想干，躺平几天反而回血了。", delta: { skill: -3, wealth: -1, mood: 5 }, from: 0, to: 5 },
    { title: "作品出圈", text: "你做的东西被很多人看见，私信里躺着合作邀约。", delta: { skill: 5, wealth: 4, mood: 6 }, from: 3, to: 5 },
    { title: "感情波折", text: "一段关系起了波澜，深夜 emo 了几周，也想清了一些事。", delta: { skill: 1, wealth: 0, mood: -6 }, from: 3, to: 5 }
  ],

  // ----------------------------------------------------------
  // 场景列表：入口是高中的选择，推演一路走到五年后。
  // 每个 stage 的字段说明：
  //   title  节点标题（短）
  //   text   节点说明（一两句话）
  //   delta  属性变化，例如 { skill:8, wealth:-2, mood:-3 }
  //   rate   成功率（数字，60 就是 60%）
  //   type   best / decision / challenge / positive 决定节点颜色
  // match 可选：{ 学术:"A", 实践:"B" } 表示兴趣偏向给哪条路加成
  // ----------------------------------------------------------
  scenes: [
    {
      id: "s1",
      tag: "高一的第一道岔路",
      question: "高一选科，选物化生的纯理组合，还是史政地的偏文组合？",
      A: { name: "路线 A · 物化生", short: "物化生" },
      B: { name: "路线 B · 史政地", short: "史政地" },
      match: { "学术": "A", "实践": "B" },
      routes: {
        A: [
          { title: "啃下物理大题", text: "第一次月考物理在及格边缘，开始每天多刷一小时。", delta: { skill: 6, wealth: 0, mood: -3 }, rate: 62, type: "decision" },
          { title: "科创小课题", text: "跟老师做实验项目，第一次摸到科研的门。", delta: { skill: 8, wealth: 1, mood: 2 }, rate: 58, type: "positive" },
          { title: "理综冲刺", text: "理综从 180 刷到 240，错题本写满三本。", delta: { skill: 9, wealth: 0, mood: -4 }, rate: 64, type: "challenge" },
          { title: "理工专业", text: "进了计算机或物理类专业，课硬但路宽。", delta: { skill: 8, wealth: 2, mood: 1 }, rate: 70, type: "positive" },
          { title: "深造或大厂", text: "在保研边缘和大厂 offer 之间做选择。", delta: { skill: 6, wealth: 6, mood: 3 }, rate: 72, type: "best" },
          { title: "技术骨干", text: "在实验室或工位上，成了能独当一面的人。", delta: { skill: 7, wealth: 8, mood: 4 }, rate: 76, type: "best" }
        ],
        B: [
          { title: "背下时间轴", text: "历史笔记被全年级传阅，擅长的事第一次被看见。", delta: { skill: 5, wealth: 0, mood: 4 }, rate: 66, type: "decision" },
          { title: "模联与辩论", text: "周末跑模联和辩论赛，表达和视野一起长。", delta: { skill: 6, wealth: 2, mood: 5 }, rate: 62, type: "positive" },
          { title: "文综拉锯", text: "背了又忘、忘了又背，靠思维导图稳住阵脚。", delta: { skill: 7, wealth: 0, mood: -3 }, rate: 63, type: "challenge" },
          { title: "人文社科", text: "法学、新闻或社会学，课堂之外全是真实社会。", delta: { skill: 6, wealth: 2, mood: 3 }, rate: 68, type: "positive" },
          { title: "考公或媒体", text: "国考、选调、媒体机构之间投出一沓简历。", delta: { skill: 5, wealth: 5, mood: 2 }, rate: 66, type: "best" },
          { title: "表达者立足", text: "写稿、出庭或做策划，靠表达与判断吃饭。", delta: { skill: 6, wealth: 6, mood: 5 }, rate: 72, type: "best" }
        ]
      },
      endings: {
        A: { title: "你成了靠技术吃饭的人", text: "世界更新很快，但你手里有能迁移的手艺。" },
        B: { title: "你成了靠表达吃饭的人", text: "你见过更多人间的褶皱，也更懂如何与人打交道。" }
      }
    },
    {
      id: "s2",
      tag: "赌一把还是稳一手",
      question: "高二要不要停掉半年常规课，去冲学科竞赛保送？",
      A: { name: "路线 A · 冲竞赛", short: "竞赛" },
      B: { name: "路线 B · 稳高考", short: "高考" },
      match: { "学术": "A" },
      routes: {
        A: [
          { title: "竞赛苗子", text: "被教练挑进竞赛小组，白天上课晚上刷题。", delta: { skill: 7, wealth: 0, mood: -3 }, rate: 58, type: "decision" },
          { title: "停课集训", text: "半年不进常规教室，赌一枚省一以上的奖牌。", delta: { skill: 10, wealth: -2, mood: -6 }, rate: 52, type: "challenge" },
          { title: "奖项落定", text: "拿到省一没进省队，保送梦碎一半，强基还有路。", delta: { skill: 6, wealth: 2, mood: -2 }, rate: 55, type: "challenge" },
          { title: "强基入场", text: "靠强基计划进梦校基础学科，本硕博衔接。", delta: { skill: 8, wealth: 3, mood: 5 }, rate: 68, type: "positive" },
          { title: "直博路口", text: "站在直博门口，也看见转行的同学拿了高薪。", delta: { skill: 6, wealth: 4, mood: 1 }, rate: 66, type: "best" },
          { title: "科研长跑", text: "博士毕业进高校或研究所，路窄但深。", delta: { skill: 8, wealth: 5, mood: 3 }, rate: 70, type: "best" }
        ],
        B: [
          { title: "按部就班", text: "跟紧学校节奏，月考排名一点点往上爬。", delta: { skill: 5, wealth: 0, mood: 1 }, rate: 70, type: "decision" },
          { title: "稳住基本盘", text: "没停课，常规成绩稳在年级前 15%。", delta: { skill: 6, wealth: 0, mood: 2 }, rate: 72, type: "positive" },
          { title: "高考兑现", text: "正常发挥，分数够到一所不错的 985。", delta: { skill: 6, wealth: 2, mood: 6 }, rate: 74, type: "best" },
          { title: "自由探索", text: "大学里第一次想自己喜欢什么，转专业辅修都试了。", delta: { skill: 6, wealth: 2, mood: 4 }, rate: 68, type: "positive" },
          { title: "多元出口", text: "考研、出国、就业，三条路都留着门。", delta: { skill: 5, wealth: 5, mood: 3 }, rate: 70, type: "best" },
          { title: "稳步上行", text: "没有惊险的跳跃，但每一步都踩实了。", delta: { skill: 6, wealth: 7, mood: 5 }, rate: 74, type: "best" }
        ]
      },
      endings: {
        A: { title: "你走了一条窄而深的路", text: "赌赢过也赌输过，最终靠深度立足。" },
        B: { title: "你走了一条宽而稳的路", text: "没拿到奖牌，但拿到了选择权。" }
      }
    },
    {
      id: "s3",
      tag: "热爱要不要当饭吃",
      question: "喜欢画画，高中走艺考冲美院，还是走纯文化课？",
      A: { name: "路线 A · 艺考", short: "艺考" },
      B: { name: "路线 B · 文化课", short: "文化" },
      match: { "学术": "B", "实践": "A" },
      routes: {
        A: [
          { title: "画室起步", text: "周末泡画室，素描纸堆到半人高。", delta: { skill: 7, wealth: -3, mood: 4 }, rate: 60, type: "decision" },
          { title: "集训半年", text: "离校集训，联考校考连轴转，文化课暂时放下。", delta: { skill: 9, wealth: -6, mood: -2 }, rate: 54, type: "challenge" },
          { title: "双线作战", text: "专业过线后狂补文化课，三个月补一年的债。", delta: { skill: 5, wealth: -2, mood: -5 }, rate: 52, type: "challenge" },
          { title: "美院日子", text: "进了美院或设计学院，作业是作品，同学是同行。", delta: { skill: 8, wealth: -2, mood: 6 }, rate: 66, type: "positive" },
          { title: "作品集求职", text: "游戏公司、设计工作室、自由职业之间挑。", delta: { skill: 6, wealth: 4, mood: 3 }, rate: 62, type: "best" },
          { title: "靠作品说话", text: "接过商稿也做过独立项目，热爱变成了手艺。", delta: { skill: 7, wealth: 6, mood: 5 }, rate: 68, type: "best" }
        ],
        B: [
          { title: "藏起画本", text: "把画画收进周末，主业回到文化课。", delta: { skill: 5, wealth: 0, mood: -3 }, rate: 68, type: "decision" },
          { title: "成绩上行", text: "没了集训分心，排名稳步前进。", delta: { skill: 6, wealth: 0, mood: 2 }, rate: 70, type: "positive" },
          { title: "普通高考", text: "考进综合大学，画画成了社团里的光。", delta: { skill: 5, wealth: 2, mood: 3 }, rate: 72, type: "best" },
          { title: "斜杠青年", text: "主修之外接稿做设计，副业慢慢长大。", delta: { skill: 6, wealth: 4, mood: 4 }, rate: 64, type: "positive" },
          { title: "稳定主业", text: "拿了一份稳定 offer，画画留在下班后。", delta: { skill: 4, wealth: 6, mood: 2 }, rate: 70, type: "best" },
          { title: "主业养热爱", text: "热爱养心情，偶尔也养钱包。", delta: { skill: 5, wealth: 7, mood: 6 }, rate: 72, type: "best" }
        ]
      },
      endings: {
        A: { title: "你把热爱变成了职业", text: "收入起伏比同学大，但每天早上醒来是想画画的。" },
        B: { title: "你把热爱留成了退路", text: "生活更稳，画本没丢，只是换了一种打开方式。" }
      }
    },
    {
      id: "s4",
      tag: "凤尾还是鸡头",
      question: "压线进重点班垫底，还是去普通班当第一名？",
      A: { name: "路线 A · 重点班", short: "重点班" },
      B: { name: "路线 B · 普通班", short: "普通班" },
      routes: {
        A: [
          { title: "垫底开局", text: "第一次月考班级倒数，讲台上的进度快得吓人。", delta: { skill: 6, wealth: 0, mood: -6 }, rate: 55, type: "decision" },
          { title: "追赶节奏", text: "被周围推着走，慢慢从倒数爬到中游。", delta: { skill: 8, wealth: 0, mood: -2 }, rate: 58, type: "challenge" },
          { title: "环境红利", text: "师资和信息差兑现，高考比入口排名高了二十名。", delta: { skill: 7, wealth: 2, mood: 4 }, rate: 64, type: "positive" },
          { title: "名校平台", text: "进了更好的大学，身边全是厉害的普通人。", delta: { skill: 6, wealth: 3, mood: 3 }, rate: 68, type: "best" },
          { title: "平台溢价", text: "简历关过得顺，校友网开始起作用。", delta: { skill: 5, wealth: 6, mood: 3 }, rate: 70, type: "best" },
          { title: "圈层复利", text: "同学群里的内推和消息，成了隐形资产。", delta: { skill: 6, wealth: 7, mood: 4 }, rate: 72, type: "best" }
        ],
        B: [
          { title: "鸡头开局", text: "轻松考第一，老师的眼神里全是期待。", delta: { skill: 4, wealth: 0, mood: 6 }, rate: 72, type: "decision" },
          { title: "舒适陷阱", text: "进度慢半拍，靠自学补深度、靠自律撑着。", delta: { skill: 6, wealth: 0, mood: 1 }, rate: 60, type: "challenge" },
          { title: "上限考验", text: "高考发挥不错，但学校比重点班同学低一档。", delta: { skill: 6, wealth: 1, mood: -2 }, rate: 62, type: "challenge" },
          { title: "自己找路", text: "平台普通，靠主动找实习和比赛补差距。", delta: { skill: 7, wealth: 3, mood: 2 }, rate: 62, type: "positive" },
          { title: "逆袭简历", text: "用项目和实习，把学校牌子抹平了一半。", delta: { skill: 6, wealth: 5, mood: 4 }, rate: 66, type: "best" },
          { title: "自驱者赢", text: "没人推着你走，你学会了自己推自己。", delta: { skill: 7, wealth: 6, mood: 5 }, rate: 70, type: "best" }
        ]
      },
      endings: {
        A: { title: "你被环境托着走", text: "压力先于成长到来，但平台最终兑现了红利。" },
        B: { title: "你自己推着自己走", text: "舒适区早早没了护栏，自驱成了你最硬的底牌。" }
      }
    },
    {
      id: "s5",
      tag: "独立的第一课",
      question: "考上离家两小时的重点高中，住宿还是每天走读？",
      A: { name: "路线 A · 住宿", short: "住宿" },
      B: { name: "路线 B · 走读", short: "走读" },
      routes: {
        A: [
          { title: "第一次离家", text: "学会排值日、管生活费、和室友磨合。", delta: { skill: 4, wealth: -2, mood: -3 }, rate: 62, type: "decision" },
          { title: "宿舍夜谈", text: "卧谈到凌晨，也一起刷过题，友情和自律一起长。", delta: { skill: 5, wealth: 0, mood: 5 }, rate: 64, type: "positive" },
          { title: "封闭冲刺", text: "省下的通勤变成睡眠和早读，节奏完全自主。", delta: { skill: 7, wealth: 1, mood: 1 }, rate: 68, type: "positive" },
          { title: "无缝独立", text: "离家千里也不慌，生活能力比同学高一截。", delta: { skill: 5, wealth: 2, mood: 4 }, rate: 72, type: "best" },
          { title: "敢去远方", text: "选城市时，没有'离家近'这个约束条件。", delta: { skill: 5, wealth: 5, mood: 4 }, rate: 70, type: "best" },
          { title: "到处为家", text: "在哪个城市都能很快建起自己的生活。", delta: { skill: 6, wealth: 6, mood: 5 }, rate: 72, type: "best" }
        ],
        B: [
          { title: "通勤两小时", text: "每天四小时在路上，背单词在公交上完成。", delta: { skill: 4, wealth: -2, mood: -4 }, rate: 60, type: "decision" },
          { title: "家的补给", text: "热饭和安静书桌兜底，情绪有人接住。", delta: { skill: 5, wealth: 1, mood: 5 }, rate: 66, type: "positive" },
          { title: "家庭后勤", text: "父母轮班接送，把时间抠出来给你睡觉。", delta: { skill: 6, wealth: -1, mood: 3 }, rate: 68, type: "positive" },
          { title: "恋家半径", text: "选学校时下意识画了个'高铁三小时'圈。", delta: { skill: 5, wealth: 2, mood: 3 }, rate: 68, type: "best" },
          { title: "回乡或留省", text: "offer 排序里，'离爸妈近'权重很高。", delta: { skill: 4, wealth: 5, mood: 4 }, rate: 70, type: "best" },
          { title: "稳稳的幸福", text: "周末能回家吃饭，代价是机会半径小一点。", delta: { skill: 5, wealth: 6, mood: 6 }, rate: 72, type: "best" }
        ]
      },
      endings: {
        A: { title: "你很早就学会了独立", text: "世界对你没有边界，代价是有些夜晚只能自己扛。" },
        B: { title: "你把根留在了家里", text: "安全感满格，机会半径小一点，但幸福密度很高。" }
      }
    },
    {
      id: "s6",
      tag: "青春里最难的一道题",
      question: "高中遇到很喜欢的人，在一起还是先放在心底？",
      A: { name: "路线 A · 在一起", short: "在一起" },
      B: { name: "路线 B · 先专注", short: "先专注" },
      match: { "学术": "B" },
      routes: {
        A: [
          { title: "双向奔赴", text: "纸条和晚自习后的操场，成绩暂时掉了十名。", delta: { skill: -2, wealth: 0, mood: 8 }, rate: 58, type: "decision" },
          { title: "互相督促", text: "约好考同一座城市，错题本交换着写。", delta: { skill: 6, wealth: 0, mood: 4 }, rate: 60, type: "positive" },
          { title: "波动与约定", text: "一模考砸吵了一架又和好，约定高考后见分晓。", delta: { skill: 4, wealth: 0, mood: -3 }, rate: 56, type: "challenge" },
          { title: "同城或异地", text: "考去了不同城市，高铁票攒了一叠。", delta: { skill: 5, wealth: -2, mood: 2 }, rate: 60, type: "challenge" },
          { title: "一起规划", text: "第一次把'我们'写进职业选择里。", delta: { skill: 5, wealth: 4, mood: 5 }, rate: 64, type: "best" },
          { title: "两个人的人生", text: "有人先妥协了城市，有人先妥协了行业，但还在一张桌上吃饭。", delta: { skill: 5, wealth: 6, mood: 7 }, rate: 68, type: "best" }
        ],
        B: [
          { title: "压在心底", text: "把喜欢写进日记，把时间还给错题。", delta: { skill: 6, wealth: 0, mood: -4 }, rate: 66, type: "decision" },
          { title: "独自生长", text: "成绩上去了，偶尔在操场边看见那个身影。", delta: { skill: 7, wealth: 0, mood: -1 }, rate: 68, type: "positive" },
          { title: "心无旁骛", text: "高考发挥稳定，去了想去的城市。", delta: { skill: 6, wealth: 2, mood: 3 }, rate: 72, type: "best" },
          { title: "重新遇见", text: "大学里谈了场成熟的恋爱，或享受了很久单身。", delta: { skill: 5, wealth: 1, mood: 5 }, rate: 66, type: "positive" },
          { title: "先立住自己", text: "先搞定 offer 和户口，再考虑'我们'。", delta: { skill: 5, wealth: 6, mood: 3 }, rate: 70, type: "best" },
          { title: "晚一点的圆满", text: "该来的没缺席，只是晚了一点，也更稳了一点。", delta: { skill: 6, wealth: 6, mood: 6 }, rate: 72, type: "best" }
        ]
      },
      endings: {
        A: { title: "你早早学会了爱一个人", text: "青春没留遗憾，人生规划里一直有两个人。" },
        B: { title: "你先学会了安顿自己", text: "把喜欢存成了定期，到期连本带利取出来。" }
      }
    }
  ]
};