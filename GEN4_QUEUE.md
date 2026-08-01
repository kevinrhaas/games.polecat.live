# Gen-4 (16-bit) build-out — status board & queue

The north star (CLAUDE.md): **every property gets BOTH a Gen-3 (8-bit) and a
Gen-4 (16-bit) version**, sharing one home card via the catalog `property` key.
This board tracks what's shipped, the conventions each build has CLAIMED (so
the next build doesn't repeat them), and the prioritized queue. When you ship a
Gen-4 game: add its row to the shipped table (hub concept + typeface + the
mechanics it used), delete its queue line, and keep the claimed lists current —
**in the same PR as the build**.

## Shipped (14 of ~83)

| Property | 16-bit id | 8-bit partner | Hub concept | Title face |
|---|---|---|---|---|
| The Wizard of Oz | oz-16 | oz-yellowbrick | Dorothy's own patchwork quilt spread out at bedtime — five patches (Kansas, the cornfield, the poppies, the Witch's castle, the Emerald City) stitched together by a dashed gold thread trail | DotGothic16 |
| Frankenstein | frankenstein-16 | frankenstein-spark | Victor's own laboratory wall of mounted instruments — a Leyden jar, a cracked shutter, a spyglass, an altimeter, a frost-rimed compass — linked by a copper wire the eye can trace | Bitcount Prop Single |
| A Christmas Carol | scrooge-16 | scrooge-carol | Scrooge's own bracket clock on the counting-house wall — nodes mounted at the story's true hours (XII, I, II, III) with dawn breaking below the case for Christmas Morning | Rubik Pixels |
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
| Alice in Wonderland | alice-16 | alice-rabbithole | A dealt hand of five playing cards, fanned across the felt table | VT323 |

## Claimed conventions — do NOT reuse

- **Hub shapes used:** route-map trail ×2 (Dracula, Robin Hood), pinned paper
  map ×2 (Sherlock sepia, WotW phosphor), overhead terrain (Odyssey), circular
  ring (Arthur), parchment sea-chart with a dotted rope trail (Treasure Island),
  riveted brass instrument panel with five circular glass portholes (Nemo),
  vertical canopy-to-floor cross-section with a vine trail (Jungle Book),
  an open journal page (ship's log) with a decorative chart strip above
  wax-seal dated entries (Moby-Dick — the "book/scroll" idea, spent), a
  bracket clock face with nodes mounted at the story's true hours, an
  asymmetric sweep rather than an evenly-spaced ring (A Christmas Carol), a
  wall of mounted brass instruments linked by a copper wire the eye can trace
  (Frankenstein — the "workshop wall" idea, spent), a fanned hand of playing
  cards dealt across a felt table (Alice in Wonderland), a stitched patchwork
  quilt of story patches joined by a dashed gold thread trail (The Wizard of
  Oz — the "textile/craft" idea, spent).
  Fresh ideas for next builds: a constellation chart, a train/route timetable,
  a family tree, a shop counter, a river descending the screen.
- **Pixel display faces used:** Silkscreen (Sherlock), Handjet (Arthur),
  Micro 5 (Dracula), Jersey 25, Jersey 20 (Treasure Island), Jersey 15,
  Workbench, Sixtyfour (Nemo — the digital/techy face, justified by the
  Nautilus's instruments; not reused for anything non-techy), Jersey 10
  (Jungle Book), Tiny5 (Moby-Dick), Rubik Pixels (A Christmas Carol),
  Bitcount Prop Single (Frankenstein — a modular circuit-board face, justified
  by the lab's galvanism; not reused for anything non-technical), VT323
  (Alice in Wonderland — a tall CRT-terminal face; picked deliberately for a
  non-techy property, an exception to the "CRT faces are for techy properties"
  guideline made only after a first pick failed the legibility gate below)
  (+ Pixelify Sans as the shared UI face).
  Jacquard 24 / Jacquard 12 / Jacquarda Bastarda 9 were RETIRED 2026-07-28 —
  their blackletter forms rendered hero titles illegible ("SHERLOCK HOLMES" as
  "SHCRLDCR / HDLMCS" etc., UX-sweep #34/#37 finding 1, carried 4+ sweeps) —
  do not reuse them for title faces. Micro 5 Charted was tried and REJECTED
  for Alice in Wonderland 2026-08-01 for the same reason: its ruled graph-paper
  overlay renders as dense illegible hatching at hero-title size, not text —
  do not reuse it for title faces either. **Screenshot-check any new title
  face at actual render size before committing to it** — this class of bug
  doesn't show up in code review, only in a rendered frame. DotGothic16 (The
  Wizard of Oz — a clean geometric dot-matrix face, screenshot-checked at hero
  size 2026-08-01 and fully legible; picked for a whimsical non-techy property
  as a further exception to the "CRT/dot faces are for techy properties"
  guideline, same precedent as VT323 on Alice in Wonderland) was added to the
  used list, not retired.
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
  real use of the under-used tycoon/management genre), timing-bar grip/strike
  (Marley's chain), candle-juggle defend (Christmas Past's three memories),
  catch/avoid lane-sort (the Cratchits' table — gift good, coal decoy),
  hold-to-creep freeze-when-watched stealth reused once more (the Phantom),
  ✦ drag-scrub reveal against regrowing frost (Christmas Yet to Come's
  gravestone — a new "clear it before it creeps back" verb, distinct from the
  artillery/fling/tending meters already spent), 3-station timed sequence
  chase (Christmas Morning's redemption dash — reaction tap, timing-bar,
  rhythm tap chained in one node), diagram-guided assembly (Frankenstein's
  anatomy table — a permanently visible reference order, not a memorized
  simon-says sequence, a new "sort to a visible plan" verb), falling-note lane
  tap reused once more (the storm's revival), hold-lean stealth reused once
  more (the De Laceys' window), timing-band leap-to-next-ledge (the glacier
  ascent, a bounded on-screen variant of the timing-bar family), reaction
  size-match against a shrinking window (Alice's Hall of Doors — drink/wait/
  eat to become the right size before the door shuts, a new "state-match under
  a deadline" verb, distinct from the timing-bar/falling-note families),
  closing-ring timing catch (the Mad Tea Party's pour — a concentric ring
  shrinking onto a fixed target, a circular variant of the timing-band family),
  ✦ tower-defense tap-to-repel waves (the Trial's dock defense — first real
  use of the under-used tower-defense genre, with a decoy the player must
  learn NOT to tap), ✦ orbit-dodge (the Cyclone's spinning funnel wall — drag/
  arrow to travel around a ring instead of along a lane or plane, a new
  circular-locomotion verb, distinct from the timing-band/lane-dodge
  families), a fuller multi-lane tower-defense build (the Cornfield Watch —
  three lanes instead of one dock, reused from Alice's Trial but at the
  "fuller build" the under-used-genres note called for), ✦ triage defense of
  multiple named, individually-tracked allies (the Flying Monkeys — three
  companions with their own HP, forcing quick attention-switching between
  threatened targets, distinct from a single-target whack/defend).
- **Under-used genres for the next wave:** route-planning strategy, fishing,
  roguelite runs, disguise/bluff. (Card/board play drawn on by Treasure
  Island's black-spot table AND Alice's dealt-hand hub, but still has room for
  a full board. Racing/mode7 now spent by Nemo's ice field — still room for a
  full lap-based version. Social deduction now drawn on lightly by Jungle
  Book's Council Rock. Tycoon/management now drawn on by Moby-Dick's
  try-works — still room for a fuller multi-resource sim. Tower defense now
  drawn on twice — Alice's single-dock Trial, then Oz's three-lane Cornfield
  Watch — still room for a bigger multi-wave build.)

## Queue (best next candidates, in order)

(empty — pick the next property by fame + genre variety per BUILD_LOOP.md
when this list is empty)

### Note on The Wizard of Oz (shipped 2026-08-01)

`oz-16` pairs with `oz-yellowbrick` via `property: "The Wizard of Oz"` (the
8-bit game was already a five-chapter saga, not a legacy single-mechanic game
— no `legacy:true` flag to drop; it previously had no `property` key at all,
now added alongside an explicit `gen: 3`). Kept to the book (not the 1939
film) for the Witch's-castle beat — the flying monkeys attack and the
water-splash melting are both in Baum's text, so no invented "Winkie guard
disguise" scene was needed. Four upgrades (`steadyfooting`, `scarecrowwit`,
`wideawake`, `meltcourage`, one granted per node) all converge on the single
finale phase (the heel-click timing game), each widening the timing band,
revealing a hint, forgiving a mistake, or forgiving the very first miss
respectively — satisfying the "every upgrade must be read by a later phase"
standard without spreading small reads across every node. The curtain-reveal
choice (forgive the humbug / call out the fraud) is read only by the ending
selection, same pattern as Frankenstein's cottage-window choice below.

### Note on Frankenstein (shipped 2026-08-01)

`frankenstein-16` pairs with `frankenstein-spark` via `property: "Frankenstein"`
(the 8-bit game was already a five-chapter saga, not a legacy single-mechanic
game — its `legacy:true` flag had already been dropped in an earlier session).
The De Laceys' cottage-window choice (step into the light / stay in shadow)
sets a `sympathy`/`vengeance` flag read both by that node's own detection
tolerance and by the finale's ending selection.

### Note on A Christmas Carol (shipped 2026-08-01)

Two unrelated 8-bit Christmas Carol games already existed pre-dating the
Gen-3/Gen-4 pairing convention: `scrooge-carol` ("Scrooge's Long Night") and
`scrooge-ledger` ("Bah, Humbug!"). The new Gen-4 (`scrooge-16`) pairs with
`scrooge-carol` via `property: "A Christmas Carol"` (more actively maintained
— see its REBUILD_QUEUE #11 rebuild history); `scrooge-ledger` stays live as
its own standalone card, unpaired. If this reads as confusing on a future
sweep, consider retiring or merging `scrooge-ledger` rather than adding a
third generation to the property.

### Note on Alice in Wonderland (shipped 2026-08-01)

`alice-16` pairs with `alice-rabbithole` via `property: "Alice in Wonderland"`
(the 8-bit game was already a five-chapter saga, not a legacy single-mechanic
game — no `legacy:true` flag to drop). The Caterpillar's mushroom choice at
the Hall of Doors (nibble left to shrink / right to grow) sets a
`curious`/`bold` flag read both by that same node's own per-round time
budget (curious grants extra grace seconds) and by the finale's ending
selection; the Rabbit Hole's `goldenkey` and the Trial's `stoutmallet`
upgrades likewise carry forward into later nodes' difficulty, per the
"every upgrade must be read by a later phase" standard below.

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
