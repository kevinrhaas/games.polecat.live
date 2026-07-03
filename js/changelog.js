// Changelog powering the "What's New" panel on games.polecat.live. Newest first.
// Shared polecat convention (see manager.polecat.live): an ES module exposing a
// CHANGELOG array of versioned entries with an ISO-8601 UTC `ts`.
//
// The hourly build loop appends a new entry at the TOP for each user-visible
// change (bump `v`, short `title`, a `kind` of 'game' | 'feature' | 'fix', and
// 1-4 `items`). Leave `ts` as an EMPTY string on the new entry — the push step
// (tools/stamp-changelog.mjs) stamps it with the real commit time, so
// timestamps are never fabricated. The home page formats `ts` to Central Time
// (CT) and lights a dot on the ✨ button when LATEST_VERSION exceeds what the
// visitor has seen.
export const CHANGELOG = [
  {
    v: 74,
    title: 'New game: The Invisible Man — Unseen (Stealth Puzzle, 5 encounters)',
    kind: 'game',
    ts: "",
    items: [
      'Five encounters from H. G. Wells\' 1897 classic: mix the invisibility compound — tap a pendulum needle into the shrinking blue zone 8 times (3 misses lose, zone narrows and speed ramps each brew); slip through the foggy village of Iping avoiding 4 patrolling townsfolk\'s amber sight cones for 24 seconds (free movement, 3 lives); dodge heavy snow-reveal blobs falling from above for 22 seconds — they make your footprints visible and alert the mob (3 lives, blobs speed up and spawn faster); tap 5 breach points (2 windows, 2 doors, 1 gate) to hold back the soldiers surrounding Kemp\'s house for 28 seconds before 3 doors splinter (HP bars drain faster over time); and survive 26 seconds on the rain-soaked dark commons — move freely to avoid 6 torch-bearers converging from all sides and dodge telegraphed thrown rocks (3 lives, mob tightens over time).',
      'Deep fog-grey English village palette: ink-black (#04060e), misty night blue (#080e1a), wet cobblestone (#09101e), amber lantern glow (#d8c060), bandage white (#c8c0b0), rain-reveal blue-grey (#a0b0c4). Chapter-select is GRIFFIN\'S TRAIL — five stone-wall cards in a zigzag footprint-trail path on a snow-dusted village backdrop, connected by a dotted grey line; each card has a snow cap on its top edge and a paired-footprint icon. Emblem: Griffin\'s iconic top hat, goggles and bandaged head in dark silhouette. Scenery: gas-lit English village at night with church spire, inn and draper\'s shop, rolling mist layers, animated snowfall, and amber lamp-post glows. In-voice labels: VAPOURS currency; UNSEEN — FOR NOW / THEY HAVE YOU win/lose headers. Page chrome in deep misty blue-black and fog grey.',
    ],
  },
  {
    v: 73,
    title: 'New game: Open Sesame — Ali Baba and the Forty Thieves (Heist Puzzle, 5 tales)',
    kind: 'game',
    ts: "2026-07-03T11:24:45.198Z",
    items: [
      'Five tales from One Thousand and One Nights: hide from the forty thieves\' sweeping lanterns in the dark forest for 24 seconds (drag left/right, 3 lives, lanterns accelerate); rush the treasure cave to collect 12 gold bags before the magic door seals in 26 seconds (dodge falling stalactites, 3 lives); tap 14 marked doors on the cobblestone street before their chalk glow fades and the thieves find the right house (3 misses lose, marks speed up); discover 14 thieves hiding in great oil jars by tapping each pair of glowing eyes before they vanish (3 misses lose); and time Morgiana\'s dagger-dance — tap when the swinging pendulum blade enters the shrinking golden zone for 8 strikes (zone narrows and blade speeds up each hit, 4 misses lose).',
      'Deep Arabian night palette: midnight indigo (#0c0818), cave purple (#1a1030), desert gold (#d4a020), bright gold (#f0c840), amber torch (#e05800), cave teal (#006080). Chapter-select is five ORNATE PALACE ARCHES arranged in a 2-1-2 layout on an indigo backdrop — each a pointed Moorish arch with a brass keystone gem, flanking torch glow, and a tale-number in Arabic-style framing; the palace silhouette with domed towers and lit arched windows fills the menu background. Emblem is a treasure chest overflowing with gold coins. Page chrome in deep indigo and desert gold.',
    ],
  },
  {
    v: 72,
    title: 'New game: A Trip to the Moon — Five Chapters Through the 1902 Méliès Masterpiece (Cannon Launch)',
    kind: 'game',
    ts: "2026-07-03T09:46:30.304Z",
    items: [
      'Five chapters inspired by Méliès\' 1902 film: time the gavel at the Grand Congress of Astronomers (6 votes, sweep bar, 3 misses lose); tap a contracting ring to the precision target to load the great cannon 5 times (ring accelerates with each load); steer the capsule freely through 24 seconds of star-dancers and comet showers in deep space; tap-to-defeat 20 Selenites erupting from Moon craters before 3 breach the explorers; and steer left/right as the capsule falls through asteroids, lightning, and ocean waves back to Earth — hit the blue Pacific zone to win.',
      'Deep-space palette: void-black (#06040e), moon grey-blue (#b8ccd8), brass capsule (#c88020), selenite teal (#30c0a0), golden star (#ffe080), Victorian red (#c83010). Chapter-select is a PARABOLIC VOYAGE ARC — five octagonal magic-lantern slide frames with brass corner rivets arranged on an arc from Paris/Earth (lower-left) through space (apex) to the Moon (upper-right) and back down to the splashdown (lower-right), connected by a dashed brass trajectory line. The iconic Méliès Moon face (eyes, nose, open mouth, capsule stuck in one eye) serves as the emblem. Page chrome in deep indigo and brass-gold.',
    ],
  },
  {
    v: 71,
    title: 'New game: Great Expectations — Rise from the Forge (Drama Adventure, 5 acts)',
    kind: 'game',
    ts: "2026-07-03T07:45:31.080Z",
    items: [
      'Five acts from Dickens\' 1861 classic: free-move stealth across the Kent marshes — drag Pip to collect 6 provisions for escaped convict Magwitch while dodging three soldiers\' sweeping lantern cones (3 lives, ~26s); move left/right to catch golden wedding cake slices falling at Satis House while avoiding rotten dark pieces that cost a life (collect 12 to win); tap a swinging gavel into the shrinking golden zone 8 times at Mr. Jaggers\' London office (zone narrows and pendulum speeds up each hit, 4 misses lose); steer a rowboat past police galleys, floating logs and fog banks down the dark Thames for 26 seconds (3 lives, obstacle speed ramps up); and face villain Compeyson on the wharf — read his telegraphed left/right/center attacks, dodge to safety, then tap when he staggers golden to strike him down (5 hits to win, 3 lives).',
      'Dark Victorian England palette: near-black (#080608), marsh green (#192810), Thames navy (#1a3040), gaslight amber (#c88820), aged parchment (#d4c080), red wax seal (#cc2211). Chapter-select is five LEGAL INDENTURE PAPERS scattered on a dark mahogany barrister\'s desk with law books in the shelves, an inkwell and quill at right, a candle at left, and red string connecting the papers center-to-corners; each document has a brass eyelet pin, folded corner crease, and "INDENTURE NO. X" header on aged cream. Boot/menu/result scenery: the Kent marshes at night — prison hulks on the river, a churchyard with cross and arched headstones, marsh reed tufts, rolling mist, and a crescent moon. In-voice labels: EXPECTATIONS currency; THE PATH RISES / GREAT EXPECTATIONS FALL win/lose headers. Page chrome in dark Victorian mahogany and amber.',
    ],
  },
  {
    v: 70,
    title: 'New game: Merlin — Five Trials of the Enchanter (Spell Puzzle)',
    kind: 'game',
    ts: "2026-07-03T05:48:56.222Z",
    items: [
      'Five trials from Arthurian legend: catch 12 glowing gold runes falling through the ancient oakwood while dodging cursed red glyphs (3 lives, spawn rate ramps up); survive 24 seconds in Vortigern\'s underground tower as the Red Dragon and White Dragon sweep fire-breath across three lanes — dodge between them; steer Merlin\'s merlin falcon through arrow-filled skies collecting 10 golden feathers in free movement (3 lives, arrows spawn from all four edges); tap the correct glowing rune from a circle of standing stones in 10 timed rounds — the gold zone timer shrinks each round, 3 misses lose; and finally guide Merlin through crystal spires that close in from both cave walls for 26 seconds — the corridor narrows steadily and one wrong step shatters a life.',
      'Deep midnight-indigo palette: void-black (#06040e), mystical purple (#4a1a7a), lavender spell-glow (#b87aff), starlit silver (#c8d0f0), enchanter gold (#d4a820), crystal blue (#88ccff). Chapter-select is a CELESTIAL STAR CHART — five constellation medallions (hawk, twin-dragons, falcon, rune-star, serpent-spiral) scattered on a midnight-blue sky map, each an elliptical disc with RA/Dec grid lines inside, the constellation drawn in connecting star-dots; selected constellations pulse with lavender glow and a golden lead star. Scenery: ancient British hilltop at night with standing stones, rolling hills, a crescent moon, animated wisps, and drifting bat-shaped wisps. In-voice labels: RUNES currency; THE ENCHANTMENT HOLDS / THE SPELL BREAKS win/lose headers. Page chrome in deep indigo and lavender.',
    ],
  },
  {
    v: 69,
    title: 'New game: Sinbad the Sailor (Voyage Adventure, 5 voyages)',
    kind: 'game',
    ts: "2026-07-03T03:48:42.059Z",
    items: [
      'Five voyages from One Thousand and One Nights: dodge whale waterspouts and collect crates before the whale island submerges (22s survive); catch diamonds falling from eagles while serpents close in from the sides (collect 10); cling to the Roc\'s leg through a sky full of falling rocks and stormclouds (dodge 20s); wander a desert island collecting grape clusters to brew wine and trick the Old Man of the Sea off your shoulders (fill 8-grape wine jar); then steer a ship and fire cannons at sea serpents and krakens until 10 monsters are slain.',
      'Rich Arabian Nights palette: deep indigo night sky (#060820), ocean teal (#0c3a5a), crescent moon gold (#f0c030), ruby red (#cc2244), emerald serpent (#1a6618), kraken violet (#4a0a4a). Chapter-select is a MARINER\'S CHART — five scattered palm-tree island nodes connected by golden dotted sailing paths on a teal parchment sea map with a double gold border and a compass rose; each island badge shows a voyage number with a scroll name label below. In-voice labels: JEWELS currency, SEAS CONQUERED / THE DEEP CLAIMS YOU win/lose headers, five voyages of growing challenge.',
    ],
  },
  {
    v: 68,
    title: 'New game: The Pied Piper of Hamelin (Rhythm Lead, 5 tales)',
    kind: 'game',
    ts: "2026-07-03T02:24:08.752Z",
    items: [
      'Five tales of the famous German legend — drive scuttling rats from the town square before they reach the food barrels (tap 12, 3 escape = over, 28s); play the magic pipe for the Mayor by tapping the pendulum tip into the gold zone 8 times (speeds up and zone narrows each success, 4-miss limit); steer the Piper left/right through Hamelin\'s cobblestone streets dodging stone walls while a 14-rat swarm trails behind you, racing to the River Weser in 24 seconds; survive 24 seconds of the Mayor\'s guards charging down three lanes when he tries to pay only 50 guilders; and finally tap falling blue notes in three columns (avoid the red dissonant ones) to lead the children with 12 enchanted notes — the mountain door opens and shuts behind them forever.',
      'Warm medieval palette: near-black (#080408), amber (#c87a18), gold (#f0c030), rat-grey (#8a6850), magic cyan (#44aaff), mountain violet (#2e1e44). Chapter-select is a HAMELIN TOWN MAP — five parchment location cards at scattered positions (Town Square top-left, Mayor\'s Hall top-right, High Street center, River Bank bottom-left, The Mountain bottom-right) connected by dotted paths on a warm amber map background with a tiny compass rose; inner double-border frames and green checkmark stamps. In-voice labels: GUILDERS currency, THE PIPE RINGS TRUE / HAMELIN IS LOST win/lose headers. Page chrome in warm amber and dark amber-brown.',
    ],
  },
  {
    v: 67,
    title: 'New game: Please, Sir — Oliver Twist (Pickpocket Stealth, 5 acts)',
    kind: 'game',
    ts: "2026-07-03T01:21:02.467Z",
    items: [
      'Five acts of Dickensian survival: dodge the beadle\'s swinging cane in the workhouse gruel hall while catching falling bowls for bonus shillings (3 lives, 22s); tap Fagin\'s pendulum-swung handkerchief into the golden zone 8 times to graduate as a pickpocket (misses speed the pendulum up); tap lying wigged witnesses at their benches before their time bars drain and they testify against Oliver before Magistrate Fang (10 silenced, 3 testify = over); drag Oliver through the dark Chertsey house past two patrolling guards whose lantern cones sweep in their direction of travel (3 lives, 26s); and survive 28 seconds on the London rooftops dodging Bill Sikes\' stone throws — each one telegraphed by a red warning triangle before it falls.',
      'Coal-black Victorian London palette: soot-black (#100c0a), gaslight amber (#c88820), London fog (#b0a898), poverty red (#cc3822), cream parchment (#e8d8b8). Chapter-select is a DARK CORK NOTICE BOARD with five weathered parchment broadsheet clippings pinned at different heights in a 2-upper / 1-center / 2-lower arrangement, connected by red investigator\'s string; thumbtack pins and folded corner creases on every card. In-voice labels: SHILLINGS currency; THE BOY SURVIVES / THE STREETS CLAIM YOU win/lose headers.',
    ],
  },
  {
    v: 66,
    title: 'New game: The Call of the Wild — Jack London (Sled Runner, 5 chapters)',
    kind: 'game',
    ts: "2026-07-02T23:59:58.309Z",
    items: [
      'Five stretches of Buck\'s Yukon journey: dodge falling lasso loops at Judge Miller\'s California ranch (survive 22s, 3 lives); steer the sled team down the snow trail collecting 10 frozen fish while dodging drifts; duel lead dog Spitz in a counter-strike timing fight on the ice floe (land 5 counters, 4 hit points); tap rapidly in rhythm to pull John Thornton\'s thousand-pound sled across the finish line before 32 seconds; then follow howling wolf silhouettes through the dark spruce forest while dodging trapper\'s steel jaw-traps to cover the final stretch.',
      'Yukon winter palette: midnight navy (#080c14), Klondike gold (#d4a030), arctic ice (#4ab8e8), aurora green (#20c870), spruce black (#0c2010). Chapter-select is a ZIGZAG SLED TRAIL — five wooden trail markers staggered left-right down a bright daytime Yukon snow map, connected by dashed trail lines; each post displays a mile number and themed chapter name. Framed screens in-voice: MILES currency, "THE TRAIL HOLDS" / "THE SNOW CLAIMS YOU" win/lose headers.',
    ],
  },
  {
    v: 65,
    title: 'New game: Wrath of Achilles — The Iliad (Battle Tactics, 5 books)',
    kind: 'game',
    ts: "2026-07-02T23:00:41.465Z",
    items: [
      'Five books of Homer\'s Iliad: tap Greek ships sailing into Aulis bay to muster the fleet (collect 15 in 26s); steer a bronze-armored hoplite left/right past Trojan spears across the dusty plain (22s); lane-switch to block Trojan warriors at the three-arched gate (block 14); tap to intercept Apollo\'s arrows flying at Patroclus in golden armor (protect for 22s, 3 lives); chase Hector around Troy\'s oval walls by holding to sprint (stamina bar), then time the strike in the oscillating gold-zone gauge — 3 perfect strikes to end the duel.',
      'Bronze-age Aegean palette: midnight navy (#060a1e), burnished bronze (#c87a20), Aegean blue (#4ab8e8), ivory (#f0e8d0), shield-blue (#1a3060), crimson (#cc1a10). Chapter-select is a PHALANX OF HOPLITE SHIELDS — five round Argive shields with Argive concentric rings and cross-band armature arranged 2+2+1 on a dark Aegean backdrop of Troy\'s battlements at dawn. In-voice labels: GLORY currency; GLORY TO OLYMPUS / THE FATES HAVE SPOKEN win/lose; TAKE UP YOUR SHIELD boot call.',
    ],
  },
  {
    v: 64,
    title: 'New game: To the Center — Journey to the Center of the Earth (Descent Platformer, 5 chapters)',
    kind: 'game',
    ts: "2026-07-02T22:06:39.467Z",
    items: [
      'Five chapters into Jules Verne\'s 1864 classic: dodge falling rocks descending Snæfellsjökull\'s volcanic shaft for 24 seconds (3 lives, lantern-lit explorer, deepening amber ore crystal collectibles); steer the raft left/right across the underground Lidenbrock Sea dodging rocks, tentacles, and floating logs for 26 seconds; survive 22 seconds of the battling Ichthyosaurus and Plesiosaurus in free-movement — two enormous prehistoric beasts sweeping the water with their bodies; dodge warning-telegraphed lightning columns in the electromagnetic storm for 26 seconds as St. Elmo\'s fire crackles on the mast; and ride the Stromboli volcanic eruption upward, dodging magma jets from the walls while collecting 8 glowing ore crystals to escape.',
      'Deep geological palette: volcanic earth-black (#0a0602), rock amber (#c87a20), molten lava (#ff5000), underground sea teal (#20a0b8), bone fossil (#d8c8a0). Chapter-select is a GEOLOGICAL CROSS-SECTION — five depth-station cards staggered left and right at increasing depths (2km, 20km, 160km, 200km, 6400km), each a rock-layer panel with a colored stratum bar on the left edge; lava glow at the bottom. Animated strata bands, rising ember sparks, and glowing ore veins in the boot/menu backdrop. In-voice labels: FATHOMS currency; DESCENDED FURTHER / RETREAT TO THE SURFACE win/lose. Page chrome in deep volcanic amber and earth-black.',
    ],
  },
  {
    v: 63,
    title: 'New game: A Thousand Nights — One Thousand and One Nights (Adventure, 5 tales)',
    kind: 'game',
    ts: "2026-07-02T21:05:26.596Z",
    items: [
      'Five tales from One Thousand and One Nights: tap the golden ink zone as Scheherazade\'s quill swings to keep the Sultan enchanted (10 strikes); steer Sinbad\'s ship through Roc feathers and falling rocks for 22 seconds; catch Ali Baba\'s gold bags while dodging daggers in the treasure cave; tap falling soldiers out of the sky to protect the palace with Aladdin\'s Genie; and race the magic carpet through narrowing palace spires to deliver the final tale.',
      'Arabian Nights palette: midnight indigo (#06040e), gold (#e8b020), turquoise (#00b8a0), ruby (#cc1844), silk pink (#e85898). Chapter-select is a BAZAAR OF HANGING LANTERNS — five hexagonal lanterns suspended on copper chains at scattered heights above a starry midnight sky, each glowing gold or teal when done. In-voice labels: SCHEHERAZADE WEAVES THE NIGHT. / DAWN BREAKS THE SPELL.; currency COINS; finale \'He who does not know his past is lost in the desert without a star to follow.\' Page chrome in deep midnight indigo and gold.',
    ],
  },
  {
    v: 62,
    title: 'New game: Grimm\'s Path — Grimm\'s Fairy Tales (Story Arcade, 5 chapters)',
    kind: 'game',
    ts: '2026-07-02T20:11:24.096Z',
    items: [
      'Five dark fairy tales from Jacob & Wilhelm Grimm: dodge the Big Bad Wolf through the moonlit forest for 22 seconds (Little Red Riding Hood); tap the pendulum timing zone to climb Rapunzel\'s golden braid 8 levels up to the tower window; whack the witch 12 times before she catches Hansel in the gingerbread house kitchen; steer a basket to catch 12 golden coins flying off Rumpelstiltskin\'s spinning wheel while avoiding plain straw bundles; and finally tap when the enchantment ring closes at its tightest around Sleeping Beauty — 5 kisses to break the spell.',
      'Deep enchanted forest palette: near-black forest (#080c08), moonlit silver-green (#c8dcc0), bark brown (#7a5a2a), fairy-tale gold (#d4a020), witch purple (#6a1888). Chapter-select is an ENCHANTED FOREST CLEARING — five weathered wooden signpost boards at scattered positions connected by dotted bark-trail paths and animated firefly sparkles, with a moonlit canopy header on aged dark parchment. In-voice labels: \'THE TALE IS TOLD.\' / \'THE FOREST CLAIMS YOU.\'; currency TOKENS; finale \'Fairy tales are more than true.\' Page chrome in deep forest night green and gold.',
    ],
  },
  {
    v: 61,
    title: 'What\'s New, upgraded',
    kind: 'feature',
    ts: '2026-07-02T19:00:21.378Z',
    items: [
      'The update feed now follows the shared polecat \'relay\' convention: each entry is versioned with a precise timestamp, shown in your local Central time.',
      'A little dot on the ✨ What\'s New button now lights up when there\'s something you haven\'t seen yet, and clears once you open it.',
    ],
  },
  {
    v: 60,
    title: 'New game: The Portrait — The Picture of Dorian Gray (Decay Puzzle, 5 chapters)',
    kind: 'game',
    ts: '2026-07-02T18:18:00.000Z',
    items: [
      'Five Victorian Gothic chapters from Oscar Wilde\'s 1890 masterpiece: dodge Lord Henry Wotton\'s poisonous platitudes (falling red orbs labeled VANITY/YIELD/SIN) in Basil\'s studio while collecting gold paint-drop bonuses — survive 22 seconds, 3 lives; catch 12 falling roses in a basket at the Lyceum Theatre while dodging grey programmes thrown by the cold audience — 3 lives, spawn rate ramps over time; sort Lord Henry\'s yellow book pages by tapping the RIGHT half of the screen to ACCEPT gold pages (BEAUTY/MUSIC/ART) and LEFT to REJECT crimson pages (OPIUM/VICE/DECAY) — 10 correct choices to win, 3 mistakes lose, timer bar shrinks for each page; dodge left/right in foggy East London streets hiding in arched doorways when James Vane\'s lantern sweeps across — survive 22 seconds, sweeps accelerate over time, 3 lives; and finally time precise strikes on the corrupted portrait in the locked attic — a golden ring contracts from the edge, tap when it hits the target circle to land a blow, 6 strikes to destroy it, 3 misses lose (ring speeds up each strike).',
      'Deep Victorian Gothic palette: black-wine (#0e0412), rose-plum (#500f2a), crimson sin (#bc1e3e), aged gold (#cc9830), gilded gleam (#e6b448), parchment ivory (#d2b4a6). Chapter-select is a PORTRAIT GALLERY — five ornate gilded frames hung on deep wine-red damask wallpaper, connected by dashed picture-rail wires from a gold rail at the top. Frames have double-gilt borders with corner rosettes; done chapters get a crimson wax-seal checkmark. The centre frame (Sibyl\'s Night) is slightly taller — the natural centrepiece of the gallery. Boot/menu scenery: a Victorian study with bookshelf silhouette, damask pattern, wainscoting, and fireplace glow. Intro/result scenes: candlelit attic with the locked portrait hinted on the wall. In-voice labels: \'THE FACE HOLDS.\' / \'THE PORTRAIT WINS.\'; currency SINS; finale \'He had killed the only thing he had ever loved.\' Page chrome in deep wine with aged-gold accent.',
    ],
  },
  {
    v: 59,
    title: 'New game: They\'re Coming — Night of the Living Dead (1968) (Tower Defense, 5 chapters)',
    kind: 'game',
    ts: '2026-07-02T17:22:00.000Z',
    items: [
      'Five ordeals from Romero\'s 1968 classic: dodge the first zombie through the rural cemetery fleeing to the farmhouse (steer left/right, 3 lives, 20 seconds); tap three windows to hammer boards before zombie pressure causes 3 breaches (26 seconds, HP bars drain faster over time, tapping deactivates the zombie and restores 44HP); catch 15 supplies (canned food, fuel, flashlights) falling through the dark farmhouse while avoiding zombie hands and broken glass (3 lives, catcher mechanic, spawn rate ramps up); hold three breach points (two windows + front door) against the growing horde by tapping surging pressure bars back down before they max out (26 seconds, 3 lives, door pressure builds 25% faster); and guide Ben through a field of 12 wandering zombies to reach the golden dawn at the top of the screen (free movement drag+arrow keys, 3 lives, zombies gradually begin to track you).',
      'Stark noir horror palette: charcoal black (#050504), plank brown (#2e2618), bone white (#c8c0a8), blood crimson (#cc1122), amber lantern (#f0c840), sickly zombie green (#708040). Chapter-select is a FARMHOUSE FLOOR PLAN — top-down schematic with hand-drawn wall borders, room dividers, and labeled sections: CEMETERY OUTSIDE, FARMHOUSE INSIDE (two rooms side by side), THE NIGHT (full width), and DAWN. Cards styled as boarded wooden planks with grain texture, blood-drop selection indicator, and corner nail dots. Animated zombie silhouettes shuffle across the dark exterior during boot/menu. In-voice labels: \'THE DEAD ARE HELD BACK.\' / \'THE DEAD GOT IN.\'; currency GUTS; finale \'THE DEAD WILL NOT RISE AGAIN.\' Page chrome in deep charcoal with blood-red accent.',
    ],
  },
  {
    v: 58,
    title: 'New game: Down the Mississippi — Huckleberry Finn (River Runner, 5 chapters)',
    kind: 'game',
    ts: '2026-07-02T16:18:00.000Z',
    items: [
      'Five tales of Twain\'s classic: dodge Pap\'s swinging lanterns in the dark cabin for 20 seconds (5 lives, invincibility after each catch, two lamp beams patrol opposite halves of the screen so there\'s always a safe corridor); steer Huck and Jim\'s raft left/right past floating logs, sandbars, and steamboat wakes for 22 seconds (3 lives, obstacle speed ramps up); catch 12 gold coins falling from the Duke and King\'s Royal Nonesuch con while dodging rotten tomatoes (left/right movement, 3 lives, coin and tomato spawn rates increase as you score); tap a timing-needle into the gold zone to break 4 underground rocks in Tom Sawyer\'s tunnel scheme (zone shrinks and needle speeds up each rock, 3 misses lose); and survive 25 seconds of Mississippi thunderstorm — dodge pre-warned lightning columns and river debris (3 lives, rain overlay, storm intensity ramps).',
      'Warm Mississippi River palette: sunset amber sky (#e89020), muddy river blue-grey (#3a6888), river-sparkle (#5898b8), log brown (#8a5c28), gold (#f0c020). Chapter-select is an AERIAL RIVER MAP — winding blue Mississippi river down the center of a green farmland canvas, with 5 weathered wooden dock signs alternating left/right banks at river bends, connected by dotted amber paths and a golden ribbon title banner. An animated tiny steamboat drifts along the river. Boot/intro scenery: sunset river with silhouetted raft. In-voice wording: \'The river carries you on\' / \'The raft runs aground\'; currency is MILES; finale \'FREEDOM FOUND\'. Page chrome in deep forest green with gold accent.',
    ],
  },
  {
    v: 57,
    title: 'New game: Heart Machine — Metropolis (1927) (Industrial Platformer, 5 chapters)',
    kind: 'game',
    ts: '2026-07-02T15:30:00.000Z',
    items: [
      'Five chapters through Fritz Lang\'s 1927 masterpiece: tap the pressure dial\'s green zone 8 times to stabilise Moloch\'s Heart Machine (needle speeds up, zone shrinks, 3 misses lose — ~20–30 seconds); steer Freder left/right through the vertical workers\' shaft dodging falling gears, bolts, and side-shooting flame jets for 22 seconds; guide Maria left/right to collect 7 scattered children before rising floodwater reaches her (water accelerates over time); tap Rotwang\'s glowing robot-Maria at the Yoshiwara revel to expose it 6 times — avoid tapping the real Maria (3 wrong taps lose, 30-second time limit); platform-climb the cathedral with jump and steer controls, dodge stones and Rotwang patrolling a mid-level platform, and land on the bell platform to ring it for peace.',
      'Art Deco industrial palette: deep blue-black (#060810), electric blue (#40d0ff), art deco gold (#c8a020), amber (#ff9000), steel chrome. Chapter-select is a 3+2 STAGGERED CONTROL-PANEL GRID — five riveted metal panels with glowing circuit borders on a dark industrial background with smoking factory stacks and electric power lines. CRT scanlines throughout (appropriate for genuine sci-fi). Emblem is a spinning gear-heart with electric core. In-voice screen wording: \'SYSTEM STABLE\' / \'CRITICAL FAILURE\'; currency is GEARS. Page chrome in deep steel blue with electric-blue accent.',
    ],
  },
  {
    v: 56,
    title: 'New game: Shadow of the Vampyr — Nosferatu (Stealth Horror, 5 chapters)',
    kind: 'game',
    ts: '2026-07-02T14:20:00.000Z',
    items: [
      'Five nights from F. W. Murnau\'s landmark 1922 silent horror film: steer Hutter\'s carriage through a wolf-haunted Transylvanian forest for 20 seconds (drag/arrow left-right, 3 lives, wolves and fallen logs spawn faster over time); explore Count Orlok\'s castle in free-movement top-down, collecting 6 journal pages while Orlok hunts you down — he accelerates with each page found (3 lives, invincibility frames on catch); tap coffin lids on the plague ship Demeter before they breach and Orlok rises — 12 sealed needed, 3 breaches lose (coffin life-bars shown, lid animation opens over 2-3 seconds); guide Orlok\'s iconic shadow up five staircase steps via a shrinking timing-zone needle (3 misses lose, zone narrows and needle speeds up each step); and hold your ground as Ellen — tap to repel Orlok back into darkness with a 0.8s cooldown, holding him at bay across 28 seconds until the sun rises (3 max touches, Orlok shrinks and fades as dawn progresses).',
      'Stark silent-film B&W palette: ink-black (#100c0a), bone-white (#e8e0cc), ash-silver (#a0988a), blood-crimson (#cc1122). Chapter-select is a DIAGONAL FILM-FRAME layout — five silent-film intertitle cards descending alternately left/right, connected by dashed threads like a film strip, on a deep-black background with animated bats and a crescent moon. Each card has Art Nouveau double-border and corner bracket ornaments. A film-strip sprocket header shows the title. Emblem is Orlok\'s silhouette rising before a crescent moon. In-voice screen wording: \'THE DARK HOLDS.\' / \'DAWN FINDS YOU.\'; currency is SHADOW. Page chrome in deep charcoal and blood-crimson.',
    ],
  },
  {
    v: 55,
    title: 'New game: Poop-Poop! — The Wind in the Willows (Driving Arcade, 5 chapters)',
    kind: 'game',
    ts: '2026-07-02T13:04:00.000Z',
    items: [
      'Five tales from Kenneth Grahame\'s 1908 classic: steer Toad\'s motorcar down the open country lane for 22 seconds, dodging wooden carts, geese, and potholes (drag/arrow left-right, 3 lives); dodge charging weasels through the dark Wild Wood for 20 seconds as Mole\'s lantern-glow is the only light (3 lives, weasels spawn faster and from more angles over time); pick five padlock pins by tapping when the oscillating needle enters the shrinking green zone (prison escape, 3 misses allowed, speeds up each pin); catch 12 of Ratty\'s flying picnic hamper treats — fish, bread, berries, cheese — in the river boat before 3 splash past (drag left-right); and tap 10 weasels as they pop up in Toad Hall\'s windows before 3 escape (whack-a-mole finale with per-weasel life bars and \'BIFF!\' flash).',
      'English countryside palette: meadow greens, river blue (#2878c0), golden amber (#d8a020), parchment cream. Chapter-select is a PARCHMENT MAP of the English countryside — five English road-sign placards (pointed rectangular signs on wooden posts) at geographically meaningful spots: motorcar near the top road, dark forest in the top-right, prison tower on the left, river bank on the right, and Toad Hall centred at the bottom, all connected by winding country roads and a compass rose. Toad\'s motorcar front-view emblem with goggles. In-voice screen wording: \'POOP-POOP!\' / \'OH BOTHER!\'; currency is CHEERS. Page chrome in deep English meadow green and amber.',
    ],
  },
  {
    v: 54,
    title: 'New game: Tilting at Windmills — Don Quixote (Joust Arcade, 5 chapters)',
    kind: 'game',
    ts: '2026-07-02T12:21:00.000Z',
    items: [
      'Five adventures through Cervantes\' 1605 classic: tap the lance through rotating windmill arms when the gap faces right (8 charges to win, arms speed up each hit, 4 misses lose — about 20 seconds with good timing); stab 12 wineskin \'enchanted monsters\' at the inn before their life bars empty while avoiding the innkeeper (tapping the innkeeper counts as a miss); dodge rocks hurled by the freed galley slaves for 24 seconds (drag or arrows, 3 lives, spawn rate rises as time passes); navigate the fog-of-war Cave of Montesinos by torchlight in 38 seconds, collecting optional gold gems and finding the glowing exit; and face the Knight of the White Moon in a 3-round lance-timing duel — tap when the needle reaches the gold zone.',
      'Warm Castilian Spain palette: Aragonese sky blue (#5898d8), dusty amber wheat fields, terracotta red, windmill white. Chapter-select is a hand-drawn MAP of La Mancha — five parchment scroll banners pinned at five different positions across the map, connected by a dotted route path, with a compass rose and a red title banner. In-voice screen wording: \'A VALIANT DEED!\' / \'ROCINANTE STUMBLES\'; currency is GLORY; knight-and-lance emblem with red plume. Page chrome in earth-brown, sky-blue, and amber.',
    ],
  },
  {
    v: 53,
    title: 'New game: Ballad of Honor — Hua Mulan (Action RPG, 5 chapters)',
    kind: 'game',
    ts: '2026-07-02T11:39:00.000Z',
    items: [
      'Five chapters of Hua Mulan\'s legend: hit the timing needle into the green zone 8 times to don the warrior\'s disguise before inspection (speeds up with each hit, 3 misses lose); steer Mulan through 22 seconds of arrow volleys and training rocks in the army camp (3 lives, catch gold stars for bonus Honor); drag and tap to aim and fire the mountain cannon at Shan-Yu\'s marching Huns — 10 kills triggers the avalanche before 5 slip past; sneak past torch-wielding imperial guards in a scrolling palace corridor (guards sweep torch cones that detect Mulan on contact, 3 lives, reach the throne); then face Shan-Yu in a 6-parry rooftop duel on a vertical strike meter — tap when the blade enters the gold zone or it hits Mulan.',
      'Imperial red and gold palette: deep crimson backgrounds, gold (#ffd700) UI, ink-black mountains and Great Wall silhouettes. Chapter-select is a zigzag journey map — five silk banner tiles staggered left/right down the screen from Fa Village at the bottom to the Palace Rooftop at the top, connected by a dotted gold path. In-voice wording: \'CHINA IS PROUD\' / \'THE JOURNEY FALTERS\'; currency is HONOR; cherry-blossom-and-sword emblem. Page chrome in imperial crimson and gold.',
    ],
  },
  {
    v: 52,
    title: 'New game: 802,701 A.D. — The Time Machine (Survival Strategy, 5 eras)',
    kind: 'game',
    ts: '2026-07-02T09:50:00.000Z',
    items: [
      'Five eras from H. G. Wells\' 1895 classic: tap the timing needle into the green zone 8 times to calibrate the time circuits (zone narrows each round, 3 misses lose); drag left/right to catch fruit falling from the Eloi\'s garden while Morlocks climb up from the ground (3 lives, 26s); creep through the night past three rotating Morlock sight-cones to reclaim your machine from the White Sphinx; navigate pitch-dark underground tunnels by the shrinking radius of a single match, collecting 5 machine gears while Morlocks drain your flame on contact; and steer the machine through temporal debris in a 28-second escape countdown as the year counter races from 802,701 back to 1895.',
      'Green phosphor / Victorian brass palette: deep forest-black backgrounds, bright #44ff88 terminal green, warm amber (#ffaa33) and brass (#c8882a). Chapter-select is a staggered brass instrument-panel layout with riveted corners and era labels (\'1895\', \'802,701\', \'SPHINX\', \'BELOW\', \'HOME\'), alternating left and right down the screen. In-voice screen wording: \'TIME HOLDS\' / \'LOST IN THE CENTURIES\'; currency is ERAS. Page chrome in dark forest-green and amber.',
    ],
  },
  {
    v: 51,
    title: 'New game: The Call — Cthulhu (Sanity Survival, 5 chapters)',
    kind: 'game',
    ts: '2026-07-02T07:59:00.000Z',
    items: [
      'Five accounts from Lovecraft\'s 1926 tale: tap the true Cthulhu glyph from a 3×3 tile grid before your 3.5-second round timer expires (10 rounds, 3 misses lose — sanity survival!); drag your investigator through a dark Louisiana bayou, staying out of the roving cultists\' torch halos for 22 seconds without losing all three sanity points; steer the yacht toward R\'lyeh by pointer/arrow, dodging driftwood and rising tentacles for 22 seconds; collect 10 glowing ancient runes in R\'lyeh\'s impossible geometry while the walls intermittently pulsate and shift (26s timer, 3 lives); and finally align the boat under Cthulhu\'s sweeping eye and tap to ram — 5 hits from the timing strike before time runs out.',
      'Abyssal deep-ocean palette: void black (#050810), eldritch green (#00cc55 / #22ff77), bone-white (#c0d4e0). Chapter-select is a scattered field-note layout — five water-stained research pages pinned asymmetrically on a dark nautical-chart grid, alternating left and right. Menu currency is SANITY; in-voice screen headers read \'THE MIND ENDURES\' / \'MADNESS TAKES YOU\'; Cthulhu silhouette emblem with pulsing green eyes. Page chrome in abyssal black and eldritch green.',
    ],
  },
  {
    v: 50,
    title: 'New game: King Kong — Eighth Wonder (Climb Defense)',
    kind: 'game',
    ts: '2026-07-02T06:02:00.000Z',
    items: [
      'Five scenes from the 1933 legend, played as Kong himself: dodge skull-island debris and prehistoric jungle dangers for 22 seconds; position Kong on the safe side of the great log while brontosaurus jaws snap from below; break free from five Broadway chains by hitting the timing meter in the green zone (speeds up with each snap); rampage through New York dodging biplane bombs raining from above; and swat eight orbiting biplanes from atop the Empire State Building before three misses end the fight.',
      '1930s art-deco noir palette — deep charcoal black, warm amber/gold, and flashes of biplane red. Chapter-select is a staggered film-strip zigzag layout: five vintage movie-frame panels with sprocket holes top and bottom, alternating left and right down the screen like a real film reel. Custom SCREAMS currency, in-voice screen wording (\'THE CROWD ROARS\' / \'THE SHOW IS OVER\'), Kong-on-spire emblem with a tiny circling biplane. Page chrome in dark mahogany and amber gold.',
    ],
  },
  {
    v: 49,
    title: 'Dracula leaps to 16-bit — the first GEN 2 game',
    kind: 'game',
    ts: '2026-07-02T05:09:00.000Z',
    items: [
      'Games can now level up a whole generation. Dracula is reborn in 16-bit as \'Nights of Blood\': parallax gothic vistas, Mode-7 pseudo-3D sea and mountain-road chases, glowing blood moons, and bigger animated sprites.',
      'It\'s also a richer format than the old five chapters — a HUB MAP of the novel you explore (nights unlock as you go, with an optional Renfield side-tale), each night a run of escalating trials ending in a mini-boss, relics (the kukri blade, garlic wreath, sacred wafer) that carry between them, a branching escape route, and two endings. Look for the gold GEN 2 badge on the card; more classics will ascend over time.',
    ],
  },
  {
    v: 48,
    title: 'New game: Around the World in 80 Days (Race Manager)',
    kind: 'game',
    ts: '2026-07-02T03:37:00.000Z',
    items: [
      'Five legs of Phileas Fogg\'s legendary wager: seal the £20,000 bet at the Reform Club by tapping when the clock hand lands in the gold zone (3 seals, 4 misses lose, clock accelerates); steer the Mongolia through rocks and cresting waves across the Mediterranean to Suez (3-life dodge runner, ~22s); ride Kiouni the elephant through the Indian jungle dodging fallen logs, mud pools and low branches to reach Allahabad (vertical dodge, 3 lives, ~19s); keep the Henrietta\'s boiler pressure in the green zone for 30 seconds by tapping to add coal — drift increases over time; sprint a night-London carriage to the Reform Club dodging oncoming carriages, barrels and police constables while a countdown timer ticks — each hit costs 2.5 seconds.',
      'Victorian parchment palette: deep mahogany, aged brass, cream, burgundy wax-seal red. Chapter-select is a WORLD MAP with latitude/longitude grid lines, a zigzag dotted-gold route connecting five passport-stamp chapter cards from London to Suez to India to the Pacific and back, plus a compass rose. Custom MILES currency, in-voice screen wording (\'FOGG GAINS GROUND\' / \'THE WAGER IS LOST\'), pocket watch emblem. Page chrome in Victorian mahogany and brass gold.',
    ],
  },
  {
    v: 47,
    title: 'New game: The War of the Worlds — Tripods (Survival Shooter)',
    kind: 'game',
    ts: '2026-07-02T02:22:00.000Z',
    items: [
      'Five dispatches from H. G. Wells\' Martian invasion: dodge the sweeping heat-ray beam on Horsell Common for 24 seconds (ray accelerates over time, 3 lives); run through panicked London streets dodging overturned carts, rubble, and fleeing crowds (runner, 3 lives, ~22s); man the guns of HMS Thunder Child — tap tripods to shoot (2 hits each) while dragging the ironclad to dodge heat-ray fire (5 kills to win, 40s timer); escape the toxic black smoke room-by-room by picking the one open door before time runs out (8 rooms, smoke timer speeds up, 3 lives); and guide five survivors to safety past three toppling tripods with blast-zone countdown arcs (drag to lead, 32s timer).',
      'CRT phosphor-green palette on deep night-black — appropriate for this genuinely sci-fi Victorian sci-fi setting. Chapter-select is an editorial BULLETIN BOARD with five yellowed telegraph dispatch papers pinned with brass tacks in a scattered non-grid layout. Custom SURVIVORS currency, in-voice screen wording (\'HUMANITY ENDURES\' / \'LONDON FALLS\'). Page chrome in phosphor green and night black.',
    ],
  },
  {
    v: 46,
    title: 'New game: Odysseus — The Long Way Home (Voyage Adventure)',
    kind: 'game',
    ts: '2026-07-02T01:59:00.000Z',
    items: [
      'Five crossings through Homer\'s Odyssey: dodge Polyphemus\'s sweeping eye while hiding under sheep in the Cyclops\' cave (3 lanes, 5 sweeps to survive, 3 lives); collect 14 moly herbs on Circe\'s island while dodging her transformation wand beams (free-move, 3 lives, ~22s); dodge falling siren notes while lashed to the mast and survive 22 seconds; steer the ship between Scylla\'s tentacles from the left and Charybdis\'s whirlpool pull from the right (24s, 3 lives); and time the shot to thread 8 arrows through axe-handle rings in Ithaca\'s great hall (swinging aim, 4 misses lose).',
      'Deep wine-dark sea palette — aegean navy (#0d2244 / #060f28), teal seafoam (#4ac8d4), sandy gold (#e8c87a), terracotta (#cc4422). Chapter-select is ODYSSEUS\'S CHART — a nautical sea-map with a double gold border, five island waypoints in a zigzag sailing route connected by dotted gold lines, Roman numeral chapter cards, and a compass rose. Custom GLORY currency, in-voice screen wording (\'THE GODS SMILE\' / \'POSEIDON LAUGHS\'), Greek trireme emblem with white sail on the boot screen. Page chrome in deep aegean navy and teal.',
    ],
  },
  {
    v: 45,
    title: 'New game: The Hunchback of Notre-Dame — The Bells of Notre-Dame (Climb Rescue)',
    kind: 'game',
    ts: '2026-07-02T00:24:00.000Z',
    items: [
      'Five chapters through Victor Hugo\'s 1831 Notre-Dame de Paris: dodge rotten vegetables and stones hurled by the jeering mob at the Festival of Fools (3 lives, 20s survival); ring the great cathedral carillon by tapping the glowing bell before it fades (14 rings, 4 misses lose); scale Notre-Dame\'s stone face in three lanes to claim sanctuary for Esmeralda — grab flying gargoyle ledges while guards patrol (10 grabs, 3 lives, 22s); defend the cathedral by dropping stones on Frollo\'s climbing soldiers from three column positions (3 lives, 24s); and swing the great pendulum into the shrinking green zone five times to save Esmeralda (5 hits, 4 misses lose).',
      'Gothic violet palette — deep cathedral purple, stained-glass amber, lead grey. Chapter-select is a ROSE WINDOW pentagon: five pointed-arch stained-glass window panels arranged like the petals of Notre-Dame\'s great circular window, each filled with coloured glass and lead-line crosses, glowing against a dark stone backdrop. Custom GRACE currency, in-voice wording (\'THE BELLS RING TRUE\' / \'THE CATHEDRAL FALLS SILENT\'), Quasimodo silhouette in a gothic arch on the boot screen. Page chrome in deep violet and stained-glass purple.',
    ],
  },
  {
    v: 44,
    title: 'New game: Tom Sawyer — Whitewash & Wonder (Adventure Arcade)',
    kind: 'game',
    ts: '2026-07-01T23:09:00.000Z',
    items: [
      'Five chapters through Mark Twain\'s 1876 classic: trick passing kids into painting Aunt Polly\'s fence in 28 seconds (tap-to-convince arcade); dodge Injun Joe\'s sweeping lantern in the midnight graveyard while collecting 5 clues (stealth dodge, 3 lives, 26s); steer the pirate raft down the Mississippi dodging logs and rocks to Jackson\'s Island (river runner, 3 lives, ~21s); navigate a DFS-generated cave maze to find Becky Thatcher then escape before the candle burns out (maze explore, 24s candle); and strike the moving shovel over each X mark to dig up Injun Joe\'s gold before he returns (timing precision, 3 chests, 32s).',
      'Bright sunny Americana palette — sky blue, grass green, golden yellow, warm brown. Chapter-select is a PARCHMENT TREASURE MAP with the Mississippi River winding across it, five parchment-note cards pinned at story locations (fence, graveyard hill, Jackson\'s Island, cave mouth, haunted house), small pictographic map icons between them, and a compass rose. Custom MISCHIEF currency, in-voice screen wording (\'SLICKER THAN PAINT\' / \'CAUGHT IN THE ACT\'), straw-hat emblem on the boot screen.',
    ],
  },
  {
    v: 43,
    title: 'New game: The Little Mermaid — The Sea King\'s Daughter (Swim Collect)',
    kind: 'game',
    ts: '2026-07-01T22:27:00.000Z',
    items: [
      'Five-chapter saga through Andersen\'s 1837 fairy tale: swim up through jellyfish and urchins to reach the surface, navigate the sea witch\'s tentacled cave, rescue the drowning prince in the storm, dance at the palace ball despite the pain, and catch the sea spirits\' gifts at dawn.',
      'Oyster-shell chapter-select menu scattered across a bioluminescent ocean floor.',
      'Ocean-teal palette with coral accents; PEARLS currency.',
    ],
  },
  {
    v: 42,
    title: 'New game: Beowulf (Boss Brawler)',
    kind: 'game',
    ts: '2026-07-01T21:13:00.000Z',
    items: [
      'Five deeds from the Old English epic (c. 700–1000 AD): steer Beowulf\'s longship through falling sea-rocks on the whale-road to Denmark (runner/dodge, 3 lives, ~22s); mash-tap to wrestle Grendel barehanded — push the power bar into the gold zone across 5 rounds against the monster\'s relentless pull; face Grendel\'s Mother in the blood-dark mere with the ancient sword Hrunting — strike the precision ring 6 times before nerve runs out; dodge the fire drake\'s flame in 3 lanes then tap to strike in the open window 8 times; and hold Wiglaf\'s shield wall — block 4-directional blows by tapping the flashing sectors for 24 seconds.',
      'Old English mead-hall palette — deep forest green (#0a1a08 / #0d1f0a), bone ivory (#f0e8c8), bronze gold (#c8962a), dragon blood (#8b2a0a), and night black. Chapter-select is five STANDING STONES in a burial-mound arc, like Stonehenge at night — each a tapered stone slab with rune-etch lines and a chapter icon, set against a moonlit grassy hillside with distant treeline and crescent moon. Custom GLORY currency, in-voice screen wording (\'THE HALL RINGS WITH YOUR NAME\' / \'WYRD HAS CLAIMED YOU\'), animated dragon emblem on the boot screen. Page chrome is dark forest green and gold.',
    ],
  },
  {
    v: 41,
    title: 'New game: The Jungle Book — Mowgli\'s Law (Action Adventure)',
    kind: 'game',
    ts: '2026-07-01T20:32:00.000Z',
    items: [
      'Five tales from Kipling\'s 1894 classic, each a distinct mechanic: dodge roots and stones while running with Father Wolf\'s pack for 22 seconds (survival runner, 3 lives); tap a swinging vine into the green zone 8 times to learn the Master Words from Baloo the Bear (pendulum timing, 4 misses); tap when Kaa\'s ring closes on each of 6 Bandar-log monkeys to hypnotize them free (ring precision, 4 misses); creep through the man-village avoiding two patrolling lantern-guards, grab the fire-pot, then sprint back to the jungle (free-move stealth, 3 lives, 26s); and drag a burning torch to block Shere Khan\'s approach while tapping to stoke the flames — survive 28 seconds until the tiger breaks and runs (torch-block survival, 3 lives).',
      'Deep jungle palette — near-black jungle night (#050e04), rich leaf green (#3d8c2a / #5dff8f), warm earth (#8b5e2a), bamboo gold (#c8a84b), and tiger orange (#ff6b35) on an animated canopy backdrop with fireflies, crescent moon, and scrolling bamboo grove. Chapter-select is MOWGLI\'S PATH — five bamboo signposts arranged on a winding S-curve jungle trail, connected by a dotted dirt path with vine tendrils and leaf nodes between stops. Custom HONOUR currency, in-voice screen wording (\'THE LAW IS KEPT\' / \'THE JUNGLE TAKES YOU\'), wolf-head emblem on the boot screen. Page chrome is deep jungle night green.',
    ],
  },
  {
    v: 40,
    title: 'New game: 20,000 Leagues Under the Sea — Captain Nemo (Submarine Shmup)',
    kind: 'game',
    ts: '2026-07-01T19:11:00.000Z',
    items: [
      'Five voyages through Jules Verne\'s 1870 classic: steer the frigate Abraham Lincoln and fire on the mysterious sea monster crossing your crosshairs — 5 hits before 4 misses (aim/timing, ~20s+); walk the luminous coral seabed in Rouquayrol diving suits collecting 14 glowing specimens while dodging eels and jellyfish (steer/collect, 3 lives, 30s); swat 12 giant squid tentacles slapping the Nautilus\'s hatch before 3 breach through (tap-intercept, whack-a-mole); ram 8 polar ice sheets by tapping the power gauge in the green zone — shrinking band, 4-miss limit (precision timing); then steer the Nautilus outward against the Norway Maelstrom\'s inward pull, dodging spinning debris, until you escape the spiral (spiral dodge, 3 lives).',
      'Deep bioluminescent ocean palette — midnight navy (#020c1e), teal (#00c8a0), brass gold (#c8941a) and abyss black on near-black backgrounds. Chapter-select is five BRASS PORTHOLES scattered in an asymmetric 2-1-2 layout — each a riveted circular gauge window on the Nautilus\'s observation hull, with bolt screws at four corners, a pressure bubble highlight, and a teal glow once cleared. Custom FATHOMS currency, in-voice screen wording (\'THE DEPTHS YIELD\' / \'THE SEA CLAIMS YOU\'), animated bioluminescent particle drifters on the title screen, and a Nautilus submarine emblem in teal. Page chrome is deep ocean navy and teal.',
    ],
  },
  {
    v: 39,
    title: 'New game: Les Misérables — 24601 (Drama)',
    kind: 'game',
    ts: '2026-07-01T18:20:00.000Z',
    items: [
      'Five acts through Victor Hugo\'s 1862 epic: row the galley oar in Toulon prison — tap when the stroke marker lines up with the green zone (12 strokes, 4-miss limit, ~18–22s); steal bread on winter Paris streets — drag Valjean to collect 6 loaves while dodging two patrolling gendarmes\' lanterns (3 lives, 32s); gather water for Cosette — catch 16 falling water drops while avoiding the Thénardiers\' thrown rocks (3 lives, 26s); defend the June barricade — tap advancing soldiers before they breach the rebel line (3 breaches = lose, 28s); then carry wounded Marius through the winding Paris sewers — drag left and right to stay in the narrow corridor as it curves faster and tighter (3 crashes, 26s survive).',
      'Dark Paris night palette — near-black navy (#0a0812), revolutionary red (#cc2233), gas-lamp amber (#d4a020), and cobblestone grey. Chapter-select is a VOYAGE MAP OF FRANCE — five parchment location cards scattered at organic positions across the canvas (Toulon, Faverolles, Montfermeil, Paris, Les Égouts) linked by a red dotted journey route with a compass rose in the corner. Custom LIBERTÉ currency, in-voice screen wording (\'JUSTICE ADVANCES\' / \'JAVERT CLOSES IN\'), broken-chain-and-candlesticks emblem on the boot screen, and an animated Paris night scene with Haussmann building silhouettes, gas lamps, and cobblestone streets. Page chrome is deep revolutionary navy and crimson.',
    ],
  },
  {
    v: 38,
    title: 'New game: Dr. Jekyll & Mr. Hyde — Two Minds (Transformation Puzzle)',
    kind: 'game',
    ts: '2026-07-01T17:10:00.000Z',
    items: [
      'Five chapters through Stevenson\'s 1886 novella: brew the transformation compound by tapping a pendulum needle into the sweet zone five times (timing precision, 4-miss limit); prowl foggy London as Hyde, dodging police lanterns while collecting walking canes (22s dodge, 3 lives); tap lit windows to silence witnesses before they raise the alarm — 14 silenced before 3 cries (tap intercept); catch 12 falling formula vials in a moving tray before time runs out or 4 drop (catch, 26s); then hold the locked cabinet door as Jekyll and Hyde alternately demand control — hit 8 transformation ring strikes before the meter fills (dual timing QTE).',
      'Deep Victorian night palette — near-black (#0a0510), bruised purple (#1a0d28), gaslight amber (#cc8833), sickly transformation green (#44cc66), and eldritch violet (#9b5cff). The chapter-select is JEKYLL\'S JOURNAL — five yellowed torn diary pages scattered at different angles on a dark leather study desk, each with ruled lines, a wax-seal number, and chapter text in the property\'s amber/violet ink. Custom DOSES currency, in-voice screen wording (\'THE MIND HOLDS\' / \'THE BEAST TAKES OVER\'), a glowing green potion-flask emblem on the title screen, and an animated Victorian study backdrop with gaslit window, bookshelves, beakers, and drifting fog. Page chrome is deep Victorian purple and amber.',
    ],
  },
  {
    v: 37,
    title: 'New game: The Count of Monte Cristo — The Count\'s Revenge (Escape & Revenge)',
    kind: 'game',
    ts: '2026-07-01T16:41:00.000Z',
    items: [
      'Five acts through Alexandre Dumas\' 1844 novel: dodge blue-coated gendarmes at the Marseille wedding feast to buy time before the arrest (horizontal dodge, 22 seconds, 3 lives); chip through the Château d\'If prison wall with a precision oscillating chisel (tap timing, 10 strikes, 4-miss limit); catch a cave-full of falling gold and gems in Monte Cristo\'s hidden grotto (basket collect, 18 gems, 26-second timer); steer Dantès\' burial sack through Mediterranean night debris toward the distant shore (obstacle dodge, 20 seconds, 3 lives); then expose Fernand, Danglars, and Villefort with a closing precision ring — one stroke of justice each (timing precision, 5-miss limit).',
      'Deep midnight-navy palette with treasure gold (#e3c567) and dark purple accents on a Mediterranean night scene: starred sky, crescent moon, Château d\'If silhouette, and moonlight shimmering on the sea. The chapter-select is a NAUTICAL VOYAGE CHART — five parchment map cards scattered at zigzag positions across the canvas, connected by a dotted sailing route with a compass rose in the corner and location names (Marseille, Île d\'If, Monte Cristo, The Sea, Paris). Custom GOLD currency, in-voice screen wording (\'JUSTICE ADVANCES\' / \'THE PLAN UNRAVELS\'), gold diamond emblem on the title screen. Page chrome is deep midnight navy and treasure gold.',
    ],
  },
  {
    v: 36,
    title: 'New game: The Great Gatsby — The Green Light (Rhythm Party)',
    kind: 'game',
    ts: '2026-07-01T15:41:00.000Z',
    items: [
      'Five scenes from Fitzgerald\'s 1925 novel — each a completely different mechanic: move your champagne tray left and right to catch 15 falling glasses to the jazz beat at Gatsby\'s West Egg party (catch/rhythm, 5 miss limit, ~25s), steer Gatsby\'s cream-yellow roadster through 3 lanes of oncoming traffic and collect green-light pickups to survive 26 seconds to Manhattan (lane dodge, 3 lives), tap precisely when an expanding golden ring passes over Daisy\'s green dock light across the bay (timing precision, 6 successes, 4 miss limit), tap to hold Gatsby\'s position in a horizontal tension bar as Tom\'s accusations push it left — don\'t over-correct or Daisy panics (balance, 24s), then dodge falling ash chunks and Wilson\'s sweeping silhouette across the grey Valley of Ashes to make it through (free-move dodge, 3 lives, 22s).',
      'Deep midnight art-deco palette — black and gold (#d4a017), emerald green dock light (#00cc66), champagne cream (#f5e6c8) — on a Long Island Sound night scene with Gatsby\'s warmly-lit West Egg mansion and Daisy\'s pulsing green light across the water. The chapter-select is five gold-bordered cocktail invitation cards scattered at different angles on a black lacquered table (2-1-2 diamond layout), each with an art-deco inner border and green wax seal. Custom GLAMOUR currency, in-voice screen wording (\'OLD SPORT, WELL DONE\' / \'THE DREAM SLIPS AWAY\'), a pulsing green dock-light emblem on the title screen, and a Long Island Sound night backdrop with animated starfield and water shimmer. Page chrome is deep midnight navy and art-deco gold.',
    ],
  },
  {
    v: 35,
    title: 'New game: Sleepy Hollow — The Headless Horseman (Night Chase)',
    kind: 'game',
    ts: '2026-07-01T13:36:00.000Z',
    items: [
      'Five moonlit chapters through Washington Irving\'s tale: collect lanterns in the haunted hollow, run the schoolroom, feast at the harvest party, ride for your life at midnight, and race to the covered bridge before the Horseman hurls his pumpkin.',
      'Bold autumnal palette — Halloween orange, deep black, harvest gold. Non-list lantern menu on a winding hollow path.',
    ],
  },
  {
    v: 34,
    title: 'New game: Pride & Prejudice — A Matter of Pride (Dialogue Strategy)',
    kind: 'game',
    ts: '2026-07-01T11:51:00.000Z',
    items: [
      'Five scenes from Jane Austen\'s 1813 novel — each a distinct mini-game: dodge the eager Mr. Collins across the Meryton ballroom while collecting golden invitation cards (position/dodge, 3 lives, 30 seconds), catch falling roses (Wickham\'s hidden truths) with a fan while avoiding his flattering masks (falling sort), tap the timing meter to deliver five firm refusals of Mr. Collins\' endless proposal as the zone shrinks (precision timing), steer Darcy\'s carriage through London\'s night roads dodging gossip broadsheets while collecting banknotes (runner, 3 lives), and finally meet Darcy on a misty Longbourn morning — tap when the speak-ring reaches the heart to fill all six conversation moments (approach timing).',
      'Regency England palette: deep midnight violet (#1a1228), dusty rose (#c85a7a), parchment cream (#f0e8d8) and honey gold (#d4a020). The chapter-select is five ivory dance-program cards scattered at different angles on a candlelit drawing-room table (2–1–2 layout) — each hand-lettered with the scene name, a tiny rose, and a gold check when cleared. Custom HEARTS currency, in-voice screen wording (\'PROPRIETY PREVAILS\' / \'FIRST IMPRESSIONS FAIL\'), a blooming rose emblem on the title screen, and a Longbourn manor backdrop with rolling hedgerow hills and rose-lit windows. Page chrome is deep midnight violet and dusty rose.',
    ],
  },
  {
    v: 33,
    title: 'New game: Zorro — The Mark of Zorro (Swashbuckler)',
    kind: 'game',
    ts: '2026-07-01T09:50:00.000Z',
    items: [
      'Five chapters through Johnston McCulley\'s legendary 1919 tale: tap glowing waypoints in order to carve Zorro\'s blazing Z on three hacienda walls (precision sequence, 35-second limit), steer Tornado left and right through the dark canyon dodging rocks and soldiers while collecting gold coins (dodge runner, 3 lives, 28 seconds), parry the Commandante\'s sword strikes by tapping the correct direction then counter in a duel of five hits (timing parry/counter), tap to free five chained peons while dodging two sweeping guard torchbeams (stealth tap, 3 lives), then face Alcalde Ramon in the final showdown — read his telegraphed strikes, dodge to either side, and tap center to counter-attack until his five HP is gone (boss dodge-and-strike).',
      'Deep Spanish Colonial night palette — near-black with crimson (#c8102e), gold (#d4a020) and warm parchment on a California hacienda backdrop with cacti, a crescent moon, and torch glow. The chapter-select is five WANTED POSTERS pinned at tilted angles to a planked tavern wall (2 upper, 1 center, 2 lower) — each a parchment card with Zorro\'s silhouette, tack dot at top, and a red \'JUSTICE DONE\' stamp when completed. Custom HONOR currency, in-voice screen wording (\'THE FOX RIDES FREE\' / \'THEY HAVE THE MASK\'), a pixel Z-blade emblem on the boot screen. Page chrome is deep crimson-brown and gold.',
    ],
  },
  {
    v: 32,
    title: 'New game: Moby Dick — The White Whale (Harpoon Action)',
    kind: 'game',
    ts: '2026-07-01T08:07:00.000Z',
    items: [
      'Five chapters through Melville\'s 1851 novel, each a completely different mechanic: dodge sailors and barrels on the Nantucket docks while collecting pay coins to sign on with the Pequod (runner/collect), wait for the sperm whale to surface and tap to throw Queequeg\'s harpoon (precision aim, 4 hits), drag the longboat to survive 22 seconds of giant squid tentacle attacks (dodge, 3 lives), tap a timing gauge in the green zone to trim the sails through a raging typhoon as Ahab lashes himself to the mast (timing/meter, 8 rounds), then face Moby Dick in a three-day final chase — dodge his horizontal breach charges and harpoon him when he surfaces to breathe (boss battle, 5 strikes).',
      'Deep midnight-ocean palette — navy (#0a1e3c), seafoam teal (#4ab8d8), and doubloon gold (#d4a020) on near-black backgrounds. The chapter-select is a VOYAGE CHART: five brass porthole/compass-rose waypoints scattered across an aged nautical map with a dotted ship\'s route connecting them and a compass rose in the corner — not a list. Custom RESOLVE currency, in-voice wording (\'THE WATERS HOLD\' / \'THE DEEP CLAIMS YOU\'), a large white whale silhouette emblem on the title screen, and a gothic Ishmael quote in the finale (\'And I only am escaped alone to tell thee\'). Page chrome is deep navy and teal.',
    ],
  },
  {
    v: 31,
    title: 'New game: Thor & Loki — Hammer of the Gods (Brawler)',
    kind: 'game',
    ts: '2026-07-01T06:02:00.000Z',
    items: [
      'Five tales from Norse mythology with five completely distinct mechanics: steer Thor left and right across the rainbow Bifrost bridge to dodge Frost Giant boulders and collect golden runes, hold/release a tension meter to haul the World Serpent Jörmungandr from the deep sea (release when it thrashes or the line snaps), tap the figure with bright green eyes to catch shape-shifting Loki among two imposters (eight rounds, speeding up), seal three Asgard gate arches before Fenrir\'s wolves break through in a frantic 28-second defence, then face fire-giant Surtr — dodge the telegraphed danger zone and tap the strike window to hurl Mjolnir five times and end Ragnarök.',
      'Deep midnight-blue Norse palette with Asgard gold (#e8c84a) and ice blue (#a4d8ff) — very different from any other game on the site. The chapter-select is a World Tree (Yggdrasil) layout: five carved runic stones scattered around the great tree\'s branches and roots (two upper stones, one center, two lower) with glowing branch arms connecting them — not a list at all. Custom GLORY currency, in-voice wording (\'ASGARD STANDS\' / \'THE GIANTS LAUGH\'), and a pixel Mjolnir emblem with lightning-rune detail on the title screen. Page chrome is deep midnight blue and Asgard gold.',
    ],
  },
  {
    v: 30,
    title: 'New game: Pinocchio — No Strings (Story Arcade)',
    kind: 'game',
    ts: '2026-07-01T03:52:00.000Z',
    items: [
      'Five scenes from Collodi\'s 1883 tale: tap blue sparkles falling from the evening star to fill Pinocchio\'s life meter while avoiding the grey ones (the Blue Fairy grants Geppetto\'s wish), steer Pinocchio left and right on the dark road to dodge masked bandits and collect gold coins before the Fox and Cat steal them, turn a timing-bar key in Stromboli\'s cage lock five times to escape before your tries run out, tap green EXIT doors falling from above on Pleasure Island while avoiding ale/sweets/cigars lest your donkey-transformation meter hits 100%, and collect eight floating driftwood logs inside Monstro then fan the flames with a timing bar three times to make the great whale sneeze you both to freedom.',
      'Warm puppet-theater palette — deep midnight-blue starry sky, Blue Fairy sparkle cyan (#4ab8e8), and puppet-wood gold. The chapter-select is a red-velvet puppet theater stage with five marionette puppets hanging from strings attached to a gilded wooden bar, each puppet drawn with a wooden head, red tunic body and a long-or-short Pinocchio nose (short once you\'ve cleared that scene). Custom WISHES currency, in-voice wording (\'THE FAIRY SMILES\' / \'THE NOSE GROWS\'), and a Pinocchio-face emblem with animated orbiting Blue Fairy sparkles on the title screen. Page chrome is warm workshop amber and midnight blue.',
    ],
  },
  {
    v: 29,
    title: 'New game: Steamboat Willie — five scenes on the Mississippi (Rhythm Action)',
    kind: 'game',
    ts: '2026-07-01T01:38:00.000Z',
    items: [
      'Five mini-games from the iconic 1928 Mickey Mouse cartoon: steer the steamboat past floating logs and barrels, tap the beat as Mickey whistles \'Steamboat Bill\', tap glowing animals to play the animal orchestra in sequence, drag Mickey to catch Minnie\'s falling parcels as she\'s hoisted aboard by crane, then dodge Captain Pete\'s warning-telegraphed fist swings to escape with the steam whistle!',
      'Vintage black-and-white film aesthetic with warm sepia/amber accents — a crescent moon over the dark Mississippi, animated smoke from the steamboat stack, and a film-strip storyboard chapter menu (five 35mm frames in a 2-1-2 layout with sprocket holes). Custom NOTES currency, in-voice wording (\'TOOT TOOT!\' / \'OH BOY...\'), and a Mickey head silhouette emblem on the title screen.',
    ],
  },
  {
    v: 28,
    title: 'New game: The Phantom of the Opera — Beneath the Opera (Stealth Pursuit)',
    kind: 'game',
    ts: '2026-06-30T23:17:00.000Z',
    items: [
      'Five scenes beneath the Palais Garnier through Gaston Leroux\'s 1910 novel: slip past sweeping torch-beam guards through the underground catacombs, catch the falling musical notes of Erik\'s aria in three columns, intercept glowing searchlight orbs on the rooftop before they expose Christine, cut three chandelier ropes with precision timing as the pendulum swings, then steer Erik\'s gondola through rocks and lanterns across the underground lake to freedom.',
      'Deep midnight-purple and crimson palette with gold filigree — theatrical opera house proscenium on the title and finale screens with animated chandelier. The chapter-select shows five gilded theater boxes (including a Royal Box in the center) arranged in a horseshoe, each with a tiny half-mask ornament. Custom DEVOTION currency, in-voice screen wording (\'THE MUSIC PLAYS ON\' / \'DARKNESS CLAIMS YOU\'), and a half-mask emblem on the boot screen.',
    ],
  },
  {
    v: 27,
    title: 'New game: A Christmas Carol — Scrooge\'s Long Night (Narrative)',
    kind: 'game',
    ts: '2026-06-30T21:17:00.000Z',
    items: [
      'Five chapters through Dickens\' 1843 classic: dodge Marley\'s iron chains by dragging Scrooge up and down while collecting shillings, tap glowing golden memory wisps (avoid the dark ones) with the Ghost of Christmas Past, drag the Cratchit table to catch falling Christmas feast items before they hit the floor, dodge the Ghost of Christmas Yet to Come\'s lane-targeting finger in a dark graveyard, then race through London on Christmas morning jumping over snowdrifts and holly lampposts to reach the Cratchits\' door.',
      'Deep midnight-navy and candlelight-amber palette — nothing like the usual neon arcade look. Five Victorian terraced-house windows scattered at different heights serve as the non-list chapter menu, each glowing amber inside a brick facade. Custom GOODWILL currency, in-property screen wording (\'THE SPIRIT APPROVES\' / \'THE NIGHT GROWS COLDER\'), a candle-and-holder emblem on the title screen, and a Victorian London winter-night backdrop with falling snow, gas-lit streets, and silhouette rooftops.',
    ],
  },
  {
    v: 26,
    title: 'New game: The Three Musketeers — All for One (Fencing Duel)',
    kind: 'game',
    ts: '2026-06-30T17:23:00.000Z',
    items: [
      'Five acts through Dumas\' 1844 classic: steer D\'Artagnan on horseback through road hazards to reach Paris, duel Athos, Porthos, and Aramis one by one with a parry timing meter, steal back the Queen\'s diamonds from the Cardinal\'s palace by tapping gems while dodging sweeping guard sight cones, repel waves of attackers at the siege of La Rochelle, then face the Cardinal\'s one-eyed champion Rochefort in a reaction duel — tap PARRY during each golden flash to riposte.',
      'Deep indigo and crimson French-court palette with a stone hall backdrop, sweeping torch glow, and a gold fleur-de-lis emblem. Chapter select is five royal proclamation scrolls with wax seals and pushpins, scattered in a 2-1-2 velvet-board arrangement — no list. Custom HONOR currency, in-voice wording (\'VIVE LES MOUSQUETAIRES!\' / \'HONOR DEMANDS ANOTHER ATTEMPT\'), and gold-and-navy screen text throughout.',
    ],
  },
  {
    v: 25,
    title: 'New game: Hercules — The Twelve Labors (Boss Rush)',
    kind: 'game',
    ts: '2026-06-30T13:23:00.000Z',
    items: [
      'Five labors of Greek myth, each a distinct mechanic: tap the Nemean Lion at the perfect moment as it charges faster each round, sever Hydra heads before they multiply past seven (cut one, two grow back), dodge bronze feathers from Stymphalian Birds while timing your bronze clappers to scatter the flock, tap each stall to steer the diverted river through the Augean Stables before time runs out, then face three-headed Cerberus in Hades — tap each glowing head before it bites.',
      'Deep Olympus-blue palette with bronze/amber accents and a columned Greek temple silhouette; Zeus lightning flashes in the pediment. Chapter select is a 3-2 arc of bronze hoplon shields on a marble hall floor, each shield bearing the labor\'s icon — no list layout. Custom GLORY currency, in-voice wording (\'OLYMPUS REJOICES\' / \'HERA LAUGHS\'), screen text in parchment gold, and a knotted Herculean club emblem on the title screen.',
    ],
  },
  {
    v: 24,
    title: 'New game: Tarzan — Lord of the Vines (Swing Platformer)',
    kind: 'game',
    ts: '2026-06-30T09:55:00.000Z',
    items: [
      'Five jungle tales through Burroughs\' 1912 novel: dodge falling coconuts and snakes as the infant Tarzan is raised by apes, swing the canopy vine by vine on a pendulum timing challenge, duel the great ape Kerchak for tribal leadership with attack/dodge timing, slip past orange-beam ape-patrol sight cones through the dark forest to rescue Jane, then aim and throw spears at ivory-hunter invaders to defend the jungle.',
      'Lush jungle-green palette with canopy sunbeams, swaying vines, and exotic birds for the backdrop. Chapter-select is a non-list canopy layout — five bark-textured tree-platform perches at scattered heights, connected by hanging vine ropes. Custom VINES currency, in-voice wording (\'THE JUNGLE ANSWERS\' / \'THE JUNGLE TAKES YOU\'), and a hand-print Tarzan emblem on the title screen.',
    ],
  },
  {
    v: 23,
    title: 'New game: Snow White — Seven for the Mine',
    kind: 'game',
    ts: '2026-06-30T06:19:00.000Z',
    items: [
      'Five Brothers Grimm chapters: tap Snow White\'s face out of three in the magic mirror (five rounds, getting faster), dodge grabbing tree-claws as Snow White flees the enchanted forest, steer the mine cart to catch falling gems and avoid boulders with the dwarfs, dodge the Evil Queen\'s poisoned apples while catching the golden ones, then mash to fill the love-heart meter before darkness wins.',
      'Rich royal-purple fairy-tale palette with a mine cross-section chapter select — five hex gem cards (Ruby, Amber, Emerald, Amethyst, Rose) embedded in a winding mine tunnel lit by hanging lanterns. Custom GEMS currency, in-property wording (\'THE FOREST SMILES\' / \'THE QUEEN LAUGHS\'), and a twinkling enchanted-forest backdrop with castle silhouette, glowing ground gems, and the dwarfs\' warm cottage.',
    ],
  },
  {
    v: 22,
    title: 'New game: Treasure Island — X Marks the Spot',
    kind: 'game',
    ts: '2026-06-30T01:35:00.000Z',
    items: [
      'Five chapters through Stevenson\'s classic: snatch the treasure map from the Admiral Benbow Inn before pirates break in, steer the Hispaniola past reefs and cannonballs, defend the log stockade against Silver\'s charging crew, slip through the dark jungle avoiding pirate lantern beams to find marooned Ben Gunn, then dig up Flint\'s hoard — only to find the pit empty — and blast your way to the ship.',
      'Warm aged-parchment palette with a hand-drawn treasure-map chapter select: five torn parchment fragments scattered across the map connected by a red dotted trail. Custom DOUBLOONS currency, full pirate wording (\'PIECES OF EIGHT!\' / \'DAVY JONES CLAIMS YOU\'), and a tropical island scenery backdrop with the Hispaniola on the horizon.',
    ],
  },
  {
    v: 21,
    title: 'The Wizard of Oz — rebuilt as a full five-chapter story game',
    kind: 'game',
    ts: '2026-06-29T21:24:00.000Z',
    items: [
      'L. Frank Baum\'s Oz is back as a proper multi-chapter adventure: dodge flying debris in the twister, run the yellow brick road jumping gaps and rescuing companions (keeps the original mechanic), tap friends awake in the enchanted poppy field before they\'re lost, survive the Great Oz\'s fireballs then pull back the curtain to expose the humbug, and click your ruby heels in perfect rhythm to carry Dorothy home.',
      'Bright, colorful children\'s-tale palette — emerald green, ruby red, sunlit yellow — with a winding yellow brick road map for the chapter select (five circular location badges connected by a bezier road). Custom Emeralds currency, five distinct mechanics, and a \'No Place Like Home\' rhythm finale. Now on the home grid.',
    ],
  },
  {
    v: 20,
    title: 'Frankenstein — rebuilt as a full five-chapter gothic game',
    kind: 'game',
    ts: '2026-06-29T17:36:00.000Z',
    items: [
      'Mary Shelley\'s classic returns as a proper multi-chapter story: channel lightning bolts in 4 lanes to fill the Creature\'s life meter (the original rhythm mechanic, kept and expanded), flee the frightened village dodging torches while collecting provisions, spy through the De Lacey cottage window collecting words while staying hidden, steer across cracking Arctic ice floes, then time precise leaps across the frozen sea in the Creature\'s final farewell.',
      'Dark gothic palette — deep purple, electric green, amber candlelight — with the chapter menu as five glowing specimen jars on a laboratory shelf, each holding a tiny scene from that chapter. No more gold-on-black: the screens tally VITALITY in electric green, win/lose headers in Shelley\'s own register. Now on the home grid.',
    ],
  },
  {
    v: 19,
    title: 'Alice in Wonderland — rebuilt as a full five-chapter game',
    kind: 'game',
    ts: '2026-06-29T14:08:00.000Z',
    items: [
      'Alice returns as a proper multi-chapter story: steer through the rabbit hole (the original falling mechanic, kept and polished), swim the pool of tears collecting golden keys, time cups at the Mad Hatter\'s long table, swing a flamingo mallet at the Queen\'s croquet wickets, then dodge flying cards at the trial.',
      'Bright Wonderland palette — sky blue, flamingo pink, golden yellow — with a playing-card chapter menu on a green felt card table, five cards fanned out at different angles. The game is back on the home grid with all five tales to clear.',
    ],
  },
  {
    v: 18,
    title: 'The arcade now shows only the full story-mode games',
    kind: 'feature',
    ts: '2026-06-29T13:22:00.000Z',
    items: [
      'The home grid and search are curated to the finished, multi-chapter story games. The older single-screen versions (Alice, the Wizard of Oz, Frankenstein) and not-yet-built titles are tucked away until they\'re rebuilt in the richer format.',
      'Those classics are coming back as full multi-chapter games — keeping the bits that worked, like Alice\'s endless fall — and will reappear automatically once they ship.',
    ],
  },
  {
    v: 17,
    title: 'New game: Cinderella — Before Midnight',
    kind: 'game',
    ts: '2026-06-29T10:23:00.000Z',
    items: [
      'Five fairy-tale acts through Perrault\'s Cinderella: tap away chores before the step-sisters wake, catch the Fairy Godmother\'s falling sparkles with a basket, time a waltz on a spinning golden dial, dodge palace guards across three lanes as the midnight bells count to twelve, and drag the glass slipper to Cinderella\'s glowing foot while shooing away grasping step-sisters.',
      'Unique look: deep midnight-violet and rose-pink palette with a sparkling ballroom chandelier; the chapter menu is scattered dance invitation cards tilted at different angles on a marble checkerboard ballroom floor.',
    ],
  },
  {
    v: 16,
    title: 'New game: Peter Pan — Second Star to the Right',
    kind: 'game',
    ts: '2026-06-29T06:24:00.000Z',
    items: [
      'Five Neverland adventures: hold to rise and dodge London chimneys at night, drag Pan to intercept Hook\'s pirates at Mermaid Lagoon and rescue Tiger Lily, tap left-right alternately to run Hook away from Tick-Tock the crocodile, defend the Lost Boys\' underground hideout from all sides, and duel Captain Hook on the Jolly Roger\'s deck.',
      'Unique look: deep midnight-blue starry night palette with gold pixie-dust stars; the chapter menu is a scattered star-map tracing the path from London rooftops to Neverland — five glowing five-pointed stars connected by a pixie-dust trail.',
    ],
  },
  {
    v: 15,
    title: 'Every screen speaks the story\'s language',
    kind: 'feature',
    ts: '2026-06-29T01:51:00.000Z',
    items: [
      'The chapter intros, the score screens and the finale now wear each game\'s own colors and wording — no more shared gold-on-black. Dracula tallies BLOOD SPILLED in crimson, Sherlock reads CLUES READ in sepia, Robin Hood wins a PURSE in Sherwood green, Arthur earns HONOUR in royal blue.',
      'Win and lose lines are in-voice too — "The night is held" vs "Dawn finds you fallen" — so every game feels distinct end to end.',
    ],
  },
  {
    v: 14,
    title: 'New game: Winnie-the-Pooh — Hunny Hunt',
    kind: 'game',
    ts: '2026-06-29T01:45:00.000Z',
    items: [
      'Five cozy adventures through the Hundred Acre Wood: float on a balloon to steal honey from the bees, follow the mysterious Woozle tracks in the snow, gather gifts for Eeyore\'s birthday, steer Piglet through the Blustery Day, and wiggle Pooh free from Rabbit\'s door.',
      'Unique look: warm sunny sky palette, a hand-drawn parchment map of the Hundred Acre Wood for the chapter menu, wooden sign-post chapter cards, and the Sanders tree on the title screen.',
    ],
  },
  {
    v: 13,
    title: 'Every game page wears its own colors',
    kind: 'feature',
    ts: '2026-06-29T01:19:00.000Z',
    items: [
      'The page around each game — top bar, help strip, background and borders — now matches that game\'s world instead of the same neon: crimson for Dracula, sepia for Sherlock, forest for Robin Hood, royal blue for King Arthur, and more.',
      'Leaving a game and entering another now feels like a real change of place.',
    ],
  },
  {
    v: 12,
    title: 'Menus reimagined per story',
    kind: 'feature',
    ts: '2026-06-28T23:53:00.000Z',
    items: [
      'Each game\'s chapter-select is now its own world: Dracula\'s scattered graveyard tombstones, Sherlock\'s pinned corkboard, Robin Hood\'s archery targets in a sunlit clearing, King Arthur\'s radial Round Table of shields.',
      'Different layouts, shapes, colors and backgrounds — no two look alike.',
    ],
  },
  {
    v: 11,
    title: 'Each game looks its own way now',
    kind: 'feature',
    ts: '2026-06-28T23:39:00.000Z',
    items: [
      'Bold, property-specific chapter menus: Dracula\'s blood-red stone tablets, Sherlock\'s manila case files, Robin Hood\'s wooden Sherwood signs, King Arthur\'s royal banners.',
      'Robin Hood and King Arthur also shipped automatically from the new hourly builder.',
    ],
  },
  {
    v: 10,
    title: 'New game: King Arthur — The Legend of Camelot',
    kind: 'game',
    ts: '2026-06-28T22:55:00.000Z',
    items: [
      'Five chapters of Arthurian legend: pull Excalibur from the stone, fly as Merlin\'s hawk dodging rocks and arrows, joust at the grand tournament, tap-defend Camelot\'s gates against the Saxon siege, and seek the Holy Grail while dark knights patrol.',
      'Unique scenery: rolling hills, a Camelot silhouette against a starlit sky, misty lake, and a glowing sacred chapel for the Grail quest.',
    ],
  },
  {
    v: 9,
    title: 'New game: Robin Hood — The Sherwood Saga',
    kind: 'game',
    ts: '2026-06-28T22:21:00.000Z',
    items: [
      'Five chapters of Sherwood legends: aim at the tournament, ride through the forest ambush, duel Little John on the log bridge, rob the tax carriage, and face the Sheriff to free Maid Marian.',
      'Unique forest scenery with dappled sunlight, animated falling leaves, and a longbow-and-arrow emblem.',
    ],
  },
  {
    v: 8,
    title: 'Update history & automatic builds',
    kind: 'feature',
    ts: '2026-06-28T20:53:00.000Z',
    items: [
      'Added this "What\'s New" drawer and a "last updated" stamp so you can see every change.',
      'Switched on the automated build loop that ships new games and improvements on a schedule.',
    ],
  },
  {
    v: 7,
    title: 'Every game gets its own look',
    kind: 'feature',
    ts: '2026-06-28T19:46:00.000Z',
    items: [
      'Unique, animated title & chapter-select screens per story — a gothic night for Dracula, a foggy Victorian moor for Sherlock.',
      'Themed chapter icons and custom menu wording.',
    ],
  },
  {
    v: 6,
    title: 'Dracula & Sherlock leveled up',
    kind: 'feature',
    ts: '2026-06-28T19:04:00.000Z',
    items: [
      'Story-fitting progress meters (Dracula\'s RESOLVE, Sherlock\'s INSIGHT).',
      'Added Renfield\'s fly-catch chapter and brought back the foggy moor maze.',
    ],
  },
  {
    v: 5,
    title: 'New multi-chapter format',
    kind: 'feature',
    ts: '2026-06-28T18:35:00.000Z',
    items: [
      'Games are now full-screen stories made of five different mini-games.',
      'Dracula rebuilt: the castle wall, the Demeter, Renfield, Lucy\'s tomb, and a sunset chase.',
    ],
  },
  {
    v: 4,
    title: 'Real game thumbnails',
    kind: 'feature',
    ts: '2026-06-28T18:10:00.000Z',
    items: [
      'Home cards now show actual gameplay instead of placeholder art.',
    ],
  },
  {
    v: 3,
    title: 'Mobile & fullscreen polish',
    kind: 'fix',
    ts: '2026-06-28T17:50:00.000Z',
    items: [
      'Games fill the screen and play great on phones.',
      'Added a one-tap fullscreen button, fixed the header, and calmed the ticker.',
    ],
  },
  {
    v: 2,
    title: 'Live at games.polecat.live',
    kind: 'feature',
    ts: '2026-06-28T17:25:00.000Z',
    items: [
      'Custom domain online, auto-publishing on every update.',
    ],
  },
  {
    v: 1,
    title: 'Arcade launch',
    kind: 'feature',
    ts: '2026-06-28T16:36:00.000Z',
    items: [
      'The home page, the game engine, and the first games: Sherlock, Dracula, Alice, Oz, and Frankenstein.',
    ],
  },
];

export const LATEST_VERSION = CHANGELOG.reduce((m, e) => Math.max(m, e.v), 0);
