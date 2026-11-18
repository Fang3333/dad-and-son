/*
  世界规则修改器 · 示例数据 v0.1
  ------------------------------------------------------------
  用途：B 报纸方案的可玩数据层。数字全部是“示意”，不是统计数据，
  也不是对真实未来的预测；只用于同一规则内 A/B 两套世界的对比。
  结构：window.WRM_DATA = { meta, rules[] }
  每条规则：params（参数与效果）+ presets.A / presets.B（两套完整世界）。
  约定：每个 preset 必须包含 4 个维度 × 2 条变化、6 个事件、6 条因果边、3 个意外后果。
*/
(function (global) {
  "use strict";

  const CERTAINTY = {
    INFER: "推算",
    ASSUME: "假设",
    UNKNOWN: "不确定"
  };

  const RULES = [
    /* ============================================================
       规则 1：取消大学考试
       ============================================================ */
    {
      id: "no-exam",
      title: "取消大学考试",
      category: "教育规则",
      icon: "cap",
      premise: "大学不再组织任何课程考试，毕业标准由学校自己决定。",
      question: "如果大学不再有考试，学生会更自由，还是更茫然？",
      params: [
        { id: "diploma", label: "仍发毕业证", note: "没有考试，证书还代表什么？", default: true, effect: { fairness: 6, stability: 6, freedom: -4 } },
        { id: "freeCourse", label: "允许自由选课", note: "学生自己决定学什么。", default: true, effect: { freedom: 8, fairness: 4, efficiency: -3 } },
        { id: "teacherEval", label: "教师保留评价权", note: "课堂表现、项目、推荐信算数。", default: false, effect: { stability: 5, fairness: -5, freedom: -4 } },
        { id: "employerDegree", label: "企业仍看学历", note: "招聘时，学校名字还有用吗？", default: false, effect: { stability: 7, fairness: -7, freedom: -3 } }
      ],
      presets: {
        A: {
          id: "no-exam-a",
          name: "无证社会",
          tagline: "没有考试，也没有证书；能力靠作品说话。",
          params: { diploma: false, freeCourse: true, teacherEval: false, employerDegree: false },
          metrics: { fairness: 64, efficiency: 71, freedom: 82, stability: 48 },
          dimensions: {
            education: [
              { title: "课程改成项目制", change: "毕业看作品集和长期学习记录，不再看一张卷子。", causal: "考试取消后，学校需要新的评价凭据。", certainty: CERTAINTY.INFER },
              { title: "补习转向作品集", change: "补习班开始教怎么包装项目、怎么讲自己的故事。", causal: "评价标准变了，竞争跟着转移。", certainty: CERTAINTY.INFER }
            ],
            economy: [
              { title: "学历溢价下降", change: "企业用实习、作品和第三方认证筛人，学校名字的权重变小。", causal: "没有统一考试成绩，企业失去一把通用尺子。", certainty: CERTAINTY.INFER },
              { title: "实习竞争提前", change: "大二开始抢实习，作品集变成新的简历。", causal: "企业更早介入筛选，学生更早开始积累证明。", certainty: CERTAINTY.ASSUME }
            ],
            society: [
              { title: "评价标准分裂", change: "不同学校、不同专业各有一套标准，跨校比较变难。", causal: "没有统一考试，标准由学校自己定。", certainty: CERTAINTY.INFER },
              { title: "公平争议上升", change: "资源好的学生更容易做出漂亮作品，推荐信变成硬通货。", causal: "作品和推荐信都受家庭、关系与信息差影响。", certainty: CERTAINTY.ASSUME }
            ],
            individual: [
              { title: "自律者更自由", change: "能自己安排学习的人，得到更多时间和选择。", causal: "没有考试倒逼，学习更依赖自我驱动。", certainty: CERTAINTY.INFER },
              { title: "迷茫者失去坐标", change: "不知道自己要什么的人，更难判断自己走到哪了。", causal: "外部评价消失，内部评价还没建立起来。", certainty: CERTAINTY.UNKNOWN }
            ]
          },
          events: [
            { id: "e1", year: 1, title: "考试取消", description: "期末考试先改成“课程总结”，随后所有笔试被取消。", certainty: CERTAINTY.INFER },
            { id: "e2", year: 2, title: "项目制课程普及", description: "课程大纲改成项目包，老师用作品和过程记录打分。", certainty: CERTAINTY.INFER },
            { id: "e3", year: 4, title: "作品集竞争白热化", description: "学生开始请人包装作品集，作品集培训班出现。", certainty: CERTAINTY.INFER },
            { id: "e4", year: 6, title: "能力认证机构出现", description: "第三方机构推出“能力徽章”，企业开始认可。", certainty: CERTAINTY.ASSUME },
            { id: "e5", year: 8, title: "学历溢价下降", description: "企业招聘不再把学校排名当硬门槛，实习和作品权重上升。", certainty: CERTAINTY.ASSUME },
            { id: "e6", year: 10, title: "公平争议上升", description: "“没有考试更公平”的说法受到挑战，资源差异被放大。", certainty: CERTAINTY.ASSUME }
          ],
          edges: [
            { from: "e1", to: "e2", relation: "导致", strength: 4, assumption: false, explanation: "考试消失后，学校必须找到新的评价方式。" },
            { from: "e2", to: "e3", relation: "放大", strength: 4, assumption: false, explanation: "项目制让作品成为可见的竞争材料。" },
            { from: "e3", to: "e4", relation: "导致", strength: 3, assumption: false, explanation: "作品集难以比较，市场需要第三方认证。" },
            { from: "e3", to: "e5", relation: "导致", strength: 3, assumption: false, explanation: "作品和实习能直接证明能力，学历的筛选作用下降。" },
            { from: "e4", to: "e6", relation: "导致", strength: 2, assumption: true, explanation: "认证机构可能加剧资源差距，引发公平争议。" },
            { from: "e5", to: "e6", relation: "放大", strength: 3, assumption: true, explanation: "学历不再统一，评价标准分裂，公平问题更难被看见。" }
          ],
          unintended: [
            { title: "作品集通胀", description: "人人都有作品集，作品集本身开始贬值，新的“包装”产业出现。" },
            { title: "推荐信黑市", description: "教师评价权被取消后，私人推荐信成了更难监管的通行证。" },
            { title: "项目包装产业", description: "教你怎么把普通项目讲成“有社会价值”的课程，比项目本身更赚钱。" }
          ],
          report: {
            title: "无考场社会",
            quote: "一个没有考场的社会，最后用作品集和推荐信重新造了考场。",
            summary: "考试消失了，但筛选没有消失；它从一张卷子，变成了一套更贵、更隐形的材料。",
            confidence: "中"
          }
        },
        B: {
          id: "no-exam-b",
          name: "证书社会",
          tagline: "考试没了，但证书、推荐信和学校名字还在。",
          params: { diploma: true, freeCourse: false, teacherEval: true, employerDegree: true },
          metrics: { fairness: 42, efficiency: 58, freedom: 66, stability: 61 },
          dimensions: {
            education: [
              { title: "教师评价回到中心", change: "课堂表现、项目、推荐信共同决定毕业。", causal: "考试取消，但学校仍需要判断学生。", certainty: CERTAINTY.INFER },
              { title: "校际标准分化", change: "不同学校给出不同含金量的评价，转学和求职更难。", causal: "没有统一考试，标准由学校自定。", certainty: CERTAINTY.INFER }
            ],
            economy: [
              { title: "名校溢价更高", change: "企业仍看学历，但更依赖学校品牌和推荐信。", causal: "统一成绩消失，学校名字成为更便宜的筛选信号。", certainty: CERTAINTY.INFER },
              { title: "普通学校更难", change: "没有考试成绩，普通学校学生缺少可比较的证明。", causal: "企业用学校品牌做初筛，普通学校简历更难被看见。", certainty: CERTAINTY.ASSUME }
            ],
            society: [
              { title: "推荐信军备竞赛", change: "推荐信、项目背书、关系网络成为新的竞争场。", causal: "教师评价权保留，推荐信含金量上升。", certainty: CERTAINTY.INFER },
              { title: "阶层固化争议", change: "资源家庭更容易获得好推荐和好项目。", causal: "评价依赖非标准化材料，家庭资源更容易介入。", certainty: CERTAINTY.ASSUME }
            ],
            individual: [
              { title: "压力从考场转到表现", change: "学生不再怕考试，但怕在课堂和项目里表现不好。", causal: "评价持续发生，没有明确的考试节点。", certainty: CERTAINTY.INFER },
              { title: "会考试的人失落", change: "擅长考试、不擅长展示的学生优势下降。", causal: "评价维度从单一考试成绩转向综合表现。", certainty: CERTAINTY.ASSUME }
            ]
          },
          events: [
            { id: "e1", year: 1, title: "考试取消，教师评价保留", description: "笔试取消，但课堂表现和项目仍由教师打分。", certainty: CERTAINTY.INFER },
            { id: "e2", year: 2, title: "课堂表现计入毕业", description: "出勤、发言、项目参与度被写进毕业标准。", certainty: CERTAINTY.INFER },
            { id: "e3", year: 3, title: "学校标准分化", description: "不同学校对“表现好”的定义差异越来越大。", certainty: CERTAINTY.INFER },
            { id: "e4", year: 5, title: "推荐信竞争", description: "学生开始提前找老师写推荐信，推荐信变成硬通货。", certainty: CERTAINTY.INFER },
            { id: "e5", year: 7, title: "名校学历溢价上升", description: "企业更依赖学校品牌，名校毕业生的起薪差距扩大。", certainty: CERTAINTY.ASSUME },
            { id: "e6", year: 10, title: "阶层固化争议", description: "“没有考试更公平”受到质疑，推荐信和学校品牌被指加剧不平等。", certainty: CERTAINTY.ASSUME }
          ],
          edges: [
            { from: "e1", to: "e2", relation: "导致", strength: 4, assumption: false, explanation: "考试取消后，教师评价成为主要依据。" },
            { from: "e2", to: "e3", relation: "放大", strength: 3, assumption: false, explanation: "各校自主评价，标准自然分化。" },
            { from: "e3", to: "e4", relation: "导致", strength: 4, assumption: false, explanation: "标准不统一，推荐信成为跨校比较的替代品。" },
            { from: "e4", to: "e5", relation: "导致", strength: 3, assumption: false, explanation: "推荐信和学校品牌一起，抬高名校溢价。" },
            { from: "e3", to: "e6", relation: "导致", strength: 2, assumption: true, explanation: "标准分化让资源差距更难被识别。" },
            { from: "e5", to: "e6", relation: "放大", strength: 3, assumption: true, explanation: "名校溢价扩大，阶层固化争议上升。" }
          ],
          unintended: [
            { title: "推荐信军备竞赛", description: "推荐信从“老师了解你”变成“谁认识更有分量的老师”。" },
            { title: "毕业证通胀", description: "人人都有毕业证，证书本身不再说明能力，企业转向自己的测试。" },
            { title: "“会表现”取代“会考试”", description: "擅长展示的学生受益，不擅长表达的学生被低估。" }
          ],
          report: {
            title: "证书社会",
            quote: "考试消失了，但筛选没有消失，只是换了一个更贵的入口。",
            summary: "当考试不再是标准，学校品牌、推荐信和表达能力一起变成了新的门槛。",
            confidence: "中"
          }
        }
      }
    },

    /* ============================================================
       规则 2：每天只工作四小时
       ============================================================ */
    {
      id: "four-hour",
      title: "每天只工作四小时",
      category: "时间规则",
      icon: "clock",
      premise: "法律把全职工作时间上限设为每天四小时，工资与工时重新挂钩。",
      question: "如果每个人每天只工作四小时，生活会变好，还是只是把工作切成两半？",
      params: [
        { id: "hourlyPay", label: "工资按小时计", note: "干四小时拿四小时的钱，还是拿原来的月薪？", default: true, effect: { fairness: 6, efficiency: 3, freedom: 4 } },
        { id: "secondJob", label: "允许兼职/第二份工", note: "四小时不够花，能不能再打一份工？", default: false, effect: { freedom: 7, fairness: -6, stability: -5 } },
        { id: "enforceOff", label: "强制下班/断联", note: "下班后老板不能找你。", default: true, effect: { freedom: 5, stability: 4, efficiency: -3 } },
        { id: "productivity", label: "工时缩短反而提升效率", note: "少开会、少摸鱼，四小时干完原来八小时的活。", default: true, effect: { efficiency: 8, stability: 2, fairness: 2 } }
      ],
      presets: {
        A: {
          id: "four-hour-a",
          name: "四小时社会",
          tagline: "工资按小时、下班断联，四小时真的够生活。",
          params: { hourlyPay: true, secondJob: false, enforceOff: true, productivity: true },
          metrics: { fairness: 68, efficiency: 74, freedom: 86, stability: 55 },
          dimensions: {
            education: [
              { title: "学习与工作交替", change: "短实习、项目制课程变多，学生可以边工作边读书。", causal: "四小时工作制释放出整块时间，学习不再只能发生在毕业前。", certainty: CERTAINTY.INFER },
              { title: "教育回报变慢", change: "考证、读研的机会成本下降，但回报周期被拉长。", causal: "工作时间缩短，教育的“回本”速度变慢。", certainty: CERTAINTY.ASSUME }
            ],
            economy: [
              { title: "时薪上升", change: "企业压缩会议和无效加班，单位时间产出提高。", causal: "工时缩短倒逼流程精简，生产力提升。", certainty: CERTAINTY.INFER },
              { title: "服务业四小时轮班", change: "餐厅、医院、商店改成多班次，交接成本上升。", causal: "营业时间不变，但每人只能工作四小时。", certainty: CERTAINTY.INFER }
            ],
            society: [
              { title: "时间分配更平等", change: "照护、家务、通勤的时间被重新分配，性别差距缩小。", causal: "所有人少工作四小时，照护不再只落在一个人身上。", certainty: CERTAINTY.ASSUME },
              { title: "城市节奏变慢", change: "夜间经济缩短，通勤高峰变得平缓。", causal: "统一四小时工作制改变了城市的作息。", certainty: CERTAINTY.INFER }
            ],
            individual: [
              { title: "运动和陪伴变多", change: "下班后还有力气去运动、做饭、陪家人。", causal: "四小时工作制减少了通勤和加班。", certainty: CERTAINTY.INFER },
              { title: "收入上限变低", change: "想多赚钱只能换更高时薪的岗位，不能靠加班。", causal: "兼职被限制，工时上限锁死了收入下限。", certainty: CERTAINTY.ASSUME }
            ]
          },
          events: [
            { id: "e1", year: 1, title: "四小时工作制立法", description: "法律把全职上限设为每天四小时，加班需要特批。", certainty: CERTAINTY.INFER },
            { id: "e2", year: 2, title: "企业压缩会议", description: "公司把会议砍半，用文档和异步沟通替代。", certainty: CERTAINTY.INFER },
            { id: "e3", year: 4, title: "时薪上升", description: "单位时间产出提高，部分行业时薪上涨。", certainty: CERTAINTY.ASSUME },
            { id: "e4", year: 6, title: "服务业四小时轮班", description: "餐厅、医院、商店改成多班次，招聘量增加。", certainty: CERTAINTY.INFER },
            { id: "e5", year: 8, title: "副业减少", description: "因为下班断联和兼职限制，第二份工变少。", certainty: CERTAINTY.INFER },
            { id: "e6", year: 10, title: "时间不平等下降", description: "高收入和低收入群体的空闲时间差距缩小。", certainty: CERTAINTY.ASSUME }
          ],
          edges: [
            { from: "e1", to: "e2", relation: "导致", strength: 4, assumption: false, explanation: "工时缩短迫使企业压缩流程。" },
            { from: "e2", to: "e3", relation: "导致", strength: 3, assumption: false, explanation: "效率提升后，部分岗位时薪上涨。" },
            { from: "e1", to: "e4", relation: "导致", strength: 4, assumption: false, explanation: "营业时间不变，服务业必须增加班次。" },
            { from: "e4", to: "e5", relation: "抑制", strength: 3, assumption: false, explanation: "多班次增加了岗位，但也限制了个人兼职时间。" },
            { from: "e3", to: "e6", relation: "导致", strength: 2, assumption: true, explanation: "时薪上涨和工时缩短可能缩小时间贫困。" },
            { from: "e5", to: "e6", relation: "放大", strength: 2, assumption: true, explanation: "副业减少让空闲时间更均匀，但也让低收入者更依赖单一工资。" }
          ],
          unintended: [
            { title: "预约制排队", description: "四小时轮班让服务窗口变少，办事需要提前很久预约。" },
            { title: "第二份工黑市", description: "兼职被限制后，现金结算的“第二份工”转入地下。" },
            { title: "效率提升只覆盖知识工作", description: "会议可以压缩，流水线和护理岗位很难靠四小时完成同样工作。" }
          ],
          report: {
            title: "四小时社会",
            quote: "四小时工作制没有消灭工作，它只是把“谁有时间生活”重新分配了一遍。",
            summary: "一部分人得到了生活，一部分人得到了第二份工；效率提升不是所有行业都能兑现。",
            confidence: "中"
          }
        },
        B: {
          id: "four-hour-b",
          name: "兼职社会",
          tagline: "四小时不保底，大家靠第二份工把收入拼回来。",
          params: { hourlyPay: false, secondJob: true, enforceOff: false, productivity: false },
          metrics: { fairness: 45, efficiency: 62, freedom: 70, stability: 42 },
          dimensions: {
            education: [
              { title: "学习被切成碎片", change: "学生上午上课、下午打工，学习时间被切碎。", causal: "四小时工作制没有带来收入保障，学生必须兼职。", certainty: CERTAINTY.INFER },
              { title: "短课程变多", change: "微课程、夜校、线上课增加，但完成率下降。", causal: "整块学习时间变少，教育产品跟着碎片化。", certainty: CERTAINTY.ASSUME }
            ],
            economy: [
              { title: "收入分化", change: "时薪高的岗位还能维持生活，时薪低的岗位需要打两份工。", causal: "工资不按小时保底，工时缩短直接变成收入下降。", certainty: CERTAINTY.INFER },
              { title: "企业外包增加", change: "公司把工作拆成短合同，规避四小时限制。", causal: "全职成本上升，企业转向外包和零工。", certainty: CERTAINTY.INFER }
            ],
            society: [
              { title: "兼职成常态", change: "“四小时工作”变成“四小时+另一份四小时”。", causal: "收入不够，兼职合法化让第二份工普及。", certainty: CERTAINTY.INFER },
              { title: "通勤吃掉收益", change: "两份工之间的通勤时间变长，实际空闲时间没有增加。", causal: "工作地点不重合，通勤成本上升。", certainty: CERTAINTY.ASSUME }
            ],
            individual: [
              { title: "自由但焦虑", change: "时间表更自由，但收入不稳定，焦虑感上升。", causal: "工时缩短没有带来安全感。", certainty: CERTAINTY.INFER },
              { title: "隐形过劳", change: "下班不打卡，但手机随时待命，工作侵入生活。", causal: "没有强制断联，四小时只是名义上的上限。", certainty: CERTAINTY.ASSUME }
            ]
          },
          events: [
            { id: "e1", year: 1, title: "四小时但不保底", description: "法律限制工时，却没有规定四小时必须能养活自己。", certainty: CERTAINTY.INFER },
            { id: "e2", year: 2, title: "兼职合法化", description: "第二份工被正式允许，招聘平台出现“四小时+四小时”套餐。", certainty: CERTAINTY.INFER },
            { id: "e3", year: 4, title: "收入分化", description: "高时薪岗位和低时薪岗位的生活差距拉大。", certainty: CERTAINTY.INFER },
            { id: "e4", year: 6, title: "企业外包", description: "公司把岗位拆成短合同，规避全职福利。", certainty: CERTAINTY.INFER },
            { id: "e5", year: 8, title: "隐形过劳", description: "下班不打卡，但消息和任务随时进来。", certainty: CERTAINTY.INFER },
            { id: "e6", year: 10, title: "工时碎片化", description: "时间被切成很多段，完整休息变成奢侈品。", certainty: CERTAINTY.ASSUME }
          ],
          edges: [
            { from: "e1", to: "e2", relation: "导致", strength: 4, assumption: false, explanation: "收入不足，兼职成为必要补充。" },
            { from: "e2", to: "e3", relation: "放大", strength: 3, assumption: false, explanation: "能打两份工的人和不能打的人差距扩大。" },
            { from: "e3", to: "e4", relation: "导致", strength: 3, assumption: false, explanation: "企业用外包降低全职成本。" },
            { from: "e4", to: "e5", relation: "导致", strength: 3, assumption: false, explanation: "外包和短合同让工作边界消失。" },
            { from: "e5", to: "e6", relation: "导致", strength: 2, assumption: true, explanation: "隐形过劳让四小时制度名存实亡。" },
            { from: "e2", to: "e6", relation: "放大", strength: 2, assumption: true, explanation: "兼职普及让时间碎片化成为常态。" }
          ],
          unintended: [
            { title: "兼职成常态", description: "“四小时工作制”最终变成“两份四小时工作制”。" },
            { title: "算法排班", description: "平台用算法把两份工排进同一天，通勤时间被忽略。" },
            { title: "通勤吃掉收益", description: "第二份工多赚的钱，被通勤和外卖吃掉了。" }
          ],
          report: {
            title: "兼职社会",
            quote: "四小时工作制没有让人少工作，它只是把一份工作拆成了两份。",
            summary: "时间看起来自由了，但收入、通勤和隐形待命把自由又收了回去。",
            confidence: "中"
          }
        }
      }
    },

    /* ============================================================
       规则 3：商品不再有价格
       ============================================================ */
    {
      id: "free-goods",
      title: "商品不再有价格",
      category: "经济规则",
      icon: "coin",
      premise: "所有商品不再标价，社会用配给、需要和计划来分配。",
      question: "如果价格消失，稀缺会消失，还是换一种方式出现？",
      params: [
        { id: "rationing", label: "按需配给", note: "用票证/额度分配，而不是用钱买。", default: true, effect: { fairness: 8, efficiency: -6, freedom: -4, stability: 4 } },
        { id: "communityProduction", label: "生产由社区/计划决定", note: "生产什么、生产多少，不由企业按利润决定。", default: true, effect: { fairness: 4, efficiency: -8, stability: 2 } },
        { id: "blackMarket", label: "允许黑市", note: "价格消失后，私下交易是否合法？", default: false, effect: { freedom: 6, fairness: -8, stability: -6 } },
        { id: "needsFirst", label: "稀缺品优先给需要的人", note: "按需要排队，而不是按出价高低。", default: true, effect: { fairness: 7, stability: 3, freedom: -3 } }
      ],
      presets: {
        A: {
          id: "free-goods-a",
          name: "配给社会",
          tagline: "没有价格，也没有抢购；大家按需要排队。",
          params: { rationing: true, communityProduction: true, blackMarket: false, needsFirst: true },
          metrics: { fairness: 78, efficiency: 51, freedom: 58, stability: 62 },
          dimensions: {
            education: [
              { title: "教材和设备按需分配", change: "学校按学生人数配教材、电脑和实验设备，不再靠采购预算。", causal: "商品没有价格，学校用配额而不是钱来获得资源。", certainty: CERTAINTY.INFER },
              { title: "选择变少", change: "课程和教材种类减少，统一版本变多。", causal: "计划生产倾向标准化，个性化选择减少。", certainty: CERTAINTY.ASSUME }
            ],
            economy: [
              { title: "生产按计划", change: "工厂按社区需求生产，短缺和过剩同时出现。", causal: "没有价格信号，需求难以被准确汇总。", certainty: CERTAINTY.INFER },
              { title: "创新放缓", change: "新产品试制变慢，因为无法用利润判断是否值得。", causal: "缺少价格和利润信号，试错动力下降。", certainty: CERTAINTY.ASSUME }
            ],
            society: [
              { title: "消费身份弱化", change: "穿什么、用什么不再能直接显示收入。", causal: "商品不再有价格，消费失去了炫耀功能。", certainty: CERTAINTY.INFER },
              { title: "分配员权力上升", change: "谁掌握配额和排队顺序，谁就有新的权力。", causal: "分配权替代了购买力。", certainty: CERTAINTY.INFER }
            ],
            individual: [
              { title: "时间富足、物品匮乏", change: "不用为买不起发愁，但想要的东西经常没有。", causal: "价格消失，稀缺以排队和缺货的形式出现。", certainty: CERTAINTY.INFER },
              { title: "选择感下降", change: "不用比价，但也很难买到“刚好想要的那一款”。", causal: "标准化生产压缩了选择空间。", certainty: CERTAINTY.ASSUME }
            ]
          },
          events: [
            { id: "e1", year: 1, title: "价格取消", description: "所有商品撤掉价签，改用配额和排队。", certainty: CERTAINTY.INFER },
            { id: "e2", year: 2, title: "抢购与排队", description: "价格消失后，热门商品先被抢空，排队成为日常。", certainty: CERTAINTY.INFER },
            { id: "e3", year: 3, title: "配给票出现", description: "粮票、布票、电器票重新出现，按人头分配。", certainty: CERTAINTY.INFER },
            { id: "e4", year: 5, title: "地下交易", description: "黑市没有合法化，但私下交换开始出现。", certainty: CERTAINTY.ASSUME },
            { id: "e5", year: 7, title: "生产停滞", description: "工厂缺少价格信号，不知道该多生产什么。", certainty: CERTAINTY.ASSUME },
            { id: "e6", year: 10, title: "短缺常态化", description: "基本生活品靠配额，非必需品长期缺货。", certainty: CERTAINTY.ASSUME }
          ],
          edges: [
            { from: "e1", to: "e2", relation: "导致", strength: 4, assumption: false, explanation: "价格消失，需求瞬间涌向热门商品。" },
            { from: "e2", to: "e3", relation: "导致", strength: 4, assumption: false, explanation: "抢购迫使社会用票证分配。" },
            { from: "e3", to: "e4", relation: "导致", strength: 3, assumption: true, explanation: "配额无法满足所有需求，地下交易出现。" },
            { from: "e4", to: "e5", relation: "抑制", strength: 2, assumption: true, explanation: "地下交易和短缺让正规生产更难计划。" },
            { from: "e5", to: "e6", relation: "导致", strength: 3, assumption: true, explanation: "生产停滞让短缺变成常态。" },
            { from: "e3", to: "e6", relation: "放大", strength: 2, assumption: true, explanation: "配额制度固化后，短缺更难被纠正。" }
          ],
          unintended: [
            { title: "排队经济", description: "时间代替钱成为新的稀缺资源，代排队变成职业。" },
            { title: "分配员权力", description: "掌握配额的人拥有隐形权力，关系比需求更重要。" },
            { title: "创新停滞", description: "没有价格信号，企业不知道新产品值不值得做。" }
          ],
          report: {
            title: "配给社会",
            quote: "价格消失以后，稀缺没有消失，它只是从收银台搬到了队伍里。",
            summary: "公平感上升了，效率和选择下降了；新的权力长在分配窗口后面。",
            confidence: "中"
          }
        },
        B: {
          id: "free-goods-b",
          name: "黑市社会",
          tagline: "价格取消了，但黑市重新给一切定了价。",
          params: { rationing: false, communityProduction: false, blackMarket: true, needsFirst: false },
          metrics: { fairness: 38, efficiency: 66, freedom: 74, stability: 39 },
          dimensions: {
            education: [
              { title: "学校靠关系拿资源", change: "没有价格，学校采购靠人脉和交换，城乡差距扩大。", causal: "正式分配渠道失效，关系网络补位。", certainty: CERTAINTY.INFER },
              { title: "教材黑市", change: "热门教材和辅导资料在私下加价流通。", causal: "免费供应不足，黑市填补缺口。", certainty: CERTAINTY.INFER }
            ],
            economy: [
              { title: "企业停产", change: "没有价格和利润，企业减少生产，货架变空。", causal: "生产决策失去价格信号。", certainty: CERTAINTY.INFER },
              { title: "黑市定价", change: "黑市用现金、关系或物品重新给商品定价。", causal: "官方价格消失，私下交易形成新价格。", certainty: CERTAINTY.INFER }
            ],
            society: [
              { title: "以物易物", change: "香烟、酒、瓶盖成为替代货币。", causal: "现金和价格失效，物品承担货币功能。", certainty: CERTAINTY.ASSUME },
              { title: "治安恶化", change: "黑市竞争引发暴力和保护费。", causal: "合法分配缺位，黑市靠暴力维持秩序。", certainty: CERTAINTY.ASSUME }
            ],
            individual: [
              { title: "囤积与浪费", change: "能拿到货的人囤积，拿不到的人挨饿。", causal: "价格消失，囤积没有成本。", certainty: CERTAINTY.INFER },
              { title: "自由但危险", change: "想买什么都能买到，但价格和风险由黑市决定。", causal: "黑市提供选择，也提供暴力。", certainty: CERTAINTY.ASSUME }
            ]
          },
          events: [
            { id: "e1", year: 1, title: "价格取消", description: "所有商品撤掉价签，官方宣布按需分配。", certainty: CERTAINTY.INFER },
            { id: "e2", year: 2, title: "企业停产", description: "没有利润信号，企业减少生产，货架变空。", certainty: CERTAINTY.INFER },
            { id: "e3", year: 3, title: "黑市定价", description: "黑市用现金和关系重新定价，价格比原来更高。", certainty: CERTAINTY.INFER },
            { id: "e4", year: 5, title: "以物易物", description: "香烟、酒、瓶盖成为硬通货。", certainty: CERTAINTY.ASSUME },
            { id: "e5", year: 7, title: "治安恶化", description: "黑市争夺引发暴力，社区自卫组织出现。", certainty: CERTAINTY.ASSUME },
            { id: "e6", year: 10, title: "新特权阶层", description: "掌握货源和暴力的人成为新特权阶层。", certainty: CERTAINTY.ASSUME }
          ],
          edges: [
            { from: "e1", to: "e2", relation: "导致", strength: 4, assumption: false, explanation: "价格消失，企业失去生产信号。" },
            { from: "e2", to: "e3", relation: "导致", strength: 4, assumption: false, explanation: "短缺催生黑市，黑市重新定价。" },
            { from: "e3", to: "e4", relation: "导致", strength: 3, assumption: true, explanation: "现金和价格不稳定，物品成为替代货币。" },
            { from: "e4", to: "e5", relation: "导致", strength: 3, assumption: true, explanation: "黑市竞争升级为暴力。" },
            { from: "e5", to: "e6", relation: "导致", strength: 3, assumption: true, explanation: "暴力保护下的货源形成新特权。" },
            { from: "e2", to: "e6", relation: "放大", strength: 2, assumption: true, explanation: "生产停滞让掌握存货的人更有权力。" }
          ],
          unintended: [
            { title: "黑市暴力", description: "价格没有消失，只是从商店搬到了巷子里，而且更危险。" },
            { title: "囤积", description: "能拿到货的人囤积，短缺被放大。" },
            { title: "货币替代", description: "香烟、酒、瓶盖成为新的货币，新的不平等出现。" }
          ],
          report: {
            title: "黑市社会",
            quote: "价格取消以后，所有东西都变便宜了，除了黑市里的价格。",
            summary: "官方价格消失，黑市价格补位；自由变多，安全变少。",
            confidence: "低"
          }
        }
      }
    }
  ];

  global.WRM_DATA = {
    meta: {
      version: "0.1.0",
      updated: "2026-11-18",
      title: "世界规则修改器",
      disclaimer: "情景推演，不是对真实未来的预测。所有数字为示意，不是统计数据。",
      certaintyLegend: {
        "推算": "由规则和参数直接推导，逻辑链相对完整。",
        "假设": "依赖一个未被验证的前提；换一个前提，结果会变。",
        "不确定": "存在多种走向，当前数据无法判断哪一种更可能。"
      },
      scaleNote: "指标为 0–100 的示意分数，只用于同一规则内 A/B 对比，不跨规则比较。",
      presetNote: "第一版先支持 A/B 两套预设；任意参数组合由引擎按 param.effect 近似，不保证与预设完全一致。"
    },
    rules: RULES
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = global.WRM_DATA;
  }
})(typeof window !== "undefined" ? window : globalThis);
