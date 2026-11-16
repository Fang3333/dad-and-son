/* ============================================================
   data.js —— 内容组负责（只改这个文件，不用碰别的）
   ------------------------------------------------------------
   这里全是「剧本数据」，改文字和数字就行，不需要懂代码。
   怎么加一个新场景：复制最后一段 { id:'s3', ... } 整块，
   改掉里面的文字，注意逗号别漏、引号别用中文引号。
   改完保存，刷新网页立刻生效。
   ============================================================ */

const DATA = {
  // 产品基本信息（网页上会显示）
  product: {
    name: "时光胶囊 · 平行人生模拟器",
    enName: "Multiverse Life Simulator",
    slogan: "输入一个两难选择，看看不同人生会怎么走",
    disclaimer: "本结果为情景推演，仅供娱乐与自我探索，不是对真实未来的预测。"
  },

  // 三条属性条：名字和颜色可以改，key 不要改
  attributes: [
    { key: "skill",  name: "技能", color: "#a78bfa" },
    { key: "wealth", name: "资源", color: "#34d399" },
    { key: "mood",   name: "心情", color: "#fb7185" }
  ],

  // 初始属性值（0~100）
  start: { skill: 30, wealth: 20, mood: 60 },

  // 四个阶段的名字（四段就够演示了，别加太多）
  stages: ["第 1 年", "第 2 年", "第 3 年", "毕业时"],

  // 设置项的选项（改文字即可）
  settings: {
    interests: ["科研", "就业", "都行"],
    goals: ["保研深造", "高薪就业", "开心就好"],
    timeLabel: "你愿意投入的时间"
  },

  // 随机小事件：每次生成会随机抽 1 个，让结果每次都不一样（可玩性）
  events: [
    { title: "意外机会", text: "突然有个比赛/项目找上门，你决定试一试。", delta: { skill: 6, wealth: 2, mood: 4 } },
    { title: "计划被打乱", text: "导师临时加活，节奏全乱了。", delta: { skill: 4, wealth: -2, mood: -6 } },
    { title: "贵人相助", text: "遇到一位愿意带你的学长学姐。", delta: { skill: 5, wealth: 5, mood: 3 } },
    { title: "间歇性摆烂", text: "有一阵子什么都不想干，躺了几天。", delta: { skill: -3, wealth: -2, mood: 6 } },
    { title: "小有成果", text: "你做的东西被人看见了，信心大增。", delta: { skill: 3, wealth: 4, mood: 5 } }
  ],

  // ----------------------------------------------------------
  // 场景列表：演示用 3 个，想加就照着复制一整块
  // 每个 stage 的字段说明：
  //   title  节点标题（短）
  //   text   节点说明（一两句话）
  //   delta  属性变化，例如 { skill:8, wealth:-2, mood:-3 }
  //   rate   成功率（数字，60 就是 60%）
  //   type   best / decision / challenge / positive 决定节点颜色
  // ----------------------------------------------------------
  scenes: [
    {
      id: "s1",
      tag: "最经典的纠结",
      question: "如果大学四年选择参加科研，而不是早点实习，会有什么不同？",
      A: { name: "路线 A · 科研", short: "科研" },
      B: { name: "路线 B · 实习", short: "实习" },
      routes: {
        A: [
          { title: "大二：进实验室", text: "开始读论文、跑实验，从打杂做起。", delta: { skill: 8, wealth: -2, mood: -3 }, rate: 58, type: "decision" },
          { title: "大三：第一次投稿", text: "写了人生第一篇论文，被导师改了 8 遍。", delta: { skill: 10, wealth: 0, mood: -2 }, rate: 55, type: "challenge" },
          { title: "大三暑假：科研实习", text: "拿到一个暑期科研机会，简历开始有东西了。", delta: { skill: 9, wealth: 4, mood: 4 }, rate: 68, type: "positive" },
          { title: "大四：推研或申请", text: "有了成果和推荐信，站在了升学的门口。", delta: { skill: 6, wealth: 6, mood: 6 }, rate: 74, type: "best" }
        ],
        B: [
          { title: "大二：找第一份实习", text: "开始投简历、面试，第一次感受到简历空空。", delta: { skill: 5, wealth: 6, mood: -2 }, rate: 62, type: "decision" },
          { title: "大三：实习转正", text: "在一家公司干得不错，拿到了转正意向。", delta: { skill: 7, wealth: 12, mood: 2 }, rate: 66, type: "positive" },
          { title: "大三暑假：大厂实习", text: "进入大厂，见识了真实的工作节奏。", delta: { skill: 8, wealth: 14, mood: -3 }, rate: 70, type: "challenge" },
          { title: "大四：拿到 offer", text: "手握offer，开始纠结要不要真的直接工作。", delta: { skill: 4, wealth: 12, mood: 6 }, rate: 76, type: "best" }
        ]
      },
      endings: {
        A: { title: "你成了一名研究者", text: "你可能错过了一些热闹，但拥有了别人拿不走的专业深度。" },
        B: { title: "你早早进入职场", text: "你比同龄人更早看清行业，也更早体会到工作的重量。" }
      }
    },
    {
      id: "s2",
      tag: "选择城市与平台",
      question: "毕业时，出国读研还是留在国内保研？",
      A: { name: "路线 A · 出国", short: "出国" },
      B: { name: "路线 B · 国内", short: "保研" },
      routes: {
        A: [
          { title: "大三：准备语言", text: "开始刷题、考语言，周末全给了托福。", delta: { skill: 5, wealth: -3, mood: -4 }, rate: 60, type: "decision" },
          { title: "大三下：联系导师", text: "一封封套磁邮件发出去，大部分没回音。", delta: { skill: 6, wealth: 0, mood: -3 }, rate: 57, type: "challenge" },
          { title: "大四上：拿到 offer", text: "终于收到心仪学校的录取，开始准备签证。", delta: { skill: 6, wealth: -6, mood: 10 }, rate: 63, type: "positive" },
          { title: "毕业：异国开学", text: "一个人飞过去，一切从零开始。", delta: { skill: 8, wealth: -4, mood: 4 }, rate: 72, type: "best" }
        ],
        B: [
          { title: "大三：稳住绩点", text: "把每一门课都考好，排名一点点往上走。", delta: { skill: 6, wealth: 0, mood: -3 }, rate: 72, type: "decision" },
          { title: "大三下：进组做科研", text: "提前进入课题组，为保研加码。", delta: { skill: 8, wealth: 1, mood: 2 }, rate: 70, type: "positive" },
          { title: "大四上：拿到推免", text: "名次出来，你顺利拿到了推免资格。", delta: { skill: 5, wealth: 2, mood: 10 }, rate: 80, type: "best" },
          { title: "毕业：换个校园", text: "去另一所学校读研，圈子几乎重来一遍。", delta: { skill: 7, wealth: 3, mood: 5 }, rate: 76, type: "positive" }
        ]
      },
      endings: {
        A: { title: "你去了地球另一端", text: "语言、文化、孤独都是门槛，但世界确实变大了。" },
        B: { title: "你留在了熟悉的体系里", text: "路径更短、风险更低，你省下时间做了别的事。" }
      }
    },
    {
      id: "s3",
      tag: "大学怎么过",
      question: "大学四年，是把时间全砸在绩点上，还是去做项目和竞赛？",
      A: { name: "路线 A · 卷绩点", short: "绩点" },
      B: { name: "路线 B · 做项目", short: "项目" },
      routes: {
        A: [
          { title: "大二：稳住 GPA", text: "每节课都坐第一排，笔记整理得比谁都全。", delta: { skill: 6, wealth: 0, mood: -4 }, rate: 75, type: "decision" },
          { title: "大三：刷新排名", text: "绩点冲到专业前列，奖学金也跟着来了。", delta: { skill: 5, wealth: 5, mood: 2 }, rate: 72, type: "positive" },
          { title: "大三下：套磁导师", text: "漂亮的成绩单帮你敲开了门。", delta: { skill: 5, wealth: 3, mood: 3 }, rate: 70, type: "best" },
          { title: "大四：保研稳了", text: "一路走来没什么惊喜，但也没什么意外。", delta: { skill: 4, wealth: 4, mood: 5 }, rate: 82, type: "best" }
        ],
        B: [
          { title: "大二：组队打比赛", text: "第一次和队友熬到凌晨，做出个能跑的东西。", delta: { skill: 10, wealth: 2, mood: 2 }, rate: 58, type: "decision" },
          { title: "大三：项目落地", text: "作品上线了，虽然用户只有几十个。", delta: { skill: 11, wealth: 5, mood: 6 }, rate: 60, type: "positive" },
          { title: "大三下：成绩下滑", text: "时间都给了项目，几门课差点挂科。", delta: { skill: 4, wealth: 2, mood: -6 }, rate: 52, type: "challenge" },
          { title: "大四：作品集说话", text: "面试时拿出作品，面试官眼睛亮了。", delta: { skill: 8, wealth: 10, mood: 8 }, rate: 70, type: "best" }
        ]
      },
      endings: {
        A: { title: "你拿到了漂亮的成绩单", text: "它很可靠，但也需要别的东西来让它变得生动。" },
        B: { title: "你留下了一堆作品", text: "过程混乱、结果不确定，但每一步都是你自己选的。" }
      }
    }
  ]
};
