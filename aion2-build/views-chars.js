/* AION 2 Build Architect - characters: first-time setup, the characters list with search, adding
   yourself or someone to compare with. Works for any class; AionFlex is linked, never scraped. */
(function () {
  'use strict';
  var BA = window.BA, APP = window.APP, e = APP.e, f = APP.fmt, inp = APP.inp;
  var KNOWN_SERVER_IDS = { '1305': 'Yustiel (EU)', '1306': 'Ariel (EU)' };
  var AF_SEARCH = 'https://aionflex.gg/search';

  function charForm(def) {
    def = def || {};
    return '<div id="charForm"><div class="card" style="margin-bottom:12px;background:var(--panel2)"><label>AionFlex profile link (optional)</label><div class="row"><input name="url" value="' + e(def.url || '') + '" placeholder="https://aionflex.gg/character?...&name=..." style="flex:1 1 260px"><button class="sm" data-act="char-readurl" type="button">Read link</button><a class="sm" href="' + AF_SEARCH + '" target="_blank" rel="noopener">Search on AionFlex</a></div>' +
      '<div class="small muted" style="margin-top:6px">Find the character on AionFlex, open its profile and copy the address bar here. The name, region and server are read from the link. Nothing is downloaded from AionFlex; add gear and stats by pasting the profile text or importing screenshots afterwards.</div><div id="urlMsg" class="small" style="margin-top:4px"></div></div>' +
      '<div class="form">' + inp('name', 'Character name *', def.name) +
      '<div><label>Class</label><select name="cls">' + BA.CLASSES.map(function (c) { return '<option' + (c === (def.cls || 'Assassin') ? ' selected' : '') + '>' + c + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Race</label><select name="race"><option' + (def.race === 'Elyos' ? ' selected' : '') + '>Elyos</option><option' + (def.race === 'Asmodian' ? ' selected' : '') + '>Asmodian</option></select></div>' +
      '<div><label>Region</label><select name="region">' + ['Global', 'Taiwan', 'Korea'].map(function (r) { return '<option' + (r === (def.region || 'Global') ? ' selected' : '') + '>' + r + '</option>'; }).join('') + '</select></div>' +
      '<div><label>Server</label><input name="server" list="serverList" value="' + e(def.server || '') + '" placeholder="Yustiel (EU)"><datalist id="serverList">' + BA.SERVERS.map(function (s) { return '<option value="' + e(s) + '">'; }).join('') + '</datalist></div>' +
      inp('guild', 'Guild', def.guild) + inp('level', 'Level', def.level) + inp('cp', 'Combat Power', def.cp) + inp('itemLevel', 'Item Level', def.itemLevel) +
      '<div><label>This is</label><select name="role"><option value="player"' + (def.role !== 'benchmark' ? ' selected' : '') + '>My character</option><option value="benchmark"' + (def.role === 'benchmark' ? ' selected' : '') + '>Someone to compare with</option></select></div></div></div>';
  }
  APP.act('char-readurl', function () {
    var root = document.getElementById('charForm'), o = APP.form(root), r = BA.parseProfileUrl(o.url), msg = document.getElementById('urlMsg');
    if (!r.ok) { msg.innerHTML = '<span class="bad">That does not look like an AionFlex character link.</span>'; return; }
    root.querySelector('[name=name]').value = r.name;
    if (r.region) { var rg = /^global$/i.test(r.region) ? 'Global' : /^tw|taiwan/i.test(r.region) ? 'Taiwan' : /^kr|korea/i.test(r.region) ? 'Korea' : 'Global'; root.querySelector('[name=region]').value = rg; }
    if (r.serverId && KNOWN_SERVER_IDS[r.serverId]) root.querySelector('[name=server]').value = KNOWN_SERVER_IDS[r.serverId];
    msg.innerHTML = '<span class="good">Read: ' + e(r.name) + (r.serverId ? ', server id ' + e(r.serverId) + (KNOWN_SERVER_IDS[r.serverId] ? ' (' + e(KNOWN_SERVER_IDS[r.serverId]) + ')' : ' (pick the server name yourself)') : '') + '.</span>';
  });
  function createFrom(root) {
    var o = APP.form(root), n = APP.numOrNull;
    if (!o.name || !o.name.trim()) { APP.toast('A character name is required.'); return null; }
    if (o.url && !BA.parseProfileUrl(o.url).ok && !/^https?:\/\//i.test(o.url)) { APP.toast('The profile link must be a web address.'); return null; }
    var lv = n(o.level), cp = n(o.cp), il = n(o.itemLevel);
    if (lv != null && (lv < 1 || lv > 99)) { APP.toast('Level must be 1-99.'); return null; }
    var ch = BA.newCharacter({ name: o.name.trim(), cls: o.cls, race: o.race, region: o.region, server: (o.server || '').slice(0, 40), guild: (o.guild || '').slice(0, 40), url: (o.url || '').slice(0, 400), role: o.role, level: lv, cp: cp, itemLevel: il, observedAt: APP.today(), source: 'Setup' });
    APP.state.characters.push(ch);
    if (o.role === 'player') APP.state.selected.player = ch.id;
    else { APP.state.cmp = { a: APP.state.selected.player, b: ch.id }; }
    APP.save();
    return ch;
  }

  /* ------------------------------------------------------------------ first-time setup */
  APP.view('setup', { title: 'Set up', icon: 'char', group: 'Overview', hidden: true, render: function () {
    return '<div class="head"><div><h1>Set up your character</h1><div class="muted">The Build Architect looks at one character at a time: yours. Comparing with someone else is optional and lives on the Compare page.</div></div></div>' +
      '<div class="grid g2"><div class="card hl"><h2>Your character</h2>' + charForm({ role: 'player' }) + '<div class="row" style="margin-top:12px"><button class="pri" data-act="setup-create">Create and continue</button></div></div>' +
      '<div class="card"><h2>What happens next</h2><ol class="small"><li>Your dashboard shows what you can improve, based on your own data.</li><li>Import screenshots of your Combat Stats, gear and skills (or type them in). Every save is kept as a snapshot.</li><li>Follow the <a href="#/guide">Start here</a> checklist. A guided tour is under Help at the top.</li></ol>' +
      '<h3>Just looking around?</h3><div class="small">Load an example Assassin with real data to see how everything works. You can delete it later on the Characters page.</div><div class="row" style="margin-top:8px"><button class="sm" data-act="load-example">Load the example character</button></div>' +
      '<h3>Coming from another device?</h3><div class="small">Restore your export on <a href="#/import">Import</a> &gt; JSON.</div></div></div>';
  } });
  APP.act('setup-create', function () { if (createFrom(document.getElementById('charForm'))) { APP.toast('Character created.'); location.hash = '#/dashboard'; APP.render(); } });
  APP.act('load-example', function () {
    var seed = BA.seedState(), ex = seed.characters[0];
    if (BA.getChar(APP.state, ex.id)) { APP.toast('The example is already loaded.'); return; }
    ex.name = 'lycaa'; APP.state.characters.push(ex);
    if (!APP.state.characters.some(function (c) { return c.role !== 'benchmark' && c !== ex; })) APP.state.selected.player = ex.id;
    APP.save(); APP.toast('Example character loaded.'); location.hash = '#/dashboard'; APP.render();
  });

  /* ------------------------------------------------------------------ characters list */
  APP.view('characters', { title: 'Characters', icon: 'char', group: 'Overview', render: function () {
    var s = APP.state, q = (s.charQ || '').toLowerCase(), cur = APP.player();
    var list = s.characters.filter(function (c) { return !q || (c.name + ' ' + c.cls + ' ' + c.server + ' ' + (c.guild || '')).toLowerCase().indexOf(q) >= 0; });
    var h = '<div class="head"><div><h1>Characters</h1><div class="muted">Your characters and anyone you saved to compare with. Search, switch, or add a new one.</div></div><span class="sp"></span><button class="pri" data-act="char-new">Add character</button></div>';
    h += '<div class="card"><div class="row"><input id="charQ" placeholder="Search saved characters by name, class, server or guild" value="' + e(s.charQ || '') + '" style="flex:1 1 260px"><button class="sm" data-act="char-q">Search</button><a class="sm" href="' + AF_SEARCH + '" target="_blank" rel="noopener">Find a player on AionFlex</a></div><div class="small muted" style="margin-top:6px">Characters you add are stored in this browser. To find any player in the game, search on AionFlex, copy their profile link and add them here.</div></div>';
    if (!s.characters.length) h += '<div class="note info" style="margin-top:14px">No characters yet. <a href="#/setup">Set up yours</a>.</div>';
    else h += '<div class="card" style="margin-top:14px"><div class="tbl"><table><thead><tr><th>Name</th><th>Class</th><th>Server</th><th>Type</th><th class="right">CP</th><th>Last snapshot</th><th></th></tr></thead><tbody>' + list.map(function (c) {
      var d = BA.cur(c), last = BA.latest(c);
      return '<tr><td><b>' + e(c.name) + '</b>' + (cur && c.id === cur.id ? ' <span class="pill confirmed">active</span>' : '') + (c.url ? ' <a class="small" href="' + e(c.url) + '" target="_blank" rel="noopener">profile</a>' : '') + '</td><td>' + e(c.cls) + '</td><td>' + e(c.server || '-') + '</td><td>' + (c.role === 'benchmark' ? 'Compare' : 'Mine') + '</td><td class="right">' + f(BA.num(d.cp)) + '</td><td class="small">' + e(last.observedAt) + ' <span class="muted">(' + c.snapshots.length + ')</span></td>' +
        '<td class="nowrap">' + (c.role !== 'benchmark' ? '<button class="sm" data-act="char-use" data-id="' + e(c.id) + '">Open</button>' : '<button class="sm" data-act="char-cmp" data-id="' + e(c.id) + '">Compare</button>') + '<button class="sm ghost" data-act="char-role" data-id="' + e(c.id) + '">' + (c.role === 'benchmark' ? 'Make mine' : 'Use for comparing') + '</button><button class="sm ghost" data-act="char-del" data-id="' + e(c.id) + '">Delete</button></td></tr>';
    }).join('') + '</tbody></table></div></div>';
    return h;
  } });
  // show Characters at the top of the Overview group
  (function () { var o = APP.order, i = o.indexOf('characters'), j = o.indexOf('dashboard'); if (i > j && j >= 0) { o.splice(i, 1); o.splice(j, 0, 'characters'); } })();
  APP.act('char-q', function () { APP.state.charQ = document.getElementById('charQ').value; APP.save(); APP.render(); });
  APP.act('char-new', function (el) {
    var role = el && el.getAttribute && el.getAttribute('data-role');
    APP.dialog(role === 'benchmark' ? 'Add a player to compare with' : 'Add character', charForm({ role: role || 'player' }), [{ label: 'Create', cls: 'pri', act: 'char-create' }]);
  });
  APP.act('char-create', function () {
    var ch = createFrom(document.getElementById('charForm')); if (!ch) return;
    APP.closeDialog(); APP.toast(ch.role === 'benchmark' ? 'Added. Import their profile text or screenshots to fill in their gear.' : 'Character created.', 4500);
    location.hash = ch.role === 'benchmark' ? '#/compare' : '#/dashboard'; APP.render();
  });
  function byId(id) { return BA.getChar(APP.state, id); }
  APP.act('char-use', function (el) { APP.state.selected.player = el.getAttribute('data-id'); APP.save(); location.hash = '#/dashboard'; APP.render(); });
  APP.act('char-cmp', function (el) { var p = APP.player(); APP.state.cmp = { a: p ? p.id : null, b: el.getAttribute('data-id') }; APP.save(); location.hash = '#/compare'; APP.render(); });
  APP.act('char-role', function (el) { var c = byId(el.getAttribute('data-id')); c.role = c.role === 'benchmark' ? 'player' : 'benchmark'; if (c.role === 'benchmark' && APP.state.selected.player === c.id) APP.state.selected.player = ''; APP.save(); APP.render(); });
  APP.act('char-del', function (el) {
    var c = byId(el.getAttribute('data-id'));
    APP.dialog('Delete ' + c.name + '?', '<div class="note bad">This removes ' + e(c.name) + ' with all ' + c.snapshots.length + ' snapshot(s), tasks and DPS runs from this browser. Export a backup first if you might want it back.</div>', [{ label: 'Delete', cls: 'pri', act: 'char-del-do', data: { id: c.id } }, { label: 'Download backup first', act: 'dl-json' }]);
  });
  APP.act('char-del-do', function (el) {
    var id = el.getAttribute('data-id'), s = APP.state;
    s.characters = s.characters.filter(function (c) { return c.id !== id; });
    s.tasks = s.tasks.filter(function (t) { return t.character !== id; }); s.dps = s.dps.filter(function (r) { return r.character !== id; });
    if (s.selected.player === id) s.selected.player = ''; if (s.cmp && (s.cmp.a === id || s.cmp.b === id)) s.cmp = {};
    APP.save(); APP.closeDialog(); APP.render();
  });
})();
