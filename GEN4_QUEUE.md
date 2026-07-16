# Gen-4 (16-bit) build-out — status board & queue

The north star (CLAUDE.md): **every property gets BOTH a Gen-3 (8-bit) and a
Gen-4 (16-bit) version**, sharing one home card via the catalog `property` key.
This board tracks what's shipped, the conventions each build has CLAIMED (so
the next build doesn't repeat them), and the prioritized queue. When you ship a
Gen-4 game: add its row to the shipped table (hub concept + typeface + the
mechanics it used), delete its queue line, and keep the claimed lists current —
**in the same PR as the build**.

## Shipped (6 of ~83)

| Property | 16-bit id | 8-bit partner | Hub concept | Title face |
|---|---|---|---|---|
| Dracula | dracula-castle | dracula-8bit | Gothic route map, Transylvania→England | Jacquard 24 |
| Robin Hood | robinhood-16 | robinhood-archer | Sherwood forest map | Jersey 25 |
| Sherlock Holmes | sherlock-16 | sherlock-hound | Sepia ordnance case-map, pinned photos + red string | Jacquard 12 |
| The Odyssey | odyssey-16 | odysseus-voyage | The wine-dark sea from above, islands + golden wake | Jersey 15 |
| The War of the Worlds | warworlds-16 | warworlds-tripods | Phosphor war-room dispatch map (sanctioned CRT) | Workbench |
| King Arthur | arthur-16 | arthur-sword | THE ROUND TABLE — shields in a ring (circular layout) | Jacquarda Bastarda 9 |

## Claimed conventions — do NOT reuse

- **Hub shapes used:** route-map trail ×2 (Dracula, Robin Hood), pinned paper
  map ×2 (Sherlock sepia, WotW phosphor), overhead terrain (Odyssey), circular
  ring (Arthur). Fresh ideas for next builds: a book/scroll that turns pages, a
  constellation chart, a train/route timetable, a ship's deck plan, a family
  tree, a dungeon cross-section, a shop counter, a river descending the screen.
- **Pixel display faces used:** Jacquard 24, Jacquard 12, Jacquarda Bastarda 9,
  Jersey 25, Jersey 15, Workbench (+ Pixelify Sans as the shared UI face).
  Still free on Google Fonts: Jersey 10/20, Micro 5, Tiny5, Silkscreen,
  Handjet, Sixtyfour (reserve Sixtyfour/VT323-likes for sci-fi, per CLAUDE.md).
- **Mechanics well-spent so far** (avoid stacking more of these; the standouts
  are marked ✦): timing stop-in-band, drag-runner + dodge, whack pop-ups,
  ✦ risk/reward taunt (Odyssey), ✦ simon-says memory (Circe), lane dodge,
  ✦ two-oar rowing rhythm (Sirens), ✦ push-your-luck hold-to-watch (Horsell),
  ✦ artillery arc-shots (Weybridge), hide-hop reaction (tentacle),
  ✦ alternating-tap tug (sword in the stone), high/low parry duel,
  ✦ perspective joust, balance-hold in a drifting zone, catch-the-good /
  refuse-the-bad sorter, spot-the-true-among-decoys, cover-to-cover creep.
- **Under-used genres for the next wave:** card/board play, tycoon/management,
  route-planning strategy, social deduction, fishing, racing (mode7 was built
  for it), tower defense, roguelite runs, disguise/bluff.

## Queue (best next candidates, in order)

1. **Treasure Island** (`treasureisland-map`) — a pirate CHART hub is a gift
   (X marks each node). Broadside cannon duel, rigging climb, black-spot card
   draw, apple-barrel eavesdrop stealth, Ben Gunn barter, stockade defense.
2. **20,000 Leagues / Nemo** (`nemo-nautilus`) — porthole/instrument-panel hub
   (dive gauges). Depth management, squid tentacle defense, salvage dive,
   maelstrom escape; justified techy look #2 (brass + glass, NOT green CRT).
3. **The Jungle Book** (`junglebook-mowgli`) — canopy-to-floor vertical jungle
   cross-section hub. Monkey-swing chase, Kaa hypnosis resist (pattern),
   red-flower stealth fetch, wolf-pack council choice, Shere Khan boss.
4. **Moby-Dick** (`mobydick-hunt`) — whaling voyage log/chart hub. Mast-top
   spotting (push-your-luck), whaleboat rowing rhythm crew, harpoon arcs,
   try-works management, the white whale multi-stage boss; Ahab-vs-Starbuck
   choice for endings.
5. **A Christmas Carol** (`scrooge-carol` or `scrooge-ledger`) — the LEDGER as
   hub (entries = nodes). Past/Present/Future branch choices; also crosses off
   REBUILD_QUEUE #11 in spirit.
6. **Frankenstein** (`frankenstein-spark`) — laboratory wall of instruments as
   hub. Assembly puzzle, lightning-timing revival, alpine pursuit, arctic
   finale; monster-sympathy flag for endings. (Also clears a legacy rebuild.)
7. **Alice in Wonderland** (`alice-rabbithole`) — playing-card hub (deal a
   hand). Falling, croquet aim, tea-party rhythm, EAT ME/DRINK ME size puzzle,
   card-soldier defense; brightest palette in the set.

## House standards locked in (2026-07-15/16 session)

- RetroSaga2 + RetroGfx2, `superSample:3`, open hub (never `gateNodes`).
- Period pixel `titleFont` loaded in the game's index.html; Pixelify Sans UI.
- Every upgrade must be READ by a later phase (`api.has()`) — no dead grants.
- The node `choice` should change GAMEPLAY too, not just the ending
  (Odyssey's name-shout raises boulder volleys AND swaps the ending).
- Gates: `node --check` · headless walk at 390×780 AND 1280×800, zero
  pageerrors, all phases driven via `__saga2Test.jump(node, phase)` with live
  pointer input · home-page card check (both gen links) · pacing 15-25s per
  survive/distance phase, win AND lose reachable · fresh `thumb.png` (the
  snap-thumbs tool captures saga2 titles automatically) · changelog + stamp.
