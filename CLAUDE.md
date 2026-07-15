# games.polecat.live — project guide

An ever-growing browser arcade of **instantly-playable 8-bit games built from
public-domain stories**. Pure static HTML/CSS/JS — no build step, no
dependencies, no backend. Deployed as static files.

## The home page runs on Polecat Shell (vendored — READ-ONLY)
`vendor/polecat-shell/` is a versioned copy of the shared fleet UI library from
the `kevinrhaas/polecat-platform` repo (see its docs/SHELL-API.md). It powers
the home page's left rail (genre families + counts), top bar, the 3×3 fleet
app switcher, the What's-New right panel, and the neon theme tokens
(`data-palette="neon"` × `data-theme` light/dark, stored at `games.theme`).
**Never edit files under `vendor/polecat-shell/`** — changes there belong in
the platform repo and arrive via `chore: polecat-shell vX.Y.Z` PRs
(MANIFEST.json sha256 hashes are drift-checked by fleet sweeps). Games-side
skinning lives in `css/shell-neon.css` (the arcade `.abtn` CTA, chrome glow,
light-mode fixes); home wiring lives in `js/home.js`. Per-game pages do NOT
load the shell — they keep their own `--g-*` chrome (below).

## Layout
```
index.html            Home page (shell rail/topbar + hero, filters, grid, ads)
vendor/polecat-shell/ Shared fleet UI library (READ-ONLY — see above)
css/shell-neon.css    The arcade's skin over the shell (abtn, glows, light mode)
css/site.css          Global design system (synthwave/neon arcade)
css/game.css          Shared per-game page layout + touch-control styles
js/retro-engine.js    The shared 8-bit game engine (see API below)
js/saga.js            RetroSaga — the multi-chapter "epic saga" shell (preferred)
js/catalog.js         window.POLECAT_CATALOG — single source of truth for every game
js/home.js            Renders the catalog + procedural thumbnails + filtering
assets/logo.svg       Polecat mascot logo (also favicon)
games/<id>/index.html Per-game page (loads engine + game.js)
games/<id>/game.js    The game itself
games/<id>/thumb.png  Real screenshot used on the home card (see tools/snap-thumbs)
tools/snap-thumbs.mjs Captures gameplay thumbnails for live games (headless)
BUILD_LOOP.md         The hourly build-loop playbook (read this when looping)
```

## The format: every property is a multi-chapter SAGA (the house style)
Each game is **not** a single mechanic — it's an epic, full-screen **saga of
~5 mini-games** that together tell the story, in the spirit of the Godfather
"Corleone Saga". Built on `RetroSaga` (`js/saga.js`), which gives you:
- a tap-to-begin **title screen**, a **chapter-select menu**, a **story
  interstitial** (narrative lines + a real quote) before each chapter, a
  **result screen** that banks **RESPECT**, and a **finale** when all are cleared;
- save/progress in localStorage, camera shake / flash / particles / vignette,
  pointer (tap & drag) + arrow keys, and auto-fullscreen on begin.

You write an `id`, theme, and a `chapters` array. Each chapter is one mini-game
object: `{ id, name, sub, intro:[lines], quote, help, winText, loseText,
init(api), update(api,dt), draw(api) }`. The mini-game calls `api.win()` /
`api.lose()` to end. **Vary the 5 mechanics** (dodge, timing, defend, precision,
chase, aim, stealth, rhythm…) — they should feel like five different games that
share one story. See `games/dracula-castle/game.js` as the reference saga.
RetroSaga is portrait (270×480) and meant to be played fullscreen.

`api` gives: `gfx, ctx, input, audio, util, pointer{x,y,down,justDown}, W, H,
t, score, addScore(n), win(), lose(), shake(a,t), flash(c,t), burst(x,y,c,n),
confirm(), keyDown(b), keyPressed(b), clear/txt/txtC/lines/panel/topBar/
vignette/scanlines, colors`. The framed screens auto-fit their text to the
270px width (titles/headers shrink, the result header + intro/help wrap), so
keep labels readable but don't sweat length. For your own in-game text, prefer
`api.txtCFit(str,x,y,size,color,pixel)` (centered, shrink-to-fit) or
`api.txtCHead(str,x,yTop,size,color,pixel,lh)` (centered, wraps) / `api.wrapFit(
str,size,maxW,pixel)` over raw `txtC` whenever a string could run long.

**Make the framed screens WILDLY unique & on-property** — never the default
gold-on-black list. Two games should look nothing alike. Every game MUST supply:
- a **bold, property-specific palette** (bright & colorful for children's tales
  like Oz/Alice/Pooh; dark & moody for horror; royal for myth). Don't reuse the
  gold-on-near-black scheme for everything.
- `emblem(api,cx,cy)` and `scenery(api,scene,t)` — an animated backdrop for
  boot/menu/intro/result/finale that paints the story's world.
- a per-chapter `icon(api,x,y)` themed glyph.
- a **`menu` block** that re-skins the chapter-select to the property:
  `menu.colors` (title/label/cur/…), `menu.card(api,{ch,i,x,y,w,h,sel,done,best})`
  to draw each chapter entry as something thematic (Dracula = blood-wax stone
  tablets, Sherlock = manila case-file folders, Robin Hood = wooden Sherwood
  signs, Arthur = heraldic banners; others could be a treasure map, a deck of
  cards, road stops, constellations…), and optionally `menu.layout(api,chapters)`
  returning custom rects for non-list arrangements (map nodes, a winding road).
- custom `currency`, `subtitle`, `bootCta`, `menuLabel`, `menuHint`, `menuDone`,
  `bootLine`, `finale`.
- a **`screens` color block** + a **`labels` wording block** so the chapter
  intro, the score/result screen and the finale read in-property — NOT the
  default gold-on-black (they'd otherwise all look identical even with unique
  menus). `screens` keys: `win, lose, chapterLabel, name, sub, intro, quote,
  help, score, cur, cta, overlay`. `labels` keys: `chapter` (e.g. "TALE"/"CASE"),
  `score` (e.g. "BLOOD SPILLED"/"PURSE WON"), `win`/`lose` (in-voice outcome
  headers like "The night is held" / "Dawn finds you fallen"), `cont, finale,
  toMenu, play`. For a fully bespoke screen, supply `renderIntro(api,info)`,
  `renderResult(api,info)` or `renderFinale(api,info)`.

Stay FAITHFUL to the source's era/mood. Reserve CRT/terminal looks for genuinely
techy/sci-fi works (War of the Worlds, Time Machine, Metropolis) — never a
default. Do NOT use the word "saga" in any user-facing text.

The original single-mechanic games **alice, oz, frankenstein** are legacy
(sherlock is already a story-mode game). They carry `legacy:true` in the catalog,
which **hides them from the home grid & search** — the home page only surfaces
finished, multi-chapter story-mode games (`status:"live"` AND not `legacy`).
"soon" games are hidden too. Prioritize upgrading these legacy games to full
multi-chapter story games (keep their good bits — e.g. Alice's falling
mechanic), and **drop the `legacy:true` flag** in the same commit so the rebuilt
game appears on the home page. New story-mode games show automatically (no flag).

## Generations — games level up over time (real console-history numbering)
Generations follow **actual gaming history**, not internal 1/2. The famous
"8-bit era" is **Generation 3** (NES, 1983–90); "16-bit" is **Generation 4**
(SNES/Genesis). Gen 1/2 were the Odyssey/Atari-2600 (kept in reserve for any
deliberately primitive throwback); Gen 5 is the 32/64-bit **3D era** (future).
The `gen` field defaults to **3** for 8-bit and **4** for 16-bit (see
`js/home.js genOf`); the home card shows a `GEN n` badge (silver=3, gold=4).
Games don't just accumulate — they **ascend a generation**, richer tech + deeper
structure while keeping their story.
- **Gen 3 — 8-bit (NES):** `RetroSaga` (`js/saga.js`), 5 chapters, chunky pixels.
  **Period-honest 8-bit:** pick colors from the NES palette (`Retro.NES`, or snap
  with `Retro.snapNES(hex)`) — a tight, limited set; use **flat hard-edged fills
  + dithering** for shades, **NOT** smooth gradients or soft alpha glows (the NES
  had no alpha blending); chunky pixels; keep the chiptune audio (already
  period-accurate). Light scanlines are fine (CRT-honest).
- **Gen 4 — 16-bit (SNES/Genesis):** `RetroSaga2` (`js/saga2.js`) + the 16-bit
  graphics layer `RetroGfx2` (`js/retro-gfx2.js`, exposed as `api.g2`). A Gen-4
  game is **richer & more dynamic than 5 flat chapters**: a navigable **hub map**
  (the hub IS the menu, themed via `map.layout/node/title`; **every node is
  playable from the start — do NOT lock levels**. `needs:[ids]` still declares
  the *intended* order for the default cursor & the connector art, but nothing is
  gated unless a game opts in with `cfg.gateNodes:true`. Keep it easy to jump in),
  each node a run of escalating
  **phases** ending in a **mini-boss** (`boss:true`), **persistent upgrades**
  (`upgrades{}` + node `grant`, read with `api.has(key)`) and banked `currency`,
  a per-node `choice` that sets `flags`, and multiple `endings` chosen by those
  flags. `api.g2` gives `skyGradient/dither/parallax/mode7/glow/roundRect/
  bigSprite/stoneWall` PLUS animation helpers `stars/embers/fog/flame(torch)/
  gleamText/lightning/ornateFrame`. **Reference: `games/dracula-castle/` (Dracula
  — Nights of Blood).** Load order in index.html: retro-engine.js → retro-gfx2.js
  → saga2.js → game.js.
  **The 8→16-bit LEAP MUST BE OBVIOUS — and it has to show in GAMEPLAY, not just
  the title/menu.** Keep the story & chapters, but a Gen-4 phase must look
  clearly richer than its 8-bit self: DETAILED, LAYERED, LIT environments
  (`g2.stoneWall`/parallax/gradients/`fog`/`flame` — never a flat `clear()` + a
  2-tone tile loop); LARGER multi-tone **animated** sprites (5+ shades, an
  outline, 2+ frames — not a 4-row chunky sprite scaled up); richer color and
  depth (fore/mid/background); ambient particles; framed/ornate HUDs. If a
  gameplay screen looks like the 8-bit version, it is NOT done. (See the Castle
  Wall climb + the Count boss in `games/dracula-castle/game.js` — detailed
  stonework, torches, a recessed moonlit window, a bigger animated climber.)
  Likewise: an ANIMATED title (`renderBoot` — gleaming logo, parallax scene,
  particles) and a DETAILED ANIMATED menu/hub (ornate framed node medallions
  with per-location vignettes, a flowing connector, torch flames, a selection
  glow/cursor — `cfg.map.title/node` receive `sceneT`). Static screens are a fail.
  **Higher-resolution rendering is part of the leap.** `RetroSaga2` super-samples
  the canvas (`superSample:3`, opt down via `cfg.superSample`) so type & lighting
  render CRISP, not re-blocked — the 16-bit tier is NOT the 8-bit pixel grid.
  Give the framed screens a **higher-res display face** with `cfg.titleFont` (an
  on-property display font — e.g. Dracula's engraved `Georgia, serif`); hero
  titles then render in it (via the `'title'` text role) while body/labels use a
  clean UI face (`cfg.uiFont`, default Inter) instead of the chunky 8-bit font.
  Pixel-art sprites stay hard-edged; only the type/lighting go hi-res.

**NORTH STAR: every property gets BOTH a Gen-3 (8-bit) and a Gen-4 (16-bit)
version.** They coexist — a Gen-4 is **ADDITIVE, never a replacement** for the
8-bit game. The home page groups them into one card (shared catalog `property`
key) with an 8-bit/16-bit play switch. `games/dracula-8bit` (Gen 3) +
`games/dracula-castle` (Gen 4) are the reference pair.

**Adding a property's Gen-4 version** (an occasional, high-care task — do NOT
rush it): create a NEW folder `games/<id>-16/` (leave the 8-bit folder intact)
with its own `game.js` on `RetroSaga2` (keep the property's best mechanics but
expand to a hub + phased nodes + mini-bosses + upgrades + branching + endings),
an `index.html` on the Gen-4 scripts, and a fresh thumbnail. Add a NEW catalog
entry `{ id:"<id>-16", …, style:"16-bit", gen:4, property:"<Property>" }` and set
that SAME `property` on the existing 8-bit entry so they share one card.
Headless-test the whole scene walk (zero pageerrors, every phase pacing-audited).

## Adding a new game (the core repeatable task)
1. Pick the next `status:"soon"` entry in `js/catalog.js` (or add one). Use the
   `id` as the folder name: `games/<id>/`.
2. Copy `games/dracula-castle/index.html` as the template (it loads
   `retro-engine.js` + `saga.js` + `game.js`); change the title, `<title>`,
   source label, and help text. Keep the `#fullscreenBtn`, `#muteBtn`,
   `#restartBtn` bar buttons.
2b. **Theme the page chrome to match the game.** In the new `index.html` head,
   add `<style id="game-theme">:root{ … }</style>` overriding the page theme
   variables so the top bar, help strip, page background and borders match the
   property (not the default neon). The vars (defined in `css/game.css`):
   `--g-bg1 --g-bg2` (page background), `--g-bar`, `--g-accent`, `--g-title`,
   `--g-panel`, `--g-border`, `--g-text`, `--g-key`, `--g-stage`, `--g-glow`.
   See the saga games for examples (Dracula crimson, Sherlock sepia, Robin Hood
   forest, Arthur royal blue). The page should feel like the game, not the hub.
3. Write `games/<id>/game.js` as a `RetroSaga.create({...})` with **5 chapters**
   (see the saga section above). Capture the property's key scenes; vary the five
   mechanics. (Legacy single-mechanic games may still use the bare RetroEngine,
   but new work should be a saga.)
4. Flip that catalog entry's `status` from `"soon"` to `"live"`.
5. `node --check` every JS file, then load-test in a headless browser (see
   BUILD_LOOP.md) — assert zero pageerrors and that the canvas renders.
6. Capture the card thumbnail: `node tools/snap-thumbs.mjs <id>` →
   `games/<id>/thumb.png`. The home page shows this real screenshot (procedural
   art is only a fallback), so never ship a live game without it.
7. Commit + push to the working branch.

## Design principles
- **Variety is the job — fight sameness (highest priority).** The shell makes
  everything rhyme: title → 5-node click menu → chapter + quote, and most
  mechanics collapse into "move to dodge." That's the trap. Every new game must
  break the mould on THREE axes vs. the recent builds (scan the last ~8 catalog
  entries + their game.js first):
  1. **Core genre.** Pick a PRIMARY genre that's under-represented lately, from
     the full space: action, adventure, action-adventure, RPG, simulation,
     strategy/tactics, sports, racing, puzzle, shooter, fighting, platformer,
     survival, horror, stealth, sandbox/open-world, tower-defense, roguelike,
     rhythm, card, board, trivia, tycoon/management, point-and-click. Match the
     genre to BOTH the property AND its era. Do NOT ship another dodge/steer
     game if the last few were dodge/steer. Within a game, the sub-mechanics
     should span ≥3 distinct genres — never five dodge chapters.
  2. **Structure/flow.** The 5-chapter click-menu is the DEFAULT, not the law.
     Vary it: 3–6 nodes, a branching path, a boss-rush ladder, a level dial, a
     board/track you traverse, a character-select, or a SINGLE continuous game
     with no chapter menu at all (a full platformer, a card game, a roguelike
     run, a tycoon) built on bare `RetroEngine` when the genre wants it. A card
     or board game should look like cards/a board, not a chapter list.
  3. **Title/opening.** Not always big-title + subtitle + tap + quote. Mix it up:
     an arcade attract-loop, a cold open that drops into action, a comic-panel
     prologue, a map/scroll reveal, a character-select splash. Quotes are
     optional, not a template. Keep the STORY framing (that part works) — just
     stop repeating the same sequence. Two games in a row must not open alike.
- **Pacing — every chapter must be playable.** No chapter may end (win OR lose)
  before the player has had real time to play it: aim for ~15-30s of play for a
  survive/dodge/distance/defend chapter, several attempts for a timing beat.
  When a chapter advances by accumulating a value per frame (`dist += speed*f`)
  toward a target, that runs at ~60fps — tune the accrual so the target is hit
  in ~15-25s, not 2-5s (the old Hispaniola crossed its distance in ~2.4s — a
  bug). Obstacle fall-speed and spawn cadence are REAL-TIME (keyed off `dt`), so
  slowing the forward accrual buys dodging time WITHOUT changing difficulty.
  Audit both the win and lose conditions of each chapter before shipping.
- **Capture the story.** Analyze the property: setting, characters, key scenes.
  The mechanic should *be* the story (climbing Dracula's tower, falling down
  Alice's hole, following Oz's road), not a reskin.
- **8-bit first.** Chunky pixels, limited palette, chiptune SFX. Later styles
  (16-bit, vector, mono) can be added via the catalog `style` field + a filter.
- **Mobile + desktop (first-class).** Always pass a `touch` layout to the engine
  and make the game FULLY playable with on-screen buttons — no keyboard assumed.
  Test at 390×780 and desktop. Controls must be big enough for thumbs, the
  playfield must be readable on a small screen, and the game must work in
  fullscreen (the engine adds a fullscreen toggle to every game automatically —
  see below). Mobile feel is a release gate, not a nice-to-have.
- **Instant fun.** Playable in <5 seconds, clear goal, restart on any key.
  Include a high-score via `Retro.Store`.
- **Self-contained.** Each game is one folder. No shared state between games.

## RetroEngine API (js/retro-engine.js) — `window.Retro`
```js
const engine = new Retro.Engine({
  width, height,            // logical pixel resolution
  parent: '#game',          // mount point
  touch: 'dpad'|'horizontal'|'minimal'|false,  // on-screen controls
  buttonLabels: { a, b }, showB: bool,
});
engine.run(update /* (dt) */, render /* (gfx) */);  // fixed-timestep loop
engine.gfx    // Graphics: clear, rect, rectO, circle, line, text, textC, sprite(rows,x,y,palette,scale)
engine.input  // down(b), pressed(b), released(b), anyPressed()  buttons: up/down/left/right/a/b/start
engine.audio  // sfx('coin'|'jump'|'hurt'|'shoot'|'power'|'win'|'lose'|'explode'|'blip'|'select'),
              // tone, slide, noise, music, toggleMute()
Retro.Store   // getHigh(game), setHigh(game,v), get/set(game,key,val)
Retro.util    // clamp, lerp, rand, randInt, choice, aabb, dist
```
`gfx.sprite(rows, x, y, palette, scale)` draws pixel art from strings; `'.'`/
space = transparent, any other char maps through `palette` (e.g. `{k:'#000'}`).

Standard per-game page wires two buttons in the top bar:
`#muteBtn` (toggles `audio.toggleMute()`), `#restartBtn` (calls the game's reset).
Add a `#fullscreenBtn` to the bar too — the engine auto-wires it to
`engine.toggleImmersive()` (fullscreen "fill the screen" mode that works on iOS
Safari too). The engine also drops a floating ✕ exit button that only appears in
fullscreen, so fullscreen works even if you forget the bar button.

## Conventions
- Keep each game in a single `game.js` IIFE. No globals leak except via Retro.
- Genre variety is a feature — track what's been built and diversify.
- Update `js/catalog.js` `status` in the SAME commit that adds the game.
- Never break the home page: it reads the catalog, so keep entries well-formed.
