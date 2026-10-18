# Item database and the upgrade finder

## Source

`items-data.js` holds every equippable AION 2 item of item level 40 and up (914 items), exported on 2026-10-18 from the [Metaroad database](https://metaroad.gg/aion2/database/items), which reads the Global game client. Used with permission of the Metaroad owner; every item links back to its Metaroad page.

Format (parsed by `BA.parseItems`): armor sets as one line per set (`name|itemLevel|faction|grade|source|num|suffix|trade|slots`), all other items one line each (`code|name|itemLevel|trade`). The client code carries slot, faction (l Elyos, d Asmodian, a all), grade (r Rare, l Legend, u Unique, e Unique raid item, s Special) and source (craftdraconic, craftdraconiccombo, craftcombo, dropboss, dropparty, dropraid, dropabyss, drop, quest, shopcoin).

Shugo.GG item levels come from NCSOFT's Korea/Taiwan dictionary and differ from the Global client (Spiritforged Dagger 57 there, 45 on Metaroad; the Metaroad stats match what Atool shows for a Global character), so Metaroad is used.

## Refresh

On https://metaroad.gg/aion2/database/items, run the export snippet from the 2026-10-18 session (fetch each slot page, read the item links, keep item level 40+, dedupe variants, group armor sets) and replace the `RAW` text in `items-data.js`. Update `exported` in `BA_ITEMS_META`.

## Formulas

- Item Level (Gear Score) = sum over all 20 slots of (item level + enhancement). Verified: lycaa 1,082 + 148 = 1,230, the value on Atool and Shugo.GG.
- Gain of a swap = new item level - (old item level + enhancement), or new - old when Gear Transfer applies (Unique to Unique: enhancement and soul binding move, manastones and theostones do not).
- Combat Power per Item Level is learned from the character's own snapshots where only gear changed. Before that it is a rough range of 50-100% of current CP / Item Level, labelled as rough.

## Game facts used (community sources, October 2026)

- Noble Belt and Revelation Amulet are never replaced. They go Rare +10, Substance Morph to Epic, +10, morph to Unique, +10. Unique +0 to +10 costs about 5.03 million Kinah and 200,980 Enhance Stones. Belt scrolls come from Strongholds (2 each), amulet scrolls from Monolith Resonance. Sources: [allthings.how](https://allthings.how/aion-2-how-to-upgrade-the-revelation-amulet-and-noble-belt/), [gametruth.com](https://www.gametruth.com/guides/aion-2-noble-belt-revelation-amulet-upgrades/), [space4games.com](https://space4games.com/en/games-en/aion-2-amulet-belt-guide/).
- Gear Transfer keeps enhancement and soul binding; Unique +10 to +15 can fail (reported 65/50/35/25/20%). Source: [timesaver.gg](https://timesaver.gg/blog/aion-2-gear-transfer-guide).
- Crafted tiers: Star 62, Splendent Star 70, Dark 78, Splendent Dark 86, Ebony 94, Splendent Ebony 102 (same item levels in the Metaroad data).
