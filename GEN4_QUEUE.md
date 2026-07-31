# Gen-4 (16-bit) build-out — status board & queue

The north star (CLAUDE.md): **every property gets BOTH a Gen-3 (8-bit) and a
Gen-4 (16-bit) version**, sharing one home card via the catalog `property` key.
This board tracks what's shipped, the conventions each build has CLAIMED (so
the next build doesn't repeat them), and the prioritized queue. When you ship a
Gen-4 game: add its row to the shipped table (hub concept + typeface + the
mechanics it used), delete its queue line, and keep the claimed lists current —
**in the same PR as the build**.

## Shipped (10 of ~83)

| Property | 16-bit id | 8-bit partner | Hub concept | Title face |
|---|---|---|---|---|
| Dracula | dracula-castle | dracula-8bit | Gothic route map, Transylvania→England | Micro 5 (was Jacquard 24, retired) |
| Robin Hood | robinhood-16 | robinhood-archer | Sherwood forest map | Jersey 25 |
| Sherlock Holmes | sherlock-16 | sherlock-hound | Sepia ordnance case-map, pinned photos + red string | Silkscreen (was Jacquard 12, retired) |
| The Odyssey | odyssey-16 | odysseus-voyage | The wine-dark sea from above, islands + golden wake | Jersey 15 |
| The War of the Worlds | warworlds-16 | warworlds-tripods | Phosphor war-room dispatch map (sanctioned CRT) | Workbench |
| King Arthur | arthur-16 | arthur-sword | THE ROUND TABLE — shields in a ring (circular layout) | Handjet (was Jacquarda Bastarda 9, retired) |
| Treasure Island | treasureisland-16 | treasureisland-map | Jim's own parchment sea-chart — dotted rope trail, singed edges, X marks each stop | Jersey 20 |
| 20,000 Leagues | nemo-16 | nemo-nautilus | Captain's brass console — five glass portholes in a riveted instrument panel | Sixtyfour |
| The Jungle Book | junglebook-mowgli-16 | junglebook-mowgli | Canopy-to-floor jungle cross-section — a vine trail running Council Rock down to Shere Khan's gorge | Jersey 10 |
| Moby-Dick | mobydick-16 | mobydick-hunt | The Pequod's ship's log — a parchment journal page with a decorative chart strip, wax-seal dated entries | Tiny5 |

## Claimed conventions — do NOT reuse

- **Hub shapes used:** route-map trail ×2 (Dracula, Robin Hood), pinned paper
  map ×2 (Sherlock sepia, WotW phosphor), overhead terrain (Odyssey), circular
  ring (Arthur), parchment sea-chart with a dotted rope trail (Treasure Island),
  riveted brass instrument panel with five circular glass portholes (Nemo),
  vertical canopy-to-floor cross-section with a vine trail (Jungle Book),
  an open journal page (ship's log) with a decorative chart strip above
  wax-seal dated entries (Moby-Dick — the "book/scroll" idea, spent).
  Fresh ideas for next builds: a constellation chart, a train/route timetable,
  a family tree, a shop counter, a river descending the screen.
- **Pixel display faces used:** Silkscreen (Sherlock), Handjet (Arthur),
  Micro 5 (Dracula), Jersey 25, Jersey 20 (Treasure Island), Jersey 15,
  Workbench, Sixtyfour (Nemo — the digital/techy face, justified by the
  Nautilus's instruments; not reused for anything non-techy), Jersey 10
  (Jungle Book), Tiny5 (Moby-Dick) (+ Pixelify Sans as the shared UI face).
  Jacquard 24 / Jacquard 12 / Jacquarda Bastarda 9 were RETIRED 2026-07-28 —
  their blackletter forms rendered hero titles illegible ("SHERLOCK HOLMES" as
  "SHCRLDCR / HDLMCS" etc., UX-sweep #34/#37 finding 1, carried 4+ sweeps) —
  do not reuse them for title faces.
- **Mechanics well-spent so far** (avoid stacking more of these; the standouts
  are marked ✦): timing stop-in-band, drag-runner + dodge, whack pop-ups,
  ✦ risk/reward taunt (Odyssey), ✦ simon-says memory (Circe, Nemo's valve oath),
  lane dodge, ✦ two-oar rowing rhythm (Sirens), ✦ push-your-luck hold-to-watch
  (Horsell), ✦ artillery arc-shots (Weybridge), hide-hop reaction (tentacle),
  ✦ alternating-tap tug (sword in the stone), high/low parry duel,
  ✦ perspective joust, balance-hold in a drifting zone, catch-the-good /
  refuse-the-bad sorter, spot-the-true-among-decoys, cover-to-cover creep,
  aim-and-fire broadside duel (Nemo's beak duel), track-the-marked-card
  (Treasure Island), resource deploy/distribute under a timer (Treasure Island
  stockade prep), mode7 racing dodge (Nemo's ice field — first real use of the
  under-used racing genre), pull-of-the-vortex survive+dodge (Nemo's maelstrom),
  ✦ spot-the-swayed social defend (Jungle Book's Council Rock), resist-the-pull
  inhibition tap (Jungle Book's Kaa), hold-to-creep freeze-when-watched stealth
  (Jungle Book's Red Flower), watch-then-pick-a-flank reaction (Jungle Book's
  buffalo run), ✦ pan-scan horizon search (Moby-Dick's masthead — drag to pan a
  wide panorama and tag the true sighting among decoys, a new panning verb),
  drag-and-sort under gravity (Moby-Dick's hold stowing), ✦ sling-release fling
  aim (Moby-Dick's harpoon throws — pull back and release, distinct from the
  artillery arc-shot meter), ✦ dual-meter tending management (Moby-Dick's
  try-works — keep a drifting gauge banded while reacting to skim cues, first
  real use of the under-used tycoon/management genre).
- **Under-used genres for the next wave:** route-planning strategy, fishing,
  tower defense, roguelite runs, disguise/bluff. (Card/board play drawn on by
  Treasure Island's black-spot table, but still has room for a full board.
  Racing/mode7 now spent by Nemo's ice field — still room for a full
  lap-based version. Social deduction now drawn on lightly by Jungle Book's
  Council Rock. Tycoon/management now drawn on by Moby-Dick's try-works —
  still room for a fuller multi-resource sim.)

## Queue (best next candidates, in order)

1. **A Christmas Carol** (`scrooge-carol` or `scrooge-ledger`) — the LEDGER as
   hub (entries = nodes). Past/Present/Future branch choices; also crosses off
   REBUILD_QUEUE #11 in spirit.
2. **Frankenstein** (`frankenstein-spark`) — laboratory wall of instruments as
   hub. Assembly puzzle, lightning-timing revival, alpine pursuit, arctic
   finale; monster-sympathy flag for endings. (Also clears a legacy rebuild.)
3. **Alice in Wonderland** (`alice-rabbithole`) — playing-card hub (deal a
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
