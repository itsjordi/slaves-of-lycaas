/* AION 2 Build Architect - app shell.
   Storage (localStorage for state, IndexedDB for screenshots), routing, dialogs, events, the
   Claude client (bring your own key) and small rendering helpers. The views live in views-*.js. */
(function () {
  'use strict';
  var BA = window.BA;
  var KEY = 'aion2_build_v1';
  var APP = window.APP = { views: {}, order: [], acts: {}, chg: {} };

  /* ------------------------------------------------------------------ state */
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) { var s = JSON.parse(raw); if (s && s.app === BA.APP_ID && Array.isArray(s.characters)) return BA.migrate(s); }
    } catch (e) { console.warn('Could not read saved data', e); }
    return BA.emptyState();
  }
  APP.state = load();
  APP.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(APP.state)); APP.saveError = null; }
    catch (e) { APP.saveError = e; APP.toast('Could not save: browser storage is full or blocked. Export a backup.'); }
  };
  APP.save();
  APP.reset = function () { APP.state = BA.seedState(); APP.save(); };
  APP.player = function () { return BA.getChar(APP.state, APP.state.selected.player) || APP.state.characters.filter(function (c) { return c.role !== 'benchmark'; })[0] || APP.state.characters[0] || null; };
  // comparing is opt-in on the Compare page only; everywhere else the tool looks at you alone
  APP.bench = function () { return null; };
  APP.tiers = function (mode) { var p = APP.player(); return BA.tiersFor(mode || APP.state.selected.mode, APP.state.customTiers, p ? p.cls : null); };
  APP.pd = function () { var p = APP.player(); return p ? BA.cur(p) : null; };
  APP.bd = function () { var b = APP.bench(); return b ? BA.cur(b) : null; };
  APP.commit = function (ch, mutate, label, observedAt) { var s = BA.commit(ch, mutate, label, observedAt); APP.save(); return s; };
  APP.recs = function () {
    var p = APP.player(), b = APP.bench();
    if (!p) return [];
    return BA.recommendations(BA.cur(p), b ? BA.cur(b) : null, { mode: APP.state.selected.mode, customTiers: APP.state.customTiers, cls: p.cls, benchName: b ? b.name : null });
  };
  APP.doneMap = function () {
    var m = {}; (APP.state.tasks || []).forEach(function (t) { if (t.status === 'done' && t.recId) m[t.recId] = true; });
    var d = APP.pd();
    if (d && d.skills && !d.skills.needsRefresh) m.data_skills = true;
    if (d && Object.keys(d.combatStats || {}).length) m.data_stats = true;
    if (d && d.titles && d.titles.unlocked != null) m.data_titles = true;
    return m;
  };

  /* ------------------------------------------------------------------ helpers */
  var ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  APP.e = function (s) { return s == null ? '' : String(s).replace(/[&<>"']/g, function (c) { return ESC[c]; }); };
  var e = APP.e;
  APP.fmt = function (n, unit) { if (n == null) return '<span class="muted">?</span>'; var s = BA.fmt(n); if (Math.round(n) !== n) s = String(Math.round(n*10)/10); return e(s) + (unit && unit !== 'flat' && unit !== 'rating' ? e(unit === '%' ? '%' : ' ' + unit) : ''); };
  APP.pill = function (m) {
    if (!m) return '<span class="pill unknown">Unknown</span>';
    var st = BA.STATUS[m.status] || BA.STATUS.unknown, tip = [st.label, m.source ? 'Source: ' + m.source : '', m.observedAt ? 'Observed: ' + m.observedAt : '', m.note || ''].filter(Boolean).join('\n');
    var short = { verified: 'Verified', confirmed: 'Confirmed', imported: 'Imported', estimated: 'Estimated', outdated: 'Outdated', unknown: 'Unknown' }[m.status] || st.label;
    return '<span class="pill ' + e(m.status) + '" title="' + e(tip) + '">' + e(short) + '</span>';
  };
  APP.tier = function (t) { return t ? '<span class="pill t-' + e(t.replace('+', 'p')) + '">' + e(t) + '</span>' : '<span class="pill">-</span>'; };
  APP.lvl = function (l) { return '<span class="lvl-' + e(l) + '">' + e(l) + '</span>'; };
  APP.bar = function (p, cls) { p = p == null ? 0 : Math.max(0, Math.min(100, p)); return '<div class="bar ' + (cls || '') + '"><i style="width:' + p + '%"></i></div>'; };
  APP.today = function () { return new Date().toISOString().slice(0, 10); };
  APP.toast = function (msg, ms) {
    var t = document.getElementById('toast'); t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(APP._tt); APP._tt = setTimeout(function () { t.classList.add('hidden'); }, ms || 3200);
  };
  APP.icon = function (name) {
    var P = {
      dash: 'M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z', char: 'M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0',
      eq: 'M14.5 3.5l6 6-11 11-6-6zM4 20l3-3', cmp: 'M8 3v18M16 3v18M3 8h5M16 16h5', plan: 'M4 6h16M4 12h10M4 18h6M18 15l2 2 4-4',
      pan: 'M3 21h18M5 21V10l7-6 7 6v11M9 21v-6h6v6', prog: 'M3 20l6-6 4 4 8-8M15 10h6v6', dps: 'M13 3L4 14h7l-1 7 9-11h-7z',
      res: 'M11 4a7 7 0 100 14 7 7 0 000-14zM21 21l-5-5', imp: 'M12 3v12M7 10l5 5 5-5M4 21h16', ai: 'M12 3l2 5 5 2-5 2-2 5-2-5-5-2 5-2z', set: 'M12 9a3 3 0 100 6 3 3 0 000-6zM19 12l2-1-1-3-2 .5-1.5-1.5L17 5l-3-1-1 2h-2L10 4 7 5l.5 2L6 8.5 4 8l-1 3 2 1v1l-2 1 1 3 2-.5L7.5 17 7 19l3 1 1-2h2l1 2 3-1-.5-2 1.5-1.5 2 .5 1-3-2-1z'
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (P[name] || '') + '"/></svg>';
  };

  /* ------------------------------------------------------------------ dialogs and events */
  var dlg = document.getElementById('dlg');
  APP.dialog = function (title, body, buttons) {
    document.getElementById('dlgTitle').textContent = title;
    document.getElementById('dlgBody').innerHTML = body;
    document.getElementById('dlgFoot').innerHTML = (buttons || []).map(function (b) {
      return '<button type="button" class="' + (b.cls || '') + '" data-act="' + e(b.act) + '"' + (b.data ? Object.keys(b.data).map(function (k) { return ' data-' + k + '="' + e(b.data[k]) + '"'; }).join('') : '') + '>' + e(b.label) + '</button>';
    }).join('') + '<button type="button" class="ghost" data-act="dlg-close">Cancel</button>';
    if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
  };
  APP.closeDialog = function () { if (dlg.open && dlg.close) dlg.close(); else dlg.removeAttribute('open'); };
  APP.form = function (root) {
    var o = {}; (root || document.getElementById('dlgBody')).querySelectorAll('[name]').forEach(function (el) {
      if (el.type === 'checkbox') o[el.name] = el.checked; else o[el.name] = el.value;
    });
    return o;
  };
  APP.act = function (name, fn) { APP.acts[name] = fn; };
  APP.onChange = function (name, fn) { APP.chg[name] = fn; };
  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-act]');
    if (!el) return;
    var fn = APP.acts[el.getAttribute('data-act')];
    if (fn) { ev.preventDefault(); try { fn(el, ev); } catch (err) { console.error(err); APP.toast('Something went wrong: ' + err.message); } }
  });
  document.addEventListener('change', function (ev) {
    var el = ev.target.closest('[data-chg]');
    if (!el) return;
    var fn = APP.chg[el.getAttribute('data-chg')];
    if (fn) try { fn(el, ev); } catch (err) { console.error(err); APP.toast('Something went wrong: ' + err.message); }
  });
  APP.act('dlg-close', function () { APP.closeDialog(); });
  APP.act('go', function (el) { location.hash = el.getAttribute('data-to'); });

  /* ------------------------------------------------------------------ sortable and filterable tables */
  // Every table with a header row in the main view gets clickable headers and, with 4+ rows, a filter box.
  // Tiers sort S+ > S > A+ > A > B > C; numbers sort numerically; unknown values ("?", "-") go last.
  var TIER_RANK = { 'S+': 6, 'S': 5, 'A+': 4, 'A': 3, 'B': 2, 'C': 1 };
  APP.sortState = {};
  function cellKey(td) {
    if (!td) return { t: 3, v: '' };
    var raw = td.getAttribute('data-sort');
    var txt = (raw != null ? raw : td.textContent).trim();
    var tm = txt.match(/^(S\+|A\+|S|A|B|C)(?![\w+])/);
    if (tm && raw == null && td.querySelector('.pill')) return { t: 0, v: TIER_RANK[tm[1]] };
    if (raw != null && TIER_RANK[raw] != null) return { t: 0, v: TIER_RANK[raw] };
    if (!txt || txt === '?' || txt === '-' || /^(not recorded|unknown)$/i.test(txt)) return { t: 3, v: '' };
    var nm = txt.replace(/,/g, '').match(/^[+-]?\d+(\.\d+)?/);
    if (nm) return { t: 1, v: parseFloat(nm[0]) };
    return { t: 2, v: txt.toLowerCase() };
  }
  function cmp(a, b, dir) {
    if (a.t === 3 && b.t !== 3) return 1; if (b.t === 3 && a.t !== 3) return -1;
    if (a.t !== b.t) return a.t - b.t;
    var r = a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
    return dir === 'asc' ? r : -r;
  }
  function sortTable(tb, col, dir) {
    var body = tb.tBodies[0]; if (!body) return;
    var rows = [].slice.call(body.rows), fixed = rows.filter(function (r) { return r.classList.contains('fixed'); }), movable = rows.filter(function (r) { return !r.classList.contains('fixed'); });
    movable.sort(function (x, y) { return cmp(cellKey(x.cells[col]), cellKey(y.cells[col]), dir); });
    movable.concat(fixed).forEach(function (r) { body.appendChild(r); });
    [].slice.call(tb.tHead.rows[0].cells).forEach(function (th, i) { th.setAttribute('aria-sort', i === col ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'); th.querySelector('.sa') && (th.querySelector('.sa').textContent = i === col ? (dir === 'asc' ? ' ▲' : ' ▼') : ''); });
  }
  function filterTable(tb, q, tier, tierCol) {
    q = (q || '').toLowerCase();
    [].slice.call(tb.tBodies[0].rows).forEach(function (r) {
      if (r.classList.contains('fixed')) return;
      var ok = !q || r.textContent.toLowerCase().indexOf(q) >= 0;
      if (ok && tier && tierCol >= 0) { var k = cellKey(r.cells[tierCol]); ok = k.t === 0 && k.v === TIER_RANK[tier]; }
      r.style.display = ok ? '' : 'none';
    });
  }
  APP.enhanceTables = function (root) {
    root = root || document.getElementById('view');
    var viewKey = location.hash || '#/dashboard';
    [].slice.call(root.querySelectorAll('table')).forEach(function (tb, ti) {
      if (!tb.tHead || !tb.tBodies[0] || tb.closest('#revForm') || tb.hasAttribute('data-nosort')) return;
      var key = viewKey + ':' + ti, st = APP.sortState[key] || {};
      var heads = [].slice.call(tb.tHead.rows[0].cells), tierCol = -1;
      heads.forEach(function (th, i) {
        if (/^tier$/i.test(th.textContent.trim())) tierCol = i;
        if (!th.textContent.trim()) return;
        th.style.cursor = 'pointer'; th.setAttribute('role', 'button'); th.tabIndex = 0; th.title = 'Sort';
        var sa = document.createElement('span'); sa.className = 'sa'; th.appendChild(sa);
        function go() { var dir = st.col === i && st.dir === 'desc' ? 'asc' : (st.col === i ? 'desc' : (cellKey(tb.tBodies[0].rows[0] && tb.tBodies[0].rows[0].cells[i]).t <= 1 ? 'desc' : 'asc')); st.col = i; st.dir = dir; APP.sortState[key] = st; sortTable(tb, i, dir); }
        th.addEventListener('click', go); th.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); } });
      });
      var n = tb.tBodies[0].rows.length;
      if (n >= 4) {
        var bar = document.createElement('div'); bar.className = 'row tfilter'; bar.style.margin = '0 0 8px';
        bar.innerHTML = '<input type="search" placeholder="Filter ' + n + ' rows" aria-label="Filter table" style="max-width:260px">' + (tierCol >= 0 ? '<select aria-label="Filter by tier"><option value="">All tiers</option>' + Object.keys(TIER_RANK).map(function (t) { return '<option>' + t + '</option>'; }).join('') + '</select>' : '') + '<span class="small muted">Click a column header to sort.</span>';
        var host = tb.parentNode.classList.contains('tbl') ? tb.parentNode : tb;
        host.parentNode.insertBefore(bar, host);
        var qi = bar.querySelector('input'), ts = bar.querySelector('select');
        qi.value = st.q || ''; if (ts) ts.value = st.tier || '';
        function apply() { st.q = qi.value; st.tier = ts ? ts.value : ''; APP.sortState[key] = st; filterTable(tb, st.q, st.tier, tierCol); }
        qi.addEventListener('input', apply); if (ts) ts.addEventListener('change', apply);
        if (st.q || st.tier) apply();
      }
      if (st.col != null) sortTable(tb, st.col, st.dir);
      else if (tierCol >= 0) { st.col = tierCol; st.dir = 'desc'; APP.sortState[key] = st; sortTable(tb, tierCol, 'desc'); }
    });
  };

  /* ------------------------------------------------------------------ routing */
  APP.SIMPLE = ['dashboard', 'profile', 'compare', 'tiers', 'guide'];
  APP.view = function (id, def) { APP.views[id] = def; if (!def.hidden) APP.order.push(id); };
  function route() { var h = (location.hash || '#/dashboard').replace(/^#\/?/, '').split('/'); return { name: h[0] || 'dashboard', arg: h.slice(1).join('/') }; }
  APP.render = function () {
    var r = route(), v = APP.views[r.name] || APP.views.dashboard;
    // nobody set up yet: everything except settings and the characters page leads to the setup screen
    if (!APP.state.characters.length && !(r.name === 'import' && (APP.review || r.arg.indexOf('aionflex?') === 0)) && ['settings', 'characters', 'setup', 'profile'].indexOf(r.name) < 0 && APP.views.setup) v = APP.views.setup;
    renderSide(r.name);
    renderPick();
    var el = document.getElementById('view');
    try { el.innerHTML = v.render(r.arg) || ''; if (v.after) v.after(r.arg); APP.enhanceTables(el); }
    catch (err) { console.error(err); el.innerHTML = '<div class="note bad">This view failed to render: ' + e(err.message) + '</div>'; }
  };
  function renderSide(curName) {
    var groups = {};
    var adv = !!(APP.state.settings && APP.state.settings.advanced), html = '';
    if (!adv) {
      // the short menu: only what you need to get stronger
      html += APP.SIMPLE.filter(function (id) { return APP.views[id]; }).map(function (id) { var v = APP.views[id]; return '<a href="#/' + id + '" class="' + (id === curName ? 'cur' : '') + '">' + APP.icon(v.icon) + e(id === 'dashboard' ? 'Home' : v.title) + '</a>'; }).join('');
    } else {
      APP.order.forEach(function (id) { var v = APP.views[id]; (groups[v.group] = groups[v.group] || []).push(id); });
      Object.keys(groups).forEach(function (g) {
        html += '<div class="sec">' + e(g) + '</div>';
        groups[g].forEach(function (id) { var v = APP.views[id]; html += '<a href="#/' + id + '" class="' + (id === curName ? 'cur' : '') + '">' + APP.icon(v.icon) + e(v.title) + '</a>'; });
      });
    }
    html += '<a href="' + e(location.hash || '#/dashboard') + '" data-act="mode-toggle" class="mode-toggle" title="' + (adv ? 'Show only the essentials' : 'Show every tool: planner, stat tiers, DPS log, snapshots, research, AI') + '">' + APP.icon('set') + (adv ? 'Fewer tools' : 'More tools') + '</a>';
    document.getElementById('side').innerHTML = html;
  }
  function renderPick() {
    var s = APP.state, mine = s.characters.filter(function (c) { return c.role !== 'benchmark'; }), p = APP.player();
    var sel = document.getElementById('pickPlayer');
    sel.innerHTML = mine.length ? mine.map(function (c) { return '<option value="' + e(c.id) + '"' + (p && c.id === p.id ? ' selected' : '') + '>' + e(c.name) + '</option>'; }).join('') + '<option value="__manage">Manage characters...</option>' : '<option value="">No character yet</option><option value="__manage">Set up a character...</option>';
  }
  document.getElementById('pickPlayer').addEventListener('change', function (ev) {
    if (ev.target.value === '__manage') { location.hash = '#/characters'; return; }
    APP.state.selected.player = ev.target.value; APP.save(); APP.render();
  });
  /* themes: the same six as the Daily Board; follows the board's theme until you pick one here */
  APP.THEMES = [['aion', 'Aion'], ['paper', 'Paper'], ['lamp', 'Lamp'], ['slate', 'Slate'], ['mist', 'Mist'], ['pixel', 'Pixel']];
  APP.setTheme = function (t) {
    if (!APP.THEMES.some(function (x) { return x[0] === t; })) t = 'aion';
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem('aion2_build_theme', t); } catch (x) {}
    var tp = document.getElementById('themePick'); if (tp) tp.value = t;
  };
  var tp = document.getElementById('themePick');
  tp.innerHTML = APP.THEMES.map(function (x) { return '<option value="' + x[0] + '">' + x[1] + '</option>'; }).join('');
  tp.value = document.documentElement.getAttribute('data-theme') || 'aion';
  tp.addEventListener('change', function () { APP.setTheme(tp.value); });
  addEventListener('hashchange', function () { APP.render(); document.getElementById('view').focus({ preventScroll: true }); window.scrollTo(0, 0); });

  /* ------------------------------------------------------------------ screenshots in IndexedDB */
  var dbp = null;
  function db() {
    if (dbp) return dbp;
    dbp = new Promise(function (res, rej) {
      if (!window.indexedDB) return rej(new Error('IndexedDB not available'));
      var r = indexedDB.open('aion2_build', 1);
      r.onupgradeneeded = function () { r.result.createObjectStore('uploads', { keyPath: 'id' }); };
      r.onsuccess = function () { res(r.result); }; r.onerror = function () { rej(r.error); };
    });
    return dbp;
  }
  var memUploads = {};
  APP.putUpload = function (rec) {
    memUploads[rec.id] = rec;
    return db().then(function (d) { return new Promise(function (res, rej) { var tx = d.transaction('uploads', 'readwrite'); tx.objectStore('uploads').put(rec); tx.oncomplete = function () { res(true); }; tx.onerror = function () { rej(tx.error); }; }); })
      .catch(function (err) { console.warn('Screenshot kept in memory only', err); return false; });
  };
  APP.getUpload = function (id) {
    if (memUploads[id]) return Promise.resolve(memUploads[id]);
    return db().then(function (d) { return new Promise(function (res) { var r = d.transaction('uploads').objectStore('uploads').get(id); r.onsuccess = function () { res(r.result || null); }; r.onerror = function () { res(null); }; }); })
      .catch(function () { return null; });
  };

  /* ------------------------------------------------------------------ AI client: Claude or ChatGPT, your own key */
  // Internally everything uses the Anthropic message shape (content blocks, tool_use, tool_result).
  // For OpenAI the request is translated to Chat Completions and the answer is translated back.
  var calls = [];
  APP.PROVIDERS = { anthropic: 'Claude (Anthropic)', openai: 'ChatGPT (OpenAI)' };
  function aiConf() {
    var s = APP.state.settings, p = s.provider === 'openai' ? 'openai' : 'anthropic';
    return { provider: p, key: p === 'openai' ? s.openaiKey : s.apiKey, model: p === 'openai' ? s.openaiModel : s.model, name: APP.PROVIDERS[p] };
  }
  APP.aiConf = aiConf;
  APP.aiReady = function () { var c = aiConf(); return !!(APP.state.settings.aiEnabled && c.key && c.model); };
  function toOpenAI(body) {
    var msgs = [];
    if (body.system) msgs.push({ role: 'system', content: body.system });
    (body.messages || []).forEach(function (m) {
      if (typeof m.content === 'string') { msgs.push({ role: m.role, content: m.content }); return; }
      var blocks = m.content || [];
      if (m.role === 'assistant') {
        var text = blocks.filter(function (b) { return b.type === 'text'; }).map(function (b) { return b.text; }).join('\n');
        var uses = blocks.filter(function (b) { return b.type === 'tool_use'; });
        var o = { role: 'assistant', content: text || null };
        if (uses.length) o.tool_calls = uses.map(function (u) { return { id: u.id, type: 'function', function: { name: u.name, arguments: JSON.stringify(u.input || {}) } }; });
        msgs.push(o); return;
      }
      var results = blocks.filter(function (b) { return b.type === 'tool_result'; });
      results.forEach(function (r) { msgs.push({ role: 'tool', tool_call_id: r.tool_use_id, content: typeof r.content === 'string' ? r.content : JSON.stringify(r.content) }); });
      var parts = blocks.filter(function (b) { return b.type === 'text' || b.type === 'image'; }).map(function (b) {
        return b.type === 'text' ? { type: 'text', text: b.text } : { type: 'image_url', image_url: { url: 'data:' + b.source.media_type + ';base64,' + b.source.data } };
      });
      if (parts.length) msgs.push({ role: 'user', content: parts });
    });
    var out = { messages: msgs, max_completion_tokens: body.max_tokens || 1500 };
    if (body.tools) out.tools = body.tools.map(function (t) { return { type: 'function', function: { name: t.name, description: t.description, parameters: t.input_schema } }; });
    return out;
  }
  function fromOpenAI(j) {
    var ch = (j.choices || [])[0] || {}, m = ch.message || {}, content = [];
    if (m.content) content.push({ type: 'text', text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) });
    (m.tool_calls || []).forEach(function (t) { var input = {}; try { input = JSON.parse(t.function.arguments || '{}'); } catch (x) { input = {}; } content.push({ type: 'tool_use', id: t.id, name: t.function.name, input: input }); });
    return { content: content, stop_reason: (m.tool_calls && m.tool_calls.length) ? 'tool_use' : 'end_turn' };
  }
  APP.toOpenAI = toOpenAI; APP.fromOpenAI = fromOpenAI;
  APP.claude = APP.ai = function (body) {
    var c = aiConf();
    if (!APP.aiReady()) return Promise.reject(new Error('AI is not configured. Choose Claude or ChatGPT in Settings and add your own key, or use manual entry.'));
    var now = Date.now();
    calls = calls.filter(function (t) { return now - t < 10 * 60 * 1000; });
    if (calls.length >= 30) return Promise.reject(new Error('Rate limit: max 30 AI requests per 10 minutes.'));
    if (calls.length && now - calls[calls.length - 1] < 1500) return Promise.reject(new Error('Slow down a little: one request per 1.5 seconds.'));
    calls.push(now);
    var ctl = new AbortController(), to = setTimeout(function () { ctl.abort(); }, 90000), req;
    if (c.provider === 'openai') {
      var ob = toOpenAI(body); ob.model = c.model;
      req = fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', signal: ctl.signal, headers: { 'content-type': 'application/json', 'authorization': 'Bearer ' + c.key }, body: JSON.stringify(ob) });
    } else {
      body.model = c.model;
      req = fetch('https://api.anthropic.com/v1/messages', { method: 'POST', signal: ctl.signal, headers: { 'content-type': 'application/json', 'x-api-key': c.key, 'anthropic-version': '2023-06-01', 'anthropic-dangerous-direct-browser-access': 'true' }, body: JSON.stringify(body) });
    }
    return req.then(function (r) {
      clearTimeout(to);
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) throw new Error(c.name + ' request failed (' + r.status + '): ' + ((j.error && j.error.message) || 'unknown error'));
        return c.provider === 'openai' ? fromOpenAI(j) : j;
      });
    }, function (err) { clearTimeout(to); throw new Error(err.name === 'AbortError' ? 'AI request timed out.' : 'Network error: ' + err.message); });
  };
  APP.textOf = function (resp) { return (resp.content || []).filter(function (c) { return c.type === 'text'; }).map(function (c) { return c.text; }).join('\n'); };

  /* ------------------------------------------------------------------ boot after views load */
  APP.start = function () { APP.render(); };
})();
