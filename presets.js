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

  function effectFor(p, era, s) {
    const c = content[p.id];
    let text = c.effects[era.n - 1];
    let learn = c.learn, love = c.love, conflict = false;
    const has = (id) => s.ids.has(id);
    const ceiling = !s.world.tech || has("science-lock") || s.mechanisms.some((m) => m.id === "science-lock");
    const dormant = p.id === "offline-world" && (era.n < 7 || (ceiling && s.start < 7));
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
  // 技术锁定时不能仅因年份推进而获得新工具。
  function newsroom(era, s) {
    const locked = s.ids.has("science-lock") || s.mechanisms.some((m) => m.id === "science-lock");
    const level = locked || !s.world.tech ? s.start : era.n;
    const stage = level < 2 ? "stone" : level < 5 ? "craft" : level < 6 ? "mill" : level < 8 ? "electric" : level < 9 ? "automated" : "habitat";
    const ending = era.n === 10 ? (level >= 10 ? (s.path[3] === "10C" ? "land" : s.path[3] === "10A" ? "uploaded" : "voyage") : "unavailable") : "";
    return { level, stage, ending, locked, has: (id) => s.ids.has(id),
      silent: s.ids.has("no-language"),
      heat: s.ids.has("sun-off") ? "geothermal" : s.path[0] === "1A" ? "fire" : "cold",
      heatBranch: branchEffects(era, s, 0)[0],
      drive: level >= 5 ? branchEffects(era, s, 1)[0] : "",
      automation: level >= 8 ? branchEffects(era, s, 2)[0] : ""
    };
  }
  function branchEffects(era, s, i) {
    const words = [];
    if (i === 0) words.push(s.path[0] === "1A" ? "火灶供热" : "无火冷作");
    if (i === 1 && era.n >= 5) words.push(s.path[1] === "5A" ? (s.path[0] === "1B" || s.ids.has("sun-off") ? "地热推汽" : "蒸汽推机") : "水轮替汽");
    if (i === 2 && era.n >= 8) words.push(s.path[2] === "8A" ? (s.world.tech ? "审机才用" : "审机等旧件") : (s.world.tech ? "机器自排" : "放机等旧件"));
    if (era.n === 10) words.push(s.path[3] === "10A" ? "意识上传" : s.path[3] === "10B" ? "装舱殖星" : "留身耕地");
    return words;
  }

  function detail(parts) {
    const text = parts.filter(Boolean).join("");
    if (size(text) < 40 || size(text) > 360) throw new Error("新闻详情须为40至360字");
    return text;
  }

  // 后果指纹不含年代装饰、标题或无关配方开关。
  function ruleReport(e, era, s, ctx) {
    const id = e.p.id, h = ctx.has;
    function fact(topic, theme, title, after, why, body, state, keywords = []) {
      return { id, topic, theme, title, before: ruleBefore[id], after, why, body, keywords,
        state, dormant: e.dormant, conflict: e.conflict };
    }
    if (e.dormant) return fact("network-delivery", "通信观察", "断网尚无网可断",
      "互联网尚未出现，无网可断。当面来往照常，本期未省脚程。", "网络尚未进入生活，断网没有执行对象。",
      "全球断网处于休眠：可用工具尚未形成互联网，不能把原有的当面往来算成断网带来的改写。", { network: "absent" });
    const food = h("sun-off") ? "菌食" : ctx.heat === "cold" ? "果干" : ctx.level < 2 ? "烤肉" : ctx.level < 5 ? "熟谷" : "面包";
    const uploaded = ctx.ending === "uploaded";
    const shortSupply = h("four-hour") && h("free-goods");
    const planar = h("flat-world") || s.mechanisms.some((m) => m.id === "dimension");
    const disconnected = h("offline-world") && ctx.level >= 7;
    const field = h("sun-off") ? "菌床" : "农田";
    // 稀疏阶段表只按可用能力取最近一项。指纹记执行办法，不记表下标；
    // 每次更换办法都在正文中说明动作或代价，封顶后自然沿用旧闻。
    function step(entries) {
      for (let n = ctx.level; n >= 1; n--) if (entries[n]) return entries[n];
      throw new Error("缺少可执行的规则阶段：" + id);
    }
    // 第四项是编辑选定的重点，第五项可另写精练事实；不截字，不把文案写进后果指纹。
    function news(topic, theme, why, entry, constraints) {
      return fact(topic, theme, entry[1], entry[2], why, entry[4] || entry[2],
        Object.assign({ method: entry[0] }, constraints), entry[3] || []);
    }
    switch (id) {
      case "no-exam": {
        let entry = step({
          1: ["show-finished-tool", "斧头替人开口", "求职者带石斧当场劈木，考官改看木屑。履历越厚，地上越难扫。", ["履历越厚，地上越难扫"]],
          2: ["shared-apprentice-material", "招徒先发铜料", "作坊供料让成人试做，富家带来的铜也得放下。家底第一次坐了冷板凳。", ["家底第一次坐了冷板凳"]],
          3: ["public-repair-liability", "水渠主持面试", "招工改看修渠，漏处由本人补。推荐人夸了半天，水从他脚边跑了。", ["水从他脚边跑了"]],
          4: ["cross-workshop-reproduction", "师门出了工具箱", "求职者到别坊换工具重做作品，祖师爷的名头跟来了，顺手的锤子没来。", ["顺手的锤子没来"]],
          5: ["production-batch-proof", "精品带不动整批", "工厂连验一批试件才招人，唯一的精品摆在废品中间，像来探亲的。", ["像来探亲的"]],
          6: ["deenergized-safety-practice", "电工面试先断电", "电工断电实修后由旁人复验，录用前最安静的那根线，决定谁留下。", ["最安静的那根线"]],
          7: ["individual-contribution", "合影里找不到作者", "招聘让每人重做合作作品中的一段，负责合影的人终于领到一台相机。", ["负责合影的人"]],
          8: s.path[2] === "8A"
            ? ["audited-human-machine-practice", "面试故意弄坏机器", "人机同场实修，故障时由人接管。机器做对的题，忽然成了人的送命题。", ["人的送命题"]]
            : ["autonomous-line-human-nonstandard", "机器招人补盲区", "AI接管流水线后试配人类搭档，少量非标工序仍招人。人类成了祖传非标零件。", ["祖传非标零件"], "AI接管流水线，少量非标工序仍试配人类搭档。人类成了祖传非标零件。"],
          9: ["isolated-life-support-practice", "空舱先替人试住", ctx.silent
            ? "舱务招人先在隔离空舱修漏，人还站得笔直，压力表已经瘪了。"
            : "舱务招人先在隔离空舱修漏，推荐信还很饱满，压力表已经瘪了。", [ctx.silent ? "人还站得笔直" : "推荐信还很饱满"]],
          10: ["separate-copy-work-proof", "分身挤满面试间", "副本各修载体才获岗，旧作品只验一次。十个自己来了，岗位还是一个。", ["十个自己来了"]]
        });
        if (ctx.ending === "voyage") entry = ["closed-voyage-maintenance", "星船面试断外援", "星船招人先试断补给修循环，熟人都在岸上，关系远得很物理。", ["关系远得很物理"]];
        if (ctx.ending === "land") entry = ["whole-growing-cycle", "面试长出一季", "接手" + field + "要实做一整季，求职者天天来看。面试结果还没长熟。", ["面试结果还没长熟"]];
        return news("hiring", "招工见闻", "取消考试排名，实际贡献仍须核验，岗位不会凭空增加。", entry,
          ctx.ending === "land" ? { cultivation: field } : undefined);
      }
      case "four-hour": {
        let entry = step({
          1: ["relay-guarding", "守洞也得交班", "守洞与采集合计四小时，夜里轮人守。野兽等了一宿，等来三拨新面孔。", ["三拨新面孔"]],
          2: ["continuous-irrigation-relay", "河水留下加班", "灌溉工四小时换手，水闸照开。人都换过一轮，河水还在原岗位。", ["河水还在原岗位"]],
          3: ["travel-service-total", "换马不刷新工时", "驿夫跑腿搬货合计四小时，换马照算。第二匹马刚上岗，人已经下班。", ["第二匹马刚上岗"]],
          4: ["distributed-piecework-total", "门板藏不住工时", "作坊把活送进家里，家中赶工也计四小时。藏得住锤子声，藏不住锤子活。", ["藏不住锤子活"]],
          5: ctx.drive === "水轮替汽"
            ? ["water-mill-relay", "水轮没有下班键", "水磨工四小时换人，河水继续推轮。全厂工龄最长的，一滴也留不住。", ["一滴也留不住"]]
            : [ctx.drive === "蒸汽推机" ? "steam-relay" : "geothermal-relay", "机器续转人先收工", ctx.drive + "不停，工人四小时轮换。厂里最能熬的那个，领的是润滑油。", ["领的是润滑油"]],
          6: ["emergency-relief-reserve", "抢修队自带下一班", "电网抢修先备接替班，四小时就换人。灯还没亮，下一班已经摸黑来了。", ["下一班已经摸黑来了"]],
          7: ctx.silent || disconnected
            ? ["in-person-handover-counted", "热心也占工时", "上门示范计入四小时，接手人赶来时，热心师傅的今日份热心已用完。", ["今日份热心已用完"]]
            : ["after-hours-messages-counted", "收到也是一笔工时", "回复工作消息计入四小时，雇主把碎片时间合账。已读不回终于有了预算依据。", ["已读不回"]],
          8: s.path[2] === "8A"
            ? ["human-approval-counted", "审机器的人先困了", "机器接夜班，人类试机检修合计四小时。监督席空了，机器还在等人夸。", ["机器还在等人夸"]]
            : ["autonomous-output-human-limit", "订单长出第五小时", "AI自行增产，人的纠错仍计四小时。它接了通宵订单，只好自己熬完。", ["只好自己熬完"]],
          9: ["embodied-and-remote-total", "机械手也要打卡", "舱内操控与实修合计四小时。人把活递给自己的机械手，工时绕一圈又回来了。", ["工时绕一圈又回来了"]],
          10: ["all-conscious-copies-total", "分身赶上集体下班", "所有意识副本合计四小时，分身刚坐稳就一起收工。内卷终于卷成了年轮。", ["内卷终于卷成了年轮"]]
        });
        if (ctx.ending === "voyage") entry = ["continuous-voyage-watch", "人下班船继续远行", "星船值守训练合计四小时，换人不停车。下班时，家乡又远了一截。", ["家乡又远了一截"]];
        if (ctx.ending === "land") entry = ["harvest-relay", "收成等下一双手", field + "养护四小时轮班，成熟处交下一班收。人坐下了，丰收还站在地里。", ["丰收还站在地里"]];
        return news("shift-service", "工时快讯", "每人每日生产服务合计四小时，跨雇主与副本计时，基本口粮保留。", entry,
          ctx.ending === "land" ? { cultivation: field } : undefined);
      }
      case "free-goods": {
        let entry = step({
          1: [shortSupply ? "ration-then-no-refill" : "ration-then-surplus", shortSupply ? "零元加餐已领完" : "零元也有最后一份",
            shortSupply ? "免费" + food + "加餐午前领完，四小时后停做，基本口粮留足。下午只剩碗很自由。" : "免费" + food + "先留基本口粮，余量领完等明天。最后一份照旧很有身价。",
            [shortSupply ? "只剩碗很自由" : "最后一份照旧很有身价"]],
          2: ["seed-before-distribution", "明年的饭先别盛", "零价食仓留种后分口粮余量，最饱满的一袋留在仓里，等着生出下一仓。", ["等着生出下一仓"]],
          3: ["durable-goods-return-pool", "免费锄头认得旧主", "零价农具归还前修断柄，下位使用者接过新柄。上一位的力气留在裂缝里。", ["力气留在裂缝里"]],
          4: ["cargo-before-price", "零价货船照旧满载", "零价船货在产地配齐，按舱容装载。货物都白送，船身还是沉了同样深。", ["船身还是沉了同样深"]],
          5: ["material-recovery-before-output", "废料重回老岗位", "零价工厂收回边角料再开工，昨天按废料抬出去的，今天按原料请回来。", ["按原料请回来"]],
          6: ["repair-stock-reserved", "坏灯有了免费邻居", "零价电器先留抢修备件，领灯者发现旁边那箱只修不发，专等大家用坏。", ["专等大家用坏"]],
          7: ["stock-not-orders", "购物车先实现自由", "零价订货按库存每人一份，购物车装了一百件，仓库只回了一件。", ["购物车装了一百件"]],
          8: ["printer-feedstock-loop", "新杯子记得旧杯子", "零价打印机收旧成品再开工。杯子换了造型，昨天的原子今天接着上班。", ["昨天的原子今天接着上班"]],
          9: planar
            ? ["planar-freight-capacity", "免费货物堵成一线", "零价舱货沿平面货道串行，前货不出后货不进。免费午餐堵在免费晚餐前面。", ["免费午餐堵在免费晚餐前面"]]
            : ["orbital-freight-capacity", "零元包邮等轨道", "零价轨道配送先装口粮，额外货等船。价格失重了，包裹还得老实加速。", ["价格失重了"]],
          10: ["basic-compute-before-extra", "肉身下线热还在线", "零价算力先保基本运行，额外副本分余量。肉身下线，散热费没下线。", ["肉身下线，散热费没下线"]]
        });
        if (ctx.ending === "voyage") entry = ["closed-voyage-stock", "退货还得陪它远航", "星船零价物资循环配发，退货也留舱内。买家不想要了，还得陪它飞几光年。", ["还得陪它飞几光年"]];
        if (ctx.ending === "land") entry = ["seed-and-tool-reserve", "免费也得还锄头", "零价收成先留种，农具轮用归还。领走的饭归你，明年的饭还在土里忙。", ["明年的饭还在土里忙"]];
        return news("ration-supply", "物资行情", "商品零价不增加资源，基本口粮优先，余量按人轮候。", entry,
          ctx.level === 1 ? { food, heat: ctx.heat } : undefined);
      }
      case "sun-off": {
        let entry = step({
          1: ["geothermal-rations", "饭有了天还没亮", "太阳熄灭后地热菌毯保温饱，照明另耗能。先学会不饿，再学会摸黑找碗。", ["摸黑找碗"]],
          2: ["shared-heat-ducts", "暖气先走公共沟", "聚居点共挖热沟，先暖住处再暖工坊。匠人下了工，终于比石头暖得快。", ["比石头暖得快"]],
          3: ["cascaded-heat", "澡堂接了菌床的班", "热水先过菌床再进浴池，同一份余热养完饭又暖人，饭比食客先洗澡。", ["饭比食客先洗澡"]],
          5: ["insulation-before-output", "管子比工人先穿棉", "地热工坊包好漏热管才扩产，菌食优先保温。全厂最怕着凉的是管子。", ["最怕着凉的是管子"]],
          6: ["geothermal-electric-light", "暖房也有黑灯时候", "地热电分开供暖照明，暖房住户省下灯额。终于躺在黑暗里过上热日子。", ["躺在黑暗里过上热日子"]],
          8: ["crop-specific-light-pulses", "菜叶领到私人日出", "农机按需给叶片补光，菌床仍住暗处。人类围着菜叶，蹭一次私人日出。", ["私人日出"]],
          9: ["closed-habitat-food-heat", "洗菜水下次还来", "暗舱循环菌食用水和余热，照明另耗能。今天洗菜的水，明天还来认菜。", ["明天还来认菜"]],
          10: ["compute-waste-heat", "思考顺便养晚饭", "算房余热养菌，灯仍另供电。上传者想了一夜，想法没熟，晚饭熟了。", ["想法没熟，晚饭熟了"]]
        });
        if (ctx.ending === "voyage") entry = ["reactor-not-ground-heat", "故乡暖气到此为止", "星船改用堆热养菌，灯另耗能。出发的人搬走家当，暖气得重新认祖宗。", ["暖气得重新认祖宗"]];
        if (ctx.ending === "land") entry = ["heat-well-farming-radius", "田契量到热散为止", "热井周围养菌，热管越远损耗越多。地主摊开田契，热水只认半张。", ["热水只认半张"]];
        return news("heat-food", "能源民生", "虚构前提保住地热与菌食；额外照明必须另付能源。", entry);
      }
      case "science-lock": return news("tool-ceiling", "工场实况", "基础实验只能给旧结果，工程改良不得越过干预时的能力上限。", step({
        1: ["stone-edge-regrinding", "突破只到斧刃为止", "智子锁死后反复磨同种石刃，耐用次数略增。新发现很薄，正好在刃上。", ["新发现很薄"]],
        2: ["standard-measures", "祖传尺子先对答案", "锁死作坊统一量尺沿用旧方，少了错配。祖传的一尺长短，终于吵出了结果。", ["祖传的一尺长短"]],
        3: ["repeatable-batches", "祖方进入稳定发挥", "锁死工坊反复试旧方，剔除坏批次。同一种失败，终于能做得整整齐齐。", ["同一种失败"]],
        4: ["optical-calibration", "望远镜看清了上限", "锁死旧镜校准误差，越界实验仍出旧结果。镜片擦亮后，天花板更清楚了。", ["天花板更清楚了"]],
        5: ["insulation-retrofit", "科学突破留给棉被", "锁死机房只加隔热层省热，旧动力不变。新成果发表在管子外面。", ["发表在管子外面"]],
        6: ["electrical-tolerance", "合格品长得更像了", "锁死电器按已知公差重配，返修减少。流水线的未来，是更整齐的过去。", ["更整齐的过去"]],
        7: ["known-model-revalidation", "旧曲线磨出包浆", "锁死仪器重验旧模型，只修误差。祖传曲线越擦越亮，快有电子包浆了。", ["电子包浆"]],
        8: ["existing-machine-calibration", "AI自信撞上实测", "锁死AI只校准旧工序，越界推算退回实测。它想通了宇宙，仪器没同意。", ["仪器没同意"]],
        9: ["existing-habitat-spares", "旧舱给旧舱续命", "锁死舱站拆同型件互补，新推进原理仍无果。修好的那艘，装着半个邻居。", ["装着半个邻居"]],
        10: ["known-substrate-budget", "祖传算架住满新人", "锁死载体用同型件扩容，容量仍按旧散热算。新人入住，祖传代码又添家口。", ["祖传代码又添家口"]]
      }));
      case "dark-forest": {
        let entry = step({
          1: ctx.heat === "fire"
            ? ["covered-fire", "晚饭把烟也藏起来", "炊火藏进遮蔽处，领食者走近找。饭香到了洞口，烟还在里面憋着。", ["烟还在里面憋着"]]
            : ["concealed-delivery", "整顿饭悄悄发生", "物资藏在遮蔽处，领货人走近取。里面吃完一轮，外面仍像从没开饭。", ["外面仍像从没开饭"]],
          2: ["screened-supply-corridor", "捷径先长出围墙", "隐匿住区补好遮蔽通道才送货。挑夫绕了一路，替自己的影子保住秘密。", ["替自己的影子保住秘密"]],
          4: ["concealed-port-transfer", "接风没有灯会", "船藏进港内遮蔽处才卸货，岸外不亮定位灯。迎宾的人先把热情捂严。", ["先把热情捂严"]],
          6: ctx.silent || disconnected
            ? ["screened-carrier-transfer", "消息自己走进暗处", "资料实物在屏蔽间交接，门外不留提示。传得最远的，是送件人的腿。", ["送件人的腿"]]
            : ["shielded-signal", "喜讯只在屋里响", "通信收进屏蔽区，不向外公开定位。屋里热闹翻天，天上听着全是空房。", ["天上听着全是空房"]],
          8: ["machine-emission-audit", "聪明机器先关炫光", "配送机出厂先查外泄光，导航正常，漂亮灯带全拆。智能的第一课是别显眼。", ["别显眼"]],
          9: ["temporary-heat-storage", "废热暂存没法销账", "隐匿舱暂存废热再找遮蔽处散出。熵在舱里住了几天，开始催房租。", ["熵在舱里住了几天"]],
          10: ["concealed-compute", "亿万分身不挂招牌", "副本算房收住外泄光讯，活动限遮蔽区。里面住着一城自己，外面查无此人。", ["外面查无此人"]]
        });
        if (ctx.ending === "voyage") entry = ["silent-voyage-heat-budget", "到家也不报平安", "星船逐段遮蔽散热，抵达不发定位喜讯。全船安全到站，亲友继续惦记。", ["亲友继续惦记"]];
        if (ctx.ending === "land") entry = ["screened-farm-light", "丰收藏在灯罩里面", "农灯藏进遮蔽农场，收成就近取。山外人看不出好年景，碗里的人知道。", ["碗里的人知道"]];
        return news("location-secrecy", "隐居见闻", "可定位的外泄会招来静默，遮蔽处用能，地热菌食保底。", entry);
      }
      case "flat-world": return news("single-lane-freight", "通行快讯", "厚度归零，不能重叠、翻越或穿过封闭边界。", step({
        1: ["serial-passage", "一人歇脚全队休息", "平面窄口只容逐人搬运，前人坐下歇脚，身后整支队伍获得同款假期。", ["同款假期"]],
        2: ["open-warehouse-mouth", "粮仓留下最后一口", "平面粮仓先清门口再补粮，满仓也留缺口。粮食多到最后，得给粮食留条活路。", ["给粮食留条活路"]],
        3: ["junction-clearance", "路口轮流拥有远方", "平面路口清空才转弯，出城货等入城人走完。两拨人的远方撞在了一处。", ["远方撞在了一处"]],
        5: ["uncrossed-drive-trains", "流水线拆成散步线", "平面传动无法交叉，工序拆开轮流送料。一件货走遍工厂，像串了半天门。", ["像串了半天门"]],
        6: ["noncrossing-wiring", "电线比人更绕远", "平面电线绕旧线、分段接，铺不到头顶。电走得虽快，也得认这份绕路。", ["也得认这份绕路"]],
        8: ["robot-retreat-space", "AI学会倒着让路", "平面送货机先留退让空地，两车相逢各退一步。人工智能终于学会退步。", ["人工智能终于学会退步"]],
        9: ["habitat-outer-edge-expansion", "新邻居挤在地图边", "平面舱沿外缘扩建，通道不能封死。买在正中央的人，离新邻居越来越远。", ["离新邻居越来越远"]],
        10: ["supply-openings-before-housing", "户型越封闭越挨饿", "平面住宅先开补给口再入住。最有私密感的全封闭户型，连晚饭也挡在外面。", ["连晚饭也挡在外面"]]
      }));
      case "inherited-memory": {
        const entry = step({
          1: ["material-retrial", "祖辈会做石头未必", "祖传斧技换眼前石料重做一遍，手很熟，崩掉的缺口很新。", ["崩掉的缺口很新"]],
          2: ["watercourse-recheck", "祖先记住了旧河道", "沿祖忆重找水路，河已改弯。人继承了祖先的记性，水没继承祖先的路线。", ["水没继承祖先的路线"]],
          3: ["conflicting-perspectives", "祖辈各站各的那边", "两家祖忆为同次交货争执，实物重验。隔了几代人，视角仍隔着一张桌。", ["视角仍隔着一张桌"]],
          5: ["motor-memory-machine-safety", "祖传手势先停机试", "祖传动作先在停机处试，才接新工序。熟练的手伸过去，祖先没见过这齿轮。", ["祖先没见过这齿轮"]],
          6: ["voltage-requalification", "祖传电工认新电压", "祖传电工手法先验眼前电压。手记得每个接头，电流却像个陌生亲戚。", ["陌生亲戚"]],
          7: ["source-context-reconstruction", "经验附带停产世界", "祖忆旧招先还原当年材料再试。经验没过期，配套的世界停产了。", ["配套的世界停产了"]],
          8: ["machine-demonstration-scope", "AI只继承工作部分", "祖传动作按工序教给AI，家事留在人脑。机器学会祖传手艺，没学会祖传恩怨。", ["没学会祖传恩怨"]],
          9: ["airlock-practice-on-empty-door", "祖传开门先认舱门", "旧开门手法在隔离空舱重试。手指想起老家，门外已经换成真空。", ["门外已经换成真空"]],
          10: ["parallel-inheritance-reconciliation", "祖传经验分头翻车", "矛盾祖忆分开实做，失败也留档。同一家祖传秘方，终于凑齐了反例。", ["终于凑齐了反例"]]
        });
        if (ctx.silent) entry[2] = "祖忆词句失效。" + entry[2];
        return news("inherited-skill", "手艺消息", "只继承祖辈成年记忆的原主视角，不随现实更新；失语时词句失效。", entry,
          { inheritance: ctx.silent ? "motor-only" : "perspective-bound" });
      }
      case "fast-time": {
        const arrested = h("immortality"), capped = h("thirty-years");
        let entry;
        if (arrested) entry = capped
          ? ["arrested-with-hard-cap", "不老也到交班时候", "长生止住十倍衰老，三十年硬限仍交班。脸还年轻，工具已认下位主人。", ["工具已认下位主人"]]
          : ["arrested-aging", "人没老锤子先退休", "长生止住十倍衰老，工位一直有人。锤子换了几把，师傅还是那张脸。", ["师傅还是那张脸"]];
        else if (uploaded) entry = capped
          ? ["uploaded-with-hard-cap", "换壳没刷新生日", "上传避开衰老，三十年仍从原日起算。新载体刚拆封，生日已经用了多年。", ["生日已经用了多年"]]
          : ["nonbiological-external-clock", "人已上传货仍龟速", "上传避开身体衰老，外界生产仍走原钟。思想一日千里，快递一天三站。", ["思想一日千里，快递一天三站"]];
        else {
          entry = step({
            1: ["short-adult-apprenticeship", "斧头慢慢人匆匆", "十倍衰老的成人先学短活好交接。手上的石头仍慢慢磨，一点不赶岁数。", ["一点不赶岁数"]],
            3: ["successor-alongside-master", "开工先带接班人", "十倍衰老让工匠一开工就带接任者。一件器物没做好，师徒已商量谁收尾。", ["一件器物没做好"]],
            5: ["strength-based-task-transfer", "人换轻活机器不换", "十倍衰老者按体能转交重活，机器照原速转。工厂最慢变老的，竟是旧设备。", ["竟是旧设备"]],
            7: ["short-modular-work", "项目被拆成年轮", ctx.silent
              ? "十倍衰老把长活拆短交付，工具接着用。工件还透着新，人已换过一班。"
              : "十倍衰老把长项目拆短交付，工具接着用。文件夹还叫新建，人已换过一班。", [ctx.silent ? "工件还透着新" : "文件夹还叫新建"]],
            8: ["assistive-not-rejuvenating", "外骨骼年轻本人照旧", "十倍衰老者借助力设备交活，定期重验体能。外骨骼满电，生日照常累加。", ["外骨骼满电，生日照常累加"]],
            9: ["habitat-procedures-before-decline", "舱门慢得像老朋友", "十倍衰老者早教舱务，接任者独立重做。人赶着交班，舱门还在慢慢自检。", ["舱门还在慢慢自检"]]
          });
          if (ctx.ending === "voyage") entry = ["short-biological-watch", "年龄先抵达下一站", "船员按体能早换岗，航程仍走原速。年纪跑到了前面，飞船还在后面追。", ["飞船还在后面追"]];
          if (ctx.ending === "land") entry = ["short-season-handover", "人换了季节还没换", "十倍衰老者分段交接" + field + "养护。接任者已来，收成仍按自己的岁数长。", ["按自己的岁数长"]];
          if (capped) entry = [entry[0] + "-hard-cap", entry[1], entry[2] + "寿限仍三十年。", entry[3]];
        }
        return news("career-duration", "用工观察", "只加速身体衰老；长生先阻断衰老，三十年硬上限不被豁免。", entry,
          !arrested && ctx.ending === "land" ? { cultivation: field } : undefined);
      }
      case "half-gravity": {
        let entry = step({
          1: ["manual-braking-space", "石头轻了脾气没减", "重力减半，搬石仍留刹停距离。抬时像小石头，停时想起它原来多大。", ["想起它原来多大"]],
          2: ["bucket-swing-restraint", "省下力气用来扶桶", "轻桶运水改两侧稳扶，提力省了，横摆照旧。人省了一半力，水泼得很完整。", ["水泼得很完整"]],
          3: ["anchored-buildings", "房子轻得不太踏实", "减重建筑加锚抗横推，抬石容易，固定费劲。风吹过来，屋主又想念重量。", ["屋主又想念重量"]],
          5: ["traction-before-load", "车好拉了也难留了", "轻机车先试附着制动再装货。搬运工省下的力，刹车工全接过去了。", ["刹车工全接过去了"]],
          6: planar
            ? ["planar-cart-inertial-load", "平面货车仍怕急停", "减重平面货车按启停负荷载人。秤只来了半份，惯性一个也没缺席。", ["惯性一个也没缺席"]]
            : ["lift-inertial-load", "电梯不信体重秤", "减重电梯按启停负荷载人。秤只来了半份，惯性一个也没缺席。", ["惯性一个也没缺席"]],
          8: ["robot-braking-calibration", "AI重新学会站住", "配送机按质量重调制动，抓取省力，急停留空间。它轻轻拿起，郑重其事地停下。", ["郑重其事地停下"]],
          9: ["near-earth-docking", "货舱轻轻撞得很重", "近地货舱对接先留缓冲行程，冲击按质量算。货单写轻货，舱壁谢绝轻信。", ["舱壁谢绝轻信"]],
          10: ["physical-carrier-braking", "灵魂搬家还带刹车", "副本搬载体仍按质量制动。住户已摆脱肉身，搬家车还在替灵魂踩刹车。", ["替灵魂踩刹车"]]
        });
        if (ctx.ending === "voyage") entry = ["remeasure-off-earth", "地球优惠到站失效", "异星卸货先测当地重力，地球减半不外带。老搬运工落地，重新认识自己的箱子。", ["重新认识自己的箱子"]];
        if (ctx.ending === "land") entry = ["anchored-farm-tools", "轻农具还要沉住气", "减重农具加锚后试牵引，搬得轻巧，抓地不足。农人把省下的重量又请了回来。", ["把省下的重量又请了回来"]];
        return news("freight-braking", "搬运提醒", "只减地表及近地重力，质量、惯性与空气阻力不变。", entry);
      }
      case "immortality": {
        if (h("thirty-years")) return news("housing-turnover", "长生见闻", "三十年硬上限优先，长生只保留此前的不衰老。",
          ["thirty-year-cap", "长生住客也有末期", "长生保住年轻，三十年硬上限仍须交房。皱纹没来，住期先到了。", ["皱纹没来，住期先到了"]]);
        let entry = step({
          1: ["rotating-shelter", "长生者拎包换洞", "长生者公共住处轮住，洞口磨光了好几轮，搬出去的还是最早那位。", ["还是最早那位"]],
          2: ["land-use-renewal", "祖先也来等分田", "长生村落分期轮用田地，后人等分田，祖先在旁边等同一块。", ["祖先在旁边等同一块"]],
          3: ["fixed-public-tenure", "元老站在新席后面", "长生议事者到期换席，资历留身上。坐垫换了主人，靠背还认得旧人。", ["靠背还认得旧人"]],
          5: ["workshop-use-rotation", "师傅亲眼看传承", "长生工坊轮用设备，徒弟终于接过机位。祖师爷本人站旁边，看祖传手艺走样。", ["祖师爷本人站旁边"]],
          7: ["finite-memory-curation", "旧事搬进外置人生", "长生者把旧忆外存，脑内留常用部分。重逢时先找备份，想你也得读盘。", ["想你也得读盘"]],
          8: ["consensual-memory-selection", "撤回人生先做考古", "长生者让AI整理旧忆，删黑历史仍由本人确认。人生太长，连撤回都要考古。", ["连撤回都要考古"], "AI整理长生者旧忆，删黑历史须本人确认。连撤回都要考古。"],
          9: ["repair-time-rescue", "不死的人等修很久", "长生舱员受损后先救出慢修，待修之处逐个修补。永生者终于嫌时间太多。", ["终于嫌时间太多"]],
          10: ["external-memory-replaceable-substrate", "忒修斯还记得旧账", "长生副本外存旧忆、轮换加载，载体逐件替换。零件换完，人还在还旧账。", ["零件换完，人还在还旧账"]]
        });
        if (ctx.ending === "voyage") entry = ["finite-voyage-berths", "永生乘客轮着靠窗", "长生船员轮住舱位，殖居扩补给才接新人。余生无限，靠窗的余位没有。", ["余生无限，靠窗的余位没有"]];
        if (ctx.ending === "land") entry = ["soil-rest-before-tenure", "田比本人先退休", "长生农人轮用田块留足休耕。农人活力依旧，土地先申请歇一季。", ["土地先申请歇一季"]];
        return news("housing-turnover", "住处消息", "不衰老不死亡，损伤慢修；记忆容量、空间与物资不会随寿命增加。", entry);
      }
      case "no-language": return news("physical-consent", "无声现场", "文字、词语、暗号均失效，直接观察模仿不等于约定符号。", step({
        1: ["direct-exchange", "实物代替三寸舌", "失语双方带实物当面试做，想换斧头的人先劈木。木头成了最忙的介绍人。", ["木头成了最忙的介绍人"]],
        2: ["full-size-land-demonstration", "量田顺便走完全田", "失语双方带量具沿真田界走一遍。小块地好商量，大块地费鞋底。", ["大块地费鞋底"]],
        3: ["in-person-reenactment", "争执改成重做一遍", "失语争议靠原物旁重演，只看结果。双方没争出一句话，倒修好了半张桌。", ["倒修好了半张桌"]],
        5: ["hands-on-assembly", "老师傅变活说明书", "失语装配由熟手带做，接手者独做复验，暗号无效。说明书本人也会腿酸。", ["说明书本人"]],
        6: ["isolated-electrical-demonstration", "电路等双手想明白", "失语电工在隔离实线上示范复验。线路全接好了，还得等第二双手想明白。", ["第二双手想明白"]],
        8: ["machine-imitation-only", "AI先当无声学徒", "失语者让机器模仿实作，再验实物。最会接话的AI，改行接师傅手里的活。", ["改行接师傅手里的活"]],
        9: ["airlock-physical-interlock", "舱门等本人演示", "失语舱门隔开危险段，当面实作核对。赶路的人带着全套动作到场。", ["带着全套动作到场"]],
        10: ["embodied-consent", "替身递不出一句准话", "失语者亲自在实物前尝试或退出，替身不代授权。分身遍地，本人还得跑腿。", ["分身遍地，本人还得跑腿"]]
      }));
      case "falling-moon": {
        let entry = step({
          1: ["tidal-window", "新房等海交出道路", "月落扰潮，安全住处全员有份，行李等潮窗。房东交了房，海还没交路。", ["海还没交路"]],
          2: ["split-shelter-stocks", "两岸都有备用晚饭", "避潮口粮分存两岸，断路时就地吃。人过不去，晚饭早就替人过来了。", ["晚饭早就替人过来了"]],
          4: ["return-window-before-departure", "返程先向海借时间", "港口先留返程潮窗再放船，误期留安全区。满船货物，得等海腾出空闲。", ["等海腾出空闲"]],
          5: ["relocatable-workshops", "厂址跟着工具搬", "沿岸工位改可拆，潮来撤设备，人住安全区。厂房还在原地，工作已经搬走。", ["工作已经搬走"]],
          7: ["local-tide-recheck", "海把旧潮表撤回了", "避潮路开放前重测水位，旧潮表作废。海每次改主意，都忘了通知日历。", ["忘了通知日历"]],
          8: ["uncrewed-shelter-repair", "机器回来先洗咸味", "机器趁潮窗补外墙，人留安全区复验。AI接了人类的班，先学会洗掉一身盐。", ["洗掉一身盐"]],
          9: ["independent-emergency-cells", "安全舱各有小天地", "避难单元分段独立，一舱检修不借邻舱保障。邻居装修，终于只烦邻居。", ["终于只烦邻居"]],
          10: ["protected-carrier-relocation", "灵魂搬家先防水", "上传载体迁入避潮舱，外设趁潮窗维护。灵魂摆脱了身体，仍怕插座进水。", ["仍怕插座进水"]]
        });
        if (ctx.ending === "voyage") entry = ["tidal-launch-supply", "银河很远海岸很近", "星船补给在安全区集齐，趁潮窗转运。目的地在银河，发货先看门口水位。", ["发货先看门口水位"]];
        if (ctx.ending === "land") entry = ["safe-upland-cultivation", "潮汐替农人定闹钟", "农人住安全区，趁潮窗分段养田。地契写着自己的名，出勤听海的。", ["出勤听海的"]];
        return news("tidal-access", "海边来信", "月球缓慢下坠扰乱潮汐；可循环修复的避难区始终保障全员安全。", entry);
      }
      case "offline-world": {
        let entry = step({
          7: ctx.silent
            ? ["physical-demonstration", "新手艺背着样品来", "断网失语后样品随人送来实作。手艺还没到，传手艺的人先磨破了鞋。", ["先磨破了鞋"]]
            : ["storage-carrier", "更新正在等红灯", "断网资料随存储件运来，未到先用旧版。知识更新的瓶颈，卡在一个红灯上。", ["卡在一个红灯上"]],
          8: ctx.silent
            ? ["offline-machine-demonstration", "机器见面拜个师", "断网失语，单机带实物当面示范，学会才分开。AI拜师也得带点真东西。", ["AI拜师也得带点真东西"]]
            : ["offline-machine-version-handoff", "人工智能学会走亲戚", "断网配送机背存储件回站碰头同步知识，版本不合就地复验。人工智能重新学会走亲戚。", ["人工智能重新学会走亲戚"], "断网配送机回站交换存储件、复验版本。人工智能重新学会走亲戚。"],
          9: ctx.silent
            ? ["habitat-demonstrator-freight", "手艺买了张货运票", "断网失语，跨舱工序随示范者和实物运输。手艺占着舱位，睡在行李旁边。", ["手艺占着舱位"]]
            : ["data-cargo-with-local-authority", "总部回复晚于补丁", "断网舱站随货运存储件，故障本地先修。总部的好办法赶到，漏口已长出补丁。", ["漏口已长出补丁"]],
          10: ctx.silent
            ? ["embodied-offline-migration", "本人整机到货", "断网失语，迁居者带运行载体亲到场。灵魂忙着搬家，搬运者抱紧外壳。", ["灵魂忙着搬家"]]
            : ["offline-personal-carrier-migration", "人格按件走物流", "断网副本运载体迁居，途中另留运行能源。本人正在想家，家在下一站卸货。", ["家在下一站卸货"]]
        });
        if (ctx.ending === "voyage") entry = ctx.silent
          ? ["voyage-demonstration-cargo", "两船会面交换手艺", "断网失语，星船相会带实物互做示范。两船刚学会同一招，又各奔几光年。", ["又各奔几光年"]]
          : ["voyage-storage-mail", "热搜送成了考古", "断网星船互送存储件，消息按出发时核验。热搜抵达时，已归考古栏目。", ["已归考古栏目"]];
        if (ctx.ending === "land") entry = ctx.silent
          ? ["farm-demonstration-visits", "教种地顺便走亲戚", "断网失语，邻村带农具到田里同做新活。人来一趟，新手艺沾两村泥。", ["新手艺沾两村泥"]]
          : ["village-storage-circuit", "村口长出离线缓存", "断网村落随农具巡回存储件，坏件带回重送。最新知识进村时，带着一身土。", ["带着一身土"]];
        return news("network-delivery", "通信快讯", "单机照用，远距网络停用；文字也失效时只能带实物直接示范。", entry);
      }
      case "talking-plants": {
        if (ctx.silent) return news("root-irrigation", "草木消息", "语言消失优先，植物话音不能变成暗号。",
          ["speech-blocked", "根部热线一起失声", "植物话音失效，人仍摸根土看叶色。根部热线停了，蹲下去的人又多了。", ["根部热线停了"]]);
        let entry = step({
          1: ["local-root-water", "一株草只管一株渴", "植物只报自己缺水，邻地另查。人蹲下问了一圈，草还没聊完。", ["草还没聊完"]],
          2: ["irrigation-by-root-reach", "大嗓门没多领水", "会说话的苗逐株报渴，按根区分水。那株最能说的，分到的仍是一株的份。", ["仍是一株的份"]],
          4: ["living-cargo-care", "船货先嫌旅途干燥", "船上活苗报干燥，逐盆验后浇水。货还没到岸，旅途意见已经长了一船。", ["旅途意见已经长了一船"]],
          5: ["smoke-source-testing", "树有委屈没有烟囱图", "厂边树报叶片不适，人去实测烟源。树知道难受，哪根烟囱仍得人找。", ["哪根烟囱仍得人找"]],
          7: ["sensors-crosscheck-plants", "盆栽纠正了传感器", "浇水前对照传感器与本株感受。仪器显示舒适，盆栽当场表达了不同意见。", ["盆栽当场表达了不同意见"]],
          8: ["living-plant-model-validation", "AI被盆栽打回重学", "AI用活株感受重验养护模型，预测全绿，盆栽喊渴。训练集就在窗台上反驳它。", ["训练集就在窗台上反驳它"]],
          9: ["closed-root-water-budget", "一舱植物分一桶水", "舱内按活根需求重分循环水。大家都开了口，那桶水还是原来那桶。", ["那桶水还是原来那桶"]],
          10: ["simulated-forest-not-evidence", "虚拟森林先别喝彩", "上传者浇水仍问实体活根。虚拟森林一片叫好，窗外那株正渴着。", ["窗外那株正渴着"]]
        });
        if (h("sun-off")) entry = step({
          1: ["light-deficit", "草木学会说缺太阳", "太阳熄灭，植物报缺光，补光仍须能源。大家听懂了，天还是原来那么黑。", ["天还是原来那么黑"]],
          6: ["plant-light-metering", "叶片各领一份日出", "暗城逐株问感受、验叶片后分灯。每片叶子都想早起，电站只好另算。", ["每片叶子都想早起"]],
          8: ["adaptive-root-light-budget", "种植面积跟着灯缩", "AI按活株感受调灯，能耗超额就缩种植面。菜园越种越精，空地越来越懂事。", ["空地越来越懂事"]],
          9: ["closed-light-water-allocation", "植物的日出循环用", "暗舱按根需分水分灯，余热回收。叶片晒过的那点暖，转身又去忙别的。", ["转身又去忙别的"]],
          10: ["real-roots-compute-light-budget", "脑子和菜分同一盏光", "算房与实体植物补光共算能源。上传者想多思考一会，菜叶先少晒一会。", ["菜叶先少晒一会"]]
        });
        if (ctx.ending === "voyage") entry = ["ship-root-life-support", "树做随船环境顾问", "星船逐舱问根并实测水光，调整循环。顾问根扎在盆里，出差全靠别人抱。", ["出差全靠别人抱"]];
        if (ctx.ending === "land") entry = ["root-by-root-restoration", "荒地恢复听不到全票", "逐株问根再验土，枯地另取样。最健谈那株聊了半天，荒地仍是一片沉默。", ["荒地仍是一片沉默"]];
        return news("root-irrigation", "灌溉消息", "植物只知自身感受，不能移动或代远处作证；水与补光仍耗资源。", entry);
      }
      case "thirty-years": {
        let entry = step({
          1: ["adult-short-handover", "斧头比任期长", "三十年寿限内做完活，工具传下去。石斧越磨越顺手，学会认不同的手。", ["学会认不同的手"]],
          2: ["land-contract-within-life", "田契长不过生日", "养田约止于本人三十岁前，后人重新实做。地没挪窝，田契换了好几张脸。", ["田契换了好几张脸"]],
          4: ["return-before-cap", "远行先把归期装好", "三十年寿限下先留回程时间再远行。行囊还空着，归期已占了大半。", ["归期已占了大半"]],
          5: ["asset-not-person-handover", "老机器认识新人", "三十年寿限下机器分段交给新人。开机动作代代相传，手柄越用越认生。", ["手柄越用越认生"]],
          7: ["service-not-identity-transfer", "长期服务换了头像", "照护与工作三十岁前结清，新人另立关系。服务还在续，熟悉的头像停在上一页。", ["头像停在上一页"]],
          8: ["nonpersonal-care-tools", "AI留下动作没留人", "寿限前照护工具交新人，AI仅接工序。它学会那套动作，做的人已经换了。", ["它学会那套动作"]],
          9: ["habitat-mission-cutoff", "舱站修了几任人生", "舱务按三十年限分段，新人重验接手。那道老焊缝，见过几任年轻面孔。", ["那道老焊缝"]],
          10: ["uploaded-clock-not-reset", "出厂日期骗不过寿限", "上传副本仍从原日起算三十年，只传非人格资料。机壳全新，剩余岁数照旧。", ["机壳全新，剩余岁数照旧"]]
        });
        if (ctx.ending === "voyage") entry = ["voyage-within-life", "星图先折去太远那边", "个人航程要在三十岁前完成，超期不出发。星图摊得很大，能用的只剩一角。", ["能用的只剩一角"]];
        if (ctx.ending === "land") entry = ["seed-not-person-inheritance", "种子接住下一季", "三十年寿限前交田务，种子农具留后来者。来年长出的那垄，认土不认旧主人。", ["认土不认旧主人"]];
        return news("contract-horizon", "短生札记", "三十年硬上限优先于长生；换身体、载体或住处都不重新计时。", entry);
      }
      case "no-borders": {
        let entry = step({
          1: ["terrain-and-private-consent", "山没跟国界搬走", "迁居免查国籍，私宅仍问主人。大地忽然宽了许多，别人家门还是那么窄。", ["别人家门还是那么窄"]],
          2: ["road-not-door-right", "天下可走卧室免谈", "无国界驿路共修，私门另征同意。商旅走了千里，最后几步仍被主人拦住。", ["最后几步"]],
          4: ["port-physical-compatibility", "浅滩仍在办理拒绝", "无国界船队验吃水泊位后入港。关口撤了，浅滩照旧让大船在外面等。", ["浅滩照旧让大船在外面等"]],
          5: ["rail-gauge-transfer", "车轮还保留老国籍", "无国界铁路遇异轨仍换装。旅客一路通行，车轮还坚持祖传尺寸。", ["祖传尺寸"]],
          6: ["power-interface-conversion", "电压比邻居认生", "无国界电网先匹配电压再接通。邻居都混熟了，插头仍需要介绍人。", ["插头仍需要介绍人"]],
          8: ["robot-access-consent", "AI周游到家门口", "配送机跨区后验接口，私宅等本人准入。它走遍世界，最后停在一张门垫前。", ["最后停在一张门垫前"]],
          9: ["airlock-pressure-compatibility", "真空还坚持边界", "舱站核对气压与私域准入才接驳。人类拆掉国界，真空把门关得更严。", ["真空把门关得更严"]],
          10: ["private-memory-boundary", "脑内还有最后一道门", "上传迁居免国籍核验，进他人记忆仍征同意。一路畅通，到旧情旧事前停住。", ["到旧情旧事前停住"]]
        });
        if (ctx.ending === "voyage") entry = ["landing-site-consent", "星际自由停在院外", "星际落点先验环境与私人准入。飞过几光年的人，在别人院外等开门。", ["在别人院外等开门"]];
        if (ctx.ending === "land") entry = ["shared-water-private-land", "河水没多出新户口", "无国界农人共修水路，进田问使用者。住户搬来一批，河还是原来那条。", ["河还是原来那条"]];
        if (ctx.silent) entry = [entry[0] + "-direct", entry[1], entry[2] + "失语当面实作核对。", entry[3]];
        return news("migration-access", "远行见闻", "撤掉国界限制，不撤地形、工具接口和私人空间；准入不能代办。", entry);
      }
      case "live-exams": {
        const canceled = h("no-exam"), hidden = h("dark-forest") || s.mechanisms.some((m) => m.id === "dark-forest");
        const channel = hidden ? "enclosed" : ctx.silent || disconnected || ctx.level < 7 ? "onsite" : "broadcast";
        const venue = channel === "enclosed" ? "遮蔽场内" : channel === "onsite" ? "现场" : "直播中";
        let entry = step({
          1: ["hands-visible", "手艺藏不住双手", "双手全程做出实物。看客满腹高招，全憋在肚里。", ["全憋在肚里"]],
          3: ["spectator-separation", "高手退到伸手不及", "观众退到够不着工具处。热心高手忽然只剩眼神。", ["只剩眼神"]],
          5: ["machine-safety-separation", "观众与齿轮保持距离", "隔开观众与机器独做。热情止于围栏，齿轮照转。", ["热情止于围栏"]],
          7: ["unbroken-process", "手艺没有剪辑版", "从取料到成品连续展示。漂亮成品的狼狈过程全在。", ["狼狈过程全在"]],
          8: ["human-machine-contribution", "AI和主人分开亮相", "人与机器各自重做。机器做得越好，主人越难借光。", ["主人越难借光"]],
          9: ["safe-empty-chamber", "空舱先当挑剔观众", "空舱重做修漏。看客很热情，压力表很冷淡。", ["压力表很冷淡"]],
          10: ["single-copy-performance", "分身挤满观众席", "同一副本全程做完。其他自己坐旁边，干着同一份急。", ["干着同一份急"]]
        });
        if (ctx.ending === "voyage") entry = ["ship-isolated-drill", "演练舱先替真船漏", "在隔离舱操作，不接住舱实管。真船乘客安心看热闹。", ["安心看热闹"]];
        if (ctx.ending === "land") entry = ["farm-process-demonstration", "观众跟着等收成", "田头展示养护到收获。果子没熟，观众先晒熟了。", ["观众先晒熟了"]];
        if (ctx.ending === "land" && h("sun-off")) entry = ["farm-process-demonstration", "观众跟着等收成", "田头展示养护到收获。菌床还没长好，看客先饿了。", ["看客先饿了"]];
        return news("public-assessment", "实作消息",
          canceled ? "取消考试优先，只展实作不排录用名次，观众不得提示。" : "只核验成年人的当场实作，观众不得提示或参与评定。",
          [entry[0], entry[1], (canceled ? "不评分展演，" : "技能公考，") + venue + entry[2], entry[3]],
          { assessment: canceled ? "exhibition" : "exam", channel,
            ...(ctx.ending === "land" ? { cultivation: field } : {}) });
      }
    }
    throw new Error("缺少规则新闻：" + id);
  }

  function mechanismReport(m, era, s, ctx) {
    if (!m) return null;
    const effect = mechanismFor(m, era, s);
    const entry = {
      "dark-forest": ["concealed", "外泄位置会招来静默，本次交付转入遮蔽处。"],
      "science-lock": ["known-tools", "基础实验被锁住，本次只能用已验证的工具。"],
      dimension: ["single-layer", "物品不能叠放，领取者须先腾出平面再接货。"],
      "wall-plan": ["purpose-withheld", ctx.silent ? "计划藏在心里，执行者只见待用实物，须另留备料。" : "用途不向执行者公开，备料者须给未知工序留余量。"],
      "tech-burst": [effect.conflict ? "retrofit-only" : "rapid-replacement", effect.conflict ? "工具更新受上限限制，只能换已验证的部件。" : "工具刚练熟就换版，交活前须重做操作示范。"],
      suspicion: ["collateral", "对方是否守约无法确认，交付前须押实物作保。"],
      "time-dilation": ["two-clocks", "两地钟速不同，领取期限须按交付地的钟重算。"],
      "time-view": ["observe-not-repair", "旧交付可以回看但不能改，领错的物资仍须重送。"],
      "wandering-earth": ["heat-priority", "行星迁移使保温优先，普通用能须等迁居供暖后安排。"],
      simulation: ["body-separate", "模拟体验不抵真实消耗，身体的口粮和住处另行保障。"],
      "mars-survival": ["closed-budget", "补给不能随时从外部取得，本次用水须回收后再分配。"],
      "language-time": [effect.conflict ? "language-blocked" : "anticipation-not-delivery", effect.conflict ? "语言已失效，语言引起的时间预感不能启动。" : "语言使人先感到交付结束，实物却仍须等到送达。"]
    }[m.id];
    const redundant = (m.id === "dark-forest" && ctx.has("dark-forest")) || (m.id === "science-lock" && ctx.has("science-lock")) || (m.id === "dimension" && ctx.has("flat-world"));
    return { id: m.id, state: { effect: entry[0] }, body: entry[1], conflict: effect.conflict,
      effective: !redundant && !(m.id === "language-time" && effect.conflict) };
  }
  function policy(s, i) {
    const p = s.params, w = s.world;
    if (i === 0) return { state: { publicRules: p.publicRules, review: p.review }, body:
      (p.publicRules ? "办理动作公开示范；" : "办理动作只在经手时示范；") + (p.review ? "定期重验办法。" : "办法沿用，不作定期复核。") };
    if (i === 1) return { state: { sharedCost: p.sharedCost, resources: w.resources }, body:
      (p.sharedCost ? "物料由各户共同筹备；" : "物料由各户自行筹备；") + (w.resources ? "底料保留基本份额。" : "额外缺料须等候。") };
    return { state: { exceptions: p.exceptions, cooperate: w.cooperate }, body:
      (p.exceptions ? "争议可申请人工复验；" : "争议不另设特批；") + (w.cooperate ? "交付当面互验。" : "交付须押实物。") };
  }
  function outcome(facts, knobs, mechs) {
    return JSON.stringify({ rules: facts.filter((f) => !f.dormant).map((f) => ({ id: f.id, consequence: f.state })).sort((a, b) => a.id.localeCompare(b.id)),
      policy: knobs ? knobs.state : {}, mechanisms: mechs.filter((m) => m && m.effective).map((m) => ({ id: m.id, consequence: m.state })).sort((a, b) => a.id.localeCompare(b.id)) });
  }
  function worldCard(group, i, era, s, facts, mechanism) {
    const active = facts.filter((f) => !f.dormant);
    const lead = active.find((f) => f.id === "free-goods") || active[0] || facts[0];
    const knobs = active.length ? policy(s, i) : null;
    const mech = active.length ? mechanism : null;
    return {
      groupId: "desk-" + (i + 1), topic: lead.topic, outcomeKey: outcome(facts, knobs, [mech]),
      theme: lead.theme, title: lead.title, ruleTags: group.map((p) => p.id),
      before: lead.dormant ? "互联网尚未进入生活" : lead.before, after: lead.after, why: lead.why, keywords: lead.keywords.slice(),
      detail: detail(facts.map((f) => f.body).concat(knobs && knobs.body, mech && mech.body)),
      conflict: facts.some((f) => f.conflict) || !!(mech && mech.conflict),
      dormant: facts.filter((f) => f.dormant).map((f) => f.id), changed: active.length > 0
    };
  }

  function personalCardsFor(era, s, ctx, facts) {
    const active = new Map(facts.filter((f) => !f.dormant).map((f) => [f.id, f]));
    const has = (id) => active.has(id), cards = [];
    // 生活短讯只在实际日程改变时换后果，不跟着十个时代换道具。
    const workPractice = ctx.level < 8 ? null : ctx.ending === "land"
      ? ["full-season-practice", "面试结果还没长熟", "求职者留一整季做实作，天天去看。面试结果还没长熟。", ["面试结果还没长熟"]]
      : ctx.ending === "voyage"
        ? ["closed-supply-practice", "熟人留在岸上", "求职者封闭演练修循环，熟人全在岸上。人情这回真够不着。", ["人情这回真够不着"]]
        : ctx.ending === "uploaded"
          ? ["copy-specific-practice", "分身带着旧自信", "新副本各自练修载体，带着本人的自信，从第一次失手开始。", ["从第一次失手开始"]]
          : ctx.level >= 9
            ? ["empty-habitat-practice", "空舱先听自我介绍", "求职者先在空舱练修漏，家人等在外面。压力表听完了整场自我介绍。", ["压力表听完了整场自我介绍"]]
            : s.path[2] === "8B"
              ? ["machine-picked-nonstandard-practice", "人类应聘非标搭档", "机器掌管流水线，少量非标岗试配人类。求职者先学机器不会的那一手。", ["机器不会的那一手"]]
              : ["human-machine-practice", "机器搭档先做得太好", "求职者带机器实修，故障轮到本人接手。刚才夸机器的话忽然有点烫嘴。", ["刚才夸机器的话"]];
    function add(topic, theme, title, before, after, why, body, ids, policyIndex, mechanismIds, keywords) {
      const limitedWork = has("thirty-years") || (has("fast-time") && !has("immortality"));
      const household = {
        "household-compute": { basic: "reserved", extra: "wait-for-capacity" },
        "household-meal": { basic: "reserved", extra: has("free-goods") && has("four-hour") ? "no-afternoon-refill" : has("sun-off") ? "separate-light-budget" : "wait-for-stock" },
        "household-access": { access: has("falling-moon") ? "tidal-window" : "wait-for-neighbor" },
        "household-work": { work: limitedWork ? "early-handover" : workPractice ? workPractice[0] : "proof-not-vacancy" },
        "household-copy-work": { work: "four-hours-shared-by-copies" },
        "household-errand": { errand: has("offline-world") ? (ctx.silent ? "deliver-demonstration" : "deliver-carrier") : "brake-luggage" }
      }[topic];
      const used = ids.filter(has).map((id) => Object.assign({}, active.get(id), { state: household }));
      const knobs = policy(s, policyIndex);
      const mechs = s.mechanisms.filter((m) => mechanismIds.includes(m.id)).map((m) => mechanismReport(m, era, s, ctx));
      cards.push({ groupId: "", topic, outcomeKey: outcome(used, knobs, mechs), theme, title, before, after, why, keywords,
        detail: detail([body].concat(used.map((f) => f.body), knobs.body, mechs.map((m) => m.body))),
        ruleTags: used.map((f) => f.id), conflict: used.some((f) => f.conflict) || mechs.some((m) => m.conflict), dormant: [], changed: true });
    }
    if (has("free-goods") && ctx.ending === "uploaded") {
      add("household-compute", "生活用能", "多想一会先等散热", "算力按价格追加购买",
        "常用副本保留算力，额外任务等空位。今天的胡思乱想还在候补。", "上传改变了生活载体，没有增加设备的实际容量。",
        "这户人家先保常用副本运行，临时任务等设备空出；免费运行仍占真实的能源和散热面积。",
        ["free-goods", "four-hour"], 1, ["mars-survival", "time-dilation"], ["胡思乱想还在候补"]);
    } else if (has("free-goods") || has("sun-off")) {
      const short = has("free-goods") && has("four-hour");
      add("household-meal", "吃饭", short ? "口粮有份加餐随缘" : "饭钱省了饭还得等", "带钱就能补一顿加餐",
        short ? "午后加餐领完，基本口粮另领。带来的大碗，只用上了谦虚的那一半。" : has("sun-off") ? "家中改吃菌食，灯另留能源。饭桌很暖，夹菜全凭熟悉。" : "饭钱省下了，加餐仍等来货。空碗比从前更有耐心。",
        short ? "供应者工时已满，领货者不能用免费要求续做。" : "基本供应有保障，额外加餐仍受货源与用能约束。",
        "一家人把基本口粮与加餐分开安排，口粮不因加餐短缺而扣除；多带的餐具只好先带回去。",
        ["free-goods", "four-hour", "sun-off"], 1, ["simulation", "mars-survival", "time-dilation"],
        [short ? "谦虚的那一半" : has("sun-off") ? "夹菜全凭熟悉" : "空碗比从前更有耐心"]);
    }
    if (has("falling-moon") || has("flat-world")) {
      add("household-access", "住处", has("falling-moon") ? "海先替家门留了客" : "邻居搬家全家观摩", "家门空着就能搬行李",
        has("falling-moon") ? "人先住安全区，行李等潮窗。新家到了，本人的家当还在等海点头。" : "邻居搬物占住平面通道，全家等空隙出门，顺便认识了邻居所有家当。",
        "有住处不等于路已畅通，搬运行李还要等物理条件允许。",
        "住户错开搬运与出门；行李的先后次序留在真实道路上，不会因多租一间房而消失。",
        ["falling-moon", "flat-world"], 2, ["dimension", "wandering-earth"],
        [has("falling-moon") ? "等海点头" : "认识了邻居所有家当"]);
    }
    if (cards.length < 2 && ctx.ending === "uploaded" && has("four-hour")) {
      add("household-copy-work", "生活工时", "分身一起领下班", "分身接活，本人算休息",
        "家中劳动副本合计四小时就停。复制出十个自己，凑不出第五小时。", "副本共享本人的劳动上限，切换载体不重开一天。",
        "家中给各副本分好劳动时段，合计用完就停；复制带来十张工位，没带来十份工时额度。",
        ["four-hour"], 0, [], ["凑不出第五小时"]);
    }
    if (cards.length < 2 && (has("no-exam") || has("thirty-years") || (has("fast-time") && !has("immortality")))) {
      const limited = has("thirty-years") || (has("fast-time") && !has("immortality"));
      add("household-work", "工作", limited ? "旧工具迎来新面孔" : workPractice ? workPractice[1] : "手艺到了空位没到", "拿到资格就能订长期岗位",
        limited ? "接任者提前来接手，旧工具还能用。握顺手的那处，又要认识新手心。" : workPractice ? workPractice[2] : "求职者带成品来等空岗。手艺已经到场，位置还坐在别人身下。",
        limited ? "人的任期受限，工具寿命并没有同步缩短。" : "门槛改成实际工作，空位并没有因此增加。",
        !limited && workPractice ? workPractice[2] + "这段实修须本人留出时间，旧经历只供参照。" : limited ? "成年人提前把能接用的工具交给下一位，独立试做后接活；磨旧的握柄继续陪新人做事。" : "成年人带上自己的成品求职，做得好也得等岗位空出；来回搬运的路，比过去多了一件行李。",
        limited ? ["thirty-years", "fast-time", "immortality"] : ["no-exam", "live-exams"], 0, ["tech-burst", "science-lock"],
        limited ? ["又要认识新手心"] : workPractice ? workPractice[3] : ["位置还坐在别人身下"]);
    }
    if (cards.length < 2 && (has("offline-world") || (has("half-gravity") && ctx.level >= 5))) {
      const offline = has("offline-world");
      add("household-errand", "出行", offline ? "出门顺带一份更新" : "轻行李郑重放下", "空手出门，资料远程送达",
        offline ? (ctx.silent ? "出门顺带工具样品，到场再示范。知识装进包里，肩膀先学会了沉重。" : "出门顺带存储件，收件者等人抵达。人还在路上，消息已经坐酸了腿。") : "行李提得轻，抵达仍须逐件刹稳。搬家最隆重的仪式变成了放下。",
        offline ? "断网后资料也占行程，单机照用，远程网络无法送达。" : "重量减半没有减少惯性，轻松提起仍须留出刹停距离。",
        offline ? "这趟出门占用人的时间和真实运力，存储件与行李都随搬运者抵达，沿途耽搁也得一起承担。" : "搬家者省下提举力气，仍要给行李留出刹停空间；一件件稳住以后，才有地方接住下一件。",
        offline ? ["offline-world"] : ["half-gravity"], 1, ["time-dilation", "suspicion"],
        [offline ? (ctx.silent ? "肩膀先学会了沉重" : "消息已经坐酸了腿") : "最隆重的仪式变成了放下"]);
    }
    return cards.slice(0, 2);
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
      const ctx = newsroom(era, s);
      const facts = groups.map((group) => group.map((p) => ruleReport(effectFor(p, era, s), era, s, ctx)));
      const mechs = [0, 1, 2].map((i) => mechanismReport(s.mechanisms[i], era, s, ctx));
      const worldCards = groups.map((group, i) => worldCard(group, i, era, s, facts[i], mechs[i]));
      const personalCards = personalCardsFor(era, s, ctx, facts.flat());
      const cards = worldCards.concat(personalCards);
      return {
        n: era.n, era: era.id, name: era.name, span: era.span,
        subtitle: (worldCards.find((c) => c.changed) || worldCards[0]).title + "。",
        personal: "", worldCards, personalCards,
        events: cards.map((c, i) => ({
          ev: {
            id: "combo-" + era.n + "-" + (i + 1), title: c.title, yearLabel: era.start, domain: c.theme,
            baseline: c.before, track: i < 3 ? "world" : "personal", hot: false,
            ruleTags: c.ruleTags.slice(), conflict: c.conflict, dormant: c.dormant.slice(),
            groupId: c.groupId, topic: c.topic, outcomeKey: c.outcomeKey
          },
          view: { changed: c.changed, alternate: c.after, why: c.why, detail: c.detail, chain: "", keywords: c.keywords.slice(), certainty: "假设" }
        })),
        branch: BRANCHES.find((b) => b.n === era.n) || null
      };
    });
  }

  function textKey(text) {
    return typeof text === "string" ? text.normalize("NFKC").replace(/[\s\p{P}\p{S}]+/gu, "") : "";
  }
  // 比较快照独立于最近世界线列表，父线被移出后仍可判定沿用。
  function edition(run, n) {
    const chapters = run && Array.isArray(run.chapters) ? run.chapters : [];
    const chapter = chapters.find((c) => c.n === n);
    const result = { visible: [], carried: [], dormant: [] };
    if (!chapter) return result;
    const comparison = run.comparison;
    const comparable = comparison && n >= comparison.fromN && Array.isArray(comparison.chapters)
      ? comparison.chapters.find((c) => c.n === n) : null;
    const prior = chapters.filter((c) => c.n < n).flatMap((c) => c.events || []);
    function matches(item, other) {
      if (!other || (other.view && other.view.changed === false)) return false;
      const left = item.ev || {}, right = other.ev || other;
      if (left.topic && left.outcomeKey && right.topic && right.outcomeKey) return left.topic === right.topic && left.outcomeKey === right.outcomeKey;
      const currentText = textKey(item.view && item.view.alternate);
      const earlierText = textKey(other.view ? other.view.alternate : other.textKey);
      return !!currentText && currentText === earlierText;
    }
    (chapter.events || []).forEach((item) => {
      if (item.view && item.view.changed === false) result.dormant.push(item);
      else if (comparable && (comparable.events || []).some((other) => matches(item, other))) result.carried.push({ item, reason: "与分叉前相同" });
      else if (prior.some((other) => matches(item, other))) result.carried.push({ item, reason: "沿用前版" });
      else result.visible.push(item);
    });
    return result;
  }

  global.WRM_PRESETS = { ERAS, RECAP, all, byId, eraById, mechanisms, mechanismById, commonParams, BRANCHES, defaultPath, configurationError, resolve, edition };
  if (typeof module !== "undefined" && module.exports) module.exports = global.WRM_PRESETS;
})(typeof window !== "undefined" ? window : globalThis);
