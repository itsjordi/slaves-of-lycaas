# Imports and provenance

No AI or API key is needed for any import. The order of preference is: AionFlex page text, typing values in, then screenshots (with AI, or typed next to the image).

## Profile sync: AionFlex, Shugo.GG and Atool (Profile page)

All three sites show NCSOFT's official character data, each a different part of it. None of them (nor NCSOFT's API) allows calls from another website (CORS, checked 2026-10-18), so nothing is fetched. Pages come in two ways:

- Bookmark button "Send to Build Architect" (drag once to the bookmarks bar). On a profile page it sends `document.body.innerText` and the page URL to `aion2-build.html#/profile/in?u=...&d=...` in a window named `aion2_build` (reused on every click). On Shugo.GG it first clicks the Skills, Daevanion and Equipment tabs and adds each tab's text. The data is in the URL fragment, so it never reaches a server.
- Copy and paste on Profile > Sync (Ctrl+A, Ctrl+C). The site is detected from the text (`BA.detectSource`). Shugo.GG tabs pasted one by one are added up.

Received pages wait in `state.syncInbox` until "Review and save". `BA.syncFields` merges them into one review: one row per value, the source order Atool, Shugo.GG, AionFlex decides when sites disagree, and the Flags column lists the other values. Pair slots (earrings, rings, bracelets, runes) follow AionFlex's explicit slot numbers, then the slot that already holds the same item. After saving, `character.sync[source]` and `character.links[source]` are updated.

What each parser reads:

| Site | Parser | Reads |
| --- | --- | --- |
| Atool | `BA.parseAtoolText` | name, server, race, class, legion, last-updated date (used as observation date), Gear Score (stored as Item Level), Combat Power, overall/class/server rank, DPS hexagon (without Daevanion), skills by type, every item with base stats, soul engraving lines with grade and %, sub-skills, manastones and theostone, Daevanion nodes, title count and equipped titles with effects, Divine Stats, common (core) stats, pet and wings names |
| Shugo.GG | `BA.parseShugoText` | name, level, server, class, race, title, Item Level / Gear Score ("iLvl"), Combat Power, gear by slot, active and passive skills, equipped stigmas (not-acquired ones are skipped), Daevanion nodes and the board stat bonuses, pet and level, wings |
| AionFlex | `BA.parseAionFlexText` | see below |

Item Level and Gear Score are the same stat and are stored as one value. For lycaa on 2026-10-18 AionFlex showed 1,701 while Atool and Shugo.GG showed 1,230; the review flags this and Atool wins by default.

Not read on purpose: Shugo.GG Divine Stats (showed 0 for every stat on 2026-10-18) and its "Base stats" (lower than the totals on the other sites). Atool's own score and stat simulations are their estimates, not game values.

Fixtures: `tests/atool-sample.txt`, `tests/shugo-sample.txt`, `tests/aionflex-sample.txt`.

## From AionFlex (Import tab)

AionFlex renders in the browser and its API does not allow calls from other sites (CORS), so this tool never fetches from AionFlex. Instead the user copies the page:

1. Open the profile on AionFlex (search: https://aionflex.gg/search, then click the character).
2. Ctrl+A, Ctrl+C on the loaded page; paste on Import > From AionFlex (or on the first-time setup screen) and press Read.
3. `BA.parseAionFlexText` reads: name, level, class, region, race, server, guild, title, Combat Power, Item Level, all 20 gear slots with enhancement (`MainHand`, `Earring1`, `Rune2`... mapped to slot ids), active/passive/stigma skill levels, Divine Stats, Core Stats and their cap (`/ 200`), Daevanion board %, titles collected/total, pet and level, wings and grade. Cosmetics are ignored.
4. `BA.aionflexFields` turns that into review rows (current value next to new value). Unchanged values start unticked; skills that are not in the list yet (equipped stigmas) are added as new skills; a changed item name clears the old item's rolls.
5. The review picks the character with the same name, or offers "New character"; a new visitor gets their character created on confirm. Values are saved with status "Imported from external source" and the profile link as source.

Bookmarklet: the From AionFlex tab offers a draggable bookmark. On an AionFlex profile it opens `aion2-build.html#/import/aionflex?u=<profile url>&d=<page text>`; the text is in the URL fragment, so it never reaches a server. The app reads it, clears the fragment, and opens the review.

Not on AionFlex: item rolls, Soul Binding, Manastones, the Combat Stats window, Arcana, Pantheon. Those are typed in (Import > Type it in, or the Character and Equipment pages).

Test fixture: `tests/aionflex-sample.txt` (lycaa, 2026-10-18).

## Type it in

Import > Type it in opens the same review form for any category without a screenshot.

## Screenshot workflow

1. Upload one or more PNG, JPG or WebP files (max 8 MB each). Other types are rejected.
2. Choose the character, the observation date and the screenshot type (or automatic detection when AI is on).
3. With AI: the image goes to Claude with a JSON-only extraction prompt. Text inside the image is treated as data, never as instructions. Unreadable digits must come back as `{value: null, uncertain: true}`.
4. Without AI, or when AI fails: a manual form for that type opens next to the screenshot.
5. Validation (`BA.validateExtraction`): unknown slots, unknown stat or skill names, out-of-range numbers and malformed values are flagged. Localised numbers (`72.815`, `1.234,5`, `12,5%`) are parsed; enhancement (`+11`) and skill levels are kept apart.
6. Review: screenshot, current value, new value, flags. Rows with errors, unchanged values or conflicts start unticked.
7. Confirm: an older observation than the saved one triggers a "Save anyway" dialog; overrides are logged in the conflict history.
8. Save: a new snapshot is created. The previous snapshot stays untouched. The screenshot is stored in IndexedDB and referenced from each saved value.

Duplicate images are detected by hash and flagged during review.

Supported types: character overview, combat stats, equipment details (with rolls, Soul Binding, Manastones), skills (active, passive, Stigmas), Pantheon, Divine Stats, Core Stats, Daevanion, Arcana, titles, DPS-meter results.

## Provenance

Every value stores status (Verified in-game, User-confirmed, Imported from external source, Estimated, Outdated, Unknown), source, observation date, import date and the raw value. Hover a status pill to see it. Each field ages on its own: a current CP says nothing about the gear or skills.

## AionFlex

There is no public AionFlex API that this tool relies on, and nothing is fetched from AionFlex. Supported ways in:
- Paste the whole profile page (Import > From AionFlex, see above). The older free-text reader (Import > Other text) still recognises lines like `Combat Power 72,815`, `Item Level 1,693` and `Vakron Helm +10` are recognised.
- Screenshots of the profile.
- The source URL is stored with the import.

The seeded lycaa and Novin data come from AionFlex on 2026-10-17 and are marked as possibly stale; lycaa's CP was confirmed by the player; lycaa's AionFlex skill levels are marked outdated.

## Other imports

- JSON: restore a Build Architect export (versioned, validated, confirm before replace).
- CSV: resources with `name,amount,budget`.
