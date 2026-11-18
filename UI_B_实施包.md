# B · 报纸/编辑部方案 · 实施包

> 选定方案：**B 报纸/编辑部**。
> 预览：`ui-mockups/index.html?scheme=b`
> 海报：`ui-mockups/b-poster.html` → `b-poster.png`
> 截图：`scheme-b-top.png`（首页）、`scheme-b.png`（整页）、`scheme-b-mobile.png`（手机）
> 设计 skill：`frontend-design`（Anthropic 官方，Apache-2.0），已装在 `C:\Users\Administrator\.dsh\skills\frontend-design\SKILL.md`

---

## 0. 一句话定调

**这是一份印出来的社会规则实验报告，不是一张 AI 产品落地页。**
报头、多栏、细线、单一深红、宋体大字；所有结构线都在编码信息，不做装饰。

---

## 1. Design tokens（直接抄进 CSS）

### 颜色
| Token | 值 | 用途 |
|---|---|---|
| `--paper` | `#F4F1E9` | 新闻纸底色 |
| `--paper-2` | `#ECE6D8` | 次级纸色/表头 |
| `--ink` | `#141414` | 正文/标题/边框 |
| `--muted` | `#5A564C` | 说明/注释 |
| `--rule` | `#B9B2A2` | 细分割线 |
| `--accent` | `#A6231A` | 唯一强调色（深红） |
| `--accent-2` | `#1F3A5F` | 次强调（可选，链接/编号） |
| `--success` | `#3F5B3A` | 少量“已验证”状态 |
| `--warn` | `#8A5A3B` | 假设/不确定提示 |

**禁止**：紫蓝渐变、玻璃拟态、3D 光球、星空、霓虹、阴影、大圆角。

### 字体
```css
--font-serif: "Source Han Serif SC", "Noto Serif CJK SC", "Songti SC", SimSun, serif;
--font-mono:  "IBM Plex Mono", "JetBrains Mono", Consolas, monospace;
--font-sans:  "Source Han Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif;
```
- 标题/正文：宋体（`--font-serif`）
- 数据、标签、时间线、注释：等宽（`--font-mono`）
- 少量按钮/表单：无衬线（`--font-sans`）
- 不引入外部字体文件；用系统字体栈，离线可用。

### 字号与行高（桌面）
| 角色 | 字号 | 行高 | 备注 |
|---|---|---|---|
| 报头 | 40px | 1.1 | 居中，字距 .08em |
| 大标题 | 96–108px | .92 | 两行以内，字距 -.05em |
| 章节标题 | 30px | 1.2 | 宋体，不用全大写 |
| 小标题 | 18px | 1.35 | |
| 正文 | 15–16px | 1.75 | 行长 ≤ 42 汉字 |
| 小字 | 12–13px | 1.6 | 说明/注释 |
| 数据/标签 | 9–11px | 1.5 | 等宽 |

移动端：大标题 48–56px；章节标题 26px；正文 14px；最小字号不小于 11px。

### 间距 / 版式
```css
--max: 1280px;
--gutter: 40px;      /* 手机 22px */
--section-y: 48px;   /* 手机 32px */
--hairline: 1px solid var(--rule);
--heavy: 3px solid var(--ink);
--double: 4px double var(--ink);
```
- 12 栏网格；首页 3 栏（标题 2 栏 + 规则面板 1 栏）
- 世界页 2×2 四维；对比页 2 栏；报告页 2 栏
- 不用圆角（`border-radius: 0`）、不用 box-shadow
- 分节只用细线/双线，不用大色块

### 动效
- **只保留一个**：点击“生成这个世界”时，报告卡右上角红色印章 `scale(1.15)→scale(1)` + 透明度 0→1，220ms，`cubic-bezier(.2,.75,.2,1)`。
- 不做卡片 hover 上浮、不做逐段 fade-in、不做滚动视差。
- `prefers-reduced-motion: reduce` 时全部关闭。

---

## 2. 组件清单

| 组件 | class | 说明 |
|---|---|---|
| 报头 | `.masthead` | 居中品牌 + 副标 + 导航行 + 右上角期号 |
| 规则面板 | `.rule-panel` | 无卡片、左侧 1px 竖线；当前项底部 2px 红line |
| 参数格 | `.param-grid` / `.param` | 4 列边框网格；方块 checkbox；说明小字 |
| 生成按钮 | `.generate` | 黑底白字矩形；hover 变深红；无圆角 |
| 世界标题 | `.world-head` | 世界名 + 规则/参数一行 |
| 四维面板 | `.world-grid` / `.dim` | 桌面 2×2，手机 1 列；右上角“推算/假设/不确定”标签 |
| 因果图 | `.causal` + `.causal-list` | 桌面 SVG，手机竖排列表；实线/虚线图例 |
| 意外后果 | `.unexpected` | 3 条，编号只用于“意外 01/02/03”这种真实列举 |
| 对比表 | `.compare-grid` | 两栏；指标条为扁平矩形，无圆角 |
| 报告卡 | `.report-card` | 无外框，顶部 3px 线；右上角印章 |
| 海报 | `b-poster.html` | 1080×1440，Canvas 导出 PNG |
| 方案切换 | `.switcher` | 仅 mockup 用；生产删除 |

### 关键 DOM
```html
<header class="masthead">
  <div class="brand"><h1>世界规则修改器</h1><div class="latin">World Rule Modifier · 社会规则实验室</div></div>
  <nav>规则库 · 实验台 · 方法 · 档案</nav>
  <div class="issue">号外 · 第 014 期<br>情景推演，不是预测</div>
</header>

<section class="hero">
  <div class="hero-copy">
    <p class="kicker">规则实验 / 教育制度</p>
    <h2>如果大学<br>不再有考试</h2>
    <p class="dek">……</p>
    <div class="steps"><span>选规则</span><span>调参数</span><span>生成世界</span></div>
  </div>
  <aside class="rule-panel">……</aside>
</section>

<section class="params">
  <div class="section-head"><h3>设定这个世界的四个参数</h3><p>……</p></div>
  <div class="param-grid">……</div>
  <button class="generate">生成这个世界 →</button>
</section>

<section class="world">
  <div class="section-head"><h3>无考场社会 · 第十年</h3><p>规则/参数……</p></div>
  <div class="world-grid">4 × .dim</div>
  <div class="causal-wrap"><svg class="causal">…</svg><ol class="causal-list">…</ol></div>
  <div class="unexpected">3 条</div>
</section>

<section class="compare">…</section>
<section class="report">…</section>
```

---

## 3. 页面线框

### 首页
```
┌──────────────────────────────────────────────┐
│        世界规则修改器（居中）      号外·014    │
│        World Rule Modifier          不是预测  │
│  规则库   实验台   方法   档案                │
├──────────────────────────────────────────────┤
│ 规则实验/教育制度      │ 选择一条规则   1/4   │
│ 如果大学               │ ─────────────────   │
│ 不再有考试             │ 取消大学考试  已选   │
│                        │ 每天只工作四小时     │
│ 选一条规则，调四个参数  │ 商品不再有价格       │
│ ……                     │ 人类不需要睡觉       │
│ 选规则 调参数 生成世界  │ 或写一条自己的规则   │
├──────────────────────────────────────────────┤
│ 设定四个参数                                   │
│ [仍发毕业证] [自由选课] [教师评价] [企业看学历] │
│ [生成这个世界 →]                               │
└──────────────────────────────────────────────┘
```

### 世界页
```
无考场社会 · 第十年        规则/参数
┌──────────────┬──────────────┐
│ 教育          │ 经济          │
├──────────────┼──────────────┤
│ 社会          │ 个人          │
└──────────────┴──────────────┘
因果图（桌面 SVG / 手机竖排列表）
意外 01 / 02 / 03
```

### 对比页
```
同一条规则，两个世界
┌──────────────┬──────────────┐
│ 世界 A 无证社会 │ 世界 B 证书社会 │
│ 公平 ▓▓▓ 64    │ 公平 ▓▓ 42     │
│ 效率 ▓▓▓ 71    │ 效率 ▓▓ 58     │
│ 自由 ▓▓▓▓ 82   │ 自由 ▓▓▓ 66    │
│ 稳定 ▓▓ 48     │ 稳定 ▓▓▓ 61    │
└──────────────┴──────────────┘
差异：自由 +16 / 公平 +22 / 稳定 −13
```

### 报告页 / 海报
```
号外 · 世界线档案 A-014
无考场社会
规则：取消大学考试
第1年 → 第3年 → 第5年 → 第10年
四维变化 / 三个意外 / 因果链一句话
[情景推演，不是预测] 印章
```

---

## 4. 数据契约（先写 data.js，再写页面）

> **已落地：** `world-rule/data.js`（3 条规则 × A/B 两套完整世界）+ `world-rule/engine.js`（指标修正 + A/B 对比），校验与测试均通过。

```js
export const RULES = [
  {
    id: "no-exam",
    title: "取消大学考试",
    category: "教育规则",
    params: [
      { id: "diploma", label: "仍发毕业证", type: "toggle", default: true, note: "没有考试，证书还代表什么？" },
      { id: "freeCourse", label: "允许自由选课", type: "toggle", default: true, note: "学生自己决定学什么。" },
      { id: "teacherEval", label: "教师保留评价权", type: "toggle", default: false, note: "课堂表现、项目、推荐信算数。" },
      { id: "employerDegree", label: "企业仍看学历", type: "toggle", default: false, note: "招聘时，学校名字还有用吗？" }
    ]
  }
];

export const WORLD = {
  ruleId: "no-exam",
  name: "无考场社会 · 第十年",
  params: { diploma: true, freeCourse: true, teacherEval: false, employerDegree: false },
  metrics: { fairness: 64, efficiency: 71, freedom: 82, stability: 48 },
  dimensions: {
    education: [{ title: "课程项目制", change: "毕业看作品集和长期学习记录。", causal: "因为考试取消，学校改用项目评价。", certainty: "推算" }],
    economy: [],
    society: [],
    individual: []
  },
  events: [{ id: "e1", title: "考试取消", year: 1, certainty: "推算" }],
  edges: [{ from: "e1", to: "e2", relation: "导致", strength: 3, assumption: false }],
  unintended: [{ title: "作品集补习班", description: "新的“提分”产业出现。" }],
  report: { title: "无考场社会", quote: "一个没有考场的社会，最后用作品集和推荐信重新造了考场。", confidence: "中" }
};
```

**规则**：
- 每条变化必须有 `certainty`：`推算 | 假设 | 不确定`。
- 每条因果边必须有 `assumption` 布尔值和一句 `explanation`。
- 禁止在数据里写具体统计数字，除非有来源；示例数字只能标“示意”。
- AI 只填 `narrative` 字段；`metrics/events/edges` 由引擎算。

---

## 5. Qoder 提示词（按文件复制）

### Prompt 0 · 全局约束（每次对话开头贴）
```
我们在做「世界规则修改器」，已选定 B 报纸/编辑部方案。只做 B，不要 A/C/D 的视觉。
设计铁律：
1) 新闻纸 #F4F1E9，墨 #141414，细线 #B9B2A2，唯一强调深红 #A6231A。
2) 宋体标题 + 等宽数据；不用紫蓝渐变、玻璃拟态、3D 光球、emoji、圆角卡片、阴影。
3) 标题不单独给某个词换色/斜体；强调靠整行规则线、留白、字号。
4) 编号只用于真实顺序（步骤、时间线、意外 01/02/03），不当装饰。
5) 只保留一个动效：生成世界时报告卡印章落下 220ms；不做 hover 上浮/逐段 fade。
6) 所有变化标注“推算 / 假设 / 不确定”；AI 只写叙述，不改数值。
输出要求：先给文件结构，再一次只写一个文件；每写完一个文件给自测步骤。
```

### Prompt 1 · index.html
```
按 B 方案写 index.html（纯静态，无框架）。结构：
- .masthead：居中 h1「世界规则修改器」+ 副标 + 导航行 + 右上角「号外 · 第 014 期」。
- .hero：3 栏 grid；左 2 栏是 kicker / h2「如果大学不再有考试」/ dek / 三步流程；右 1 栏 .rule-panel（4 条规则 + 自定义输入）。
- .params：4 列参数格 + 生成按钮。
- .world：世界标题 + 2×2 四维面板 + 因果图（SVG + 手机列表）+ 3 条意外。
- .compare：两栏世界 A/B + 4 个指标条 + 差异行。
- .report：报告卡 + 右侧解读 + 印章。
- footer：免责声明。
只写结构，CSS 放 styles.css；不要内联大段样式。
```

### Prompt 2 · styles.css
```
按 B 方案写 styles.css，使用这些 tokens：
--paper:#F4F1E9; --paper-2:#ECE6D8; --ink:#141414; --muted:#5A564C;
--rule:#B9B2A2; --accent:#A6231A; --accent-2:#1F3A5F;
字体：宋体标题/正文，IBM Plex Mono 数据。
要求：
- 0 圆角、0 阴影、0 渐变（纸纹允许 repeating-linear-gradient 细线）。
- 报头居中，3 栏 hero，2×2 world，2 栏 compare，2 栏 report。
- 断点 1000px / 620px；手机 1 列、字号不小于 11px、timeline 2×2。
- 焦点可见：:focus-visible 2px solid var(--accent)，offset 3px。
- 只保留一个 @keyframes inkPress（印章），prefers-reduced-motion 关闭。
```

### Prompt 3 · data.js
```
写 data.js：3 条规则（取消大学考试 / 每天工作 4 小时 / 商品不再有价格），每条 4 个参数；
给“取消大学考试”写完整示例：4 个维度各 2 条变化、6 个事件、6 条因果边、3 个意外后果、A/B 两套指标。
每条变化带 certainty: 推算|假设|不确定；每条边带 assumption 和 explanation。
不要写具体统计数字；示例数字标注“示意”。
```

### Prompt 4 · engine.js
```
写 engine.js（纯前端，无依赖）：
输入 ruleId + params；输出 metrics（公平/效率/自由/稳定，0-100）、dimensions、events、edges、unintended、confidence。
要求：
- 参数真正影响结果：至少 3 个参数各自改变 2 个指标或 1 条因果边。
- 同一输入必须可复现（固定权重表，不用随机）。
- 每个事件有 year、certainty；每条边有 relation/strength/assumption/explanation。
- 提供 compare(a,b) 返回指标差和“差异最大”的三项。
- 不调用 AI；AI 只用于 narrative。
先给权重表和计算伪代码，再写代码。
```

### Prompt 5 · causal.js
```
写 causal.js：把 events/edges 渲染成 SVG 因果图。
- viewBox 0 0 930 300；节点矩形、箭头 marker、实线=assumption false、虚线=assumption true。
- 边标签显示“导致/放大/抑制”，强度 1-5 用线宽区分。
- 手机（<1000px）隐藏 SVG，渲染 .causal-list 竖排：事件 → 结果（假设）。
- 提供 legend：实线=规则导致，虚线=带假设的推断。
```

### Prompt 6 · report.js / poster.js
```
写 report.js：渲染报告卡（标题/规则/时间线/三条结论/印章/免责声明）。
写 poster.js：用 Canvas 生成 1080×1440 世界线海报，包含报头、标题、规则行、四维摘要、时间线、三个意外、因果链、印章、免责声明；字体用系统宋体/等宽；下载 PNG。
要求：海报不依赖外部图片；中文不重叠；先算文字换行再绘制；提供“下载海报”按钮。
```

### Prompt 7 · AI 层（可选）
```
写 ai.js：可选 AI 叙事层。输入 engine 输出的结构化世界，输出严格 JSON 的 narrative（四维解读 + 三条意外 + 一句结论）。
要求：15s 超时；JSON 校验；失败静默回退到 data.js 模板；API Key 不写死；离线演示用预生成缓存。
AI 不得修改 metrics/events/edges；不得编造统计数字；不得预测真实未来。
```

### Prompt 8 · 验收自检
```
以挑剔评委 + 设计师视角检查 B 方案：
1) 有没有紫蓝渐变/玻璃/3D/emoji/圆角卡片/阴影？逐条改。
2) 有没有“标题里单独一个词换色”？改成整行强调。
3) 编号是否只用于真实顺序？删掉装饰性 01/02/03。
4) 手机 390px 是否可读？正文是否 ≥11px？因果图是否变成竖排？
5) 参数是否真的改变结果？举 2 组参数对比证明。
6) 3 分钟演示哪一步会冷场？
7) 评委最可能问的 8 个问题 + 一句话答案（含“这不就是 AI 写故事吗”“和 ChronoWeave/文明有什么区别”）。
```

---

## 6. 3 分钟演示（B 的报纸叙事）

1. **30s 场景**：把报纸往桌上一放——“这是一份来自另一个十年后的号外。”
2. **60s 选规则/调参数**：选“取消大学考试”，拨两个参数：“发不发毕业证、企业还看不看学历。”
3. **60s 生成世界**：四维面板 + 因果图；指出“实线是规则导致，虚线是假设”。
4. **30s 双世界对比**：世界 A 更自由但更不稳，世界 B 更稳但公平更低。
5. **20s 海报**：点“下载海报”，一张世界线号外。
6. **10s Qoder**：从 0 到部署都在 Qoder，截图。

**收尾话术**：
> “我们没有让 AI 编一个未来。我们让规则算因果，AI 只负责把它讲成人话。所以同一个问题，换一个参数，世界会真的不一样。”

---

## 7. 验收标准（做完打勾）

- [ ] 1440px 下报头/3 栏 hero/2×2 world/2 栏 compare/report 与 mockup 一致
- [ ] 390px 下 1 列、字号 ≥11px、因果图变竖排、时间线 2×2
- [ ] 0 圆角、0 阴影、0 紫蓝渐变、0 emoji、0 装饰性编号
- [ ] 参数改变 → 指标/事件/因果边至少 3 处变化
- [ ] 每条变化有“推算/假设/不确定”标签
- [ ] 海报 1080×1440 可下载 PNG，中文不重叠
- [ ] 断网可玩；AI 失败自动回退
- [ ] 3 分钟演示不超时
- [ ] 作品帖有 3 个真实试用 + 1 句原话 + 截图

---

## 8. 文件与下一步

- B mockup：`ui-mockups/index.html?scheme=b`
- B 海报：`ui-mockups/b-poster.html` / `b-poster.png`
- B 截图：`scheme-b-top.png`、`scheme-b.png`、`scheme-b-mobile.png`
- B 说明：`UI方案_四套.md`
- 设计 skill：`C:\Users\Administrator\.dsh\skills\frontend-design\SKILL.md`

下一步建议：先把 **data.js 的 3 条规则 × 4 参数 × 4 维 × 6 事件** 写出来（Prompt 3），再让 Qoder 写 engine.js（Prompt 4）——先把“参数真的改变结果”跑通，页面最后套 B 的皮。这样不会做成“漂亮的空壳”。
