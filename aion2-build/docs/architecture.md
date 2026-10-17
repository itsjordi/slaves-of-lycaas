# Architecture

## Overview

```
aion2-build.html
  core.js     window.BA   pure: model, seed, catalogs, compare, recommendations, ranking, validation, import/export
  app.js      window.APP  storage, router (#/view/arg), dialogs, data-act events, Claude client
  views-a.js              dashboard, character, equipment, compare, planner
  views-b.js              pantheon, progression, DPS log, research, import, assistant, settings
```

Views call `BA` for every calculation and `APP.commit` for every change. No view computes game logic on its own.

## Data flow

1. Input: manual forms, screenshot upload (optional Claude vision), pasted text, JSON or CSV.
2. Validation: `BA.validateExtraction(category, data)` turns raw input into typed fields with `uncertain` and `error` flags.
3. Review: the user sees the screenshot, the current value, the new value and conflict flags; nothing is saved yet.
4. Conflict check: `BA.judge` compares observation dates and status; older data needs an explicit "Save anyway".
5. Commit: `BA.commit` clones the latest snapshot, applies the confirmed fields with provenance, and appends a new snapshot.
6. Analysis: `BA.compare`, `BA.recommendations`, `BA.rank`, `BA.bestNext` read the latest snapshot.

## State (schema v1)

```
state
  app, version, createdAt
  characters[]          id, role (player|benchmark), name, cls, race, region, server, guild, url
    snapshots[]         immutable: id, label, observedAt, createdAt, data
      data              level, cp, itemLevel, dps            {v, m}
                        equipment{slot}                      name, enh, rarity, itemLevel, base[], rolls[], soulBinding[], manastones[], set, acquisition, m
                        arcana                               state (none|equipped|unknown), items[], m
                        combatStats{statId}                  {v, unit, m}
                        coreStats{id}, divine{id}, daevanion{id}  {v, m}
                        daevanionNodes[]                     name, board, bonus, value, status, prereq[]
                        pantheon                             collected, total, slots, effects{divineId}, collectibles[], m
                        skills                               needsRefresh, list[] (id, name, type, level, m), rotations
                        titles, pet, wings, collections      objects with m
  tasks[]               upgrade plan: title, recId, status, order, dependsOn[], materials[], actual, completedAt
  resources[]           name, amount, budget
  dps[]                 boss, date, duration, totalDamage, avgDps, burstDps, snapId
  research[]            topic, summary, source, url, published, region, confidence, freshness, kind
  proposals[]           AI-proposed changes waiting for approval
  conflicts[]           history of overridden older observations
  uploads[]             screenshot metadata (image data lives in IndexedDB)
  customTiers{mode}     edited stat rankings
  settings              model, apiKey (never exported), aiEnabled
```

`m` (provenance) = `{status, source, observedAt, importedAt, url?, note?, upload?, raw?}`.

The conceptual entities from the brief (CharacterSnapshot, EquippedItem, ItemStatRoll, PantheonState, UpgradeTask, ResearchSource, ScreenshotUpload, DpsSession and so on) map onto these structures; normalisation was traded for simple immutable snapshot documents.

## AI integration

- `APP.claude(body)` posts to `https://api.anthropic.com/v1/messages` with the user's key, a 90 s timeout and a client-side rate limit.
- Screenshot extraction asks for JSON only, treats image text as data, and uses `{value: null, uncertain: true}` for unreadable values.
- The assistant gets read-only tools (overview, equipment, stats, progression, skills, compare, plan, research, snapshots) executed locally, plus `propose_change`, which only stores a proposal. Approval runs validation again and, for values, goes through the normal review screen.
