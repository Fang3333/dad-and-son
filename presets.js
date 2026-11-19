(function (global) {
  "use strict";

  const ERAS = [
    { id: "primitive", n: 1, name: "原始", start: "约 100 万年前", span: "约 100 万年前—前 3000" },
    { id: "ancient", n: 2, name: "古代", start: "前 3000", span: "前 3000—前 500" },
    { id: "classical", n: 3, name: "古典", start: "前 500", span: "前 500—1000" },
    { id: "earlymodern", n: 4, name: "近代早期", start: "1000", span: "1000—1750" },
    { id: "industrial", n: 5, name: "工业", start: "1750", span: "1750—1870" },
    { id: "electric", n: 6, name: "电气", start: "1870", span: "1870—1950" },
    { id: "modern", n: 7, name: "现代", start: "1950", span: "1950—2049" },
    { id: "future2050", n: 8, name: "2050", start: "2050", span: "2050—2099 · 虚构推演" },
    { id: "future2100", n: 9, name: "2100", start: "2100", span: "2100—2199 · 虚构推演" },
    { id: "posthuman2200", n: 10, name: "2200 后人类", start: "2200", span: "2200 及以后 · 虚构推演" }
  ];
  const RECAP = {
    2: "此前仍按旧路保存火种、采集和定居。",
    3: "此前的文字、农田和粮仓尚未受新规则干预。",
    4: "城邦议事、官道和手抄书先走过了旧路。",
    5: "印刷和远航先把旧世界连了起来。",
    6: "此前工厂用蒸汽推动机器，工时跟着汽笛走。",
    7: "电网、电报与广播先按旧办法铺开。",
    8: "互联网与机器学习已进日常，往后都是假设。",
    9: "此前先假设智能设备参与了公共服务。",
    10: "此前先假设轨道住区已有独立的生活账本。"
  };
  const BRANCHES = [
    { n: 1, id: "1", options: [{ key: "1A", label: "火被保留" }, { key: "1B", label: "火没留住" }] },
    { n: 5, id: "5", options: [{ key: "5A", label: "蒸汽机被接受" }, { key: "5B", label: "蒸汽机被砸掉" }] },
    { n: 8, id: "8", options: [{ key: "8A", label: "AI被监管" }, { key: "8B", label: "AI自由生长" }] },
    { n: 10, id: "10", options: [{ key: "10A", label: "上传意识" }, { key: "10B", label: "星际殖民" }, { key: "10C", label: "回归土地" }] }
  ];
  const mechanisms = [
    { id: "dark-forest", group: "trisolaran", name: "黑暗森林", note: "暴露位置会增加威胁，交换信息要付出隐匿成本。", before: "人们公开传递位置", after: ["炊烟被盖在石缝里", "驿站只收无名信", "海图抹掉回程港口", "车站熄灯传暗号", "直播先遮掉窗外", "农场灯光朝地底照", "火星只收不发信号", "星际副本隐去坐标"] },
    { id: "science-lock", group: "trisolaran", name: "智子锁死", note: "基础实验无法突破，生活只能靠已有工具重新安排。", before: "实验能验证新知识", after: ["石匠只磨祖传石斧", "工坊照旧配方烧炉", "学会改修旧仪器", "工厂靠调班增产", "实验室改租旧设备", "脑机接口靠旧件修", "火星基地拆件互补", "副本学会补旧协议"] },
    { id: "dimension", group: "trisolaran", name: "降维打击", note: "假设生命能在降维后延续，占用空间成为新的手续。", before: "物件可以上下叠放", after: ["山洞铺不开第二张皮", "仓库不能叠第二袋粮", "船舱只许单层铺货", "工厂通道开始收费", "电梯改作平面走廊", "农场摊开占满街道", "火星舱室排成细线", "副本争一条空白边"] },
    { id: "wall-plan", group: "trisolaran", name: "面壁计划", note: "计划只能藏在心里，执行者必须先为不解释的决定备料。", before: "分工前先公开计划", after: ["石匠接到无图的活", "账房只见领料单", "工坊先造不知用途的轮", "仓库按暗单留煤", "采购表隐藏最终用途", "维修机等不到说明书", "气闸预留无名舱位", "副本只领局部权限"] },
    { id: "tech-burst", group: "trisolaran", name: "技术爆炸", note: "工具更新快过学习周期，刚熟练的手艺又要重新考核。", before: "一门手艺够用许久", after: ["新石斧还没磨就过时", "刻字师傅改学活字", "工坊图纸天天换页", "车间刚装机就搬家", "教程还没看完就下架", "脑机课程按晨晚更新", "火星工具箱每日重配", "副本醒来先补版本"] },
    { id: "suspicion", group: "trisolaran", name: "猜疑链", note: "不能判断对方是否守约，承诺要用可核对的物件作凭据。", before: "交易凭一句约定", after: ["换肉先押半块石斧", "驿站逐封验印", "船队互扣一份货单", "工厂交货先验铅封", "合约截图还要见证人", "配送机交换验收记录", "火星气闸逐人复核", "副本签字先验记忆"] },
    { id: "time-dilation", group: "film", name: "时间膨胀", note: "不同地点的时钟走速不同；早期差速区域是虚构前提。", before: "双方按同一日历办事", after: ["洞里一夜洞外换季", "驿差回来账已过期", "船回港时师傅已换", "列车两端各印时刻表", "通勤一次要补几天班", "探亲先校准两地时钟", "火星账单追不上旅客", "副本按各自时钟排班"] },
    { id: "time-view", group: "film", name: "五维回望", note: "假设旧时刻可以观察但不能修改，证据不再等于补救。", before: "过去只能凭回忆描述", after: ["旧火堆可看不可取暖", "旧契约可见不可重签", "沉船账单还在原处", "错装的齿轮只能重看", "聊天能回看不能撤回", "课堂回放不退课时费", "气闸事故演练无删改", "旧副本拒绝重演道歉"] },
    { id: "wandering-earth", group: "film", name: "地球流浪", note: "假设行星持续迁移，能量供应与居住位置都要重新分配。", before: "居所跟着固定季节安排", after: ["种子跟着暖石搬家", "粮仓先登记保温位", "航海表改查迁移方向", "锅炉优先供迁移站", "工位按供热时段排", "垂直农场兼做暖房", "火星接收迁居行李", "星际住址附移动轨迹"] },
    { id: "simulation", group: "film", name: "虚拟舱", note: "假设体验来自模拟，身体维护和主观生活分别记账。", before: "身体与所见处在同一处", after: ["梦里有肉醒来领水", "虚拟粮票不能喂真马", "画里的航程也收船费", "梦里下班身体仍值守", "房租分身体位和景观", "脑机课堂另收醒来费", "火星风景按带宽供应", "副本要求查看舱外账"] },
    { id: "mars-survival", group: "film", name: "火星求生", note: "采用封闭栖居的资源预算机制，不借用任何人物或情节。", before: "用完物资可以向外补给", after: ["洞里每把柴都记账", "封闭粮仓先留种", "船队把废水留下来", "工厂热气回收进食堂", "住户按维修表分工具", "农场把蒸汽收回水箱", "气闸旁贴每日耗气单", "副本也要交散热预算"] },
    { id: "language-time", group: "film", name: "语言即时间", note: "假设语言会改变主观时间感，不把科幻设定当作事实。", before: "一句话按先后顺序理解", after: ["话未说完就听到告别", "账房先想起还款那天", "船信先读到归港一句", "工人从交班句学开工", "约会先讨论告别那刻", "课程从会忘掉处开讲", "火星家书按思念排页", "副本用回忆安排明天"] }
  ];
  const commonParams = [
    { id: "publicRules", label: "公开执行办法", note: "关掉后，办理办法只由经手人解释。", default: true },
    { id: "sharedCost", label: "共同分担成本", note: "关掉后，各家各户自行准备物资。", default: true },
    { id: "exceptions", label: "保留申请例外", note: "打开后，规则保留一条人工申诉通道。", default: false },
    { id: "review", label: "定期复核规则", note: "关掉后，学习与生活沿用旧办法。", default: true }
  ];
  const THEMES = ["制度", "技术", "文明"];
  // 十格是十个时代的因果动词，不按旧八章下标冒充新年代。
  // 最后一格为上传线；星际线、土地线各有一整组不同后果。
  const content = {
    "no-exam": ["教育", "制度", "拿斧荐人|举荐入坊|作品入署|样张招徒|试件招工|实修招电工|作品招人|实修获岗|修舱留证|副本验作", "交作品", "不问分"],
    "four-hour": ["工作", "制度", "短班守洞|漏尽交班|驿马换班|短班换版|四时停机|电站轮值|消息算工|照护计时|舱务短班|副本共计", "短班学", "对班表"],
    "free-goods": ["经济", "制度", "零价分肉|粮仓排号|市集配额|船货候领|机货排队|灯泡候领|零价候货|打印排队|舱货限领|算力领号", "排器材", "陪取号"],
    "sun-off": ["生存", "技术", "温泉养菌|地热暖仓|浴场分热|暖管进坞|地热推机|地热线供电|暗城省灯|热井养菌|堆灯照舱|算房分热", "借灯学", "留暖位"],
    "science-lock": ["科技", "技术", "磨斧未越限|量尺校准|量器复验|旧镜重磨|隔热增产|电表复校|旧仪复验|旧件修机|拆件修舱|旧算架载忆", "复旧验", "修旧灯"],
    "dark-forest": ["生存", "技术", "盖烟守洞|密封驿袋|烽台遮光|海图匿港|厂灯内照|电波入屏蔽|内网交接|农灯向内|舱讯屏蔽|副本匿址", "遮灯学", "藏门灯"],
    "flat-world": ["未来", "技术", "分路拖肉|单层运粮|街巷错行|书卷铺地|齿轮让道|电线绕路|通道限流|农田摊平|舱道串行|散热占地", "留退路", "留双门"],
    "inherited-memory": ["社会", "文明", "旧水路重验|祖账验田|祖技校量|旧海图复测|旧技校机|祖忆核电压|旧忆验来源|旧技实测|祖图校舱|副本分源", "核旧技", "关旧忆"],
    "fast-time": ["生存", "文明", "成年拆短学|短期交田|匠职早交接|船匠早换班|按体能换岗|电工早交班|短课接岗|生身早换岗|舱务早交接|上传避衰老", "选短课", "约本周"],
    "half-gravity": ["科技", "技术", "拖石加止滑|提桶防回摆|柱石重锚|船吊防横摆|机车补制动|电车延刹距|轻货慢刹|送货补锚|异星另测重|载体另验重", "练刹停", "坐稳聊"],
    "immortality": ["社会", "文明", "老手轮守|田权轮用|元老轮席|行会换席|厂主让班|电台换主播|老岗轮替|长约拆短|舱位轮住|旧忆归档", "换师傅", "续短约"],
    "no-language": ["社会", "文明", "拿实物交换|照实物量田|庭前重演|实模造船|跟手装机|实线验电|实物办事|现场教机|实作开舱|触感辨我", "跟手做", "等靠近"],
    "falling-moon": ["生存", "文明", "随潮搬洞|浮仓避潮|港栈抬高|潮窗出海|浮厂移岸|变电站迁坡|沿岸错峰|浮居维修|月料限取|月材归仓", "学潮尺", "对潮窗"],
    "offline-world": ["科技", "技术", "未联网待机|未联网待机|未联网待机|未联网待机|未联网待机|未联网待机|硬盘运课|离线配送|数据舱送信|副本实物迁", "背课包", "约定点"],
    "talking-plants": ["社会", "文明", "问根验水|问苗留种|根声验渠|苗声验舱|根声测烟|叶声验电灼|根声验土|活株验模型|根声配水|活根分光", "验根土", "让根位"],
    "thirty-years": ["生存", "文明", "成年短学交棒|田契限三十|匠契短交接|船期不跨寿|工位早交棒|电务短任期|短课交接|照护不越寿|航程限寿|上传不续寿", "拆短课", "约当季"],
    "no-borders": ["社会", "制度", "迁洞验地形|驿路验门址|关津免验籍|港口验货址|铁路直通|电网校接口|住址不验籍|设备校接口|舱口验授权|副本验私域", "校门牌", "核来路"],
    "live-exams": ["教育", "制度", "围观成年实作|廊下实操|庭院公验|镜前试作|厂内公考|广播报实操|直播实考|签名录实操|实操封弹幕|副本单独考", "当场做", "考后见"]
  };
  const ruleBefore = {
    "no-exam": "排名先分名额", "four-hour": "活没完不能走", "free-goods": "货物按价拿",
    "sun-off": "白天借日光", "science-lock": "实验能探新原理", "dark-forest": "位置可以公开",
    "flat-world": "道路可以上下交叠", "inherited-memory": "旧技要从头学", "fast-time": "成人慢慢变老",
    "half-gravity": "搬运按旧重量算", "immortality": "旧位自然有人接", "no-language": "办事先讲明白",
    "falling-moon": "海岸住处常年用", "offline-world": "资料沿网络送来", "talking-plants": "根部需求靠猜测",
    "thirty-years": "长约可订到晚年", "no-borders": "过界先查来处", "live-exams": "实作关起门考"
  };
  const ruleCosts = {
    "no-exam": "老师傅推荐的人先到桌边，没熟人的就得把活再做一遍。",
    "four-hour": "工具只一套，前手没放下，后手的四小时已经开始算。",
    "free-goods": "东西不要钱，搬运和等候还占两只手；零元没有多添一条队。",
    "sun-off": "食物由地热养菌兜住，照明另占能量，灯下的位置不跟着免费。",
    "science-lock": "越界试验仍回旧结果，修理工只好在旧零件的接缝处省料。",
    "dark-forest": "门朝外的缝得遮严；能量还能用，漏出去的位置不能撤回。",
    "flat-world": "路不能互相跨过；前车停在窄口，后车没有楼上可以绕。",
    "inherited-memory": "旧记忆带来旧手法，眼前的材料还得亲手试；祖辈不替你上手。",
    "fast-time": "成人身体先赶了十倍路，器材仍走老钟；课程只好拆短。",
    "half-gravity": "东西轻了，惯性没有变小；提得动还得有地方刹停。",
    "immortality": "人不老，住处却不会自己长大；先来的人得腾开用完的桌面。",
    "no-language": "文字、暗号都不管用，只能把实物递到手边重做，沉默不是答应。",
    "falling-moon": "避潮住处人人有份，搬进去的东西仍要有人扛，路不替你抬脚。",
    "offline-world": "远处的数据只能随实物送来；送到之前，工具得先空出位置等它。",
    "talking-plants": "根只报自己脚下的事，远处水管还得另验；一株苗不替整片地作证。",
    "thirty-years": "成人学习得拆成可交接的短段，换壳也不把三十年的限额重新开始算。",
    "no-borders": "过得了旧关口，进私人的门仍须同意；山路和搬运没有跟着消失。",
    "live-exams": "旁观者只能看成年人做活，不能提示，也不拿人气当成绩。"
  };
  const endEffects = {
    "10B": "修舱获岗|航班四时|舱货排号|堆灯养菌|旧机启航|星船静默|平面航道|祖图校星|生身短航|异星测重|殖居轮席|实物领航|带避潮舱|数据舱邮|活根测舱|航程限寿|落点验权|舱内公考".split("|"),
    "10C": "田头验作|农忙短班|谷仓配额|地热养菌|育种守界|地灯遮光|田垄让路|祖农法实测|短季耕作|农具加锚|地权轮耕|实作分田|高地修堤|村口递件|听根验土|短契交田|迁田验权|田头公考".split("|")
  };
  const contentIds = Object.keys(content);
  contentIds.forEach((id, index) => {
    const [group, theme, effects, learn, love] = content[id];
    content[id] = { group, theme, effects: effects.split("|"), learn, love, index };
  });
  // 同步扩展公开机制预览，保留原名称、分类、机制说明。
  const mechanismNewEras = [
    ["烽火台封住朝外的光", "电台天线收进屏蔽室"], ["城邦量器反复校准", "电站反复校验旧电表"],
    ["城门无法跨过运河", "电线不能从街道上空过"], ["石匠只领半张工程单", "电站按暗单留备用线"],
    ["量器未用就换尺寸", "电机刚装好就换接口"], ["商队进城先押货箱", "电话约货另送实物凭据"],
    ["驿差归来已换执政官", "列车时刻按两地钟算"], ["庭上只能重看旧交货", "电站只能重看接错的线"],
    ["城邦热井先保迁居者", "电站先给迁移站供暖"], ["虚拟浴场不抵真柴", "梦里通电不抵实缴电费"],
    ["围城水池按桶回收", "电站废热接入公共浴室"], ["庭辩先听到散场一句", "电话先听到挂断的一刻"]
  ];
  mechanisms.forEach((m, i) => {
    const old = m.after;
    m.after = [old[0], old[1], mechanismNewEras[i][0], old[2], old[3], mechanismNewEras[i][1], old[4], old[5], old[6], old[7]];
  });
  const mechanismVerbs = {
    "dark-forest": "盖烟|封信|遮烽|匿港|熄厂灯|屏电波|遮窗|内照|静讯|藏址",
    "science-lock": "磨旧斧|烧旧方|校量器|修旧镜|改旧机|校电表|修旧仪|补旧件|拆件补|补协议",
    dimension: "平铺兽皮|粮袋摊开|城门排队|单层铺货|通道收费|绕线占街|平面通行|农场摊开|舱排细线|争散热边",
    "wall-plan": "无图备料|暗单领料|半单造渠|盲造船轮|暗单留煤|暗留电线|盲目采购|无图修机|留无名舱|分权领料",
    "tech-burst": "斧样日换|刻刀换代|量器日换|图纸日换|新机日换|接口日换|教程下架|朝夕换课|工具日换|醒来升级",
    suspicion: "押斧换肉|逐信验印|押箱进城|互押货单|验封交货|实物保单|见证签约|互验收货|气闸复核|验忆签约",
    "time-dilation": "洞外换季|账先到期|驿返换官|船返换师|两钟排车|列车校钟|通勤补班|两钟探亲|旅客欠账|异钟排班",
    "time-view": "旧火不暖|旧契不改|旧货重看|沉账重看|错齿重看|错线重看|旧话不撤|回放不退|演练不删|道歉不撤",
    "wandering-earth": "随暖石迁|保温位排队|迁居分热|改航向|迁站先暖|迁站先供电|供热排班|农场兼暖房|迁居配舱|随星搬家",
    simulation: "梦肉不抵水|梦票不喂马|梦浴不抵柴|梦航另付费|梦休身值守|梦电不抵费|另租身体位|醒来另付费|风景限带宽|舱外另算账",
    "mars-survival": "柴火逐把算|粮仓先留种|围城回收水|船上留废水|余热进食堂|余热入浴室|按表分工具|收汽存水|气闸算耗气|算散热额",
    "language-time": "先闻告别|先记还款|先闻散庭|先读归港|交班学开工|先闻挂断|先谈告别|从遗忘开课|按思念排信|按回忆排班"
  };
  Object.keys(mechanismVerbs).forEach((id) => { mechanismVerbs[id] = mechanismVerbs[id].split("|"); });

  const raw = global.WRM_PRESET_BATCHES || [];
  const all = raw.filter((p) => Object.prototype.hasOwnProperty.call(content, p.id)).map((p, i) => {
    const c = content[p.id];
    return Object.assign({}, p, {
      index: p.index == null ? i + 1 : p.index,
      group: c.group, theme: c.theme, title: p.name, premise: p.rule,
      category: c.group, question: "几条规则共用一口锅，谁先交代成本？",
      params: commonParams.map((param) => Object.assign({}, param)),
      assumptions: { tech: true, resources: true, cooperate: true },
      intervention: { era: "primitive", yearLabel: "" }, mechanisms: [],
      eraHooks: ERAS.map((era, j) => ({ era: era.id, world: c.effects[j], personal: c.learn + "；" + c.love })),
      signatureEvents: [1, 5, 10].map((n) => p.id + "-" + n + "-1")
    });
  });
  const ruleMap = new Map(all.map((p) => [p.id, p]));
  const mechanismMap = new Map(mechanisms.map((m) => [m.id, m]));
  const size = (text) => Array.from(text).length;
  const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);

  function byId(id) { return ruleMap.get(id); }
  function eraById(id) { return ERAS.find((e) => e.id === id) || ERAS[0]; }
  function mechanismById(id) { return mechanismMap.get(id); }

  // 四个固定槽位，干预前沿用历史 A；fromN 只续算，不重置已经作出的决定。
  function defaultPath(startEra) {
    return BRANCHES.map((b) => b.id + "A");
  }
  function configurationError(recipe) {
    if (!object(recipe)) return "请提供一份世界规则组合";
    if (!Array.isArray(recipe.rules) || recipe.rules.length < 3 || recipe.rules.length > 18) return "请选择三到十八条内置规则";
    if (new Set(recipe.rules).size !== recipe.rules.length) return "同一条内置规则不能重复选择";
    if (Array.from(recipe.rules).some((id) => !byId(id))) return "有一条内置规则已不可用，请重新选择";
    if (recipe.startEra != null && !ERAS.some((e) => e.id === recipe.startEra)) return "请选择有效的起始时代";
    const assumptions = recipe.assumptions === undefined ? [] : recipe.assumptions;
    if (!Array.isArray(assumptions) || assumptions.length > 3) return "三体与电影机制合计最多选三个";
    if (new Set(assumptions).size !== assumptions.length || Array.from(assumptions).some((id) => !mechanismById(id))) return "机制不可重复，且必须来自机制列表";
    for (const [field, keys] of [["params", commonParams.map((p) => p.id)], ["worldAssumptions", ["tech", "resources", "cooperate"]]]) {
      if (recipe[field] !== undefined && (!object(recipe[field]) || keys.some((key) => recipe[field][key] !== undefined && typeof recipe[field][key] !== "boolean"))) return "参数与世界假设必须使用开关值";
    }
    if (recipe.branchPath !== undefined && (!Array.isArray(recipe.branchPath) || recipe.branchPath.length !== 4 || BRANCHES.some((b, i) => !b.options.some((o) => o.key === recipe.branchPath[i])))) return "四处分叉各需一个有效选项，请按时间顺序保存";
    if (recipe.custom !== undefined) {
      const c = recipe.custom;
      if (!object(c) || typeof c.enabled !== "boolean") return "请明确是否启用自定义附加约束";
      if (c.enabled) {
        if (typeof c.name !== "string" || !c.name.trim() || size(c.name) > 20 || typeof c.description !== "string" || size(c.description) > 120) return "附加约束需要名称（至多20字）和说明（至多120字）";
        if (!Array.isArray(c.params) || c.params.length !== 4 || Array.from(c.params).some((p) => !object(p) || typeof p.key !== "string" || !p.key.trim() || typeof p.label !== "string" || !p.label.trim() || typeof p.value !== "boolean") || new Set(c.params.map((p) => p.key)).size !== 4) return "附加约束需要四个具名、不重复的开关参数";
      }
    }
    // 矛盾不拒收；下游逐项说明约束优先级。
    return "";
  }
  function normalize(recipe) {
    const start = eraById(recipe.startEra).n;
    const path = recipe.branchPath || defaultPath(recipe.startEra);
    return {
      start, selected: all.filter((p) => recipe.rules.includes(p.id)), ids: new Set(recipe.rules),
      params: Object.fromEntries(commonParams.map((p) => [p.id, recipe.params && typeof recipe.params[p.id] === "boolean" ? recipe.params[p.id] : p.default])),
      world: Object.fromEntries(["tech", "resources", "cooperate"].map((key) => [key, !(recipe.worldAssumptions && recipe.worldAssumptions[key] === false)])),
      mechanisms: mechanisms.filter((m) => (recipe.assumptions || []).includes(m.id)),
      path: BRANCHES.map((b, i) => b.n < start ? b.id + "A" : path[i])
    };
  }
  function groupRules(selected) {
    const capacity = [0, 1, 2].map((i) => Math.floor((selected.length + 2 - i) / 3));
    const groups = THEMES.map((theme, i) => selected.filter((p) => p.theme === theme).slice(0, capacity[i]));
    const placed = new Set(groups.flat().map((p) => p.id));
    selected.filter((p) => !placed.has(p.id)).forEach((p) => {
      let target = -1;
      groups.forEach((group, i) => {
        if (group.length < capacity[i] && (target < 0 || group.length < groups[target].length)) target = i;
      });
      groups[target].push(p);
    });
    return groups;
  }

  const scenes = [
    ["洞口", "肉先归熟手", "石斧随手借", "共住不问退路", "肉要在洞口分，背回家的那块也占一双手。", "石斧先在同一截木头上试过，才轮到下个人。", "洞口得留出转身的地，靠近不是挤住退路。"],
    ["粮仓", "粮先归旧户", "量器各用各的", "田契一直续", "仓门只能过一车粮，排在前头不等于有多一张嘴。", "量器放在同一袋谷子旁试，手快不能把容量变大。", "门里有住户，门外有行李；搬来不等于拿走钥匙。"],
    ["城邦", "官署凭门第进", "城门挤车马", "议席不换人", "官道的车抵达城门还得卸货，通行不替人搬石头。", "引水渠要按坡度试流，城邦的新办法也得先过这道窄口。", "庭院留给成年人当面示范，围观的人不能替当事人伸手。"],
    ["船坞", "工坊靠名帖进", "船靠老尺寸造", "长航约不停", "货进船坞还得过窄跳板，先登船的人也不能替旁人点头。", "船模摆到水里试，码头上的尺寸到了海上才知道够不够。", "岸上留一间能独住的屋，远航回来不自动取得那把钥匙。"],
    ["车间", "岗位按旧班分", "机具整批领", "长约套住工位", "车间交接先交出手边的料，空着手也要留下能接班的人。", "零件先在同一台架上试，能动的轮子不保证能停下来。", "下班的人各有一条出厂的路，约好同行也不能锁住另一扇门。"],
    ["变电所", "值班归老师傅", "电压各厂自定", "电话说完算数", "电话能催人到场，配电柜却只能一组人伸手维修。", "电表在同一负载下对照，灯亮了不代表邻厂接口也能接。", "电车有末班，约会得给双方留下各自回住处的车程。"],
    ["街区", "证件先筛人", "设备随时换新", "住址默认相通", "维修窗口一次只接一件实物，手机里的催促不算另一双手。", "工具在同一负载下交接，维修占用的桌面不能同时拿来上课。", "屋门各留一把独立钥匙，一起住不等于随时可以闯进去。"],
    ["住区", "排班由旧岗定", "机器按旧单领", "照护约一直续", "维修和照护争同一个时段，安排服务的人也得把等候算进去。", "设备停下来才能换件，课程里会操作不等于手里已有那件工具。", "成年人把照护和相处分开约，帮过忙也没有下一次的默认许可。"],
    ["轨道站", "舱位归先来者", "备件整舱占位", "长途约不校时", "气闸一次只容一批行李，先到的人也得给回程留出位置。", "备件和口粮争舱位，换下来的旧件还要有人接着运回去。", "探访得算上返程物资，想念不能充进气瓶里替人多留一天。"],
    ["新住地", "资源由旧户续领", "工具按旧额分", "旧关系跟着迁", "新人带来的行李占真实的地方，老住户的习惯不会替它腾位。", "工具和食物都要落到实处，迁了住址也没有多出一双手。", "相处要留下独自离开的通道，搬得再远也不把拒绝搬掉。"]
  ];
  function effectFor(p, era, s) {
    const c = content[p.id];
    let text = c.effects[era.n - 1];
    let learn = c.learn, love = c.love, conflict = false;
    const has = (id) => s.ids.has(id);
    const dormant = p.id === "offline-world" && era.n < 7;
    if (era.n === 10 && endEffects[s.path[3]]) text = endEffects[s.path[3]][c.index];
    const override = (value) => { text = value; conflict = true; };
    if (p.id === "live-exams") {
      if (has("no-exam")) { override("取消考试改展演"); learn = "展实作"; love = "展后见"; }
      else if (has("dark-forest") || s.mechanisms.some((m) => m.id === "dark-forest")) override("黑暗森林限内看");
      else if (has("offline-world") && era.n >= 7) override("全球断网限现场");
    }
    if (p.id === "immortality" && has("thirty-years")) { override("30年压长生"); learn = "短期换岗"; love = "约当季"; }
    if (p.id === "fast-time" && has("immortality")) { override("全民长生压衰老"); learn = "换师傅"; love = "续短约"; }
    if (has("no-language")) {
      if (p.id === "talking-plants") { override("语言消失压话音"); learn = "验叶色"; love = "看根土"; }
      if (p.id === "inherited-memory") { override("语言消失滤字忆"); learn = "练旧手"; }
      if (p.id === "no-exam") { text = "实做招人"; learn = "实做活"; }
      if (p.id === "four-hour") { text = "限时换手"; love = "等换班"; }
      if (p.id === "free-goods") { text = "零价实物排"; love = "陪排队"; }
      if (p.id === "no-borders") { text = "实地验路"; learn = "认实地"; }
      if (p.id === "flat-world" && era.n === 4) text = "实模铺地";
      if (p.id === "offline-world" && !dormant) text = "离线递样";
    }
    if (p.id === "sun-off" && has("talking-plants")) text = "地热灯养根";
    if (p.id === "half-gravity" && era.n >= 9) learn = "重测重力";
    if (dormant) { learn = "现场学"; love = "当面约"; }
    if (p.id === "dark-forest" && s.path[0] === "1B" && era.n === 1) text = "洞口匿踪";
    if (p.id === "four-hour" && s.path[1] === "5B" && era.n === 5) text = "水磨短班";
    if (p.id === "science-lock" && era.n === 5 && s.path[1] === "5B") text = "旧磨增产";
    if (p.id === "fast-time" && era.n === 10 && s.path[3] === "10A" && has("thirty-years") && !has("immortality")) override("30年限上传寿");
    return { p, text, learn, love, conflict, dormant };
  }
  function mechanismFor(m, era, s) {
    if (!m) return null;
    let text = mechanismVerbs[m.id][era.n - 1], conflict = false;
    if (m.id === "tech-burst" && (s.ids.has("science-lock") || s.mechanisms.some((x) => x.id === "science-lock"))) { text = "智子锁死限改装"; conflict = true; }
    if (m.id === "tech-burst" && !s.world.tech) { text = "停积累只换零件"; conflict = true; }
    if (m.id === "language-time" && s.ids.has("no-language")) { text = "语言消失阻预感"; conflict = true; }
    if (s.ids.has("no-language") && ["wall-plan", "suspicion"].includes(m.id)) text = m.id === "wall-plan" ? "盲交实物" : "实物抵押";
    if (era.n === 1 && s.path[0] === "1B" && m.id === "dark-forest") text = "洞口匿踪";
    if (era.n === 1 && s.path[0] === "1B" && m.id === "mars-survival") text = "逐口算水";
    if (era.n >= 5 && s.path[1] === "5B" && m.id === "wall-plan") text = "暗留磨轮";
    if (era.n === 10 && s.path[3] !== "10A" && !conflict) {
      const endings = {
        "dark-forest": ["星船静默", "农灯遮光"], "science-lock": ["旧件修船", "旧具修田"], dimension: ["单层造舱", "田垄让路"],
        "wall-plan": ["暗留空舱", "暗存种子"], "tech-burst": ["舱件日换", "农具日换"], suspicion: ["舱货作押", "种子作押"],
        "time-dilation": ["两钟算航程", "两钟算农时"], "time-view": ["旧航不可改", "旧收成不改"],
        "wandering-earth": ["随星定航线", "暖田随星迁"], simulation: ["梦航另养身", "梦粮不充饥"],
        "mars-survival": ["舱水循环", "田水循环"], "language-time": ["先闻归航", "先闻收割"]
      };
      text = endings[m.id][s.path[3] === "10B" ? 0 : 1];
    }
    if (s.ids.has("no-language") && m.id === "time-view") text = "旧事不改";
    const personal = {
      "dark-forest": "藏灯", "science-lock": "补旧件", dimension: "让窄道", "wall-plan": "盲备料",
      "tech-burst": conflict ? "只改装" : "重学新具", suspicion: "押实物", "time-dilation": "校双钟",
      "time-view": "旧事不改", "wandering-earth": "等暖位", simulation: "另养身体",
      "mars-survival": "留水额", "language-time": conflict ? "预感失效" : "先闻告别"
    }[m.id];
    return { name: m.name, text, personal, conflict };
  }
  function conditions(s, i) {
    const p = s.params, w = s.world;
    if (i === 0) return [p.publicRules ? "公开示范" : "私下示范", p.review ? "到期复核" : "旧例不改"];
    if (i === 1) return [p.sharedCost ? "共筹物料" : "自筹物料", w.resources ? "底料有份" : "缺料候补", w.tech ? "工具可改" : "旧器不换"];
    return [p.exceptions ? "可求特批" : "不许特批", w.cooperate ? "交接互认" : "押物交接"];
  }
  function branchEffects(era, s, i) {
    const words = [];
    if (i === 0) words.push(s.path[0] === "1A" ? "火灶供热" : "无火冷作");
    if (i === 1 && era.n >= 5) words.push(s.path[1] === "5A" ? (s.path[0] === "1B" || s.ids.has("sun-off") ? "地热推汽" : "蒸汽推机") : "水轮替汽");
    if (i === 2 && era.n >= 8) words.push(s.path[2] === "8A" ? (s.world.tech ? "审机才用" : "审机等旧件") : (s.world.tech ? "机器自排" : "放机等旧件"));
    if (era.n === 10) words.push(s.path[3] === "10A" ? "意识上传" : s.path[3] === "10B" ? "装舱殖星" : "留身耕地");
    return words;
  }
  function place(era, s, i) {
    if (era.n === 10) return { "10A": "上传", "10B": "殖星", "10C": "耕地" }[s.path[3]];
    if (i === 0) return s.path[0] === "1A" ? "火灶" : "冷作";
    if (i === 1 && era.n >= 5) return s.path[1] === "5A" ? "汽机" : "水轮";
    if (i === 2 && era.n >= 8) return s.path[2] === "8A" ? "审机" : "放机";
    return scenes[era.n - 1][0];
  }

  // 只在完整规则项、完整句之间换段，不裁字，也不靠省略号吞掉冲突。
  function paragraphs(parts) {
    const lines = [""];
    parts.forEach((part) => {
      const last = lines.length - 1;
      if (size(lines[last] + part) > 76 && lines[last]) lines.push(part);
      else lines[last] += part;
    });
    return lines.join("\n");
  }
  function detail(parts, expansions) {
    let result = paragraphs(parts);
    if (size(result) > 120) throw new Error("本地文案超出120字，请检查组合内容");
    for (const sentence of expansions) {
      if (size(result) >= 80) break;
      const next = paragraphs(parts.concat(sentence));
      if (size(next) <= 120) { parts.push(sentence); result = next; }
    }
    if (size(result) < 80) throw new Error("本地文案不足80字，请检查组合内容");
    return result;
  }
  function worldCard(group, i, era, s, effects, mechanism) {
    const scene = scenes[era.n - 1];
    const active = effects.filter((e) => !e.dormant);
    const lead = active[0] || effects[0];
    const knobs = conditions(s, i);
    const branches = branchEffects(era, s, i);
    const parts = effects.map((e) => e.p.name + (e.dormant ? "尚无网可断" : e.text) + "；");
    // 全组休眠就承接其它组的实物需求，不产出“无事发生”的独立空卡。
    if (!active.length) parts.push("改为共用实物交接台；");
    parts.push(knobs.join("，") + "。");
    if (branches.length) parts.push(branches.join("，") + "。");
    if (mechanism) parts.push(mechanism.name + mechanism.text + "。");
    parts.push(["队还在。", "料没多。", "门各留。"][i]);
    let cost = ruleCosts[lead.p.id];
    if (lead.dormant) cost = "互联网还没出现；先把别组的工具送上实物台，成年人当面接着学。";
    if (lead.p.id === "fast-time" && s.ids.has("immortality")) cost = "长生先截住衰老，旧课仍要为换岗重练；年纪不再替人腾位。";
    if (lead.p.id === "talking-plants" && s.ids.has("no-language")) cost = "话音被失语挡住，只剩叶色与根部变化可验；植物没有因此变成路标。";
    if (lead.p.id === "live-exams" && s.ids.has("no-exam")) cost = "考试名额被取消，围观改成看实作；人气不能替旁人排出高低。";
    const brief = active.length ? active.map((e) => e.conflict ? e.learn : e.text).filter((t) => size(t) <= 6) : ["实物交接"];
    const action = brief[0] || lead.learn;
    const nextAction = brief[1];
    let after = place(era, s, i) + "：" + action;
    if (nextAction && size(after + "、" + nextAction) <= 18) after += "、" + nextAction;
    else if (!nextAction && size(after + "，" + knobs[0]) <= 18) after += "，" + knobs[0];
    const cross = s.selected.find((p) => !group.some((own) => own.id === p.id));
    const crossEffect = effectFor(cross, era, s);
    return {
      theme: THEMES[i], title: s.selected.length === 18 ? THEMES[i] + "过载" : active.length ? lead.p.name : "实物交接台",
      ruleTags: group.map((p) => p.id), before: place(era, s, i) + "前，" + (active.length ? ruleBefore[lead.p.id] : "各组器材各自送"), after,
      why: effects.some((e) => e.conflict) || (mechanism && mechanism.conflict) ? "硬约束先行，余项改道" : !active.length ? "网络未生，先接别组实物" : "几条规则共用一份物料",
      detail: detail(parts, [
        cost,
        scene[i + 4],
        "成年人学艺得" + lead.learn + "，相处时还得" + lead.love + "。",
        "另一头的" + cross.name + "要" + crossEffect.learn + "，共用的器材得错开。"
      ]),
      conflict: effects.some((e) => e.conflict) || !!(mechanism && mechanism.conflict),
      dormant: effects.filter((e) => e.dormant).map((e) => e.p.id), changed: true
    };
  }
  function personalCard(kind, era, s, worldCards, effectGroups, mechanismEffects) {
    const isLove = kind === 1;
    const leads = effectGroups.map((group) => group.find((e) => !e.dormant) || group[0]);
    const actions = leads.map((e) => isLove ? e.love : e.learn);
    const parts = leads.map((e, i) => THEMES[i] + "因" + e.p.name + (e.dormant ? "待机先" : "须") + actions[i] + (mechanismEffects[i] ? "、" + mechanismEffects[i].personal : "") + "；");
    const p = s.params, w = s.world;
    parts.push((p.publicRules ? "公开办" : "私下办") + "，" + (p.sharedCost ? "共备物料" : "自备物料") + "，" + (p.review ? "到期重验" : "旧例不改") + "。");
    if (isLove) parts.push((p.exceptions ? "可申诉改期" : "不特批改期") + "，" + (w.cooperate ? "约定互认" : "交接押物") + "；沉默不算同意。");
    else parts.push((w.tech ? "可换工具" : "只练旧器") + "，" + (w.resources ? "底料有份" : "缺料等候") + (era.n >= 7 ? "，上岗照办。" : "，只谈成年学艺。"));
    const branchWords = [s.path[0] === "1A" ? "轮灶取暖" : "冷磨器材"];
    if (era.n >= 5) branchWords.push(s.path[1] === "5A" ? "等汽机交班" : "等水磨交班");
    if (era.n >= 8) branchWords.push(s.path[2] === "8A" ? "机排须审" : "机自改班");
    if (era.n === 10) branchWords.push(s.path[3] === "10A" ? "副本相认" : s.path[3] === "10B" ? "远航分舱" : "留身种田");
    parts.push(branchWords.join("、") + "。");
    const mechanismSentence = mechanismEffects.filter(Boolean).map((m) => m.text).join("、");
    const personalScene = (isLove
      ? ["洞口约", "仓边约", "泉边约", "归港约", "出厂约", "末班车", "下班约", "照护后", "返舱约"]
      : ["石斧课", "谷斗课", "量尺课", "船模课", "车间课", "电表课", "上岗前", "修机班", "进舱前"])[era.n - 1];
    return {
      theme: isLove ? "恋爱" : "学习", title: isLove ? "恋爱" : era.n >= 7 ? "学习·工作" : "学习",
      ruleTags: s.selected.map((r) => r.id),
      before: isLove ? "两人约好就能相见" : era.n >= 7 ? "学完本领就按旧班上岗" : "成年人跟着老手学艺",
      after: era.n === 10 ? {
        "10A": isLove ? "各存记忆，逐次相认" : "副本共用器材练实作",
        "10B": isLove ? "约好返航，各留船位" : "异星校具，分舱上岗",
        "10C": isLove ? "各留屋门，同种一畦" : "跟手种田，按季交活"
      }[s.path[3]] : personalScene + "：" + actions.join("、"),
      why: isLove ? "三组手续挤进两人日程" : "三组成本落在一双手上",
      detail: detail(parts, [
        isLove ? "靠近得等对方也主动；停在门外，也是一种答复。" : "成年人的练习占真工具，听懂了不等于已经轮到上手。",
        mechanismSentence ? "还得面对" + mechanismSentence + "。" : "另一组用完器材才轮到你，先到不替后到的人答应。",
        scenes[era.n - 1][isLove ? 6 : 5],
        "这次能留下的，是下一回也能自己走开的余地。"
      ]),
      conflict: worldCards.some((c) => c.conflict), dormant: worldCards.flatMap((c) => c.dormant), changed: true
    };
  }

  function resolve(recipe, fromN) {
    const error = configurationError(recipe);
    if (error) throw new Error(error);
    if (recipe.custom && recipe.custom.enabled) throw new Error("自定义是附加约束，须由AI生成；本地组合不会冒充执行");
    if (fromN !== undefined && (!Number.isInteger(fromN) || fromN < 0)) throw new Error("续算章节需为非负整数");
    const s = normalize(recipe), groups = groupRules(s.selected);
    const first = Math.max(s.start, fromN || 1);
    // 先过滤再生成：续算不会读取或修改此前章节。
    return ERAS.filter((era) => era.n >= first).map((era) => {
      const effects = groups.map((group) => group.map((p) => effectFor(p, era, s)));
      const mechs = [0, 1, 2].map((i) => mechanismFor(s.mechanisms[i], era, s));
      const worldCards = groups.map((group, i) => worldCard(group, i, era, s, effects[i], mechs[i]));
      const personalCards = [0, 1].map((kind) => personalCard(kind, era, s, worldCards, effects, mechs));
      const cards = worldCards.concat(personalCards);
      return {
        n: era.n, era: era.id, name: era.name, span: era.span,
        subtitle: era.n === 10 ? { "10A": "换了载体，物料仍要排队", "10B": "船能远行，舱位不会变宽", "10C": "人留在地上，农时不等人" }[s.path[3]] : scenes[era.n - 1][0] + "先把成本摊开",
        personal: personalCards.map((c) => c.after).join("；"), worldCards, personalCards,
        events: cards.map((c, i) => ({
          ev: {
            id: "combo-" + era.n + "-" + (i + 1), title: c.title, yearLabel: era.start, domain: c.theme,
            baseline: c.before, track: i < 3 ? "world" : "personal", hot: false,
            ruleTags: c.ruleTags.slice(), conflict: c.conflict, dormant: c.dormant.slice()
          },
          view: { changed: true, alternate: c.after, why: c.why, detail: c.detail, chain: "", keywords: [], certainty: "假设" }
        })),
        branch: BRANCHES.find((b) => b.n === era.n) || null
      };
    });
  }

  global.WRM_PRESETS = { ERAS, RECAP, all, byId, eraById, mechanisms, mechanismById, commonParams, BRANCHES, defaultPath, configurationError, resolve };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_PRESETS;
})(typeof window !== "undefined" ? window : globalThis);
