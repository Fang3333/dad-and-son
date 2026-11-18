# 世界规则修改器 · 数据层

> `data.js` 是 B 方案的“世界内容库”：3 条规则 × 2 套预设世界（A/B）× 4 个维度 × 6 个事件 × 6 条因果边。
> 所有数字都是**示意**，不是统计数据，也不是对真实未来的预测；只用于同一规则内 A/B 对比。

## 文件

| 文件 | 作用 |
|---|---|
| `data.js` | 规则 / 参数 / 两套完整世界 / 指标 / 事件 / 因果边 / 意外 / 报告 |
| `engine.js` | 规则引擎：按参数选预设、按 `param.effect` 修正指标、A/B 对比 |
| `validate.cjs` | Node 校验：字段、数量、因果边引用、参数一致性 |
| `test-engine.cjs` | Node 测试：A/B 预设精确匹配、默认参数、对比结果 |

## 快速使用

```html
<script src="data.js"></script>
<script src="engine.js"></script>
<script>
  const d = window.WRM_DATA;
  const rule = d.rules[0];                    // 取消大学考试
  const worldA = rule.presets.A;              // 无证社会
  const worldB = rule.presets.B;              // 证书社会

  const out = WRM_ENGINE.evaluate('no-exam', {
    diploma: false, freeCourse: true, teacherEval: false, employerDegree: false
  });
  console.log(out.metrics);                   // 64/71/82/48
  console.log(out.match);                     // "exact"
  console.log(out.report.quote);

  const cmp = WRM_ENGINE.compare('no-exam', worldA.params, worldB.params);
  console.log(cmp.top);                       // 公平+22 / 自由+16 / 效率+13
</script>
```

不用构建、不用 npm；`data.js` 挂到 `window.WRM_DATA`，`engine.js` 挂到 `window.WRM_ENGINE`。

> v0.1 的限制：任意参数组合会选“最近预设”的内容底本，只对指标做修正；要让事件/因果边也随单个参数变化，v0.2 需要给事件加 `requires` 条件（见文末）。

## 数据结构

```js
WRM_DATA = {
  meta: {
    version, updated, disclaimer,
    certaintyLegend: { 推算, 假设, 不确定 },
    scaleNote, presetNote
  },
  rules: [{
    id, title, category, icon, premise, question,
    params: [{
      id, label, note, default,
      effect: { fairness, efficiency, freedom, stability }  // 参数对指标的方向性影响
    }],
    presets: {
      A: {
        id, name, tagline,
        params: { ... },                 // 4 个参数的具体取值
        metrics: { fairness, efficiency, freedom, stability }, // 0–100，示意
        dimensions: {
          education: [{ title, change, causal, certainty }],
          economy:   [...],
          society:   [...],
          individual:[...]
        },
        events: [{ id, year, title, description, certainty }],
        edges:  [{ from, to, relation, strength, assumption, explanation }],
        unintended: [{ title, description }],
        report: { title, quote, summary, confidence }
      },
      B: { ... }
    }
  }]
}
```

### 字段约定

- `certainty`：只能是 `推算` / `假设` / `不确定`；UI 上必须显示。
- `edges[].from/to`：必须引用同一 preset 的 `events[].id`。
- `edges[].assumption`：`true` 时 UI 用虚线；`false` 用实线。
- `edges[].strength`：1–5，UI 可用线宽表示。
- `metrics`：0–100，只做同一规则内 A/B 对比；不要跨规则比较。
- `report.quote`：一句话结论；不要写成“未来一定会怎样”。
- 禁止在数据里写真实统计数字；需要数字时标“示意”。

## 校验

```powershell
cd D:\北京邮电\02-竞赛与项目\三傻大赛\world-rule
node --check data.js
node --check engine.js
node validate.cjs
node test-engine.cjs
```

当前结果：3 条规则，每条 4 参数、A/B 两套世界；每套 4 维 × 2 条、6 事件、6 边、3 意外，0 错误；A/B 预设全部精确匹配。

## 设计原则（防止“AI 编故事”）

1. **参数必须真的改变结果**：`params[].effect` 是引擎的权重来源；A/B 预设是校准后的两个极端。
2. **每条变化都要有因果**：`causal` 不能空；不能只写“可能会”。
3. **每条边都要能解释**：`explanation` 写“为什么这条边成立”，而不是重复标题。
4. **允许“不确定”**：不确定不是缺陷，是可信度的一部分。
5. **AI 只写叙述**：`metrics/events/edges` 由规则引擎算；AI 不得改数值、不得编统计。

## 下一步

- `causal.js`：把 `events/edges` 渲染成 B 方案里的 SVG 因果图（手机变竖排）。
- `report.js`：把 `report` + `dimensions` 渲染成报告卡 / 1080×1440 海报。
- `ai.js`（可选）：只填 `narrative`，失败回退 `report` 模板。
- **v0.2 事件条件化**：给事件加 `requires: { diploma: true, ... }`，引擎按当前参数过滤；这样单个参数变化不仅改指标，也改“发生了什么”。
