const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('data.js', 'utf8');
const sandbox = { window: {}, module: { exports: {} }, console };
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const data = sandbox.window.WRM_DATA || sandbox.module.exports;
if (!data) throw new Error('WRM_DATA not found');

let errors = [];
const rules = data.rules || [];
console.log('rules:', rules.length);
for (const r of rules) {
  console.log('\nRULE', r.id, r.title, 'params', r.params.length);
  if (r.params.length !== 4) errors.push(`${r.id}: params != 4`);
  for (const p of r.params) {
    if (!p.effect || typeof p.effect !== 'object') errors.push(`${r.id}.${p.id}: no effect`);
  }
  for (const key of ['A', 'B']) {
    const w = r.presets[key];
    if (!w) { errors.push(`${r.id}: missing preset ${key}`); continue; }
    console.log(`  ${key} ${w.name} metrics`, JSON.stringify(w.metrics));
    const dims = w.dimensions || {};
    const dimKeys = Object.keys(dims);
    if (dimKeys.length !== 4) errors.push(`${r.id}.${key}: dimensions != 4`);
    for (const d of dimKeys) {
      if (!Array.isArray(dims[d]) || dims[d].length < 2) errors.push(`${r.id}.${key}.${d}: <2 items`);
      for (const item of dims[d] || []) {
        if (!item.certainty) errors.push(`${r.id}.${key}.${d}: missing certainty`);
      }
    }
    if ((w.events || []).length !== 6) errors.push(`${r.id}.${key}: events != 6`);
    if ((w.edges || []).length !== 6) errors.push(`${r.id}.${key}: edges != 6`);
    if ((w.unintended || []).length !== 3) errors.push(`${r.id}.${key}: unintended != 3`);
    const ids = new Set((w.events || []).map(e => e.id));
    for (const e of w.edges || []) {
      if (!ids.has(e.from) || !ids.has(e.to)) errors.push(`${r.id}.${key}: edge ref missing ${e.from}->${e.to}`);
      if (!e.explanation) errors.push(`${r.id}.${key}: edge no explanation`);
    }
    const paramKeys = Object.keys(w.params || {});
    const ruleParamKeys = r.params.map(p => p.id);
    if (paramKeys.length !== 4 || !ruleParamKeys.every(k => paramKeys.includes(k))) errors.push(`${r.id}.${key}: params mismatch`);
    for (const m of ['fairness', 'efficiency', 'freedom', 'stability']) {
      if (typeof w.metrics[m] !== 'number') errors.push(`${r.id}.${key}: metric ${m} missing`);
    }
    if (!w.report || !w.report.quote) errors.push(`${r.id}.${key}: report missing`);
  }
}
console.log('\nerrors:', errors.length);
errors.forEach(e => console.log(' -', e));
process.exit(errors.length ? 1 : 0);
