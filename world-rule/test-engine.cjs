const fs = require('fs');
const vm = require('vm');
const sandbox = { window: {}, module: { exports: {} }, console };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('data.js', 'utf8'), sandbox);
vm.runInContext(fs.readFileSync('engine.js', 'utf8'), sandbox);
const data = sandbox.window.WRM_DATA;
const engine = sandbox.window.WRM_ENGINE;

let errors = [];
console.log('rules:', engine.listRules().length);

for (const rule of data.rules) {
  for (const key of ['A', 'B']) {
    const preset = rule.presets[key];
    const out = engine.evaluate(rule.id, preset.params);
    const m = preset.metrics;
    const ok = ['fairness', 'efficiency', 'freedom', 'stability'].every(k => out.metrics[k] === m[k]);
    console.log(`${rule.id}.${key}: match=${out.match} metrics=${JSON.stringify(out.metrics)} ${ok ? 'OK' : 'MISMATCH'}`);
    if (!ok) errors.push(`${rule.id}.${key} metric mismatch`);
    if (out.match !== 'exact') errors.push(`${rule.id}.${key} not exact`);
    if (!out.report || !out.report.quote) errors.push(`${rule.id}.${key} no report`);
  }

  const defaults = engine.defaultParams(rule);
  const d = engine.evaluate(rule.id, defaults);
  console.log(`${rule.id} defaults:`, JSON.stringify(d.metrics), d.match);
  for (const k of ['fairness', 'efficiency', 'freedom', 'stability']) {
    if (d.metrics[k] < 0 || d.metrics[k] > 100) errors.push(`${rule.id} default metric out of range`);
  }

  const cmp = engine.compare(rule.id, rule.presets.A.params, rule.presets.B.params);
  console.log(`${rule.id} compare top:`, cmp.top.map(x => `${x.label}${x.delta > 0 ? '+' : ''}${x.delta}`).join(' / '));
  if (!cmp.top.length) errors.push(`${rule.id} compare empty`);
}

console.log('\nerrors:', errors.length);
errors.forEach(e => console.log(' -', e));
process.exit(errors.length ? 1 : 0);
