# AION 2 Build Architect

A local-first character optimization companion for AION 2. Anyone can set up their own character (any class); the built-in tier list is for Assassin PvE boss damage, other classes build their own. It lives at `https://jordimutsaers.nl/aion2-build.html` and is linked from the Aion 2 Daily Board.

It answers: how strong am I, what should I upgrade next and why, which systems am I neglecting, and how much have I improved since the last snapshot. Comparing with another player is optional and lives on the Compare page only. It never invents numbers: unknown values stay "Unknown", provisional rankings stay labelled as provisional.

## Why it is not Next.js + Prisma

The original brief asked for Next.js, Prisma, SQLite and server-side Claude calls. jordimutsaers.nl is a static GitHub Pages site, so there is no server to run route handlers, a database or a hidden API key. The same product was built as a static app instead:

| Brief | Here |
|---|---|
| Next.js + React + TypeScript | Plain HTML and JavaScript (same as the rest of the site), split into a pure core and views |
| Prisma + SQLite | Versioned JSON state in `localStorage`, screenshots in IndexedDB |
| Zod validation | Hand-written validators in `core.js` (`validateExtraction`, `validateImport`, `validateProposal`) |
| Server-side Anthropic SDK | Optional, bring-your-own-key calls from the browser to Claude (`api.anthropic.com`) or ChatGPT (`api.openai.com`) |
| Recharts | Small inline SVG charts |
| Vitest / Playwright | `node:test` unit tests and jsdom end-to-end tests |

## Files

```
aion2-build.html          page shell and styles
aion2-build/core.js       data model, seed, catalogs, calculations, engines, validation (no DOM; also runs in Node)
aion2-build/app.js        storage, routing, dialogs, events, Claude client
aion2-build/views-a.js    dashboard, character, equipment, compare, upgrade planner
aion2-build/views-b.js    tier lists, pantheon, progression, DPS log, research, import, assistant, settings
aion2-build/views-chars.js  first-time setup, characters list with search, AionFlex profile links
aion2-build/views-guide.js  Start here guide, checklist, guided tour, per-page help, Ari the helper, Daily Board link (starts the app)
aion2-build/tests/        unit and end-to-end tests
aion2-build/docs/         architecture, game mechanics, imports, roadmap
```

## Getting started

Upgrades (AskMrRobot style): for every slot the next better item and the best in slot, where it comes from and the exact Item Level gain, from the Metaroad item database (`items-data.js`, see docs/items.md).

The default is a short menu: Home (Combat Power, Item Level and "Do this next", concrete steps from `BA.nextSteps`), Profile (whole character plus sync), Compare (another player's page via their link and the bookmark, shown only, never saved; `BA.compareProfiles`), Tier lists and Start here. "More tools" at the bottom of the menu shows everything else (planner, stat analysis, DPS log, snapshots and snapshot compare, research, AI). Item Level and Gear Score are one value.


New visitors start empty and set up their own character (name, class, server, optional AionFlex profile link; the link fills in the name, region and server). An example character can be loaded to look around. The Profile page shows the whole character and syncs it from AionFlex, Shugo.GG and Atool (bookmark button or copy-paste, one merged review). The fastest start is pasting the copied AionFlex profile page on the setup screen: gear, skills, stats, titles and pet are filled in and checked in a review before saving. No AI key is needed for anything except automatic screenshot reading and the assistant. All data stays in the visitor's own browser.

Open the page and take the 1-minute guided tour, or go to **Start here**: a checklist that ticks itself off (fill in from AionFlex, type in Combat Stats, see where to gain CP, record Genus Insight, record the weapon tooltip, read the tier lists, compare, plan an upgrade, log a DPS run, record titles, export a backup). Every page also has a "How this page works" box. All tables can be sorted by clicking a header (tiers sort S+ first) and filtered with the box above them.

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

Settings > AI: choose Claude (Anthropic) or ChatGPT (OpenAI), paste your own API key, check the model name (defaults `claude-sonnet-5-5` and `gpt-5`; any current vision-capable model works) and enable AI. ChatGPT requests are translated to OpenAI Chat Completions, including images and tool calls. The key is stored in this browser and sent only to the provider you picked. Because the site is static, there is no server to protect it: use a key with a spending limit and do not use it on shared computers. Without a key, screenshot import works in manual mode and the assistant is disabled; everything else works.

## Extras

- **Themes:** the same six as the Daily Board (Aion, Paper, Lamp, Slate, Mist, Pixel). It follows the board's theme until you pick one.
- **Daily Board link:** "To Daily board" on any recommendation or task adds it to "My to-do" on `aion2.html` (same browser storage). The board picks it up live.
- **Help:** the Help button starts the guided tour at any time. Ari, the Aether Sprite in the corner, searches a help index and points at the right button on the right page.

## Tests

```
npm i jsdom            # only needed for the end-to-end tests
node --test aion2-build/tests/*.test.js
```

Unit tests cover self-based recommendations, weak slots, the self check, class-aware tier lists, profile link parsing, CP gap, Divine Stat totals, completion percentages, snapshot diffs, resources, conflicts, imports, extraction validation, untrusted content, proposals and dependencies. The end-to-end tests load the real page in jsdom and go through: dashboard, compare, create character, screenshot import with review and correction, conflict protection, upload rejection, add and complete an upgrade, progress history, export, assistant without a key, and persistence after a restart.

## Known limitations

- No AionFlex API is used or assumed. Import from AionFlex is copy-paste of text or screenshots.
- Research is manual: there is no web search from a static page. Findings are stored with their source and freshness.
- Item rolls, costs, success rates and Arcana sources are not known yet, so most impact labels are qualitative and many confidences are Low.
- No damage formula is implemented. The stat tier list is a provisional, editable hypothesis.
- The browser AI call needs Anthropic's direct-browser-access header; if that is ever disabled, AI features will show an error and manual entry still works.
