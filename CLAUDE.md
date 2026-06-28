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
js/catalog.js         window.POLECAT_CATALOG — single source of truth for every game
js/home.js            Renders the catalog + procedural thumbnails + filtering
assets/logo.svg       Polecat mascot logo (also favicon)
games/<id>/index.html Per-game page (loads engine + game.js)
games/<id>/game.js    The game itself
BUILD_LOOP.md         The hourly build-loop playbook (read this when looping)
```

## Adding a new game (the core repeatable task)
1. Pick the next `status:"soon"` entry in `js/catalog.js` (or add one). Use the
   `id` as the folder name: `games/<id>/`.
2. Copy an existing game's `index.html` as a template; change the title,
   `<title>`, source label, help text, and the `buttonLabels`.
3. Write `games/<id>/game.js` using the RetroEngine API. **Vary the genre** —
   do not ship two of the same kind in a row. The `genre` field in the catalog
   is the intended mechanic; honor it.
4. Flip that catalog entry's `status` from `"soon"` to `"live"`.
5. `node --check` every JS file, then load-test in a headless browser (see
   BUILD_LOOP.md) — assert zero pageerrors and that the canvas renders.
6. Commit + push to the working branch.

## Design principles
- **Capture the story.** Analyze the property: setting, characters, key scenes.
  The mechanic should *be* the story (climbing Dracula's tower, falling down
  Alice's hole, following Oz's road), not a reskin.
- **8-bit first.** Chunky pixels, limited palette, chiptune SFX. Later styles
  (16-bit, vector, mono) can be added via the catalog `style` field + a filter.
- **Mobile + desktop.** Always pass a `touch` layout to the engine and make the
  game fully playable with on-screen buttons. Test at 390×780 and desktop.
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

## Conventions
- Keep each game in a single `game.js` IIFE. No globals leak except via Retro.
- Genre variety is a feature — track what's been built and diversify.
- Update `js/catalog.js` `status` in the SAME commit that adds the game.
- Never break the home page: it reads the catalog, so keep entries well-formed.
