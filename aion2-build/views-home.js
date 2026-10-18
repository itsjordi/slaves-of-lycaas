/* AION 2 Build Architect - the simple layer: Home (what to do next for more Combat Power and Item Level),
   Compare with another player's page (temporary, nothing saved) and the short menu. Everything else stays
   available under "More tools". */
(function () {
  'use strict';
  var BA = window.BA, APP = window.APP, e = APP.e, f = APP.fmt;
  var SIMPLE = ['dashboard', 'profile', 'compare', 'tiers', 'guide'];
  SIMPLE.forEach(function (id) { if (APP.views[id]) APP.views[id].simple = true; });
  APP.advanced = function () { return !!(APP.state.settings && APP.state.settings.advanced); };
  APP.act('mode-toggle', function () { APP.state.settings.advanced = !APP.advanced(); APP.save(); APP.render(); APP.toast(APP.advanced() ? 'All tools are shown.' : 'Back to the short menu.'); });

  function lastSync(ch) { var s = (ch && ch.sync) || {}, t = Object.keys(s).map(function (k) { return s[k].at; }).sort().pop(); return t || null; }
  function ago(iso) { var s = (Date.now() - new Date(iso).getTime()) / 1000; return s < 3600 ? Math.max(1, Math.round(s / 60)) + ' min ago' : s < 172800 ? Math.round(s / 3600) + ' h ago' : Math.round(s / 86400) + ' days ago'; }
  function doneMap(ch) { APP.state.stepsDone = APP.state.stepsDone || {}; return APP.state.stepsDone[ch.id] = APP.state.stepsDone[ch.id] || {}; }

  /* ------------------------------------------------------------------ Home */
  function home() {
    var ch = APP.player(), d = APP.pd(), ls = lastSync(ch), hasGear = Object.keys(d.equipment || {}).length > 0;
    var h = '<div class="head"><div><h1>' + e(ch.name) + '</h1><div class="muted">' + e(ch.cls) + (ch.server ? ' · ' + e(ch.server) : '') + (ls ? ' · synced ' + e(ago(ls)) : '') + '</div></div><span class="sp"></span><a class="btn pri" href="#/profile">' + (ls ? 'Update from the sites' : 'Sync my character') + '</a></div>';
    h += '<div class="grid g2">' + [['Combat Power', BA.num(d.cp)], ['Item Level (Gear Score)', BA.num(d.itemLevel) != null ? BA.num(d.itemLevel) : BA.num(d.gearScore)]].map(function (x) {
      return '<div class="card kpi"><div class="l">' + x[0] + '</div><div class="v">' + (x[1] == null ? '<span class="muted">?</span>' : f(x[1])) + '</div></div>';
    }).join('') + '</div>';
    if (!hasGear) {
      return h + '<div class="card hl" style="margin-top:14px"><h2>First: bring in your character</h2><ol class="small"><li>Go to <a href="#/profile">Profile</a>.</li><li>Drag the <b>Send to Build Architect</b> button to your bookmarks bar (Edge: favorites bar).</li><li>Open your character on Atool, Shugo.GG or AionFlex and click the bookmark.</li><li>Press <b>Save</b>. Your next steps appear here.</li></ol></div>';
    }
    var flt = APP.state.stepFilter || 'all', dm = doneMap(ch);
    var steps = BA.nextSteps(d, { ch: ch }).filter(function (s) { return !dm[s.id + '|' + s.title]; });
    var shown = steps.filter(function (s) { return flt === 'all' || (flt === 'il' ? s.il : s.cp); });
    var lim = APP.state.stepsAll ? shown.length : 8;
    h += '<div class="card hl" style="margin-top:14px"><div class="row"><h2 style="margin:0;flex:1">Do this next</h2><div class="tabs" style="margin:0">' + [['all', 'Everything'], ['il', 'Item Level'], ['cp', 'Combat Power']].map(function (t) { return '<button data-act="step-filter" data-f="' + t[0] + '" class="' + (t[0] === flt ? 'cur' : '') + '">' + t[1] + '</button>'; }).join('') + '</div></div>';
    h += '<div class="small muted" style="margin:6px 0 10px">Worked out from your own character, most useful first. Item Level (Gear Score) only goes up from your gear; everything here raises Combat Power.</div>';
    h += shown.length ? '<ol class="steps">' + shown.slice(0, lim).map(function (s) {
      return '<li><div class="row" style="align-items:flex-start"><div style="flex:1"><a href="' + e(s.to) + '"><b>' + e(s.title) + '</b></a> <span class="pill">' + e(s.area) + '</span>' + (s.il ? ' <span class="pill confirmed">Item Level</span>' : '') + '<div class="small muted">' + e(s.detail) + '</div></div>' +
        '<button class="sm ghost" data-act="board-send" data-text="' + e(s.title) + '" title="Add to the Daily Board to-do">To board</button><button class="sm" data-act="step-done" data-k="' + e(s.id + '|' + s.title) + '">Done</button></div></li>';
    }).join('') + '</ol>' : '<div class="muted">Nothing left in this list. Sync again after you play to get new steps.</div>';
    if (shown.length > 8) h += '<button class="sm ghost" data-act="steps-all">' + (APP.state.stepsAll ? 'Show fewer' : 'Show all ' + shown.length) + '</button>';
    if (Object.keys(dm).length) h += ' <button class="sm ghost" data-act="steps-reset">Show steps I marked done</button>';
    h += '</div>';
    h += '<div class="small muted" style="margin-top:14px">Want the detailed analysis (stat tiers, planner, DPS log, snapshots)? <a href="#/dashboard" data-act="mode-toggle">Turn on More tools</a>.</div>';
    return h;
  }
  APP.act('step-filter', function (el) { APP.state.stepFilter = el.getAttribute('data-f'); APP.save(); APP.render(); });
  APP.act('steps-all', function () { APP.state.stepsAll = !APP.state.stepsAll; APP.render(); });
  APP.act('step-done', function (el) { doneMap(APP.player())[el.getAttribute('data-k')] = new Date().toISOString().slice(0, 10); APP.save(); APP.render(); });
  APP.act('steps-reset', function () { APP.state.stepsDone[APP.player().id] = {}; APP.save(); APP.render(); });

  var dash = APP.views.dashboard, advRender = dash.render;
  dash.render = function (arg) {
    if (!APP.advanced()) return home();
    var d = APP.pd(), steps = BA.nextSteps(d, { ch: APP.player() }).slice(0, 5);
    var top = steps.length && Object.keys(d.equipment || {}).length ? '<div class="card hl" style="margin-bottom:14px"><div class="row"><h2 style="margin:0;flex:1">Do this next</h2><a class="small" href="#/dashboard" data-act="mode-toggle">Short view</a></div><ol class="steps">' + steps.map(function (s) { return '<li><a href="' + e(s.to) + '"><b>' + e(s.title) + '</b></a>' + (s.il ? ' <span class="pill confirmed">Item Level</span>' : '') + '<div class="small muted">' + e(s.detail) + '</div></li>'; }).join('') + '</ol></div>' : '';
    var full = advRender(arg);
    var i = full.indexOf('</div></div>'); // after the page head
    return i > 0 ? full.slice(0, i + 12) + top + full.slice(i + 12) : top + full;
  };

  /* ------------------------------------------------------------------ Compare with a player (by link, nothing saved) */
  var oldCompare = APP.views.compare;
  APP.views['compare-saved'] = { title: 'Compare snapshots', icon: 'cmp', group: oldCompare.group, render: oldCompare.render };
  APP.order.splice(APP.order.indexOf('compare') + 1, 0, 'compare-saved');
  var TMP_KEY = 'aion2_build_compare';
  APP.cmpTemp = null;
  try { var raw = sessionStorage.getItem(TMP_KEY); if (raw) APP.cmpTemp = JSON.parse(raw); } catch (x) { }
  APP.setCompare = function (text, url) {
    var p = BA.parseSourceText(text, url);
    if (!p.ok) { APP.toast('Could not find a character in that page. Wait until it has loaded and try again.', 6000); return false; }
    APP.cmpTemp = { text: String(text).slice(0, 80000), url: url || '', at: new Date().toISOString() };
    try { sessionStorage.setItem(TMP_KEY, JSON.stringify(APP.cmpTemp)); } catch (x) { }
    if (location.hash !== '#/compare') location.hash = '#/compare'; else APP.render();
    return true;
  };
  function cmpForm(ch) {
    var c = APP.state.cmpForm || {}, server = c.server || (ch && ch.server) || '';
    var L = c.name ? BA.sourceLinks({ name: c.name, server: server }) : {};
    var h = '<div class="card"><h2>Who do you want to compare with?</h2><div class="form"><div><label>Their character name</label><input id="cmpName" value="' + e(c.name || '') + '" placeholder="Name"></div><div><label>Server</label><input id="cmpServer" list="cmpServers" value="' + e(server) + '"><datalist id="cmpServers">' + BA.SERVERS.map(function (s) { return '<option value="' + e(s) + '">'; }).join('') + '</datalist></div></div>' +
      '<div class="row" style="margin-top:8px"><button class="sm" data-act="cmp-links">Make links</button>' + (c.name ? BA.SOURCE_ORDER.map(function (k) { var u = L[k] || BA.SOURCES[k].search; return '<a class="btn sm" href="' + e(u) + '" target="_blank" rel="noopener">Open on ' + e(BA.SOURCES[k].name) + '</a>'; }).join('') : '') + '</div>' +
      '<div class="small muted" style="margin-top:8px">Or paste a profile link from any of the three sites and open it. On their page, click your <b>Send to Build Architect</b> bookmark: the comparison opens here. Nothing about them is saved.</div>' +
      '<div class="row" style="margin-top:8px"><input id="cmpUrl" placeholder="https://aion2tool.com/... or https://shugo.gg/... or https://aionflex.gg/..." style="flex:1 1 300px"><button class="sm" data-act="cmp-open">Open link</button></div>' +
      '<details style="margin-top:8px"><summary class="small">No bookmark? Paste their page text</summary><textarea id="cmpTxt" style="min-height:70px;margin-top:6px" placeholder="Ctrl+A, Ctrl+C on their profile page, paste here"></textarea><div class="row" style="margin-top:6px"><button class="sm" data-act="cmp-paste">Compare</button></div></details></div>';
    return h;
  }
  function cell(v) { return v == null ? '<span class="muted">-</span>' : e(typeof v === 'number' ? f(v) : v); }
  function cmpResult(ch) {
    var t = APP.cmpTemp, p = BA.parseSourceText(t.text, t.url), them = BA.dataFromParse(p), me = APP.pd(), c = BA.compareProfiles(me, them), pr = p.profile || {};
    var h = '<div class="card hl"><div class="row"><h2 style="margin:0;flex:1">' + e(ch.name) + ' vs ' + e(pr.name || '?') + '</h2><span class="small muted">' + e(BA.SOURCES[p.source].name) + ', ' + e(pr.cls || '') + (pr.server ? ' · ' + e(pr.server) : '') + '</span>' + (t.url ? '<a class="btn sm" href="' + e(t.url) + '" target="_blank" rel="noopener">Their page</a>' : '') + '<button class="sm ghost" data-act="cmp-clear">Clear</button></div>';
    h += '<div class="grid g2" style="margin-top:10px">' + [['Combat Power', BA.num(me.cp), BA.num(them.cp)], ['Item Level (Gear Score)', BA.num(me.itemLevel), BA.num(them.itemLevel)]].map(function (x) { var dd = x[1] != null && x[2] != null ? x[2] - x[1] : null; return '<div class="kpi"><div class="l">' + x[0] + '</div><div class="v">' + cell(x[1]) + ' <span class="muted small">vs</span> ' + cell(x[2]) + '</div><div class="d">' + (dd == null ? '' : dd > 0 ? 'they are ' + f(dd) + ' ahead' : dd < 0 ? 'you are ' + f(-dd) + ' ahead' : 'equal') + '</div></div>'; }).join('') + '</div>';
    h += '<h3>Where they are ahead</h3>' + (c.ahead.length ? '<ol class="steps">' + c.ahead.slice(0, 8).map(function (a) { return '<li><b>' + e(a.label) + '</b> <span class="small muted">you ' + e(a.me) + ', they ' + e(a.them) + '</span></li>'; }).join('') + '</ol>' : '<div class="muted small">Nowhere that the page shows. Nice.</div>');
    h += '<div class="small muted" style="margin-top:8px">Only what their page shows is compared; this is not saved. ' + (p.source !== 'atool' ? 'Atool shows the most (soul engraving, stats, titles).' : '') + '</div></div>';
    var groups = {}; c.rows.forEach(function (r) { (groups[r.group] = groups[r.group] || []).push(r); });
    h += '<details class="card" style="margin-top:14px"><summary><b>Everything side by side</b></summary><div class="tbl" style="margin-top:8px"><table><thead><tr><th>Area</th><th>What</th><th>' + e(ch.name) + '</th><th>' + e(pr.name || 'Them') + '</th><th class="right">Difference</th></tr></thead><tbody>' +
      Object.keys(groups).map(function (g) { return groups[g].map(function (r) { return '<tr><td class="small muted">' + e(g) + '</td><td>' + e(r.label) + '</td><td>' + cell(r.me) + '</td><td>' + cell(r.them) + '</td><td class="right ' + (r.diff > 0 ? 'bad' : r.diff < 0 ? 'good' : '') + '" data-sort="' + (r.diff == null ? 0 : r.diff) + '">' + (r.diff == null ? '' : APP.signed(r.diff)) + '</td></tr>'; }).join(''); }).join('') + '</tbody></table></div></details>';
    h += '<div class="row" style="margin-top:10px"><button class="sm ghost" data-act="cmp-mine">This is me: save it as my character</button></div>';
    return h;
  }
  APP.views.compare = { title: 'Compare', icon: 'cmp', group: oldCompare.group, simple: true, render: function () {
    var ch = APP.player();
    var h = '<div class="head"><div><h1>Compare</h1><div class="muted">Put yourself next to any player with their profile link. Their data is only shown, never saved.</div></div></div>';
    if (APP.cmpTemp) { try { h += cmpResult(ch); } catch (x) { console.error(x); h += '<div class="note bad">Could not read that page. Try again.</div>'; } h += '<div style="margin-top:14px"></div>'; }
    return h + cmpForm(ch);
  } };
  APP.act('cmp-links', function () { APP.state.cmpForm = { name: document.getElementById('cmpName').value.trim().slice(0, 40), server: document.getElementById('cmpServer').value.trim().slice(0, 40) }; APP.save(); APP.render(); });
  APP.act('cmp-open', function () {
    var u = (document.getElementById('cmpUrl').value || '').trim();
    if (!/^https:\/\/(www\.)?(aionflex\.gg|shugo\.gg|aion2tool\.com)\//.test(u)) return APP.toast('Paste a link from aion2tool.com, shugo.gg or aionflex.gg.');
    window.open(u, '_blank', 'noopener'); APP.toast('Now click Send to Build Architect on their page.', 6000);
  });
  APP.act('cmp-paste', function () { var t = document.getElementById('cmpTxt').value; if (!t.trim()) return APP.toast('Paste their page first.'); if (!BA.detectSource(t, '')) return APP.toast('Not recognised as an AionFlex, Shugo.GG or Atool profile.'); APP.setCompare(t, ''); });
  APP.act('cmp-clear', function () { APP.cmpTemp = null; try { sessionStorage.removeItem(TMP_KEY); } catch (x) { } APP.render(); });
  APP.act('cmp-mine', function () { var t = APP.cmpTemp; if (!t) return; var src = BA.detectSource(t.text, t.url); APP.cmpTemp = null; try { sessionStorage.removeItem(TMP_KEY); } catch (x) { } APP.inboxAdd(src, t.text, t.url); });

  /* ------------------------------------------------------------------ Upgrades: per slot, what to get next and from where (item data: Metaroad) */
  var SRC_FILTERS = [['all', 'Everything'], ['craft', 'Crafting'], ['drop', 'Drops, no raids'], ['raid', 'Raids']];
  function srcOk(c, flt) { var s = c.item.src; return flt === 'all' || (flt === 'craft' ? /^craft/.test(s) : flt === 'raid' ? /raid/.test(s) : (/^drop|quest/.test(s) && !/raid/.test(s))); }
  function gainCell(c) {
    if (!c) return '<span class="muted">-</span>';
    return '<b class="good">+' + c.gain + '</b> <span class="small muted">Item Level</span>' + (c.cp ? '<div class="small">~+' + f(c.cp.low) + ' to +' + f(c.cp.high) + ' CP</div>' : '') + (c.transfer ? '<div class="small muted">keeps your + via Transfer</div>' : '');
  }
  function itemCell(c) {
    if (!c) return '<span class="muted">Nothing better in this filter</span>';
    return '<a href="' + e(c.item.url) + '" target="_blank" rel="noopener"><b>' + e(c.item.name) + '</b></a><div class="small muted">Item level ' + c.item.lv + ' · ' + e(c.grade) + ' · ' + e(c.source) + '</div>';
  }
  var SLOT_NOTES = {
    belt: 'Noble Belt is the only belt. It never gets replaced: you enhance it with Belt Enhance Scrolls from Strongholds (2 per Stronghold), the most expensive Item Level per point.',
    amulet: 'Revelation Amulet does not get replaced either: enhance it with Revelation Amulet Enhance Scrolls from Monolith Resonance.',
    rune_1: 'Clash Rune is the only rune in the database (bought with shop coins).', rune_2: 'Clash Rune is the only rune in the database (bought with shop coins).'
  };
  APP.view('upgrades', { title: 'Upgrades', icon: 'eq', group: 'Overview', render: function () {
    var ch = APP.player(), d = APP.pd(), meta = window.BA_ITEMS_META || {};
    var h = '<div class="head"><div><h1>Upgrades</h1><div class="muted">For every slot: the next better item, where it comes from, and what it adds. Item data from <a href="' + e(meta.url || 'https://metaroad.gg/aion2/database/items') + '" target="_blank" rel="noopener">Metaroad</a> (game client, ' + e(meta.exported || '') + '), used with permission.</div></div></div>';
    if (!Object.keys(d.equipment || {}).length) return h + '<div class="card hl"><h2>Sync your gear first</h2><div class="small">Go to <a href="#/profile">Profile</a> and bring in your character from Atool, Shugo.GG or AionFlex. Then this page shows an upgrade for every slot.</div></div>';
    var res = BA.upgradeFinder(ch, { perSlot: 50 }), gs = res.gearScore, flt = APP.state.upgFilter || 'all', rate = res.rate;
    h += '<div class="grid g2"><div class="card kpi"><div class="l">Item Level (Gear Score)</div><div class="v">' + (gs.complete ? f(gs.total) : f(BA.num(d.itemLevel))) + '</div><div class="d">' + (gs.complete ? 'Sum of all 20 items: item level + enhancement' : 'Not every item was found in the database: ' + e(gs.missing.join(', '))) + '</div></div>' +
      '<div class="card kpi"><div class="l">Combat Power per Item Level</div><div class="v">' + (rate ? '~' + Math.round(rate.low) + '-' + Math.round(rate.high) : '?') + '</div><div class="d">' + (rate && rate.learned ? 'Learned from ' + rate.learned + ' of your own upgrades' : 'Rough: based on your current CP; gets sharper each time you sync after an upgrade') + '</div></div></div>';
    h += '<div class="row" style="margin:14px 0 8px"><div class="tabs" style="margin:0">' + SRC_FILTERS.map(function (t) { return '<button data-act="upg-filter" data-f="' + t[0] + '" class="' + (t[0] === flt ? 'cur' : '') + '">' + t[1] + '</button>'; }).join('') + '</div></div>';
    h += '<div class="card"><div class="tbl"><table><thead><tr><th>Slot</th><th>You wear</th><th>Next step up</th><th>Gain</th><th>Best in slot</th><th>Gain</th></tr></thead><tbody>' + res.slots.map(function (sl) {
      var list = sl.next.filter(function (c) { return srcOk(c, flt); }), all = BA.upgradeFinder(ch, { perSlot: 999 }).slots.filter(function (x) { return x.slot.id === sl.slot.id; })[0];
      var cands = (all ? all.next : list).filter(function (c) { return srcOk(c, flt); }), next = cands.filter(function (c) { return c.gain >= 4; })[0] || cands[0] || null, best = cands.length ? cands[cands.length - 1] : null;
      var curC = sl.current ? '<b>' + e(sl.current.name) + '</b> +' + sl.current.enh + '<div class="small muted">' + (sl.current.lv != null ? 'Item level ' + sl.current.lv + ' + ' + sl.current.enh + ' = ' + (sl.current.lv + sl.current.enh) : 'Not in the item database') + '</div>' : '<span class="muted">Empty</span>';
      var note = SLOT_NOTES[sl.slot.id] && !cands.length ? '<td colspan="4" class="small muted">' + e(SLOT_NOTES[sl.slot.id]) + '</td>' : '<td>' + itemCell(next) + '</td><td data-sort="' + (next ? next.gain : 0) + '">' + gainCell(next) + '</td><td>' + (best && best !== next ? itemCell(best) : '<span class="muted small">' + (best ? 'same' : '-') + '</span>') + '</td><td data-sort="' + (best ? best.gain : 0) + '">' + (best && best !== next ? gainCell(best) : '') + '</td>';
      return '<tr><td>' + e(sl.slot.name) + '</td><td>' + curC + '</td>' + note + '</tr>';
    }).join('') + '</tbody></table></div>' +
      '<div class="small muted" style="margin-top:8px">Gain is exact Item Level. With Gear Transfer (Unique to Unique, Transfer Stone) your enhancement and soul binding move to the new item; manastones and theostones do not. Without it the new item starts at +0. Combat Power is an estimate: nobody publishes the formula.</div></div>';
    return h;
  } });
  APP.act('upg-filter', function (el) { APP.state.upgFilter = el.getAttribute('data-f'); APP.save(); APP.render(); });
  (function () { var o = APP.order, i = o.indexOf('upgrades'); if (i >= 0) { o.splice(i, 1); o.splice(Math.max(0, o.indexOf('profile') + 1), 0, 'upgrades'); } })();
})();
