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
    function fact(topic, theme, title, after, why, body, state) {
      return { id, topic, theme, title, before: ruleBefore[id], after, why, body,
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
    function news(topic, theme, why, entry, constraints) {
      return fact(topic, theme, entry[1], entry[2], why, entry[2], Object.assign({ method: entry[0] }, constraints));
    }
    switch (id) {
      case "no-exam": {
        let entry = step({
          1: ["show-finished-tool", "斧头替人开口", "取消考试后，求职者带石斧现场劈木。推荐者可以到场，不能替斧头锋利。"],
          2: ["shared-apprentice-material", "穷学徒也领材料", "无考试招徒改由作坊供试做材料，免得录用的全是自带铜料的人。"],
          3: ["public-repair-liability", "修好的水渠才作数", "无考试录用改看公共修渠，漏水须本人补好。围观喝彩不计入供水量。"],
          4: ["cross-workshop-reproduction", "作品出门再做一遍", "无考试招工让作品跨坊复做，换一套工具仍能交活才算手艺。师门不包邮。"],
          5: ["production-batch-proof", "好零件要成批交", "工厂不考分，改验连续做出的零件。一件精品不能替整批废品办理入职。"],
          6: ["deenergized-safety-practice", "先断电再显身手", "电工凭断电实修入职，接通前另人复验。手艺可亲自展示，触电不必。"],
          7: ["individual-contribution", "合做作品拆开认领", "无考试招聘拆验合作作品，每人重做自己那部分。合影不算共同完成。"],
          8: s.path[2] === "8A"
            ? ["audited-human-machine-practice", "人机一起交实修", "无考试岗位改验人机共同实修，人须当场接管故障。机器合格不顺带录用主人。"]
            : ["autonomous-machine-partner", "机器也挑搭档", "无考试岗位由自治机器试配搭档，人须补做机器的盲区。主人称呼不算资历。"],
          9: ["isolated-life-support-practice", "先修空舱再接人", "舱务录用不考分，先在隔离空舱修漏，再接生命维持活。推荐人不能代供氧。"],
          10: ["separate-copy-work-proof", "复制经历不包录用", "副本各自实修载体才获岗，共用旧作品只验一次。复制经历没有复制空缺。"]
        });
        if (ctx.ending === "voyage") entry = ["closed-voyage-maintenance", "船员先试断补给", "星船不考分，候选人须在断补给演练中修好循环系统。推荐人留在岸上。"];
        if (ctx.ending === "land") entry = ["whole-growing-cycle", "田头验完整一季", "回归土地后不考分，接手" + field + "须做完一季养护。种下去不算已经收获。"];
        return news("hiring", "招工新规", "取消考试排名，实际贡献仍须核验，岗位不会凭空增加。", entry,
          ctx.ending === "land" ? { cultivation: field } : undefined);
      }
      case "four-hour": {
        let entry = step({
          1: ["relay-guarding", "守洞也得交班", "守洞与采集合计四小时，守夜须轮人。闭着眼睛坐在洞口仍算值班。"],
          2: ["continuous-irrigation-relay", "水不停人要换", "灌溉工满四小时交出水闸，下一班接水。活物不因换班暂停需水。"],
          3: ["travel-service-total", "换马不重开工时", "驿夫跑腿与搬货合计四小时，换马不重开工时。马不是新雇主。"],
          4: ["distributed-piecework-total", "带回家做也算工", "作坊把活分到各户，家中赶工仍计四小时。门关上了，劳动没有消失。"],
          5: ctx.drive === "水轮替汽"
            ? ["water-mill-relay", "水轮没有下班键", "水磨工满四小时换人，水轮继续转，接班者先接住未完的活。河水不替人加班。"]
            : [ctx.drive === "蒸汽推机" ? "steam-relay" : "geothermal-relay", "机器续转人先交班", ctx.drive + "连续运转，工人满四小时交班。机器没有累，不构成人的加班理由。"],
          6: ["emergency-relief-reserve", "抢修先留接班人", "电网抢修也限四小时，开工前先备接替班。停电不能把工时上限一起关掉。"],
          7: ctx.silent || disconnected
            ? ["in-person-handover-counted", "上门交接也算工", "下班后上门示范也计入四小时，接手人须在限时内到场。热心不另开工时。"]
            : ["after-hours-messages-counted", "回复收到也算工", "下班后处理工作消息也计入四小时，雇主须把碎片工时合并。收到不是休息。"],
          8: s.path[2] === "8A"
            ? ["human-approval-counted", "审机器的人也下班", "机器接夜班，人类试机与检修合计四小时。监管者不能靠监管取得第五小时。"]
            : ["autonomous-output-human-limit", "算法不能续人类工时", "机器自行增产，人的纠错仍计四小时。算法找到新订单，没找到第五小时。"],
          9: ["embodied-and-remote-total", "换机械手不算下班", "舱内操控与现场检修合计四小时，换到机械手上继续做，也不算本人下班。"],
          10: ["all-conscious-copies-total", "分身刚到本人下班", "所有意识副本合计四小时，分身刚进工位，本人已到下班时间。"]
        });
        if (ctx.ending === "voyage") entry = ["continuous-voyage-watch", "船不停人轮值", "星际值守与训练合计四小时，船不能停，值班者必须换。航程不发加班许可。"];
        if (ctx.ending === "land") entry = ["harvest-relay", "庄稼没批准加班", field + "养护合计四小时，成熟部分分片交给下一班。丰收不批准集体加班。"];
        return news("shift-service", "工时快讯", "每人每日生产服务合计四小时，跨雇主与副本计时，基本口粮保留。", entry,
          ctx.ending === "land" ? { cultivation: field } : undefined);
      }
      case "free-goods": {
        let entry = step({
          1: [shortSupply ? "ration-then-no-refill" : "ration-then-surplus", shortSupply ? "零元加餐已领完" : "价格没了产量还在",
            shortSupply ? "免费" + food + "午前领完，四小时后不续做。" + (ctx.heat === "cold" ? "下午等下一批，等候也免费。" : "下午可继续领取香味。") : "免费" + food + "先留基本口粮，余量领完等明天。零元不负责让猎物增殖。"],
          2: ["seed-before-distribution", "下轮的饭不能领走", "零价食仓先留种再分口粮余量，领完的人不能回头领种。下一轮的饭暂不出仓。"],
          3: ["durable-goods-return-pool", "工具免费归还要完整", "零价工具轮用后回库，断柄须修好再交。免费不是把损耗交给下一位。"],
          4: ["cargo-before-price", "船舱不认零元标签", "零价船货在产地配齐后按舱容装载，价格归零，没多腾出一间货舱。"],
          5: ["material-recovery-before-output", "废料成了进货渠道", "零价工厂收回边角料再开工，产量仍受原料约束。零元可以一直不变，货不能无限多。"],
          6: ["repair-stock-reserved", "先留抢修那一箱", "零价电器先留公共抢修备件再配发，坏掉的设备不能拿免费当维修办法。"],
          7: ["stock-not-orders", "领货快不等于造货快", "零价订货按实库存配发，同一人分开领仍只一份。手快不能提前造货。"],
          8: ["printer-feedstock-loop", "打印晚饭先交原料", "零价打印机回收旧成品再接新订单，原料另占份额。空托盘不能打印晚饭。"],
          9: planar
            ? ["planar-freight-capacity", "零元货也占一条路", "零价舱货沿平面货道串行配送，前货不出后货不进。零元不能从上方抄近路。"]
            : ["orbital-freight-capacity", "零元送到轨道另等船", "零价轨道配送仍占运力，口粮先装，额外货等货船。免的是价格，不是货物质量。"],
          10: ["basic-compute-before-extra", "零元副本也吃算力", "零价算力先保基本运行，额外副本共分余量。复制自己不能复制散热面积。"]
        });
        if (ctx.ending === "voyage") entry = ["closed-voyage-stock", "星际退货也占货舱", "零价星船物资按闭环库存配发，退货也须带回。退到宇宙里不算入库。"];
        if (ctx.ending === "land") entry = ["seed-and-tool-reserve", "收成先留下一季", "回归土地后零价收成先留种，农具轮用归还。领空一仓不等于完成下一季生产。"];
        return news("ration-supply", "物资行情", "商品零价不增加资源，基本口粮优先，余量按人轮候。", entry,
          ctx.level === 1 ? { food, heat: ctx.heat } : undefined);
      }
      case "sun-off": {
        let entry = step({
          1: ["geothermal-rations", "饭有了天还没亮", "太阳熄灭后地热菌毯保温饱，照明另耗能源。吃饱以后，天也不会亮。"],
          2: ["shared-heat-ducts", "暖气先走公共沟", "暗地聚居点共挖引热沟，先暖住处再暖工坊。离热井近不等于独占热井。"],
          3: ["cascaded-heat", "一份热用完接着用", "暗城把热水依次送过菌床和浴池，后段只接余热。泡澡不能要求重新烧出太阳。"],
          5: ["insulation-before-output", "工坊先给管子穿衣", "地热工坊先包住漏热管再扩产，菌食保温优先。新增机器先等热，不等日出。"],
          6: ["geothermal-electric-light", "灯光另算用能", "暗城用地热供电，照明与保温分开配给。有暖房不自动附赠通宵灯光。"],
          8: ["crop-specific-light-pulses", "菜园按叶片开灯", "暗城农机只给需光叶片补光，菌床留在暗处。照亮整座城不再冒充种菜。"],
          9: ["closed-habitat-food-heat", "舱里的夜班不看天", "暗舱回收菌食生产的水与余热，照明单独占能耗。窗外一直没到开灯时间。"],
          10: ["compute-waste-heat", "算房供暖不包照明", "上传住区把算房余热送去养菌，生身照明仍须供电。思想很热不等于天亮。"]
        });
        if (ctx.ending === "voyage") entry = ["reactor-not-ground-heat", "离开热井自带热源", "星船离开地热后用堆热养菌，照明另耗能源。故乡的热井不能随身续杯。"];
        if (ctx.ending === "land") entry = ["heat-well-farming-radius", "田界跟着热管走", "回归土地改围热井养菌，种植边界由保温损耗决定。地再多也不能全铺热管。"];
        return news("heat-food", "能源民生", "虚构前提保住地热与菌食；额外照明必须另付能源。", entry);
      }
      case "science-lock": return news("tool-ceiling", "工场实况", "基础实验只能给旧结果，工程改良不得越过干预时的能力上限。", step({
        1: ["stone-edge-regrinding", "新成果是磨尖了", "智子锁死后反复磨同种石刃，只比较耐用次数。磨得更亮，不算发现新原理。"],
        2: ["standard-measures", "先把量尺对齐", "锁死后的作坊统一量尺，减少错配而不换配方。今天少返工，不等于科学突破。"],
        3: ["repeatable-batches", "同配方先做得一样", "锁死后的工坊反复试旧配方，剔除不稳批次。好坏终于一致，上限仍在原处。"],
        4: ["optical-calibration", "旧镜对准不见新理", "锁死后的旧镜只校准误差，越界实验仍给旧结果。看清歪了，不等于看穿上限。"],
        5: ["insulation-retrofit", "增产来自少漏一点", "锁死后的机房加隔热层减少损耗，不改动力原理。节下来的热没有获得新学位。"],
        6: ["electrical-tolerance", "电器只改合格率", "锁死后的电器按已知公差重配，减少故障。出厂更齐整，基础实验仍不放行。"],
        7: ["known-model-revalidation", "模型重验不换物理", "锁死后的仪器重验旧模型，修正误差不扩展原理。曲线更平滑，上限没有松动。"],
        8: ["existing-machine-calibration", "聪明机器也有旧上限", "锁死后的智能设备只校准已知工序，越界推算须退回实测。自信不算新实验。"],
        9: ["existing-habitat-spares", "修舱先拆同型件", "锁死后的舱站拆同型件互补，不能造未验证的新推进器。维修成功不是获准远航。"],
        10: ["known-substrate-budget", "旧载体只调容量", "锁死后的载体按已知散热条件分配容量，扩容须用同型件。新住户不是新物理。"]
      }));
      case "dark-forest": {
        let entry = step({
          1: ctx.heat === "fire"
            ? ["covered-fire", "饭做好烟不指路", "黑暗森林下炊火藏进遮蔽处，领食者走近找。饭照做，烟不负责指路。"]
            : ["concealed-delivery", "物资不附远处可见", "黑暗森林下物资在遮蔽处交付，领货人走近核对。货已齐，远看仍没这回事。"],
          2: ["screened-supply-corridor", "送货先围住路线", "隐匿住区沿遮蔽通道送货，搬运前先补缺口。露天捷径不在配送范围内。"],
          4: ["concealed-port-transfer", "船先藏好再卸货", "隐匿港口先将船移入遮蔽处再卸货，岸外不发定位提示。接风没有灯会。"],
          6: ctx.silent || disconnected
            ? ["screened-carrier-transfer", "资料跟人进屏蔽间", "隐匿通信改在屏蔽间交接实物，外界收不到提示。快到门口也不能先招呼。"]
            : ["shielded-signal", "通信搬进屏蔽区", "通信在屏蔽区内传递，外部不公开定位。送到不含广而告之。"],
          8: ["machine-emission-audit", "机器先查自己发没发光", "配送机器出厂先验外泄光，能认路还须会藏踪。智能不豁免暴露位置。"],
          9: ["temporary-heat-storage", "散热也要找遮蔽处", "隐匿舱先存废热，再转入遮蔽处散出。藏得住一时，不等于热量消失。"],
          10: ["concealed-compute", "副本热闹外面静默", "副本算房收住外泄光讯，活动只在遮蔽区内交接。住户再多也不挂招牌。"]
        });
        if (ctx.ending === "voyage") entry = ["silent-voyage-heat-budget", "星船不发抵达喜讯", "星船逐段找遮蔽处散热，抵达后不发定位喜讯。先到的人不能开灯迎客。"];
        if (ctx.ending === "land") entry = ["screened-farm-light", "田里有灯山外看不见", "土地住区把补光收在遮蔽农场内，收成就近交付。丰收不举办远处可见的庆典。"];
        return news("location-secrecy", "配送须知", "可定位的外泄会招来静默，遮蔽处用能，地热菌食保底。", entry);
      }
      case "flat-world": return news("single-lane-freight", "通行快讯", "厚度归零，不能重叠、翻越或穿过封闭边界。", step({
        1: ["serial-passage", "前面歇脚后面同休", "平面窄口逐人搬运，前人停下后人也停。上方已无路可借。"],
        2: ["open-warehouse-mouth", "仓库留口才能进货", "平面粮仓留出不封死的入口，先搬走门口货再补粮。满仓不能连门也填满。"],
        3: ["junction-clearance", "路口先清空再转弯", "平面城门交叉路口先清空再放行，出城货须等入城人过完。桥不予立项。"],
        5: ["uncrossed-drive-trains", "传动带不能借上层", "平面工厂把交叉传动拆成独立工序，交接处轮流送料。机器多不等于多一层。"],
        6: ["noncrossing-wiring", "电线也得让出路口", "平面电网绕开既有线路铺设，交叉处改接分段。电工不能把线从头顶甩过去。"],
        8: ["robot-retreat-space", "机器出门先留退路", "平面机器人搬货前先留退让空地，否则相向两车一起退回。聪明也挤不穿对方。"],
        9: ["habitat-outer-edge-expansion", "扩舱先拆外缘", "平面舱站只能沿外缘扩建，不能把通道套进封闭新舱。加一间须先让一条路。"],
        10: ["supply-openings-before-housing", "新门比新房先验收", "平面住区先开补给缺口再入住，封闭地块不能从外喂货。新门比新房先验收。"]
      }));
      case "inherited-memory": {
        const entry = step({
          1: ["material-retrial", "祖辈会做材料未必", "继承的斧技先在眼前石料上重做，手会了，材料还没答应。"],
          2: ["watercourse-recheck", "祖田位置要再找", "祖忆里的水路须沿地重找，河道已改弯。祖辈没记错，水没承诺原地不动。"],
          3: ["conflicting-perspectives", "两份祖忆各见一半", "两家祖忆对同次交货各见一面，争议须重验实物。祖辈人数不折算证据重量。"],
          5: ["motor-memory-machine-safety", "旧手势先离开机器试", "祖传动作先在停机处试做，再接新工序。手指记得快，不代表机器肯等。"],
          6: ["voltage-requalification", "祖传电工先验电压", "继承电工手法后先验眼前电压，旧接法不能直接照搬。熟悉感不负责绝缘。"],
          8: ["machine-demonstration-scope", "祖传手艺不全交给机器", "人把祖传动作分段示范给机器，只教当前工序。不附赠整段家事。"],
          9: ["airlock-practice-on-empty-door", "旧开门手法先试空门", "祖忆中的开门动作先在空舱门重试，误触须隔离。记得怎么开不等于该开。"],
          10: ["parallel-inheritance-reconciliation", "家族经验不能投票成真", "多支祖忆互相矛盾时分开实做，保留失败的那份。家族开会不能修改材料性质。"]
        });
        if (ctx.silent) entry[2] = "祖忆词句失效，只留动作感受。" + entry[2].split("。")[0] + "。";
        return news("inherited-skill", "手艺消息", "只继承祖辈成年记忆的原主视角，不随现实更新；失语时词句失效。", entry,
          { inheritance: ctx.silent ? "motor-only" : "perspective-bound" });
      }
      case "fast-time": {
        const arrested = h("immortality"), capped = h("thirty-years");
        let entry;
        if (arrested) entry = capped
          ? ["arrested-with-hard-cap", "不老也须按时交接", "长生阻断十倍衰老，三十年硬上限仍到期交接。工具继续用，任期不能续。"]
          : ["arrested-aging", "人不老工具照旧磨损", "长生阻断十倍衰老，岗位不因年老空出。工具照常磨损，先换工具。"];
        else if (uploaded) entry = capped
          ? ["uploaded-with-hard-cap", "上传没换起算日", "上传避开身体衰老，三十年限额照算。换了载体，没换起算日。"]
          : ["nonbiological-external-clock", "上传不能催交货", "上传避开身体衰老，外部生产仍走原钟。人已上传，货还在路上。"];
        else {
          entry = step({
            1: ["short-adult-apprenticeship", "人先交班活照旧慢", "身体十倍衰老，成年学徒先学能马上交接的活。石斧没有因此快磨十倍。"],
            3: ["successor-alongside-master", "接班人开工就跟着", "十倍衰老让工匠开工便带接任者，不能等做不动才教。传授也需要原速的时间。"],
            5: ["strength-based-task-transfer", "工位跟着体能换", "十倍衰老的工人按体能转交重活，机器照原速运转。人先磨损不算设备折旧。"],
            7: ["short-modular-work", "长项目拆成短交付", "十倍衰老让长项目拆成可接手的小段，工具连续用。项目不能要求同一个人耐用。"],
            8: ["assistive-not-rejuvenating", "外骨骼不报销年龄", "十倍衰老者用助力设备交活，体能复验仍要做。穿上外骨骼不等于把年龄脱掉。"],
            9: ["habitat-procedures-before-decline", "开舱手艺提前交棒", "十倍衰老者提前转交舱务实操，接任者须独立重做。身体快老不附赠快速学会。"]
          });
          if (ctx.ending === "voyage") entry = ["short-biological-watch", "老得快不算快船", "生身船员按体能提前换岗，航程不能十倍缩短。老得快不算快船。"];
          if (ctx.ending === "land") entry = ["short-season-handover", "人换了季节还没换", "十倍衰老者把" + field + "养护分段交接，收获仍等生长周期。人换了，季节还没换。"];
          if (capped) entry = [entry[0] + "-hard-cap", entry[1], entry[2] + "寿限仍三十年。"];
        }
        return news("career-duration", "用工观察", "只加速身体衰老；长生先阻断衰老，三十年硬上限不被豁免。", entry,
          !arrested && ctx.ending === "land" ? { cultivation: field } : undefined);
      }
      case "half-gravity": {
        let entry = step({
          1: ["manual-braking-space", "提得起还得拦得住", "重力减半后搬石仍留刹停距离，重量轻了，惯性没减。接货者不按半个人准备。"],
          2: ["bucket-swing-restraint", "提桶省力泼水照旧", "轻桶运水改用两侧稳扶，防住横摆再放手。省下提力，没有省掉泼出的水。"],
          3: ["anchored-buildings", "房子轻了先加锚", "减重建筑加锚抵住横向推力，不能只算抬得起多大石块。风没同意减半。"],
          5: ["traction-before-load", "轻车先试刹车", "机车减重后先试附着与制动，再定装载量。拖得动不是停得住的证明。"],
          6: planar
            ? ["planar-cart-inertial-load", "平面货车不能翻倍塞人", "减重平面货车先验启停负荷，不能按重量直接塞双倍乘客。每个人的惯性都来了。"]
            : ["lift-inertial-load", "电梯不按重量翻客流", "减重电梯先验启停负荷，不能按重量直接塞双倍乘客。每个人的惯性都来了。"],
          8: ["robot-braking-calibration", "送货机先练停住", "配送机按货物质量重调制动，抓取可以省力，急停仍须留空间。轻拿不等于轻停。"],
          9: ["near-earth-docking", "近地货舱先缓冲", "近地货舱对接先留缓冲行程，不用轻了的重量估算冲击。舱壁照旧怕撞。"],
          10: ["physical-carrier-braking", "副本的搬家车仍要刹车", "副本迁居时载体搬运仍按质量制动，住户可无身体，运输设备不能无刹车。"]
        });
        if (ctx.ending === "voyage") entry = ["remeasure-off-earth", "省力经验尚未落地", "异星卸货先测当地重力，地球减半规则不外带。省力经验到了，此地还没验收。"];
        if (ctx.ending === "land") entry = ["anchored-farm-tools", "农具轻了抓地也少了", "减重农具先加锚再试牵引，搬着轻不能证明耕得深。土地没有跟着松一半。"];
        return news("freight-braking", "搬运提醒", "只减地表及近地重力，质量、惯性与空气阻力不变。", entry);
      }
      case "immortality": {
        if (h("thirty-years")) return news("housing-turnover", "住处消息", "三十年硬上限优先，长生只保留此前的不衰老。",
          ["thirty-year-cap", "长生不附无限住期", "长生挡住衰老，挡不住三十年硬上限。住处到期交接，不能订无限住期。"]);
        let entry = step({
          1: ["rotating-shelter", "人可长生住处轮用", "长生者不自然退出，公共住处改轮住。人能一直住，不能一直住这儿。"],
          2: ["land-use-renewal", "祖先还在田须轮用", "长生村落把田地使用分期轮换，不能等祖先离世再分田。祖先也在等分田。"],
          3: ["fixed-public-tenure", "元老不老任期要老", "长生议事者到期换席，席位不随寿命续期。资历可以很长，椅子须让出来。"],
          5: ["workshop-use-rotation", "工坊传承不等遗产", "长生工坊把设备使用与本人寿命分开，徒弟轮到机位。传承不再等待遗产。"],
          7: ["finite-memory-curation", "活太久也要腾记忆", "长生者挑选旧事留在外部载体，脑内只留常用部分。活过的不保证全记得。"],
          8: ["consensual-memory-selection", "机器不能替人选忘事", "长生者让设备整理旧经历，舍弃哪段须本人试认。智能助手没有替人后悔的权限。"],
          9: ["repair-time-rescue", "不会死也须来救", "长生舱员损伤仍要慢修，救援先移出危险处。不会死亡不等于不占救援时间。"],
          10: ["finite-active-memory", "副本寿命不限内存有限", "长生副本轮换加载旧忆，不把全部经历同时运行。活得无穷长，内存没跟上。"]
        });
        if (ctx.ending === "voyage") entry = ["finite-voyage-berths", "乘客不老船舱照旧满", "长生船员轮住舱位，殖居先扩补给再接新人。船票不能按无限寿命折成无限座位。"];
        if (ctx.ending === "land") entry = ["soil-rest-before-tenure", "人不老土地也要歇", "长生农人轮用田块，休耕照旧留足。本人不需退休，不代表土地同意连作到永远。"];
        return news("housing-turnover", "住处消息", "不衰老不死亡，损伤慢修；记忆容量、空间与物资不会随寿命增加。", entry);
      }
      case "no-language": return news("physical-consent", "办理须知", "文字、词语、暗号均失效，直接观察模仿不等于约定符号。", step({
        1: ["direct-exchange", "双方带东西来", "失语后双方带实物当面重做操作，点头不算约定，站着没走也不算同意。"],
        2: ["full-size-land-demonstration", "量田得走到田里", "失语者把量具搬到田边，双方沿真实边界走一遍。画个圈不能代替这趟路。"],
        3: ["in-person-reenactment", "争议双方重做现场", "失语争议由双方在原物旁重演操作，旁观者只看实际结果。没人能口头保证。"],
        5: ["hands-on-assembly", "工序接手不接暗号", "失语装配由熟手现场带做，接手者独立再做一遍。颜色和手势不另充密码。"],
        6: ["isolated-electrical-demonstration", "通电以前先当面试", "失语电工在隔离实线上示范，接手者亲手复验。画一支箭头不能指挥送电。"],
        8: ["machine-imitation-only", "机器跟手学不收口令", "失语者让机器直接模仿操作，再用实物检验结果。机器不会替人恢复口令。"],
        9: ["airlock-physical-interlock", "人到舱门前才能开", "失语舱门靠当面实作核对，隔开危险部分再交接。沉默不能冒充开舱许可。"],
        10: ["embodied-consent", "远处替身不能代同意", "失语者亲自在待用物前尝试和退出，远处替身不代授权。身体到了也仍可离开。"]
      }));
      case "falling-moon": {
        let entry = step({
          1: ["tidal-window", "住处好了潮还没退", "月落扰潮，安全住处全员有份，行李等潮窗。房间腾好了，路还要等海腾出来。"],
          2: ["split-shelter-stocks", "备用粮不放同一岸", "避潮住区把备用口粮分放两岸，潮窗关闭时就地取用。过不去不等于没饭吃。"],
          4: ["return-window-before-departure", "出海先留返程潮窗", "避潮港先留足返程窗口再放船，误期者留安全区。满载不构成叫海水让路的理由。"],
          5: ["relocatable-workshops", "工坊能拆住区不撤", "月落沿岸工坊改用可拆工位，潮来先撤设备，人员住安全区。厂址不必忠于海岸。"],
          7: ["local-tide-recheck", "潮表不包下次还准", "避潮道路每次开放前现场测水位，旧潮表不直接续用。海水没有定期履约的义务。"],
          8: ["uncrewed-shelter-repair", "补墙先派机器出去", "潮窗内由机器先补避难区外壁，人留安全处复验。机器回来也要冲盐。"],
          9: ["independent-emergency-cells", "每舱都有独立避难处", "月落住区把避难单元分段隔开，一段检修不抽空别处保障。安全不靠邻舱凑数。"],
          10: ["protected-carrier-relocation", "上传的家也要防潮", "上传住区把载体迁入避潮单元，外部设备趁潮窗维护。身体不在，插座还在。"]
        });
        if (ctx.ending === "voyage") entry = ["tidal-launch-supply", "出发货先过潮窗", "星船补给先在地面安全区集齐，趁潮窗转运。离开地球的货仍得先走出仓库。"];
        if (ctx.ending === "land") entry = ["safe-upland-cultivation", "耕地不能冒充避难处", "土地住区把人留在安全区，潮窗内分段养护田地。想多种一垄不批准多冒一次险。"];
        return news("tidal-access", "住区通告", "月球缓慢下坠扰乱潮汐；可循环修复的避难区始终保障全员安全。", entry);
      }
      case "offline-world": {
        let entry = step({
          7: ctx.silent
            ? ["physical-demonstration", "更新须带着样品来", "断网又失语，工具样品随人送来当面示范。新做法来得快不快，先看脚程。"]
            : ["storage-carrier", "更新正在赶路", "断网后新资料随存储载体送来，抵达前用旧版。催得再急也要算运程。"],
          8: ctx.silent
            ? ["offline-machine-demonstration", "两台机器见面再学", "断网又失语，单机带实物到另一台面前示范，学会后才分开。更新需要见面。"]
            : ["offline-machine-version-handoff", "机器会合才对版本", "断网配送机回站交换存储件，版本不合先本地复验。跑得远不等于更新快。"],
          9: ctx.silent
            ? ["habitat-demonstrator-freight", "新手艺也占舱容", "断网又失语，跨舱新工序随示范者和实物运输。空运一个点头不算交付。"]
            : ["data-cargo-with-local-authority", "每舱先按手边资料办", "断网舱站让存储件随货运，本舱先独立处置故障。等待总部不能堵住漏气口。"],
          10: ctx.silent
            ? ["embodied-offline-migration", "搬人格得搬整台载体", "断网又失语，迁居者携运行载体亲自到场核对。没有一句口令能把本人送过去。"]
            : ["offline-personal-carrier-migration", "迁居者随载体出门", "断网副本迁居须运输载体，途中基本运行另留能源。人格不能发一个远程附件。"]
        });
        if (ctx.ending === "voyage") entry = ctx.silent
          ? ["voyage-demonstration-cargo", "船与船碰面才教新活", "断网又失语，星船相会时带实物互做示范。远处闪几下灯不算消息。"]
          : ["voyage-storage-mail", "星际邮袋赶不上时事", "断网星船携存储件互送，旧消息先按出发时核验。邮袋抵达不代表近况抵达。"];
        if (ctx.ending === "land") entry = ctx.silent
          ? ["farm-demonstration-visits", "教种地得走到地里", "断网又失语，邻村带农具来田里同做新活。远处比画不代替这趟路。"]
          : ["village-storage-circuit", "村里更新随农具来", "断网村落让存储件随农具巡回，坏了就带回重送。路走通了，版本才算通。"];
        return news("network-delivery", "通信快讯", "单机照用，远距网络停用；文字也失效时只能带实物直接示范。", entry);
      }
      case "talking-plants": {
        if (ctx.silent) return news("root-irrigation", "灌溉消息", "语言消失优先，植物话音不能变成暗号。",
          ["speech-blocked", "浇水仍得蹲下看土", "植物的话无人听懂，灌溉仍须摸根土看叶色。叶色是状态，不是另造的暗号。"]);
        let entry = step({
          1: ["local-root-water", "根部消息仅限本株", "植物只报自身缺水，邻地仍另查。根扎得再深，也不替邻地作证。"],
          2: ["irrigation-by-root-reach", "修渠先逐株问", "会说话的苗逐株报渴，支渠按实际根区分水。声音大的不能代领邻株的水。"],
          4: ["living-cargo-care", "船货会催人浇水", "船上活苗报干燥，照料者逐盆检查再浇水。船长不能替全船盆栽宣布不渴。"],
          5: ["smoke-source-testing", "树喊难受还得找烟源", "工厂边的树报叶片不适，人须实测污染来源。树会投诉，不会替人做整厂调查。"],
          7: ["sensors-crosscheck-plants", "植物投诉附现场实测", "灌溉者对照传感器与本株感受再调水。仪器坏了不等于植物在夸大。"],
          8: ["living-plant-model-validation", "农机须听活株反驳", "农机用活株感受复验养护模型，预测舒适不算已经舒适。植物不签满意度保单。"],
          9: ["closed-root-water-budget", "根的需求进舱内水账", "舱内活根报需求后重分循环水，不能各取无限份。会说渴，没有随身带来一条河。"],
          10: ["simulated-forest-not-evidence", "模拟树林不能代活根", "上传者照料实体植物仍问活根，模拟森林的欢呼不算浇水证据。树没搬进画面。"]
        });
        if (h("sun-off")) entry = step({
          1: ["light-deficit", "说清缺光也要供能", "太阳熄灭后植物能报缺光，补光仍耗能源。需求说清了，光不会自行前来。"],
          6: ["plant-light-metering", "先验叶片再调灯", "暗城逐株询问并实测叶片状态，按需分灯。会说话不能让灯耗电减少。"],
          8: ["adaptive-root-light-budget", "灯跟活根需要调", "暗地农机按活根感受调补光，超出能耗就缩种植面。投诉处理不等于能源增发。"],
          9: ["closed-light-water-allocation", "补光和水一起算", "暗舱按活根需求分水与灯，余热再回收。植物吃到光，没有让整套设备免耗能。"],
          10: ["real-roots-compute-light-budget", "算房与植物分能源", "上传住区把实体植物补光与算房用能合算。虚拟阳光不能拿去喂活根。"]
        });
        if (ctx.ending === "voyage") entry = ["ship-root-life-support", "舱里的树不能替邻舱说话", "星船逐舱问活根并实测水与光，循环系统据此调整。隔舱的树没有参会。"];
        if (ctx.ending === "land") entry = ["root-by-root-restoration", "土地恢复逐根核验", "回归土地逐株问根再验土，枯死地块另取样。最健谈的一株不能代表整片荒地。"];
        return news("root-irrigation", "灌溉消息", "植物只知自身感受，不能移动或代远处作证；水与补光仍耗资源。", entry);
      }
      case "thirty-years": {
        let entry = step({
          1: ["adult-short-handover", "工具接班寿限不续", "三十年寿限内完成自己的活，工具留给接任者。能传下去的是斧头，不是余命。"],
          2: ["land-contract-within-life", "田契不能比本人长", "田地养护约止于本人三十岁前，接手者重新实做。土地长久，不负责替人续约。"],
          4: ["return-before-cap", "远行先算回程", "三十年寿限让远行先留回程时间，晚归不能延期。船可以传，人不能续。"],
          5: ["asset-not-person-handover", "机器长租人短接", "三十年寿限下机器分段交接使用，接任者另担当期的活。机器耐用不替主人延寿。"],
          7: ["service-not-identity-transfer", "长期服务拆成短约", "照护与工作服务都在本人三十岁前结清，接手者另立关系。不把新人当旧人续费。"],
          8: ["nonpersonal-care-tools", "机器接活不接人格", "寿限前把照护工具交给接任者，机器只能接工序。模仿动作不算本人继续服务。"],
          9: ["habitat-mission-cutoff", "舱务远期任务须换人", "舱务任务按三十年寿限分段，长期修复由新人重验接手。原人的授权不跟工具续命。"],
          10: ["uploaded-clock-not-reset", "上传不送新任期", "上传与副本仍从原起点算三十年，只交接非人格资料。搬进新载体，不赠新任期。"]
        });
        if (ctx.ending === "voyage") entry = ["voyage-within-life", "路远不是延期理由", "星际个人航程须在三十岁前完成，超期航线不派本人出发。路远不是延期理由。"];
        if (ctx.ending === "land") entry = ["seed-not-person-inheritance", "留下种子不留下本人", "三十年寿限前交清田务，种子农具留给后来者。下一季发芽不算本人续寿。"];
        return news("contract-horizon", "合约须知", "三十年硬上限优先于长生；换身体、载体或住处都不重新计时。", entry);
      }
      case "no-borders": {
        let entry = step({
          1: ["terrain-and-private-consent", "边界撤了山还在", "迁居免查国籍，进私人住处仍须本人同意。山没搬走，别人家没变近路。"],
          2: ["road-not-door-right", "驿路通了家门没开放", "无国界驿路共修公共路段，私家门前另征同意。走遍天下不附带走遍卧室。"],
          4: ["port-physical-compatibility", "港口查吃水不查国籍", "无国界船队入港先验吃水与泊位，货可直运，船底不能直接穿过浅滩。"],
          5: ["rail-gauge-transfer", "国界没了轨距还在", "无国界铁路在异轨处换装，免过关不能免换轮。列车仍认轨距。"],
          6: ["power-interface-conversion", "电也不能直接串门", "无国界电网先匹配电压再接通，住得近不能把接口硬插进去。"],
          8: ["robot-access-consent", "配送机不获开门特权", "无国界配送机先验实体接口，进入私宅须本人当场准入。通行便利不包括拆门。"],
          9: ["airlock-pressure-compatibility", "免过关不免验舱压", "无国界舱站先核对气压和私域准入，再开接驳口。真空不承认通行便利。"],
          10: ["private-memory-boundary", "意识迁居不打开别人脑门", "上传者跨区不验国籍，进入他人记忆仍须本人同意。世界无界，脑内不公用。"]
        });
        if (ctx.ending === "voyage") entry = ["landing-site-consent", "星际落点不是空座", "星际迁居先验落点环境与私人场地准入，国界撤掉不等于每块地都空着。"];
        if (ctx.ending === "land") entry = ["shared-water-private-land", "搬到田边不多一条河", "无国界农人共修水路，进田仍须使用者同意。迁居自由不增发灌溉水量。"];
        if (ctx.silent) entry = [entry[0] + "-direct", entry[1], entry[2].split("。")[0] + "。失语须当面实作核对。"];
        return news("migration-access", "迁居新规", "撤掉国界限制，不撤地形、工具接口和私人空间；准入不能代办。", entry);
      }
      case "live-exams": {
        const canceled = h("no-exam"), hidden = h("dark-forest") || s.mechanisms.some((m) => m.id === "dark-forest");
        const channel = hidden ? "enclosed" : ctx.silent || disconnected || ctx.level < 7 ? "onsite" : "broadcast";
        const venue = channel === "enclosed" ? "遮蔽场内" : channel === "onsite" ? "现场" : "直播中";
        let entry = step({
          1: ["hands-visible", "手要留在观众眼前", "由本人全程露出双手做成实物"],
          3: ["spectator-separation", "围观者站到手够不着处", "旁观者退到碰不到工具的位置"],
          5: ["machine-safety-separation", "看操作不必靠近齿轮", "观众与运转机器隔开，操作者单独交活"],
          7: ["unbroken-process", "成品漂亮不能跳过过程", "从取料到交付连续展示，不拿成品替过程"],
          8: ["human-machine-contribution", "谁做的活谁来展示", "人和机器分开重做，各自贡献当场核验"],
          9: ["safe-empty-chamber", "不能拿乘客当考具", "在空舱重做修漏，不拿乘客当检验材料"],
          10: ["single-copy-performance", "副本不能中途换考生", "同一副本全程完成，其他副本不得代手"]
        });
        if (ctx.ending === "voyage") entry = ["ship-isolated-drill", "考场不接生命维持管", "船员在隔离演练舱操作，不接住舱实管"];
        if (ctx.ending === "land") entry = ["farm-process-demonstration", "果实不是全部过程", "田头从养护到收获展示，不借邻田成果"];
        return news("public-assessment", "实作消息",
          canceled ? "取消考试优先，只展实作不排录用名次，观众不得提示。" : "只核验成年人的当场实作，观众不得提示或参与评定。",
          [entry[0], entry[1], (canceled ? "取消考试，" : "技能公考，") + venue + entry[2] + (canceled ? "，只展不评分。" : "，观众不代做。")],
          { assessment: canceled ? "exhibition" : "exam", channel });
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
      before: lead.dormant ? "互联网尚未进入生活" : lead.before, after: lead.after, why: lead.why,
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
      ? ["full-season-practice", "求职要留出一整季", "求职者先安排完整一季的实作，不能只带来收成。"]
      : ctx.ending === "voyage"
        ? ["closed-supply-practice", "上船前先试断补给", "求职者先在封闭演练处实修循环系统，不能由岸上帮忙。"]
        : ctx.ending === "uploaded"
          ? ["copy-specific-practice", "分身仍须自己动手", "新副本另做载体实修，不能拿本人的旧经历直接接活。"]
          : ctx.level >= 9
            ? ["empty-habitat-practice", "练手舱里先不住人", "求职者先在空舱练修漏，家人不能搬进来替他证明安全。"]
            : ["human-machine-practice", "求职要带机器搭档", "求职者带常用机器一起实修，轮到本人时不能全交给机器。"];
    function add(topic, theme, title, before, after, why, body, ids, policyIndex, mechanismIds) {
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
      cards.push({ groupId: "", topic, outcomeKey: outcome(used, knobs, mechs), theme, title, before, after, why,
        detail: detail([body].concat(used.map((f) => f.body), knobs.body, mechs.map((m) => m.body))),
        ruleTags: used.map((f) => f.id), conflict: used.some((f) => f.conflict) || mechs.some((m) => m.conflict), dormant: [], changed: true });
    }
    if (has("free-goods") && ctx.ending === "uploaded") {
      add("household-compute", "生活用能", "额外任务等空位", "算力按价格追加购买",
        "常用副本保留运行份额，额外任务等算力空出。", "上传改变了生活载体，没有增加设备的实际容量。",
        "住户的常用副本继续运行，临时任务先搁置；额外任务须让出保障基本运行的设备。",
        ["free-goods", "four-hour"], 1, ["mars-survival", "time-dilation"]);
    } else if (has("free-goods") || has("sun-off")) {
      const short = has("free-goods") && has("four-hour");
      add("household-meal", "吃饭", short ? "午后空篮回家" : "口粮与加餐分开领", "带钱就能补一顿加餐",
        short ? "午后来领加餐的人空篮回家，基本口粮另领。" : has("sun-off") ? "家中改吃菌食，想在亮处吃饭还须留出能源。" : "家里不用再攒饭钱，加餐仍要等货。",
        short ? "供应者工时已满，领货者不能用免费要求续做。" : "基本供应有保障，不等于额外需求即时满足。",
        "这户人家把基本口粮与加餐分开安排，额外等候不从口粮里扣除。",
        ["free-goods", "four-hour", "sun-off"], 1, ["simulation", "mars-survival", "time-dilation"]);
    }
    if (has("falling-moon") || has("flat-world")) {
      add("household-access", "住处", has("falling-moon") ? "行李等下一次潮窗" : "邻居搬家须让路", "家门空着就能搬行李",
        has("falling-moon") ? "住户先留在安全区，行李等潮窗再搬。" : "邻居搬物经过门前，住户须等通道空出再出门。",
        "有使用权不等于有通行空间，进出还受物理条件限制。",
        "住户将搬运和出门错开，不能靠多租一块地方取消路上的阻塞。",
        ["falling-moon", "flat-world"], 2, ["dimension", "wandering-earth"]);
    }
    if (cards.length < 2 && ctx.ending === "uploaded" && has("four-hour")) {
      add("household-copy-work", "生活工时", "本人与分身一起收工", "分身接活，本人算休息",
        "家中所有劳动副本合计到四小时就停，不能一边休息一边让分身加班。", "副本共享本人的劳动上限，切换载体不重开一天。",
        "家中先给各副本分配劳动时段，合计用完就停止接活；休息时段不再藏着另一个正在上班的自己。",
        ["four-hour"], 0, []);
    }
    if (cards.length < 2 && (has("no-exam") || has("thirty-years") || (has("fast-time") && !has("immortality")))) {
      const limited = has("thirty-years") || (has("fast-time") && !has("immortality"));
      add("household-work", "工作", limited ? "交班早于工具报废" : workPractice ? workPractice[1] : "求职者带成品上门", "拿到资格就能订长期岗位",
        limited ? "接任者提前来接手，旧工具还能继续用。" : workPractice ? workPractice[2] : "求职者带着成品来，录用仍须等岗位空出。",
        limited ? "人的任期受限，工具寿命并没有同步缩短。" : "门槛改成实际工作，空位并没有因此增加。",
        !limited && workPractice ? workPractice[2] + "实修时间须由本人留出，不能用别人的经历代交。" : "成年人把能交接的工具留给下一位使用者，接任不能只靠原人的经历作保。",
        limited ? ["thirty-years", "fast-time", "immortality"] : ["no-exam", "live-exams"], 0, ["tech-burst", "science-lock"]);
    }
    if (cards.length < 2 && (has("offline-world") || (has("half-gravity") && ctx.level >= 5))) {
      const offline = has("offline-world");
      add("household-errand", "出行", offline ? "出门顺带送资料" : "轻货也得慢停", "空手出门，资料远程送达",
        offline ? (ctx.silent ? "出门的人顺带工具样品，收件者须等现场示范。" : "出门的人顺带存储件，收件者等人不等提示音。") : "搬家能提更多行李，抵达时仍须逐件刹稳。",
        offline ? "断网没有取消传递需求，只把它加进了人的行程。" : "重量减半没有减少惯性，轻松提起不代表能轻松停下。",
        "这趟出门同时占用人的时间与真实运力，不能把抵达以前的等候算成已经送达。",
        offline ? ["offline-world"] : ["half-gravity"], 1, ["time-dilation", "suspicion"]);
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
          view: { changed: c.changed, alternate: c.after, why: c.why, detail: c.detail, chain: "", keywords: [], certainty: "假设" }
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
