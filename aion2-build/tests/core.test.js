// Unit tests for the Build Architect core. Run: node --test aion2-build/tests
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const BA = require('../core.js');

function seed() { const s = BA.seedState('2026-10-17T10:00:00.000Z'); return { s, L: BA.getChar(s, 'lycaa'), N: BA.getChar(s, 'novin') }; }

test('seed: CP, item level, gap', () => {
  const { L, N } = seed();
  assert.equal(BA.num(BA.cur(L).cp), 72815);
  assert.equal(BA.num(BA.cur(N).cp), 94580);
  assert.equal(BA.cpGap(BA.cur(L), BA.cur(N)), 21765);
  assert.equal(BA.num(BA.cur(L).itemLevel), 1693);
  assert.equal(BA.num(BA.cur(N).itemLevel), 1964);
  assert.equal(BA.cur(L).cp.m.status, 'confirmed');
});

test('divine totals 68 vs 303, missing values ignored', () => {
  const { L, N } = seed();
  assert.equal(BA.divineTotal(BA.cur(L)), 68);
  assert.equal(BA.divineTotal(BA.cur(N)), 303);
  assert.equal(BA.divineTotal({ divine: {} }), null);
});

test('pantheon 10/94 and percentages', () => {
  const { L } = seed();
  const d = BA.cur(L);
  assert.equal(d.pantheon.collected, 10);
  assert.equal(d.pantheon.total, 94);
  assert.equal(BA.pantheonPct(d), 10.6);
  assert.equal(BA.pct(1, 0), null);
  assert.equal(BA.pct(null, 10), null);
});

test('pantheon effects are not merged into divine stats', () => {
  const { L } = seed();
  const d = BA.cur(L);
  assert.equal(d.pantheon.effects.death, 36);
  assert.equal(BA.num(d.divine.death), 6);
});

test('daevanion average and arcana state', () => {
  const { L, N } = seed();
  assert.equal(BA.daevanionAvg(BA.cur(L)), 50.6);
  assert.equal(BA.arcanaState(BA.cur(L)), 'none');
  assert.equal(BA.arcanaState(BA.cur(N)), 'equipped');
});

test('skills are flagged as needing refresh and carry no outdated levels', () => {
  const { L } = seed();
  const sk = BA.cur(L).skills;
  assert.equal(sk.needsRefresh, true);
  assert.ok(sk.list.every(s => s.level === null));
  assert.equal(sk.list.length, 32);
});

test('compare: slot matching, enhancement and different items', () => {
  const { L, N } = seed();
  const c = BA.compare(BA.cur(L), BA.cur(N));
  const by = Object.fromEntries(c.slots.map(r => [r.slot, r]));
  assert.equal(by.off_hand.verdict, 'behind');
  assert.equal(by.off_hand.enhDiff, -1);
  assert.equal(by.main_hand.verdict, 'different');
  assert.equal(by.helmet.verdict, 'equal');
  assert.equal(by.boots.verdict, 'different');
  assert.ok(c.missingSystems.some(m => m.system === 'arcana'));
  assert.ok(c.unknowns.some(u => u.system === 'skills'));
  assert.ok(c.cpRelevant.some(x => /not split per item/.test(x.text)), 'no fake per-item CP');
});

test('slot and stat name mapping', () => {
  assert.equal(BA.slotIdFor('Greaves'), 'pants');
  assert.equal(BA.slotIdFor('cloak'), 'cape');
  assert.equal(BA.slotIdFor('Main-hand'), 'main_hand');
  assert.equal(BA.slotIdFor('banana'), null);
  assert.equal(BA.statIdFor('Back Attack'), 'back_attack');
  assert.equal(BA.statIdFor('Back Attack Damage Boost'), 'back_attack_damage_boost');
  assert.notEqual(BA.statIdFor('Attack'), BA.statIdFor('Attack Increase'));
});

test('recommendations: qualitative labels, data first, best next is an upgrade', () => {
  const { L, N } = seed();
  const recs = BA.recommendations(BA.cur(L), BA.cur(N), { benchName: 'Novin' });
  const ids = recs.map(r => r.id);
  assert.ok(ids.includes('arcana_start'));
  assert.ok(ids.includes('data_skills'));
  assert.equal(new Set(ids).size, ids.length, 'no duplicate recommendations');
  const lv = ['High', 'Medium', 'Low', 'Unknown'];
  recs.forEach(r => { assert.ok(lv.includes(r.dps), r.id); assert.ok(lv.includes(r.cp), r.id); });
  const best = BA.bestNext(recs, 'value', {});
  assert.notEqual(best.rec.kind, 'data');
  assert.ok(best.why.length > 20);
  assert.match(recs.find(r => r.id === 'arcana_start').description, /Novin has 4/);
});

test('upgrade dependencies: blocked items sink, order and completion', () => {
  const { L, N } = seed();
  const recs = BA.recommendations(BA.cur(L), BA.cur(N));
  const rows = BA.rank(recs, 'dps', {});
  const main = rows.find(r => r.rec.id === 'item_main_hand');
  assert.equal(main.blocked, true);
  const unblocked = BA.rank(recs, 'dps', { data_stats: true }).find(r => r.rec.id === 'item_main_hand');
  assert.equal(unblocked.blocked, false);
  const tasks = [{ id: 'b', title: 'B', dependsOn: ['a'], order: 0, status: 'todo' }, { id: 'a', title: 'A', dependsOn: [], order: 1, status: 'todo' }];
  assert.deepEqual(BA.taskOrder(tasks).map(t => t.id), ['a', 'b']);
  assert.equal(BA.canComplete(tasks[0], tasks).ok, false);
  tasks[1].status = 'done';
  assert.equal(BA.canComplete(tasks[0], tasks).ok, true);
  assert.throws(() => BA.taskOrder([{ id: 'x', title: 'X', dependsOn: ['y'] }, { id: 'y', title: 'Y', dependsOn: ['x'] }]), /cycle/);
});

test('resource calculations: shortfall, untracked, expected costs', () => {
  const r = BA.resourceCheck({ materials: [{ name: 'Kinah', amount: 2000000 }, { name: 'Stone', amount: 5, guaranteed: false }, { name: 'Gem', amount: 1 }] }, [{ name: 'kinah', amount: 1500000 }, { name: 'Stone', amount: 9 }]);
  assert.equal(r[0].short, 500000);
  assert.equal(r[1].short, 0);
  assert.equal(r[1].guaranteed, false);
  assert.equal(r[2].have, null);
});

test('snapshots: commit keeps history immutable', () => {
  const { L } = seed();
  const first = L.snapshots[0];
  BA.freeze(first);
  BA.commit(L, d => { d.cp = { v: 75000, m: BA.meta('verified', 'test', '2026-10-20') }; d.equipment.off_hand.enh = 11; }, 'Test');
  assert.equal(L.snapshots.length, 2);
  assert.equal(BA.num(first.data.cp), 72815);
  assert.equal(first.data.equipment.off_hand.enh, 10);
  const df = BA.snapshotDiff(first.data, BA.cur(L));
  assert.equal(df.cp, 2185);
  assert.equal(df.enhTotal, 1);
  assert.deepEqual(df.gear.map(g => g.slot), ['off_hand']);
});

test('conflicts: older observations never silently replace newer verified ones', () => {
  const newer = BA.meta('verified', 'screenshot', '2026-10-20');
  assert.equal(BA.judge(newer, { observedAt: '2026-10-17' }).action, 'conflict');
  assert.equal(BA.judge(newer, { observedAt: '2026-10-21' }).action, 'accept');
  assert.equal(BA.judge(null, { observedAt: '2026-10-21' }).action, 'accept');
  assert.equal(BA.judge(newer, { observedAt: null }).action, 'conflict');
});

test('number parsing handles localized formats and rejects junk', () => {
  assert.equal(BA.parseNum('72,815'), 72815);
  assert.equal(BA.parseNum('72.815'), 72815);
  assert.equal(BA.parseNum('1.234,5'), 1234.5);
  assert.equal(BA.parseNum('12,5%'), 12.5);
  assert.equal(BA.parseNum('3.25%'), 3.25);
  assert.equal(BA.parseNum('7x'), null);
  assert.equal(BA.parseNum(''), null);
});

test('extraction validation: invalid, missing, partial, uncertain', () => {
  assert.ok(BA.validateExtraction('nope', {}).errors.length);
  assert.ok(BA.validateExtraction('divine', 'text').errors.length);
  const v = BA.validateExtraction('divine', { justice: 6, freedom: '12', illusion: { value: null, uncertain: true }, time: 5000, death: 'abc' });
  const by = Object.fromEntries(v.fields.map(f => [f.path, f]));
  assert.equal(by['divine.justice'].value, 6);
  assert.equal(by['divine.freedom'].value, 12);
  assert.equal(by['divine.illusion'].value, null);
  assert.equal(by['divine.illusion'].uncertain, true);
  assert.equal(by['divine.time'].value, null);
  assert.match(by['divine.time'].error, /range/);
  assert.equal(by['divine.death'].error, 'Not a number');
  assert.equal(by['divine.life'].value, null, 'missing field stays empty, not invented');
});

test('extraction: enhancement vs skill levels, unknown slots and stats', () => {
  const eq = BA.validateExtraction('equipment', { items: [{ slot: 'Greaves', name: 'Vakron Greaves', enhancement: '+11' }, { slot: 'Hat', name: 'X', enhancement: 99 }] });
  assert.ok(eq.errors.some(x => /unknown slot/.test(x)));
  const enh = eq.fields.find(f => f.path === 'equipment.pants.enh');
  assert.equal(enh.value, 11, '"+11" reads as enhancement 11');
  assert.equal(BA.validateExtraction('equipment', { items: [{ slot: 'Helm', name: 'H', enhancement: 99 }] }).fields.find(f => /enh$/.test(f.path)).value, null, 'out of range');
  const eq2 = BA.validateExtraction('equipment', { items: [{ slot: 'Greaves', name: 'Vakron Greaves', enhancement: 11, rolls: [{ name: 'Back Attack', value: 30 }, { name: 'Mystery', value: 1 }] }] });
  assert.equal(eq2.fields.find(f => f.path === 'equipment.pants.enh').value, 11);
  assert.ok(eq2.fields.find(f => f.statName === 'Mystery').error);
  const sk = BA.validateExtraction('skills', { skills: [{ name: 'Quick Slice', level: 14 }, { name: 'Fireball', level: 3 }] });
  assert.equal(sk.fields[0].value, 14);
  assert.ok(sk.fields[1].error);
});

test('untrusted content: tags and control characters are stripped from text fields', () => {
  const v = BA.validateExtraction('overview', { name: '<img src=x onerror=alert(1)>lycaa', level: 45, cp: 72815 });
  const name = v.fields.find(f => f.path === 'name').value;
  assert.ok(!/[<>]/.test(name));
});

test('applyFields writes provenance and updates skill refresh status', () => {
  const { L } = seed();
  const d = BA.clone(BA.cur(L));
  const v = BA.validateExtraction('skills', { skills: BA.SKILLS.active.concat(BA.SKILLS.passive, BA.SKILLS.stigma).map(n => ({ name: n, level: 10 })) });
  BA.applyFields(d, v.fields, { status: 'verified', source: 'Screenshot', observedAt: '2026-10-18', upload: 'up1' });
  assert.equal(d.skills.needsRefresh, false);
  assert.equal(d.skills.list[0].m.status, 'verified');
  assert.equal(d.skills.list[0].m.upload, 'up1');
});

test('applyFields keeps several rolls on one item', () => {
  const { L } = seed();
  const d = BA.clone(BA.cur(L));
  const v = BA.validateExtraction('equipment', { items: [{ slot: 'Helmet', name: 'Vakron Helm', enhancement: 10, rolls: [{ name: 'Attack', value: 10 }, { name: 'Accuracy', value: 20 }] }] });
  BA.applyFields(d, v.fields, { status: 'confirmed', source: 't', observedAt: '2026-10-18' });
  assert.equal(d.equipment.helmet.rolls.length, 2);
});

test('AI proposals need validation and approval', () => {
  const { s } = seed();
  assert.ok(BA.validateProposal({ kind: 'delete_everything' }, s).length);
  assert.ok(BA.validateProposal({ kind: 'set_value', character: 'lycaa', category: 'divine', data: {} }, s).length, 'no values');
  assert.deepEqual(BA.validateProposal({ kind: 'set_value', character: 'lycaa', category: 'divine', data: { wisdom: 9 } }, s), []);
  assert.ok(BA.validateProposal({ kind: 'set_value', character: 'ghost', category: 'divine', data: { wisdom: 9 } }, s).length);
  assert.ok(BA.validateProposal({ kind: 'complete_task', taskId: 'none' }, s).length);
  assert.deepEqual(BA.validateProposal({ kind: 'add_task', title: 'Enhance off-hand' }, s), []);
});

test('stripJson handles prose around JSON and bad JSON', () => {
  assert.deepEqual(BA.stripJson('Here: {"a":1} done'), { a: 1 });
  assert.equal(BA.stripJson('no json'), null);
  assert.equal(BA.stripJson('{bad'), null);
});

test('export/import: versioned, key removed, validated', () => {
  const { s } = seed();
  s.settings.apiKey = 'secret';
  const ex = BA.exportState(s);
  assert.equal(ex.state.settings.apiKey, '');
  assert.equal(ex.version, BA.SCHEMA_VERSION);
  assert.ok(BA.validateImport(JSON.parse(JSON.stringify(ex))).ok);
  assert.ok(!BA.validateImport({ app: 'other' }).ok);
  assert.ok(!BA.validateImport({ app: BA.APP_ID, version: 99, state: { characters: [] } }).ok);
  assert.ok(!BA.validateImport({ app: BA.APP_ID, version: 1, state: { characters: [{ id: 'x', name: 'x', snapshots: [] }] } }).ok);
});

test('duplicate uploads are detected by hash', () => {
  const { s } = seed();
  const h = BA.hash('data:image/png;base64,AAAA');
  assert.equal(BA.isDuplicateUpload(s, h), false);
  s.uploads.push({ id: 'u', hash: h });
  assert.equal(BA.isDuplicateUpload(s, h), true);
  assert.notEqual(BA.hash('a'), BA.hash('b'));
});

test('pasted text import recognises CP, item level and items', () => {
  const p = BA.parsePasted('Combat Power 72,815\nItem Level: 1,693\nVakron Helm +10\nrandom words');
  assert.equal(p.cp, 72815);
  assert.equal(p.itemLevel, 1693);
  assert.deepEqual(p.items, [{ name: 'Vakron Helm', enh: 10 }]);
  assert.equal(p.unknownLines.length, 1);
});

test('csv exports escape values', () => {
  const { L } = seed();
  const csv = BA.equipmentCsv(L);
  assert.ok(csv.split('\n')[0].startsWith('slot,name'));
  assert.ok(csv.includes('Spiritforged Dagger'));
  assert.ok(BA.snapshotsCsv(L).includes('72815'));
});
