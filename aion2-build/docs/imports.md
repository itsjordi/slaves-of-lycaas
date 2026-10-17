# Imports and provenance

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
- Paste text copied from a public profile (Import > Pasted text). Lines like `Combat Power 72,815`, `Item Level 1,693` and `Vakron Helm +10` are recognised.
- Screenshots of the profile.
- The source URL is stored with the import.

The seeded lycaa and Novin data come from AionFlex on 2026-10-17 and are marked as possibly stale; lycaa's CP was confirmed by the player; lycaa's AionFlex skill levels are marked outdated.

## Other imports

- JSON: restore a Build Architect export (versioned, validated, confirm before replace).
- CSV: resources with `name,amount,budget`.
