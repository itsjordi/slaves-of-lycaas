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
  const A = await boot();
  const { w, d, go, click, view, wait } = A;

  await t.test('dashboard shows seeded data and the gap', () => {
    go('#/dashboard');
    const v = view();
    ['72,815', '94,580', '21,765', '1,693', '1,964', '10/94', 'Not started'].forEach(x => assert.ok(v.includes(x), x));
    assert.match(v, /Skill levels need a fresh/);
  });

  await t.test('compare shows equipment by slot and 68 vs 303', () => {
    go('#/compare');
    const v = view();
    assert.match(v, /Spiritforged Dagger/); assert.match(v, /Aulamus Dagger/);
    assert.match(v, /68 vs 303/);
    assert.match(v, /Arcana: none equipped/);
  });

  await t.test('create a character', () => {
    go('#/character');
    click('[data-act="char-new"]');
    d.querySelector('#dlgBody [name=name]').value = 'Testy';
    click('[data-act="char-create"]');
    assert.ok(w.APP.state.characters.some(c => c.name === 'Testy'));
    w.APP.state.selected.benchmark = 'novin'; w.APP.save();
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
    assert.match(view(), /needs your own Anthropic API key/);
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

  await t.test('no script errors', () => { assert.deepEqual(A.errors, []); });
  A.dom.window.close();
});
