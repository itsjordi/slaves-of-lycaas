/* AION 2 Build Architect - core.
   Pure data, catalogs, calculations and engines. No DOM access, so the same file runs in the
   browser (window.BA) and in Node for the tests (require('./core.js')).
   Rule of the house: never invent numbers. Unknown stays "Unknown", provisional stays labelled. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BA = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var SCHEMA_VERSION = 1;
  var APP_ID = 'aion2-build-architect';

  /* ------------------------------------------------------------------ provenance */
  // status of an observed value
  var STATUS = {
    verified: { label: 'Verified in-game', rank: 5 },
    confirmed: { label: 'User-confirmed', rank: 4 },
    imported: { label: 'Imported from external source', rank: 3 },
    estimated: { label: 'Estimated', rank: 2 },
    outdated: { label: 'Outdated', rank: 1 },
    unknown: { label: 'Unknown', rank: 0 }
  };
  function meta(status, source, observedAt, extra) {
    var m = { status: status || 'unknown', source: source || 'manual', observedAt: observedAt || null, importedAt: new Date().toISOString() };
    if (extra) for (var k in extra) m[k] = extra[k];
    return m;
  }
  function fv(value, m) { return { v: value, m: m }; }
  function val(x) { return x && typeof x === 'object' && 'v' in x ? x.v : x; }

  /* ------------------------------------------------------------------ catalogs */
  var CATEGORIES = { offensive: 'Offensive', defensive: 'Defensive', utility: 'Utility' };
  function S(id, name, cat, unit, desc, alt) {
    return {
      id: id, name: name, alt: alt || [], category: cat, unit: unit, description: desc,
      region: 'Global', patch: null, calculation: 'Unknown', cap: 'Unknown',
      sources: ['In-game stat list (names only)'], references: [], confidence: 'Low'
    };
  }
  var STAT_CATALOG = [
    S('attack', 'Attack', 'offensive', 'flat', 'Flat attack value. Not the same as Attack Increase (%).', ['atk']),
    S('attack_bonus', 'Attack Bonus', 'offensive', 'flat', 'Bonus attack shown separately from base Attack. Do not assume it equals base Attack.'),
    S('attack_increase', 'Attack Increase', 'offensive', '%', 'Percentage increase to attack. Exact stacking with flat Attack is not verified.', ['attack increase %']),
    S('max_attack', 'Max Attack', 'offensive', 'flat', 'Upper end of the attack range.'),
    S('weapon_damage_boost', 'Weapon Damage Boost', 'offensive', '%', 'Damage boost tied to weapon damage. Formula not verified.'),
    S('damage_boost', 'Damage Boost', 'offensive', '%', 'General damage boost. Formula not verified.'),
    S('pve_attack', 'PvE Attack', 'offensive', 'flat', 'Attack that only applies against monsters.'),
    S('pve_damage_boost', 'PvE Damage Boost', 'offensive', '%', 'Damage boost against monsters.'),
    S('boss_attack', 'Boss Attack', 'offensive', 'flat', 'Attack that only applies against bosses.'),
    S('boss_damage_boost', 'Boss Damage Boost', 'offensive', '%', 'Damage boost against bosses.'),
    S('critical_hit', 'Critical Hit', 'offensive', 'rating', 'Critical rating. Not necessarily the displayed final critical chance.', ['crit', 'critical']),
    S('critical_attack', 'Critical Attack', 'offensive', 'flat', 'Extra attack applied on critical hits.'),
    S('critical_damage_boost', 'Critical Damage Boost', 'offensive', '%', 'Increases critical damage. Cap not verified.'),
    S('combat_speed', 'Combat Speed', 'offensive', '%', 'Faster attacks and skills. Scaling not verified.', ['attack speed']),
    S('double_chance', 'Double Chance', 'offensive', '%', 'Chance for a double hit. Interactions not verified.', ['double hit']),
    S('smite', 'Smite', 'offensive', 'rating', 'Smite rating. Mechanic details not verified.'),
    S('back_attack', 'Back Attack', 'offensive', 'flat', 'Attack from behind. Not the same as Back Attack Damage Boost.'),
    S('back_attack_damage_boost', 'Back Attack Damage Boost', 'offensive', '%', 'Damage boost when hitting from behind.'),
    S('perfect_chance', 'Perfect Chance', 'offensive', '%', 'Chance for a perfect hit. Mechanic details not verified.'),
    S('accuracy', 'Accuracy', 'offensive', 'rating', 'Reduces misses. Thresholds not verified.'),
    S('cooldown_reduction', 'Cooldown Reduction', 'offensive', '%', 'Shorter skill cooldowns. Cap not verified.', ['cdr']),
    S('endurance_penetration', 'Endurance Penetration', 'offensive', 'rating', 'Counters Endurance.'),
    S('regeneration_penetration', 'Regeneration Penetration', 'offensive', 'rating', 'Counters Regeneration.'),
    S('defense', 'Defense', 'defensive', 'flat', 'Flat defense.'),
    S('defense_bonus', 'Defense Bonus', 'defensive', 'flat', 'Bonus defense shown separately.'),
    S('defense_increase', 'Defense Increase', 'defensive', '%', 'Percentage increase to defense.'),
    S('hp', 'HP', 'defensive', 'flat', 'Health points.'),
    S('hp_increase', 'HP Increase', 'defensive', '%', 'Percentage increase to HP.'),
    S('mp', 'MP', 'defensive', 'flat', 'Mana points.'),
    S('mp_increase', 'MP Increase', 'defensive', '%', 'Percentage increase to MP.'),
    S('evasion', 'Evasion', 'defensive', 'rating', 'Chance to evade.'),
    S('block', 'Block', 'defensive', 'rating', 'Chance to block.'),
    S('critical_hit_resist', 'Critical Hit Resist', 'defensive', 'rating', 'Resists incoming critical hits.'),
    S('perfect_resist', 'Perfect Resist', 'defensive', 'rating', 'Resists incoming perfect hits.'),
    S('double_resist', 'Double Resist', 'defensive', 'rating', 'Resists incoming double hits.'),
    S('damage_tolerance', 'Damage Tolerance', 'defensive', '%', 'Reduces incoming damage.'),
    S('endurance', 'Endurance', 'defensive', 'rating', 'Defensive rating countered by Endurance Penetration.'),
    S('regeneration', 'Regeneration', 'defensive', 'rating', 'Defensive rating countered by Regeneration Penetration.'),
    S('status_effect_resist', 'Status Effect Resist', 'defensive', 'rating', 'Resists status effects.'),
    S('status_effect_chance', 'Status Effect Chance', 'defensive', 'rating', 'Chance to apply status effects.'),
    S('movement_speed', 'Movement Speed', 'utility', '%', 'Movement speed.'),
    S('stamina', 'Stamina', 'utility', 'flat', 'Stamina.'),
    S('mp_cost_reduction', 'MP Cost Reduction', 'utility', '%', 'Reduces MP cost of skills.')
  ];
  var STAT_BY_ID = {};
  STAT_CATALOG.forEach(function (s) { STAT_BY_ID[s.id] = s; });
  function normName(s) { return String(s || '').toLowerCase().replace(/[%()]/g, '').replace(/\s+/g, ' ').trim(); }
  // map a displayed stat name to a catalog id, exact name or alternate name only
  function statIdFor(name) {
    var n = normName(name);
    for (var i = 0; i < STAT_CATALOG.length; i++) {
      var s = STAT_CATALOG[i];
      if (normName(s.name) === n) return s.id;
      for (var j = 0; j < s.alt.length; j++) if (normName(s.alt[j]) === n) return s.id;
    }
    return null;
  }

  // provisional, editable. Historical discussion-based hypotheses, not a damage formula.
  var TIER_ORDER = ['S+', 'S', 'A+', 'A', 'B', 'C'];
  var STAT_TIERS_BOSS = [
    { tier: 'S+', stats: ['combat_speed', 'critical_hit', 'attack_increase', 'smite'], why: 'More hits per second, more crits, a broad multiplier, and Smite were the stats the earlier discussion valued most for single-target uptime.' },
    { tier: 'S', stats: ['back_attack_damage_boost', 'pve_damage_boost', 'double_chance', 'weapon_damage_boost', 'damage_boost'], why: 'Damage multipliers that Assassins can keep active on bosses, especially when positioned behind them.' },
    { tier: 'A+', stats: ['back_attack', 'attack', 'max_attack'], why: 'Flat damage sources. Useful, but usually weaker than multipliers once those are available.' },
    { tier: 'A', stats: ['critical_damage_boost', 'boss_damage_boost', 'attack_bonus', 'cooldown_reduction', 'accuracy', 'critical_attack'], why: 'Good secondary stats. Their value depends on crit rate, accuracy thresholds and cooldown caps, none of which are verified yet.' },
    { tier: 'B', stats: ['perfect_chance', 'pve_attack', 'boss_attack'], why: 'Situational or small flat values.' },
    { tier: 'C', stats: ['evasion', 'block', 'critical_hit_resist', 'status_effect_resist', 'mp', 'defense', 'hp'], why: 'Mostly defensive. Little direct DPS value.' }
  ];
  var MODES = {
    boss: { label: 'Boss PvE', tiers: STAT_TIERS_BOSS, note: 'Provisional ranking from earlier discussion. Not a verified formula.' },
    dungeon: { label: 'Dungeon AoE', tiers: null, note: 'No ranking defined yet. Starts as a copy of Boss PvE; edit it once AoE testing exists.' },
    solo: { label: 'Solo PvE', tiers: null, note: 'No ranking defined yet. Starts as a copy of Boss PvE.' },
    pvp: { label: 'PvP (future)', tiers: null, note: 'Not supported yet.' }
  };
  // default ranking exists for Assassin only; other classes start empty until the player builds one
  function tierKey(mode, cls) { return !cls || cls === 'Assassin' ? mode : cls + ':' + mode; }
  function tiersFor(mode, custom, cls) {
    var k = tierKey(mode, cls);
    if (custom && custom[k]) return custom[k];
    if (cls && cls !== 'Assassin') return TIER_ORDER.map(function (t) { return { tier: t, stats: [], why: '' }; });
    return MODES[mode] && MODES[mode].tiers ? MODES[mode].tiers : STAT_TIERS_BOSS;
  }
  function tierOf(statId, tiers) {
    tiers = tiers || STAT_TIERS_BOSS;
    for (var i = 0; i < tiers.length; i++) if (tiers[i].stats.indexOf(statId) >= 0) return tiers[i].tier;
    return null;
  }
  function tierWeight(t) { var i = TIER_ORDER.indexOf(t); return i < 0 ? 0 : TIER_ORDER.length - i; }

  var CORE_STATS = [
    { id: 'might', name: 'Might', effects: ['Attack Increase'] },
    { id: 'dexterity', name: 'Dexterity', effects: ['Evasion', 'Block', 'Critical Hit Resist'] },
    { id: 'intelligence', name: 'Intelligence', effects: ['Status Effect Chance'] },
    { id: 'constitution', name: 'Constitution', effects: ['HP Increase'] },
    { id: 'precision', name: 'Precision', effects: ['Accuracy Increase', 'Critical Hit Increase'] },
    { id: 'willpower', name: 'Willpower', effects: ['Status Effect Resist'] }
  ];
  var DIVINE = [
    { id: 'justice', name: 'Justice', effects: ['Defense Increase', 'Perfect Chance'] },
    { id: 'freedom', name: 'Freedom', effects: ['Accuracy Increase', 'Evasion Increase'] },
    { id: 'illusion', name: 'Illusion', effects: ['Cooldown Reduction', 'Endurance Penetration'] },
    { id: 'life', name: 'Life', effects: ['HP Increase', 'Regeneration'] },
    { id: 'time', name: 'Time', effects: ['Combat Speed', 'Double Resist'] },
    { id: 'destruction', name: 'Destruction', effects: ['Attack Increase', 'Perfect Resist'] },
    { id: 'death', name: 'Death', effects: ['Critical Hit Increase', 'Regeneration Penetration'] },
    { id: 'wisdom', name: 'Wisdom', effects: ['MP Cost Reduction', 'Double Chance'] },
    { id: 'destiny', name: 'Destiny', effects: ['MP Increase', 'Endurance'] },
    { id: 'space', name: 'Space', effects: ['Movement Speed', 'Block Increase'] }
  ];
  // collection-targeting hypothesis for Assassin PvE
  var DIVINE_PRIORITY = ['wisdom', 'destruction', 'illusion', 'time', 'death', 'freedom', 'justice', 'space', 'life', 'destiny'];
  var DAEVANION = [
    { id: 'nezekan', name: 'Nezekan' }, { id: 'zikel', name: 'Zikel' }, { id: 'vaizel', name: 'Vaizel' },
    { id: 'triniel', name: 'Triniel' }, { id: 'azphel', name: 'Azphel' }
  ];

  var SLOTS = [
    { id: 'main_hand', name: 'Main-hand', group: 'weapon' }, { id: 'off_hand', name: 'Off-hand', group: 'weapon' },
    { id: 'helmet', name: 'Helmet', group: 'armor' }, { id: 'torso', name: 'Torso', group: 'armor' },
    { id: 'shoulders', name: 'Shoulders', group: 'armor' }, { id: 'gloves', name: 'Gloves', group: 'armor' },
    { id: 'pants', name: 'Pants', group: 'armor' }, { id: 'boots', name: 'Boots', group: 'armor' },
    { id: 'cape', name: 'Cape', group: 'armor' }, { id: 'belt', name: 'Belt', group: 'armor' },
    { id: 'necklace', name: 'Necklace', group: 'accessory' }, { id: 'earring_1', name: 'Earring 1', group: 'accessory' },
    { id: 'earring_2', name: 'Earring 2', group: 'accessory' }, { id: 'ring_1', name: 'Ring 1', group: 'accessory' },
    { id: 'ring_2', name: 'Ring 2', group: 'accessory' }, { id: 'bracelet_1', name: 'Bracelet 1', group: 'accessory' },
    { id: 'bracelet_2', name: 'Bracelet 2', group: 'accessory' }, { id: 'amulet', name: 'Amulet', group: 'accessory' },
    { id: 'rune_1', name: 'Rune 1', group: 'rune' }, { id: 'rune_2', name: 'Rune 2', group: 'rune' }
  ];
  var SLOT_BY_ID = {}; SLOTS.forEach(function (s) { SLOT_BY_ID[s.id] = s; });
  var SLOT_ALIASES = {
    main_hand: ['main hand', 'mainhand', 'weapon', 'main-hand'], off_hand: ['off hand', 'offhand', 'off-hand', 'guard'],
    helmet: ['helm', 'head'], torso: ['chest', 'breastplate', 'body'], shoulders: ['pauldrons', 'shoulder'],
    gloves: ['hands', 'gauntlets'], pants: ['greaves', 'legs', 'leggings'], boots: ['feet', 'shoes'],
    cape: ['cloak'], belt: ['waist'], necklace: ['neck'], earring_1: ['earring', 'earrings', 'earring 1'],
    earring_2: ['earring 2'], ring_1: ['ring', 'ring 1'], ring_2: ['ring 2'], bracelet_1: ['bracelet', 'bracelet 1'],
    bracelet_2: ['bracelet 2'], amulet: ['amulet'], rune_1: ['rune', 'rune 1'], rune_2: ['rune 2']
  };
  function slotIdFor(name) {
    var n = normName(name).replace(/_/g, ' ');
    if (SLOT_BY_ID[n.replace(/ /g, '_')]) return n.replace(/ /g, '_');
    for (var id in SLOT_ALIASES) if (normName(SLOT_BY_ID[id].name) === n || SLOT_ALIASES[id].indexOf(n) >= 0) return id;
    return null;
  }

  var SKILLS = {
    active: ['Quick Slice', 'Savage Roar', 'Shadowstrike', 'Ambush', 'Heart Gore', 'Storm Rampage', 'Whirlwind Slice', 'Flash Slice', 'Infiltrate', 'Shadow Fall', 'Insignia Explosion', 'Defiance'],
    passive: ['Heightened Sixth Sense', 'Exploit Weakness', 'Apply Poison', 'Rear Smite', 'Assault Stance', 'Impact Hit', 'Ambush Stance', 'Defense Break', 'Revitalization Contract', 'Determination'],
    stigma: ["Triniel's Dagger", 'Shadowstep', 'Savage Fang', 'Swift Contract', 'Smoke Bomb', 'Evasion Stance', 'Spiral Slice', 'Shadow Walk', 'Illusive Clone', 'Assault Ambush']
  };
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }

  /* ------------------------------------------------------------------ seed */
  function seedState(now) {
    now = now || new Date().toISOString();
    var D = '2026-10-17';
    var AF_L = 'https://aionflex.gg/character?id=GXf_uDNlKcYJYIHNvVUVBUAgfgxQPtLI3IL541HiRs4%253D&server=1305&region=GLOBAL&name=lycaa';
    var AF_N = 'https://aionflex.gg/character?id=WXUNNknM-mlwfJT7-1NEu0mpbQecpA2RulWyVvmrFDI%253D&server=1306&region=GLOBAL&name=Novin';
    function af(url, status, note) { return meta(status || 'imported', 'AionFlex', D, { url: url, note: note || 'Historical AionFlex snapshot. May be stale.' }); }
    function item(name, enh, m) { return { name: name, enh: enh, rarity: null, itemLevel: null, base: [], rolls: [], soulBinding: [], manastones: [], set: null, acquisition: null, m: m }; }
    function skillsBlank(m) {
      var list = [];
      ['active', 'passive', 'stigma'].forEach(function (t) { SKILLS[t].forEach(function (n) { list.push({ id: slug(n), name: n, type: t, level: null, unlocked: null, m: m }); }); });
      return list;
    }
    var mL = function () { return af(AF_L); };
    var mN = function () { return af(AF_N, 'imported', 'Historical benchmark from AionFlex. Not live data.'); };
    var lyEq = {
      main_hand: item('Spiritforged Dagger', 12, mL()), off_hand: item('Spiritforged Guard', 10, mL()),
      torso: item('Bakarma Breastplate', 10, mL()), pants: item('Vakron Greaves', 10, mL()), helmet: item('Vakron Helm', 10, mL()),
      shoulders: item('Vakron Pauldrons', 10, mL()), gloves: item('Vakron Gloves', 10, mL()), boots: item('Vakron Boots', 10, mL()),
      cape: item('Vakron Cloak', 10, mL()), belt: item('Noble Belt', 3, mL()),
      necklace: item('Pilgrim Necklace', 7, mL()), earring_1: item('Pilgrim Earrings', 5, mL()), earring_2: item('Unyielding Earrings', 5, mL()),
      ring_1: item('Pilgrim Ring', 5, mL()), ring_2: item('Pilgrim Ring', 5, mL()), bracelet_1: item('Ascension Bracelet', 10, mL()),
      bracelet_2: item('Pilgrim Bracelet', 5, mL()), amulet: item('Revelation Amulet', 3, mL()),
      rune_1: item('Clash Rune', 4, mL()), rune_2: item('Clash Rune', 4, mL())
    };
    var noEq = {
      main_hand: item('Aulamus Dagger', 15, mN()), off_hand: item('Spiritforged Guard', 11, mN()),
      torso: item('Vakron Breastplate', 11, mN()), pants: item('Vakron Greaves', 11, mN()), helmet: item('Vakron Helm', 10, mN()),
      shoulders: item('Vakron Pauldrons', 10, mN()), gloves: item('Vakron Gloves', 10, mN()), boots: item('Bakarma Boots', 9, mN()),
      cape: item('Vakron Cloak', 10, mN()), belt: item('Noble Belt', 4, mN()),
      necklace: item('Aulamus Necklace', 11, mN()), earring_1: item('Pilgrim Earrings', 6, mN()), earring_2: item('Unyielding Earrings', 7, mN()),
      ring_1: item('Aulamus Ring', 10, mN()), ring_2: item('Aulamus Ring', 10, mN()), bracelet_1: item('Ascension Bracelet', 10, mN()),
      bracelet_2: item('Pilgrim Bracelet', 9, mN()), amulet: item('Revelation Amulet', 5, mN()),
      rune_1: item('Clash Rune', 5, mN()), rune_2: item('Clash Rune', 4, mN())
    };
    function numMap(defs, values, mf) { var o = {}; defs.forEach(function (d) { o[d.id] = fv(values[d.id] != null ? values[d.id] : null, values[d.id] != null ? mf() : meta('unknown', 'none', null)); }); return o; }
    var lyca = {
      id: 'lycaa', role: 'player', name: 'lycaa', cls: 'Assassin', race: 'Elyos', region: 'Global', server: 'Yustiel (EU)', guild: 'GOONER', url: AF_L,
      snapshots: [snapshot('Historical snapshot (AionFlex + player)', D, {
        level: fv(45, mL()),
        cp: fv(72815, meta('confirmed', 'Player', D, { note: 'Confirmed correct by the player.' })),
        itemLevel: fv(1693, mL()),
        dps: fv(null, meta('unknown', 'none', null)),
        equipment: lyEq,
        arcana: { state: 'none', items: [], m: meta('confirmed', 'Player', D, { note: 'No Arcana equipped, confirmed by the player.' }) },
        combatStats: {},
        coreStats: numMap(CORE_STATS, { might: 25, dexterity: 68, intelligence: 0, constitution: 0, precision: 0, willpower: 50 }, mL),
        divine: numMap(DIVINE, { justice: 6, freedom: 12, illusion: 7, life: 8, time: 6, destruction: 6, death: 6, wisdom: 5, destiny: 6, space: 6 }, mL),
        daevanion: numMap(DAEVANION, { nezekan: 74, zikel: 73, vaizel: 61, triniel: 44, azphel: 1 }, mL),
        pantheon: {
          collected: 10, total: 94, slots: null,
          effects: { life: 3, destiny: 5, wisdom: 2, death: 36, space: 18, freedom: 18, justice: 35, time: 35 },
          collectibles: [],
          m: meta('imported', 'Player report (Pantheon screen)', D, { note: 'Pantheon display effects come from a different interface than the AionFlex Divine Stats. Not merged.' })
        },
        skills: { needsRefresh: true, list: skillsBlank(meta('outdated', 'AionFlex', D, { note: 'AionFlex skill levels were outdated. Re-import from a current in-game screenshot.' })), rotations: { boss: '', aoe: '', burst: '' } },
        titles: { unlocked: null, total: 297, selected: null, bonuses: '', m: meta('unknown', 'none', null) },
        pet: { name: 'Little Ghost', level: 3, rarity: null, effects: '', m: mL() },
        wings: { name: 'Ultimate Daeva Wings', rarity: 'Unique', stats: '', m: mL() },
        collections: { notes: '', m: meta('unknown', 'none', null) }
      }, now)]
    };
    var novin = {
      id: 'novin', role: 'benchmark', name: 'Novin', cls: 'Assassin', race: 'Elyos', region: 'Global', server: 'Ariel (EU)', guild: 'CHAOS', url: AF_N,
      snapshots: [snapshot('Historical benchmark (AionFlex)', D, {
        level: fv(45, mN()), cp: fv(94580, mN()), itemLevel: fv(1964, mN()), dps: fv(null, meta('unknown', 'none', null)),
        equipment: noEq,
        arcana: { state: 'equipped', items: [
          { name: 'Chalice of Vigor', enh: 1, rarity: null, stats: [], m: mN() }, { name: 'Compass of Magic', enh: 2, rarity: null, stats: [], m: mN() },
          { name: 'Bell of Vigor', enh: 2, rarity: null, stats: [], m: mN() }, { name: 'Mirror of Vigor', enh: 2, rarity: null, stats: [], m: mN() }
        ], m: mN() },
        combatStats: {},
        coreStats: numMap(CORE_STATS, {}, mN),
        divine: numMap(DIVINE, { justice: 55, freedom: 34, illusion: 24, life: 26, time: 50, destruction: 6, death: 44, wisdom: 19, destiny: 19, space: 26 }, mN),
        daevanion: numMap(DAEVANION, { nezekan: 60, zikel: 45, vaizel: 59, triniel: 59, azphel: 11 }, mN),
        pantheon: { collected: null, total: 94, slots: null, effects: {}, collectibles: [], m: meta('unknown', 'none', null) },
        skills: { needsRefresh: true, list: skillsBlank(meta('unknown', 'none', null)), rotations: { boss: '', aoe: '', burst: '' } },
        titles: { unlocked: 212, total: 297, selected: null, bonuses: '', m: mN() },
        pet: { name: null, level: null, rarity: null, effects: '', m: meta('unknown', 'none', null) },
        wings: { name: null, rarity: null, stats: '', m: meta('unknown', 'none', null) },
        collections: { notes: '', m: meta('unknown', 'none', null) }
      }, now)]
    };
    return {
      app: APP_ID, version: SCHEMA_VERSION, createdAt: now,
      characters: [lyca, novin],
      selected: { player: 'lycaa', benchmark: '', mode: 'boss', rankMode: 'value' }, selfFocus: 1,
      tasks: [], resources: [], dps: [], research: seedResearch(D), proposals: [], conflicts: [],
      customTiers: {}, uploads: [],
      settings: { provider: 'anthropic', model: 'claude-sonnet-5-5', apiKey: '', openaiModel: 'gpt-5', openaiKey: '', aiEnabled: false }
    };
  }
  // what a new visitor starts with: no characters, research notes and settings only
  function emptyState(now) {
    var s = seedState(now);
    s.characters = []; s.selected = { player: '', benchmark: '', mode: 'boss', rankMode: 'value' }; s.selfFocus = 1;
    return s;
  }
  function seedResearch(D) {
    function R(topic, summary, kind, conf) {
      return { id: uid('res'), topic: topic, summary: summary, source: 'Player discussion (earlier conversation)', url: '', published: null, region: 'Global', confidence: conf || 'Low', freshness: 'Needs verification', kind: kind, addedAt: D, reviewedAt: null };
    }
    return [
      R('Assassin PvE stat priority', 'Provisional tiers: S+ Combat Speed, Critical Hit, Attack Increase %, Smite. S Back Attack Damage Boost, PvE Damage Boost, Double Chance, Weapon Damage Boost, Damage Boost. A+ Back Attack, Attack, Max Attack. Discussion-based, not a formula.', 'meta'),
      R('Divine Stat collection priority (Assassin PvE)', 'Wisdom > Destruction > Illusion > Time > Death > Freedom > Justice > Space > Life > Destiny. Re-evaluate against current stats.', 'meta'),
      R('Core Stat tooltip mappings', 'Might: Attack Increase. Dexterity: Evasion, Block, Critical Hit Resist. Intelligence: Status Effect Chance. Constitution: HP Increase. Precision: Accuracy Increase, Critical Hit Increase. Willpower: Status Effect Resist. Source: AionFlex tooltips.', 'mechanic', 'Medium'),
      R('Divine Stat tooltip mappings', 'Justice: Defense Inc, Perfect Chance. Freedom: Accuracy Inc, Evasion Inc. Illusion: Cooldown Reduction, Endurance Penetration. Life: HP Inc, Regeneration. Time: Combat Speed, Double Resist. Destruction: Attack Inc, Perfect Resist. Death: Critical Hit Inc, Regeneration Penetration. Wisdom: MP Cost Reduction, Double Chance. Destiny: MP Inc, Endurance. Space: Movement Speed, Block Inc. Source: AionFlex tooltips.', 'mechanic', 'Medium'),
      R('Back Attack vs Back Attack Damage Boost', 'They are different stats (flat vs %). How they combine is not verified.', 'mechanic'),
      R('Combat Power vs DPS', 'Higher Combat Power does not automatically mean higher boss DPS. Compare DPS-meter runs on the same boss.', 'mechanic', 'Medium')
    ];
  }

  /* ------------------------------------------------------------------ helpers */
  var _uidN = 0;
  function uid(p) { _uidN++; return (p || 'id') + '_' + Date.now().toString(36) + '_' + (_uidN).toString(36) + Math.random().toString(36).slice(2, 6); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function snapshot(label, observedAt, data, now) {
    return { id: uid('snap'), label: label, observedAt: observedAt, createdAt: now || new Date().toISOString(), data: data };
  }
  function getChar(state, id) { for (var i = 0; i < state.characters.length; i++) if (state.characters[i].id === id) return state.characters[i]; return null; }
  function latest(ch) { return ch && ch.snapshots.length ? ch.snapshots[ch.snapshots.length - 1] : null; }
  function cur(ch) { var s = latest(ch); return s ? s.data : null; }
  // every confirmed change makes a new immutable snapshot; older ones are never touched
  function commit(ch, mutate, label, observedAt) {
    var base = latest(ch);
    var data = clone(base ? base.data : {});
    mutate(data);
    var s = snapshot(label || 'Update', observedAt || new Date().toISOString().slice(0, 10), data);
    ch.snapshots.push(s);
    return s;
  }
  function freeze(o) { if (o && typeof o === 'object') { Object.freeze(o); Object.keys(o).forEach(function (k) { freeze(o[k]); }); } return o; }

  /* ------------------------------------------------------------------ calculations */
  function num(x) { var v = val(x); return typeof v === 'number' && isFinite(v) ? v : null; }
  function cpGap(a, b) { var x = num(a.cp), y = num(b.cp); return x == null || y == null ? null : y - x; }
  function divineTotal(d) {
    var t = 0, known = 0;
    DIVINE.forEach(function (s) { var v = num(d && d.divine && d.divine[s.id]); if (v != null) { t += v; known++; } });
    return known ? t : null;
  }
  function pct(a, b) { return a == null || !b ? null : Math.round(a/b*1000)/10; }
  function pantheonPct(d) { return d && d.pantheon ? pct(d.pantheon.collected, d.pantheon.total) : null; }
  function daevanionAvg(d) {
    var t = 0, n = 0;
    DAEVANION.forEach(function (b) { var v = num(d && d.daevanion && d.daevanion[b.id]); if (v != null) { t += v; n++; } });
    return n ? Math.round(t/n*10)/10 : null;
  }
  function arcanaState(d) { if (!d || !d.arcana) return 'unknown'; return d.arcana.state === 'equipped' && d.arcana.items.length ? 'equipped' : (d.arcana.state === 'none' ? 'none' : 'unknown'); }
  function enhTotal(d, group) {
    var t = 0, n = 0;
    SLOTS.forEach(function (s) { if (group && s.group !== group) return; var it = d.equipment && d.equipment[s.id]; if (it && typeof it.enh === 'number') { t += it.enh; n++; } });
    return n ? t : null;
  }
  // a combined total of displayed levels, our own analytic number
  function snapshotSummary(d) {
    return { cp: num(d.cp), itemLevel: num(d.itemLevel), dps: num(d.dps), divineTotal: divineTotal(d), pantheon: d.pantheon ? d.pantheon.collected : null,
      pantheonPct: pantheonPct(d), daevanionAvg: daevanionAvg(d), arcana: arcanaState(d), enhTotal: enhTotal(d) };
  }
  function snapshotDiff(older, newer) {
    var a = snapshotSummary(older), b = snapshotSummary(newer), out = {};
    ['cp', 'itemLevel', 'dps', 'divineTotal', 'pantheon', 'daevanionAvg', 'enhTotal'].forEach(function (k) { out[k] = a[k] == null || b[k] == null ? null : Math.round((b[k] - a[k]) * 10)/10; });
    var gear = [];
    SLOTS.forEach(function (s) {
      var x = older.equipment && older.equipment[s.id], y = newer.equipment && newer.equipment[s.id];
      var xn = x ? x.name + ' +' + x.enh : '-', yn = y ? y.name + ' +' + y.enh : '-';
      if (xn !== yn) gear.push({ slot: s.id, from: xn, to: yn });
    });
    out.gear = gear;
    return out;
  }
  function itemLine(name) { return String(name || '').split(' ')[0]; }

  /* ------------------------------------------------------------------ classes, servers, blank characters */
  var CLASSES = ['Assassin', 'Gladiator', 'Templar', 'Ranger', 'Sorcerer', 'Spiritmaster', 'Elementalist', 'Cleric', 'Chanter', 'Brawler'];
  // Global Europe server names as shown on AionFlex; free text is allowed for anything else
  var SERVERS = ['Siel (EU)', 'Nezekan (EU)', 'Vaizel (EU)', 'Kaisinel (EU)', 'Yustiel (EU)', 'Ariel (EU)', 'Fregion (EU)', 'Meslamtaeda (EU)', 'Hithanya (EU)', 'Nania (EU)', 'Tahavatha (EU)', 'Luteros (EU)', 'Phernos (EU)', 'Daminu (EU)', 'Kasaka (EU)', 'Bakarma (EU)', 'Tsenka (EU)', 'Kochi (EU)', 'Ishtar (EU)', 'Tiamat (EU)', 'Gauss (EU)', 'Lamuatan (EU)', 'Nathara (EU)',
    'Israphel (EU)', 'Zikel (EU)', 'Triniel (EU)', 'Lumiel (EU)', 'Marchutan (EU)', 'Azphel (EU)', 'Ereshkigal (EU)', 'Beritra (EU)', 'Nemon (EU)', 'Hadala (EU)', 'Ludra (EU)', 'Ulgorn (EU)', 'Munin (EU)', 'Odar (EU)', 'Zemurru (EU)', 'Kromede (EU)', 'Quai (EU)', 'Baba (EU)', 'Fafnir (EU)', 'Indnath (EU)', 'Agnita (EU)', 'Atiel (EU)', 'Tassin (EU)',
    'Siel (NAE)', 'Nezekan (NAE)', 'Vaizel (NAE)', 'Kaisinel (NAE)', 'Yustiel (NAE)', 'Ariel (NAE)', 'Fregion (NAE)', 'Meslamtaeda (NAE)', 'Hithanya (NAE)', 'Israphel (NAE)', 'Zikel (NAE)', 'Triniel (NAE)', 'Lumiel (NAE)', 'Marchutan (NAE)', 'Azphel (NAE)', 'Ereshkigal (NAE)', 'Beritra (NAE)', 'Nemon (NAE)',
    'Siel (NAW)', 'Nezekan (NAW)', 'Vaizel (NAW)', 'Kaisinel (NAW)', 'Yustiel (NAW)', 'Israphel (NAW)', 'Zikel (NAW)', 'Triniel (NAW)', 'Lumiel (NAW)', 'Marchutan (NAW)'];
  function skillsFor(cls, m) {
    if (cls !== 'Assassin') return [];
    var list = [];
    ['active', 'passive', 'stigma'].forEach(function (t) { SKILLS[t].forEach(function (n) { list.push({ id: slug(n), name: n, type: t, level: null, unlocked: null, m: m }); }); });
    return list;
  }
  function blankData(cls) {
    var none = meta('unknown', 'none', null);
    function map(defs) { var o = {}; defs.forEach(function (d) { o[d.id] = { v: null, m: none }; }); return o; }
    return {
      level: { v: null, m: none }, cp: { v: null, m: none }, itemLevel: { v: null, m: none }, dps: { v: null, m: none },
      equipment: {}, arcana: { state: 'unknown', items: [], m: none }, combatStats: {},
      coreStats: map(CORE_STATS), divine: map(DIVINE), daevanion: map(DAEVANION),
      pantheon: { collected: null, total: null, slots: null, effects: {}, collectibles: [], m: none },
      skills: { needsRefresh: true, list: skillsFor(cls, none), rotations: { boss: '', aoe: '', burst: '' } },
      titles: { unlocked: null, total: null, selected: null, bonuses: '', m: none },
      pet: { name: null, level: null, rarity: null, effects: '', m: none }, wings: { name: null, rarity: null, stats: '', m: none },
      collections: { notes: '', m: none }
    };
  }
  function newCharacter(o) {
    var cls = CLASSES.indexOf(o.cls) >= 0 ? o.cls : (o.cls || 'Assassin');
    var d = blankData(cls), m = meta('confirmed', o.source || 'Setup', o.observedAt || null);
    if (o.level != null) d.level = { v: o.level, m: m };
    if (o.cp != null) d.cp = { v: o.cp, m: m };
    if (o.itemLevel != null) d.itemLevel = { v: o.itemLevel, m: m };
    return { id: slug(o.name || 'character') + '_' + Date.now().toString(36), role: o.role || 'player', name: String(o.name || '').slice(0, 40), cls: cls, race: o.race || '', region: o.region || 'Global', server: o.server || '', guild: o.guild || '', url: o.url || '',
      snapshots: [snapshot('Created', o.observedAt || new Date().toISOString().slice(0, 10), d)] };
  }
  // read name, region and server id from an AionFlex profile URL (query or path form)
  function parseProfileUrl(u) {
    var out = { name: null, region: null, serverId: null, ok: false };
    try {
      var url = new URL(String(u).trim());
      if (!/(^|\.)aionflex\.gg$/i.test(url.hostname)) return out;
      var q = url.searchParams;
      if (q.get('name')) { out.name = q.get('name'); out.region = q.get('region'); out.serverId = q.get('server'); }
      var m = url.pathname.match(/^\/character\/([^/]+)\/(\d+)\/([^/]+)/);
      if (m) { out.region = decodeURIComponent(m[1]); out.serverId = m[2]; out.name = decodeURIComponent(m[3]); }
      if (out.region) out.region = out.region.charAt(0).toUpperCase() + out.region.slice(1).toLowerCase();
      out.ok = !!out.name;
    } catch (e) { }
    return out;
  }

  /* ------------------------------------------------------------------ self check: what you are not using or not recording */
  function selfCheck(d) {
    var missing = [], unknowns = [];
    if (arcanaState(d) === 'none') missing.push({ system: 'arcana', text: 'Arcana: none equipped.' });
    if (arcanaState(d) === 'unknown') unknowns.push({ system: 'arcana', text: 'Arcana not recorded.' });
    var pp = pantheonPct(d);
    if (pp != null && pp < 25) missing.push({ system: 'pantheon', text: 'Pantheon: ' + d.pantheon.collected + '/' + d.pantheon.total + ' collected (' + pp + '%).' });
    if (pp == null) unknowns.push({ system: 'pantheon', text: 'Pantheon progress not recorded.' });
    DAEVANION.forEach(function (b) { var v = num(d.daevanion && d.daevanion[b.id]); if (v != null && v < 10) missing.push({ system: 'daevanion', text: 'Daevanion ' + b.name + ': ' + v + '%, barely started.' }); });
    var empty = SLOTS.filter(function (s) { return !(d.equipment && d.equipment[s.id]); });
    if (empty.length && empty.length < SLOTS.length) missing.push({ system: 'equipment', text: 'Empty slots: ' + empty.map(function (s) { return s.name; }).join(', ') + '.' });
    if (empty.length === SLOTS.length) unknowns.push({ system: 'equipment', text: 'No equipment recorded yet.' });
    if (!Object.keys(d.combatStats || {}).length) unknowns.push({ system: 'stats', text: 'Combat stats not recorded.' });
    if (d.skills && d.skills.needsRefresh) unknowns.push({ system: 'skills', text: 'Skill levels missing or outdated.' });
    var noRolls = SLOTS.every(function (s) { var it = d.equipment && d.equipment[s.id]; return !it || !(it.rolls.length + it.base.length); });
    if (!empty.length || empty.length < SLOTS.length) if (noRolls) unknowns.push({ system: 'equipment', text: 'Item stat lines (rolls, Soul Binding, Manastones) not recorded.' });
    if (d.titles && d.titles.unlocked == null) unknowns.push({ system: 'titles', text: 'Title count not recorded.' });
    if (num(d.cp) == null) unknowns.push({ system: 'cp', text: 'Combat Power not recorded.' });
    return { missing: missing, unknowns: unknowns };
  }
  // slots clearly below the rest of your own gear in the same group
  function weakSlots(d) {
    var out = [];
    ['weapon', 'armor', 'accessory', 'rune'].forEach(function (g) {
      var rows = SLOTS.filter(function (s) { return s.group === g && d.equipment && d.equipment[s.id] && typeof d.equipment[s.id].enh === 'number'; }).map(function (s) { return { slot: s, enh: d.equipment[s.id].enh }; });
      if (rows.length < 2) return;
      var sorted = rows.map(function (r) { return r.enh; }).sort(function (a, b) { return a - b; }), med = sorted[Math.floor(sorted.length / 2)];
      rows.forEach(function (r) { if (r.enh <= med - 2) out.push({ slot: r.slot.id, slotName: r.slot.name, group: g, enh: r.enh, typical: med, name: d.equipment[r.slot.id].name }); });
    });
    return out.sort(function (a, b) { return (a.enh - a.typical) - (b.enh - b.typical); });
  }

  /* ------------------------------------------------------------------ comparison engine */
  function compare(a, b, opts) {
    opts = opts || {};
    var tiers = tiersFor(opts.mode || 'boss', opts.customTiers);
    var A = snapshotSummary(a), B = snapshotSummary(b);
    var res = { overview: [], advantages: [], disadvantages: [], missingSystems: [], dpsRelevant: [], cpRelevant: [], unknowns: [], slots: [], divine: [], daevanion: [], catchUp: [] };
    var gap = cpGap(a, b);
    if (gap != null) res.overview.push({ key: 'cp', text: 'Combat Power gap: ' + fmt(gap) + ' (' + fmt(A.cp) + ' vs ' + fmt(B.cp) + ').', value: gap });
    if (A.itemLevel != null && B.itemLevel != null) res.overview.push({ key: 'itemLevel', text: 'Item Level gap: ' + fmt(B.itemLevel - A.itemLevel) + ' (' + fmt(A.itemLevel) + ' vs ' + fmt(B.itemLevel) + ').', value: B.itemLevel - A.itemLevel });
    if (A.divineTotal != null && B.divineTotal != null) res.overview.push({ key: 'divine', text: 'Divine Stat total (sum of displayed levels): ' + A.divineTotal + ' vs ' + B.divineTotal + '.', value: B.divineTotal - A.divineTotal });
    // equipment by slot
    SLOTS.forEach(function (s) {
      var x = a.equipment && a.equipment[s.id], y = b.equipment && b.equipment[s.id];
      var row = { slot: s.id, slotName: s.name, group: s.group, a: x ? { name: x.name, enh: x.enh } : null, b: y ? { name: y.name, enh: y.enh } : null, sameItem: false, enhDiff: null, verdict: 'unknown' };
      if (x && y) {
        row.sameItem = x.name === y.name;
        row.enhDiff = (typeof x.enh === 'number' && typeof y.enh === 'number') ? x.enh - y.enh : null;
        if (row.sameItem) row.verdict = row.enhDiff > 0 ? 'ahead' : (row.enhDiff < 0 ? 'behind' : 'equal');
        else row.verdict = 'different';
      } else if (!x && y) row.verdict = 'missing';
      res.slots.push(row);
      if (row.verdict === 'ahead') res.advantages.push({ system: 'equipment', text: s.name + ': same item, you are +' + row.enhDiff + ' higher (' + x.name + ' +' + x.enh + ' vs +' + y.enh + ').' });
      if (row.verdict === 'behind') res.disadvantages.push({ system: 'equipment', slot: s.id, text: s.name + ': same item, ' + (-row.enhDiff) + ' enhancement levels behind (+' + x.enh + ' vs +' + y.enh + ').' });
      if (row.verdict === 'different') res.disadvantages.push({ system: 'equipment', slot: s.id, kind: 'item', text: s.name + ': different item (' + x.name + ' +' + x.enh + ' vs ' + y.name + ' +' + y.enh + '). Which is better depends on stats that are not recorded.' });
      if (row.verdict === 'missing') res.missingSystems.push({ system: 'equipment', text: s.name + ': empty on your side.' });
    });
    // arcana
    if (A.arcana === 'none' && B.arcana === 'equipped') res.missingSystems.push({ system: 'arcana', text: 'Arcana: none equipped, the benchmark has ' + b.arcana.items.length + '.' });
    if (A.arcana === 'unknown') res.unknowns.push({ system: 'arcana', text: 'Arcana state unknown.' });
    // divine stats
    DIVINE.forEach(function (d) {
      var x = num(a.divine && a.divine[d.id]), y = num(b.divine && b.divine[d.id]);
      res.divine.push({ id: d.id, name: d.name, a: x, b: y, diff: x == null || y == null ? null : x - y, effects: d.effects });
      if (x != null && y != null && y > x) res.disadvantages.push({ system: 'divine', id: d.id, text: d.name + ': ' + x + ' vs ' + y + ' (' + d.effects.join(', ') + ').' });
      if (x != null && y != null && x > y) res.advantages.push({ system: 'divine', text: d.name + ': ' + x + ' vs ' + y + '.' });
    });
    // daevanion
    DAEVANION.forEach(function (d) {
      var x = num(a.daevanion && a.daevanion[d.id]), y = num(b.daevanion && b.daevanion[d.id]);
      res.daevanion.push({ id: d.id, name: d.name, a: x, b: y, diff: x == null || y == null ? null : x - y });
      if (x != null && y != null && x > y) res.advantages.push({ system: 'daevanion', text: d.name + ': ' + x + '% vs ' + y + '%. Completion is not the same as offensive value.' });
      if (x != null && y != null && y > x) res.disadvantages.push({ system: 'daevanion', text: d.name + ': ' + x + '% vs ' + y + '%.' });
    });
    // titles
    var ta = a.titles && a.titles.unlocked, tb = b.titles && b.titles.unlocked;
    if (ta == null) res.unknowns.push({ system: 'titles', text: 'Your title collection count is not recorded (benchmark: ' + (tb == null ? 'unknown' : tb + '/' + b.titles.total) + ').' });
    // skills
    if (a.skills && a.skills.needsRefresh) res.unknowns.push({ system: 'skills', text: 'Your skill levels need a fresh in-game screenshot. The AionFlex levels were outdated.' });
    if (b.skills && b.skills.list.every(function (s) { return s.level == null; })) res.unknowns.push({ system: 'skills', text: 'Benchmark skill levels are not recorded.' });
    // stats and sub-stats
    if (!Object.keys(a.combatStats || {}).length) res.unknowns.push({ system: 'stats', text: 'No combat stats recorded for you yet (Combat Stats screenshot).' });
    if (!Object.keys(b.combatStats || {}).length) res.unknowns.push({ system: 'stats', text: 'No combat stats recorded for the benchmark.' });
    var noRolls = SLOTS.every(function (s) { var it = a.equipment && a.equipment[s.id]; return !it || !it.rolls.length; });
    if (noRolls) res.unknowns.push({ system: 'equipment', text: 'Item rolls, Soul Binding and Manastones are not recorded, so item-versus-item value cannot be judged yet.' });
    if (A.dps == null || B.dps == null) res.unknowns.push({ system: 'dps', text: 'No comparable DPS measurement. CP gaps do not prove DPS gaps.' });
    // stat comparison where both are known
    var sa = a.combatStats || {}, sb = b.combatStats || {};
    STAT_CATALOG.forEach(function (st) {
      var x = num(sa[st.id]), y = num(sb[st.id]);
      if (x == null || y == null || x === y) return;
      var t = tierOf(st.id, tiers), row = { system: 'stats', stat: st.id, tier: t, text: st.name + ': ' + x + ' vs ' + y + ' (' + st.unit + ')' + (t ? ', tier ' + t : '') + '.' };
      (x > y ? res.advantages : res.disadvantages).push(row);
      if (t && tierWeight(t) >= tierWeight('A')) res.dpsRelevant.push(row);
    });
    // DPS-relevant and CP-relevant summaries, without fake contributions
    var main = res.slots.filter(function (r) { return r.slot === 'main_hand'; })[0];
    if (main && main.verdict !== 'equal' && main.verdict !== 'ahead') res.dpsRelevant.push({ system: 'equipment', text: 'Main-hand differs (' + label(main.a) + ' vs ' + label(main.b) + '). The weapon is a likely DPS factor, but its stats are not recorded.' });
    ['time', 'destruction', 'wisdom', 'death', 'illusion'].forEach(function (id) {
      var r = res.divine.filter(function (x) { return x.id === id; })[0];
      if (r && r.diff != null && r.diff < 0) res.dpsRelevant.push({ system: 'divine', text: r.name + ' is ' + (-r.diff) + ' lower (' + r.effects[0] + ').' });
    });
    if (A.arcana === 'none' && B.arcana === 'equipped') { res.dpsRelevant.push({ system: 'arcana', text: 'No Arcana. Their stats are not recorded, so the DPS effect is unknown.' }); res.cpRelevant.push({ system: 'arcana', text: 'Arcana slots are empty; equipped Arcana likely contribute to CP.' }); }
    var behindEnh = res.slots.filter(function (r) { return r.verdict === 'behind'; }).length, diffItems = res.slots.filter(function (r) { return r.verdict === 'different'; }).length;
    if (behindEnh) res.cpRelevant.push({ system: 'equipment', text: behindEnh + ' slot(s) with the same item at a lower enhancement level.' });
    if (diffItems) res.cpRelevant.push({ system: 'equipment', text: diffItems + ' slot(s) with a different item line.' });
    if (A.itemLevel != null && B.itemLevel != null && B.itemLevel > A.itemLevel) res.cpRelevant.push({ system: 'itemLevel', text: 'Item Level ' + fmt(B.itemLevel - A.itemLevel) + ' lower.' });
    if (A.divineTotal != null && B.divineTotal != null && B.divineTotal > A.divineTotal) res.cpRelevant.push({ system: 'divine', text: 'Divine Stat total ' + (B.divineTotal - A.divineTotal) + ' lower.' });
    res.cpRelevant.push({ system: 'note', text: 'Per-item CP contributions are unknown, so the gap is not split per item.' });
    return res;
  }
  function label(x) { return x ? x.name + ' +' + x.enh : 'empty'; }
  function fmt(n) { if (n == null) return '?'; var s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','); return (n < 0 ? '-' : '') + s; }

  /* ------------------------------------------------------------------ upgrade engine */
  var LVL = { High: 3, Medium: 2, Low: 1, Unknown: 0 };
  var COST = { Low: 3, Medium: 2, High: 1, Unknown: 1 };
  var RANK_MODES = {
    value: { label: 'Best value for PvE DPS', w: { dps: 3, conf: 2, cost: 2, time: 1, avail: 1, longterm: 1 } },
    dps: { label: 'Maximum DPS', w: { dps: 5, conf: 2, cost: 0, time: 0, avail: 1, longterm: 1 } },
    fast: { label: 'Fastest improvement', w: { dps: 2, conf: 1, cost: 1, time: 4, avail: 2, longterm: 0 } },
    cheap: { label: 'Lowest resource cost', w: { dps: 1, conf: 1, cost: 5, time: 1, avail: 1, longterm: 0 } },
    cp: { label: 'Maximum CP', w: { dps: 0, conf: 2, cost: 1, time: 0, avail: 1, longterm: 1, cp: 5 } },
    balanced: { label: 'Balanced progression', w: { dps: 2, conf: 2, cost: 2, time: 2, avail: 2, longterm: 2, cp: 1 } }
  };
  function rec(o) {
    var r = { id: o.id, title: o.title, description: o.description, system: o.system, current: o.current, proposed: o.proposed,
      dps: o.dps || 'Unknown', cp: o.cp || 'Unknown', resources: o.resources || 'Not recorded', availability: o.availability || 'Unknown',
      difficulty: o.difficulty || 'Unknown', risk: o.risk || 'Unknown', confidence: o.confidence || 'Low', cost: o.cost || 'Unknown', time: o.time || 'Unknown',
      longterm: o.longterm || 'Medium', source: o.source || 'Comparison with benchmark', dependsOn: o.dependsOn || [], why: o.why || '', kind: /^data_/.test(o.id) ? 'data' : 'upgrade' };
    return r;
  }
  function recommendations(player, bench, opts) {
    opts = opts || {};
    var out = [], c = bench ? compare(player, bench, opts) : null;
    if (player.skills && player.skills.needsRefresh) out.push(rec({ id: 'data_skills', title: 'Refresh skill levels', system: 'skills', description: 'Upload a current Skills screenshot so skill advice is based on real levels.', current: 'Outdated', proposed: 'Current levels recorded', dps: 'Unknown', cp: 'Low', cost: 'Low', time: 'Low', availability: 'Now', difficulty: 'Low', risk: 'Low', confidence: 'High', longterm: 'High', source: 'Data quality', why: 'Every skill recommendation depends on it, and it costs nothing.' }));
    if (!Object.keys(player.combatStats || {}).length) out.push(rec({ id: 'data_stats', title: 'Record your Combat Stats', system: 'stats', description: 'Upload a Combat Stats screenshot. Stat-based advice (rerolls, caps, priorities) needs it.', current: 'Not recorded', proposed: 'Recorded', dps: 'Unknown', cp: 'Low', cost: 'Low', time: 'Low', availability: 'Now', difficulty: 'Low', risk: 'Low', confidence: 'High', longterm: 'High', source: 'Data quality', why: 'Without stats the engine can only compare item names and enhancement levels.' }));
    if (arcanaState(player) === 'none') out.push(rec({ id: 'arcana_start', title: 'Start Arcana progression', system: 'arcana', description: 'Your Arcana slots are empty' + (c && arcanaState(bench) === 'equipped' ? '; ' + (opts.benchName || 'the benchmark') + ' has ' + bench.arcana.items.length + ' equipped' : '') + '. Look up how Arcana is obtained on Global before spending resources.', current: 'None equipped', proposed: 'First Arcana equipped', dps: 'Unknown', cp: 'Medium', cost: 'Unknown', time: 'Unknown', availability: 'Not verified', difficulty: 'Unknown', risk: 'Low', confidence: 'Medium', longterm: 'High', why: 'A whole system you are not using yet. Its stats are not recorded, so the DPS effect is unknown, but empty slots are rarely the right answer.' }));
    var d = player.divine ? divineTotal(player) : null, db = bench ? divineTotal(bench) : null;
    if (d != null) {
      var ranked = divineNeeds(player, opts);
      out.push(rec({ id: 'divine_collect', title: 'Grow Divine Stats through Pantheon collecting', system: 'pantheon', description: 'Target ' + ranked.slice(0, 3).map(function (x) { return x.name; }).join(', ') + ' first. ' + (db != null ? 'Your total is ' + d + ' vs ' + db + '.' : ''), current: 'Total ' + d, proposed: 'Higher totals in the priority stats', dps: 'Medium', cp: db != null && db > d ? 'High' : 'Medium', cost: 'Unknown', time: 'High', availability: 'Ongoing', difficulty: 'Medium', risk: 'Low', confidence: 'Medium', longterm: 'High', source: 'Divine Stat mapping (AionFlex tooltips) + provisional priority', why: 'Divine Stats feed Combat Speed, Attack Increase, Double Chance and Cooldown Reduction. The size of each effect is not verified.' }));
    }
    if (c) {
      c.slots.forEach(function (r) {
        if (r.verdict === 'behind' && r.group !== 'rune') out.push(rec({ id: 'enh_' + r.slot, title: 'Enhance ' + r.slotName + ' to +' + r.b.enh, system: 'equipment', description: r.a.name + ' +' + r.a.enh + ' -> +' + r.b.enh + ' (benchmark level).', current: '+' + r.a.enh, proposed: '+' + r.b.enh, dps: r.group === 'weapon' ? 'Medium' : 'Low', cp: 'Medium', cost: 'Unknown', time: 'Medium', availability: 'Now', difficulty: 'Medium', risk: 'Unknown', confidence: 'Medium', longterm: 'Medium', why: 'Same item, so the only difference is enhancement. Success rates and costs are not recorded; treat it as probabilistic.' }));
        if (r.verdict === 'different' && r.group !== 'rune') out.push(rec({ id: 'item_' + r.slot, title: 'Evaluate ' + r.b.name + ' for ' + r.slotName, system: 'equipment', description: 'Benchmark uses ' + r.b.name + ' +' + r.b.enh + ' where you use ' + r.a.name + ' +' + r.a.enh + '. Record both items\' stats before deciding.', current: r.a.name + ' +' + r.a.enh, proposed: r.b.name, dps: r.slot === 'main_hand' ? 'High' : 'Medium', cp: 'Medium', cost: 'Unknown', time: 'High', availability: 'Not verified', difficulty: 'High', risk: 'Medium', confidence: 'Low', longterm: 'High', dependsOn: ['data_stats'], why: r.slot === 'main_hand' ? 'The weapon is usually the biggest single gear factor, but rarity alone does not prove the other item is better.' : 'A different item line, value unknown until stats are recorded.' }));
      });
      var runeBehind = c.slots.filter(function (r) { return r.group === 'rune' && r.verdict === 'behind'; });
      runeBehind.forEach(function (r) { out.push(rec({ id: 'enh_' + r.slot, title: 'Enhance ' + r.slotName + ' (' + r.a.name + ') to +' + r.b.enh, system: 'runes', description: '+' + r.a.enh + ' -> +' + r.b.enh + '.', current: '+' + r.a.enh, proposed: '+' + r.b.enh, dps: 'Low', cp: 'Low', cost: 'Unknown', time: 'Low', availability: 'Now', difficulty: 'Low', risk: 'Unknown', confidence: 'Medium', longterm: 'Medium', why: 'Small, same-item enhancement.' })); });
    }
    var haveEnh = {}; out.forEach(function (r) { haveEnh[r.id] = 1; });
    weakSlots(player).forEach(function (w) {
      if (haveEnh['enh_' + w.slot]) return;
      out.push(rec({ id: 'weak_' + w.slot, title: 'Raise ' + w.slotName + ' (+' + w.enh + ')', system: w.group === 'rune' ? 'runes' : 'equipment', description: w.name + ' is at +' + w.enh + ' while your other ' + (w.group === 'accessory' ? 'accessories' : w.group === 'armor' ? 'armor pieces' : w.group + 's') + ' are around +' + w.typical + '.', current: '+' + w.enh, proposed: 'Towards +' + w.typical, dps: w.group === 'weapon' ? 'Medium' : 'Low', cp: 'Medium', cost: 'Unknown', time: 'Medium', availability: 'Now', difficulty: 'Medium', risk: 'Unknown', confidence: 'Medium', longterm: 'Medium', source: 'Your own gear', why: 'Your weakest piece in this group compared with the rest of your own gear. Costs and success rates are not recorded; treat enhancing as probabilistic.' }));
    });
    if (!bench) {
      var low = DAEVANION.map(function (b2) { return { name: b2.name, v: num(player.daevanion && player.daevanion[b2.id]) }; }).filter(function (x) { return x.v != null; }).sort(function (a2, b2) { return a2.v - b2.v; });
      if (low.length && low[0].v < 50) out.push(rec({ id: 'daevanion_low', title: 'Daevanion: work on ' + low[0].name + ' (' + low[0].v + '%)', system: 'daevanion', description: 'Your least developed board' + (low[1] && low[1].v < 50 ? 's: ' + low.filter(function (x) { return x.v < 50; }).map(function (x) { return x.name + ' ' + x.v + '%'; }).join(', ') : '') + '. Prefer nodes with offensive bonuses.', current: low[0].v + '%', proposed: 'Offensive nodes first', dps: 'Unknown', cp: 'Medium', cost: 'Unknown', time: 'Medium', availability: 'Now', difficulty: 'Medium', risk: 'Low', confidence: 'Low', longterm: 'High', source: 'Your own boards', why: 'Node bonuses are not recorded yet, so this only points at the board.' }));
    }
    var core = player.coreStats || {};
    if (num(core.precision) === 0) out.push(rec({ id: 'core_review', title: 'Review Core Stat allocation (Precision, Might)', system: 'core', description: 'Precision is 0 and Dexterity (defensive) is 68. Precision maps to Accuracy and Critical Hit, Might to Attack Increase. Check point totals and reset rules first; this is a what-if, not an instruction.', current: 'Might ' + num(core.might) + ', Dex ' + num(core.dexterity) + ', Precision 0', proposed: 'Simulate a redistribution', dps: 'Medium', cp: 'Unknown', cost: 'Unknown', time: 'Low', availability: 'Not verified', difficulty: 'Low', risk: 'Low', confidence: 'Low', longterm: 'Medium', source: 'Core Stat tooltip mapping + provisional priority', why: 'Points in defensive Dexterity may be worth more in offensive stats for boss DPS, if resets are possible.' }));
    if (c) {
      var behindB = c.daevanion.filter(function (x) { return x.diff != null && x.diff < 0; });
      if (behindB.length) out.push(rec({ id: 'daevanion', title: 'Daevanion: ' + behindB.map(function (x) { return x.name; }).join(', '), system: 'daevanion', description: 'Behind the benchmark on these boards. Prefer nodes with offensive bonuses; completion % alone says little about damage.', current: behindB.map(function (x) { return x.name + ' ' + x.a + '%'; }).join(', '), proposed: 'Offensive nodes first', dps: 'Unknown', cp: 'Medium', cost: 'Unknown', time: 'Medium', availability: 'Now', difficulty: 'Medium', risk: 'Low', confidence: 'Low', longterm: 'High', why: 'Node bonuses are not recorded yet, so the route cannot be optimised beyond the board level.' }));
    }
    if (player.titles && player.titles.unlocked == null) out.push(rec({ id: 'data_titles', title: 'Record your title collection', system: 'titles', description: 'Titles can carry stat bonuses and count towards Combat Power. ' + (bench && bench.titles && bench.titles.unlocked != null ? 'The character you compare with has ' + bench.titles.unlocked + '/' + bench.titles.total + '.' : ''), current: 'Unknown', proposed: 'Recorded', dps: 'Unknown', cp: 'Unknown', cost: 'Low', time: 'Low', availability: 'Now', difficulty: 'Low', risk: 'Low', confidence: 'High', longterm: 'Medium', source: 'Data quality', why: 'Cheap to record and needed before titles can be part of the advice.' }));
    // the bench name used in a string above
    return out;
  }
  function divineNeeds(d, opts) {
    var pr = (opts && opts.divinePriority) || DIVINE_PRIORITY;
    return DIVINE.map(function (s) { return { id: s.id, name: s.name, level: num(d.divine && d.divine[s.id]), priority: pr.indexOf(s.id) }; })
      .sort(function (a, b) { return a.priority - b.priority; });
  }
  function score(r, mode, done) {
    var w = (RANK_MODES[mode] || RANK_MODES.value).w;
    var s = (w.dps || 0) * LVL[r.dps] + (w.conf || 0) * LVL[r.confidence] + (w.cost || 0) * COST[r.cost] + (w.time || 0) * COST[r.time] +
      (w.avail || 0) * (r.availability === 'Now' ? 3 : r.availability === 'Ongoing' ? 2 : 1) + (w.longterm || 0) * LVL[r.longterm] + (w.cp || 0) * LVL[r.cp];
    var blocked = (r.dependsOn || []).some(function (id) { return !(done && done[id]); });
    return { score: s, blocked: blocked };
  }
  // ordinal ranking on labelled dimensions, not a DPS calculation
  function rank(recs, mode, done) {
    var rows = recs.map(function (r) { var s = score(r, mode, done); return { rec: r, score: s.score, blocked: s.blocked }; });
    rows.sort(function (a, b) { if (a.blocked !== b.blocked) return a.blocked ? 1 : -1; return b.score - a.score; });
    return rows;
  }
  function bestNext(recs, mode, done) {
    var rows = rank(recs, mode, done).filter(function (r) { return !(done && done[r.rec.id]) && r.rec.kind !== 'data'; });
    if (!rows.length) return null;
    var top = rows[0], runner = rows[1];
    var why = top.rec.why + ' Ranked first in "' + (RANK_MODES[mode] || RANK_MODES.value).label + '": DPS ' + top.rec.dps + ', confidence ' + top.rec.confidence + ', cost ' + top.rec.cost + ', time ' + top.rec.time + '.';
    if (top.blocked) why += ' Note: it depends on an unfinished step.';
    if (runner) why += ' Runner-up: ' + runner.rec.title + '.';
    return { rec: top.rec, why: why, score: top.score };
  }
  // order tasks so dependencies come first; throws on a cycle
  function taskOrder(tasks) {
    var byId = {}, seen = {}, stack = {}, out = [];
    tasks.forEach(function (t) { byId[t.id] = t; });
    function visit(t) {
      if (seen[t.id]) return;
      if (stack[t.id]) throw new Error('Dependency cycle at ' + t.title);
      stack[t.id] = true;
      (t.dependsOn || []).forEach(function (d) { if (byId[d]) visit(byId[d]); });
      stack[t.id] = false; seen[t.id] = true; out.push(t);
    }
    tasks.slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0); }).forEach(visit);
    return out;
  }
  function canComplete(task, tasks) {
    var byId = {}; tasks.forEach(function (t) { byId[t.id] = t; });
    var open = (task.dependsOn || []).filter(function (d) { return byId[d] && byId[d].status !== 'done'; });
    return { ok: !open.length, blockedBy: open.map(function (d) { return byId[d].title; }) };
  }
  function resourceCheck(task, resources) {
    var have = {}; (resources || []).forEach(function (r) { have[r.name.toLowerCase()] = r.amount; });
    return (task.materials || []).map(function (m) {
      var h = have[String(m.name).toLowerCase()];
      return { name: m.name, need: m.amount, have: h == null ? null : h, short: h == null ? null : Math.max(0, m.amount - h), guaranteed: m.guaranteed !== false };
    });
  }

  /* ------------------------------------------------------------------ observations and conflicts */
  // decide whether a new observation may replace the current one
  function judge(existingMeta, incomingMeta) {
    if (!existingMeta || !existingMeta.observedAt) return { action: 'accept', reason: 'No earlier observation.' };
    if (!incomingMeta.observedAt) return { action: 'conflict', reason: 'The new value has no observation date.' };
    var older = incomingMeta.observedAt < existingMeta.observedAt;
    var stronger = (STATUS[existingMeta.status] || STATUS.unknown).rank >= STATUS.confirmed.rank;
    if (older && stronger) return { action: 'conflict', reason: 'The new value was observed before the current ' + STATUS[existingMeta.status].label.toLowerCase() + ' value.' };
    if (older) return { action: 'conflict', reason: 'The new value is older than the current value.' };
    return { action: 'accept', reason: 'Newer observation.' };
  }

  /* ------------------------------------------------------------------ validation (screenshots, AI, imports) */
  var CATEGORY = {
    overview: 'Character overview', combatStats: 'Combat Stats', equipment: 'Equipment details', skills: 'Skills (active, passive, Stigmas)',
    pantheon: 'Pantheon', divine: 'Divine Stats', core: 'Core Stats', daevanion: 'Daevanion', arcana: 'Arcana', titles: 'Titles / Collections', dps: 'DPS-meter result'
  };
  function parseNum(x) {
    if (typeof x === 'number') return isFinite(x) ? x : null;
    if (typeof x !== 'string') return null;
    var s = x.trim().replace(/\s/g, '').replace(/%$/, '').replace(/^\+/, '');
    if (!s) return null;
    // 1.234,5 or 1,234.5 or 72.815
    if (/^-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, '').replace(',', '.');
    else if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(s)) s = s.replace(/,/g, '');
    else s = s.replace(',', '.');
    if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
    return parseFloat(s);
  }
  function field(raw, min, max, integer) {
    // raw: number | string | {value, uncertain}
    var unc = false, v = raw;
    if (raw && typeof raw === 'object') { unc = !!raw.uncertain; v = raw.value; }
    if (v == null || v === '') return { value: null, uncertain: true, error: null, raw: raw };
    var n = parseNum(v);
    if (n == null) return { value: null, uncertain: true, error: 'Not a number', raw: raw };
    if (integer && Math.round(n) !== n) return { value: null, uncertain: true, error: 'Must be a whole number', raw: raw };
    if (n < min || n > max) return { value: null, uncertain: true, error: 'Out of range (' + min + '-' + max + ')', raw: raw };
    return { value: n, uncertain: unc, error: null, raw: raw };
  }
  function str(raw, maxLen) {
    var unc = false, v = raw;
    if (raw && typeof raw === 'object') { unc = !!raw.uncertain; v = raw.value; }
    if (v == null) return { value: null, uncertain: true, error: null };
    v = String(v).replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, maxLen || 80);
    return { value: v || null, uncertain: unc || !v, error: null };
  }
  // returns { category, fields: [{path, label, value, uncertain, error}], errors: [] }
  function validateExtraction(category, data) {
    var out = { category: category, fields: [], errors: [] };
    if (!CATEGORY[category]) { out.errors.push('Unknown screenshot category: ' + category); return out; }
    if (!data || typeof data !== 'object' || Array.isArray(data)) { out.errors.push('Extraction is not an object.'); return out; }
    function push(path, label, f, kind) { out.fields.push({ path: path, label: label, value: f.value, uncertain: f.uncertain, error: f.error, kind: kind || 'number' }); }
    if (category === 'overview') {
      push('name', 'Name', str(data.name, 30), 'text');
      push('level', 'Level', field(data.level, 1, 99, true));
      push('cp', 'Combat Power', field(data.cp, 0, 10000000, true));
      push('itemLevel', 'Item Level', field(data.itemLevel, 0, 100000, true));
    } else if (category === 'combatStats') {
      var stats = Array.isArray(data.stats) ? data.stats : [];
      if (!stats.length) out.errors.push('No stats found.');
      stats.slice(0, 80).forEach(function (s, i) {
        var nm = str(s && s.name, 40), id = statIdFor(nm.value);
        var f = field(s && s.value, -1000000, 10000000, false);
        if (!id) f = { value: f.value, uncertain: true, error: 'Unknown stat name, not in catalog', raw: s };
        out.fields.push({ path: 'combatStats.' + (id || ('unknown_' + i)), label: (nm.value || '?') + (s && s.unit ? ' (' + String(s.unit).slice(0, 6) + ')' : ''), value: f.value, uncertain: f.uncertain, error: f.error, kind: 'number', statId: id, unit: s && s.unit ? String(s.unit).slice(0, 6) : (id ? STAT_BY_ID[id].unit : null) });
      });
    } else if (category === 'equipment') {
      var items = Array.isArray(data.items) ? data.items : (data.slot || data.name ? [data] : []);
      if (!items.length) out.errors.push('No equipment found.');
      items.slice(0, 24).forEach(function (it, i) {
        var sid = slotIdFor(it && it.slot), nm = str(it && it.name, 50);
        if (!sid) out.errors.push('Item ' + (i + 1) + ': unknown slot "' + str(it && it.slot, 20).value + '".');
        var base = 'equipment.' + (sid || ('unknown_' + i));
        out.fields.push({ path: base + '.name', label: (sid ? SLOT_BY_ID[sid].name : '?') + ' name', value: nm.value, uncertain: nm.uncertain || !sid, error: sid ? null : 'Unknown slot', kind: 'text', slot: sid });
        var e = field(it && it.enhancement, 0, 30, true); push(base + '.enh', (sid ? SLOT_BY_ID[sid].name : '?') + ' enhancement', e);
        if (it && it.itemLevel != null) push(base + '.itemLevel', (sid ? SLOT_BY_ID[sid].name : '?') + ' item level', field(it.itemLevel, 0, 100000, true));
        if (it && it.rarity != null) push(base + '.rarity', (sid ? SLOT_BY_ID[sid].name : '?') + ' rarity', str(it.rarity, 20), 'text');
        ['rolls', 'soulBinding', 'manastones'].forEach(function (k) {
          (Array.isArray(it && it[k]) ? it[k] : []).slice(0, 12).forEach(function (r, j) {
            var rn = str(r && r.name, 40), rid = statIdFor(rn.value), rv = field(r && r.value, -1000000, 10000000, false);
            out.fields.push({ path: base + '.' + k + '.' + j, label: (sid ? SLOT_BY_ID[sid].name : '?') + ' ' + k + ': ' + (rn.value || '?'), value: rv.value, uncertain: rv.uncertain || !rid, error: rid ? rv.error : 'Unknown stat name', kind: 'roll', statId: rid, statName: rn.value, unit: r && r.unit ? String(r.unit).slice(0, 6) : null, slot: sid, list: k });
          });
        });
      });
    } else if (category === 'skills') {
      var sk = Array.isArray(data.skills) ? data.skills : [];
      if (!sk.length) out.errors.push('No skills found.');
      var known = {}; ['active', 'passive', 'stigma'].forEach(function (t) { SKILLS[t].forEach(function (n) { known[slug(n)] = { name: n, type: t }; }); });
      sk.slice(0, 60).forEach(function (s, i) {
        var nm = str(s && s.name, 40), id = slug(nm.value || ''), k = known[id];
        var f = field(s && s.level, 0, 99, true);
        out.fields.push({ path: 'skills.' + (k ? id : 'unknown_' + i), label: (nm.value || '?') + (k ? ' (' + k.type + ')' : ''), value: f.value, uncertain: f.uncertain || !k, error: k ? f.error : 'Skill not in the Assassin list', kind: 'number', skillId: k ? id : null });
      });
    } else if (category === 'divine') {
      DIVINE.forEach(function (d) { push('divine.' + d.id, d.name, field(data[d.id], 0, 999, true)); });
    } else if (category === 'core') {
      CORE_STATS.forEach(function (d) { push('coreStats.' + d.id, d.name, field(data[d.id], 0, 999, true)); });
    } else if (category === 'daevanion') {
      DAEVANION.forEach(function (d) { push('daevanion.' + d.id, d.name + ' %', field(data[d.id], 0, 100, false)); });
    } else if (category === 'pantheon') {
      push('pantheon.collected', 'Collected', field(data.collected, 0, 10000, true));
      push('pantheon.total', 'Total collectibles', field(data.total, 0, 10000, true));
      if (data.slots != null) push('pantheon.slots', 'Decoration slots', field(data.slots, 0, 1000, true));
      var ef = data.effects || {};
      DIVINE.forEach(function (d) { if (ef[d.id] != null) push('pantheon.effects.' + d.id, 'Pantheon ' + d.name, field(ef[d.id], 0, 9999, true)); });
    } else if (category === 'arcana') {
      var ar = Array.isArray(data.items) ? data.items : [];
      ar.slice(0, 8).forEach(function (a, i) {
        var nm = str(a && a.name, 40); out.fields.push({ path: 'arcana.items.' + i + '.name', label: 'Arcana ' + (i + 1) + ' name', value: nm.value, uncertain: nm.uncertain, error: null, kind: 'text' });
        push('arcana.items.' + i + '.enh', 'Arcana ' + (i + 1) + ' enhancement', field(a && a.enhancement, 0, 30, true));
      });
      if (!ar.length) out.fields.push({ path: 'arcana.state', label: 'Arcana equipped', value: 'none', uncertain: true, error: null, kind: 'text' });
    } else if (category === 'titles') {
      push('titles.unlocked', 'Titles unlocked', field(data.unlocked, 0, 100000, true));
      push('titles.total', 'Titles total', field(data.total, 0, 100000, true));
    } else if (category === 'dps') {
      out.fields.push({ path: 'dps.boss', label: 'Boss / encounter', value: str(data.boss, 60).value, uncertain: !data.boss, error: null, kind: 'text' });
      push('dps.duration', 'Duration (s)', field(data.duration, 0, 36000, false));
      push('dps.totalDamage', 'Total damage', field(data.totalDamage, 0, 1e13, false));
      push('dps.avgDps', 'Average DPS', field(data.avgDps, 0, 1e10, false));
      if (data.burstDps != null) push('dps.burstDps', 'Burst DPS', field(data.burstDps, 0, 1e10, false));
    }
    return out;
  }
  function stripJson(text) {
    if (typeof text !== 'string') return null;
    var a = text.indexOf('{'), b = text.lastIndexOf('}');
    if (a < 0 || b <= a) return null;
    try { return JSON.parse(text.slice(a, b + 1)); } catch (e) { return null; }
  }
  // turn confirmed review fields into a mutation of snapshot data
  function applyFields(d, fields, provenance) {
    var cleared = {};
    fields.forEach(function (f) {
      if (f.skip || f.value == null) return;
      var p = f.path.split('.'), m = meta(provenance.status || 'confirmed', provenance.source, provenance.observedAt, { upload: provenance.upload || null, raw: f.raw == null ? f.value : f.raw });
      if (p[0] === 'combatStats' && f.statId) { d.combatStats = d.combatStats || {}; d.combatStats[f.statId] = { v: f.value, unit: f.unit, m: m }; return; }
      if (p[0] === 'equipment') {
        var slot = p[1]; if (!SLOT_BY_ID[slot]) return;
        d.equipment[slot] = d.equipment[slot] || { name: null, enh: null, rarity: null, itemLevel: null, base: [], rolls: [], soulBinding: [], manastones: [], set: null, acquisition: null, m: m };
        var it = d.equipment[slot];
        if (p[2] === 'rolls' || p[2] === 'soulBinding' || p[2] === 'manastones') { if (!cleared[slot + p[2]]) { it[p[2]] = []; cleared[slot + p[2]] = true; } it[p[2]].push({ stat: f.statId, name: f.statName, value: f.value, unit: f.unit }); }
        else it[p[2]] = f.value;
        it.m = m; return;
      }
      if (p[0] === 'skills') { var s = (d.skills.list || []).filter(function (x) { return x.id === p[1]; })[0]; if (s){ s.level = f.value; s.m = m; } return; }
      if (p[0] === 'divine' || p[0] === 'coreStats' || p[0] === 'daevanion') { d[p[0]] = d[p[0]] || {}; d[p[0]][p[1]] = { v: f.value, m: m }; return; }
      if (p[0] === 'pantheon') { if (p[1] === 'effects') { d.pantheon.effects[p[2]] = f.value; } else d.pantheon[p[1]] = f.value; d.pantheon.m = m; return; }
      if (p[0] === 'titles') { d.titles[p[1]] = f.value; d.titles.m = m; return; }
      if (p[0] === 'arcana') {
        if (p[1] === 'state') { d.arcana.state = 'none'; d.arcana.m = m; return; }
        var i = +p[2]; d.arcana.items[i] = d.arcana.items[i] || { name: null, enh: null, rarity: null, stats: [], m: m };
        d.arcana.items[i][p[3]] = f.value; d.arcana.items[i].m = m; d.arcana.state = 'equipped'; d.arcana.m = m; return;
      }
      if (p.length === 1 && (p[0] === 'cp' || p[0] === 'itemLevel' || p[0] === 'level')) { d[p[0]] = { v: f.value, m: m }; return; }
    });
    if (fields.some(function (f) { return !f.skip && f.value != null && f.path.indexOf('skills.') === 0; })) {
      d.skills.needsRefresh = d.skills.list.some(function (s) { return s.level == null; });
    }
    return d;
  }
  // existing meta for a review path, to detect conflicts with newer data
  function metaAt(d, path) {
    var p = path.split('.');
    try {
      if (p[0] === 'combatStats') return d.combatStats[p[1]] && d.combatStats[p[1]].m;
      if (p[0] === 'equipment') return d.equipment[p[1]] && d.equipment[p[1]].m;
      if (p[0] === 'skills') { var s = d.skills.list.filter(function (x) { return x.id === p[1]; })[0]; return s && s.m; }
      if (p[0] === 'divine' || p[0] === 'coreStats' || p[0] === 'daevanion') return d[p[0]][p[1]] && d[p[0]][p[1]].m;
      if (p[0] === 'pantheon') return d.pantheon.m;
      if (p[0] === 'titles') return d.titles.m;
      if (p[0] === 'arcana') return d.arcana.m;
      if (d[p[0]] && d[p[0]].m) return d[p[0]].m;
    } catch (e) { }
    return null;
  }
  function currentValueAt(d, path) {
    var p = path.split('.');
    try {
      if (p[0] === 'combatStats') return val(d.combatStats[p[1]]);
      if (p[0] === 'equipment') { var it = d.equipment[p[1]]; if (!it) return null; if (p[2] === 'rolls' || p[2] === 'soulBinding' || p[2] === 'manastones') { var r = it[p[2]][+p[3]]; return r ? r.value : null; } return it[p[2]]; }
      if (p[0] === 'skills') { var s = d.skills.list.filter(function (x) { return x.id === p[1]; })[0]; return s ? s.level : null; }
      if (p[0] === 'divine' || p[0] === 'coreStats' || p[0] === 'daevanion') return val(d[p[0]][p[1]]);
      if (p[0] === 'pantheon') return p[1] === 'effects' ? d.pantheon.effects[p[2]] : d.pantheon[p[1]];
      if (p[0] === 'titles') return d.titles[p[1]];
      if (p[0] === 'arcana') { if (p[1] === 'state') return d.arcana.state; var a = d.arcana.items[+p[2]]; return a ? a[p[3]] : null; }
      return val(d[p[0]]);
    } catch (e) { return null; }
  }

  /* ------------------------------------------------------------------ AI proposals (mutations need approval) */
  var PROPOSAL_KINDS = ['set_value', 'add_task', 'complete_task'];
  function validateProposal(p, state) {
    var errs = [];
    if (!p || typeof p !== 'object') return ['Proposal is not an object.'];
    if (PROPOSAL_KINDS.indexOf(p.kind) < 0) errs.push('Unknown proposal kind.');
    if (p.kind === 'set_value') {
      if (!getChar(state, p.character)) errs.push('Unknown character.');
      var v = validateExtraction(p.category, p.data || {});
      if (v.errors.length) errs = errs.concat(v.errors);
      if (!v.fields.some(function (f) { return f.value != null && !f.error; })) errs.push('No valid values in the proposal.');
    }
    if (p.kind === 'add_task' && (!p.title || typeof p.title !== 'string' || p.title.length > 120)) errs.push('Task needs a title (max 120 characters).');
    if (p.kind === 'complete_task' && !(state.tasks || []).some(function (t) { return t.id === p.taskId; })) errs.push('Unknown task.');
    return errs;
  }

  /* ------------------------------------------------------------------ import / export */
  function exportState(state, opts) {
    var s = clone(state);
    if (!(opts && opts.includeKey)) { s.settings.apiKey = ''; s.settings.openaiKey = ''; }
    s.uploads = (s.uploads || []).map(function (u) { var c = {}; for (var k in u) if (k !== 'data') c[k] = u[k]; return c; });
    return { app: APP_ID, version: SCHEMA_VERSION, exportedAt: new Date().toISOString(), state: s };
  }
  function validateImport(obj) {
    var errs = [];
    if (!obj || typeof obj !== 'object') return { ok: false, errors: ['Not a JSON object.'] };
    if (obj.app !== APP_ID) errs.push('Not a Build Architect export.');
    if (typeof obj.version !== 'number') errs.push('Missing schema version.');
    else if (obj.version > SCHEMA_VERSION) errs.push('Export is from a newer version (' + obj.version + ').');
    var st = obj.state;
    if (!st || !Array.isArray(st.characters)) errs.push('No characters in the export.');
    else st.characters.forEach(function (c, i) {
      if (!c || typeof c.id !== 'string' || typeof c.name !== 'string') errs.push('Character ' + (i + 1) + ' is missing id or name.');
      else if (!Array.isArray(c.snapshots) || !c.snapshots.length) errs.push(c.name + ' has no snapshots.');
    });
    return { ok: !errs.length, errors: errs };
  }
  function migrate(state) {
    if (!state.version) state.version = SCHEMA_VERSION;
    ['tasks', 'resources', 'dps', 'research', 'proposals', 'conflicts', 'uploads'].forEach(function (k) { if (!Array.isArray(state[k])) state[k] = []; });
    state.customTiers = state.customTiers || {};
    if (state.selfFocus !== 1) { state.selfFocus = 1; if (state.selected) state.selected.benchmark = ''; }
    state.settings = state.settings || { model: 'claude-sonnet-5-5', apiKey: '', aiEnabled: false };
    var st = state.settings; if (!st.provider) st.provider = 'anthropic'; if (st.openaiKey == null) st.openaiKey = ''; if (!st.openaiModel) st.openaiModel = 'gpt-5';
    state.selected = state.selected || { player: state.characters[0] && state.characters[0].id, benchmark: '', mode: 'boss', rankMode: 'value' };
    return state;
  }
  function csvEscape(v) { v = v == null ? '' : String(v); return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
  function equipmentCsv(ch) {
    var d = cur(ch), rows = [['slot', 'name', 'enhancement', 'rarity', 'item_level', 'status', 'source', 'observed']];
    SLOTS.forEach(function (s) { var it = d.equipment[s.id]; rows.push([s.name, it && it.name, it && it.enh, it && it.rarity, it && it.itemLevel, it && it.m && it.m.status, it && it.m && it.m.source, it && it.m && it.m.observedAt]); });
    return rows.map(function (r) { return r.map(csvEscape).join(','); }).join('\n');
  }
  function snapshotsCsv(ch) {
    var rows = [['snapshot', 'observed', 'created', 'cp', 'item_level', 'divine_total', 'pantheon', 'daevanion_avg', 'arcana']];
    ch.snapshots.forEach(function (s) { var x = snapshotSummary(s.data); rows.push([s.label, s.observedAt, s.createdAt, x.cp, x.itemLevel, x.divineTotal, x.pantheon, x.daevanionAvg, x.arcana]); });
    return rows.map(function (r) { return r.map(csvEscape).join(','); }).join('\n');
  }
  // light hash for duplicate upload detection (FNV-1a over the data URL)
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16); }
  function isDuplicateUpload(state, h) { return (state.uploads || []).some(function (u) { return u.hash === h; }); }

  // paste import: lines like "Combat Power 72,815" or "Vakron Helm +10"
  function parsePasted(text) {
    var out = { cp: null, itemLevel: null, items: [], unknownLines: [] };
    String(text || '').split(/\r?\n/).slice(0, 400).forEach(function (line) {
      var l = line.trim(); if (!l) return;
      var m;
      if ((m = l.match(/combat power\s*[:\-]?\s*([\d.,]+)/i))) { out.cp = parseNum(m[1]); return; }
      if ((m = l.match(/item level\s*[:\-]?\s*([\d.,]+)/i))) { out.itemLevel = parseNum(m[1]); return; }
      if ((m = l.match(/^(.{3,50}?)\s*\+(\d{1,2})$/))) { out.items.push({ name: m[1].trim(), enh: +m[2] }); return; }
      out.unknownLines.push(l.slice(0, 80));
    });
    return out;
  }

  return {
    SCHEMA_VERSION: SCHEMA_VERSION, APP_ID: APP_ID, STATUS: STATUS, CATEGORIES: CATEGORIES, STAT_CATALOG: STAT_CATALOG, STAT_BY_ID: STAT_BY_ID,
    TIER_ORDER: TIER_ORDER, STAT_TIERS_BOSS: STAT_TIERS_BOSS, MODES: MODES, CORE_STATS: CORE_STATS, DIVINE: DIVINE, DIVINE_PRIORITY: DIVINE_PRIORITY,
    DAEVANION: DAEVANION, SLOTS: SLOTS, SLOT_BY_ID: SLOT_BY_ID, SKILLS: SKILLS, CATEGORY: CATEGORY, RANK_MODES: RANK_MODES,
    meta: meta, fv: fv, val: val, num: num, uid: uid, clone: clone, freeze: freeze, slug: slug, fmt: fmt,
    seedState: seedState, emptyState: emptyState, CLASSES: CLASSES, SERVERS: SERVERS, blankData: blankData, newCharacter: newCharacter, parseProfileUrl: parseProfileUrl, selfCheck: selfCheck, weakSlots: weakSlots, tierKey: tierKey, skillsFor: skillsFor, getChar: getChar, latest: latest, cur: cur, commit: commit, snapshot: snapshot,
    statIdFor: statIdFor, slotIdFor: slotIdFor, tiersFor: tiersFor, tierOf: tierOf, itemLine: itemLine,
    cpGap: cpGap, divineTotal: divineTotal, pct: pct, pantheonPct: pantheonPct, daevanionAvg: daevanionAvg, arcanaState: arcanaState, enhTotal: enhTotal,
    snapshotSummary: snapshotSummary, snapshotDiff: snapshotDiff, compare: compare, recommendations: recommendations, divineNeeds: divineNeeds,
    rank: rank, bestNext: bestNext, taskOrder: taskOrder, canComplete: canComplete, resourceCheck: resourceCheck,
    judge: judge, parseNum: parseNum, validateExtraction: validateExtraction, stripJson: stripJson, applyFields: applyFields, metaAt: metaAt, currentValueAt: currentValueAt,
    validateProposal: validateProposal, exportState: exportState, validateImport: validateImport, migrate: migrate,
    equipmentCsv: equipmentCsv, snapshotsCsv: snapshotsCsv, hash: hash, isDuplicateUpload: isDuplicateUpload, parsePasted: parsePasted
  };
});
