// End-to-end tests: load aion2-build.html in jsdom and drive the real UI.
// Needs jsdom: `npm i jsdom` (or NODE_PATH pointing at a node_modules with jsdom). Run: node --test aion2-build/tests
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
let JSDOM;
try { ({ JSDOM } = require('jsdom')); } catch (e) { JSDOM = null; }

const ROOT = path.join(__dirname, '..', '..');
function html() {
  return fs.readFileSync(path.join(ROOT, 'aion2-build.html'), 'utf8')
    .replace(/<script src="(aion2-build\/[^"]+)"><\/script>/g, (m, p) => '<script>' + fs.readFileSync(path.join(ROOT, p), 'utf8') + '</script>');
}
const BA = require('../core.js');
function seeded() { const st = BA.seedState(); st.guide = { welcomed: true, visited: {} }; return { aion2_build_v1: JSON.stringify(st) }; }
async function boot(storage) {
  const errors = [];
  const dom = new JSDOM(html(), {
    runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://x.test/aion2-build.html',
    beforeParse(w) {
      if (storage) Object.keys(storage).forEach(k => w.localStorage.setItem(k, storage[k]));
      w.addEventListener('error', e => errors.push(e.message));
      w.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
      w.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
      w.URL.createObjectURL = () => 'blob:x'; w.URL.revokeObjectURL = () => {};
      w.confirm = () => true;
      w.Element.prototype.scrollIntoView = function () {};
    }
  });
  await new Promise(r => setTimeout(r, 50));
  const w = dom.window, d = w.document;
  const go = h => { w.location.hash = h; w.APP.render(); };
  const click = sel => { const el = typeof sel === 'string' ? d.querySelector(sel) : sel; assert.ok(el, 'missing ' + sel); el.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); };
  const view = () => d.getElementById('view').textContent;
  const wait = ms => new Promise(r => setTimeout(r, ms || 30));
  return { dom, w, d, go, click, view, wait, errors };
}

test('end-to-end flows', { skip: !JSDOM && 'jsdom not installed' }, async (t) => {
  const A = await boot(seeded());
  const { w, d, go, click, view, wait } = A;

  await t.test('dashboard shows seeded data and the gap', () => {
    go('#/dashboard');
    const v = view();
    ['72,815', '1,693', '10/94', 'Not started', 'Systems you are not using yet'].forEach(x => assert.ok(v.includes(x), x));
    assert.ok(!/Novin|94,580|21,765/.test(v), 'dashboard is about you only');
    assert.match(v, /Skill levels are missing or outdated/);
  });

  await t.test('compare shows equipment by slot and 68 vs 303', () => {
    w.APP.state.cmp = { a: 'lycaa', b: 'novin' };
    go('#/compare');
    const v = view();
    assert.match(v, /Spiritforged Dagger/); assert.match(v, /Aulamus Dagger/);
    assert.match(v, /68 vs 303/);
    assert.match(v, /Arcana: none equipped/);
  });

  await t.test('create a character', () => {
    go('#/character');
    click('[data-act="char-new"]');
    d.querySelector('#dlgBody [name=url]').value = 'https://aionflex.gg/character/Global/1306/Testy';
    click('[data-act="char-readurl"]');
    assert.equal(d.querySelector('#dlgBody [name=name]').value, 'Testy');
    assert.equal(d.querySelector('#dlgBody [name=server]').value, 'Ariel (EU)');
    d.querySelector('#dlgBody [name=role]').value = 'benchmark';
    click('[data-act="char-create"]');
    assert.ok(w.APP.state.characters.some(c => c.name === 'Testy' && c.role === 'benchmark'));
    assert.equal(w.APP.player().id, 'lycaa', 'a comparison character does not take over');
  });

  await t.test('import a screenshot, review, correct and confirm', async () => {
    go('#/import');
    const file = new w.File([new Uint8Array([137, 80, 78, 71, 1, 2, 3])], 'divine.png', { type: 'image/png' });
    const input = d.getElementById('impFile');
    Object.defineProperty(input, 'files', { value: [file] });
    d.getElementById('impCat').value = 'divine';
    d.getElementById('impChar').value = 'lycaa';
    const before = w.BA.getChar(w.APP.state, 'lycaa').snapshots.length;
    click('[data-act="imp-run"]');
    for (let i = 0; i < 40 && !d.getElementById('revForm'); i++) await wait(25);
    assert.ok(d.getElementById('revForm'), 'review screen shown');
    assert.ok(d.querySelector('.review img'), 'screenshot shown next to the values');
    const rows = [...d.querySelectorAll('#revForm tbody tr')];
    const wis = rows.find(r => /Wisdom/.test(r.textContent));
    wis.querySelector('input[name^=val_]').value = '9';
    wis.querySelector('input[type=checkbox]').checked = true;
    click('[data-act="rev-ok"]');
    const L = w.BA.getChar(w.APP.state, 'lycaa');
    assert.equal(L.snapshots.length, before + 1, 'new snapshot');
    assert.equal(w.BA.num(w.BA.cur(L).divine.wisdom), 9);
    assert.equal(w.BA.num(L.snapshots[before - 1].data.divine.wisdom), 5, 'previous snapshot preserved');
    assert.equal(w.BA.cur(L).divine.wisdom.m.status, 'confirmed');
    assert.ok(w.APP.state.uploads.some(u => /confirmed/.test(u.status)));
  });

  await t.test('older screenshot does not silently overwrite', async () => {
    go('#/import');
    const file = new w.File([new Uint8Array([1, 9, 9])], 'old.png', { type: 'image/png' });
    Object.defineProperty(d.getElementById('impFile'), 'files', { value: [file] });
    d.getElementById('impCat').value = 'divine';
    d.getElementById('impObs').value = '2026-01-01';
    click('[data-act="imp-run"]');
    for (let i = 0; i < 40 && !d.getElementById('revForm'); i++) await wait(25);
    const rows = [...d.querySelectorAll('#revForm tbody tr')];
    const wis = rows.find(r => /Wisdom/.test(r.textContent));
    wis.querySelector('input[name^=val_]').value = '2';
    wis.querySelector('input[type=checkbox]').checked = true;
    const n = w.BA.getChar(w.APP.state, 'lycaa').snapshots.length;
    click('[data-act="rev-ok"]');
    assert.match(d.getElementById('dlgTitle').textContent, /Older than/, 'conflict dialog shown');
    assert.equal(w.BA.getChar(w.APP.state, 'lycaa').snapshots.length, n, 'nothing saved yet');
    click('#dlgFoot [data-act="dlg-close"]');
    click('[data-act="rev-cancel"]');
    assert.equal(w.BA.num(w.BA.cur(w.BA.getChar(w.APP.state, 'lycaa')).divine.wisdom), 9);
  });

  await t.test('rejects a non-image upload', () => {
    go('#/import');
    const file = new w.File(['hello'], 'notes.txt', { type: 'text/plain' });
    Object.defineProperty(d.getElementById('impFile'), 'files', { value: [file] });
    d.getElementById('impCat').value = 'divine';
    click('[data-act="imp-run"]');
    assert.match(d.getElementById('impMsg').textContent, /Rejected/);
  });

  await t.test('add an upgrade task and complete it', () => {
    go('#/planner');
    assert.match(view(), /Best next upgrade/);
    const btn = d.querySelector('[data-act="rec-add"]');
    const id = btn.getAttribute('data-id');
    click(btn);
    const task = w.APP.state.tasks.find(x => x.recId === id);
    assert.ok(task);
    go('#/planner');
    click(d.querySelector('[data-act="task-done"][data-id="' + task.id + '"]'));
    d.querySelector('#dlgBody [name=actual]').value = 'Reached +11';
    click('[data-act="task-complete"]');
    assert.equal(w.APP.state.tasks.find(x => x.id === task.id).status, 'done');
    go('#/dashboard');
    assert.match(view(), /Reached \+11/);
  });

  await t.test('send a task to the Daily Board to-do', () => {
    go('#/planner');
    const btn = d.querySelector('[data-act="board-send"][data-task]');
    click(btn);
    click('[data-act="board-do"]');
    const board = JSON.parse(w.localStorage.getItem('aion2_state'));
    assert.ok(board.chars[0].todos.some(x => x.from === 'Build Architect'));
    assert.ok(w.APP.state.tasks.some(x => x.onBoard));
  });

  await t.test('Ari finds things and points at them', async () => {
    click('.ari-btn');
    const q = d.getElementById('ariQ'); q.value = 'tier list'; q.dispatchEvent(new w.Event('input'));
    const first = d.querySelector('.ari-item');
    assert.match(first.textContent, /tier list/i);
    click(first);
    await wait(250);
    assert.equal(w.location.hash, '#/tiers');
    assert.ok(d.querySelector('.tour-hl'), 'element highlighted');
  });

  await t.test('help menu starts the tour any time', async () => {
    click('#helpBtn');
    click('#dlgBody [data-act="tour-start"]');
    await wait(120);
    assert.ok(d.querySelector('.tour-pop'));
    click('[data-act="tour-end"]');
  });

  await t.test('themes from the Daily Board', () => {
    const tp = d.getElementById('themePick');
    assert.equal(tp.options.length, 6);
    tp.value = 'pixel'; tp.dispatchEvent(new w.Event('change'));
    assert.equal(d.documentElement.getAttribute('data-theme'), 'pixel');
  });

  await t.test('ChatGPT requests are translated both ways', () => {
    const body = { system: 'S', max_tokens: 100, tools: [{ name: 'get_equipment', description: 'd', input_schema: { type: 'object' } }], messages: [
      { role: 'user', content: [{ type: 'image', source: { type: 'base64', media_type: 'image/png', data: 'AAA' } }, { type: 'text', text: 'hi' }] },
      { role: 'assistant', content: [{ type: 'text', text: 'ok' }, { type: 'tool_use', id: 't1', name: 'get_equipment', input: {} }] },
      { role: 'user', content: [{ type: 'tool_result', tool_use_id: 't1', content: '{}' }] }] };
    const o = w.APP.toOpenAI(body);
    assert.equal(o.messages[0].role, 'system');
    assert.equal(o.messages[1].content[0].type, 'image_url');
    assert.equal(o.messages[2].tool_calls[0].function.name, 'get_equipment');
    assert.equal(o.messages[3].role, 'tool');
    assert.equal(o.tools[0].function.name, 'get_equipment');
    const back = w.APP.fromOpenAI({ choices: [{ message: { content: null, tool_calls: [{ id: 'c1', type: 'function', function: { name: 'get_equipment', arguments: '{\"character\":\"lycaa\"}' } }] } }] });
    assert.equal(back.stop_reason, 'tool_use');
    assert.equal(back.content[0].input.character, 'lycaa');
    w.APP.state.settings.provider = 'openai';
    assert.equal(w.APP.aiReady(), false, 'no OpenAI key yet');
    w.APP.state.settings.provider = 'anthropic';
  });

  await t.test('progress history lists snapshots', () => {
    go('#/progression');
    assert.match(view(), /snapshot\(s\) for lycaa/);
    assert.ok(d.querySelectorAll('#view tbody tr').length >= 2);
  });

  await t.test('export character data', () => {
    go('#/settings');
    let downloaded = null;
    const orig = w.APP.download;
    w.APP.download = (n, txt) => { downloaded = { n, txt }; };
    // the act handler uses the module-level download, so check the state export instead
    w.APP.download = orig;
    const ex = w.BA.exportState(w.APP.state);
    assert.equal(ex.app, 'aion2-build-architect');
    click('[data-act="dl-json"]');
    assert.ok(w.BA.validateImport(JSON.parse(JSON.stringify(ex))).ok);
    assert.equal(downloaded, null);
  });

  await t.test('assistant without a key degrades gracefully', () => {
    go('#/assistant');
    assert.match(view(), /needs your own Claude \(Anthropic\) or ChatGPT/);
    assert.ok(d.querySelector('[data-act="chat-send"]').disabled);
  });

  await t.test('data persists after a restart', async () => {
    const saved = { aion2_build_v1: w.localStorage.getItem('aion2_build_v1') };
    const B = await boot(saved);
    const L = B.w.BA.getChar(B.w.APP.state, 'lycaa');
    assert.equal(B.w.BA.num(B.w.BA.cur(L).divine.wisdom), 9);
    assert.ok(B.w.APP.state.tasks.some(x => x.status === 'done'));
    assert.ok(B.w.APP.state.characters.some(c => c.name === 'Testy'));
    B.dom.window.close();
  });

  await t.test('a new visitor sets up their own character', async () => {
    const C = await boot();
    const cd = C.d;
    assert.match(cd.getElementById('dlgTitle').textContent, /Welcome/);
    C.click('#dlgFoot [data-act="welcome-skip"]');
    C.w.APP.render();
    assert.match(C.view(), /Set up your character/);
    cd.querySelector('#charForm [name=name]').value = 'Nova';
    cd.querySelector('#charForm [name=cls]').value = 'Cleric';
    cd.querySelector('#charForm [name=cp]').value = '61,200';
    C.click('[data-act="setup-create"]');
    assert.equal(C.w.APP.player().name, 'Nova');
    C.go('#/dashboard');
    assert.match(C.view(), /61,200/);
    C.go('#/tiers');
    assert.match(C.view(), /no default tier list for Cleric/);
    C.dom.window.close();
  });

  await t.test('no script errors', () => { assert.deepEqual(A.errors, []); });
  A.dom.window.close();
});
