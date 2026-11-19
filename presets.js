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
    const ending = era.n === 10 ? (s.path[3] === "10C" ? "land" : level >= 10 ? (s.path[3] === "10A" ? "uploaded" : "voyage") : "unavailable") : "";
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
    const supply = uploaded ? "算力配额" : food;
    const shortSupply = h("four-hour") && h("free-goods");
    const sampleKind = ctx.ending === "land" ? "farm-tools" : ctx.ending === "uploaded" ? "body-maintenance" : ctx.stage;
    const sample = { stone: "石斧成品", craft: "手工作品", mill: "试制零件", electric: "维修实物", automated: "设备实修", habitat: "舱内修件", "farm-tools": "农具实修", "body-maintenance": "载体实修" }[sampleKind];
    switch (id) {
      case "no-exam": return fact("hiring", "招工新规", "手艺合格岗位未空",
        "招工现场验" + sample + "。成品过关，人等空位。手艺不能多变出一个岗位。", "取消的是考试排名，不是岗位限额。",
        "取消考试后，招工改验" + sample + "；没有熟人推荐的求职者也能现场做给经手人看。",
        { admission: "work-not-score", sample: sampleKind });
      case "four-hour": {
        const driveKind = ctx.drive === "水轮替汽" ? "water-powered" : ctx.drive === "蒸汽推机" ? "fire-steam" : "geothermal-steam";
        const workKind = ctx.ending === "land" ? "farming" : ctx.ending === "uploaded" ? "shared-copies" : ctx.level < 2 ? "guarding" : ctx.level < 5 ? "handwork" : ctx.level < 6 ? driveKind : ctx.level < 9 ? "maintenance" : "habitat-service";
        const work = { farming: "田间", "shared-copies": "副本合计", guarding: "守洞", handwork: "作坊", "water-powered": "水磨工人", "fire-steam": "蒸汽机房", "geothermal-steam": "地热机房", maintenance: "维修", "habitat-service": "舱务" }[workKind];
        const machine = ctx.automation ? (s.path[2] === "8A" ? "机器排班仍须人审。排得再满，人也只做四小时。" : "机器自己排班。空位再多，也不能把人的四小时拉长。") : "";
        const after = ctx.automation ? (shortSupply ? "免费" + supply + "等接单。" : work + "四小时换班。") + machine : shortSupply ? "供餐者做满四小时，准点收工。免费" + food + "不再续做，等候不算生产。" : work + "四小时换班。工具交给下一班，没做完的活也一并交接。";
        return fact("shift-service", "工时快讯", shortSupply ? "零元服务准点收工" : "活没做完人先交班", after,
          "生产和服务合计限时，免费不增加产能。",
          (uploaded ? "上传后的副本劳动合计四小时，额外算力服务等下一班接单。" : shortSupply ? "免费供应遇上四小时停工，" + food + "领完不续做；基本口粮另行留足。" : work + "劳动每日合计四小时，工具须交下一班，基本口粮不随工时缩减。") + machine,
          Object.assign({ labor: uploaded ? "four-hours-across-copies" : "four-hours-total", work: shortSupply ? (uploaded ? "compute-service" : "food-service") : workKind }, shortSupply && !uploaded ? { food, heat: ctx.heat } : {}, ctx.automation ? { scheduling: s.path[2] } : {}));
      }
      case "free-goods": return fact("ration-supply", "物资行情", uploaded ? "零元任务排在队尾" : shortSupply ? "零元加餐已领完" : "价格没了队还在",
        uploaded ? "算力免费，基本运行份额先留足。额外任务排队，零元也不能插队。" : shortSupply ? (ctx.heat === "cold" ? "免费" + food + "午前领完，供餐者准点收工。下午等下一批，等候也免费。" : "免费" + food + "午前领完，供餐者准点收工。下午来的人可继续领取香味。") : food + "免费，基本口粮先留足。余量领空后继续排队，价格已无下降空间。",
        shortSupply ? "商品零价与工时上限叠加，剩余需求不能催成加班。" : "价格取消了，现有产量没有增加。",
        (uploaded ? "商品免费延伸到算力，基本运行份额优先，额外任务仍须轮候，复制身份不增加份额。" : "商品免费后，" + food + "先保基本口粮，余量按人轮候" + (ctx.silent ? "，不用姓名符号，人在实物前候领。" : "，不能多报名字多领一份。")) + (shortSupply ? "四小时后不再续做。" : ""),
        Object.assign({ supply: "ration-first", resource: uploaded ? "compute" : food, shift: shortSupply ? "four-hours" : "normal", queue: uploaded ? "identity-deduplicated" : ctx.silent ? "physical" : "identity" }, uploaded ? {} : { heat: ctx.heat }));
      case "sun-off": return fact("heat-food", "能源民生", "饭有了天还没亮",
        h("talking-plants") ? "菌食照常供应，活根补光另占能源。饭已备齐，太阳仍未到场。" : "菌食保住口粮，照明另按能量配给。吃饱以后，天也不会亮。",
        "太阳不再供光，地热保温不能代替所有照明。",
        "太阳熄灭后，地热与可食菌毯保障温饱，额外照明另耗能源；" + (h("talking-plants") ? "植物也不能靠表达需求长出光。" : "领到口粮不等于领到照明额度。"),
        { energy: "geothermal-food", light: h("talking-plants") ? "plant-light-budget" : "separate-budget" });
      case "science-lock": return fact("tool-ceiling", "工场实况", "突破未到修补照常",
        "新实验又得旧结果。" + sample + "修补后继续用，目前最新成果是修好了。", "基础原理锁定，改良只能用已验证的办法。",
        "智子锁死基础实验，" + sample + "可修补但不能靠换年份升级；" + (ctx.silent ? "上限只能反复实做验证。" : "维修接单，越界试验不接单。"),
        { ceiling: ctx.stage, verification: ctx.silent ? "demonstration" : "recorded" });
      case "dark-forest": {
        const mode = ctx.level >= 6 && !ctx.silent && !(h("offline-world") && era.n >= 7) ? "shielded-signal" : ctx.heat === "fire" ? "covered-fire" : "concealed-delivery";
        const after = mode === "shielded-signal" ? "通信移进屏蔽区。货到以前不公开定位，送到不含广而告之。" : mode === "covered-fire" ? "炊火藏进遮蔽处，领食的人改到近处找。饭照做，烟不负责指路。" : "物资藏在遮蔽处，领货人须走近核对。货备好了，远看仍像没这回事。";
        return fact("location-secrecy", "配送须知", "货已备好位置保密", after,
          "可定位的外泄会招来静默，遮蔽处仍能正常用能。",
          "黑暗森林下，" + after + "地热菌食兜住温饱，配送仍需保密。", { exposure: mode });
      }
      case "flat-world": return fact("single-lane-freight", "通行快讯", "前面停下全队休息",
        "搬运者过完窄口，下一人才动身。前面停下歇脚，后面同步休息。上方已无路可借。", "厚度归零后不能跨越，排队不是新增的一层空间。",
        "降维后，人和货不能重叠或翻越；同一路口逐人通行，搬运暂停时后方也得停下，不能搭桥越过去。",
        { geometry: "planar", crossing: "serial" });
      case "inherited-memory": return fact("inherited-skill", "手艺消息", "祖辈会做后人试做",
        ctx.silent ? "祖辈的手艺还能照做，记忆里的字句读不出了。手会了，眼前的材料还得重试。" : "祖辈手艺直接想起，新材料仍须上手试。经验几代同堂，返工由在场的人完成。",
        "记忆保留原主视角，不会自动适应眼前的材料。",
        "记忆继承省去了回忆手法的时间，却不替人验材料；" + (ctx.silent ? "失语滤掉词句，只剩动作与感受可试用。" : "旧经验须在眼前的实物上重做。"),
        { inheritance: ctx.silent ? "motor-only" : "perspective-bound" });
      case "fast-time": {
        const arrested = h("immortality"), capped = h("thirty-years");
        const upload = !arrested && ctx.ending === "uploaded";
        return fact("career-duration", "用工观察", arrested ? "人不老工具照旧磨损" : upload ? "上传不能催交货" : "人先交班活照旧慢",
          arrested ? (capped ? "长生止住衰老，三十岁前仍须交班。工具能接着用，任期不能接着算。" : "长生止住衰老，岗位不再因年老空出。工具倒是照常磨损，先换工具。") : upload ? (capped ? "上传避开身体衰老，三十年限额照算。换了载体，没换起算日。" : "上传避开身体衰老，外部订单仍走原钟。人已上传，货还在路上。") : "身体衰老加快十倍，交班提前。工具照旧慢慢做，并未随人赶工。",
          arrested ? "长生优先阻止衰老；它不取消另设的寿命上限。" : "改变的是身体衰老，不是思考速度和生产时钟。",
          arrested ? "时间加速的衰老效应被长生阻断；" + (capped ? "三十年硬上限仍要求到期交接。" : "器材照常磨损，旧岗位须另安排接任。") : upload ? "上传者不再按生身衰老，但外部生产仍走原钟；" + (capped ? "三十年上限对上传者照算。" : "订单不能按主观时间提前交付。") : "时间加速只催老身体，成人任期拆短交接，工具仍按原速生产" + (capped ? "，也不能越过三十年上限。" : "，不能借此十倍交货。"),
          { aging: arrested ? "arrested" : upload ? "nonbiological" : "tenfold", lifespan: capped ? "thirty" : "uncapped" });
      }
      case "half-gravity": return fact("freight-braking", "搬运提醒", "提得起还得拦得住",
        ctx.ending === "voyage" ? "异星卸货先测重力，再定搬法。地球上的省力经验随船到了，此地尚未验收。" : "货物轻了一半，制动距离仍须留足。提起来省力，停下来按原份量办。",
        "重量改变，质量与惯性不变；规则只覆盖地表及近地。",
        "重力减半不减惯性，搬得动的货仍可能停不住；" + (ctx.ending === "voyage" ? "殖居地先实测重力，再定卸货办法。" : "接货者先留制动距离，再接手搬运。"),
        { gravity: ctx.ending === "voyage" ? "remeasure-off-earth" : "half-earth", inertia: "unchanged" });
      case "immortality": return fact("housing-turnover", "住处消息", h("thirty-years") ? "长生不附无限住期" : "人可长生住处轮用",
        h("thirty-years") ? "长生挡住衰老，挡不住三十年硬上限。住处仍须到期交接，长住不作无限期处理。" : "旧住户不再自然退出，公共住处改为轮住。人能一直住，不能一直住这儿。",
        h("thirty-years") ? "三十年是硬上限，长生只保留此前的不衰老。" : "人数不靠衰老减少，住处面积也没有增加。",
        h("thirty-years") ? "全民长生遇到三十年硬上限，只在限额内停止衰老，不能订无限住期；住处仍需到期交接。" : "全民长生让旧住户长期留下，住房不会同步增加；公共住处改轮住，旧住户不能永久占用空位。",
        { tenure: h("thirty-years") ? "thirty-year-cap" : "rotating-use" });
      case "no-language": return fact("physical-consent", "办理须知", "双方都得带着东西来",
        "双方带实物到场，当面重做操作。点头不算约定，站着没走也不算同意。", "词语和约定符号失效，只能直接观察、模仿和核对。",
        "语言消失后，文字与暗号都不能代办；交易双方须在实物前重做操作，沉默不被当作同意。",
        { communication: "non-symbolic", consent: "direct" });
      case "falling-moon": return fact("tidal-access", "住区通告", "住处已备好潮还没退",
        "安全住处全员有份，搬行李须等潮窗。住处已经腾好，路还要等海腾出来。", "避难区保障安全，外面的潮汐仍限制搬运。",
        "月球缓慢下坠扰乱潮汐，安全住处全员有份；行李只能趁潮窗搬入，错过窗口先留在安全区。",
        { shelter: "guaranteed", access: "tidal-window" });
      case "offline-world": return fact("network-delivery", "通信快讯", "更新正在赶路",
        ctx.silent ? "远程网络停用，工具样品由人送来，当场示范。新做法来得快不快，先看脚程。" : "远程网络停用，新资料随存储载体送来。更新尚在路上，催得再急也要算运程。",
        "单机仍可工作，远方的更新不能隔空到达。",
        "全球断网后，单机工具照用；" + (ctx.silent ? "失语又使文字无效，收件人须等实物示范。" : "资料随载体运输，抵达前只能用手边的旧版。"),
        { delivery: ctx.silent ? "physical-demonstration" : "storage-carrier" });
      case "talking-plants": return fact("root-irrigation", "灌溉消息", ctx.silent ? "浇水仍得蹲下看土" : "根部消息仅限本株",
        ctx.silent ? "植物的话无人听懂，浇水仍看根土和叶色。站着听不出结果，最后还是蹲下摸土。" : h("sun-off") ? "植物能报缺光，补光仍须另供能源。需求已经说清，光不会自行前来。" : "植物只报脚下缺水，邻地仍须另查。根扎得再深，也不替邻地作证。",
        ctx.silent ? "语言消失优先，会说话不等于有人能听懂。" : "植物只感知自身，不能代替整片地的检查。",
        ctx.silent ? "植物会说话被失语阻断，人不能理解根部话音，灌溉退回实测根土；叶色不是新暗号。" : h("sun-off") ? "太阳熄灭后植物报缺光，补光仍另耗能量；活根不能移动，也不能用说话代替光照。" : "植物会说话后可报自身缺水，灌溉按根部实况调整；它不知道邻地的干湿，不能代远处作证。",
        { sensing: ctx.silent ? "speech-blocked" : h("sun-off") ? "light-deficit" : "local-water" });
      case "thirty-years": return fact("contract-horizon", "合约须知", "工具可接班寿限不续",
        ctx.ending === "uploaded" ? "上传后仍按原起点算三十年，手头服务须提前交接。搬进新载体，不赠新任期。" : ctx.ending === "voyage" ? "远航须在当事人三十岁前完成。行程先按寿限排，路远不算延期理由。" : "手头的活须在当事人三十岁前完成，工具留给接任者。能传下去的是工具，不是余下的任期。",
        "寿命限额不可延长，换身体和换住处都不重新计时。",
        "三十年寿命上限约束每名签约者，" + (ctx.ending === "uploaded" ? "上传不续寿，" : ctx.ending === "voyage" ? "远航不豁免，" : "") + "工具及非人格资料可以交接，不能把接任者当成原人续约。",
        { limit: "thirty", service: ctx.ending === "uploaded" ? "identity-not-reset" : ctx.ending === "voyage" ? "voyage-within-life" : "handover" });
      case "no-borders": return fact("migration-access", "迁居新规", "边界撤了山还在",
        "迁居不查国籍，进私人住处仍须本人同意。山没搬走，别人家也没变成近路。", "取消的是国界限制，不是地形和私人空间。",
        "国界消失后，迁居免去身份关卡，山路仍须自己走；" + (ctx.silent ? "不能靠符号授权，屋主须在场直接核对。" : "本人授权不等于拿到了沿途每扇门的钥匙。"),
        { border: "removed", permission: ctx.silent ? "in-person" : "personal" });
      case "live-exams": {
        const canceled = h("no-exam"), hidden = h("dark-forest") || s.mechanisms.some((m) => m.id === "dark-forest");
        const channel = hidden ? "enclosed" : ctx.silent || h("offline-world") || ctx.level < 7 ? "onsite" : "broadcast";
        const venue = channel === "enclosed" ? "遮蔽场内" : channel === "onsite" ? "现场" : "直播画面内";
        return fact("public-assessment", "实作消息", canceled ? "围观热闹不折算岗位" : "观众到齐分数不加",
          canceled ? "考试取消，" + venue + "改展实作。围观人气不排录用名次，热闹不折算岗位。" : "成年技能考核在" + venue + "进行，旁观者不得提示。人多只算围观多，不给成绩添分。",
          canceled ? "取消考试优先，公开要求转为展示过程。" : "公开的是作答过程，观众不获得评分权。",
          (canceled ? "取消考试压过直播考试，" : "成年技能考试公开，") + venue + (canceled ? "改作实作展演，人气不换录用名次。" : "可看操作但不得提示，围观人数不计入成绩。"),
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
    function add(topic, theme, title, before, after, why, body, ids, policyIndex, mechanismIds) {
      const limitedWork = has("thirty-years") || (has("fast-time") && !has("immortality"));
      const household = {
        "household-compute": { basic: "reserved", extra: "wait-for-capacity" },
        "household-meal": { basic: "reserved", extra: has("free-goods") && has("four-hour") ? "no-afternoon-refill" : has("sun-off") ? "separate-light-budget" : "wait-for-stock" },
        "household-access": { access: has("falling-moon") ? "tidal-window" : "wait-for-neighbor" },
        "household-work": { work: limitedWork ? "early-handover" : "proof-not-vacancy" },
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
    if (cards.length < 2 && (has("no-exam") || has("thirty-years") || (has("fast-time") && !has("immortality")))) {
      const limited = has("thirty-years") || (has("fast-time") && !has("immortality"));
      add("household-work", "工作", limited ? "交班早于工具报废" : "求职者带成品上门", "拿到资格就能订长期岗位",
        limited ? "接任者提前来接手，旧工具还能继续用。" : "求职者带着成品来，录用仍须等岗位空出。",
        limited ? "人的任期受限，工具寿命并没有同步缩短。" : "门槛改成实际工作，空位并没有因此增加。",
        "成年人把能交接的工具留给下一位使用者，接任不能只靠原人的经历作保。",
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
