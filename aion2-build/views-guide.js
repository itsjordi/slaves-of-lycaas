/* AION 2 Build Architect - tutorial: start-here guide with a live checklist, an interactive tour,
   per-page help, a glossary and FAQ. Loaded last; it also starts the app. */
(function () {
  'use strict';
  var BA = window.BA, APP = window.APP, e = APP.e;

  /* ------------------------------------------------------------------ progress tracking */
  function g() { var s = APP.state; s.guide = s.guide || { visited: {}, exported: false, tourDone: false, welcomed: false }; s.guide.visited = s.guide.visited || {}; return s.guide; }
  var baseRender = APP.render;
  APP.render = function () {
    var name = (location.hash || '#/dashboard').replace(/^#\/?/, '').split('/')[0] || 'dashboard';
    if (!g().visited[name]) { g().visited[name] = true; APP.save(); }
    baseRender();
    addHelp(name);
  };
  var dl = APP.acts['dl-json'];
  APP.act('dl-json', function (el, ev) { g().exported = true; APP.save(); dl(el, ev); });

  /* ------------------------------------------------------------------ the checklist */
  function steps() {
    var d = APP.pd(), s = APP.state, gg = g(), main = d.equipment.main_hand || { base: [], rolls: [] };
    return [
      { id: 'look', title: 'Read your dashboard', time: '1 min', to: '#/dashboard', done: !!gg.visited.dashboard,
        text: 'Your CP, Item Level, what you can improve and the Best next upgrade. Hover a status pill to see where a number came from and how old it is.' },
      { id: 'stats', title: 'Import your Combat Stats', time: '3 min', to: '#/import/combatStats', done: Object.keys(d.combatStats || {}).length > 0,
        text: 'Open the Combat Stats window in game, take a screenshot, and import it. This is the single biggest improvement: without stats the advice can only compare item names and + levels.' },
      { id: 'skills', title: 'Import your current skill levels', time: '3 min', to: '#/import/skills', done: !d.skills.needsRefresh,
        text: 'Skills are ignored until their levels are recorded. Import a current screenshot of the Skills window (active, passive and Stigmas), or type them in.' },
      { id: 'weapon', title: 'Record your weapon tooltip', time: '2 min', to: '#/equipment', done: (main.base.length + main.rolls.length) > 0,
        text: 'Click Main-hand on the Equipment page and type the stat lines from the tooltip (Stat: value). Then the item comparison can answer "is this dagger better than mine".' },
      { id: 'tiers', title: 'Learn the stat priorities', time: '2 min', to: '#/tiers', done: !!gg.visited.tiers,
        text: 'The Tier lists page shows which stats matter most for boss PvE (S+ on top), the Divine Stat collection order and the Core Stat guide. All provisional, all editable.' },
      { id: 'compare', title: 'Compare with someone (when you want)', time: '2 min', to: '#/compare', done: !!gg.visited.compare, optional: true,
        text: 'Add another player from AionFlex and see where you are ahead or behind. Entirely optional.' },
      { id: 'plan', title: 'Put an upgrade in your plan', time: '1 min', to: '#/planner', done: s.tasks.length > 0,
        text: 'Click "Add to plan" on the Best next upgrade. Mark it completed when done and write what changed.' },
      { id: 'dps', title: 'Log a DPS run', time: '2 min', to: '#/dps', done: (s.dps || []).length > 0,
        text: 'Measured DPS beats every estimate. Log one boss run now and the same boss again after an upgrade.' },
      { id: 'titles', title: 'Record your title count', time: '1 min', to: '#/character/more', done: d.titles.unlocked != null,
        text: 'Titles can carry bonuses. Record how many you have.' },
      { id: 'backup', title: 'Export a backup', time: '30 s', to: '#/settings', done: !!gg.exported,
        text: 'Your data lives only in this browser. Export once now and after big updates.' },
      { id: 'ai', title: 'Optional: set up AI (Claude or ChatGPT)', time: '3 min', to: '#/settings', done: APP.aiReady(), optional: true,
        text: 'With your own Claude or ChatGPT key, screenshots are read automatically and you can ask the assistant questions like "what is my weakest slot?".' }
    ];
  }

  /* ------------------------------------------------------------------ the guide page */
  var GLOSSARY = [
    ['Combat Power (CP)', 'The game\'s overall power number. Useful, but higher CP does not prove higher boss DPS.'],
    ['Item Level', 'Average level of your gear. Tracked per snapshot.'],
    ['Divine Stats', 'Ten stats (Justice, Freedom, Illusion, Life, Time, Destruction, Death, Wisdom, Destiny, Space), each giving two effects. Raised mainly through Pantheon.'],
    ['Sum of displayed levels', 'The ten Divine Stat levels added up. Our own analytic number, not an official stat.'],
    ['Pantheon', 'Collection of artwork, statues and colossi. Displayed decorations give Divine Stat effects.'],
    ['Daevanion', 'Five boards (Nezekan, Zikel, Vaizel, Triniel, Azphel). Completion % is not the same as damage.'],
    ['Arcana', 'A separate equipment system with its own slots and upgrades.'],
    ['Soul Binding / Manastones', 'Extra stat lines on items. They decide which item is better far more than rarity does.'],
    ['Stigma', 'Special skills, tracked with the other skills.'],
    ['Back Attack vs Back Attack Damage Boost', 'Flat attack from behind vs a percentage damage boost from behind. Different stats.'],
    ['Snapshot', 'A frozen copy of your character at one moment. Every save makes a new one; old ones never change.'],
    ['Comparison character', 'Someone you saved to compare with. Only used on the Compare page.'],
    ['Status pill', 'Where a value came from: Verified (seen in game), Confirmed (you entered it), Imported (profile site), Estimated, Outdated or Unknown.'],
    ['High / Medium / Low / Unknown', 'Qualitative impact and confidence labels. The tool never invents percentages.']
  ];
  var FAQ = [
    ['Why do so many things say "Unknown" or "not recorded"?', 'Because the tool refuses to guess. Import your Combat Stats and item tooltips and most of those fill in.'],
    ['Why is the Best next upgrade not "get a better weapon"?', 'Upgrades that depend on missing data (like item stats) wait until that data is recorded. Switch the ranking mode in the planner to see other orders.'],
    ['I upgraded something. How do I update?', 'Import a new screenshot, or edit the value on the Character or Equipment page. Each save becomes a new snapshot, so the Progression page shows your improvement.'],
    ['A value is wrong. How do I fix it?', 'Edit it on its page and save. The wrong value stays in the older snapshot as history, but the current state uses your correction.'],
    ['What does "Save anyway" mean?', 'You tried to save a value observed earlier than the one you already have. Saving would replace newer data, so it asks first and logs it.'],
    ['Is my data online?', 'No. Everything stays in this browser. Export a backup to move it to another device.'],
    ['Does the AI cost money?', 'It uses your own Anthropic API key, so normal API pricing applies to your account. Everything works without it.'],
    ['Where do the tier lists come from?', 'The built-in Assassin list comes from community discussion about PvE. It is a hypothesis, not a formula. Other classes start empty. Change them on Tier lists > Edit ranking.'],
    ['Can other people use this?', 'Yes. Everyone sets up their own character; the data stays in their own browser.'],
    ['How do I put something on my Daily Board?', 'Click "To Daily board" next to any recommendation or task. It appears in My to-do on the Daily Board.'],
    ['Can I sort and filter tables?', 'Yes. Click any column header to sort (tiers sort S+ first) and use the filter box above longer tables.']
  ];
  APP.view('guide', { title: 'Start here', icon: 'ai', group: 'Start', render: function () {
    if (!APP.player()) return APP.views.setup.render();
    var st = steps(), req = st.filter(function (x) { return !x.optional; }), done = req.filter(function (x) { return x.done; }).length, next = st.filter(function (x) { return !x.done; })[0];
    var h = '<div class="head"><div><h1>Start here</h1><div class="muted">Everything you need to get useful advice out of the Build Architect, in order.</div></div><span class="sp"></span><button class="pri" data-act="tour-start">Take the guided tour</button></div>';
    h += '<div class="grid g2"><div class="card hl"><h2>What this tool does</h2><div class="small">It keeps a history of your character and ranks what to improve next for PvE boss damage. Comparing with another player is there when you want it. Every recommendation tells you <b>what</b> to do, <b>why</b>, what it <b>costs</b>, how <b>confident</b> it is, and what to do <b>next</b>. It never invents numbers: what is not known shows as Unknown.</div>' +
      '<h3>Your progress</h3>' + APP.bar(done/req.length*100) + '<div class="small" style="margin-top:6px">' + done + ' of ' + req.length + ' setup steps done.' + (next ? ' Next: <a href="' + e(next.to) + '">' + e(next.title) + '</a>.' : ' All done. Keep the weekly loop going.') + '</div></div>';
    h += '<div class="card"><h2>The weekly loop</h2><ol class="small"><li><b>Play and upgrade</b> in game.</li><li><b>Screenshot</b> what changed (Combat Stats, gear tooltip, Pantheon, skills).</li><li><b>Import</b> it and check the values in the review screen.</li><li>Look at <b>Progression</b> to see the difference since last time.</li><li>Open the <b>Upgrade Planner</b> and pick the next step.</li><li><b>Log a DPS run</b> on the same boss to see if it really helped.</li></ol></div></div>';
    h += '<div class="card" style="margin-top:14px"><h2>Setup checklist</h2><div class="small muted" style="margin-bottom:6px">Ticks update by themselves when the step is done.</div><ol class="list" style="list-style:none">' + st.map(function (x, i) {
      return '<li class="row" style="align-items:flex-start;flex-wrap:nowrap"><span style="flex:none;width:26px;height:26px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;border:1px solid ' + (x.done ? 'var(--good)' : 'var(--line2)') + ';color:' + (x.done ? 'var(--good)' : 'var(--gold)') + ';font-weight:700">' + (x.done ? '&#10003;' : (i + 1)) + '</span><div style="flex:1"><b class="' + (x.done ? 'muted' : '') + '">' + e(x.title) + '</b> <span class="pill">' + e(x.time) + '</span>' + (x.optional ? ' <span class="pill">optional</span>' : '') + '<div class="small' + (x.done ? ' muted' : '') + '">' + e(x.text) + '</div></div><a class="nowrap small" href="' + e(x.to) + '">' + (x.done ? 'Open' : 'Do it') + ' &rsaquo;</a></li>';
    }).join('') + '</ol></div>';
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>How to take good screenshots</h2><ul class="small"><li>Full window, no overlapping chat or tooltips.</li><li>One screen per screenshot: Combat Stats, one item tooltip, the Skills window, the Pantheon screen.</li><li>Scroll lists and take a second screenshot for the rest; import them together.</li><li>PNG, JPG or WebP up to 8 MB.</li><li>Set the "Observed on" date to the day you took it, so older shots never overwrite newer data.</li></ul></div>' +
      '<div class="card"><h2>Reading the screens</h2><table data-nosort><tbody>' +
      [['<span class="pill verified">Verified</span>', 'Seen in game (from a screenshot you confirmed as verified).'], ['<span class="pill confirmed">Confirmed</span>', 'You entered or confirmed it.'], ['<span class="pill imported">Imported</span>', 'From AionFlex. May be stale.'], ['<span class="pill outdated">Outdated</span>', 'Known to be old (your AionFlex skill levels).'], [APP.tier('S+'), 'Stat tier: S+ is the most valued for boss PvE, C the least.'], ['<span class="lvl-High">High</span> / <span class="lvl-Unknown">Unknown</span>', 'Qualitative impact or confidence. No invented percentages.']]
        .map(function (r) { return '<tr><td class="nowrap">' + r[0] + '</td><td class="small">' + r[1] + '</td></tr>'; }).join('') + '</tbody></table></div></div>';
    h += '<div class="grid g2" style="margin-top:14px"><div class="card"><h2>Glossary</h2><div class="tbl"><table><thead><tr><th>Term</th><th>Meaning</th></tr></thead><tbody>' + GLOSSARY.map(function (x) { return '<tr><td><b>' + e(x[0]) + '</b></td><td class="small">' + e(x[1]) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' +
      '<div class="card"><h2>FAQ</h2>' + FAQ.map(function (x) { return '<details style="margin-bottom:8px"><summary><b>' + e(x[0]) + '</b></summary><div class="small" style="margin:6px 0 0 14px">' + e(x[1]) + '</div></details>'; }).join('') + '</div></div>';
    return h;
  } });
  APP.order.unshift(APP.order.pop());

  /* ------------------------------------------------------------------ per-page help */
  var HELP = {
    dashboard: 'Top row: your numbers and how much of your data is recorded. "Best next upgrade" is the highest ranked improvement you can act on now; "Collect this data first" lists screenshots that unlock better advice. Hover any status pill for the source and date.',
    character: 'Tabs for every part of your character. Each "Edit" saves a new snapshot with the date you saw the values. Core stats has a what-if tool; Daevanion lets you add nodes for a route suggestion.',
    equipment: 'Click a slot to see or edit the item, including stat lines (Stat: value per line). Below the grid, compare your item with a candidate; it shows which stats go up or down and leans by tier, without pretending to calculate DPS.',
    compare: 'Optional. Pick any two characters and snapshots. The lists split differences into advantages, disadvantages, missing systems, DPS-relevant and CP-relevant parts. Unknowns tell you what to record before trusting a conclusion.',
    planner: 'Recommendations are ranked by labelled dimensions. Change the ranking mode at the top right. Add items to your plan, set dependencies and materials, track resources, and mark tasks completed with what actually changed.',
    pantheon: 'Track your collection and decorations. Display effects are kept apart from Divine Stats on purpose. Mark collectibles as owned, displayed or farming, and filter by Divine Stat.',
    progression: 'Charts and a table of every snapshot. Pick two snapshots to see exactly what changed.',
    dps: 'Log DPS-meter results per boss. Runs are only compared with runs on the same boss.',
    tiers: 'S+ is on top. Switch the mode, view as cards or a sortable table, and edit the ranking when testing says otherwise.',
    research: 'Store what you learn with its source, date and confidence. Mark findings reviewed or outdated so old guides do not mislead you.',
    import: 'Upload screenshots (or paste text, JSON, CSV). Nothing is saved until you confirm in the review screen; unreadable or conflicting values start unticked.',
    assistant: 'Ask questions about your build. The assistant reads your confirmed data; any change it suggests waits for your approval.',
    settings: 'Optional AI (Claude or ChatGPT, your own key), exports and backups, and starting over.',
    characters: 'All characters saved in this browser. Search them, switch to one, add yours, or add someone to compare with from an AionFlex profile link.'
  };
  function addHelp(name) {
    var head = document.querySelector('#view .head'); if (!head || !HELP[name] || name === 'guide') return;
    var dd = document.createElement('details'); dd.className = 'note info small'; dd.style.marginTop = '-6px';
    dd.innerHTML = '<summary style="cursor:pointer"><b>How this page works</b></summary><div style="margin-top:6px">' + e(HELP[name]) + ' <a href="#/guide">Full guide</a> &middot; <a href="#" data-act="tour-start">Tour</a></div>';
    head.parentNode.insertBefore(dd, head.nextSibling);
  }

  /* ------------------------------------------------------------------ interactive tour */
  var TOUR = [
    { to: '#/dashboard', sel: '.kpi', title: 'Your numbers', text: 'Combat Power, Item Level, DPS and how much of your data is recorded. The small pill tells you where each number came from. Hover it for the date.' },
    { to: '#/dashboard', sel: '.card.hl', title: 'Best next upgrade', text: 'The top-ranked improvement you can act on now, with the reason it wins. "Add to plan" puts it in your Upgrade Planner.' },
    { to: '#/dashboard', sel: '.grid.g2 .card:nth-child(2)', title: 'Collect this data first', text: 'Screenshots that unlock much better advice. Start with Combat Stats and Skills.' },
    { to: '#/dashboard', sel: '#pickPlayer', title: 'Your character', text: 'Switch between your characters here, or open Manage characters to add one.' },
    { to: '#/dashboard', sel: '#helpBtn', title: 'Help, any time', text: 'Start this tour again, open the guide, or ask Ari, the sprite in the bottom corner, where something is.' },
    { to: '#/import', sel: '#impCat', title: 'Import a screenshot', text: 'Choose what the screenshot shows, pick the file and the date you took it. Without AI you type the values next to the image; with AI they are read for you.' },
    { to: '#/import', sel: '[data-act="imp-run"]', title: 'Review before saving', text: 'You always see the screenshot, your current value and the new value. Only ticked rows are saved, as a new snapshot.' },
    { to: '#/tiers', sel: '.tier', title: 'Stat tier lists', text: 'Which stats matter most for boss PvE, S+ on top, with your values next to them. Divine Stats and Core stats have their own tabs.' },
    { to: '#/characters', sel: '#charQ', title: 'Characters', text: 'Search your saved characters, add yours or someone to compare with. Find players on AionFlex and paste their profile link.' },
    { to: '#/compare', sel: '#view .card', title: 'Compare, when you want', text: 'Pick any saved character to see where you are ahead or behind. The rest of the tool looks only at you.' },
    { to: '#/planner', sel: '.card.hl', title: 'Upgrade Planner', text: 'Ranked recommendations, your plan with dependencies and materials, and your resources. "To Daily board" puts anything you need to grind on the Daily Board to-do list.' },
    { to: '#/progression', sel: '.card', title: 'Progression', text: 'Every snapshot over time. Compare any two to see exactly what improved.' },
    { to: '#/settings', sel: '#aiForm', title: 'Optional AI and backups', text: 'Use Claude or ChatGPT with your own key for automatic screenshot reading and the assistant. Export backups here; your data lives only in this browser.' },
    { to: '#/guide', sel: '.card.hl', title: 'That is it', text: 'Follow the setup checklist on this page. It ticks itself off as you go.' }
  ];
  var tourI = -1, pop = null, hl = null;
  function clearHl() { if (hl) { hl.classList.remove('tour-hl'); hl = null; } }
  function endTour() { clearHl(); if (pop) pop.remove(); pop = null; tourI = -1; g().tourDone = true; APP.save(); document.removeEventListener('keydown', tourKey); }
  function tourKey(ev) { if (ev.key === 'Escape') endTour(); else if (ev.key === 'ArrowRight') showStep(tourI + 1); else if (ev.key === 'ArrowLeft') showStep(tourI - 1); }
  function showStep(i) {
    if (i < 0) i = 0;
    if (i >= TOUR.length) return endTour();
    tourI = i; var s = TOUR[i];
    if (location.hash !== s.to) { location.hash = s.to; }
    else APP.render();
    setTimeout(function () {
      clearHl();
      var el = document.querySelector(s.sel);
      if (!pop) { pop = document.createElement('div'); pop.className = 'tour-pop'; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-live', 'polite'); document.body.appendChild(pop); }
      pop.innerHTML = '<div class="small muted">Step ' + (i + 1) + ' of ' + TOUR.length + '</div><h2 style="margin:4px 0 6px">' + e(s.title) + '</h2><div class="small">' + e(s.text) + '</div><div class="row" style="margin-top:12px"><button class="sm ghost" data-act="tour-end">Skip tour</button><span style="flex:1"></span>' + (i ? '<button class="sm" data-act="tour-prev">Back</button>' : '') + '<button class="sm pri" data-act="tour-next">' + (i === TOUR.length - 1 ? 'Finish' : 'Next') + '</button></div>';
      if (el) {
        hl = el; el.classList.add('tour-hl'); el.scrollIntoView({ block: 'center', behavior: 'smooth' });
        setTimeout(place, 320);
      } else place();
    }, 60);
  }
  function place() {
    if (!pop) return;
    var vw = innerWidth, vh = innerHeight, pw = Math.min(340, vw - 24);
    pop.style.width = pw + 'px';
    if (!hl || vw < 700) { pop.style.left = Math.round((vw - pw)/2) + 'px'; pop.style.top = ''; pop.style.bottom = '16px'; return; }
    var r = hl.getBoundingClientRect(), ph = pop.offsetHeight || 160, top = r.bottom + 12;
    if (top + ph > vh - 12) top = Math.max(12, r.top - ph - 12);
    var left = Math.min(Math.max(12, r.left), vw - pw - 12);
    pop.style.bottom = ''; pop.style.left = left + 'px'; pop.style.top = top + 'px';
  }
  addEventListener('resize', function () { if (tourI >= 0) place(); });
  APP.act('tour-start', function () { APP.closeDialog(); document.addEventListener('keydown', tourKey); showStep(0); });
  APP.act('tour-next', function () { showStep(tourI + 1); });
  APP.act('tour-prev', function () { showStep(tourI - 1); });
  APP.act('tour-end', function () { endTour(); });
  APP.act('welcome-skip', function () { APP.closeDialog(); location.hash = APP.state.characters.length ? '#/guide' : '#/setup'; });

  /* ------------------------------------------------------------------ send to the Daily Board to-do list */
  // The Daily Board (aion2.html) lives on the same site and keeps its state in localStorage "aion2_state".
  function boardState() { try { return JSON.parse(localStorage.getItem('aion2_state') || 'null'); } catch (x) { return null; } }
  APP.act('board-send', function (el) {
    var text = (el.getAttribute('data-text') || '').slice(0, 120), task = el.getAttribute('data-task') || '', b = boardState();
    var chars = b && Array.isArray(b.chars) && b.chars.length ? b.chars : null, p = APP.player();
    var pick = chars ? chars.filter(function (c) { return p && c.name && c.name.toLowerCase() === p.name.toLowerCase(); })[0] || chars.filter(function (c) { return c.main; })[0] || chars[0] : null;
    APP.dialog('Add to the Daily Board to-do', '<div class="small muted" style="margin-bottom:8px">It shows up under "My to-do" on the <a href="aion2.html" target="_blank" rel="noopener">Daily Board</a>, so you see it while you play.</div><div class="form"><div style="grid-column:1/-1"><label>To-do text</label><input name="text" value="' + e(text) + '" maxlength="120"></div>' +
      '<div><label>Board character</label>' + (chars ? '<select name="col">' + chars.map(function (c) { return '<option value="' + e(c.id) + '"' + (c === pick ? ' selected' : '') + '>' + e(c.name) + (c.main ? ' (main)' : '') + '</option>'; }).join('') + '</select>' : '<input disabled value="The Daily Board will create its main character">') + '</div></div>', [{ label: 'Add to Daily Board', cls: 'pri', act: 'board-do', data: { task: task } }]);
  });
  APP.act('board-do', function (el) {
    var o = APP.form(), txt = (o.text || '').trim().slice(0, 120); if (!txt) return APP.toast('Write something first.');
    var b = boardState() || {};
    if (!Array.isArray(b.chars) || !b.chars.length) b.chars = [{ id: 'c' + Math.random().toString(36).slice(2, 9), name: (APP.player() || {}).name || 'Main', main: true, color: '#7c8cff', notes: '', checks: {}, nightmare: { val: 2 }, shugo: { val: 4 }, todos: [], odyle: { val: 0, ts: Date.now() } }];
    var ch = b.chars.filter(function (c) { return c.id === o.col; })[0] || b.chars.filter(function (c) { return c.main; })[0] || b.chars[0];
    ch.todos = Array.isArray(ch.todos) ? ch.todos : [];
    if (ch.todos.some(function (t) { return !t.done && t.text === txt; })) { APP.closeDialog(); return APP.toast('Already on the Daily Board.'); }
    ch.todos.push({ id: 'c' + Math.random().toString(36).slice(2, 9), text: txt, done: false, from: 'Build Architect' });
    try { localStorage.setItem('aion2_state', JSON.stringify(b)); } catch (x) { return APP.toast('Could not write to the Daily Board storage.'); }
    var tid = el.getAttribute('data-task'), t = tid && APP.state.tasks.filter(function (x) { return x.id === tid; })[0];
    if (t) { t.onBoard = true; APP.save(); }
    APP.closeDialog(); APP.toast('Added to ' + ch.name + '\'s to-do on the Daily Board.'); APP.render();
  });

  /* ------------------------------------------------------------------ help menu (header) */
  APP.act('help-menu', function () {
    APP.dialog('Help', '<div class="grid g2"><button data-act="tour-start" class="pri">Take the guided tour</button><button data-act="go-guide">Open Start here</button><button data-act="sprite-open">Ask Ari where something is</button><button data-act="page-help">Explain this page</button></div><div class="small muted" style="margin-top:10px">You can start the tour any time from here. Ari, the little sprite in the corner, can point you to anything.</div>', []);
  });
  APP.act('go-guide', function () { APP.closeDialog(); location.hash = '#/guide'; });
  APP.act('page-help', function () { APP.closeDialog(); var d = document.querySelector('#view details.note'); if (d) { d.open = true; d.scrollIntoView({ block: 'center' }); } else APP.toast('This page has no extra help.'); });

  /* ------------------------------------------------------------------ Ari, the Aether Sprite: a small guide that points things out */
  // [title, keywords, route (or "tour" or a page), element to point at, what Ari says]
  var TOPICS = [
    ['Import a screenshot', 'import screenshot upload picture image photo', '#/import', '#impFile', 'Pick the screenshot type, choose the file and the date you took it. You check every value before it is saved.'],
    ['Record your Combat Stats', 'combat stats attack critical crit speed numbers', '#/import/combatStats', '#impCat', 'Screenshot the Combat Stats window in game and import it here. This unlocks most of the advice.'],
    ['Update skill levels', 'skills stigma skill level passive active', '#/import/skills', '#impCat', 'Import a Skills screenshot, or type the levels on Character > Skills.'],
    ['Type stats by hand', 'edit stats manual type enter', '#/character/stats', '[data-act="edit-stats"]', 'Click Edit combat stats and fill in what the game shows. Leave unknown ones empty.'],
    ['Stat tier list', 'tier list best stats priority s+ ranking meta', '#/tiers', '.tier', 'S+ is on top. Switch to the table view to sort or filter.'],
    ['Divine Stat priority', 'divine stats wisdom destruction time death priority order', '#/tiers/divine', '#view table', 'The order to collect Divine Stats in, with your current levels.'],
    ['Core stats what-if', 'core stats might precision dexterity reset redistribute what if', '#/character/core', '#whatif', 'Try a different spread here without touching your build.'],
    ['What should I upgrade next?', 'best next upgrade improve what do next recommendation', '#/dashboard', '.card.hl', 'This is the top-ranked improvement right now, with the reason why.'],
    ['My upgrade plan', 'plan planner task tasks upgrade progress complete', '#/planner', '[data-act="task-new"]', 'Add tasks, set what they depend on, and mark them done with what changed.'],
    ['Send something to the Daily Board', 'daily board to do todo grind farm list send', '#/planner', '[data-act="board-send"]', 'Use "To Daily board" on any recommendation or task. It appears under My to-do on the Daily Board.'],
    ['Compare with someone', 'compare other player someone versus vs benchmark', '#/compare', '#view .card', 'Pick any saved character. Comparing is only here, when you want it.'],
    ['Find or add a character', 'search character avatar player find add new switch', '#/characters', '#charQ', 'Search your saved characters, or add a new one with an AionFlex profile link.'],
    ['Find a player on AionFlex', 'aionflex profile link search player online', '#/characters', 'a[href*="aionflex.gg/search"]', 'Search on AionFlex, copy the profile link, then add the character here.'],
    ['Item details and stat lines', 'equipment item gear tooltip rolls manastone soul binding enhance', '#/equipment', '.slot', 'Click a slot to see or type the item and its stat lines.'],
    ['Is this item better than mine?', 'compare item weapon dagger better candidate', '#/equipment', '#cmpTool', 'Enter both tooltips here and see which stats go up or down.'],
    ['Pantheon collection', 'pantheon collection decoration statue artwork colossus', '#/pantheon', '#view .kpi', 'Track collected and displayed pieces and their Divine Stat effects.'],
    ['Arcana', 'arcana chalice bell mirror compass', '#/character/arcana', '#view .card', 'Record your Arcana here, or confirm you have none yet.'],
    ['Daevanion boards', 'daevanion board nodes nezekan zikel vaizel triniel azphel', '#/character/daevanion', '#view .card', 'Board percentages and a node route once you add nodes.'],
    ['See my progress', 'progress history improvement snapshot chart before after', '#/progression', '#view .card', 'Every save is a snapshot. Compare any two here.'],
    ['Log a DPS run', 'dps meter boss run damage log parse', '#/dps', '[data-act="dps-new"]', 'Log a run per boss; only same-boss runs are compared.'],
    ['Save a source or finding', 'research source patch notes guide finding', '#/research', '[data-act="res-add"]', 'Keep what you learn with its source and how fresh it is.'],
    ['Set up AI (Claude or ChatGPT)', 'ai key chatgpt claude openai anthropic gpt model', '#/settings', '#aiForm', 'Pick a provider, paste your own key, enable AI. Optional.'],
    ['Ask the assistant', 'assistant ask question chat ai help', '#/assistant', '#chatIn', 'Ask about your build. It reads your saved data and asks before changing anything.'],
    ['Back up my data', 'export backup save download restore move device', '#/settings', '[data-act="dl-json"]', 'Your data lives in this browser. Export it here; restore on Import > JSON.'],
    ['Change the theme', 'theme dark light pixel colors look style', null, '#themePick', 'Pick Aion, Paper, Lamp, Slate, Mist or Pixel. The same themes as the Daily Board.'],
    ['What do the labels mean?', 'imported confirmed verified outdated status label pill meaning', '#/guide', '#view table', 'Verified = seen in game, Confirmed = entered by you, Imported = from a profile site and maybe stale.'],
    ['Sort or filter a table', 'sort filter order table column', '#/character/stats', '.tfilter', 'Click a column header to sort; S+ comes first. Use the filter box to narrow it down.'],
    ['Titles, pet and wings', 'titles pet wings collection', '#/character/more', '#view .card', 'Record titles, pet and wings here.'],
    ['Take the guided tour', 'tour tutorial guide help start learn', 'tour', null, 'Let me start the tour for you.'],
    ['Open the Daily Board', 'daily board timers dailies weekly shugo', 'aion2.html', null, 'The Daily Board has your timers, dailies and to-do list.'],
    ['Back to the arcade', 'arcade home main site', 'index.html', null, 'The arcade is the front door of the site.'],
    ['Jordi\'s portfolio', 'portfolio jordi projects about', 'portfolio.html', null, 'Projects and the story behind them.']
  ];
  function score(t, q) {
    var words = q.toLowerCase().split(/[^a-z0-9+]+/).filter(function (w) { return w.length > 1; }), hay = (t[0] + ' ' + t[1]).toLowerCase(), s = 0;
    words.forEach(function (w) { if (hay.indexOf(w) >= 0) s += (hay.indexOf(' ' + w) >= 0 || hay.indexOf(w) === 0) ? 2 : 1; });
    return s;
  }
  var SPRITE = '<svg viewBox="0 0 64 64" aria-hidden="true"><defs><radialGradient id="ariG" cx="50%" cy="40%" r="60%"><stop offset="0" stop-color="#fff8d6"/><stop offset=".5" stop-color="#ffd24f"/><stop offset="1" stop-color="#c98a1a"/></radialGradient></defs>' +
    '<path d="M14 30c-8-6-10-14-6-18 6 2 10 8 12 14z" fill="#8dd8ff" opacity=".85"/><path d="M50 30c8-6 10-14 6-18-6 2-10 8-12 14z" fill="#8dd8ff" opacity=".85"/>' +
    '<path d="M32 6 46 30 32 54 18 30z" fill="url(#ariG)" stroke="#fff3b8" stroke-width="1.5"/><path d="M32 6 39 30 32 54" fill="none" stroke="#fff8e0" stroke-width="1" opacity=".6"/>' +
    '<circle cx="27" cy="29" r="2.6" fill="#2a1d0a"/><circle cx="37" cy="29" r="2.6" fill="#2a1d0a"/><circle cx="27.8" cy="28.2" r=".9" fill="#fff"/><circle cx="37.8" cy="28.2" r=".9" fill="#fff"/>' +
    '<path d="M28 35q4 3 8 0" fill="none" stroke="#2a1d0a" stroke-width="1.6" stroke-linecap="round"/><circle cx="23" cy="34" r="2" fill="#ff9a8a" opacity=".6"/><circle cx="41" cy="34" r="2" fill="#ff9a8a" opacity=".6"/>' +
    '<path d="M52 8l1.5 3.5L57 13l-3.5 1.5L52 18l-1.5-3.5L47 13l3.5-1.5z" fill="#fff3b8"/></svg>';
  var ari = document.createElement('div');
  ari.id = 'ari';
  ari.innerHTML = '<div class="ari-panel" hidden role="dialog" aria-label="Ari, your guide"><div class="row" style="flex-wrap:nowrap"><b>Ari</b><span class="small muted">Aether Sprite, your guide</span><span style="flex:1"></span><button class="sm ghost" data-act="sprite-close" aria-label="Close">Close</button></div><div class="ari-say small" id="ariSay"></div><input id="ariQ" placeholder="What are you looking for?" autocomplete="off"><div id="ariRes"></div></div>' +
    '<div class="ari-bubble" hidden id="ariBubble"></div><button class="ari-btn" data-act="sprite-toggle" aria-label="Ask Ari for help" title="Ask Ari where something is">' + SPRITE + '</button>';
  document.body.appendChild(ari);
  var panel = ari.querySelector('.ari-panel'), say = ari.querySelector('#ariSay'), qi = ari.querySelector('#ariQ'), res = ari.querySelector('#ariRes'), bubble = ari.querySelector('#ariBubble');
  function pageName() { return (location.hash || '#/dashboard').replace(/^#\/?/, '').split('/')[0] || 'dashboard'; }
  function greet() {
    var tip = HELP[pageName()];
    say.innerHTML = 'Hi Daeva! ' + (tip ? '<b>On this page:</b> ' + e(tip) : 'Ask me where anything is.');
    qi.value = ''; renderRes('');
  }
  function renderRes(q) {
    var list = q ? TOPICS.map(function (t) { return { t: t, s: score(t, q) }; }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 6).map(function (x) { return x.t; })
      : [TOPICS[0], TOPICS[7], TOPICS[4], TOPICS[9], TOPICS[10], TOPICS[28]];
    res.innerHTML = (q && !list.length ? '<div class="small muted" style="margin-top:6px">I do not know that one yet. Try other words, or open <a href="#/guide">Start here</a>.</div>' : '') +
      list.map(function (t) { return '<button class="ari-item" data-act="sprite-go" data-i="' + TOPICS.indexOf(t) + '">' + e(t[0]) + '</button>'; }).join('');
  }
  function openAri() { panel.hidden = false; bubble.hidden = true; greet(); setTimeout(function () { qi.focus(); }, 30); }
  function closeAri() { panel.hidden = true; }
  APP.act('sprite-toggle', function () { if (panel.hidden) openAri(); else closeAri(); });
  APP.act('sprite-open', function () { APP.closeDialog(); openAri(); });
  APP.act('sprite-close', closeAri);
  qi.addEventListener('input', function () { renderRes(qi.value.trim()); });
  qi.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { var first = res.querySelector('.ari-item'); if (first) first.click(); } else if (ev.key === 'Escape') closeAri(); });
  var pointed = null;
  function point(sel, text) {
    setTimeout(function () {
      if (pointed) pointed.classList.remove('tour-hl');
      var el = document.querySelector(sel);
      if (!el) { say.innerHTML = e(text) + ' <span class="muted">(I could not find it on this page right now.)</span>'; return; }
      el.classList.add('tour-hl'); pointed = el; el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      say.innerHTML = '<b>Here it is!</b> ' + e(text);
      setTimeout(function () { if (pointed === el) { el.classList.remove('tour-hl'); pointed = null; } }, 4500);
    }, 160);
  }
  APP.act('sprite-go', function (el) {
    var t = TOPICS[+el.getAttribute('data-i')]; if (!t) return;
    if (t[2] === 'tour') { closeAri(); APP.acts['tour-start'](); return; }
    if (t[2] && !/^#/.test(t[2])) { location.href = t[2]; return; }
    if (t[2] && location.hash !== t[2]) location.hash = t[2];
    point(t[3], t[4]);
  });
  // one friendly nudge per visit, after a quiet moment
  try {
    if (!sessionStorage.getItem('ari_hi')) {
      sessionStorage.setItem('ari_hi', '1');
      setTimeout(function () { if (panel.hidden && tourI < 0 && !document.getElementById('dlg').open) { bubble.textContent = 'Lost? Ask me where anything is.'; bubble.hidden = false; setTimeout(function () { bubble.hidden = true; }, 6000); } }, 9000);
    }
  } catch (x) {}

  /* ------------------------------------------------------------------ first visit */
  APP.start();
  if (!g().welcomed) {
    g().welcomed = true; APP.save();
    var none = !APP.state.characters.length;
    APP.dialog('Welcome to the Build Architect', '<div style="display:flex;gap:12px;align-items:flex-start"><div style="width:56px;flex:none">' + SPRITE + '</div><div><div>Hi Daeva, I am <b>Ari</b>. This tool helps you see what to improve on your AION 2 character: gear, stats, Divine Stats, Pantheon and more, with a plan for what to do next.</div><div style="margin-top:8px">' + (none ? 'Start by setting up your character. ' : '') + 'A 1-minute tour shows where everything is. You can restart it any time under <b>Help</b>, and I sit in the corner if you need to find something.</div></div></div>',
      [{ label: 'Take the 1-minute tour', cls: 'pri', act: 'tour-start' }, { label: none ? 'Set up my character' : 'Show me the checklist', act: 'welcome-skip' }]);
  }
})();
