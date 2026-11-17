/* ============================================================
   life_data.js —— 《人生：无限分岔》内容组负责
   ------------------------------------------------------------
   只改文字和数字。写作铁律（v2 引擎提示词）：
   短句为主；情绪藏在动作和物件里；不升华、不说教、不剧透；
   叙事里不用 emoji；不用"突然/竟然/没想到/那一刻"堆转折；
   不用"命运的齿轮/翻开崭新一页"这类套话。
   节点 choices 字段说明：
     t 选项文字 / hint 一句情绪暗示 / fx 显性属性增减 /
     hid 隐性增减(extrovert外向 rational理性 cautious谨慎) /
     moral 道德 / knot 心结 / bond 人际好感 / flag 标记 /
     cf 反事实（人生复盘用，"如果当初选它"的一句回响）/
     lock+lockText 宿命锁：条件满足时选项灰置，锁因要写成
     "身体/本能/旧阴影替他做了决定"，不写"系统禁止"。
   ============================================================ */

const LIFE = {
  attrs: [
    { key: "health", name: "健康" },
    { key: "intellect", name: "智力" },
    { key: "eq", name: "情商" },
    { key: "wealth", name: "财富" },
    { key: "looks", name: "外貌" },
    { key: "luck", name: "运气" }
  ],
  stages: [
    { name: "婴儿期", from: 0, to: 3 },
    { name: "童年", from: 4, to: 11 },
    { name: "少年", from: 12, to: 17 },
    { name: "青年", from: 18, to: 29 },
    { name: "成年", from: 30, to: 44 },
    { name: "中年", from: 45, to: 59 },
    { name: "老年", from: 60, to: 200 }
  ],

  families: [
    { id: 0, label: "县城双职工", father: "化肥厂机修工", mother: "超市收银员", wealth: 28,
      persona: "silence", relic: "一只磨穿指头的工作手套",
      line: "父亲的话少，扳手比话多。母亲下班带回临期酸奶，日期朝里放。",
      tilt: { extrovert: 48, rational: 52, cautious: 55 }, bonds: { mother: 60, father: 48 } },
    { id: 1, label: "大城市中产独生", father: "设计院结构工程师", mother: "中学教师", wealth: 52,
      persona: "gaze", relic: "玻璃板下压着的满分试卷",
      line: "家里最响的声音是翻卷子。客厅的灯十点半准时暗一半。",
      tilt: { extrovert: 40, rational: 60, cautious: 58 }, bonds: { mother: 62, father: 50 } },
    { id: 2, label: "农村留守", father: "广东工地钢筋工", mother: "广东电子厂插件工", wealth: 18,
      persona: "leave", relic: "一张磨得发白的电话卡",
      line: "父母在电话里。奶奶在灶边。村口的班车一周两趟。",
      tilt: { extrovert: 30, rational: 45, cautious: 62 }, bonds: { mother: 34, father: 30, grandma: 70 } },
    { id: 3, label: "早餐摊个体户", father: "炸油条的", mother: "收钱记账的", wealth: 30,
      persona: "ledger", relic: "那一年的账本",
      line: "凌晨三点卷帘门响。你睡在摊子后间，被子上有油烟味。",
      tilt: { extrovert: 58, rational: 45, cautious: 42 }, bonds: { mother: 60, father: 50 } },
    { id: 4, label: "单亲母亲家", father: "南下后没再回来", mother: "医院夜班护士", wealth: 24,
      persona: "chair", relic: "一件没人穿的男式夹克",
      line: "饭桌摆三副碗筷，第三副没人动，也没人收。",
      tilt: { extrovert: 38, rational: 42, cautious: 55 }, bonds: { mother: 68, father: 12 } },
    { id: 5, label: "县城公务员家", father: "局里股长", mother: "银行柜员", wealth: 44,
      persona: "face", relic: "印着先进工作者的搪瓷杯",
      line: "饭桌上的话题是科里的人事。声音不高，字字有分寸。",
      tilt: { extrovert: 42, rational: 58, cautious: 66 }, bonds: { mother: 55, father: 52 } },
    { id: 6, label: "下岗工人家", father: "开出租", mother: "做家政", wealth: 20,
      persona: "lighter", relic: "一只没气的打火机",
      line: "父亲九八年下的岗。打火机没气了，他摇两下，还能着。",
      tilt: { extrovert: 50, rational: 40, cautious: 48 }, bonds: { mother: 58, father: 46 } },
    { id: 7, label: "重组家庭", father: "继父，货车司机", mother: "纺织厂挡车工", wealth: 34,
      persona: "surname", relic: "户口本的旧页",
      line: "你随母改嫁。饭桌上有人给你夹菜，你双手接。",
      tilt: { extrovert: 35, rational: 48, cautious: 60 }, bonds: { mother: 58, father: 22, stepfather: 34 } }
  ],

  personas: {
    silence: { name: "咽回去的声音", lines: ["算了。说了也没用。", "咽下去。谁都咽。", "他当年也没说。你像他。"] },
    gaze: { name: "盯着你的声音", lines: ["再改改，还能更好。", "你这样，妈怎么跟人说。", "别看我。看卷子。"] },
    leave: { name: "村口的声音", lines: ["别先伸手。先伸手的先输。", "他们迟早要走。", "村口的风，你记得吧。"] },
    ledger: { name: "算账的声音", lines: ["别拿。拿了就是欠。", "咱家不像别人家。", "再数一遍。数一遍不亏。"] },
    chair: { name: "空椅子的声音", lines: ["别问。问了也没人答。", "椅子空着，你习惯了。", "他不回来。你先吃。"] },
    face: { name: "饭桌的声音", lines: ["小声点。墙有耳。", "规矩就是规矩。", "别让人看笑话。"] },
    lighter: { name: "打火机的声音", lines: ["忍忍。忍忍就过去了。", "气什么。谁都这样。", "摇两下。还能着。"] },
    surname: { name: "户口本的声音", lines: ["你是外人。别忘了。", "叫叔。叫甜一点。", "户口本那页，别翻。"] }
  },

  nodes: [
    {
      age: 0, key: true,
      scene: "你睡在后间，被子上有别人的汗味。天没亮，大人在门外走动，盆碰盆，声音压着。炉子在那头，被子这头凉。他们背对着你。",
      hint: "母亲记得你的哭声。父亲记得别的。",
      choices: [
        { t: "哭。哭到他们其中一个回头。", hint: "抱起来是暖的。", fx: { eq: 3 }, hid: { extrovert: 6 }, bond: { mother: 4 }, knot: -2, flag: "cry:A",
          cf: "六岁时你还会相信，开口就有回应。" },
        { t: "不哭。攥住被角，听门外的声音听到睡着。", hint: "那些声音，其实催眠。", fx: { health: 1 }, hid: { extrovert: -6, cautious: 4 }, knot: 3, flag: "cry:B",
          cf: "六岁想要什么，你先看大人的脸色。" },
        { t: "哭两声就停，等脚步近了再哭。", hint: "零岁，已经会省着力气。", fx: { eq: 4 }, hid: { rational: 5, extrovert: 2 }, knot: 2, flag: "cry:C",
          cf: "后来你总留半句话，等对方先问。" }
      ]
    },
    {
      age: 3,
      scene: "父亲蹲在门槛上抽烟，半个身子在门影里。母亲喊你认字，字卡是烟盒拆的，人、口、手。外面有小孩哭，被鹅追着。",
      hint: "烟盒上的字，你先记住的是手。",
      choices: [
        { t: "坐母亲腿上认字。", hint: "她的下巴抵着你头顶。", fx: { intellect: 5 }, bond: { mother: 5 }, hid: { rational: 3 },
          cf: "认字早的孩子，后来习惯用道理挡事。" },
        { t: "溜出去看鹅追小孩。", hint: "鹅比字好看。", fx: { health: 3, eq: 2, luck: 2 }, hid: { extrovert: 5, cautious: -4 },
          cf: "那天下午的欢笑声，你三十岁还记得。" },
        { t: "拿字卡去教哭的那个小孩。", hint: "他鼻涕蹭你一手。", fx: { eq: 5, intellect: 2 }, moral: 4, hid: { extrovert: 3 }, flag: "contrib:1",
          cf: "第一次有人因为你而不哭。这种事后来还发生过。" }
      ]
    },
    {
      age: 6, key: true, echo: { flag: "cry", lines: {
        A: "零岁那年你哭到人回头。这次你直接开口。",
        B: "零岁那年你没哭。这次你先看母亲的脸，再看玻璃板。",
        C: "零岁那年你等脚步。这次你等母亲先问。" } },
      scene: "家里要交书本费。母亲翻开抽屉数钱，数两遍，把纸币压在玻璃板下。你站在桌边，话到嗓子眼。",
      hint: "玻璃板下的钱，边角是卷的。",
      choices: [
        { t: "说。书本费，多少，说清楚。", hint: "说清楚就不丢人。", fx: { eq: 3, wealth: -2 }, bond: { mother: 3 }, hid: { extrovert: 4 }, knot: -3,
          cf: "书当天就买回来了。你记住开口不丢人。" },
        { t: "不说。说学校没收。", hint: "省下的钱能买半袋米。", fx: { intellect: 1 }, knot: 6, hid: { cautious: 4 }, bond: { mother: -2 }, flag: "lie:1",
          cf: "那本书你没拿到。后来你总替别人省。" },
        { t: "说一半：学校要钱，我先借同学的。", hint: "借字说得很轻。", fx: { eq: 2 }, knot: 3, hid: { rational: 3 },
          cf: "借来的书边上有别人的名字。你看得更认真。" }
      ]
    },
    {
      age: 9,
      scene: "班里选学习委员。黑板上有你的名字，差两笔写完。同桌说给他新橡皮就投你。后排已经有人用粉笔写了同意。",
      hint: "那块橡皮你还只用了个角。",
      choices: [
        { t: "给橡皮。", hint: "一个角换一个委员。", fx: { eq: 2, wealth: -1 }, moral: -3, hid: { rational: 2 }, flag: "trade:1",
          cf: "第一次知道票可以换。后来有人拿更大的东西换你的票。" },
        { t: "不给。选不上就选不上。", hint: "橡皮攥在手心出汗。", fx: {}, moral: 4, knot: 2, hid: { extrovert: -2, cautious: 2 }, flag: "reputation:3",
          cf: "你没当上委员。但没人再说你给得起什么。" },
        { t: "站起来说：橡皮是我的，票你们自己投。", hint: "全班安静了两秒。", fx: { eq: 5 }, moral: 2, hid: { extrovert: 6 }, flag: "reputation:5",
          lock: { v: "extrovert", op: "<=", val: 25 }, lockText: "（主角下不了手：手举到一半，又回去攥衣角。）",
          cf: "那两秒的安静，你后来在很多会议室里找过。" }
      ]
    },
    {
      age: 12, key: true, voice: true,
      scene: "县中学广播站招播音员。老师说你声音干净。母亲说念这个不顶饭吃。报名表在你书包里，压皱了一个角。",
      hint: "皱的那个角，你抚过三次。",
      choices: [
        { t: "交表。", hint: "声音干净不是错。", fx: { eq: 4 }, hid: { extrovert: 6 }, bond: { mother: -3 }, knot: 2, flag: "voice:1", flag2: "reputation:4",
          cf: "广播站的那支话筒，比你高半头。你垫过脚。" },
        { t: "把表揉进垃圾桶，跟母亲说不想去。", hint: "揉的时候没犹豫。", fx: { intellect: 2 }, knot: 6, hid: { cautious: 4 }, bond: { mother: 3 }, flag: "bury:1",
          cf: "垃圾桶里那张表，你毕业那天回去看过。不在。" },
        { t: "交表，但跟母亲说是为了语文加分。", hint: "加分两个字说得很快。", fx: { eq: 3 }, knot: 3, moral: -1, hid: { rational: 4 },
          cf: "一个谎护住一个爱好。这手法你后来常用。" }
      ]
    },
    {
      age: 15, key: true,
      scene: "父亲把两条路摆桌上：县职高，学手艺，十八岁挣钱；县一中，赌三年。他说征求你意见，手指压在职高那栏。",
      hint: "他的指甲缝里有洗不掉的油。",
      choices: [
        { t: "职高。早挣钱，早松快。", hint: "父亲的手指松开了。", fx: { wealth: 4, health: -1 }, knot: 4, bond: { father: 4 }, hid: { cautious: 5 }, flag: "path:trade",
          cf: "十八岁第一个月工资，你给父亲买了条烟。他抽了一半，剩一半摆着。" },
        { t: "一中。赌三年，赌注我自己背。", hint: "背字说得很重。", fx: { intellect: 4 }, knot: 2, bond: { father: -4 }, hid: { cautious: -4, rational: 3 }, flag: "path:study",
          lock: { v: "cautious", op: ">=", val: 80 }, lockText: "（主角下不了手：赌字还没出口，手心先出汗。）",
          cf: "三年后你明白，赌注其实一直有人替你垫着。" },
        { t: "问父亲：你想让我选哪个？然后选另一个。", hint: "他愣住，烟灰掉在桌上。", fx: { eq: 3 }, moral: 2, bond: { father: -2 }, hid: { rational: 4, extrovert: 2 }, flag: "separate:1",
          cf: "那是你第一次把他的课题还给他。手有点抖。" }
      ]
    },
    {
      age: 18, key: true, echo: { flag: "cry", lines: {
        A: "零岁哭到人回头的那股劲，还在。",
        B: "零岁没哭的那个孩子，现在也不吭声，只看价目。",
        C: "零岁等脚步的孩子，还在等一个先开口的人。" } },
      variants: {
        "path:trade": {
          scene: "职高实习通知贴出来：广东，电子厂，站班十二小时。签约定金六百。宿舍八人间，风扇转起来像拖拉机。",
          hint: "六百块，母亲半个月不用出摊。",
          choices: [
            { t: "签。六百块够母亲歇半个月。", hint: "笔尖在纸上顿了一下。", fx: { wealth: 6, health: -4 }, knot: 3, bond: { mother: 4 },
              cf: "流水线第十二个小时，你学会站着睡。" },
            { t: "不签。再读一年，或另找路。", hint: "通知纸边被你捏软。", fx: { intellect: 3, wealth: -2 }, hid: { cautious: -3 }, knot: 2,
              cf: "多读的那一年，没人保证有用。你后来不后悔。" },
            { t: "签，但把夜校的书塞进行李箱。", hint: "箱子合不上，坐上去压。", fx: { intellect: 4, wealth: 4, health: -3 }, hid: { rational: 3 }, flag: "night:1",
              cf: "夜校的灯比车间的灯暗。你在那盏灯下没打过瞌睡。" }
          ]
        },
        "path:study": {
          scene: "高考分数出来，差一本线两分。志愿书翻得卷边。外省学校的学费是本省的三倍，住宿费另算。",
          hint: "三倍那个数字，你圈了又划掉。",
          choices: [
            { t: "报本省。省学费，离家近。", hint: "近字写得比别的字大。", fx: { wealth: 2 }, bond: { mother: 3 }, knot: 2, hid: { cautious: 3 },
              cf: "离家近的那四年，你每周回家吃饭。汤总是多的。" },
            { t: "报外省。越远越好。", hint: "远字没写出来，在嘴里。", fx: { intellect: 4, wealth: -4 }, hid: { extrovert: 5, cautious: -4 }, bond: { mother: -3 }, flag: "leave:1",
              cf: "火车开动那一刻你没回头。后来你回头的次数比谁都多。" },
            { t: "复读。再一年，就一年。", hint: "一年两个字，咬得很死。", fx: { intellect: 5, health: -3 }, knot: 4, hid: { cautious: 2 },
              cf: "复读班的窗户朝北。冬天手冷，你把手垫在卷子下写。" }
          ]
        }
      },
      scene: "毕业的分岔路口。招工表和志愿书同时摊在桌上，两边都催你签字。风扇把头摇过去，又摇回来。",
      hint: "两张纸，你各压了一角。",
      choices: [
        { t: "先挣钱。书以后再说。", hint: "以后两个字很轻。", fx: { wealth: 5, intellect: -2 }, knot: 3, hid: { cautious: 3 },
          cf: "以后的书没再翻开。但第一笔工资的信封你留着。" },
        { t: "先读书。钱以后再说。", hint: "以后两个字也很轻。", fx: { intellect: 5, wealth: -3 }, knot: 2, hid: { rational: 3 },
          cf: "读书那几年穷得稳定。穷得稳定也是一种稳。" },
        { t: "半工半读。两边都占，两边都累。", hint: "时间表排到凌晨一点。", fx: { intellect: 3, wealth: 2, health: -4 }, hid: { rational: 4 }, flag: "night:1",
          cf: "公交车上背的单词，比课堂上记得牢。" }
      ]
    },
    {
      age: 22, voice: true,
      scene: "第一笔工资到账。室友提议拼一趟旅行，或买件面试用的好外套。母亲来电，说屋顶漏了，没要钱，就是说屋顶。",
      hint: "她说屋顶的时候，背景有电视声。",
      choices: [
        { t: "把钱寄回家。", hint: "汇款单填得很慢。", fx: { wealth: -5 }, bond: { mother: 6 }, knot: 4, moral: 3,
          cf: "屋顶补好了。母亲跟邻居说了一遍，又跟你说了一遍。" },
        { t: "拼旅行。屋顶下个月再说。", hint: "海是绿的，跟想的不一样。", fx: { health: 3, eq: 3, wealth: -3 }, knot: 3, bond: { mother: -2 }, hid: { extrovert: 3 },
          cf: "旅行那张合影，你二十年后还认得清每个人。" },
        { t: "寄一半，留一半买外套。", hint: "一半这个数字，算了两遍。", fx: { wealth: -3, eq: 2 }, bond: { mother: 2 }, hid: { rational: 4 },
          cf: "外套面试穿了一次。后来它挂在柜里，像个体面的人。" }
      ]
    },
    {
      age: 26, key: true,
      scene: "项目上线。庆功宴上领导问谁贡献最大。做核心模块的同事在医院挂水，没来。桌上的人都在看你。",
      hint: "你的杯子空了，没人给你倒。",
      choices: [
        { t: "说是我。机会就这一次。", hint: "领导点了点头。", fx: { wealth: 5 }, moral: -6, knot: 3, flag: "credit:1", flag2: "reputation:5",
          lock: { v: "moral", op: ">=", val: 75 }, lockText: "（主角下不了手：话到嘴边，拐成了别人的名字。）",
          cf: "那次提拔是真的。后来每次庆功，你都坐得离主位远一点。" },
        { t: "说挂水那位名字，把他提交的次数念出来。", hint: "数字念得很慢。", fx: { wealth: -2 }, moral: 6, bond: { colleague: 6 }, hid: { extrovert: 2 }, flag: "contrib:1", flag2: "reputation:3",
          cf: "他出院那天给你带了袋橘子。没说什么。橘子很甜。" },
        { t: "说大家的名字，一个不漏，包括自己。", hint: "念到自己时停半拍。", fx: { eq: 3 }, moral: 3, hid: { rational: 2 }, flag: "contrib:1", flag2: "reputation:2",
          cf: "名单念完那刻的安静，和念错名字那刻不一样。" }
      ]
    },
    {
      age: 30, voice: true,
      scene: "父亲的手术拖了两年。存款够首付，也够手术，两个数你算过很多遍，不重叠。中介催签字，医院催床位。",
      hint: "两个号码都存在手机里，都没拨。",
      choices: [
        { t: "手术。房子再等。", hint: "等字说出口，松了半口气。", fx: { wealth: -6 }, moral: 4, knot: -4, bond: { father: 8 }, flag: "surgery:1",
          lock: { v: "knot", op: ">=", val: 70 }, lockText: "（主角下不了手：账本上奶粉那行还在。转账按不下去。）",
          cf: "手术那天你在走廊坐了一夜。椅面是凉的，你没觉得。" },
        { t: "首付。手术再拖拖。", hint: "拖字没敢说第二遍。", fx: { wealth: 4 }, knot: 8, moral: -4, bond: { father: -6 }, hid: { cautious: 3 },
          cf: "房子涨了。父亲没说什么。没说什么比说什么重。" },
        { t: "借亲戚。两边都办。", hint: "借字练了一晚上。", fx: { wealth: -2, eq: 3 }, knot: 4, hid: { rational: 2 }, flag2: "reputation:-2",
          cf: "欠条写了三张。还清那天你把欠条烧了，没留底。" }
      ]
    },
    {
      age: 35, key: true,
      scene: "同学聚会。有人问你现在做什么。你听见自己的回答比事实慢半拍。当年混得最好的那位，如今托你内推。",
      hint: "你的酒杯比别人的低半寸。",
      choices: [
        { t: "说实话。包括不太好的那部分。", hint: "说完桌上安静一秒。", fx: { eq: 4 }, moral: 3, knot: -5, hid: { extrovert: 3 }, flag: "honest:1", flag2: "reputation:2",
          lock: { v: "extrovert", op: "<=", val: 25 }, lockText: "（主角下不了手：实话的版本排练过，还是说不出口。）",
          cf: "那秒安静之后，有人给你倒了酒。倒得很满。" },
        { t: "修饰一下。谁都修饰。", hint: "修饰的词很顺口。", fx: { knot: 5 }, moral: -2, hid: { rational: 2 }, flag2: "reputation:3",
          cf: "修饰的版本传回你耳朵时，已经比你说的还好。你不敢认。" },
        { t: "反问他的离婚。桌上安静一秒。", hint: "安静得能听见火锅。", fx: { eq: 2 }, moral: -3, knot: 2, hid: { extrovert: 2 }, flag2: "reputation:-2",
          cf: "那秒安静里，你看见他眼里的东西。后来你没再提。" }
      ]
    },
    {
      age: 40,
      scene: "孩子的作业：写《我的爸爸》或《我的妈妈》。他问你小时候想做什么。你筷子停在半空，菜汤滴回碗里。",
      hint: "他等答案的样子，不像你小时候。",
      choices: [
        { t: "告诉他。包括没做成的那部分。", hint: "没做成三个字说得很平。", fx: { eq: 4 }, knot: -4, moral: 2, bond: { child: 6 }, flag: "told:1",
          cf: "他作文里写：我爸小时候想当播音员。老师批：真实。" },
        { t: "说吃你的饭，问这些干什么。", hint: "筷子落下去，有点重。", fx: { knot: 5 }, hid: { cautious: 2 }, bond: { child: -4 },
          cf: "那篇作文他后来写得很好。写的是别人。" },
        { t: "反问：你想做什么？我不笑。", hint: "不笑两个字，他看了你一眼。", fx: { eq: 5 }, moral: 3, bond: { child: 5 }, hid: { extrovert: 2 }, flag: "listen:1",
          cf: "他说了三个志愿，一个比一个离谱。你一个都没笑。" }
      ]
    },
    {
      age: 45, key: true, voice: true,
      force: { when: { v: "health", op: "<=", val: 30 },
        text: "体检报告出来。医生圈了三行，问家属来了吗。你说来了，又说没来。报告折成四折，放进最里层口袋。那天下午你照常上班，把报告压在键盘下，谁也没给看。",
        fx: { health: -6 }, knot: 4, hid: { cautious: 6 } },
      scene: "单位裁员名单公示，或摊子接到转让通知。同一天老友来电：来帮我，钱少一半，但事你自己定。",
      hint: "两个消息，你都没回。",
      choices: [
        { t: "留下。少一半也是稳。", hint: "稳字在心里称了称。", fx: { wealth: 2, health: -2 }, knot: 3, hid: { cautious: 5 },
          cf: "留下的第三年，名单上还是有你。那次你没慌。" },
        { t: "跟老友走。", hint: "电话里他咳嗽了一声。", fx: { wealth: -3, eq: 3 }, hid: { cautious: -6, extrovert: 3 }, bond: { friend: 6 }, flag: "risk:1",
          cf: "钱少一半的那两年，你话多了一半。" },
        { t: "都不。自己摆个摊，或接散活。", hint: "摊字说出口，像回到三岁。", fx: { wealth: -2, intellect: 3 }, knot: 2, hid: { cautious: -3, rational: 4 }, flag: "own:1",
          cf: "第一个月亏。第二个月平。第三个月你买了把新椅子。" }
      ]
    },
    {
      age: 50,
      scene: "收拾老人的东西。抽屉底翻出{relic}。纸脆了，字还认得。你拿在手里，重量比想的轻。",
      hint: "抽屉里还有半盒没用的回形针。",
      choices: [
        { t: "留下。放回去，不跟人说。", hint: "放回去的位置，和原来一样。", fx: { knot: 3 }, bond: { mother: 3 }, hid: { cautious: 2 },
          cf: "那抽屉后来没人再开。钥匙在你这。" },
        { t: "扔了。抽屉要装新东西。", hint: "垃圾袋系了一个扣。", fx: { health: 2, knot: -6 }, moral: -1, hid: { rational: 3 },
          cf: "扔完你在楼下站了会儿。没上去翻。" },
        { t: "拍张照，发家庭群。不配文。", hint: "发完把手机扣在桌上。", fx: { eq: 3, knot: -3 }, bond: { mother: 4 }, hid: { extrovert: 2 },
          cf: "群里回了七个表情。有一个是父亲发的。" }
      ]
    },
    {
      age: 60, key: true, voice: true,
      force: { when: { v: "father", op: "<=", val: 20, bond: true },
        text: "老家来电。父亲走了。你站在车站售票口，票攥在手里，最终没买。风把领子掀起来。你回去上了班，请假的条子写了一半，揉了。",
        fx: { health: -4 }, knot: 8, moral: 1 },
      scene: "退休手续办完。第一个不用闹钟的早上，你还是五点半醒。公园里有人舞剑，有人写地书，有人拎收音机。有人朝你招手，问新来的？",
      hint: "你的手在裤缝上蹭了蹭。",
      choices: [
        { t: "加入写地书的。水写在地上，干得很快。", hint: "第一笔写歪了，没人笑。", fx: { health: 4, eq: 3 }, knot: -3, hid: { extrovert: 4 }, flag: "contrib:1", flag2: "reputation:2",
          cf: "地书干了就没了。你写得很认真，比上班认真。" },
        { t: "回家。给孩子一家做早饭。", hint: "粥熬得比闹钟准。", fx: { health: 2 }, knot: 2, moral: 2, bond: { child: 5 },
          cf: "他们七点半到。粥六点半好。中间一小时你坐在阳台。" },
        { t: "拎收音机去河边，坐到中午。", hint: "收音机里在唱老戏。", fx: { health: 3 }, knot: -2, hid: { rational: 3, extrovert: -3 },
          cf: "河边的位置你固定了。有人给你留过马扎。" }
      ]
    },
    {
      age: 70, key: true,
      scene: "孙辈问你：这辈子最后悔的是什么。你想了一会儿。输液管滴一下，又滴一下。窗外有小孩喊人，喊的不是你。",
      hint: "他手里攥着你的老年卡。",
      choices: [
        { t: "说一件。说清楚。", hint: "清楚两个字，值一生。", fx: { eq: 3, knot: -6 }, moral: 2, bond: { child: 4 }, flag: "told:1",
          cf: "他听完说：哦。然后握了握你的手。握得不紧。" },
        { t: "说没有。后悔是给死人听的。", hint: "死人两个字，说得很轻。", fx: { health: -1 }, knot: 4, hid: { cautious: 2 },
          cf: "他没再问。老年卡在他手里，攥出了汗。" },
        { t: "反问：你最后悔什么？爷爷听着。", hint: "他愣住，然后笑了。", fx: { eq: 4, knot: -3 }, bond: { child: 5 }, hid: { extrovert: 2 },
          cf: "他说了一件小事。小到你没想到。你记了一辈子的事，他也有。" }
      ]
    }
  ],

  events: [
    { id: "e1", type: "时代浪潮", from: 12, to: 14,
      text: "校门关了。网课，摄像头关着。父亲的摊子停了三个月，存款薄得看得见。",
      choices: [
        { t: "用存款买台二手笔记本上网课。", hint: "风扇声比老师大。", fx: { wealth: -4, intellect: 4 }, hid: { rational: 3 } },
        { t: "和父亲共用一部手机，在摊子后间上课。", hint: "油烟味里听函数。", fx: { health: -2, intellect: 2 }, bond: { father: 4 } },
        { t: "不上课，跟父亲去送外卖。", hint: "电梯里你背单词。", fx: { wealth: 3, health: -3, intellect: -3 } }
      ] },
    { id: "e2", type: "时代浪潮", from: 16, to: 26,
      text: "你学了三年的一套软件活，模型三秒做完。群里半天没人说话，后来有人发了个招聘链接。",
      choices: [
        { t: "重学。从怎么提问开始。", hint: "第一课是承认不会。", fx: { intellect: 5, wealth: -2 }, hid: { rational: 3 } },
        { t: "骂一句，继续用老手艺。", hint: "老手艺还有老客户。", fx: { health: -1 }, knot: 4, hid: { cautious: 3 } },
        { t: "转去教别人用。", hint: "学生比你小十岁。", fx: { eq: 4, wealth: 2 }, flag2: "reputation:3" }
      ] },
    { id: "e3", type: "健康危机", from: 28, to: 55,
      text: "低烧一个月。你说没事，身体说有事。挂号二十六，请假半天扣二百。",
      choices: [
        { t: "去医院。", hint: "候诊椅比办公椅硬。", fx: { wealth: -2, health: 6 } },
        { t: "拖。多喝热水。", hint: "热水壶又烧干一次。", fx: { health: -8 }, knot: 2 },
        { t: "网上买药，照症状猜。", hint: "说明书字很小。", fx: { wealth: -1, health: -3 } }
      ] },
    { id: "e4", type: "偶遇故人", from: 25, to: 45,
      text: "车站有人先认出你，喊你小名。是小学同桌。他现在跑网约车，问你吃不吃饭，就现在。",
      choices: [
        { t: "吃。两小时，手机扣着。", hint: "他小名喊得比你还顺。", fx: { eq: 4, health: 2 }, bond: { friend: 5 } },
        { t: "加个微信，说下次。", hint: "下次两个字很熟。", fx: { eq: -1 }, knot: 2 },
        { t: "说有个会，先走。", hint: "会是没有的。", fx: { moral: -1 }, knot: 3, hid: { cautious: 2 } }
      ] },
    { id: "e5", type: "道德考验", from: 18, to: 40,
      text: "甲方多打了五千。回单在你手里，对方还没发现。财务下班了，明天才发现。",
      choices: [
        { t: "退回去。今晚就发消息。", hint: "消息发完，睡得着。", fx: {}, moral: 5, knot: -2 },
        { t: "留下。先吃顿好的。", hint: "好的那顿，没尝出味。", fx: { wealth: 2 }, moral: -4, knot: 3 },
        { t: "退一半，说算错了。", hint: "算错三个字打了两遍。", fx: { wealth: 1 }, moral: -1, hid: { rational: 2 } }
      ] },
    { id: "e6", type: "人际冲突", from: 22, to: 50,
      text: "同事把你的方案署了他的名。他照旧跟你打招呼。领导说各自退一步，项目要紧。",
      choices: [
        { t: "当面说清。一条一条列。", hint: "列到第三条他低头。", fx: { eq: 3 }, hid: { extrovert: 4 }, knot: -2, flag2: "reputation:2" },
        { t: "退一步。和气要紧。", hint: "和气两个字咽下去。", fx: { health: -2 }, knot: 5, hid: { cautious: 3 } },
        { t: "留证据，走流程。", hint: "邮件抄送栏填得很慢。", fx: { intellect: 3, wealth: -1 }, hid: { rational: 4 }, flag2: "reputation:1" }
      ] },
    { id: "e7", type: "意外机遇", from: 26, to: 48,
      text: "老房划进拆迁。补偿够两个首付，或一个铺面。签字期限周五。邻居已经在搬家。",
      choices: [
        { t: "拿钱，拆成两个首付。", hint: "稳字写了两遍。", fx: { wealth: 8 }, hid: { cautious: 3 } },
        { t: "拿铺面。赌人流。", hint: "赌字这次说出口了。", fx: { wealth: 4, luck: 3 }, hid: { cautious: -5 } },
        { t: "不签。等涨价。", hint: "周五过了，又周五。", fx: { wealth: 2, luck: -2 }, knot: 3, hid: { rational: 2 } }
      ] },
    { id: "e8", type: "自动事件", from: 35, to: 60, auto: true,
      text: "母亲在卫生间摔了。电话凌晨两点来。你坐床沿穿鞋，鞋穿反了。到医院她先说：不疼，别请假。",
      fx: { health: -2 }, knot: 5, bond: { mother: 6 } },
    { id: "e9", type: "时代浪潮", from: 40, to: 55,
      text: "名单上有你。人事说补偿N+1，说行业就这样。纸箱还在工位上，没拆封。",
      choices: [
        { t: "拿N+1。先歇一个月。", hint: "第一个月睡到自然醒。", fx: { wealth: 3, health: 4 }, knot: -2 },
        { t: "争2N。仲裁。", hint: "材料复印了三份。", fx: { wealth: 5, health: -3 }, hid: { rational: 3 }, flag2: "reputation:1" },
        { t: "不签。照常上班。", hint: "工位越来越安静。", fx: { health: -4 }, knot: 5, hid: { cautious: 3 } }
      ] },
    { id: "e10", type: "偶遇故人", from: 28, to: 50,
      text: "家长会上遇见当年那位。对方的孩子在你孩子班上。散会时对方说，加个微信吧，方便联系孩子的事。",
      choices: [
        { t: "加。只聊孩子。", hint: "置顶没给，免打扰给了。", fx: { eq: 3 }, moral: 1, knot: -2 },
        { t: "不加。说群里联系就行。", hint: "群里你从不说话。", fx: {}, knot: 4, hid: { cautious: 3 } },
        { t: "加。聊到凌晨两点。", hint: "两点之后没再聊。", fx: { health: -1 }, moral: -3, knot: 6, bond: { child: -2 } }
      ] },
    { id: "e11", type: "道德考验", from: 55, to: 75,
      text: "老人摔在你前面。周围三个人，四部手机，没人动。老人的手抓住你的裤脚。",
      choices: [
        { t: "扶。打120。", hint: "裤脚上有灰，你没拍。", fx: { health: -1 }, moral: 6, flag2: "reputation:3" },
        { t: "先录像，再扶。", hint: "录像举得很稳。", fx: {}, moral: 2, hid: { rational: 3 }, flag2: "reputation:1" },
        { t: "绕开。远处打120。", hint: "电话里你报得很准。", fx: {}, moral: -2, knot: 4 }
      ] },
    { id: "e12", type: "自动事件", from: 60, to: 80, auto: true,
      text: "医院取消现场挂号窗口。自助机前排着队。你站在机器前，屏幕映出你的脸。后面的人叹了口气。你让开，站到队尾，又站回来。",
      fx: { eq: -2, health: -1 }, knot: 4 }
  ],

  endings: [
    { id: "early", name: "早班", type: "悲剧", test: { healthMax: 0 },
      text: "你最后记得的是卷帘门的声音，或闹钟。有人替你把炉子关上，把灯关上。账本还有半页没记，手机还有半条消息没发。出殡那天天气很好，好得不像话。",
      line: "这一局停在半路。身体先投了降。" },
    { id: "nameless", name: "无名者", type: "彩蛋", test: { moralMin: 75, contribMin: 3 },
      text: "老年群里有人发旧照片。照片角落你抱着别人的孩子，或扶着别人的车。没人@你。你看了很久，没回复，把照片存了。存进一个叫日常的相册。",
      line: "没署名的那些事，都算数。" },
    { id: "ledgerback", name: "账本背面", type: "反转", test: { wealthMin: 70, knotMin: 60 },
      text: "存款七位数。你仍在菜市场口数菜钱。孩子说咱家不缺钱。你说我知道。当晚你翻出旧账本，奶粉那行，用手指描了一遍。描完合上，没跟人说。",
      line: "钱够了。账没平。" },
    { id: "emptychair", name: "空椅子", type: "悲剧", test: { fatherMax: 20, knotMin: 50 },
      text: "葬礼上你站前排，哭不出来。有人递纸巾，你接了，没用。回家路过老屋，卷帘门锁着。你站了一会儿，把纸巾叠好，放进口袋。叠得很方。",
      line: "有些话没来得及说，就成了行李。" },
    { id: "unsent", name: "没寄出的信", type: "遗憾", test: { knotMin: 60 },
      text: "收拾东西翻出三条没发的消息，一张报名表，一张票根。孩子问这是什么。你说废纸。垃圾袋你系了两遍。第二遍系完，手在袋上按了按。",
      line: "没说出口的那些，替你活了一生。" },
    { id: "lamp", name: "灯还亮着", type: "圆满", test: { bondAvgMin: 60, healthMin: 40, moralMin: 55 },
      text: "七点，灯亮着。孩子一家来吃饭，汤有点咸，没人说。饭后你洗碗，水热。窗外有人放烟花，你停了一下，看完，接着洗。碗不多，洗得慢。",
      line: "没什么大事。这就是结局。" },
    { id: "surname", name: "改姓", type: "反转", test: { family: 7, honestMin: 1 },
      text: "孩子问你为什么跟奶奶不是一个姓。你讲了整个过程，包括不太好看的那部分。孩子听完说哦，然后问晚上吃什么。你说红烧排骨。锅响了一下。",
      line: "讲出来那一刻，户口本那页翻过去了。" },
    { id: "platform", name: "站台", type: "开放", test: {},
      text: "你买了张票，不知道去哪。站台广播念一个地名，不是你的。你坐到检票，起身，往闸口走，又停下。风把票角掀起来。你按住，继续走。",
      line: "没写完。也不算坏。" }
  ]
};