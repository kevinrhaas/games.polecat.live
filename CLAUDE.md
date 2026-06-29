# games.polecat.live — project guide

An ever-growing browser arcade of **instantly-playable 8-bit games built from
public-domain stories**. Pure static HTML/CSS/JS — no build step, no
dependencies, no backend. Deployed as static files.

## Layout
```
index.html            Home page (hero, filters, game grid, ad slots)
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
vignette/scanlines, colors`.

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

The five existing single-mechanic games (sherlock, alice, oz, frankenstein) are
legacy — upgrade them to sagas as the loop comes around to them.

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
