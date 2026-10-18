/* AION 2 Build Architect - Profile: your whole character on one page (like the profile sites show it),
   plus Sync: bring in AionFlex, Shugo.GG and Atool pages without retyping. Nothing is fetched from those
   sites (they block it); the user copies the page or clicks the bookmark button on it. */
(function () {
  'use strict';
  var BA = window.BA, APP = window.APP, e = APP.e, f = APP.fmt;

  function ago(iso) {
    if (!iso) return '';
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (!isFinite(s)) return iso;
    if (s < 90) return 'just now'; if (s < 3600) return Math.round(s / 60) + ' min ago'; if (s < 86400 * 2) return Math.round(s / 3600) + ' h ago';
    return Math.round(s / 86400) + ' days ago';
  }
  function inbox() { return APP.state.syncInbox || {}; }

  function syncCard(ch) {
    var links = BA.sourceLinks(ch || {}), sync = (ch && ch.sync) || {}, ib = inbox(), n = Object.keys(ib).length;
    var h = '<div class="card hl" id="syncCard"><div class="row"><h2 style="margin:0;flex:1">Sync from the profile sites</h2>' + (ch ? '<button class="sm ghost" data-act="sync-links">Edit links</button>' : '') + '</div>' +
      '<div class="small muted" style="margin:4px 0 10px">Each site shows a different part of your character. Bring in one or all three: you check everything in one review before it is saved. No AI or API key needed.</div>';
    h += '<div class="tbl"><table data-nosort><thead><tr><th>Site</th><th>What it adds</th><th>Last synced</th><th>Waiting for review</th><th></th></tr></thead><tbody>' + BA.SOURCE_ORDER.map(function (k) {
      var S = BA.SOURCES[k], got = ib[k], last = sync[k];
      return '<tr><td><b>' + e(S.name) + '</b></td><td class="small">' + e(S.gives) + '</td><td class="small">' + (last ? e(ago(last.at)) : '<span class="muted">never</span>') + '</td>' +
        '<td class="small">' + (got ? '<span class="good">' + e(got.name || '?') + ', ' + e(ago(got.at)) + '</span> <button class="sm ghost" data-act="sync-drop" data-src="' + k + '" aria-label="Remove">x</button>' : '<span class="muted">-</span>') + '</td>' +
        '<td><a class="btn sm" href="' + e(links[k] || S.search) + '" target="_blank" rel="noopener">' + (links[k] ? 'Open my profile' : 'Find me') + '</a></td></tr>';
    }).join('') + '</tbody></table></div>';
    h += '<div class="grid g2" style="margin-top:12px"><div><h3 style="margin-top:0">One click: the bookmark button</h3><div class="small">Drag <a class="btn sm" href="' + e(APP.afBookmarklet()) + '" onclick="return false" title="Drag me to your bookmarks bar">Send to Build Architect</a> to your bookmarks bar once. Then open your profile on any of the three sites and click the bookmark: the page comes here and waits for review. Do it on all three, then press Review.</div></div>' +
      '<div><h3 style="margin-top:0">Or copy and paste</h3><div class="small">On the profile page press <span class="kbd">Ctrl+A</span>, <span class="kbd">Ctrl+C</span>, paste here. The site is recognised automatically. On Shugo.GG copy the Equipment, Skills and Daevanion tabs one by one.</div>' +
      '<textarea id="syncTxt" placeholder="Paste a whole profile page" style="min-height:70px;margin-top:6px"></textarea><div class="row" style="margin-top:6px"><button class="sm" data-act="sync-paste">Add page</button><span id="syncMsg" class="small"></span></div></div></div>';
    h += '<div class="row" style="margin-top:12px"><button class="pri" data-act="sync-review"' + (n ? '' : ' disabled') + '>Review and save' + (n ? ' (' + n + ' site' + (n > 1 ? 's' : '') + ')' : '') + '</button><span class="small muted">' + (n ? 'Values the sites agree on are merged; where they differ, Atool wins over Shugo.GG over AionFlex and the review shows the others.' : 'Nothing received yet.') + '</span></div></div>';
    return h;
  }

  function linesHtml(arr, grade) { return (arr || []).length ? (arr || []).map(function (x) { return e(x.name) + ' <b>' + e(x.text || (x.value == null ? '' : x.value + (x.unit || ''))) + '</b>' + (grade && x.grade ? ' <span class="muted">' + e(x.grade) + '</span>' : ''); }).join('<br>') : '<span class="muted">-</span>'; }
  function profileHtml(ch, d) {
    var ext = d.external || {}, at = ext.atool || {}, sh = ext.shugo || {};
    var h = '<div class="card" style="margin-top:14px"><div class="row" style="align-items:flex-start"><div style="flex:1"><h2 style="margin:0">' + e(ch.name) + '</h2><div class="muted">Level ' + e(BA.num(d.level) == null ? '?' : BA.num(d.level)) + ' ' + e(ch.cls) + ' · ' + e(ch.race || '?') + ' · ' + e(ch.server || '?') + (ch.guild ? ' · ' + e(ch.guild) : '') + '</div>' + (d.titles.selected ? '<div class="small" style="margin-top:4px">Titles: ' + e(d.titles.selected) + '</div>' : '') + '</div>' +
      '<div class="row">' + [['Combat Power', d.cp], ['Item Level (Gear Score)', BA.num(d.itemLevel) != null ? d.itemLevel : d.gearScore]].map(function (x) { return '<div class="kpi" style="min-width:120px"><div class="l">' + x[0] + '</div><div class="v">' + (BA.num(x[1]) == null ? '<span class="muted">?</span>' : f(BA.num(x[1]))) + '</div>' + (x[1] && x[1].m ? APP.pill(x[1].m) : '') + '</div>'; }).join('') + '</div></div>';
    if (at.ranks) h += '<div class="small" style="margin-top:8px">Rank (Atool): ' + Object.keys(at.ranks).map(function (k) { return e(k) + ' ' + e(at.ranks[k].pos) + ' <span class="muted">(top ' + e(at.ranks[k].top) + ')</span>'; }).join(' · ') + '</div>';
    h += '<div class="small" style="margin-top:6px">Pet: ' + e(d.pet.name || '?') + (d.pet.level != null ? ' Lv ' + e(d.pet.level) : '') + ' · Wings: ' + e(d.wings.name || '?') + (d.wings.rarity ? ' (' + e(d.wings.rarity) + ')' : '') + '</div></div>';

    h += '<div class="card" style="margin-top:14px"><h2>Equipment</h2><div class="tbl"><table><thead><tr><th>Slot</th><th>Item</th><th class="right">+</th><th>Base stats</th><th>Soul engraving</th><th>Manastones</th><th>Source</th></tr></thead><tbody>' + BA.SLOTS.map(function (s) {
      var it = d.equipment[s.id];
      if (!it) return '<tr><td>' + e(s.name) + '</td><td colspan="6" class="muted">Not recorded</td></tr>';
      var sub = (it.subSkills || []).map(function (x) { return e(x.name) + ' +' + e(x.value); }).join('<br>');
      return '<tr><td>' + e(s.name) + '</td><td><a href="#/equipment" data-act="go" data-to="#/equipment"><b>' + e(it.name || '?') + '</b></a></td><td class="right" data-sort="' + (it.enh == null ? -1 : it.enh) + '">' + (it.enh == null ? '?' : '+' + e(it.enh)) + '</td><td class="small">' + linesHtml(it.base) + '</td><td class="small">' + (it.engravingPct != null ? '<span class="muted">' + e(it.engravingPct) + '%</span><br>' : '') + linesHtml(it.soulBinding, true) + (sub ? '<br><span class="muted">' + sub + '</span>' : '') + '</td><td class="small">' + linesHtml(it.manastones) + '</td><td>' + APP.pill(it.m) + '</td></tr>';
    }).join('') + '</tbody></table></div></div>';

    var sk = d.skills.list || [];
    h += '<div class="card" style="margin-top:14px"><h2>Skills</h2><div class="grid g3">' + ['active', 'passive', 'stigma'].map(function (t) {
      var l = sk.filter(function (s) { return s.type === t && typeof s.level === 'number'; }).sort(function (a, b) { return b.level - a.level; });
      return '<div><h3 style="margin-top:0">' + { active: 'Active', passive: 'Passive', stigma: 'Stigma' }[t] + '</h3>' + (l.length ? '<table data-nosort><tbody>' + l.map(function (s) { return '<tr><td>' + e(s.name) + (s.equipped ? ' <span class="pill confirmed">equipped</span>' : '') + '</td><td class="right"><b>' + s.level + '</b></td></tr>'; }).join('') + '</tbody></table>' : '<div class="muted small">Not recorded</div>') + '</div>';
    }).join('') + '</div></div>';

    var cmax = d.coreMax;
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Divine Stats <span class="small muted">(total ' + f(BA.divineTotal(d)) + ')</span></h2><table data-nosort><tbody>' + BA.DIVINE.map(function (x) { return '<tr><td>' + e(x.name) + '</td><td class="right"><b>' + f(BA.num(d.divine[x.id])) + '</b></td></tr>'; }).join('') + '</tbody></table></div>' +
      '<div class="card"><h2>Core Stats</h2><table data-nosort><tbody>' + BA.CORE_STATS.map(function (x) { return '<tr><td>' + e(x.name) + '</td><td class="right"><b>' + f(BA.num(d.coreStats[x.id])) + '</b>' + (cmax ? ' <span class="muted">/ ' + cmax + '</span>' : '') + '</td></tr>'; }).join('') + '</tbody></table>' +
      (at.hexagon ? '<h3>DPS hexagon (Atool, without Daevanion)</h3><table data-nosort><tbody>' + at.hexagon.map(function (x) { return '<tr><td>' + e(x.name) + '</td><td class="right">' + e(x.value) + '</td></tr>'; }).join('') + '</tbody></table>' : '') + '</div></div>';

    var boards = d.daevanionBoards || {};
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Daevanion</h2><table data-nosort><tbody>' + BA.DAEVANION.map(function (x) { var b = boards[x.id], v = BA.num(d.daevanion[x.id]); return '<tr><td>' + e(x.name) + '</td><td style="width:45%">' + APP.bar(v || 0) + '</td><td class="right">' + (v == null ? '?' : v + '%') + (b ? ' <span class="muted small">' + b.done + '/' + b.total + '</span>' : '') + '</td></tr>'; }).join('') + '</tbody></table>' +
      ((sh.daevEffects || []).length ? '<h3>Board bonuses (Shugo.GG)</h3><div class="small">' + sh.daevEffects.map(e).join(' · ') + '</div>' : '') + '</div>' +
      '<div class="card"><h2>Titles</h2><div>' + (d.titles.unlocked == null ? '<span class="muted">Not recorded</span>' : '<b>' + d.titles.unlocked + '</b> / ' + (d.titles.total || '?')) + '</div>' + (d.titles.bonuses ? '<div class="small" style="margin-top:6px">Equip effects: ' + e(d.titles.bonuses) + '</div>' : '') +
      '<h3>Genus Insight</h3><div class="small">' + BA.GENUS.map(function (g) { var x = (d.genus || {})[g.id]; return e(g.name) + ' ' + (x && typeof x.level === 'number' ? x.level : '-'); }).join(' · ') + ' <a href="#/character/more">edit</a></div></div></div>';
    return h;
  }

  APP.view('profile', { title: 'Profile', icon: 'char', group: 'Overview', render: function (arg) {
    if (arg && arg.indexOf('in?') === 0) { setTimeout(function () { APP.syncReceive(arg); }, 0); return '<div class="muted">Receiving...</div>'; }
    var ch = APP.player(), h = '<div class="head"><div><h1>Profile</h1><div class="muted">Your whole character on one page, from everything you synced or typed in. The status pills show where each value came from.</div></div></div>';
    h += syncCard(ch);
    if (!ch) return h + '<div class="note info" style="margin-top:14px">No character yet. Paste or send a profile page above and it is created when you confirm the review, or <a href="#/setup">set up by hand</a>.</div>';
    return h + profileHtml(ch, APP.pd());
  } });
  // place Profile right after Dashboard in the menu
  (function () { var o = APP.order, i = o.indexOf('profile'); if (i >= 0) { o.splice(i, 1); o.splice(Math.max(0, o.indexOf('dashboard') + 1), 0, 'profile'); } })();

  APP.act('sync-paste', function () {
    var t = document.getElementById('syncTxt').value, msg = document.getElementById('syncMsg');
    if (!t.trim()) { msg.textContent = 'Paste a page first.'; return; }
    var src = BA.detectSource(t, '');
    if (!src) { msg.innerHTML = '<span class="bad">Not recognised as an AionFlex, Shugo.GG or Atool profile.</span>'; return; }
    var prev = inbox()[src];
    if (prev && src === 'shugo') t = prev.text + '\n=== PASTED ===\n' + t; // Shugo tabs pasted one by one add up
    APP.inboxAdd(src, t, prev ? prev.url : '');
  });
  APP.act('sync-drop', function (el) { var s = inbox(); delete s[el.getAttribute('data-src')]; APP.save(); APP.render(); });
  APP.act('sync-review', function () {
    var ib = inbox(), items = BA.SOURCE_ORDER.filter(function (k) { return ib[k]; }).map(function (k) { return { text: ib[k].text, url: ib[k].url }; });
    if (!items.length) return APP.toast('Nothing received yet.');
    APP.syncStart(items);
  });
  APP.act('sync-links', function () {
    var ch = APP.player(), L = BA.sourceLinks(ch);
    APP.dialog('Profile links for ' + ch.name, '<div class="small muted" style="margin-bottom:8px">Used for the Open my profile buttons. Filled in automatically when you sync with the bookmark button.</div><div class="form">' + BA.SOURCE_ORDER.map(function (k) { return '<div style="grid-column:1/-1"><label>' + e(BA.SOURCES[k].name) + '</label><input name="l_' + k + '" value="' + e(L[k] || '') + '" placeholder="https://' + e(BA.SOURCES[k].host) + '/..."></div>'; }).join('') + '</div>', [{ label: 'Save', cls: 'pri', act: 'sync-links-save' }]);
  });
  APP.act('sync-links-save', function () {
    var o = APP.form(), ch = APP.player(); ch.links = ch.links || {};
    var bad = BA.SOURCE_ORDER.filter(function (k) { var v = (o['l_' + k] || '').trim(); return v && !new RegExp('^https://(www\\.)?' + BA.SOURCES[k].host.replace(/\./g, '\\.') + '/').test(v); });
    if (bad.length) return APP.toast('These links do not point at the right site: ' + bad.map(function (k) { return BA.SOURCES[k].name; }).join(', '));
    BA.SOURCE_ORDER.forEach(function (k) { var v = (o['l_' + k] || '').trim(); if (v) ch.links[k] = v.slice(0, 400); else delete ch.links[k]; });
    if (ch.links.aionflex) ch.url = ch.links.aionflex;
    APP.save(); APP.closeDialog(); APP.render();
  });
})();
