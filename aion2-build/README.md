# AION 2 Build Architect

A local-first character optimization companion for AION 2, starting with the Assassin class, Global region and PvE boss damage. It lives at `https://jordimutsaers.nl/aion2-build.html` and is linked from the Aion 2 Daily Board.

It answers: how strong am I, what should I upgrade next and why, why does another Assassin have more Combat Power, which systems am I neglecting, and how much have I improved since the last snapshot. It never invents numbers: unknown values stay "Unknown", provisional rankings stay labelled as provisional.

## Why it is not Next.js + Prisma

The original brief asked for Next.js, Prisma, SQLite and server-side Claude calls. jordimutsaers.nl is a static GitHub Pages site, so there is no server to run route handlers, a database or a hidden API key. The same product was built as a static app instead:

| Brief | Here |
|---|---|
| Next.js + React + TypeScript | Plain HTML and JavaScript (same as the rest of the site), split into a pure core and views |
| Prisma + SQLite | Versioned JSON state in `localStorage`, screenshots in IndexedDB |
| Zod validation | Hand-written validators in `core.js` (`validateExtraction`, `validateImport`, `validateProposal`) |
| Server-side Anthropic SDK | Optional, bring-your-own-key calls from the browser to `api.anthropic.com` |
| Recharts | Small inline SVG charts |
| Vitest / Playwright | `node:test` unit tests and jsdom end-to-end tests |

## Files

```
aion2-build.html          page shell and styles
aion2-build/core.js       data model, seed, catalogs, calculations, engines, validation (no DOM; also runs in Node)
aion2-build/app.js        storage, routing, dialogs, events, Claude client
aion2-build/views-a.js    dashboard, character, equipment, compare, upgrade planner
aion2-build/views-b.js    pantheon, progression, DPS log, research, import, assistant, settings
aion2-build/tests/        unit and end-to-end tests
aion2-build/docs/         architecture, game mechanics, imports, roadmap
```

## Running locally

Any static file server works, for example:

```
python3 -m http.server 8000
# open http://localhost:8000/aion2-build.html
```

Opening the file directly (`file://`) also works in most browsers, but storage may be limited.

## Data and storage

- Everything is stored in your browser only. Clearing site data removes it, so export regularly (Settings > Export all data).
- Every confirmed change creates a new immutable snapshot; older snapshots are never edited.
- Each field keeps its own provenance: status (Verified in-game, User-confirmed, Imported, Estimated, Outdated, Unknown), source, observation date and the raw value.

## AI setup (optional)

Settings > AI: paste an Anthropic API key, check the model name (default `claude-sonnet-5-5`, any vision-capable model works) and enable AI. The key is stored in this browser and sent only to Anthropic. Because the site is static, there is no server to protect it: use a key with a spending limit and do not use it on shared computers. Without a key, screenshot import works in manual mode and the assistant is disabled; everything else works.

## Tests

```
npm i jsdom            # only needed for the end-to-end tests
node --test aion2-build/tests/*.test.js
```

Unit tests cover CP gap, Divine Stat totals, completion percentages, snapshot diffs, resources, conflicts, imports, extraction validation, untrusted content, proposals and dependencies. The end-to-end tests load the real page in jsdom and go through: dashboard, compare, create character, screenshot import with review and correction, conflict protection, upload rejection, add and complete an upgrade, progress history, export, assistant without a key, and persistence after a restart.

## Known limitations

- No AionFlex API is used or assumed. Import from AionFlex is copy-paste of text or screenshots.
- Research is manual: there is no web search from a static page. Findings are stored with their source and freshness.
- Item rolls, costs, success rates and Arcana sources are not known yet, so most impact labels are qualitative and many confidences are Low.
- No damage formula is implemented. The stat tier list is a provisional, editable hypothesis.
- The browser AI call needs Anthropic's direct-browser-access header; if that is ever disabled, AI features will show an error and manual entry still works.
