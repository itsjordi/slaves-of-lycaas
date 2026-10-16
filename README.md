# Game tools

Two small, free, no-account web tools for the games we actually play. Everything runs in your browser, nothing is sent to a server of ours, and your data stays on your own device.

Live site: https://jordimutsaers.nl/

| Page | File | What it is |
|---|---|---|
| Game arcade | `index.html` | Landing page styled as an arcade shop. Each tool is a cabinet, click it to insert a coin and play. |
| FFXIV | `ffxiv.html` | Retainer's Ledger: crafting costs, market profit, watchlist, gil per hour and more. Pinned to the Light data center. |
| Portfolio | `portfolio.html`, `portfolio.css`, `portfolio.js` | About me, a project list and a career quest log in a minimal editorial style with three-colour pixel art. The CSS and JS are shared with the case studies, so upload all three. |
| Case studies | `case-clubbie.html`, `case-ffxiv.html`, `case-aion2.html` | One page per project, in English and Dutch. Screenshots go in `images/`: Clubbie in `images/clubbie/`, the others directly in `images/` as `ffxiv-<name>.jpg` and `aion2-<name>.jpg`. |
| Aion 2 | `aion2.html` | Daily and weekly board for your main and alts, timers, and a to-do list. Set up for Global Europe (Yustiel). |

Each tool has a "Switch game" link to jump to the other one.

## Aion 2 daily board

A checklist and timer page you can keep open on a second screen.

- **One character at a time.** Tabs for your main and alts. The main's list also holds everything that is server-wide (Duty Missions, Daily Dungeon, Shugo and Invasion keys), so you do it once. Alts only show what is worth doing on an alt.
- **Today and This week.** Only open tasks are shown, finished ones fold into "Done". Tasks you repeat show a counter with plus and minus.
- **Blocks you can arrange.** Today, This week, My to-do and Notes can be dragged or moved up and down, and collapsed or expanded. The layout is remembered.
- **My to-do.** Your own goals, for example "Get Golden crafter ring", with sub-tasks, reordering and no reset.
- **Timers.** A big clock for the next event, a timeline of the coming 6, 12 or 24 hours, and live clocks for server time, daily reset and weekly reset. Click a timer to pin it to the big clock, choose which timers you see, and get an "Active to enter" countdown while you can still join an event.
- **Alerts.** Per timer, with sound and desktop notifications.
- **Pop-out timers.** Opens the timers as a small window for your second screen.
- **Alt guide.** What is shared with your main and what is not, what to do on an alt, how much Kina an alt can earn per week, and the caps worth knowing.
- **Themes.** Aion, Paper, Lamp, Slate and Mist.
- **Backup.** Export and import from the More menu.

Reset times are 07:00 UTC daily, and on Wednesday weekly (09:00 CEST for Europe, probably 08:00 CET after October 25). Limits and event times come from community guides and game-file readers for the Global launch, so they can change with patches. Siege, Abyss boss and Arena times are assumed to follow Berlin server time and are not confirmed for Europe. Check the in-game countdowns when something looks off.

## FFXIV: Retainer's Ledger

*"the retainer fetches; the retainer does not explain itself."*

You give it a link to a craftable item on the FFXIV wiki, and it tells you how many gil that item is going to bleed out of you before it's even in your inventory. It does not care about your glamour choices. It fetches prices. That is its entire personality.

### What it actually does

1. You paste a link like `https://ffxiv.consolegameswiki.com/wiki/AR-Caean_Velvet_Top_of_Striking`, or just type the item's name.
2. It finds the item's ID and asks [Garland Tools](https://garlandtools.org) for the recipe: ingredients and quantities, straight from the game data.
3. It asks [Universalis](https://universalis.app) what those ingredients currently sell for on the **Light** data center and works out a realistic price for however many you need. No extra button, it just happens.
4. It adds it all up. Anything that can't be sold on the market board is labeled **Market prohibited** instead of a price.

Prices are not just "cheapest listing x quantity". A listing is a whole lot you can't split, so if the cheapest one has 8 for sale and you need 3, you are still buying all 8. The retainer spells out exactly what got bought, flags a cheapest listing that looks like a one-off fluke, splits elemental crystals into their own section, and marks Treasure Map ingredients. You can pin a home world and price only what is on your world.

### The windows

Everything opens as its own draggable window, and the Presets button holds ready-made layouts.

- **Craft Cost:** the recipe and every ingredient priced, with how each is obtained and whether crafting it yourself is cheaper.
- **Item Lookup:** how to get a material, without pricing a whole recipe.
- **Shopping List:** everything in your basket combined into one buy list.
- **Profit Calc:** material cost against what the finished item sells for, with a rough 5% market board tax.
- **Watchlist:** ingredients to keep an eye on, with low-price alerts and auto-refresh.
- **Glamour:** paste an [Eorzea Collection](https://ffxiv.eorzeacollection.com) link and get every piece named, priced and explained.
- **Unlockables:** mounts, minions, emotes and more, with how to get them (data via [FFXIV Collect](https://ffxivcollect.com/)).
- **Character Look:** search a character, see their Lodestone portrait and save looks. You can claim a character as yours.
- **Daily Tasks and To-Do:** a recurring checklist that resets itself, and freeform goals.
- **Gold Saucer:** a Mini Cactpot solver.
- **Gil/Hour:** how much you earn by gathering or crafting and selling something, with the whole material chain and recent sale volume.
- **Personal Stats:** tallies of what you did here, plus a backup of everything.

Press Ctrl+K (Cmd+K on Mac) for a quick search that jumps to any window.

### Known limitations

- It shows current listings at the moment you ask. Prices move.
- The "fluke listing" and "lot-limited" detection are heuristics, not guarantees. Sanity-check against the Universalis link before buying.
- It relies on a public wiki and public APIs, routed through public CORS proxies. If all of them are down at once, that is not the retainer's fault. If a lookup fails, the log panel shows which attempt failed and why. Wait a few seconds and try again.
- Host it somewhere such as GitHub Pages. Some browsers refuse to let a local file phone home.
- Your basket, watchlist, tasks and settings live in your own browser's storage. Clearing browser data clears them too, so use the backup buttons now and then.

## Hosting

Plain static files, no build step. Put all the `.html` files plus `portfolio.css` and `portfolio.js` in the root of the repository and turn on GitHub Pages for the main branch.

## Credits

FFXIV data via Console Games Wiki, Garland Tools, Universalis and FFXIV Collect. Aion 2 numbers come from community guides and sites that read the game files, such as MetaBot and Aion2Data. Not affiliated with Square Enix, NCSOFT, or any of those sites. FINAL FANTASY XIV is (c) SQUARE ENIX. AION is a trademark of NCSOFT. These are fan tools for people who would rather double-check than log in and find out the hard way.
