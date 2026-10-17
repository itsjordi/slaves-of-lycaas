/* AION 2 Build Architect - views: dashboard, character, equipment, compare, planner. */
(function () {
  'use strict';
  var BA = window.BA, APP = window.APP, e = APP.e, f = APP.fmt;

  /* ------------------------------------------------------------------ shared bits */
  function provFields(def) {
    def = def || {};
    return '<div class="form" style="margin-top:12px"><div><label>Observed on</label><input type="date" name="_obs" value="' + e(def.obs || APP.today()) + '"></div>' +
      '<div><label>Status</label><select name="_status">' + ['confirmed', 'verified', 'estimated', 'imported'].map(function (s) { return '<option value="' + s + '"' + (s === (def.status || 'confirmed') ? ' selected' : '') + '>' + e(BA.STATUS[s].label) + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Source</label><input name="_src" value="' + e(def.src || 'Manual entry') + '"></div></div>';
  }
  function prov(o) { return BA.meta(o._status || 'confirmed', o._src || 'Manual entry', o._obs || APP.today()); }
  function numOrNull(x) { var n = BA.parseNum(x); return n == null ? null : n; }
  APP.provFields = provFields; APP.prov = prov; APP.numOrNull = numOrNull;
  function warnBlock(d, ch) {
    var w = [];
    if (d.skills && d.skills.needsRefresh) w.push('Skill levels need a fresh in-game screenshot. The AionFlex levels were outdated, so skills are not used for advice yet. <a href="#/import">Import a Skills screenshot</a>.');
    var hist = ch.snapshots.length === 1 && ch.snapshots[0].observedAt;
    if (hist) w.push('Showing the historical snapshot from ' + e(ch.snapshots[0].observedAt) + '. Fields marked "Imported" come from AionFlex and may be stale.');
    return w.map(function (x) { return '<div class="note">' + x + '</div>'; }).join('');
  }
  function recRow(r, rowOpts) {
    rowOpts = rowOpts || {};
    var inPlan = (APP.state.tasks || []).some(function (t) { return t.recId === r.id; });
    return '<li class="rec"><div class="row"><span class="t">' + e(r.title) + '</span><span class="pill">' + e(r.system) + '</span>' + (rowOpts.blocked ? '<span class="pill warn">waits on a step</span>' : '') +
      '<span style="flex:1"></span>' + (inPlan ? '<span class="pill confirmed">In plan</span>' : '<button class="sm" data-act="rec-add" data-id="' + e(r.id) + '">Add to plan</button>') + '</div>' +
      '<div class="small muted">' + e(r.description) + '</div>' +
      '<div class="m"><span>DPS ' + APP.lvl(r.dps) + '</span><span>CP ' + APP.lvl(r.cp) + '</span><span>Confidence ' + APP.lvl(r.confidence) + '</span><span>Cost ' + e(r.cost) + '</span><span>Time ' + e(r.time) + '</span><span>Availability ' + e(r.availability) + '</span></div>' +
      (rowOpts.why ? '<div class="small" style="margin-top:4px">' + e(r.why) + '</div>' : '') + '</li>';
  }
  APP.recRow = recRow;
  APP.act('rec-add', function (el) {
    var r = APP.recs().filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; if (!r) return;
    APP.addTask({ title: r.title, notes: r.description, recId: r.id, system: r.system, dependsOnRec: r.dependsOn });
    APP.toast('Added to the upgrade plan.'); APP.render();
  });
  APP.addTask = function (o) {
    var tasks = APP.state.tasks;
    var deps = [];
    (o.dependsOnRec || []).forEach(function (rid) { var t = tasks.filter(function (x) { return x.recId === rid; })[0]; if (t) deps.push(t.id); });
    var t = { id: BA.uid('task'), title: o.title, notes: o.notes || '', recId: o.recId || null, system: o.system || 'other', status: 'todo', order: tasks.length, dependsOn: deps.concat(o.dependsOn || []), materials: o.materials || [], target: o.target || '', createdAt: new Date().toISOString(), completedAt: null, actual: '', character: APP.state.selected.player };
    tasks.push(t); APP.save(); return t;
  };

  /* ------------------------------------------------------------------ dashboard */
  APP.view('dashboard', { title: 'Dashboard', icon: 'dash', group: 'Overview', render: function () {
    var ch = APP.player(), d = APP.pd(), b = APP.bench(), bd = APP.bd();
    var sum = BA.snapshotSummary(d), bsum = bd ? BA.snapshotSummary(bd) : null, gap = bd ? BA.cpGap(d, bd) : null;
    var dps = (APP.state.dps || []).filter(function (x) { return x.character === ch.id; }).sort(function (a, b) { return a.date < b.date ? 1 : -1; })[0];
    var recs = APP.recs(), done = APP.doneMap(), best = BA.bestNext(recs, APP.state.selected.rankMode, done), ranked = BA.rank(recs, APP.state.selected.rankMode, done);
    var c = bd ? BA.compare(d, bd, { mode: APP.state.selected.mode, customTiers: APP.state.customTiers }) : null;
    var h = '<div class="head"><div><h1>' + e(ch.name) + '</h1><div class="muted">' + [ch.cls, 'Level ' + (BA.num(d.level) == null ? '?' : BA.num(d.level)), ch.race, ch.server, ch.region, ch.guild ? '<' + ch.guild + '>' : ''].filter(Boolean).map(e).join(' &middot; ') + (ch.url ? ' &middot; <a href="' + e(ch.url) + '" target="_blank" rel="noopener">AionFlex</a>' : '') + '</div></div><span class="sp"></span><button data-act="go" data-to="#/import">Import screenshot</button></div>';
    h += warnBlock(d, ch);
    h += '<div class="grid g4">' +
      kpi('Combat Power', f(sum.cp), APP.pill(d.cp.m)) +
      kpi('Item Level', f(sum.itemLevel), APP.pill(d.itemLevel.m) + (bsum && bsum.itemLevel != null ? ' <span class="small muted">' + e(b.name) + ': ' + f(bsum.itemLevel) + '</span>' : '')) +
      kpi('DPS', dps ? f(dps.avgDps) : '<span class="muted small">Not measured</span>', dps ? e(dps.boss + ', ' + dps.date) : '<a href="#/dps">Log a DPS run</a>') +
      kpi(b ? 'CP gap to ' + e(b.name) : 'CP gap', gap == null ? '<span class="muted small">No benchmark</span>' : f(gap), b ? 'Benchmark: ' + f(bsum.cp) + ' (historical)' : '') + '</div>';
    h += '<div class="grid g2" style="margin-top:14px">';
    h += '<div class="card hl"><h2>Best next upgrade</h2>' + (best ? '<div class="rec"><div class="t" style="font-size:16px">' + e(best.rec.title) + '</div><div class="small muted" style="margin:4px 0">' + e(best.rec.description) + '</div><div class="small">' + e(best.why) + '</div><div class="row" style="margin-top:10px"><button class="pri sm" data-act="rec-add" data-id="' + e(best.rec.id) + '">Add to plan</button><a href="#/planner" class="small">All recommendations</a></div></div>' : '<div class="muted">Nothing left to recommend with the current data.</div>') + '</div>';
    var dataRecs = recs.filter(function (r) { return r.kind === 'data' && !done[r.id]; });
    h += '<div class="card"><h2>Collect this data first</h2>' + (dataRecs.length ? '<ul class="list">' + dataRecs.map(function (r) { return '<li><div class="t">' + e(r.title) + '</div><div class="small muted">' + e(r.why) + '</div></li>'; }).join('') + '</ul>' : '<div class="muted">All key data is recorded.</div>') + '</div>';
    h += '</div>';
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Top recommendations</h2><ul class="list">' + ranked.filter(function (r) { return r.rec.kind !== 'data' && !done[r.rec.id]; }).slice(0, 5).map(function (r) { return recRow(r.rec, { blocked: r.blocked }); }).join('') + '</ul></div>';
    h += '<div class="card"><h2>Progression</h2>' + progressRows(d, bd, b) + '</div></div>';
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Equipment</h2><div class="eq">' + BA.SLOTS.map(function (s) { var it = d.equipment[s.id]; return '<a class="slot" href="#/equipment"><div class="sn">' + e(s.name) + '</div><div class="in">' + (it ? e(it.name) + ' <span class="en">+' + e(it.enh) + '</span>' : '<span class="muted">Empty</span>') + '</div></a>'; }).join('') + '</div></div>';
    h += '<div class="card"><h2>Offensive stats (boss PvE)</h2>' + offensiveSummary(d) + '</div></div>';
    if (c) h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Missing systems</h2>' + listOf(c.missingSystems, 'No unused systems found.') + '</div><div class="card"><h2>Unknowns</h2>' + listOf(c.unknowns, 'Nothing missing.') + '</div></div>';
    h += '<div class="card" style="margin-top:14px"><h2>Recent upgrades</h2>' + recent(ch) + '</div>';
    return h;
  } });
  function kpi(l, v, d) { return '<div class="card kpi"><div class="l">' + l + '</div><div class="v">' + v + '</div><div class="d">' + (d || '') + '</div></div>'; }
  function listOf(arr, empty) { return arr.length ? '<ul class="list">' + arr.map(function (x) { return '<li class="small">' + e(x.text) + '</li>'; }).join('') + '</ul>' : '<div class="muted small">' + e(empty) + '</div>'; }
  function progressRows(d, bd, b) {
    var p = d.pantheon, dt = BA.divineTotal(d), bdt = bd ? BA.divineTotal(bd) : null;
    var h = '<table><tbody>';
    h += '<tr><td>Pantheon</td><td style="width:45%">' + APP.bar(BA.pantheonPct(d)) + '</td><td class="right nowrap">' + (p.collected == null ? '?' : p.collected) + '/' + (p.total || '?') + '</td></tr>';
    h += '<tr><td>Divine Stat total<div class="small muted">sum of displayed levels</div></td><td>' + APP.bar(bdt ? dt/bdt*100 : null, 'blue') + '</td><td class="right nowrap">' + f(dt) + (bdt != null ? ' <span class="muted">/ ' + f(bdt) + '</span>' : '') + '</td></tr>';
    BA.DAEVANION.forEach(function (x) { var v = BA.num(d.daevanion[x.id]); h += '<tr><td>Daevanion ' + e(x.name) + '</td><td>' + APP.bar(v) + '</td><td class="right">' + f(v) + '%</td></tr>'; });
    var ar = BA.arcanaState(d);
    h += '<tr><td>Arcana</td><td colspan="2">' + (ar === 'none' ? '<span class="bad">Not started</span>' + (bd && BA.arcanaState(bd) === 'equipped' ? ' <span class="muted small">(' + e(b.name) + ': ' + bd.arcana.items.length + ' equipped)</span>' : '') : ar === 'equipped' ? d.arcana.items.length + ' equipped' : '<span class="muted">Unknown</span>') + '</td></tr>';
    h += '<tr><td>Titles</td><td colspan="2">' + (d.titles.unlocked == null ? '<span class="muted">Not recorded</span>' : d.titles.unlocked + '/' + d.titles.total) + '</td></tr>';
    return h + '</tbody></table>';
  }
  function offensiveSummary(d) {
    var tiers = BA.tiersFor(APP.state.selected.mode, APP.state.customTiers).filter(function (t) { return t.tier === 'S+' || t.tier === 'S'; });
    var any = Object.keys(d.combatStats || {}).length;
    var h = any ? '' : '<div class="note info small">No combat stats recorded yet. <a href="#/import">Import a Combat Stats screenshot</a> or <a href="#/character/stats">enter them</a>.</div>';
    h += '<table><tbody>' + tiers.map(function (t) { return t.stats.map(function (id) { var st = BA.STAT_BY_ID[id], v = d.combatStats[id]; return '<tr><td>' + APP.tier(t.tier) + ' ' + e(st.name) + '</td><td class="right">' + (v ? f(v.v, v.unit || st.unit) + ' ' + APP.pill(v.m) : '<span class="muted small">Not recorded</span>') + '</td></tr>'; }).join(''); }).join('') + '</tbody></table>';
    return h + '<div class="small muted" style="margin-top:6px">Tier list is provisional and editable in <a href="#/research">Research</a>.</div>';
  }
  function recent(ch) {
    var done = (APP.state.tasks || []).filter(function (t) { return t.status === 'done' && t.character === ch.id; }).sort(function (a, b) { return a.completedAt < b.completedAt ? 1 : -1; }).slice(0, 5);
    var h = '';
    if (done.length) h += '<ul class="list">' + done.map(function (t) { return '<li><span class="good">Done</span> ' + e(t.title) + ' <span class="muted small">' + e((t.completedAt || '').slice(0, 10)) + (t.actual ? ' &middot; ' + e(t.actual) : '') + '</span></li>'; }).join('') + '</ul>';
    if (ch.snapshots.length > 1) {
      var a = ch.snapshots[ch.snapshots.length - 2], b = ch.snapshots[ch.snapshots.length - 1], df = BA.snapshotDiff(a.data, b.data);
      h += '<div class="small" style="margin-top:8px">Latest snapshot <b>' + e(b.label) + '</b> vs previous: CP ' + signed(df.cp) + ', Item Level ' + signed(df.itemLevel) + ', Divine total ' + signed(df.divineTotal) + (df.gear.length ? ', gear: ' + df.gear.map(function (g) { return e(BA.SLOT_BY_ID[g.slot].name + ' ' + g.from + ' -> ' + g.to); }).join('; ') : '') + '. <a href="#/progression">History</a></div>';
    }
    return h || '<div class="muted small">No completed upgrades or new snapshots yet.</div>';
  }
  function signed(n) { if (n == null) return '<span class="muted">?</span>'; return '<span class="' + (n > 0 ? 'good' : n < 0 ? 'bad' : 'muted') + '">' + (n > 0 ? '+' : '') + e(BA.fmt(n)) + '</span>'; }
  APP.signed = signed;

  /* ------------------------------------------------------------------ character */
  var CTABS = [['profile', 'Profile'], ['stats', 'Combat stats'], ['core', 'Core stats'], ['divine', 'Divine stats'], ['daevanion', 'Daevanion'], ['skills', 'Skills & Stigmas'], ['arcana', 'Arcana'], ['more', 'Titles, pet, wings']];
  APP.view('character', { title: 'Character', icon: 'char', group: 'Overview', render: function (arg) {
    var tab = arg || 'profile', ch = APP.player(), d = APP.pd();
    var h = '<div class="head"><div><h1>' + e(ch.name) + '</h1><div class="muted">Latest snapshot: ' + e(BA.latest(ch).label) + ' (' + e(BA.latest(ch).observedAt) + ')</div></div><span class="sp"></span><button data-act="char-new">Add character</button></div>';
    h += '<div class="tabs">' + CTABS.map(function (t) { return '<button data-act="go" data-to="#/character/' + t[0] + '" class="' + (t[0] === tab ? 'cur' : '') + '">' + e(t[1]) + '</button>'; }).join('') + '</div>';
    h += ({ profile: cProfile, stats: cStats, core: cCore, divine: cDivine, daevanion: cDaev, skills: cSkills, arcana: cArcana, more: cMore }[tab] || cProfile)(ch, d);
    return h;
  } });
  function cProfile(ch, d) {
    return '<div class="grid g2"><div class="card"><h2>Profile</h2><table><tbody>' +
      [['Name', e(ch.name)], ['Class', e(ch.cls)], ['Race', e(ch.race)], ['Level', f(BA.num(d.level)) + ' ' + APP.pill(d.level.m)], ['Server', e(ch.server)], ['Region', e(ch.region)], ['Guild', e(ch.guild || '-')], ['Role', e(ch.role === 'benchmark' ? 'Comparison character' : 'Player')],
        ['Combat Power', f(BA.num(d.cp)) + ' ' + APP.pill(d.cp.m)], ['Item Level', f(BA.num(d.itemLevel)) + ' ' + APP.pill(d.itemLevel.m)], ['AionFlex', ch.url ? '<a href="' + e(ch.url) + '" target="_blank" rel="noopener">Open profile</a>' : '-']]
        .map(function (r) { return '<tr><td class="muted">' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join('') + '</tbody></table><div class="row" style="margin-top:10px"><button data-act="edit-profile">Edit</button></div></div>' +
      '<div class="card"><h2>Data freshness</h2>' + freshness(d) + conflictsHtml(ch) + '</div></div>';
  }
  function conflictsHtml(ch) {
    var cs = (APP.state.conflicts || []).filter(function (c) { return c.character === ch.id; }).slice(-10).reverse();
    if (!cs.length) return '';
    return '<h3>Conflict history</h3><table><tbody>' + cs.map(function (c) { return '<tr><td class="small">' + e(c.label) + '</td><td class="small">' + e(c.oldValue) + ' (' + e(c.oldObservedAt) + ') -> ' + e(c.newValue) + ' (' + e(c.newObservedAt) + ')</td><td class="small muted">' + e(c.resolution) + '</td></tr>'; }).join('') + '</tbody></table>';
  }
  function freshness(d) {
    var rows = [['Combat Power', d.cp.m], ['Item Level', d.itemLevel.m], ['Equipment', (d.equipment.main_hand || {}).m], ['Core stats', (d.coreStats.might || {}).m], ['Divine stats', (d.divine.justice || {}).m], ['Daevanion', (d.daevanion.nezekan || {}).m], ['Pantheon', d.pantheon.m], ['Skills', (d.skills.list[0] || {}).m], ['Arcana', d.arcana.m], ['Titles', d.titles.m]];
    return '<table><tbody>' + rows.map(function (r) { return '<tr><td>' + e(r[0]) + '</td><td>' + APP.pill(r[1]) + '</td><td class="small muted">' + e(r[1] && r[1].observedAt || '') + '</td></tr>'; }).join('') + '</tbody></table><div class="small muted" style="margin-top:6px">Each field keeps its own date. A current CP does not prove the gear or skills are current.</div>';
  }
  APP.act('edit-profile', function () {
    var ch = APP.player(), d = APP.pd();
    APP.dialog('Edit profile', '<div class="form">' +
      inp('name', 'Name', ch.name) + inp('cls', 'Class', ch.cls) + inp('race', 'Race', ch.race) + inp('level', 'Level', BA.num(d.level)) + inp('server', 'Server', ch.server) + inp('region', 'Region', ch.region) + inp('guild', 'Guild', ch.guild) +
      inp('cp', 'Combat Power', BA.num(d.cp)) + inp('itemLevel', 'Item Level', BA.num(d.itemLevel)) + inp('url', 'AionFlex URL', ch.url) + '</div>' + provFields(), [{ label: 'Save as new snapshot', cls: 'pri', act: 'save-profile' }]);
  });
  function inp(n, l, v, type) { return '<div><label>' + e(l) + '</label><input name="' + e(n) + '" value="' + e(v == null ? '' : v) + '"' + (type ? ' type="' + type + '"' : '') + '></div>'; }
  APP.inp = inp;
  APP.act('save-profile', function () {
    var o = APP.form(), ch = APP.player(), m = prov(o), d0 = APP.pd();
    ['name', 'cls', 'race', 'server', 'region', 'guild', 'url'].forEach(function (k) { ch[k] = (o[k] || '').slice(0, 300); });
    var changes = [];
    APP.commit(ch, function (d) {
      ['level', 'cp', 'itemLevel'].forEach(function (k) { var n = numOrNull(o[k]); if (n !== BA.num(d0[k])) { d[k] = { v: n, m: m }; changes.push(k); } });
    }, 'Profile edit' + (changes.length ? ' (' + changes.join(', ') + ')' : ''), o._obs);
    APP.closeDialog(); APP.toast('Saved as a new snapshot. The previous snapshot is kept.'); APP.render();
  });
  APP.act('char-new', function () {
    APP.dialog('Add character', '<div class="form">' + inp('name', 'Name', '') + inp('cls', 'Class', 'Assassin') + inp('race', 'Race', '') + inp('server', 'Server', '') + inp('region', 'Region', 'Global') + inp('guild', 'Guild', '') + inp('url', 'AionFlex URL', '') +
      '<div><label>Role</label><select name="role"><option value="benchmark">Comparison character</option><option value="player">Player</option></select></div></div>', [{ label: 'Create', cls: 'pri', act: 'char-create' }]);
  });
  APP.act('char-create', function () {
    var o = APP.form(); if (!o.name.trim()) return APP.toast('A name is required.');
    var base = BA.seedState(), blank = BA.clone(BA.cur(base.characters[1]));
    var none = BA.meta('unknown', 'none', null);
    blank.cp = { v: null, m: none }; blank.itemLevel = { v: null, m: none }; blank.level = { v: null, m: none };
    Object.keys(blank.equipment).forEach(function (k) { delete blank.equipment[k]; });
    blank.arcana = { state: 'unknown', items: [], m: none };
    ['divine', 'daevanion', 'coreStats'].forEach(function (k) { Object.keys(blank[k]).forEach(function (x) { blank[k][x] = { v: null, m: none }; }); });
    blank.titles = { unlocked: null, total: null, selected: null, bonuses: '', m: none };
    var id = BA.slug(o.name) + '_' + Date.now().toString(36);
    APP.state.characters.push({ id: id, role: o.role, name: o.name.slice(0, 40), cls: o.cls, race: o.race, region: o.region, server: o.server, guild: o.guild, url: o.url, snapshots: [BA.snapshot('Created', APP.today(), blank)] });
    if (o.role === 'player') APP.state.selected.player = id; else APP.state.selected.benchmark = id;
    APP.save(); APP.closeDialog(); APP.render();
  });

  function cStats(ch, d) {
    var tiers = BA.tiersFor(APP.state.selected.mode, APP.state.customTiers);
    var h = '<div class="row" style="margin-bottom:10px"><button data-act="edit-stats">Edit combat stats</button><a href="#/import">Import from screenshot</a></div>';
    Object.keys(BA.CATEGORIES).forEach(function (cat) {
      h += '<div class="card" style="margin-bottom:12px"><h2>' + e(BA.CATEGORIES[cat]) + '</h2><div class="tbl"><table><thead><tr><th>Stat</th><th>Tier</th><th class="right">Value</th><th>Status</th><th>About</th></tr></thead><tbody>' +
        BA.STAT_CATALOG.filter(function (s) { return s.category === cat; }).map(function (s) { var v = d.combatStats[s.id]; return '<tr><td>' + e(s.name) + '</td><td>' + APP.tier(BA.tierOf(s.id, tiers)) + '</td><td class="right">' + (v ? f(v.v, v.unit || s.unit) : '<span class="muted small">-</span>') + '</td><td>' + (v ? APP.pill(v.m) : '') + '</td><td class="small muted">' + e(s.description) + ' Unit: ' + e(s.unit) + '. Cap: ' + e(s.cap) + '.</td></tr>'; }).join('') + '</tbody></table></div></div>';
    });
    return h;
  }
  APP.act('edit-stats', function () {
    var d = APP.pd();
    var body = '<div class="small muted" style="margin-bottom:8px">Leave a field empty when it is not shown in game. Use the unit shown next to each stat.</div><div class="form">' +
      BA.STAT_CATALOG.map(function (s) { var v = d.combatStats[s.id]; return inp('s_' + s.id, s.name + ' (' + s.unit + ')', v ? v.v : ''); }).join('') + '</div>' + provFields();
    APP.dialog('Edit combat stats', body, [{ label: 'Save as new snapshot', cls: 'pri', act: 'save-stats' }]);
  });
  APP.act('save-stats', function () {
    var o = APP.form(), m = prov(o), d0 = APP.pd(), bad = [];
    APP.commit(APP.player(), function (d) {
      BA.STAT_CATALOG.forEach(function (s) {
        var raw = o['s_' + s.id]; if (raw === '' || raw == null) { if (d.combatStats[s.id] && raw === '') delete d.combatStats[s.id]; return; }
        var n = numOrNull(raw); if (n == null) { bad.push(s.name); return; }
        var old = d0.combatStats[s.id]; if (old && old.v === n) return;
        d.combatStats[s.id] = { v: n, unit: s.unit, m: m };
      });
    }, 'Combat stats edit', o._obs);
    APP.closeDialog(); APP.toast(bad.length ? 'Saved. Skipped invalid values: ' + bad.join(', ') : 'Saved as a new snapshot.'); APP.render();
  });

  function numTable(defs, map, unit, extra) {
    return '<table><tbody>' + defs.map(function (x) { var v = map[x.id] || {}; return '<tr><td>' + e(x.name) + (x.effects ? '<div class="small muted">' + e(x.effects.join(', ')) + '</div>' : '') + '</td><td class="right">' + f(BA.num(v)) + (unit || '') + '</td><td>' + APP.pill(v.m) + '</td>' + (extra ? '<td>' + extra(x, v) + '</td>' : '') + '</tr>'; }).join('') + '</tbody></table>';
  }
  function cCore(ch, d) {
    return '<div class="grid g2"><div class="card"><h2>Core stats</h2>' + numTable(BA.CORE_STATS, d.coreStats) + '<div class="row" style="margin-top:10px"><button data-act="edit-map" data-key="coreStats">Edit</button></div></div>' +
      '<div class="card"><h2>What-if redistribution</h2><div class="small muted" style="margin-bottom:8px">Try a different spread without changing your build. Point totals, caps and reset rules in game are not verified here; check them before you reset.</div><div class="form" id="whatif">' +
      BA.CORE_STATS.map(function (x) { return inp('w_' + x.id, x.name, BA.num(d.coreStats[x.id])); }).join('') + '</div><div class="row" style="margin-top:10px"><button data-act="whatif">Compare</button></div><div id="whatifOut" style="margin-top:10px"></div></div></div>';
  }
  APP.act('whatif', function () {
    var o = APP.form(document.getElementById('whatif')), d = APP.pd(), tot0 = 0, tot1 = 0, rows = '';
    BA.CORE_STATS.forEach(function (x) {
      var a = BA.num(d.coreStats[x.id]) || 0, b = numOrNull(o['w_' + x.id]); b = b == null ? 0 : b; tot0 += a; tot1 += b;
      if (a !== b) rows += '<tr><td>' + e(x.name) + '</td><td class="right">' + a + ' -> ' + b + '</td><td>' + signed(b - a) + '</td><td class="small muted">' + e(x.effects.join(', ')) + '</td></tr>';
    });
    var off = { might: 1, precision: 1 }, gain = BA.CORE_STATS.filter(function (x) { return off[x.id] && (numOrNull(o['w_' + x.id]) || 0) > (BA.num(d.coreStats[x.id]) || 0); }).map(function (x) { return x.name; });
    document.getElementById('whatifOut').innerHTML = (rows ? '<table><tbody>' + rows + '</tbody></table>' : '<div class="muted small">No change.</div>') +
      '<div class="small" style="margin-top:6px">Total points: ' + tot0 + ' -> ' + tot1 + (tot0 !== tot1 ? ' <span class="warn">(different total, check how many points you really have)</span>' : '') + '.</div>' +
      (gain.length ? '<div class="small" style="margin-top:4px">More in ' + e(gain.join(' and ')) + ', which map to offensive effects. The size of the gain is not verified.</div>' : '');
  });
  function cDivine(ch, d) {
    var needs = BA.divineNeeds(d), bd = APP.bd(), total = BA.divineTotal(d);
    return '<div class="grid g2"><div class="card"><h2>Divine stats</h2>' + numTable(BA.DIVINE, d.divine, '', bd ? function (x) { var b = BA.num(bd.divine[x.id]); return b == null ? '' : '<span class="small muted">' + e(APP.bench().name) + ' ' + b + '</span>'; } : null) +
      '<div class="small" style="margin-top:8px">Sum of displayed levels: <b>' + f(total) + '</b> <span class="muted">(our own analytic total, not an official stat)</span></div><div class="row" style="margin-top:10px"><button data-act="edit-map" data-key="divine">Edit</button></div></div>' +
      '<div class="card"><h2>Collection priority (Assassin PvE)</h2><div class="small muted" style="margin-bottom:8px">Provisional collection-targeting hypothesis. Re-check it once your Combat Stats are recorded: if Critical Hit is already high, Death matters less than Time or Destruction.</div><ol>' +
      needs.map(function (x) { return '<li>' + e(x.name) + ' <span class="muted small">(' + (x.level == null ? '?' : x.level) + ') ' + e((BA.DIVINE.filter(function (y) { return y.id === x.id; })[0].effects).join(', ')) + '</span></li>'; }).join('') + '</ol><div class="small muted">Pantheon display effects are tracked separately in <a href="#/pantheon">Pantheon</a>.</div></div></div>';
  }
  function cDaev(ch, d) {
    var nodes = (d.daevanionNodes || []);
    return '<div class="grid g2"><div class="card"><h2>Daevanion boards</h2>' + numTable(BA.DAEVANION, d.daevanion, '%') + '<div class="row" style="margin-top:10px"><button data-act="edit-map" data-key="daevanion">Edit</button></div><div class="small muted" style="margin-top:6px">Completion % is not the same as offensive value.</div></div>' +
      '<div class="card"><h2>Nodes and route</h2>' + (nodes.length ? routeTable(nodes) : '<div class="muted small">No nodes recorded. Add the nodes you can see (bonus, prerequisites) to get a route suggestion.</div>') + '<div class="row" style="margin-top:10px"><button data-act="node-add">Add node</button></div></div></div>';
  }
  function routeTable(nodes) {
    var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
    var avail = nodes.filter(function (n) { return n.status !== 'done' && (n.prereq || []).every(function (p) { return byId[p] && byId[p].status === 'done'; }); });
    var V = { High: 3, Medium: 2, Low: 1 };
    avail.sort(function (a, b) { return (V[b.value] || 0) - (V[a.value] || 0); });
    return '<table><thead><tr><th>Node</th><th>Board</th><th>Bonus</th><th>Value</th><th>Status</th></tr></thead><tbody>' + nodes.map(function (n) { return '<tr><td>' + e(n.name) + '</td><td>' + e(n.board) + '</td><td class="small">' + e(n.bonus) + '</td><td>' + e(n.value) + '</td><td>' + e(n.status) + ' <button class="sm" data-act="node-toggle" data-id="' + e(n.id) + '">' + (n.status === 'done' ? 'Undo' : 'Done') + '</button></td></tr>'; }).join('') + '</tbody></table>' +
      '<h3>Next on the route</h3>' + (avail.length ? '<ol>' + avail.slice(0, 5).map(function (n) { return '<li>' + e(n.name) + ' <span class="small muted">' + e(n.board) + ', ' + e(n.value || 'value not set') + '</span></li>'; }).join('') + '</ol>' : '<div class="muted small">No available nodes (all done or prerequisites missing).</div>');
  }
  APP.act('node-add', function () {
    var d = APP.pd(), nodes = d.daevanionNodes || [];
    APP.dialog('Add Daevanion node', '<div class="form">' + inp('name', 'Node name', '') + '<div><label>Board</label><select name="board">' + BA.DAEVANION.map(function (b) { return '<option>' + e(b.name) + '</option>'; }).join('') + '</select></div>' + inp('bonus', 'Bonus (as shown)', '') +
      '<div><label>Value for boss DPS</label><select name="value"><option>High</option><option selected>Medium</option><option>Low</option></select></div><div><label>Status</label><select name="status"><option value="open">Open</option><option value="done">Done</option></select></div>' +
      '<div><label>Prerequisites</label><select name="prereq" multiple size="4">' + nodes.map(function (n) { return '<option value="' + e(n.id) + '">' + e(n.name) + '</option>'; }).join('') + '</select></div></div>', [{ label: 'Save as new snapshot', cls: 'pri', act: 'node-save' }]);
  });
  APP.act('node-save', function () {
    var o = APP.form(), sel = document.querySelector('#dlgBody select[name=prereq]'), pre = sel ? [].slice.call(sel.selectedOptions).map(function (x) { return x.value; }) : [];
    if (!o.name.trim()) return APP.toast('Name required.');
    APP.commit(APP.player(), function (d) { d.daevanionNodes = d.daevanionNodes || []; d.daevanionNodes.push({ id: BA.uid('node'), name: o.name.slice(0, 60), board: o.board, bonus: o.bonus.slice(0, 120), value: o.value, status: o.status, prereq: pre }); }, 'Daevanion node added');
    APP.closeDialog(); APP.render();
  });
  APP.act('node-toggle', function (el) {
    var id = el.getAttribute('data-id');
    APP.commit(APP.player(), function (d) { (d.daevanionNodes || []).forEach(function (n) { if (n.id === id) n.status = n.status === 'done' ? 'open' : 'done'; }); }, 'Daevanion node status');
    APP.render();
  });
  var MAPDEF = { coreStats: [BA.CORE_STATS, 'Core stats', 0, 999], divine: [BA.DIVINE, 'Divine stats', 0, 999], daevanion: [BA.DAEVANION, 'Daevanion (%)', 0, 100] };
  APP.act('edit-map', function (el) {
    var key = el.getAttribute('data-key'), def = MAPDEF[key], d = APP.pd();
    APP.dialog('Edit ' + def[1], '<div class="form">' + def[0].map(function (x) { return inp('m_' + x.id, x.name, BA.num(d[key][x.id])); }).join('') + '</div>' + provFields(), [{ label: 'Save as new snapshot', cls: 'pri', act: 'save-map', data: { key: key } }]);
  });
  APP.act('save-map', function (el) {
    var key = el.getAttribute('data-key'), def = MAPDEF[key], o = APP.form(), m = prov(o), d0 = APP.pd(), bad = [];
    APP.commit(APP.player(), function (d) {
      def[0].forEach(function (x) {
        var raw = o['m_' + x.id]; if (raw === '') return;
        var n = numOrNull(raw); if (n == null || n < def[2] || n > def[3]) { bad.push(x.name); return; }
        if (BA.num(d0[key][x.id]) === n) return;
        d[key][x.id] = { v: n, m: m };
      });
    }, def[1] + ' edit', o._obs);
    APP.closeDialog(); APP.toast(bad.length ? 'Saved. Rejected: ' + bad.join(', ') : 'Saved as a new snapshot.'); APP.render();
  });

  function cSkills(ch, d) {
    var h = d.skills.needsRefresh ? '<div class="note">Skill data needs a refresh. The AionFlex levels were outdated and are not shown as current. <a href="#/import">Import a Skills screenshot</a> or enter the levels below.</div>' : '';
    h += '<div class="card"><div class="row"><h2 style="margin:0;flex:1">Skills</h2><button class="pri sm" data-act="save-skills">Save levels as new snapshot</button></div><div class="tbl" id="skillForm"><table><thead><tr><th>Skill</th><th>Type</th><th>Level</th><th>Status</th><th>Notes</th></tr></thead><tbody>' +
      d.skills.list.map(function (s) { return '<tr><td>' + e(s.name) + '</td><td class="small muted">' + e(s.type) + '</td><td><input name="lv_' + e(s.id) + '" value="' + e(s.level == null ? '' : s.level) + '" style="width:70px"></td><td>' + APP.pill(s.m) + '</td><td><input name="nt_' + e(s.id) + '" value="' + e(s.note || '') + '" placeholder="role, breakpoints"></td></tr>'; }).join('') + '</tbody></table></div></div>';
    var rot = d.skills.rotations || {};
    h += '<div class="card" style="margin-top:14px" id="rotForm"><h2>Rotation notes</h2><div class="small muted" style="margin-bottom:8px">Write down what you actually do. No skill timings or coefficients are assumed here; compare with DPS logs.</div><div class="grid g3">' +
      [['boss', 'Single-target boss'], ['aoe', 'AoE dungeon'], ['burst', 'Burst windows']].map(function (r) { return '<div><label>' + e(r[1]) + '</label><textarea name="rot_' + r[0] + '">' + e(rot[r[0]] || '') + '</textarea></div>'; }).join('') + '</div><div class="row" style="margin-top:8px"><button data-act="save-rot">Save notes</button></div></div>';
    return h;
  }
  APP.act('save-skills', function () {
    var o = APP.form(document.getElementById('skillForm')), m = BA.meta('confirmed', 'Manual entry', APP.today()), bad = [], changed = 0;
    APP.commit(APP.player(), function (d) {
      d.skills.list.forEach(function (s) {
        var raw = o['lv_' + s.id]; s.note = (o['nt_' + s.id] || '').slice(0, 200);
        if (raw === '') return; var n = numOrNull(raw);
        if (n == null || n < 0 || n > 99 || Math.round(n) !== n) { bad.push(s.name); return; }
        if (s.level !== n || s.m.status === 'outdated') { s.level = n; s.m = m; changed++; }
      });
      d.skills.needsRefresh = d.skills.list.some(function (s) { return s.level == null || s.m.status === 'outdated'; });
    }, 'Skill levels (' + changed + ' changed)');
    APP.toast(bad.length ? 'Saved. Rejected: ' + bad.join(', ') : 'Skill levels saved.'); APP.render();
  });
  APP.act('save-rot', function () {
    var o = APP.form(document.getElementById('rotForm'));
    APP.commit(APP.player(), function (d) { d.skills.rotations = { boss: o.rot_boss.slice(0, 3000), aoe: o.rot_aoe.slice(0, 3000), burst: o.rot_burst.slice(0, 3000) }; }, 'Rotation notes');
    APP.toast('Notes saved.');
  });
  function cArcana(ch, d) {
    var bd = APP.bd(), st = BA.arcanaState(d);
    var h = st === 'none' ? '<div class="note bad">Arcana progression not started: no Arcana equipped (confirmed by you on ' + e(d.arcana.m.observedAt || '?') + ').</div>' : '';
    h += '<div class="grid g2"><div class="card"><h2>Your Arcana</h2>' + (d.arcana.items.length ? '<table><thead><tr><th>Arcana</th><th>Enh.</th><th>Rarity</th><th>Stats</th><th></th></tr></thead><tbody>' + d.arcana.items.map(function (a, i) { return '<tr><td>' + e(a.name) + '</td><td>+' + e(a.enh) + '</td><td>' + e(a.rarity || '-') + '</td><td class="small">' + e((a.stats || []).join(', ') || 'not recorded') + '</td><td><button class="sm" data-act="arc-del" data-i="' + i + '">Remove</button></td></tr>'; }).join('') + '</tbody></table>' : '<div class="muted small">None equipped.</div>') +
      '<div class="row" style="margin-top:10px"><button data-act="arc-add">Add Arcana</button></div></div>';
    h += '<div class="card"><h2>Getting started</h2><div class="small">How Arcana are obtained on Global is <b>not verified</b> in this tool yet. Before spending resources:</div><ol class="small"><li>Check official patch notes and in-game tooltips for Global Arcana sources.</li><li>Record what you find in <a href="#/research">Research</a> with the source link.</li><li>Record each Arcana you get here, including its stats.</li></ol>' +
      (bd && BA.arcanaState(bd) === 'equipped' ? '<h3>' + e(APP.bench().name) + ' (historical)</h3><ul class="list">' + bd.arcana.items.map(function (a) { return '<li class="small">' + e(a.name) + ' +' + e(a.enh) + '</li>'; }).join('') + '</ul><div class="small muted">Copying this set is not necessarily optimal; their stats are not recorded.</div>' : '') + '</div></div>';
    return h;
  }
  APP.act('arc-add', function () {
    APP.dialog('Add Arcana', '<div class="form">' + inp('name', 'Name', '') + inp('enh', 'Enhancement', '0') + inp('rarity', 'Rarity', '') + inp('slot', 'Slot', '') + inp('stats', 'Stat bonuses (comma separated)', '') + inp('source', 'Acquired from', 'Not verified') + '</div>' + provFields(), [{ label: 'Save as new snapshot', cls: 'pri', act: 'arc-save' }]);
  });
  APP.act('arc-save', function () {
    var o = APP.form(); if (!o.name.trim()) return APP.toast('Name required.');
    var enh = numOrNull(o.enh); if (enh == null || enh < 0 || enh > 30) return APP.toast('Enhancement must be 0-30.');
    APP.commit(APP.player(), function (d) { d.arcana.items.push({ name: o.name.slice(0, 60), enh: enh, rarity: o.rarity || null, slot: o.slot || null, stats: o.stats ? o.stats.split(',').map(function (s) { return s.trim(); }).filter(Boolean) : [], source: o.source, m: prov(o) }); d.arcana.state = 'equipped'; d.arcana.m = prov(o); }, 'Arcana added', o._obs);
    APP.closeDialog(); APP.render();
  });
  APP.act('arc-del', function (el) {
    var i = +el.getAttribute('data-i');
    APP.commit(APP.player(), function (d) { d.arcana.items.splice(i, 1); if (!d.arcana.items.length) d.arcana.state = 'none'; d.arcana.m = BA.meta('confirmed', 'Manual entry', APP.today()); }, 'Arcana removed');
    APP.render();
  });
  function cMore(ch, d) {
    function blk(title, key, rows) { return '<div class="card"><h2>' + e(title) + '</h2><table><tbody>' + rows.map(function (r) { return '<tr><td class="muted">' + e(r[0]) + '</td><td>' + (r[1] == null || r[1] === '' ? '<span class="muted">-</span>' : e(r[1])) + '</td></tr>'; }).join('') + '</tbody></table><div class="row" style="margin-top:8px">' + APP.pill(d[key].m) + '<span style="flex:1"></span><button class="sm" data-act="edit-obj" data-key="' + key + '">Edit</button></div></div>'; }
    return '<div class="grid g2">' + blk('Titles', 'titles', [['Unlocked', d.titles.unlocked], ['Total', d.titles.total], ['Selected', d.titles.selected], ['Bonuses', d.titles.bonuses]]) +
      blk('Pet', 'pet', [['Name', d.pet.name], ['Level', d.pet.level], ['Rarity', d.pet.rarity], ['Combat effects', d.pet.effects]]) +
      blk('Wings', 'wings', [['Name', d.wings.name], ['Rarity', d.wings.rarity], ['Stat bonuses', d.wings.stats || 'Not recorded (cosmetic look is not a stat source unless verified)']]) +
      blk('Collections', 'collections', [['Notes', d.collections.notes]]) + '</div>';
  }
  var OBJF = { titles: [['unlocked', 'Unlocked', 1], ['total', 'Total', 1], ['selected', 'Selected title'], ['bonuses', 'Bonuses']], pet: [['name', 'Name'], ['level', 'Level', 1], ['rarity', 'Rarity'], ['effects', 'Combat effects']], wings: [['name', 'Name'], ['rarity', 'Rarity'], ['stats', 'Actual stat bonuses']], collections: [['notes', 'Completion and bonuses']] };
  APP.act('edit-obj', function (el) {
    var key = el.getAttribute('data-key'), d = APP.pd();
    APP.dialog('Edit ' + key, '<div class="form">' + OBJF[key].map(function (x) { return inp(x[0], x[1], d[key][x[0]]); }).join('') + '</div>' + provFields(), [{ label: 'Save as new snapshot', cls: 'pri', act: 'save-obj', data: { key: key } }]);
  });
  APP.act('save-obj', function (el) {
    var key = el.getAttribute('data-key'), o = APP.form();
    APP.commit(APP.player(), function (d) { OBJF[key].forEach(function (x) { var v = o[x[0]]; d[key][x[0]] = x[2] ? numOrNull(v) : (v || '').slice(0, 300) || null; }); d[key].m = prov(o); }, key + ' edit', o._obs);
    APP.closeDialog(); APP.render();
  });

  /* ------------------------------------------------------------------ equipment */
  APP.view('equipment', { title: 'Equipment', icon: 'eq', group: 'Overview', render: function () {
    var d = APP.pd(), groups = { weapon: 'Weapons', armor: 'Armor', accessory: 'Accessories', rune: 'Runes' };
    var h = '<div class="head"><div><h1>Equipment</h1><div class="muted">Click a slot for details. Rolls, Soul Binding and Manastones decide item value; rarity alone does not.</div></div></div>';
    Object.keys(groups).forEach(function (g) {
      h += '<div class="card" style="margin-bottom:12px"><h2>' + groups[g] + '</h2><div class="eq">' + BA.SLOTS.filter(function (s) { return s.group === g; }).map(function (s) {
        var it = d.equipment[s.id];
        return '<button class="slot" data-act="item-open" data-slot="' + e(s.id) + '"><div class="sn">' + e(s.name) + '</div><div class="in">' + (it ? e(it.name) + ' <span class="en">+' + e(it.enh) + '</span>' : '<span class="muted">Empty</span>') + '</div><div class="small muted">' + (it ? (it.rolls.length + it.soulBinding.length + it.manastones.length) + ' stat lines &middot; ' : '') + '</div>' + (it ? APP.pill(it.m) : '') + '</button>';
      }).join('') + '</div></div>';
    });
    h += '<div class="card"><h2>Arcana</h2>' + (d.arcana.items.length ? d.arcana.items.map(function (a) { return '<span class="chip">' + e(a.name) + ' +' + e(a.enh) + '</span>'; }).join('') : '<span class="bad">None equipped</span>') + ' <a href="#/character/arcana" class="small">Manage</a></div>';
    h += '<div class="card" style="margin-top:12px" id="cmpTool"><h2>Item comparison</h2><div class="small muted" style="margin-bottom:8px">Compare your item with a candidate, for example "Aulamus Dagger +10 vs my Spiritforged Dagger +12". Enter the stat lines you see on both tooltips; one per line as <span class="mono">Stat name: value</span>.</div>' +
      '<div class="form"><div><label>Slot</label><select name="slot" data-chg="cmp-slot">' + BA.SLOTS.map(function (s) { return '<option value="' + e(s.id) + '">' + e(s.name) + '</option>'; }).join('') + '</select></div>' + inp('cname', 'Candidate item', '') + inp('cenh', 'Candidate enhancement', '') + inp('ccost', 'Cost to get it (Kinah or notes)', '') + '</div>' +
      '<div class="grid g2" style="margin-top:10px"><div><label>Your item stats</label><textarea name="astats" placeholder="Attack: 1200&#10;Critical Hit: 85"></textarea></div><div><label>Candidate stats</label><textarea name="bstats" placeholder="Attack: 1350&#10;Combat Speed: 3%"></textarea></div></div>' +
      '<div class="row" style="margin-top:10px"><button data-act="cmp-run" class="pri">Compare</button></div><div id="cmpOut" style="margin-top:12px"></div></div>';
    return h;
  }, after: function () { fillCmpStats(); } });
  function fillCmpStats() {
    var root = document.getElementById('cmpTool'); if (!root) return;
    var slot = root.querySelector('[name=slot]').value, it = APP.pd().equipment[slot];
    root.querySelector('[name=astats]').value = it ? it.base.concat(it.rolls, it.soulBinding, it.manastones).map(function (r) { return (r.name || (BA.STAT_BY_ID[r.stat] || {}).name) + ': ' + r.value + (r.unit === '%' ? '%' : ''); }).join('\n') : '';
  }
  APP.onChange('cmp-slot', fillCmpStats);
  function parseLines(t) {
    var out = [], bad = [];
    String(t || '').split(/\n/).forEach(function (l) { l = l.trim(); if (!l) return; var m = l.match(/^(.+?)\s*[:=]\s*([-\d.,]+)\s*(%?)$/); if (!m) { bad.push(l); return; } var id = BA.statIdFor(m[1]), v = BA.parseNum(m[2]); if (!id || v == null) { bad.push(l); return; } out.push({ stat: id, name: BA.STAT_BY_ID[id].name, value: v, unit: m[3] || BA.STAT_BY_ID[id].unit }); });
    return { rows: out, bad: bad };
  }
  APP.parseLines = parseLines;
  APP.act('cmp-run', function () {
    var root = document.getElementById('cmpTool'), o = APP.form(root), A = parseLines(o.astats), B = parseLines(o.bstats), tiers = BA.tiersFor(APP.state.selected.mode, APP.state.customTiers);
    var it = APP.pd().equipment[o.slot], ids = {};
    A.rows.concat(B.rows).forEach(function (r) { ids[r.stat] = 1; });
    var better = 0, worse = 0, lean = 0, rows = Object.keys(ids).map(function (id) {
      var a = A.rows.filter(function (r) { return r.stat === id; }).reduce(function (s, r) { return s + r.value; }, 0), b = B.rows.filter(function (r) { return r.stat === id; }).reduce(function (s, r) { return s + r.value; }, 0);
      var t = BA.tierOf(id, tiers), w = { 'S+': 6, S: 5, 'A+': 4, A: 3, B: 2, C: 1 }[t] || 0;
      if (b > a) { better++; lean += w; } else if (b < a) { worse++; lean -= w; }
      return '<tr class="' + (b > a ? 'ok-row' : b < a ? 'bad-row' : '') + '"><td>' + e(BA.STAT_BY_ID[id].name) + '</td><td>' + APP.tier(t) + '</td><td class="right">' + a + '</td><td class="right">' + b + '</td><td>' + signed(Math.round((b - a)*100)/100) + '</td></tr>';
    }).join('');
    var verdict;
    if (!rows) verdict = '<div class="note">Enter stat lines for at least one item.</div>';
    else if (better && !worse) verdict = '<div class="note info">The candidate is equal or better on every recorded stat.</div>';
    else if (worse && !better) verdict = '<div class="note bad">Your current item is equal or better on every recorded stat.</div>';
    else verdict = '<div class="note">Trade-off: the candidate gains ' + better + ' stat(s) and loses ' + worse + '. Weighted by the provisional tier list it leans <b>' + (lean > 0 ? 'towards the candidate' : lean < 0 ? 'towards your item' : 'neither way') + '</b>. This is a heuristic, not a DPS calculation; confirm with a DPS log.</div>';
    document.getElementById('cmpOut').innerHTML = verdict + (rows ? '<table><thead><tr><th>Stat</th><th>Tier</th><th class="right">' + e(it ? it.name + ' +' + it.enh : 'Yours') + '</th><th class="right">' + e((o.cname || 'Candidate') + (o.cenh ? ' +' + o.cenh : '')) + '</th><th>Diff</th></tr></thead><tbody>' + rows + '</tbody></table>' : '') +
      (A.bad.length + B.bad.length ? '<div class="small warn" style="margin-top:6px">Ignored lines (unknown stat or no number): ' + e(A.bad.concat(B.bad).join(' | ')) + '</div>' : '') + (o.ccost ? '<div class="small" style="margin-top:6px">Cost noted: ' + e(o.ccost) + '. Weigh it against your <a href="#/planner">resources</a>.</div>' : '');
  });
  APP.act('item-open', function (el) {
    var slot = el.getAttribute('data-slot'), it = APP.pd().equipment[slot] || { name: '', enh: '', rarity: '', itemLevel: '', base: [], rolls: [], soulBinding: [], manastones: [], set: '', acquisition: '' };
    function lines(arr) { return arr.map(function (r) { return (r.name || (BA.STAT_BY_ID[r.stat] || {}).name) + ': ' + r.value + (r.unit === '%' ? '%' : ''); }).join('\n'); }
    APP.dialog(BA.SLOT_BY_ID[slot].name, (it.m ? '<div class="row small" style="margin-bottom:8px">' + APP.pill(it.m) + '<span class="muted">' + [it.m.source, it.m.observedAt, it.m.note].filter(Boolean).map(e).join(' &middot; ') + '</span></div>' : '') +
      '<div class="form">' + inp('name', 'Name', it.name) + inp('enh', 'Enhancement', it.enh) + inp('rarity', 'Rarity', it.rarity) + inp('itemLevel', 'Item level', it.itemLevel) + inp('set', 'Set bonus', it.set) + inp('acquisition', 'Acquired from', it.acquisition) + '</div>' +
      '<div class="grid g2" style="margin-top:10px">' + [['base', 'Base attributes'], ['rolls', 'Additional rolls'], ['soulBinding', 'Soul Binding'], ['manastones', 'Manastones']].map(function (x) { return '<div><label>' + x[1] + ' (Stat: value)</label><textarea name="' + x[0] + '">' + e(lines(it[x[0]] || [])) + '</textarea></div>'; }).join('') + '</div>' + provFields(),
      [{ label: 'Save as new snapshot', cls: 'pri', act: 'item-save', data: { slot: slot } }]);
  });
  APP.act('item-save', function (el) {
    var slot = el.getAttribute('data-slot'), o = APP.form(), enh = numOrNull(o.enh), bad = [];
    if (!o.name.trim()) return APP.toast('Item name required.');
    if (enh == null || enh < 0 || enh > 30 || Math.round(enh) !== enh) return APP.toast('Enhancement must be a whole number 0-30.');
    var lists = {}; ['base', 'rolls', 'soulBinding', 'manastones'].forEach(function (k) { var p = parseLines(o[k]); lists[k] = p.rows; bad = bad.concat(p.bad); });
    APP.commit(APP.player(), function (d) {
      d.equipment[slot] = { name: o.name.slice(0, 60), enh: enh, rarity: o.rarity || null, itemLevel: numOrNull(o.itemLevel), base: lists.base, rolls: lists.rolls, soulBinding: lists.soulBinding, manastones: lists.manastones, set: o.set || null, acquisition: o.acquisition || null, m: prov(o) };
    }, BA.SLOT_BY_ID[slot].name + ': ' + o.name + ' +' + enh, o._obs);
    APP.closeDialog(); APP.toast(bad.length ? 'Saved. Ignored: ' + bad.join(' | ') : 'Saved as a new snapshot.'); APP.render();
  });

  /* ------------------------------------------------------------------ compare */
  APP.view('compare', { title: 'Compare', icon: 'cmp', group: 'Analysis', render: function () {
    var s = APP.state, sel = s.cmp || {}, A = BA.getChar(s, sel.a || s.selected.player) || APP.player(), B = BA.getChar(s, sel.b || s.selected.benchmark) || s.characters.filter(function (c) { return c !== A; })[0];
    if (!B) return '<div class="note">Add a second character to compare.</div>';
    var sa = A.snapshots.filter(function (x) { return x.id === sel.sa; })[0] || BA.latest(A), sb = B.snapshots.filter(function (x) { return x.id === sel.sb; })[0] || BA.latest(B);
    var c = BA.compare(sa.data, sb.data, { mode: s.selected.mode, customTiers: s.customTiers });
    function chSel(n, v) { return '<select data-chg="cmp-sel" name="' + n + '">' + s.characters.map(function (x) { return '<option value="' + e(x.id) + '"' + (x.id === v ? ' selected' : '') + '>' + e(x.name) + '</option>'; }).join('') + '</select>'; }
    function snSel(n, ch, v) { return '<select data-chg="cmp-sel" name="' + n + '">' + ch.snapshots.map(function (x) { return '<option value="' + e(x.id) + '"' + (x.id === v ? ' selected' : '') + '>' + e(x.observedAt + ' - ' + x.label) + '</option>'; }).join('') + '</select>'; }
    var h = '<div class="head"><div><h1>Compare</h1><div class="muted">' + e(A.name) + ' vs ' + e(B.name) + '. ' + (B.role === 'benchmark' ? 'Benchmark data is historical unless refreshed.' : '') + '</div></div></div>';
    h += '<div class="card" id="cmpSel"><div class="form"><div><label>Player A</label>' + chSel('a', A.id) + '</div><div><label>Snapshot A</label>' + snSel('sa', A, sa.id) + '</div><div><label>Player B</label>' + chSel('b', B.id) + '</div><div><label>Snapshot B</label>' + snSel('sb', B, sb.id) + '</div>' +
      '<div><label>Optimization mode</label><select data-chg="mode">' + Object.keys(BA.MODES).map(function (m) { return '<option value="' + m + '"' + (m === s.selected.mode ? ' selected' : '') + '>' + e(BA.MODES[m].label) + '</option>'; }).join('') + '</select></div></div><div class="small muted" style="margin-top:6px">' + e(BA.MODES[s.selected.mode].note) + '</div></div>';
    h += '<div class="card hl" style="margin-top:14px"><h2>Overview</h2>' + listOf(c.overview, 'No overlapping data.') + '</div>';
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Where ' + e(A.name) + ' is ahead</h2>' + listOf(c.advantages, 'Nothing recorded.') + '</div><div class="card"><h2>Where ' + e(B.name) + ' is ahead</h2>' + listOf(c.disadvantages, 'Nothing recorded.') + '</div></div>';
    h += '<div class="grid g3" style="margin-top:14px"><div class="card"><h2>Missing systems</h2>' + listOf(c.missingSystems, 'None.') + '</div><div class="card"><h2>DPS-relevant</h2>' + listOf(c.dpsRelevant, 'Nothing that can be judged yet.') + '</div><div class="card"><h2>CP-relevant</h2>' + listOf(c.cpRelevant, '-') + '</div></div>';
    h += '<div class="card" style="margin-top:14px"><h2>Equipment by slot</h2><div class="tbl"><table><thead><tr><th>Slot</th><th>' + e(A.name) + '</th><th>' + e(B.name) + '</th><th>Result</th></tr></thead><tbody>' + c.slots.map(function (r) {
      var lab = { ahead: '<span class="good">Ahead +' + r.enhDiff + '</span>', behind: '<span class="bad">Behind ' + r.enhDiff + '</span>', equal: '<span class="muted">Equal</span>', different: '<span class="warn">Different item</span>', missing: '<span class="bad">Empty</span>', unknown: '<span class="muted">Unknown</span>' }[r.verdict];
      return '<tr><td>' + e(r.slotName) + '</td><td>' + (r.a ? e(r.a.name) + ' <span class="gold">+' + e(r.a.enh) + '</span>' : '-') + '</td><td>' + (r.b ? e(r.b.name) + ' <span class="gold">+' + e(r.b.enh) + '</span>' : '-') + '</td><td>' + lab + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Divine stats</h2><table><thead><tr><th>Stat</th><th class="right">A</th><th class="right">B</th><th>Diff</th></tr></thead><tbody>' + c.divine.map(function (r) { return '<tr><td>' + e(r.name) + '<div class="small muted">' + e(r.effects.join(', ')) + '</div></td><td class="right">' + f(r.a) + '</td><td class="right">' + f(r.b) + '</td><td>' + signed(r.diff) + '</td></tr>'; }).join('') +
      '<tr><td><b>Sum of displayed levels</b></td><td class="right"><b>' + f(BA.divineTotal(sa.data)) + '</b></td><td class="right"><b>' + f(BA.divineTotal(sb.data)) + '</b></td><td></td></tr></tbody></table></div>' +
      '<div class="card"><h2>Daevanion</h2><table><thead><tr><th>Board</th><th class="right">A</th><th class="right">B</th><th>Diff</th></tr></thead><tbody>' + c.daevanion.map(function (r) { return '<tr><td>' + e(r.name) + '</td><td class="right">' + f(r.a) + '%</td><td class="right">' + f(r.b) + '%</td><td>' + signed(r.diff) + '</td></tr>'; }).join('') + '</tbody></table>' +
      '<h3>Other systems</h3><table><tbody><tr><td>Arcana</td><td>' + e(BA.arcanaState(sa.data)) + '</td><td>' + e(BA.arcanaState(sb.data)) + (sb.data.arcana.items.length ? ' (' + sb.data.arcana.items.map(function (x) { return e(x.name + ' +' + x.enh); }).join(', ') + ')' : '') + '</td></tr><tr><td>Titles</td><td>' + (sa.data.titles.unlocked == null ? '?' : sa.data.titles.unlocked) + '</td><td>' + (sb.data.titles.unlocked == null ? '?' : sb.data.titles.unlocked + '/' + sb.data.titles.total) + '</td></tr><tr><td>Pantheon</td><td>' + (sa.data.pantheon.collected == null ? '?' : sa.data.pantheon.collected + '/' + sa.data.pantheon.total) + '</td><td>' + (sb.data.pantheon.collected == null ? '?' : sb.data.pantheon.collected + '/' + sb.data.pantheon.total) + '</td></tr><tr><td>Pet</td><td>' + e(sa.data.pet.name || '?') + '</td><td>' + e(sb.data.pet.name || '?') + '</td></tr><tr><td>Wings</td><td>' + e(sa.data.wings.name || '?') + '</td><td>' + e(sb.data.wings.name || '?') + '</td></tr></tbody></table></div></div>';
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Unknowns</h2>' + listOf(c.unknowns, 'Nothing missing.') + '</div>';
    var recs = BA.recommendations(sa.data, sb.data, { mode: s.selected.mode, customTiers: s.customTiers, benchName: B.name }), ranked = BA.rank(recs, s.selected.rankMode, APP.doneMap());
    h += '<div class="card"><h2>Catch-up plan</h2><ol class="small">' + ranked.slice(0, 8).map(function (r) { return '<li>' + e(r.rec.title) + ' <span class="muted">(' + e(r.rec.kind === 'data' ? 'data first' : 'DPS ' + r.rec.dps + ', confidence ' + r.rec.confidence) + ')</span></li>'; }).join('') + '</ol><a href="#/planner" class="small">Open the planner</a></div></div>';
    return h;
  } });
  APP.onChange('cmp-sel', function () { var o = APP.form(document.getElementById('cmpSel')); var cur = APP.state.cmp || {}; if (o.a !== cur.a) o.sa = null; if (o.b !== cur.b) o.sb = null; APP.state.cmp = o; APP.save(); APP.render(); });
  APP.onChange('mode', function (el) { APP.state.selected.mode = el.value; APP.save(); APP.render(); });

  /* ------------------------------------------------------------------ planner */
  APP.view('planner', { title: 'Upgrade Planner', icon: 'plan', group: 'Analysis', render: function () {
    var s = APP.state, recs = APP.recs(), done = APP.doneMap(), mode = s.selected.rankMode, best = BA.bestNext(recs, mode, done), ranked = BA.rank(recs, mode, done);
    var tasks; try { tasks = BA.taskOrder(s.tasks.filter(function (t) { return t.character === s.selected.player; })); } catch (err) { tasks = s.tasks; }
    var h = '<div class="head"><div><h1>Upgrade Planner</h1><div class="muted">Ranking uses labelled dimensions (DPS, confidence, cost, time, availability). It is an ordering, not a damage calculation.</div></div><span class="sp"></span><div><label>Ranking mode</label><select data-chg="rank-mode">' + Object.keys(BA.RANK_MODES).map(function (m) { return '<option value="' + m + '"' + (m === mode ? ' selected' : '') + '>' + e(BA.RANK_MODES[m].label) + '</option>'; }).join('') + '</select></div></div>';
    h += '<div class="card hl"><h2>Best next upgrade</h2>' + (best ? '<div class="t" style="font-size:16px;font-weight:600">' + e(best.rec.title) + '</div><div class="small muted">' + e(best.rec.description) + '</div><div class="small" style="margin-top:6px"><b>Why it wins:</b> ' + e(best.why) + '</div><div class="small" style="margin-top:4px">Costs: ' + e(best.rec.resources) + '. Risk: ' + e(best.rec.risk) + '.</div>' : '<div class="muted">No upgrade candidates.</div>') + '</div>';
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Recommendations</h2><ul class="list">' + ranked.map(function (r) { return recRow(r.rec, { blocked: r.blocked, why: true }); }).join('') + '</ul></div>';
    h += '<div><div class="card"><div class="row"><h2 style="margin:0;flex:1">Your plan</h2><button class="sm" data-act="task-new">Add task</button></div>' + (tasks.length ? '<ul class="list">' + tasks.map(function (t) { return taskRow(t, s.tasks); }).join('') + '</ul>' : '<div class="muted small" style="margin-top:8px">No tasks yet. Add one from the recommendations.</div>') + '</div>';
    h += '<div class="card" style="margin-top:14px"><div class="row"><h2 style="margin:0;flex:1">Resources</h2><button class="sm" data-act="res-new">Add resource</button></div>' + resTable(s.resources) + '<div class="small muted" style="margin-top:6px">Costs, success rates and drop rates are never assumed. Enter what you know; probabilistic costs stay marked as expected, not guaranteed.</div></div>';
    h += '<div class="card" style="margin-top:14px"><h2>Targets</h2><div class="form" id="tgtForm">' + inp('cpTarget', 'CP target', (s.targets || {}).cp) + inp('note', 'Target items / notes', (s.targets || {}).note) + '</div><div class="row" style="margin-top:8px"><button class="sm" data-act="tgt-save">Save</button>' + tgtProgress() + '</div></div></div></div>';
    return h;
  } });
  function tgtProgress() {
    var t = (APP.state.targets || {}).cp, cp = BA.num(APP.pd().cp);
    if (!t || cp == null) return '';
    return '<span class="small" style="flex:1">' + APP.bar(cp / t * 100) + ' ' + e(BA.fmt(cp)) + ' / ' + e(BA.fmt(+t)) + ' (' + e(BA.fmt(t - cp)) + ' to go)</span>';
  }
  APP.act('tgt-save', function () { var o = APP.form(document.getElementById('tgtForm')); APP.state.targets = { cp: numOrNull(o.cpTarget), note: o.note.slice(0, 300) }; APP.save(); APP.render(); });
  APP.onChange('rank-mode', function (el) { APP.state.selected.rankMode = el.value; APP.save(); APP.render(); });
  function taskRow(t, all) {
    var cc = BA.canComplete(t, all), rc = BA.resourceCheck(t, APP.state.resources);
    return '<li><div class="row"><b class="' + (t.status === 'done' ? 'good' : '') + '">' + (t.status === 'done' ? 'Done: ' : '') + e(t.title) + '</b><span class="pill">' + e(t.status) + '</span><span style="flex:1"></span>' +
      '<button class="sm ghost" data-act="task-move" data-id="' + e(t.id) + '" data-dir="-1" aria-label="Move up">Up</button><button class="sm ghost" data-act="task-move" data-id="' + e(t.id) + '" data-dir="1" aria-label="Move down">Down</button><button class="sm" data-act="task-edit" data-id="' + e(t.id) + '">Edit</button>' +
      (t.status !== 'done' ? '<button class="sm pri" data-act="task-done" data-id="' + e(t.id) + '"' + (cc.ok ? '' : ' disabled title="Waits on: ' + e(cc.blockedBy.join(', ')) + '"') + '>Complete</button>' : '<button class="sm" data-act="task-reopen" data-id="' + e(t.id) + '">Reopen</button>') + '</div>' +
      (t.notes ? '<div class="small muted">' + e(t.notes) + '</div>' : '') + (!cc.ok ? '<div class="small warn">Waits on: ' + e(cc.blockedBy.join(', ')) + '</div>' : '') +
      (rc.length ? '<div class="small">' + rc.map(function (m) { return '<span class="chip">' + e(m.name) + ' ' + e(BA.fmt(m.need)) + (m.have == null ? ' (stock not tracked)' : m.short ? ' <span class="bad">short ' + e(BA.fmt(m.short)) + '</span>' : ' <span class="good">covered</span>') + (m.guaranteed ? '' : ' expected') + '</span>'; }).join('') + '</div>' : '') +
      (t.actual ? '<div class="small good">Result: ' + e(t.actual) + '</div>' : '') + '</li>';
  }
  function resTable(rs) {
    if (!rs.length) return '<div class="muted small" style="margin-top:8px">Nothing tracked.</div>';
    return '<table><thead><tr><th>Resource</th><th class="right">Have</th><th class="right">Budget</th><th></th></tr></thead><tbody>' + rs.map(function (r) { return '<tr><td>' + e(r.name) + '</td><td class="right">' + e(BA.fmt(r.amount)) + '</td><td class="right">' + (r.budget == null ? '-' : e(BA.fmt(r.budget))) + '</td><td class="right"><button class="sm" data-act="res-edit" data-id="' + e(r.id) + '">Edit</button></td></tr>'; }).join('') + '</tbody></table>';
  }
  function taskForm(t) {
    var all = APP.state.tasks.filter(function (x) { return x.id !== (t && t.id); });
    t = t || { title: '', notes: '', dependsOn: [], materials: [], target: '' };
    return '<div class="form">' + inp('title', 'Title', t.title) + inp('target', 'Target (item, level, stat)', t.target) + '</div><div style="margin-top:10px"><label>Notes</label><textarea name="notes">' + e(t.notes) + '</textarea></div>' +
      '<div class="grid g2" style="margin-top:10px"><div><label>Depends on</label><select name="deps" multiple size="5">' + all.map(function (x) { return '<option value="' + e(x.id) + '"' + (t.dependsOn.indexOf(x.id) >= 0 ? ' selected' : '') + '>' + e(x.title) + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Materials (one per line: name: amount, add "~" for expected cost)</label><textarea name="materials">' + e(t.materials.map(function (m) { return m.name + ': ' + (m.guaranteed === false ? '~' : '') + m.amount; }).join('\n')) + '</textarea></div></div>';
  }
  function readTask(o) {
    var sel = document.querySelector('#dlgBody select[name=deps]'), deps = sel ? [].slice.call(sel.selectedOptions).map(function (x) { return x.value; }) : [];
    var mats = String(o.materials || '').split('\n').map(function (l) { var m = l.match(/^(.+?):\s*(~?)\s*([\d.,]+)\s*$/); return m ? { name: m[1].trim().slice(0, 60), amount: BA.parseNum(m[3]), guaranteed: !m[2] } : null; }).filter(Boolean);
    return { title: (o.title || '').slice(0, 120), notes: (o.notes || '').slice(0, 1000), target: (o.target || '').slice(0, 120), dependsOn: deps, materials: mats };
  }
  APP.act('task-new', function () { APP.dialog('New task', taskForm(), [{ label: 'Add', cls: 'pri', act: 'task-create' }]); });
  APP.act('task-create', function () { var t = readTask(APP.form()); if (!t.title) return APP.toast('Title required.'); APP.addTask(t); try { BA.taskOrder(APP.state.tasks); } catch (err) { APP.state.tasks.pop(); APP.save(); return APP.toast(err.message); } APP.closeDialog(); APP.render(); });
  function task(id) { return APP.state.tasks.filter(function (t) { return t.id === id; })[0]; }
  APP.act('task-edit', function (el) { var t = task(el.getAttribute('data-id')); APP.dialog('Edit task', taskForm(t) + '<div style="margin-top:10px"><button class="sm ghost" data-act="task-del" data-id="' + e(t.id) + '">Delete task</button></div>', [{ label: 'Save', cls: 'pri', act: 'task-update', data: { id: t.id } }]); });
  APP.act('task-update', function (el) {
    var t = task(el.getAttribute('data-id')), n = readTask(APP.form()), old = BA.clone(t);
    Object.keys(n).forEach(function (k) { t[k] = n[k]; });
    try { BA.taskOrder(APP.state.tasks); } catch (err) { Object.keys(old).forEach(function (k) { t[k] = old[k]; }); return APP.toast(err.message); }
    APP.save(); APP.closeDialog(); APP.render();
  });
  APP.act('task-del', function (el) { var id = el.getAttribute('data-id'); APP.state.tasks = APP.state.tasks.filter(function (t) { return t.id !== id; }); APP.state.tasks.forEach(function (t) { t.dependsOn = t.dependsOn.filter(function (d) { return d !== id; }); }); APP.save(); APP.closeDialog(); APP.render(); });
  APP.act('task-move', function (el) {
    var id = el.getAttribute('data-id'), dir = +el.getAttribute('data-dir'), list = APP.state.tasks.slice().sort(function (a, b) { return a.order - b.order; }), i = list.findIndex(function (t) { return t.id === id; }), j = i + dir;
    if (j < 0 || j >= list.length) return; var tmp = list[i].order; list[i].order = list[j].order; list[j].order = tmp; if (list[i].order === list[j].order) list[i].order += dir;
    APP.save(); APP.render();
  });
  APP.act('task-done', function (el) {
    var t = task(el.getAttribute('data-id')), cc = BA.canComplete(t, APP.state.tasks);
    if (!cc.ok) return APP.toast('Finish first: ' + cc.blockedBy.join(', '));
    APP.dialog('Complete: ' + t.title, '<div><label>What actually changed? (for example "+11 reached, CP 72,815 -> 73,400")</label><textarea name="actual"></textarea></div><div class="small muted" style="margin-top:6px">To record new values (CP, stats, gear), save a new snapshot from the Character or Equipment page, or import a screenshot. Old snapshots are kept.</div>', [{ label: 'Mark completed', cls: 'pri', act: 'task-complete', data: { id: t.id } }]);
  });
  APP.act('task-complete', function (el) { var t = task(el.getAttribute('data-id')), o = APP.form(); t.status = 'done'; t.completedAt = new Date().toISOString(); t.actual = (o.actual || '').slice(0, 500); APP.save(); APP.closeDialog(); APP.toast('Task completed.'); APP.render(); });
  APP.act('task-reopen', function (el) { var t = task(el.getAttribute('data-id')); t.status = 'todo'; t.completedAt = null; APP.save(); APP.render(); });
  function resForm(r) { r = r || {}; return '<div class="form">' + inp('name', 'Name (Kinah, materials, currencies)', r.name) + inp('amount', 'Amount you have', r.amount) + inp('budget', 'Budget for upgrades (optional)', r.budget) + '</div>'; }
  APP.act('res-new', function () { APP.dialog('Add resource', resForm(), [{ label: 'Add', cls: 'pri', act: 'res-save' }]); });
  APP.act('res-edit', function (el) { var r = APP.state.resources.filter(function (x) { return x.id === el.getAttribute('data-id'); })[0]; APP.dialog('Edit resource', resForm(r) + '<div style="margin-top:10px"><button class="sm ghost" data-act="res-del" data-id="' + e(r.id) + '">Delete</button></div>', [{ label: 'Save', cls: 'pri', act: 'res-save', data: { id: r.id } }]); });
  APP.act('res-save', function (el) {
    var o = APP.form(), amt = numOrNull(o.amount); if (!o.name.trim() || amt == null) return APP.toast('Name and a numeric amount are required.');
    var id = el.getAttribute('data-id'), r = id ? APP.state.resources.filter(function (x) { return x.id === id; })[0] : null;
    if (!r) { r = { id: BA.uid('res') }; APP.state.resources.push(r); }
    r.name = o.name.slice(0, 60); r.amount = amt; r.budget = numOrNull(o.budget); r.updatedAt = new Date().toISOString();
    APP.save(); APP.closeDialog(); APP.render();
  });
  APP.act('res-del', function (el) { var id = el.getAttribute('data-id'); APP.state.resources = APP.state.resources.filter(function (r) { return r.id !== id; }); APP.save(); APP.closeDialog(); APP.render(); });
})();
