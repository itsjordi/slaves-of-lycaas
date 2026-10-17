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
        text: 'Your CP, Item Level, the gap to Novin and the Best next upgrade. Hover a status pill to see where a number came from and how old it is.' },
      { id: 'stats', title: 'Import your Combat Stats', time: '3 min', to: '#/import/combatStats', done: Object.keys(d.combatStats || {}).length > 0,
        text: 'Open the Combat Stats window in game, take a screenshot, and import it. This is the single biggest improvement: without stats the advice can only compare item names and + levels.' },
      { id: 'skills', title: 'Import your current skill levels', time: '3 min', to: '#/import/skills', done: !d.skills.needsRefresh,
        text: 'Your AionFlex skill levels were outdated, so skills are ignored until you add a current screenshot of the Skills window (active, passive and Stigmas).' },
      { id: 'weapon', title: 'Record your weapon tooltip', time: '2 min', to: '#/equipment', done: (main.base.length + main.rolls.length) > 0,
        text: 'Click Main-hand on the Equipment page and type the stat lines from the tooltip (Stat: value). Then the item comparison can answer "is this dagger better than mine".' },
      { id: 'tiers', title: 'Learn the stat priorities', time: '2 min', to: '#/tiers', done: !!gg.visited.tiers,
        text: 'The Tier lists page shows which stats matter most for boss PvE (S+ on top), the Divine Stat collection order and the Core Stat guide. All provisional, all editable.' },
      { id: 'compare', title: 'Compare with Novin', time: '2 min', to: '#/compare', done: !!gg.visited.compare,
        text: 'See where you are ahead, where Novin is ahead, which systems you do not use yet (Arcana) and what is still unknown.' },
      { id: 'plan', title: 'Put an upgrade in your plan', time: '1 min', to: '#/planner', done: s.tasks.length > 0,
        text: 'Click "Add to plan" on the Best next upgrade. Mark it completed when done and write what changed.' },
      { id: 'dps', title: 'Log a DPS run', time: '2 min', to: '#/dps', done: (s.dps || []).length > 0,
        text: 'Measured DPS beats every estimate. Log one boss run now and the same boss again after an upgrade.' },
      { id: 'titles', title: 'Record your title count', time: '1 min', to: '#/character/more', done: d.titles.unlocked != null,
        text: 'Novin has 212/297 titles. Your count might explain part of the CP gap.' },
      { id: 'backup', title: 'Export a backup', time: '30 s', to: '#/settings', done: !!gg.exported,
        text: 'Your data lives only in this browser. Export once now and after big updates.' },
      { id: 'ai', title: 'Optional: set up AI', time: '3 min', to: '#/settings', done: APP.aiReady(), optional: true,
        text: 'With your own Anthropic key, screenshots are read automatically and you can ask the assistant questions like "why does Novin have 21k more CP?".' }
    ];
  }

  /* ------------------------------------------------------------------ the guide page */
  var GLOSSARY = [
    ['Combat Power (CP)', 'The game\'s overall power number. Useful, but higher CP does not prove higher boss DPS.'],
    ['Item Level', 'Average level of your gear. Tracked per snapshot.'],
    ['Divine Stats', 'Ten stats (Justice, Freedom, Illusion, Life, Time, Destruction, Death, Wisdom, Destiny, Space), each giving two effects. Raised mainly through Pantheon.'],
    ['Sum of displayed levels', 'The ten Divine Stat levels added up (68 vs 303). Our own analytic number, not an official stat.'],
    ['Pantheon', 'Collection of artwork, statues and colossi. Displayed decorations give Divine Stat effects.'],
    ['Daevanion', 'Five boards (Nezekan, Zikel, Vaizel, Triniel, Azphel). Completion % is not the same as damage.'],
    ['Arcana', 'A separate equipment system. You have none equipped yet; Novin has four.'],
    ['Soul Binding / Manastones', 'Extra stat lines on items. They decide which item is better far more than rarity does.'],
    ['Stigma', 'Special skills, tracked with the other skills.'],
    ['Back Attack vs Back Attack Damage Boost', 'Flat attack from behind vs a percentage damage boost from behind. Different stats.'],
    ['Snapshot', 'A frozen copy of your character at one moment. Every save makes a new one; old ones never change.'],
    ['Benchmark', 'The character you compare against (Novin by default). Historical unless refreshed.'],
    ['Status pill', 'Where a value came from: Verified (seen in game), Confirmed (you entered it), Imported (AionFlex), Estimated, Outdated or Unknown.'],
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
    ['Where do the tier lists come from?', 'From your earlier discussion about Assassin PvE. They are hypotheses, not formulas. Change them on Tier lists > Edit ranking when testing shows otherwise.'],
    ['Can I sort and filter tables?', 'Yes. Click any column header to sort (tiers sort S+ first) and use the filter box above longer tables.']
  ];
  APP.view('guide', { title: 'Start here', icon: 'ai', group: 'Start', render: function () {
    var st = steps(), req = st.filter(function (x) { return !x.optional; }), done = req.filter(function (x) { return x.done; }).length, next = st.filter(function (x) { return !x.done; })[0];
    var h = '<div class="head"><div><h1>Start here</h1><div class="muted">Everything you need to get useful advice out of the Build Architect, in order.</div></div><span class="sp"></span><button class="pri" data-act="tour-start">Take the guided tour</button></div>';
    h += '<div class="grid g2"><div class="card hl"><h2>What this tool does</h2><div class="small">It keeps a history of your character, compares you with another Assassin, and ranks what to improve next for boss PvE damage. Every recommendation tells you <b>what</b> to do, <b>why</b>, what it <b>costs</b>, how <b>confident</b> it is, and what to do <b>next</b>. It never invents numbers: what is not known shows as Unknown.</div>' +
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
    dashboard: 'Top row: your numbers and the gap to your benchmark. "Best next upgrade" is the highest ranked improvement you can act on now; "Collect this data first" lists screenshots that unlock better advice. Hover any status pill for the source and date.',
    character: 'Tabs for every part of your character. Each "Edit" saves a new snapshot with the date you saw the values. Core stats has a what-if tool; Daevanion lets you add nodes for a route suggestion.',
    equipment: 'Click a slot to see or edit the item, including stat lines (Stat: value per line). Below the grid, compare your item with a candidate; it shows which stats go up or down and leans by tier, without pretending to calculate DPS.',
    compare: 'Pick any two characters and snapshots. The lists split differences into advantages, disadvantages, missing systems, DPS-relevant and CP-relevant parts. Unknowns tell you what to record before trusting a conclusion.',
    planner: 'Recommendations are ranked by labelled dimensions. Change the ranking mode at the top right. Add items to your plan, set dependencies and materials, track resources, and mark tasks completed with what actually changed.',
    pantheon: 'Track your collection and decorations. Display effects are kept apart from Divine Stats on purpose. Mark collectibles as owned, displayed or farming, and filter by Divine Stat.',
    progression: 'Charts and a table of every snapshot. Pick two snapshots to see exactly what changed.',
    dps: 'Log DPS-meter results per boss. Runs are only compared with runs on the same boss.',
    tiers: 'S+ is on top. Switch the mode, view as cards or a sortable table, and edit the ranking when testing says otherwise.',
    research: 'Store what you learn with its source, date and confidence. Mark findings reviewed or outdated so old guides do not mislead you.',
    import: 'Upload screenshots (or paste text, JSON, CSV). Nothing is saved until you confirm in the review screen; unreadable or conflicting values start unticked.',
    assistant: 'Ask questions about your build. The assistant reads your confirmed data; any change it suggests waits for your approval.',
    settings: 'Optional AI key, exports and backups, and reset.'
  };
  function addHelp(name) {
    var head = document.querySelector('#view .head'); if (!head || !HELP[name] || name === 'guide') return;
    var dd = document.createElement('details'); dd.className = 'note info small'; dd.style.marginTop = '-6px';
    dd.innerHTML = '<summary style="cursor:pointer"><b>How this page works</b></summary><div style="margin-top:6px">' + e(HELP[name]) + ' <a href="#/guide">Full guide</a> &middot; <a href="#" data-act="tour-start">Tour</a></div>';
    head.parentNode.insertBefore(dd, head.nextSibling);
  }

  /* ------------------------------------------------------------------ interactive tour */
  var TOUR = [
    { to: '#/dashboard', sel: '.kpi', title: 'Your numbers', text: 'Combat Power, Item Level, DPS and the gap to Novin. The small pill tells you where each number came from. Hover it for the date.' },
    { to: '#/dashboard', sel: '.card.hl', title: 'Best next upgrade', text: 'The top-ranked improvement you can act on now, with the reason it wins. "Add to plan" puts it in your Upgrade Planner.' },
    { to: '#/dashboard', sel: '.grid.g2 .card:nth-child(2)', title: 'Collect this data first', text: 'Screenshots that unlock much better advice. Start with Combat Stats and Skills.' },
    { to: '#/dashboard', sel: '#pickPlayer', title: 'Who you are, who you compare with', text: 'Switch your character and the benchmark here. Every page follows this choice.' },
    { to: '#/import', sel: '#impCat', title: 'Import a screenshot', text: 'Choose what the screenshot shows, pick the file and the date you took it. Without AI you type the values next to the image; with AI they are read for you.' },
    { to: '#/import', sel: '[data-act="imp-run"]', title: 'Review before saving', text: 'You always see the screenshot, your current value and the new value. Only ticked rows are saved, as a new snapshot.' },
    { to: '#/tiers', sel: '.tier', title: 'Stat tier lists', text: 'Which stats matter most for boss PvE, S+ on top, with your values next to them. Divine Stats and Core stats have their own tabs.' },
    { to: '#/compare', sel: '#cmpSel', title: 'Compare', text: 'Any two characters or snapshots. Scroll down for advantages, disadvantages, missing systems and a catch-up plan.' },
    { to: '#/planner', sel: '.card.hl', title: 'Upgrade Planner', text: 'Ranked recommendations, your plan with dependencies and materials, and your resources. Change the ranking mode to see other orders.' },
    { to: '#/progression', sel: '.card', title: 'Progression', text: 'Every snapshot over time. Compare any two to see exactly what improved.' },
    { to: '#/settings', sel: '#aiForm', title: 'Optional AI and backups', text: 'Add your own Anthropic key for automatic screenshot reading and the assistant. Export backups here; your data lives only in this browser.' },
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
  APP.act('welcome-skip', function () { APP.closeDialog(); location.hash = '#/guide'; });

  /* ------------------------------------------------------------------ first visit */
  APP.start();
  if (!g().welcomed) {
    g().welcomed = true; APP.save();
    APP.dialog('Welcome to the Build Architect', '<div>Your character <b>lycaa</b> and the benchmark <b>Novin</b> are already loaded from AionFlex (2026-10-17).</div><div style="margin-top:8px">The tool works best once it has your current Combat Stats and skill levels. A 1-minute tour shows where everything is; the <b>Start here</b> page has a checklist that ticks itself off.</div>',
      [{ label: 'Take the 1-minute tour', cls: 'pri', act: 'tour-start' }, { label: 'Show me the checklist', act: 'welcome-skip' }]);
  }
})();
