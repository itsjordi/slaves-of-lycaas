/* AION 2 Build Architect - extras: the upgrade route, your legion (friends leaderboard), a progress chart with
   milestones, and a profile card to share on Discord. */
(function () {
  'use strict';
  var BA = window.BA, APP = window.APP, e = APP.e, f = APP.fmt;

  /* ------------------------------------------------------------------ progress: CP and Item Level over time */
  function history(ch) {
    var race = ch.race || '', pts = [];
    (ch.snapshots || []).forEach(function (s) {
      var d = s.data, cp = BA.num(d.cp), gs = BA.gearScoreOf(d, race), il = gs.complete ? gs.total : BA.num(d.itemLevel);
      var at = (s.observedAt || s.createdAt || '').slice(0, 10);
      if (cp == null && il == null) return;
      var last = pts[pts.length - 1];
      if (last && last.at === at) { last.cp = cp; last.il = il; } else pts.push({ at: at, cp: cp, il: il });
    });
    return pts;
  }
  APP.history = history;
  function chart(pts) {
    if (pts.length < 2) return '<div class="small muted">The chart appears after your second sync. Every sync adds a point.</div>';
    var W = 640, Hc = 180, P = 30;
    function series(key, col) {
      var vals = pts.map(function (p) { return p[key]; }).filter(function (v) { return v != null; });
      if (vals.length < 2) return '';
      var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); if (mx === mn) { mx += 1; mn -= 1; }
      var path = pts.map(function (p, i) { if (p[key] == null) return ''; var x = P + i*(W - 2*P)/(pts.length - 1), y = Hc - P - (p[key] - mn)/(mx - mn)*(Hc - 2*P); return (i ? 'L' : 'M') + x.toFixed(1) + ' ' + y.toFixed(1); }).join(' ');
      var lp = pts[pts.length - 1], lx = W - P, ly = Hc - P - (lp[key] - mn)/(mx - mn)*(Hc - 2*P);
      return '<path d="' + path + '" fill="none" stroke="' + col + '" stroke-width="2.5"/><circle cx="' + lx + '" cy="' + ly.toFixed(1) + '" r="4" fill="' + col + '"/>';
    }
    return '<svg viewBox="0 0 ' + W + ' ' + Hc + '" style="width:100%;height:auto;display:block" role="img" aria-label="Combat Power and Item Level over time">' +
      '<line x1="' + P + '" y1="' + (Hc - P) + '" x2="' + (W - P) + '" y2="' + (Hc - P) + '" stroke="var(--line)"/>' + series('cp', 'var(--gold)') + series('il', 'var(--blue)') +
      '<text x="' + P + '" y="' + (Hc - 8) + '" fill="var(--muted)" font-size="11">' + e(pts[0].at) + '</text><text x="' + (W - P) + '" y="' + (Hc - 8) + '" fill="var(--muted)" font-size="11" text-anchor="end">' + e(pts[pts.length - 1].at) + '</text></svg>' +
      '<div class="small" style="margin-top:4px"><span style="color:var(--gold)">&#9632;</span> Combat Power ' + f(pts[pts.length - 1].cp) + ' (' + APP.signed((pts[pts.length - 1].cp || 0) - (pts[0].cp || 0)) + ') &nbsp; <span style="color:var(--blue)">&#9632;</span> Item Level ' + f(pts[pts.length - 1].il) + ' (' + APP.signed((pts[pts.length - 1].il || 0) - (pts[0].il || 0)) + ')</div>';
  }
  APP.progressChart = function (ch) { return chart(history(ch)); };
  // milestones: every 50 Item Level and every 10,000 Combat Power, celebrated once
  function checkMilestones(ch) {
    var pts = history(ch); if (pts.length < 2) return;
    var a = pts[pts.length - 2], b = pts[pts.length - 1], seen = APP.state.milestones = APP.state.milestones || {}, mine = seen[ch.id] = seen[ch.id] || {}, msgs = [];
    if (a.il != null && b.il != null && Math.floor(b.il/50) > Math.floor(a.il/50)) { var m = Math.floor(b.il/50)*50; if (!mine['il' + m]) { mine['il' + m] = 1; msgs.push(f(m) + ' Item Level'); } }
    if (a.cp != null && b.cp != null && Math.floor(b.cp/10000) > Math.floor(a.cp/10000)) { var c = Math.floor(b.cp/10000)*10000; if (!mine['cp' + c]) { mine['cp' + c] = 1; msgs.push(f(c) + ' Combat Power'); } }
    if (msgs.length) { APP.save(); APP.toast('Milestone reached: ' + msgs.join(' and ') + '!', 6000); }
  }
  var oldCommit = BA.commit;
  BA.commit = function (ch) { var r = oldCommit.apply(this, arguments); try { setTimeout(function () { checkMilestones(ch); }, 50); } catch (x) { } return r; };

  /* ------------------------------------------------------------------ the upgrade route: cheapest Item Level first */
  var EFFORT = [
    ['Guaranteed', 'Enhancing a Unique item up to +10 always succeeds.'],
    ['Swap', 'A better item; check its source.'],
    ['Craft + transfer', 'Crafted gear; move your enhancement and soul binding with Gear Transfer (Transfer Stone).'],
    ['Risky', 'Unique +10 to +15 can fail (community figures: 65%, 50%, 35%, 25%, 20%). A failure keeps the item and costs the materials.'],
    ['Scrolls', 'Belt and amulet need their own scrolls (Strongholds, Monolith Resonance). Unique +0 to +10 costs about 5 million Kinah and 200,980 Enhance Stones.'],
    ['Raid', 'Hard content: needs a group and some luck.']
  ];
  function route(ch) {
    var d = BA.cur(ch), race = ch.race || '', steps = [];
    BA.SLOTS.forEach(function (s) {
      var it = d.equipment && d.equipment[s.id], db = it && BA.findItem(s.id, it.name, race);
      if (!it || !db || typeof it.enh !== 'number') return;
      var uniq = db.grade === 'u' || db.grade === 'e';
      if (s.id === 'belt' || s.id === 'amulet') { if (it.enh < 10) steps.push({ eff: 4, gain: 10 - it.enh, title: 'Enhance ' + it.name + ' +' + it.enh + ' to +10', slot: s.name, note: 'One scroll per step.' }); return; }
      if (uniq && it.enh < 10) steps.push({ eff: 0, gain: 10 - it.enh, title: 'Enhance ' + it.name + ' +' + it.enh + ' to +10', slot: s.name });
      if (uniq && it.enh >= 10 && it.enh < 15) steps.push({ eff: 3, gain: 1, title: 'Enhance ' + it.name + ' +' + it.enh + ' to +' + (it.enh + 1), slot: s.name, note: 'About ' + ([65, 50, 35, 25, 20][it.enh - 10] || 20) + '% chance.' });
    });
    BA.upgradeFinder(ch).slots.forEach(function (sl) {
      var c = sl.next.filter(function (x) { return x.gain >= 3 && !/raid/.test(x.item.src); })[0];
      if (c) steps.push({ eff: /^craft/.test(c.item.src) && c.transfer ? 2 : 1, gain: c.gain, title: 'Get ' + c.item.name + ' (' + c.item.lv + ')', slot: sl.slot.name, note: c.source + (c.transfer ? ', keeps your +' + sl.current.enh : ', starts at +0'), url: c.item.url, icon: c.item.icon });
      var r = sl.next.filter(function (x) { return /raid/.test(x.item.src) && x.gain > 0; }).pop();
      if (r) steps.push({ eff: 5, gain: r.gain, title: 'Get ' + r.item.name + ' (' + r.item.lv + ')', slot: sl.slot.name, note: r.source, url: r.item.url, icon: r.item.icon });
    });
    steps.sort(function (a, b) { return a.eff - b.eff || b.gain - a.gain; });
    return steps;
  }
  APP.view('route', { title: 'Upgrade route', icon: 'prog', group: 'Overview', hidden: true, render: function () {
    var ch = APP.player(), d = APP.pd();
    var h = '<div class="head"><div><h1>Upgrade route</h1><div class="muted">Your gear upgrades in a sensible order: the cheapest, surest Item Level first, raids last. Exact Kinah costs are only shown where they are known.</div></div><span class="sp"></span><a class="btn" href="#/upgrades">All upgrades per slot</a></div>';
    if (!Object.keys(d.equipment || {}).length) return h + '<div class="card hl">Sync your gear on <a href="#/profile">Profile</a> first.</div>';
    var gs = BA.gearScoreOf(d, ch.race || ''), cur = gs.complete ? gs.total : BA.num(d.itemLevel) || 0, steps = route(ch), lastEff = -1;
    h += '<div class="card"><div class="tbl"><table data-nosort><thead><tr><th>#</th><th>Step</th><th>Slot</th><th class="right">Gain</th><th class="right">Item Level after</th></tr></thead><tbody>';
    steps.forEach(function (s, i) {
      if (s.eff !== lastEff) { lastEff = s.eff; h += '<tr class="fixed"><td colspan="5"><b>' + e(EFFORT[s.eff][0]) + '</b> <span class="small muted">' + e(EFFORT[s.eff][1]) + '</span></td></tr>'; }
      cur += s.gain;
      h += '<tr><td>' + (i + 1) + '</td><td>' + (s.icon ? '<img class="ico" src="' + e(s.icon) + '" width="28" height="28" alt="" loading="lazy"> ' : '') + (s.url ? '<a href="' + e(s.url) + '" target="_blank" rel="noopener">' + e(s.title) + '</a>' : e(s.title)) + (s.note ? '<div class="small muted">' + e(s.note) + '</div>' : '') + '</td><td class="small">' + e(s.slot) + '</td><td class="right"><b class="good">+' + s.gain + '</b></td><td class="right">' + f(cur) + '</td></tr>';
    });
    h += '</tbody></table></div><div class="small muted" style="margin-top:8px">A swap replaces the item, so later enhancement steps for that slot are counted once. The route is a guide, not a rule: skip what you cannot do yet. Reference cost from a community guide: one item level 86 Nuakum Helm +0 to +10 took about 775,100 Kinah and 30,920 Enhance Stones.</div></div>';
    return h;
  } });

  /* ------------------------------------------------------------------ your legion: friends side by side */
  function legion() { return APP.state.legion = APP.state.legion || []; }
  APP.legionAdd = function (text, url) {
    var p = BA.parseSourceText(text, url); if (!p.ok) { APP.toast('Could not read that page.'); return false; }
    var dd = BA.dataFromParse(p), gs = BA.gearScoreOf(dd, p.profile.race || ''), il = gs.complete ? gs.total : BA.num(dd.itemLevel), cp = BA.num(dd.cp);
    var key = (p.profile.name || '?').toLowerCase() + '|' + (p.profile.server || ''), L = legion(), m = L.filter(function (x) { return x.key === key; })[0];
    if (!m) { m = { key: key, name: p.profile.name, cls: p.profile.cls || '', server: p.profile.server || '', url: url || '', hist: [] }; L.push(m); }
    m.cls = p.profile.cls || m.cls; if (url) m.url = url;
    var today = new Date().toISOString().slice(0, 10), last = m.hist[m.hist.length - 1];
    if (last && last.at === today) { last.cp = cp; last.il = il; } else m.hist.push({ at: today, cp: cp, il: il });
    APP.save(); APP.toast(m.name + ' is in your legion.'); return true;
  };
  function weekChange(hist, key) {
    if (!hist.length) return null;
    var lastP = hist[hist.length - 1], cut = new Date(Date.now() - 7*864e5).toISOString().slice(0, 10), base = hist.filter(function (h) { return h.at <= cut; }).pop() || hist[0];
    return lastP[key] != null && base[key] != null && base !== lastP ? lastP[key] - base[key] : null;
  }
  APP.view('legion', { title: 'Legion', icon: 'char', group: 'Overview', simple: true, render: function () {
    var me = APP.player(), rows = [];
    if (me) { var hp = history(me).map(function (p) { return { at: p.at, cp: p.cp, il: p.il }; }); rows.push({ name: me.name, cls: me.cls, server: me.server, hist: hp, me: true }); }
    legion().forEach(function (m) { rows.push(m); });
    rows.forEach(function (r) { var l = r.hist[r.hist.length - 1] || {}; r.cp = l.cp; r.il = l.il; r.dcp = weekChange(r.hist, 'cp'); r.dil = weekChange(r.hist, 'il'); r.when = l.at; });
    rows.sort(function (a, b) { return (b.cp || 0) - (a.cp || 0); });
    var best = rows.filter(function (r) { return r.dcp != null; }).sort(function (a, b) { return b.dcp - a.dcp; })[0];
    var h = '<div class="head"><div><h1>Legion</h1><div class="muted">You and your friends side by side. Add someone by opening their profile and clicking the Send to Build Architect bookmark (it opens Compare), then "Add to my legion". Stored in this browser only.</div></div></div>';
    if (best && best.dcp > 0) h += '<div class="card hl" style="margin-bottom:14px"><b>Biggest jump this week:</b> ' + e(best.name) + ' +' + f(best.dcp) + ' Combat Power' + (best.dil ? ', ' + APP.signed(best.dil) + ' Item Level' : '') + '</div>';
    h += '<div class="card"><div class="tbl"><table><thead><tr><th>#</th><th>Name</th><th>Class</th><th class="right">Combat Power</th><th class="right">7 days</th><th class="right">Item Level</th><th class="right">7 days</th><th>Updated</th><th></th></tr></thead><tbody>' + rows.map(function (r, i) {
      return '<tr' + (r.me ? ' class="hlrow"' : '') + '><td>' + (i + 1) + '</td><td><b>' + e(r.name) + '</b>' + (r.me ? ' <span class="pill confirmed">you</span>' : '') + '<div class="small muted">' + e(r.server || '') + '</div></td><td>' + e(r.cls || '') + '</td><td class="right" data-sort="' + (r.cp || 0) + '">' + f(r.cp) + '</td><td class="right ' + (r.dcp > 0 ? 'good' : '') + '" data-sort="' + (r.dcp || 0) + '">' + (r.dcp == null ? '-' : APP.signed(r.dcp)) + '</td><td class="right" data-sort="' + (r.il || 0) + '">' + f(r.il) + '</td><td class="right ' + (r.dil > 0 ? 'good' : '') + '" data-sort="' + (r.dil || 0) + '">' + (r.dil == null ? '-' : APP.signed(r.dil)) + '</td><td class="small muted">' + e(r.when || '') + '</td><td>' + (r.me ? '' : (r.url ? '<a class="small" href="' + e(r.url) + '" target="_blank" rel="noopener">page</a> ' : '') + '<button class="sm ghost" data-act="legion-del" data-k="' + e(r.key) + '" aria-label="Remove">x</button>') + '</td></tr>';
    }).join('') + '</tbody></table></div>' +
      '<details style="margin-top:10px"><summary class="small">Add or update a friend by pasting their page</summary><textarea id="legTxt" style="min-height:70px;margin-top:6px" placeholder="Ctrl+A, Ctrl+C on their Atool, Shugo.GG or AionFlex page"></textarea><div class="row" style="margin-top:6px"><button class="sm" data-act="legion-paste">Add</button></div></details></div>';
    return h;
  } });
  APP.act('legion-paste', function () { var t = document.getElementById('legTxt').value; if (!t.trim()) return APP.toast('Paste their page first.'); if (APP.legionAdd(t, '')) APP.render(); });
  APP.act('legion-del', function (el) { var k = el.getAttribute('data-k'); APP.state.legion = legion().filter(function (x) { return x.key !== k; }); APP.save(); APP.render(); });
  APP.act('cmp-legion', function () { var t = APP.cmpTemp; if (!t) return; if (APP.legionAdd(t.text, t.url)) location.hash = '#/legion'; });
  if (APP.SIMPLE.indexOf('legion') < 0) APP.SIMPLE.splice(APP.SIMPLE.indexOf('compare') + 1, 0, 'legion');

  /* ------------------------------------------------------------------ share card: a PNG for Discord */
  APP.shareCard = function () {
    var ch = APP.player(), d = APP.pd(); if (!ch) return;
    var c = document.createElement('canvas'); c.width = 1200; c.height = 630; var g = c.getContext('2d');
    var bg = g.createLinearGradient(0, 0, 1200, 630); bg.addColorStop(0, '#0b0820'); bg.addColorStop(1, '#1d1040'); g.fillStyle = bg; g.fillRect(0, 0, 1200, 630);
    g.strokeStyle = '#d9b45a'; g.lineWidth = 4; g.strokeRect(20, 20, 1160, 590);
    g.fillStyle = '#d9b45a'; g.font = 'bold 64px Georgia, serif'; g.fillText(ch.name, 60, 110);
    g.fillStyle = '#c9c0ff'; g.font = '28px Arial, sans-serif'; g.fillText([ch.cls, ch.server, ch.guild].filter(Boolean).join('  ·  '), 60, 155);
    var gs = BA.gearScoreOf(d, ch.race || ''), il = gs.complete ? gs.total : BA.num(d.itemLevel);
    [['COMBAT POWER', f(BA.num(d.cp))], ['ITEM LEVEL', f(il)]].forEach(function (k, i) { g.fillStyle = '#8a86b0'; g.font = 'bold 22px Arial'; g.fillText(k[0], 60 + i*360, 225); g.fillStyle = '#fff'; g.font = 'bold 64px Arial'; g.fillText(k[1], 60 + i*360, 290); });
    var cols = { u: '#e9b949', e: '#e9b949', l: '#7cc4ff', r: '#7fd98a', s: '#e58bff' };
    g.font = '22px Arial';
    BA.SLOTS.forEach(function (s, i) {
      var it = d.equipment[s.id], db = it && BA.findItem(s.id, it.name, ch.race || ''), x = 60 + (i % 2)*560, y = 345 + Math.floor(i/2)*24;
      g.fillStyle = '#8a86b0'; g.fillText(s.name, x, y); g.fillStyle = db ? (cols[db.grade] || '#fff') : '#fff'; g.fillText(it ? it.name + ' +' + it.enh : '-', x + 140, y);
    });
    var next = BA.nextSteps(d, { ch: ch }).filter(function (s) { return s.il; })[0];
    g.fillStyle = '#ffd24f'; g.font = 'bold 22px Arial'; g.fillText(next ? 'NEXT: ' + next.title : '', 60, 600 - 10);
    g.fillStyle = '#6a668a'; g.font = '18px Arial'; g.textAlign = 'right'; g.fillText('jordimutsaers.nl · AION 2 Build Architect', 1150, 600 - 10);
    var url = c.toDataURL('image/png');
    APP.dialog('Share card', '<img src="' + url + '" alt="Profile card" style="width:100%;border:1px solid var(--line)"><div class="row" style="margin-top:10px"><a class="btn pri" download="' + e(ch.name) + '-aion2.png" href="' + url + '">Download PNG</a><button class="btn" data-act="share-copy">Copy image</button></div><div class="small muted" style="margin-top:6px">Paste it in Discord with Ctrl+V after copying.</div>', []);
    APP._shareCanvas = c;
  };
  APP.act('share-card', function () { APP.shareCard(); });
  APP.act('share-copy', function () {
    var c = APP._shareCanvas; if (!c || !navigator.clipboard || !window.ClipboardItem) return APP.toast('Copying is not supported here: use Download.');
    c.toBlob(function (b) { navigator.clipboard.write([new ClipboardItem({ 'image/png': b })]).then(function () { APP.toast('Copied: paste it in Discord.'); }, function () { APP.toast('Copy failed: use Download.'); }); });
  });

  /* ------------------------------------------------------------------ hook into existing pages */
  var home = APP.views.dashboard, homeRender = home.render;
  home.render = function (arg) {
    var h = homeRender(arg), ch = APP.player();
    if (!ch || APP.advanced() || !Object.keys(APP.pd().equipment || {}).length) return h;
    var extra = '<div class="grid g2" style="margin-top:14px"><div class="card"><div class="row"><h2 style="margin:0;flex:1">Your progress</h2></div>' + chart(history(ch)) + '</div>' +
      '<div class="card"><h2>Plan and share</h2><div class="small" style="margin-bottom:10px">See your upgrades as one route, cheapest Item Level first, or make a card for Discord.</div><div class="row"><a class="btn" href="#/route">Upgrade route</a><button class="btn" data-act="share-card">Share card</button><a class="btn" href="#/legion">Legion</a></div></div></div>';
    var i = h.lastIndexOf('<div class="small muted" style="margin-top:14px">Want the detailed');
    return i > 0 ? h.slice(0, i) + extra + h.slice(i) : h + extra;
  };
  var cmp = APP.views.compare, cmpRender = cmp.render;
  cmp.render = function (arg) { return cmpRender(arg).replace('<button class="sm ghost" data-act="cmp-mine">', '<button class="sm" data-act="cmp-legion">Add to my legion</button> <button class="sm ghost" data-act="cmp-mine">'); };
  var upg = APP.views.upgrades, upgRender = upg.render;
  upg.render = function (arg) { return upgRender(arg).replace('<button data-act="go" data-to="#/upgrades/all"', '<button data-act="go" data-to="#/route">Route</button><button data-act="go" data-to="#/upgrades/all"'); };
})();
