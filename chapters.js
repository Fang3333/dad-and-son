/*
  分版长河数据 v0.1 · 第 2–6 页的唯一内容源
  ------------------------------------------------------------
  5 个版（章节）：原始 → 古代 → 近代早期 → 工业 → 现代。
  每章 4 件大事 + 一段世界切片(intro)。每件固定三段：原来(baseline) / 现在(alternate) / 为什么(why)，
  外加一句连锁反应(chain)。情景推演，不是史实。

  改写判定：rewrites[ruleId] 是变体数组，按顺序取第一个 when 命中的变体；
  when 缺省 = 任何参数都命中；needs 里的世界假设被关闭时，这条改不动（未改写）。
  顶层 alternate/changed/why 是「未改写」时的默认展示，运行时由 resolve() 覆盖。
  一屏一章只渲染 changed 事件；变体带 detail（60–100 字，点击浮层用）与 keywords（现在半区的深红关键词）。
  不改 world-rule/data.js 与 engine.js 的结构。
*/
(function (global) {
  "use strict";

  const ASSUMPTIONS = [
    { id: "tech", label: "技术会继续累积", note: "长河下游的技术仍会按时出现，改写只换讲法，不抽掉技术本身。" },
    { id: "resources", label: "资源足够", note: "免费、短工时、配给都有物质兜底，不会先被短缺压垮。" },
    { id: "cooperate", label: "群体愿意合作", note: "人们愿意按新规则互相配合，而不是先钻空子。" }
  ];

  const CHAPTERS = [
    /* ---------------- 第 1 版 · 原始 ---------------- */
    {
      n: 1, era: "primitive", name: "原始", span: "约 100 万年前—公元前 3000 年",
      subtitle: "火还没灭，话还没说完",
      intro: "这一版，人类还没有文字，也没有国家。夜里，山洞外面有牙。有人把火种护在怀里，像护着一个还没学会走路的孩子。雨一下三天，洞口的灰被冲成沟。孩子第一次问「明天」，没人答得上来，只能把剩下的肉再分一遍。谁也不敢先睡，怕火一灭，牙就进来了。",
      events: [
        {
          id: "fire", yearLabel: "约 100 万年前", title: "火", domain: "生存",
          bigEvent: "人类学会用火。",
          baseline: "火被保留下来，熟食、取暖、夜间防御出现。",
          alternate: "这条没变。", changed: false,
          why: "考试、工时、价格都管不到山洞里的火。",
          chain: "熟食和取暖让聚落变大，农业有了起点。",
          hotTags: [], certainty: "推算", hot: false,
          rewrites: {
            "four-hour": [{
              needs: ["cooperate"], certainty: "假设",
              alternate: "守火改成轮班，每人只看四小时；火反而没灭过，洞里第一次有人敢睡整夜。",
              why: "四小时规则管到了守火的班次。",
              chain: "火整夜不灭，夜里的时间第一次归人自己。",
              keywords: ["轮班", "睡整夜"],
              detail: "原来守火的人不敢合眼，火一灭，牙就进洞。现在每人只守四小时就换班，交接时把火种拨进灰里。火整夜没灭过，洞里第一次有人敢睡整夜，梦也多了起来。"
            }]
          }
        },
        {
          id: "language", yearLabel: "约 5 万年前", title: "语言", domain: "文化",
          bigEvent: "人开始用词指代不在眼前的东西。",
          baseline: "词能教明天：老人把狩猎的路、可吃的根，一句句传给还没出生的孩子。",
          alternate: "这条没变。", changed: false,
          why: "语言在考场、班次、价签出现之前就长成了，规则够不着它。",
          chain: "经验能跨代累积，火和农业才有了传下去的可能。",
          hotTags: [], certainty: "推算", hot: false,
          rewrites: {
            "no-exam": [{
              certainty: "推算",
              alternate: "本事不考，跟着做就会；词里教动作的多了，教背的少了。",
              why: "取消考试，经验回到手把手教。",
              chain: "知识靠示范传，语言先长出手艺的词。",
              keywords: ["跟着做"],
              detail: "没有考试筛人，孩子学本事靠跟着大人做。怎么剥皮、怎么认根，词都长在动作上。老人不再让人背，只让人看。动词先富起来，名词慢慢跟上。"
            }],
            "four-hour": [{
              certainty: "假设",
              alternate: "干活的时间短了，围火说话的时间长了；词先一步长出来。",
              why: "四小时规则把空闲还给了火堆边。",
              chain: "闲话变多，经验传得更快。",
              keywords: ["围火说话"],
              detail: "每天只干四小时，剩下的人围在火堆边。狩猎的事被翻来覆去地讲，讲的人添油加醋，听的人追问细节。词不够用了，新的词就被造出来，先指明天，再指以后。"
            }]
          }
        },
        {
          id: "burial", yearLabel: "约 3 万年前", title: "埋葬", domain: "信仰",
          bigEvent: "死者第一次被放进土里，身边摆着随身物。",
          baseline: "死者有随身物，生者开始相信有「以后」；悲伤有了安放的地方。",
          alternate: "这条没变。", changed: false,
          why: "埋葬和信仰早于一切规则，考试、工时、价格都管不到它。",
          chain: "对「以后」的想象，让群体愿意为看不见的东西合作。",
          hotTags: [], certainty: "假设", hot: false,
          rewrites: {
            "free-goods": [{
              certainty: "假设",
              alternate: "随葬品归公中调配，死者带走的是公家的陶罐；悲伤还在，私产没了。",
              why: "商品免费，连随葬品都不再私有。",
              chain: "「以后」的想象还在，只是不再用私产陪葬。",
              keywords: ["公家的陶罐"],
              detail: "东西不再私有，随葬品从公仓里领。死者带走的陶罐是公家的，刻着村社的记号。生者照样哭，照样相信有以后，只是墓里不再分贫富，陶罐的样式都差不多。"
            }]
          }
        },
        {
          id: "farm", yearLabel: "约 1 万年前", title: "农业", domain: "生存",
          bigEvent: "第一粒种子埋进土里。",
          baseline: "第一粒种子埋下去，人第一次决定明年在哪里。",
          alternate: "这条没变。", changed: false,
          why: "取消考试和缩短工时，都动不了土里的种子。",
          chain: "余粮养活了不种地的人，城市和文字有了底子。",
          hotTags: [], certainty: "推算", hot: false,
          rewrites: {
            "no-exam": [{
              certainty: "推算",
              alternate: "种地不考级，老农手把手带徒弟；种子留在村口，收成看天也看师傅。",
              why: "取消考试，农技回到师徒相传。",
              chain: "农技靠经验传，好师傅成了村口的名人。",
              keywords: ["不考级", "师傅"],
              detail: "种地不考级，老农手把手带徒弟。什么时候下种、怎么看墒情，全凭经验。种子留在村口，收成看天也看师傅，好师傅的名气比村长还大，提亲的人踏破门槛。"
            }],
            "free-goods": [{
              needs: ["resources", "cooperate"], certainty: "假设",
              alternate: "粮食不再标价，村社的公仓按人头分粮；埋种子的人不再盘算明年能卖多少。",
              why: "「商品免费」管到了粮仓：粮食是最早的商品。",
              chain: "余粮进公仓，配给的雏形比城市出现得更早。",
              keywords: ["公仓", "按人头分粮"],
              detail: "粮食不再标价，收下来直接进公仓，按人头分。埋种子的人不再盘算明年能卖多少，只看够不够吃。仓门口刻着分粮的道道，谁来了都先数一遍，再领自己那份。"
            }]
          }
        }
      ]
    },

    /* ---------------- 第 2 版 · 古代 ---------------- */
    {
      n: 2, era: "ancient", name: "古代", span: "公元前 3000—公元 1000",
      subtitle: "字第一次比人活得久",
      intro: "史官刻下：王命铸鼎。鼎成，民不知其重。这一版，字第一次比人活得久。王命能跨年，税粮能记账，贝壳给「以后」标了价。路修到山那边，税吏的脚印就是边界。帝国大得要靠驿马，才能想起自己有多大。账房先生的灯，比王宫的灯熄得晚。",
      events: [
        {
          id: "writing", yearLabel: "约公元前 3000 年", title: "文字", domain: "制度",
          bigEvent: "史官把芦苇笔压进泥板。",
          baseline: "史官刻下王命，税收和律法可以跨年传递。",
          alternate: "这条没变。", changed: false,
          why: "有没有考试，税都要记账；文字不挂钩当前规则。",
          chain: "账目能记下来，粮仓和军队就能数清楚，帝国有了一本账。",
          hotTags: [], certainty: "推算", hot: false,
          rewrites: {
            "no-exam": [{
              certainty: "推算",
              alternate: "吏员不考，字写得歪也录用；王命照样刻下来，只是笔迹杂了。",
              why: "取消考试，选吏不再看卷面。",
              chain: "文书门槛降低，账目传得更远。",
              keywords: ["不考", "笔迹杂"],
              detail: "选吏不再考试，能写字就录用。泥板上的笔迹歪歪扭扭，王命照样跨年传递。史官摇头，税吏却多了三倍，帝国的账记得更细，只是书法一年不如一年。"
            }],
            "four-hour": [{
              certainty: "假设",
              alternate: "史官每天只刻四小时，竹简短了，王命传到边郡要多等几站。",
              why: "四小时规则管到了史官的刻刀。",
              chain: "记录变短，帝国的记忆瘦了一圈。",
              keywords: ["只刻四小时"],
              detail: "史官每天只刻四小时，到点就收刀。竹简上的字少了，王命记得短，传到边郡要多等几站。史官说这样也好，废话刻得少，后人读起来省事。"
            }]
          }
        },
        {
          id: "money", yearLabel: "约公元前 700 年", title: "货币", domain: "经济",
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
                chain: "巷子里的汇率比官方的秤还准，商人换个地方继续做。",
                keywords: ["黑市", "硬通货"],
                detail: "官价没了，贝壳和铜钱却没消失，转进巷子继续用。黑市里的汇率一天三变，比官方的秤还准。商人换个地方做买卖，官府睁一只眼闭一只眼，税照样收不上来。"
              },
              {
                needs: ["resources"], certainty: "推算",
                alternate: "钱被收起来，商品不再标价；长途贸易变成运输，税收直接收粮和布。",
                why: "「商品免费」抽掉了货币存在的理由。",
                chain: "市场缩成配给点，商人阶层失去位置。",
                keywords: ["收起来", "收粮和布"],
                detail: "钱被收进箱底，商品不再标价。长途贸易变成运输队，税吏直接收粮和布。市场缩成配给点，商人没了位置，赶车的反而忙起来，路上全是运粮的车辙。"
              }
            ]
          }
        },
        {
          id: "empire", yearLabel: "公元前 221 年", title: "帝国·道路", domain: "制度",
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
              chain: "荐举让门第成了门票，官员流动变慢。",
              keywords: ["荐举", "赶考的人"],
              detail: "选官不考策论，改靠荐举和试职。道路上诏令照样跑，赶考的人却没了。驿站清闲下来，门第成了新的门票，寒门的路窄了，官员的流动慢了下来。"
            }],
            "four-hour": [{
              certainty: "假设",
              alternate: "徭役每天只服四小时，路修得慢，税吏走到山那边要多花一倍日子。",
              why: "四小时规则管到了徭役的班次。",
              chain: "帝国半径缩水，边界变得模糊。",
              keywords: ["只服四小时"],
              detail: "徭役每天只服四小时，到点就散。路修得慢，税吏走到山那边要多花一倍日子。帝国的边界跟着模糊，诏令传到地方，茶都凉了，地方官只好先斩后奏。"
            }]
          }
        },
        {
          id: "iron", yearLabel: "约公元前 1200 年", title: "铁器", domain: "技术",
          bigEvent: "炉火把石头炼成比青铜更硬的铁。",
          baseline: "工具更硬，开荒更快，斧头和犁头走进更多人的手。",
          alternate: "这条没变。", changed: false,
          why: "炉温不认考场，铁比青铜硬是矿和火的事。",
          chain: "更硬的农具喂饱更多人，帝国有了余粮。",
          hotTags: [], certainty: "推算", hot: false,
          rewrites: {
            "free-goods": [{
              certainty: "假设",
              alternate: "铁农具免费领，开荒快了；只是坏了没人修，公家的炉子前排起队。",
              why: "商品免费，农具成了配给品。",
              chain: "工具公有，修工具的匠人成了忙人。",
              keywords: ["免费领", "没人修"],
              detail: "铁农具免费领，开荒快了一截。只是坏了没人修，公家的炉子前排起队。匠人忙得脚不沾地，农具的寿命短了，地里的收成却多了，账算下来还是划算。"
            }]
          }
        }
      ]
    },

    /* ---------------- 第 3 版 · 近代早期 ---------------- */
    {
      n: 3, era: "earlymodern", name: "近代早期", span: "1000—1750",
      subtitle: "海图缺了一角",
      intro: "伦敦，昨日电——压板还在发烫，一页纸的价钱跌过一条面包。海图缺了一角，水手说那边有陆地，没人画过。有人拿笔算苹果落下来的账，教会的钟照常敲。知识开始逃出修道院，比瘟疫快，比谣言慢。码头的水手用半张地图，换了一顿酒钱。",
      events: [
        {
          id: "print", yearLabel: "1450 年", title: "印刷", domain: "文化",
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
                chain: "印刷业围着证书转，手册和图谱反而少了。",
                keywords: ["证书", "纸价"],
                detail: "考试没了，毕业证还在。印刷机日夜印证书和推荐信模板，纸价先涨了一轮。书商抱怨手册和图谱没人印，印坊的老板却数钱数到手软，证书的花边越做越繁。"
              },
              {
                certainty: "推算",
                alternate: "印刷机照样转，只是不再印备考范文，改印手册、图谱和项目指南；知识绕开考场流传。",
                why: "考试取消，印刷的指挥棒从题库转向动手的材料。",
                chain: "识字率照样上升，只是上升不再为了考场。",
                keywords: ["手册", "绕开考场"],
                detail: "印刷机照样转，备考范文却没了销路。印坊改印手册、图谱和项目指南，知识绕开考场流传。识字率照样上升，只是读书的人不再为卷子，而为手里的活计。"
              }
            ],
            "free-goods": [{
              certainty: "假设",
              alternate: "书免费领，印坊靠公中拨纸活着；畅销的先是图谱，再是识字课本。",
              why: "商品免费，书成了配给品。",
              chain: "书价消失，读什么由书单决定。",
              keywords: ["免费领", "图谱"],
              detail: "书免费领，印坊靠公中拨纸活着。领书处排起队，畅销的先是图谱，再是识字课本。抄写员彻底没了活路，印坊的师傅却成了公家人，按月领粮，按书单开工。"
            }]
          }
        },
        {
          id: "sail", yearLabel: "1492 年", title: "航海", domain: "国际",
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
              chain: "航海少了利润驱动，新航线开得慢了。",
              keywords: ["配给", "人头"],
              detail: "货船照样开，舱里不再装待价而沽的商品，改装配给的粮和布。货单上写的是人头，不是价格。船长的利润没了，新航线开得慢，海图缺的那一角，迟迟没人去补。"
            }],
            "four-hour": [{
              certainty: "假设",
              alternate: "水手每天只值四小时，船期拉长一倍；海图缺的那一角，更晚才补上。",
              why: "四小时规则管到了船上的更次。",
              chain: "航程变慢，世界的连接推迟了几十年。",
              keywords: ["只值四小时", "船期"],
              detail: "水手每天只值四小时，到点就换更。船期拉长一倍，港口的缆绳桩闲得发慌。海图缺的那一角更晚才补上，世界的连接推迟了几十年，酒馆里的故事却多了。"
            }]
          }
        },
        {
          id: "science", yearLabel: "1687 年", title: "科学革命", domain: "技术",
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
              chain: "同行评议提前成型，名声比分数更早成为硬通货。",
              keywords: ["实验记录", "门票"],
              detail: "教师保留评价权，学会不再用辩论考试筛人，改看实验记录和论文。科学革命照样来，门票却换了。同行评议提前成型，名声比分数更早成为硬通货，信纸堆得比人高。"
            },
            {
              when: { teacherEval: false }, certainty: "假设",
              alternate: "没人给学者打分了，学会自己立规矩：实验做不出来，论文写得再漂亮也进不去。",
              why: "取消考试、教师评价权也没保留：学会只能自己立门票。",
              chain: "同行评议提前成型，实验记录比口才值钱。",
              keywords: ["自己立规矩", "实验"],
              detail: "大学不考试，教师也没了评价权，学会只好自己立规矩。想进门，先交实验记录，做不出来就别投论文。口才好的人吃了亏，手稳的人占了先，科学的门票换了一种印法。"
            }]
          }
        },
        {
          id: "firearms", yearLabel: "1453 年", title: "火器", domain: "军事",
          bigEvent: "火炮推到城墙下，石墙挡不住了。",
          baseline: "城墙挡不住炮，城堡时代落幕，战争变得又贵又集中。",
          alternate: "这条没变。", changed: false,
          why: "火药认配方不认考场，城墙的厚薄由炮决定。",
          chain: "养炮要钱，征税的权力往君主手里集中。",
          hotTags: [], certainty: "推算", hot: false,
          rewrites: {
            "no-exam": [{
              certainty: "推算",
              alternate: "炮兵军官不考算学，改从炮手里提拔；城墙照样挡不住炮，只是炮打得没那么准了。",
              why: "取消考试，军校不再考算学。",
              chain: "炮兵靠经验传，准头换成了资历。",
              keywords: ["不考算学", "没那么准"],
              detail: "炮兵军官不考算学，改从老炮手里提拔。城墙照样挡不住炮，只是炮打得没那么准了。军校改成操练场，弹道靠手感，老师傅的经验成了新的教材，传内不传外。"
            }],
            "four-hour": [{
              certainty: "假设",
              alternate: "铸炮的工匠每天只干四小时，炮出厂慢了；围城的军队换防更勤，仗打得更久。",
              why: "四小时规则管到了兵工厂的班表。",
              chain: "军备变慢，战争拖成了消耗。",
              keywords: ["只干四小时", "更久"],
              detail: "铸炮的工匠每天只干四小时，炮出厂慢了一截。围城的军队换防更勤，仗打得更久。军需官的账本厚了一倍，城堡的多活了一年，炮厂的订单却排到了后年。"
            }]
          }
        }
      ]
    },

    /* ---------------- 第 4 版 · 工业 ---------------- */
    {
      n: 4, era: "industrial", name: "工业", span: "1750—1950",
      subtitle: "夜晚第一次标了价",
      intro: "告示：自即日起，汽笛把一天切成班次。火车把时间切成时刻表，迟到第一次成为罪。电顺着线走，夜晚可以买卖，黑夜第一次标了价。人涌进城市，烟囱比教堂尖顶多，乡下的路空了。太阳还在，只是没人抬头看了。下工的人潮，把桥面踩得发烫。",
      events: [
        {
          id: "steam", yearLabel: "1776 年", title: "蒸汽机", domain: "技术",
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
              chain: "轮班制提前普及，工人的诉求从工钱变成时间。",
              keywords: ["四小时", "班次翻倍"],
              detail: "厂门贴出告示：每人每天只看四小时机器。班次翻倍，汽笛一天多响几回。工人换班时在门口交接工具，机器不停人停，煤耗没省，产量却没掉，账房先生看不懂了。"
            }]
          }
        },
        {
          id: "rail", yearLabel: "1830 年", title: "铁路", domain: "经济",
          bigEvent: "利物浦—曼彻斯特铁路通车。",
          baseline: "火车把时间切成时刻表，迟到第一次成为罪。",
          alternate: "这条没变。", changed: false,
          why: "铁轨不考试，也不打卡。",
          chain: "标准时间统一了全国的钟，市场半径又大一圈。",
          hotTags: [], certainty: "推算", hot: false,
          rewrites: {
            "no-exam": [{
              certainty: "推算",
              alternate: "火车司机不考规章，从烧锅炉的学徒里挑；时刻表照样贴，只是背规章的人少了。",
              why: "取消考试，司机的门票换成实操。",
              chain: "铁路靠师徒传，安全规程换了讲法。",
              keywords: ["不考规章", "学徒"],
              detail: "火车司机不考规章，从烧锅炉的学徒里挑。时刻表照样贴，背规章的人却少了。老师傅带徒弟跑车，规程写在烟盒背面，考试院改了行，铁路的事故率成了新话题。"
            }],
            "four-hour": [{
              needs: ["cooperate"], certainty: "推算",
              alternate: "时刻表重写：乘务组每天只值四小时，车照样开，班次却密了一倍，货在编组站排起队。",
              why: "四小时规则管到了乘务组的排班。",
              chain: "运力变紧，市场半径缩回去一圈。",
              keywords: ["时刻表", "排起队"],
              detail: "时刻表重写，乘务组每天只值四小时。车照样开，班次密了一倍，货在编组站排起队。站长把发车铃摇得更勤，旅客抱怨换乘多，铁路的账本却第一次按时下班。"
            }],
            "free-goods": [{
              certainty: "假设",
              alternate: "车票免费，车厢挤满；铁路按配额跑车，货先紧着粮和煤。",
              why: "商品免费，车票成了票证。",
              chain: "出行不要钱，运力成了新的稀缺。",
              keywords: ["免费", "配额"],
              detail: "车票免费，车厢挤满，月台上全是等配额的人。铁路按配额跑车，货先紧着粮和煤。出远门要先领条子，领不到就等下一班，火车的汽笛听着都急了。"
            }]
          }
        },
        {
          id: "electric", yearLabel: "1882 年", title: "电力", domain: "技术",
          bigEvent: "珍珠街电站点亮第一盏街灯。",
          baseline: "电顺着线走，动力和光能送到每户。",
          alternate: "这条没变。", changed: false,
          why: "电站发不发电，和考试、工时、价格无关。",
          chain: "流水线和夜班出现，城市开始不睡觉。",
          hotTags: [], certainty: "推算", hot: false,
          rewrites: {
            "four-hour": [{
              certainty: "假设",
              alternate: "电厂轮班每人四小时，夜里的灯还亮，只是抄表的人换得勤。",
              why: "四小时规则管到了电厂的值班表。",
              chain: "夜班变短，城市的夜晚换了节奏。",
              keywords: ["四小时", "换得勤"],
              detail: "电厂把值班表切成四小时一班，抄表的人换得勤，夜里的灯照样亮。夜班师傅下班能赶上末班车，茶馆里多了穿工装的人，城市的夜晚换了节奏，灯没少，觉多了。"
            }],
            "free-goods": [{
              certainty: "假设",
              alternate: "电免费用，夜晚亮如白昼；电厂门口排起队，负荷成了新的票证。",
              why: "商品免费，电力最先被抢光。",
              chain: "夜晚不再标价，停电成了新的新闻。",
              keywords: ["免费", "负荷"],
              detail: "电免费用，家家把灯点到天亮，夜晚亮如白昼。电厂的负荷蹭蹭往上蹿，门口排起队，检修的师傅不够用了。停电成了新的新闻，报纸头条比电费单还厚。"
            }]
          }
        },
        {
          id: "city", yearLabel: "1850 年", title: "工厂·城市", domain: "社会",
          bigEvent: "人涌进城市，烟囱比教堂的尖顶还多。",
          baseline: "人离开土地进工厂，城市围着烟囱长，白天黑夜都被班表切开。",
          alternate: "这条没变。", changed: false,
          why: "人往有工做的地方走，这一步不认考场。",
          chain: "城市把劳动力聚起来，工会和夜班一起出现。",
          hotTags: [], certainty: "推算", hot: false,
          rewrites: {
            "four-hour": [{
              needs: ["cooperate"], certainty: "假设",
              alternate: "工厂还在，只是每班只干四小时；城市照样挤，班表却松了，傍晚的街道第一次属于下班的人。",
              why: "四小时规则管到了工厂的班表，城市的时间被重新切开。",
              chain: "多出来的时间给了街道和家庭，夜生活提前出现。",
              keywords: ["四小时", "下班的人"],
              detail: "每班只干四小时，城市照样挤，班表却松了。傍晚的街道第一次属于下班的人，摊贩提前出摊，茶馆坐满了。夜生活提前出现，烟囱还在冒烟，人先回了家。"
            }],
            "no-exam": [{
              certainty: "推算",
              alternate: "招工不看文凭看手艺，工厂门口排的是学徒；城市照样长，只是门票换了。",
              why: "取消考试，工厂的门票从文凭换成手艺。",
              chain: "学徒制回潮，师傅成了新的守门人。",
              keywords: ["不看文凭", "学徒"],
              detail: "招工不看文凭看手艺，工厂门口排的是学徒。师傅带徒弟，三年出师，城市照样围着烟囱长。文凭纸落了灰，手艺人的腰杆直了，守门的人换了一茬。"
            }]
          }
        }
      ]
    },

    /* ---------------- 第 5 版 · 现代 ---------------- */
    {
      n: 5, era: "modern", name: "现代", span: "1950—现在",
      subtitle: "屏幕比天先亮",
      intro: "您有一条新的世界线通知。屏幕比天先亮，弹幕比新闻跑得快。第一封邮件发出去五十年后，人人都在网里。直播间刷着「做头发」，短剧循环着「不烧心」，猎鹰排队等着退休。一切都在加速，梗比光跑得还快。你点了「不再提醒」，第二天它又来了。",
      events: [
        {
          id: "compute", yearLabel: "1969 年", title: "计算机·互联网", domain: "技术",
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
              chain: "平台按作品招人，包装产业跟着搬上网。",
              keywords: ["项目仓库", "学历栏"],
              detail: "网课照样上，结业证书却不发了。平台改晒项目仓库和代码提交记录，简历里的学历栏空了。招聘的人先看作品再看人，包装产业跟着搬上网，代写项目经历的生意火了。"
            }],
            "four-hour": [{
              when: { enforceOff: true }, needs: ["tech", "cooperate"], certainty: "假设",
              offWhy: "没有强制断联，运维的四小时班表落不了地。",
              alternate: "机房照样嗡嗡响，只是运维每天只值四小时；夜里十点后的报警排队到天亮，互联网每天慢四小时。",
              why: "四小时规则管到了运维的班表。",
              chain: "全天候在线的承诺打了折，用户学会等。",
              keywords: ["只值四小时", "排队到天亮"],
              detail: "机房照样嗡嗡响，运维每天只值四小时。夜里十点后的报警没人接，排队到天亮。互联网每天慢四小时，用户学会等，平台的「全天候在线」招牌悄悄摘了。"
            }],
            "free-goods": [{
              when: { rationing: true }, needs: ["tech", "resources"], certainty: "假设",
              offWhy: "按需配给没开，数字商品还在黑市里标价。",
              alternate: "带宽和算力不再标价，平台按需分配流量；付费推广消失，推荐位成了新的票证。",
              why: "商品免费，数字商品最先被配给。",
              chain: "广告模式塌了，平台靠配额活着。",
              keywords: ["按需分配", "票证"],
              detail: "带宽和算力不再标价，平台按需分配流量。付费推广消失，推荐位成了新的票证。广告位空了，运营改行管配额，刷推荐位的黄牛出现，平台连夜封号。"
            }]
          }
        },
        {
          id: "liang", yearLabel: "2023 年", title: "亮哥的头发", domain: "娱乐",
          bigEvent: "亮哥的直播间被弹幕刷了屏。",
          baseline: "亮哥一开播，弹幕不刷商品，刷“做头发”。",
          alternate: "这条没变。", changed: false,
          why: "亮哥的头发和考场无关。",
          chain: "弹幕梗比商品传得快，直播间成了段子现场。",
          hotTags: ["做头发", "直播带货"], certainty: "假设", hot: true,
          rewrites: {
            "no-exam": [{
              certainty: "假设",
              alternate: "直播间不查学历，亮哥靠手艺圈粉；弹幕刷「做头发」，他现场剪寸头回应。",
              why: "取消考试，主播的门票换成现场手艺。",
              chain: "直播不看出身，段子成了硬通货。",
              keywords: ["不查学历", "寸头"],
              detail: "直播间不查学历，亮哥靠手艺圈粉。弹幕刷「做头发」，他真把发型师请到现场，剪了个寸头。人数翻倍，礼物照刷，平台顺势推「手艺人直播」，文凭没人提了。"
            }],
            "four-hour": [{
              when: { enforceOff: true }, needs: ["cooperate"], certainty: "假设",
              offWhy: "没有强制下班，亮哥的四小时播不满也停不下。",
              alternate: "亮哥每天只播四小时；弹幕还在刷「做头发」，他把发型师请进直播间，现场剪寸头，人数翻倍。",
              why: "四小时工作制改变了直播时长。",
              chain: "直播行业开始卖“剪头发现场”，不卖羽绒服。",
              keywords: ["只播四小时", "寸头"],
              detail: "亮哥每天只播四小时，到点就下播。弹幕还在刷「做头发」，他干脆把发型师请进直播间，现场剪了个寸头。人数翻倍，同行跟进，直播行业开始卖现场，不卖货。"
            }],
            "free-goods": [{
              needs: ["resources"], certainty: "假设",
              alternate: "羽绒服免费之后，直播间没货可卖；亮哥改播剪头发，弹幕照样刷“做头发”。",
              why: "商品免费，直播带货失去了货。",
              chain: "直播从卖货转向卖现场，段子成了正经营生。",
              keywords: ["没货可卖", "剪头发"],
              detail: "羽绒服免费之后，直播间没货可卖。亮哥改播剪头发，弹幕照样刷「做头发」。带货榜空了，现场榜满了，段子成了正经营生，发型师的档期排到了下个月。"
            }]
          }
        },
        {
          id: "falcon", yearLabel: "2025 年", title: "猎鹰退休", domain: "科技",
          bigEvent: "星舰稳定后，猎鹰火箭逐步退出发射序列。",
          baseline: "上半年猎鹰 9 发射 78 次，星舰接棒，老将猎鹰准备进博物馆。",
          alternate: "这条没变。", changed: false,
          why: "火箭的班次认轨道力学，不认地上的工时。",
          chain: "发射更便宜，太空从国家的事变成公司的事。",
          hotTags: ["猎鹰", "星舰", "火星哥"], certainty: "假设", hot: true,
          rewrites: {
            "four-hour": [{
              when: { enforceOff: true }, needs: ["cooperate"], certainty: "假设",
              offWhy: "没有强制下班，发射窗口压不进四小时。",
              alternate: "猎鹰每天只有四小时发射窗口；星舰兼职送外卖，猎鹰提前退休去博物馆，门票比发射票还难抢。",
              why: "四小时规则管到了发射窗口。",
              chain: "发射排期变长，太空快递开始按天算。",
              keywords: ["四小时发射窗口", "送外卖"],
              detail: "猎鹰每天只有四小时发射窗口，排期表拉得老长。星舰兼职送外卖，猎鹰提前退休进了博物馆。门票比发射票还难抢，小孩隔着玻璃数铆钉，讲解员说它飞过七十八回。"
            }]
          }
        },
        {
          id: "heartburn", yearLabel: "2024 年", title: "不烧心", domain: "社会",
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
              chain: "短剧开始拍“免费摊主”，台词变成“不要钱，但更不烧心”。",
              keywords: ["都免费了", "更怀疑"],
              detail: "摊主改口「都免费了，但吃了不烧心」，顾客反而更怀疑，队伍更长。短剧跟进拍「免费摊主」，台词变成「不要钱，但更不烧心」。梗从屏幕走进摊位，买卖互相演。"
            }]
          }
        }
      ]
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

  /* 返回 {changed, alternate, why, chain, certainty, blocked, detail, keywords} */
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
          chain: ev.chain, certainty: ev.certainty, blocked: blocked, detail: "", keywords: []
        };
      }
      return {
        changed: true, alternate: v.alternate, why: v.why,
        chain: v.chain || ev.chain, certainty: v.certainty || ev.certainty, blocked: [],
        detail: v.detail || "", keywords: v.keywords || []
      };
    }
    const offWhy = list.length && list[0].offWhy ? list[0].offWhy : ev.why;
    return { changed: false, alternate: "这条没变。", why: offWhy, chain: ev.chain, certainty: ev.certainty, blocked: [], detail: "", keywords: [] };
  }

  function allEvents() {
    const out = [];
    CHAPTERS.forEach((c) => c.events.forEach((ev) => out.push(ev)));
    return out;
  }

  function summary(ruleId, params, assumptions) {
    let changed = 0;
    const evs = allEvents();
    evs.forEach((ev) => { if (resolve(ev, ruleId, params, assumptions).changed) changed++; });
    return { changed: changed, total: evs.length };
  }

  function chapterSummary(chapter, ruleId, params, assumptions) {
    let changed = 0;
    chapter.events.forEach((ev) => { if (resolve(ev, ruleId, params, assumptions).changed) changed++; });
    return { changed: changed, total: chapter.events.length };
  }

  global.WRM_CHAPTERS = {
    meta: { version: "0.1.0", disclaimer: "情景推演，不是史实。" },
    assumptions: ASSUMPTIONS,
    chapters: CHAPTERS,
    resolve: resolve,
    summary: summary,
    chapterSummary: chapterSummary,
    allEvents: allEvents
  };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_CHAPTERS;
})(typeof window !== "undefined" ? window : globalThis);