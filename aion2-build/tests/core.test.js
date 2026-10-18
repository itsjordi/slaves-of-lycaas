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

test('self-based recommendations work without anyone to compare with', () => {
  const { L } = seed();
  const recs = BA.recommendations(BA.cur(L), null, {});
  const ids = recs.map(r => r.id);
  ['arcana_start', 'divine_collect', 'weak_belt', 'weak_amulet', 'daevanion_low', 'data_stats'].forEach(id => assert.ok(ids.includes(id), id));
  assert.ok(!recs.some(r => /Novin|benchmark/.test(r.description)), 'no comparison wording');
  assert.equal(BA.bestNext(recs, 'value', {}).rec.kind, 'upgrade');
});

test('weak slots are judged against your own gear', () => {
  const { L } = seed();
  const w = BA.weakSlots(BA.cur(L)).map(x => x.slot);
  assert.ok(w.includes('belt') && w.includes('amulet') && w.includes('off_hand'));
  assert.ok(!w.includes('helmet'));
});

test('self check lists unused systems and missing data', () => {
  const { L } = seed();
  const c = BA.selfCheck(BA.cur(L));
  assert.ok(c.missing.some(x => x.system === 'arcana'));
  assert.ok(c.missing.some(x => x.system === 'pantheon'));
  assert.ok(c.unknowns.some(x => x.system === 'stats'));
  const blank = BA.selfCheck(BA.blankData('Cleric'));
  assert.ok(blank.unknowns.some(x => x.system === 'cp'));
});

test('new visitors start empty; new characters work for any class', () => {
  const s = BA.emptyState();
  assert.equal(s.characters.length, 0);
  assert.equal(s.selected.benchmark, '');
  const c = BA.newCharacter({ name: 'Test', cls: 'Cleric', server: 'Siel (EU)', cp: 50000 });
  assert.equal(c.cls, 'Cleric');
  assert.equal(BA.cur(c).skills.list.length, 0, 'no Assassin skills for a Cleric');
  assert.equal(BA.num(BA.cur(c).cp), 50000);
  const a = BA.newCharacter({ name: 'Ass', cls: 'Assassin' });
  assert.equal(BA.cur(a).skills.list.length, 32);
});

test('tier lists are per class; only Assassin has a default', () => {
  assert.ok(BA.tiersFor('boss', {}, 'Assassin')[0].stats.length > 0);
  assert.ok(BA.tiersFor('boss', {}, 'Cleric').every(t => t.stats.length === 0));
  const custom = { [BA.tierKey('boss', 'Cleric')]: [{ tier: 'S+', stats: ['attack'], why: '' }] };
  assert.deepEqual(BA.tiersFor('boss', custom, 'Cleric')[0].stats, ['attack']);
  assert.equal(BA.tierKey('boss', 'Assassin'), 'boss');
});

test('AionFlex profile links are parsed, other sites are not', () => {
  const a = BA.parseProfileUrl('https://aionflex.gg/character?id=x&server=1305&region=GLOBAL&name=lycaa');
  assert.deepEqual([a.ok, a.name, a.serverId, a.region], [true, 'lycaa', '1305', 'Global']);
  const b = BA.parseProfileUrl('https://aionflex.gg/character/Global/2313/Leecher');
  assert.deepEqual([b.ok, b.name, b.serverId], [true, 'Leecher', '2313']);
  assert.equal(BA.parseProfileUrl('https://evil.example/character?name=x').ok, false);
  assert.equal(BA.parseProfileUrl('not a url').ok, false);
});

test('migration turns off the always-on comparison', () => {
  const s = BA.seedState(); s.selected.benchmark = 'novin'; delete s.selfFocus;
  BA.migrate(s);
  assert.equal(s.selected.benchmark, '');
  assert.equal(s.settings.provider, 'anthropic');
});

test('exports never contain either AI key', () => {
  const s = BA.seedState(); s.settings.apiKey = 'a'; s.settings.openaiKey = 'b';
  const ex = BA.exportState(s);
  assert.equal(ex.state.settings.apiKey, ''); assert.equal(ex.state.settings.openaiKey, '');
});

const AF = require('fs').readFileSync(require('path').join(__dirname, 'aionflex-sample.txt'), 'utf8');
test('AionFlex page text: everything readable is parsed', () => {
  const p = BA.parseAionFlexText(AF);
  assert.ok(p.ok);
  assert.equal(p.profile.name, 'lycaa'); assert.equal(p.profile.cls, 'Assassin'); assert.equal(p.profile.server, 'Yustiel (EU)'); assert.equal(p.profile.guild, 'GOONER'); assert.equal(p.profile.level, 45);
  assert.equal(p.cp, 78814); assert.equal(p.itemLevel, 1701);
  assert.equal(p.equipment.length, 20);
  assert.deepEqual(p.equipment.filter(x => x.slot === 'main_hand')[0], { slot: 'main_hand', name: 'Spiritforged Dagger', enh: 12 });
  assert.ok(p.skills.some(s => s.name === 'Throw Shadowblade' && s.level === 15 && s.type === 'stigma'));
  assert.ok(p.skills.some(s => s.name === 'Shadow Fall' && s.level === 3 && s.type === 'active'));
  assert.equal(p.divine.justice, 41); assert.equal(p.core.might, 30); assert.equal(p.coreMax, 200);
  assert.equal(p.daevanion.azphel, 5); assert.deepEqual(p.titles, { unlocked: 183, total: 297 });
  assert.deepEqual(p.pet, { name: 'Kerubar', level: 3 }); assert.deepEqual(p.wings, { name: 'Ultimate Daeva Wings', rarity: 'Unique' });
});
test('AionFlex: random text is rejected', () => { assert.equal(BA.parseAionFlexText('hello world\n123').ok, false); });
test('AionFlex fields apply to a blank character, new skills are added', () => {
  const p = BA.parseAionFlexText(AF), d = BA.blankData('Assassin'), f = BA.aionflexFields(p, d);
  assert.ok(f.some(x => x.path === 'skills.add.throw_shadowblade'));
  BA.applyFields(d, f, BA.meta('imported', 'AionFlex', '2026-10-18'));
  assert.equal(BA.num(d.cp), 78814); assert.equal(d.equipment.off_hand.enh, 10);
  assert.ok(d.skills.list.some(s => s.name === 'Throw Shadowblade' && s.level === 15));
  assert.equal(d.skills.needsRefresh, false);
  assert.equal(d.pet.name, 'Kerubar');
});
test('weak skills and gain sources come from own data', () => {
  const p = BA.parseAionFlexText(AF), d = BA.blankData('Assassin');
  BA.applyFields(d, BA.aionflexFields(p, d), BA.meta('imported', 'AionFlex', '2026-10-18'));
  const ws = BA.weakSkills(d).map(s => s.name);
  assert.ok(ws.indexOf('Shadow Fall') >= 0); assert.ok(ws.indexOf('Quick Slice') < 0);
  const g = BA.gainSources(d);
  assert.equal(g.filter(r => r.area === 'Skill levels')[0].room, 'High');
  assert.equal(g.filter(r => r.area === 'Pets and Genus Insight')[0].room, 'Unknown');
  d.genus = { cogni: { level: 2 } };
  assert.notEqual(BA.gainSources(d).filter(r => r.area === 'Pets and Genus Insight')[0].room, 'Unknown');
  assert.ok(BA.recommendations(d, null, BA.tiersFor('boss')).some(r => r.id === 'pets_cogni'));
});
test('genus tier list is ordered S to C with sources', () => {
  assert.deepEqual(BA.GENUS.map(g => g.tier), ['S', 'A', 'B', 'C', '-']);
  assert.ok(BA.GENUS_SOURCES.every(s => /^https:\/\//.test(s.url)));
});

const SH = require('fs').readFileSync(require('path').join(__dirname, 'shugo-sample.txt'), 'utf8');
const AT = require('fs').readFileSync(require('path').join(__dirname, 'atool-sample.txt'), 'utf8');
test('source detection', () => {
  assert.equal(BA.detectSource(SH, ''), 'shugo'); assert.equal(BA.detectSource(AT, ''), 'atool'); assert.equal(BA.detectSource(AF, ''), 'aionflex');
  assert.equal(BA.detectSource('x', 'https://shugo.gg/character/x'), 'shugo'); assert.equal(BA.detectSource('hello', ''), null);
});
test('Shugo.GG page text', () => {
  const p = BA.parseShugoText(SH);
  assert.ok(p.ok); assert.equal(p.profile.name, 'lycaa'); assert.equal(p.profile.level, 45); assert.equal(p.profile.server, 'Yustiel (EU)');
  assert.equal(p.gearScore, 1230); assert.equal(p.cp, 78814); assert.equal(p.equipment.length, 20);
  assert.ok(p.skills.some(s => s.name === 'Illusive Clone' && s.type === 'stigma' && s.equipped));
  assert.ok(!p.skills.some(s => s.name === 'Smoke Bomb'), 'not acquired stigmas are skipped');
  assert.deepEqual(p.boards.nezekan, { done: 65, total: 88 }); assert.equal(p.daevanion.nezekan, 74);
  assert.ok(p.daevEffects.indexOf('Combat Speed +3%') >= 0);
  assert.deepEqual(p.pet, { name: 'Kerubar', level: 3 });
});
test('Atool page text, with item details', () => {
  const p = BA.parseAtoolText(AT);
  assert.ok(p.ok); assert.equal(p.profile.guild, 'GOONER'); assert.equal(p.gearScore, 1230); assert.equal(p.observedAt, '2026-10-19');
  assert.equal(p.equipment.length, 20);
  const mh = p.equipment[0]; assert.equal(mh.slot, 'main_hand'); assert.equal(mh.engraving[0].name, 'Might'); assert.equal(mh.engraving[0].grade, 'S'); assert.equal(mh.manastones.length, 4); assert.equal(mh.theostone, "Aulak's Roar");
  const torso = p.equipment.filter(x => x.slot === 'torso')[0]; assert.equal(torso.engravingPct, 93.1); assert.equal(torso.subSkills.length, 3);
  assert.equal(p.divine.death, 46); assert.equal(p.core.dexterity, 53); assert.deepEqual(p.titles, { unlocked: 183, total: 297 });
  assert.equal(p.titleList[1].name, 'Failed Entrepreneur'); assert.deepEqual(p.titleList[1].effects, ['PvE Attack +25', 'Attack Bonus +20']);
  assert.equal(p.ranks.server.pos, '32/68'); assert.equal(p.hexagon[4].value, '+9.2%');
});
test('three sources merge into one review, pair slots follow AionFlex', () => {
  const ps = [AT, SH, AF].map(t => BA.parseSourceText(t, ''));
  const d = BA.blankData('Assassin'), f = BA.syncFields(ps, d);
  assert.deepEqual(f.filter(x => x.note).map(x => x.path), ['itemLevel'], 'only Item Level differs (AionFlex 1701 vs 1230)');
  assert.equal(f.filter(x => x.path === 'equipment.earring_2.name')[0].value, 'Pilgrim Earrings');
  BA.applyFields(d, f, BA.meta('imported', 'sync', '2026-10-19'));
  assert.equal(BA.num(d.itemLevel), 1230, 'Atool wins over AionFlex for Item Level / Gear Score'); assert.equal(d.equipment.torso.engravingPct, 93.1);
  assert.equal(d.equipment.main_hand.soulBinding[0].grade, 'S');
  assert.ok(d.external.atool.hexagon.length === 6);
  const again = BA.syncFields(ps, d);
  assert.ok(again.every(x => x.kind === 'info' || x.path.indexOf('profile.') === 0 || x.path.indexOf('skills.add.') === 0 || BA.currentValueAt(d, x.path) === x.value), 'a second sync changes nothing');
  assert.ok(BA.gainSources(d).some(r => r.area === 'Soul engraving' && r.room !== 'Unknown'));
});
test('disagreeing sources are flagged and the preferred one wins', () => {
  const a = BA.parseSourceText(AT, ''), s = BA.parseSourceText(SH, '');
  s.cp = 70000;
  const f = BA.syncFields([s, a], BA.blankData('Assassin')).filter(x => x.path === 'cp')[0];
  assert.equal(f.value, 78814); assert.match(f.note, /Shugo.GG 70000/);
});
test('profile links are built from name and server', () => {
  const L = BA.sourceLinks({ name: 'lycaa', server: 'Yustiel (EU)' });
  assert.equal(L.shugo, 'https://shugo.gg/character/global/eu-yustiel/lycaa'); assert.equal(L.atool, 'https://aion2tool.com/global/char/serverid=1305/lycaa');
});

test('next steps are concrete and ordered', () => {
  const ps = [AT, SH, AF].map(t => BA.parseSourceText(t, ''));
  const d = BA.blankData('Assassin'); BA.applyFields(d, BA.syncFields(ps, d), BA.meta('imported', 'sync', '2026-10-18'));
  const st = BA.nextSteps(d);
  assert.ok(!st.some(s => s.title === 'Enhance Noble Belt +3 to +10'), 'belt is not grouped with normal gear');
  const belt = st.find(s => s.id === 'enh_belt'); assert.match(belt.title, /Noble Belt \+3 to \+4 when you have a scroll/); assert.ok(belt.prio < 50);
  assert.ok(st.find(s => s.id === 'enh_amulet'));
  assert.ok(st.some(s => /soul engraving on Unyielding Earrings \(37.6%\)/.test(s.title) && !s.il));
  assert.ok(st.some(s => /Shadow Fall 3/.test(s.title)));
  assert.ok(st.some(s => /Daevanion Azphel: 8\/152 nodes/.test(s.title)));
  assert.equal(d.skills.needsRefresh, false, 'skills count as current after a sync');
});
test('a sync clears outdated stigmas that are not equipped', () => {
  const s = BA.seedState(), d = BA.clone(BA.cur(BA.getChar(s, 'lycaa')));
  BA.applyFields(d, BA.syncFields([BA.parseSourceText(SH, '')], d), BA.meta('imported', 'Shugo.GG', '2026-10-18'));
  assert.equal(d.skills.needsRefresh, false);
  assert.ok(d.skills.list.filter(x => x.type === 'stigma' && x.equipped === false).length > 0);
});
test('compare another player from their page, pairs aligned', () => {
  const ps = [AT, SH, AF].map(t => BA.parseSourceText(t, ''));
  const me = BA.blankData('Assassin'); BA.applyFields(me, BA.syncFields(ps, me), BA.meta('imported', 'sync', '2026-10-18'));
  const p = BA.parseShugoText(SH); p.cp = 90000; p.equipment[9].enh = 10; // belt +10
  const c = BA.compareProfiles(me, BA.dataFromParse(p));
  assert.ok(c.ahead.some(a => a.label === 'Belt enhancement' && a.them === '+10'));
  assert.ok(!c.ahead.some(a => /Earring/.test(a.label)), 'same earrings in swapped slots are not a difference');
  assert.equal(c.rows.find(r => r.label === 'Combat Power').diff, 90000 - 78814);
});

test('item database: Item Level is item level + enhancement over 20 slots', () => {
  assert.ok(BA.items().length > 800);
  const ps = [AT, SH, AF].map(t => BA.parseSourceText(t, ''));
  const d = BA.blankData('Assassin'); BA.applyFields(d, BA.syncFields(ps, d), BA.meta('imported', 'sync', '2026-10-18'));
  const gs = BA.gearScoreOf(d, 'Elyos');
  assert.ok(gs.complete); assert.equal(gs.total, 1230, 'matches the Gear Score on Atool and Shugo.GG');
  assert.equal(BA.findItem('helmet', 'Vakron Helm', 'Elyos').lv, 70);
  const ch = BA.newCharacter({ name: 'lycaa', cls: 'Assassin', race: 'Elyos' }); ch.snapshots[0].data = d;
  const u = BA.upgradeFinder(ch);
  const helm = u.slots.find(s => s.slot.id === 'helmet');
  assert.equal(helm.next[0].item.name, 'White Dragon Lord Helm'); assert.equal(helm.next[0].gain, 8); assert.ok(helm.next[0].transfer);
  assert.ok(u.slots.find(s => s.slot.id === 'main_hand').next.every(c => c.item.type === 'dagger'), 'class weapon only');
  assert.equal(u.slots.find(s => s.slot.id === 'belt').next.length, 0);
  assert.ok(!u.slots.find(s => s.slot.id === 'bracelet_2').next.some(c => c.item.name === 'Ascension Bracelet'), 'no second copy of a quest item');
  const neck = u.slots.find(s => s.slot.id === 'necklace').next[0]; assert.equal(neck.transfer, false, 'Legend accessory: enhancement does not move');
  assert.ok(u.rate && u.rate.high > u.rate.low);
  const steps = BA.nextSteps(d, { ch });
  assert.ok(steps.some(s => /White Dragon Lord armor \(item level 78\): \+8 Item Level per piece/.test(s.title)));
  assert.ok(steps.find(s => /Abyssal Bracelet/.test(s.title)).detail.includes('hard content'));
});
test('Combat Power per Item Level is learned from own upgrades', () => {
  const ps = [AT, SH, AF].map(t => BA.parseSourceText(t, ''));
  const d = BA.blankData('Assassin'); BA.applyFields(d, BA.syncFields(ps, d), BA.meta('imported', 'sync', '2026-10-18'));
  const ch = BA.newCharacter({ name: 'lycaa', cls: 'Assassin', race: 'Elyos' }); ch.snapshots[0].data = d;
  BA.commit(ch, x => { x.equipment.belt.enh = 4; x.cp = { v: 78874, m: x.cp.m }; }, 'belt +4', '2026-10-19');
  const r = BA.cpPerItemLevel(ch, 'Elyos');
  assert.equal(r.learned, 1); assert.equal(r.low, 60); assert.equal(r.high, 60);
});
