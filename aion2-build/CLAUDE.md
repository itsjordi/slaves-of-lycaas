# Build Architect - working notes for Claude

Static app on GitHub Pages (jordimutsaers.nl). No build step, no server, no npm dependencies at runtime.

## Architecture
- `core.js`: pure logic, UMD (`window.BA` in the browser, `require` in Node). All calculations, engines and validators go here.
- `app.js`: shell (storage, router, dialogs, event delegation via `data-act` / `data-chg`, Claude client).
- `views-a.js`, `views-b.js`: render functions returning HTML strings. Keep business logic out of them.
- Page: `../aion2-build.html`. Linked from `../aion2.html`.

## Standards
- ES5-style JavaScript to match the rest of the site; no frameworks.
- Escape every user, screenshot or AI derived string with `APP.e()` before inserting HTML.
- Site copy in English, no em/en dashes, straight quotes.

## Data integrity (do not break)
- Never invent game numbers, formulas, drop rates, costs or per-item CP. Use "Unknown" / "Not verified".
- Every confirmed change goes through `BA.commit` and creates a new snapshot. Never mutate old snapshots.
- Every value carries provenance (`BA.meta`). Older observations must not silently replace newer ones (`BA.judge` + the conflict dialog).
- AI output is untrusted: validate with `BA.validateExtraction` / `BA.validateProposal`; mutations need user approval.
- Pantheon display effects and Divine Stat values stay separate.
- lycaa's AionFlex skill levels are outdated: never treat them as current.
- The tool is about the player's own character; comparison stays opt-in on the Compare page (`APP.bench()` returns null on purpose).
- Nothing is fetched from AionFlex. Only profile links are parsed for name/region/server.

## Commands
- Tests: `node --test aion2-build/tests/*.test.js` (e2e needs `jsdom`).
- Local run: `python3 -m http.server` in the repo root.
