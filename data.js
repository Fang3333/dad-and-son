/* ============================================================
   data.js —— 内容组负责（只改这个文件，不用碰别的）
   ------------------------------------------------------------
   这里全是「剧本数据」，改文字和数字就行，不需要懂代码。
   时间轴是六段大学时光：入学 / 大一 / 大二 / 大三 / 毕业时 / 五年后。
   入口先选层次（专科 / 985），再选该层次下的两难剧本。
   怎么加一个新场景：复制最后一段 { id:'j2', ... } 整块，
   改掉里面的文字，注意逗号别漏、引号别用中文引号。
   tier 必填："专科" 或 "985"；mod 是成功率修正（专科 +4 / 985 -2）。
   每条路线必须写满 6 个节点（和 stages 一一对应）。
   改完保存，刷新网页立刻生效。
   ============================================================ */

const DATA = {
  // 版本号遵循 semver：新功能/新剧本 +次版本，文案数值微调 +修订，大改版 +主版本
  version: "3.0.0",

  // 更新日志：每次更新在最前面追加一条 { version, date, tag, items }
  // tag 只能填：首发 / 新增 / 优化 / 修复 / 变更
  changelog: [
    {
      version: "3.0.0", date: "2026-11-17", tag: "变更",
      items: [
        "删掉高中线与独立页面《人生：无限分岔》，模拟器直接从大学开始",
        "入口改为先自己选层次：专科 或 985，再选该层次下的大学两难（每层 2 个剧本）",
        "时间轴改为六段：入学 / 大一 / 大二 / 大三 / 毕业时 / 五年后",
        "16 个随机事件全部重写为大学时期际遇：军训、奖学金、挂科预警、实习 offer、校招缩水等",
        "层次影响成功率：专科剧本 +4（赛道人少），985 剧本 -2（同侪更卷）",
        "自定义问题只在当前层次的剧本里做关键词匹配",
        "旧存档自动兼容：恢复时按存档剧本回填层次"
      ]
    },
    {
      version: "2.1.0", date: "2026-11-17", tag: "新增",
      items: [
        "首页新增「自定义问题」：写下你正在纠结的两难问题，系统按关键词匹配最接近的剧本模板推演，结果页标明匹配到哪个模板",
        "两个页面互通：平行人生 ⇄ 人生：无限分岔，顶栏一键切换",
        "AI 推荐补上「为什么」：展示按目标加权的关键属性差与领先分差",
        "修复：保存后恢复平行分支时，粉色血缘连线丢失",
        "文档：补全 README，版本号与实现对齐，旧 React 分工稿加废弃提示"
      ]
    },
    {
      version: "2.0.0", date: "2026-11-17", tag: "新增",
      items: [
        "新独立页面 life.html《人生：无限分岔》：出生到死亡的文字人生模拟，原平行人生页面一行未改",
        "六显性属性 + 隐性变量（性格/道德/心结/好感/声望），宿命三层：锁死选项、强制路径、自动事件",
        "性别与 8 种家庭出身每局随机掷骰，每个家庭带一个「内在声音」，在关键节点与玩家争辩",
        "16 个人生节点 + 12 个突发事件，选项带代价与情绪暗示，关键抉择标注并贯穿余生",
        "蝴蝶回响：0 岁的夜醒选择 6 岁与 18 岁各还一次；18 岁按 15 岁去向分裂成两套剧本",
        "八维结局（圆满/遗憾/悲剧/反转/开放/彩蛋），结局后人生复盘 + 两条「如果当初」反事实",
        "内置「引擎规范」面板逐条落实 v2 提示词；文案遵守去AI味铁律",
        "整局存档与刷新恢复、复盘 JSON 导出；零依赖，双击 life.html 离线可玩"
      ]
    },
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
    slogan: "从大学入学的一次选择出发，推演往后十年的人生",
    disclaimer: "本结果为情景推演，仅供娱乐与自我探索，不是对真实未来的预测。"
  },

  // 三条属性条：名字和颜色可以改，key 不要改
  attributes: [
    { key: "skill",  name: "技能", color: "#a78bfa" },
    { key: "wealth", name: "资源", color: "#34d399" },
    { key: "mood",   name: "心情", color: "#fb7185" }
  ],

  // 初始属性值（0~100），站在大学入学那天
  start: { skill: 30, wealth: 20, mood: 60 },

  // 六段大学时光（加阶段就要给每条路线补节点，别只改这里）
  stages: ["入学", "大一", "大二", "大三", "毕业时", "五年后"],

  // 设置项的选项（改文字即可）；tiers 是入口层次，顺序别改
  settings: {
    tiers: ["专科", "985"],
    interests: ["学术", "实践", "都行"],
    goals: ["保研深造", "高薪就业", "开心就好"],
    timeLabel: "你愿意投入的时间"
  },

  // ----------------------------------------------------------
  // 随机事件池：每局随机抽 2 个，落在不同人生阶段。
  // from / to 是阶段下标（0=入学 … 5=五年后），限定事件发生的时期。
  // 多多益善：照格式往下加就行。
  // ----------------------------------------------------------
  events: [
    { title: "军训标兵", text: "军训会操拿了标兵，辅导员记住了你的名字。", delta: { skill: 2, wealth: 0, mood: 3 }, from: 0, to: 1 },
    { title: "奖学金评定", text: "综测差 0.5 分落选奖学金，你把评分表看了三遍。", delta: { skill: 4, wealth: -2, mood: -3 }, from: 1, to: 3 },
    { title: "室友矛盾", text: "空调温度和作息吵了一架，宿舍安静了一周。", delta: { skill: 0, wealth: 0, mood: -5 }, from: 0, to: 2 },
    { title: "挂科预警", text: "高数期中 48 分，学业预警单寄到了家里。", delta: { skill: -4, wealth: 0, mood: -6 }, from: 1, to: 3 },
    { title: "社团招新", text: "百团大战逛了一圈，加了三个社团，退了两个。", delta: { skill: 2, wealth: -1, mood: 4 }, from: 0, to: 1 },
    { title: "校园恋爱", text: "图书馆占座占成了两个人，周末开始有人等。", delta: { skill: -2, wealth: -2, mood: 6 }, from: 1, to: 3 },
    { title: "兼职被骗", text: "刷单兼职押金二百，对方把你拉黑了。", delta: { skill: 0, wealth: -5, mood: -4 }, from: 0, to: 2 },
    { title: "转专业窗口", text: "转专业考试名额两个，你报了名，也失眠了一周。", delta: { skill: 3, wealth: 0, mood: 2 }, from: 0, to: 1 },
    { title: "竞赛获奖", text: "省赛二等奖，证书塑封那天队友请了奶茶。", delta: { skill: 6, wealth: 2, mood: 4 }, from: 1, to: 3 },
    { title: "疫情网课", text: "宿舍上网课，摄像头关着，床帘拉着，效率看命。", delta: { skill: -3, wealth: 1, mood: -3 }, from: 1, to: 2 },
    { title: "考研报名", text: "报名确认那晚，自习室走廊背书的声音到十一点。", delta: { skill: 3, wealth: -1, mood: -3 }, from: 3, to: 3 },
    { title: "实习 offer", text: "第一份实习 offer 邮件，你截图发给了三个人。", delta: { skill: 4, wealth: 4, mood: 3 }, from: 2, to: 4 },
    { title: "校招缩水", text: "往年来的企业今年少了一半，宣讲会改成了线上。", delta: { skill: 1, wealth: -3, mood: -5 }, from: 4, to: 4 },
    { title: "校友内推", text: "毕业五年的校友回校分享，顺手收了你的简历。", delta: { skill: 2, wealth: 4, mood: 3 }, from: 3, to: 5 },
    { title: "答辩返修", text: "毕业论文二辩意见七条，导师说改完再睡。", delta: { skill: 3, wealth: 0, mood: -4 }, from: 3, to: 4 },
    { title: "体检异常", text: "体检报告甲状腺结节三类，你搜了一晚上，卸载了搜索软件。", delta: { skill: -1, wealth: -2, mood: -4 }, from: 2, to: 5 }
  ],

  // ----------------------------------------------------------
  // 场景列表：入口是大学的选择，推演一路走到五年后。
  // tier 必填：专科 / 985，决定这个剧本出现在哪个层次下。
  // mod：成功率修正，专科 +4、985 -2，引擎会加到每个节点上。
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
      id: "z1",
      tier: "专科",
      mod: 4,
      keywords: ["专升本", "专科", "实习", "顶岗", "升本", "本科", "学历", "车间", "实训"],
      tag: "专科的第一道岔路",
      question: "专科入学：备考专升本，还是直接顶岗实习？",
      A: { name: "路线 A · 专升本", short: "专升本" },
      B: { name: "路线 B · 顶岗实习", short: "顶岗实习" },
      match: { "学术": "A", "实践": "B" },
      routes: {
        A: [
          { title: "买下二手教材", text: "学长宿舍里收来一套升本教材，扉页写着上一届的名字。", delta: { skill: 5, wealth: -2, mood: 2 }, rate: 64, type: "decision" },
          { title: "高数补考班", text: "大一高数 51 分，报了晚间补考班，坐第一排。", delta: { skill: 6, wealth: -1, mood: -3 }, rate: 60, type: "challenge" },
          { title: "升本与证书冲突", text: "电工证考试和升本模拟撞在同一天，你选了后者。", delta: { skill: 7, wealth: 0, mood: -2 }, rate: 62, type: "decision" },
          { title: "过线", text: "升本成绩过线 11 分，查到分数那晚食堂加了个鸡腿。", delta: { skill: 8, wealth: -2, mood: 6 }, rate: 66, type: "best" },
          { title: "本科毕业", text: "两年本科读完，学位证和专科毕业证放在一起拍了张照。", delta: { skill: 7, wealth: 3, mood: 4 }, rate: 70, type: "positive" },
          { title: "学历门槛过了", text: "简历筛选不再卡第一学历，面试机会多了一倍。", delta: { skill: 6, wealth: 7, mood: 4 }, rate: 74, type: "best" }
        ],
        B: [
          { title: "签顶岗协议", text: "校企合作车间签了顶岗协议，工服比校服合身。", delta: { skill: 4, wealth: 3, mood: 1 }, rate: 68, type: "decision" },
          { title: "夜班与夜校", text: "白班顶岗晚上上夜校，公交车上背单词。", delta: { skill: 5, wealth: 2, mood: -3 }, rate: 62, type: "challenge" },
          { title: "省赛获奖", text: "技能大赛省二等奖，颁奖台比车间讲台高半米。", delta: { skill: 8, wealth: 2, mood: 5 }, rate: 64, type: "best" },
          { title: "转正 offer", text: "实习结束厂里给了转正 offer，带社保。", delta: { skill: 6, wealth: 5, mood: 3 }, rate: 70, type: "positive" },
          { title: "正式工", text: "毕业即上岗，同学还在投简历，你已交满三个月社保。", delta: { skill: 6, wealth: 6, mood: 3 }, rate: 72, type: "positive" },
          { title: "班组长", text: "五年后带六个人的班组，工资条比本科同学厚一点。", delta: { skill: 7, wealth: 8, mood: 4 }, rate: 76, type: "best" }
        ]
      },
      endings: {
        A: { title: "你把学历补成了跳板", text: "多读两年不是绕路，是把门槛踩成了台阶。" },
        B: { title: "你把手艺练成了底气", text: "车间的灯比自习室亮得早，你的路也宽得早。" }
      }
    },
    {
      id: "z2",
      tier: "专科",
      mod: 4,
      keywords: ["证书", "社团", "兼职", "人脉", "学生会", "电工证", "初级会计", "运营", "接单"],
      tag: "专科的第二道岔路",
      question: "专科三年：堆证书，还是混社团攒人脉？",
      A: { name: "路线 A · 堆证书", short: "堆证书" },
      B: { name: "路线 B · 攒人脉", short: "攒人脉" },
      match: { "学术": "A", "实践": "B" },
      routes: {
        A: [
          { title: "证书路线图", text: "把三年要考的证排成表，贴在床帘内侧。", delta: { skill: 5, wealth: -1, mood: 2 }, rate: 66, type: "decision" },
          { title: "初级会计", text: "大一拿下初级会计，室友还在打排位。", delta: { skill: 6, wealth: -1, mood: 3 }, rate: 64, type: "positive" },
          { title: "电工中级证", text: "实操考试手抖了一次，第二次稳了。", delta: { skill: 7, wealth: -2, mood: 2 }, rate: 62, type: "challenge" },
          { title: "证与实习冲突", text: "考证培训和实习加班撞车，你请了三天假。", delta: { skill: 7, wealth: -2, mood: -3 }, rate: 64, type: "decision" },
          { title: "持证上岗", text: "毕业简历附件六张证，HR 多看了两眼。", delta: { skill: 6, wealth: 4, mood: 3 }, rate: 70, type: "positive" },
          { title: "高级技工", text: "五年后评上高级技工，证书墙换成了专利墙。", delta: { skill: 8, wealth: 8, mood: 4 }, rate: 76, type: "best" }
        ],
        B: [
          { title: "学生会面试", text: "面试被问为什么加入，你说想认识人，全场笑了。", delta: { skill: 3, wealth: 0, mood: 4 }, rate: 68, type: "decision" },
          { title: "拉赞助", text: "给晚会拉来三千赞助，奶茶店老板成了微信好友。", delta: { skill: 5, wealth: 2, mood: 4 }, rate: 64, type: "positive" },
          { title: "兼职小队长", text: "带八个人做展会兼职，第一次被人叫队长。", delta: { skill: 5, wealth: 4, mood: 3 }, rate: 66, type: "positive" },
          { title: "人脉带来内推", text: "奶茶店老板的表哥公司招运营，直接免笔试。", delta: { skill: 4, wealth: 4, mood: 4 }, rate: 68, type: "best" },
          { title: "运营岗入职", text: "毕业进公司做运营，工位旁坐着当年晚会的搭档。", delta: { skill: 5, wealth: 5, mood: 3 }, rate: 70, type: "positive" },
          { title: "自己的小生意", text: "五年后和搭档开了家小店，开业花篮摆了一排。", delta: { skill: 6, wealth: 8, mood: 5 }, rate: 74, type: "best" }
        ]
      },
      endings: {
        A: { title: "你把纸变成了硬通货", text: "证书不会说话，但替你把门敲开了。" },
        B: { title: "你把人变成了路", text: "认识谁不重要，谁愿意替你说话才重要。" }
      }
    },
    {
      id: "j1",
      tier: "985",
      mod: -2,
      keywords: ["保研", "985", "就业", "绩点", "科研", "实验室", "offer", "考公", "大厂", "夏令营"],
      tag: "985 的第一道岔路",
      question: "985 入学：冲保研，还是直奔就业？",
      A: { name: "路线 A · 冲保研", short: "冲保研" },
      B: { name: "路线 B · 直奔就业", short: "直奔就业" },
      match: { "学术": "A", "实践": "B" },
      routes: {
        A: [
          { title: "进实验室", text: "大一敲开实验室门，导师给了篇综述让你读。", delta: { skill: 6, wealth: 0, mood: 2 }, rate: 58, type: "decision" },
          { title: "绩点前线", text: "大一结束排名 7/120，保研线在 15 名左右。", delta: { skill: 7, wealth: 0, mood: -2 }, rate: 60, type: "challenge" },
          { title: "一作尝试", text: "第一篇论文投出去，审稿意见九条，改到第三版。", delta: { skill: 9, wealth: 1, mood: -3 }, rate: 56, type: "challenge" },
          { title: "夏令营优营", text: "大三夏令营拿到优营，回程高铁上睡了全程。", delta: { skill: 8, wealth: 2, mood: 6 }, rate: 62, type: "best" },
          { title: "保研落定", text: "推免系统确认那刻，三年绩点有了去处。", delta: { skill: 7, wealth: 3, mood: 5 }, rate: 68, type: "best" },
          { title: "科研岗", text: "五年后在读博或研究所，名片上印着研究方向。", delta: { skill: 8, wealth: 6, mood: 3 }, rate: 72, type: "positive" }
        ],
        B: [
          { title: "职业信息网", text: "大一混进求职群，看大四学长晒 offer 和拒信。", delta: { skill: 4, wealth: 0, mood: 2 }, rate: 62, type: "decision" },
          { title: "第一份实习", text: "大一暑假小公司实习，工牌是打印纸塑封的。", delta: { skill: 6, wealth: 3, mood: 3 }, rate: 60, type: "positive" },
          { title: "大厂日常实习", text: "大二进大厂日常实习，mentor 比课设老师严。", delta: { skill: 8, wealth: 4, mood: -2 }, rate: 58, type: "challenge" },
          { title: "暑期转正", text: "大三暑期实习答辩通过，return offer 落袋。", delta: { skill: 7, wealth: 6, mood: 6 }, rate: 64, type: "best" },
          { title: "校招签约", text: "毕业签三方，薪资比保研同学的生活费高五倍。", delta: { skill: 6, wealth: 8, mood: 4 }, rate: 70, type: "best" },
          { title: "跳槽涨薪", text: "五年后跳了一次槽，涨幅 40%，工位朝窗。", delta: { skill: 7, wealth: 9, mood: 4 }, rate: 74, type: "best" }
        ]
      },
      endings: {
        A: { title: "你把深度换成了入场券", text: "论文和绩点不会贬值，只是兑现得慢一点。" },
        B: { title: "你把时间换成了筹码", text: "早三年进场，复利比别人多滚三年。" }
      }
    },
    {
      id: "j2",
      tier: "985",
      mod: -2,
      keywords: ["绩点", "成绩", "项目", "竞赛", "黑客松", "实习", "作品集", "奖学金", "github", "开源"],
      tag: "985 的第二道岔路",
      question: "985 四年：卷绩点，还是做项目攒作品集？",
      A: { name: "路线 A · 卷绩点", short: "卷绩点" },
      B: { name: "路线 B · 做项目", short: "做项目" },
      match: { "学术": "A", "实践": "B" },
      routes: {
        A: [
          { title: "选课策略", text: "选课表按给分排序，室友说你像在做投资组合。", delta: { skill: 5, wealth: 0, mood: 1 }, rate: 62, type: "decision" },
          { title: "满绩作业", text: "大一作业全 A，笔记被复印店老板认得。", delta: { skill: 7, wealth: 1, mood: 2 }, rate: 60, type: "positive" },
          { title: "国奖", text: "大二国奖答辩八分钟，稿子改了十一遍。", delta: { skill: 8, wealth: 4, mood: 4 }, rate: 58, type: "best" },
          { title: "保研边缘", text: "大三排名 16/120，保研线 15，差一名。", delta: { skill: 7, wealth: 0, mood: -5 }, rate: 56, type: "challenge" },
          { title: "考研上岸", text: "毕业考研本校上岸，成绩单和录取通知一起收着。", delta: { skill: 7, wealth: 2, mood: 4 }, rate: 64, type: "positive" },
          { title: "学术路", text: "五年后读博或进高校，课表比同学稳定。", delta: { skill: 8, wealth: 5, mood: 3 }, rate: 70, type: "positive" }
        ],
        B: [
          { title: "加入技术社团", text: "社团机房钥匙归你管，服务器风扇声比室友呼噜响。", delta: { skill: 5, wealth: 0, mood: 3 }, rate: 62, type: "decision" },
          { title: "第一个项目", text: "大一写下第一个开源项目，star 数从 0 到 3。", delta: { skill: 7, wealth: 0, mood: 4 }, rate: 60, type: "positive" },
          { title: "黑客松获奖", text: "大二黑客松 48 小时，睡袋和奖杯一起带回宿舍。", delta: { skill: 8, wealth: 2, mood: 5 }, rate: 58, type: "best" },
          { title: "作品集换 offer", text: "大三面试翻作品集，面试官问的问题你全做过。", delta: { skill: 8, wealth: 5, mood: 5 }, rate: 64, type: "best" },
          { title: "sp offer", text: "毕业拿到 sp offer，绩点 3.2 但没人再问。", delta: { skill: 7, wealth: 8, mood: 4 }, rate: 70, type: "best" },
          { title: "自己的产品", text: "五年后带一个小团队，产品上线那天 star 数破千。", delta: { skill: 8, wealth: 8, mood: 5 }, rate: 74, type: "best" }
        ]
      },
      endings: {
        A: { title: "你把分数换成了稳", text: "绩点是硬通货，只是汇率随年份波动。" },
        B: { title: "你把作品换成了话语权", text: "能跑起来的东西，比成绩单上的数字更会说话。" }
      }
    }
  ]
};