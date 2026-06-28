# The Hourly Build-Loop Playbook

This file is the standing instruction set for each hourly iteration that builds
out games.polecat.live. Follow it top to bottom, then stop.

## Calibration (set by the site owner — honor every iteration)
- **Audience: adults.** This is an adult-targeted arcade. Horror titles can be
  genuinely dark, atmospheric and **bloody** (blood, gore, dread, death) where
  the source supports it — Dracula, Cthulhu, Nosferatu, Frankenstein, Sleepy
  Hollow, Jekyll & Hyde, etc. Stay tasteful-but-visceral; no real-world hate or
  sexual content. 8-bit gore reads as stylized, not gratuitous.
- **Difficulty: pick-up-and-play casual.** Forgiving, immediately fun, generous
  checkpoints/lives, clear feedback. Great on mobile. Skill ceiling is fine, but
  never punishing or obscure. Players should smile in the first 10 seconds.
- **Priority: most-famous-first AND maximize genre variety.** Each hour, prefer
  the bigger household names (Robin Hood, Peter Pan, Tarzan, King Arthur,
  Cinderella, Snow White, Treasure Island, Zorro, Sherlock's other tales...)
  while still NOT repeating the previous game's genre. Fame breaks ties; variety
  is the constraint.
- **Every game is a multi-chapter SAGA (owner request).** Not a single mechanic
  — an epic, full-screen experience of **~5 mini-games** that together tell the
  property's story, like the Godfather "Corleone Saga": title screen → chapter
  select → story interstitial (narrative + a real quote) → mini-game → result/
  RESPECT → finale. Build on `RetroSaga` (`js/saga.js`); the reference is
  `games/dracula-castle/`. The five chapters must use **distinct** mechanics and
  hit the property's most iconic scenes. Treat the older single-mechanic games
  (sherlock, alice, oz, frankenstein) as a backlog to upgrade into sagas.
- **Mobile + touch play is a hard requirement (owner request).** Every game —
  past and future — must be genuinely great on a phone: fully playable with the
  on-screen touch controls (assume NO keyboard), big thumb-friendly buttons, a
  playfield that's readable at 390×780, and working fullscreen. The engine gives
  every game a fullscreen toggle (`#fullscreenBtn` in the bar + a floating exit
  button) and an immersive "fill the screen" mode that works on iOS. When you
  build a new game, test it at 390×780 AND in fullscreen before shipping. Each
  loop, also spend part of the "every few iterations" budget retro-fitting an
  existing game's mobile feel (control size, readability, fullscreen scaling).
- **Don't brand the site "public domain."** On the *website*, present games as
  popular, legendary, beloved, classic stories and characters — never lead with
  "public domain." (Public-domain status still governs WHICH properties we may
  build — it's an internal selection rule, not marketing copy.) Keep author/
  source attribution on cards; just don't frame the site around the legal term.
- **Ad slots = self-promo for now.** The `.ad-slot` elements on the home page
  cross-promote games on the site (rotating "Featured" picks), not paid ads.
  Keep the slot structure intact so a real network can drop in later. When you
  add games, the promo rotation picks them up automatically from the catalog.

## Mechanic & theming toolbox (be clever — this is the fun part)
Each property is a multi-chapter game; the **5 mini-games must use distinct
mechanics** and hit the property's most iconic scenes. Don't reach for the same
few — pull widely from this palette and invent new ones:
- **Action/timing:** dodge/steer, timing-meter (grip/strike), precision-ring,
  rhythm/lead, aim & shoot, chase, swing/momentum, balance.
- **Tap/touch:** catch falling/​moving things (Renfield's flies), tap-to-intercept
  over a map, whack/defend threatened spots (the Demeter), tap-clues observation
  & deduction (the walking stick).
- **Thinky-but-easy:** fog-of-war maze/explore, stealth past sweeping lights,
  sequence/assembly (the cut-out warning), memory/match, sorting, resource
  **deploy/distribute** across fronts/regions, simple route-planning.
Keep every mini **easy and juicy**: clear goal readable in 5 seconds, forgiving,
big feedback (shake/flash/particles). Variety across the five is the whole point.

**Theming & framing devices** (inspired by the Corleone & W.O.P.R. references —
borrow the *ideas*, never copy them):
- Give the game a **voice/host with personality** — narrate the interstitials and
  win/lose lines in-character (a storyteller, a machine, a villain).
- A short **boot / terminal / "establishing" intro** before the title fits techy
  or eerie properties (War of the Worlds, The Time Machine, Metropolis,
  Frankenstein's lab, Cthulhu) — type-on text, CRT scanlines.
- **Witty locked entries:** a chapter or bonus module can be gated with an
  in-character message; sequential unlocks give a sense of progress (optional —
  default is free chapter choice for accessibility).
- **Style variants via the catalog `style` field** + the home style filter: pick
  a look that *fits* — green-phosphor "mono/terminal" for sci-fi, sepia for
  period drama, stark vector for myth. 8-bit is the default; introduce others
  deliberately, not at random.

## Each hour, do ONE high-quality unit of work:

### 1. Choose the next game
- Open `js/catalog.js`. Pick the **highest-value `status:"soon"` entry** that
  best diversifies the live library. **Do not repeat the previous game's
  genre.** Aim for a rotation across: maze, platformer, faller, runner,
  shooter/shmup, rhythm/timing, puzzle, brawler/boss, stealth, tactics, sim.
- Read the source property. Identify the **most iconic story/scene** (if it's a
  collection, choose the most popular item — e.g. Sherlock → *Hound of the
  Baskervilles*). The mechanic must embody that scene.

### 2. Build it
- `games/<id>/index.html` from an existing game's template (update title,
  `<title>`, source label, help text, `buttonLabels`).
- `games/<id>/game.js` on the RetroEngine (see `CLAUDE.md` for the API).
  Make it deep: a clear goal, escalating difficulty, score + high score,
  juice (screen shake/flash/particles/SFX), a start overlay and a game-over
  overlay that restarts on any key.
- 8-bit style. Works with keyboard AND on-screen touch. Test desktop + mobile.

### 3. Test (REQUIRED — never skip)
```bash
# from repo root
python3 -m http.server 8099 &      # serve
node --check games/<id>/game.js    # syntax
```
Then headless-browser load the page, simulate input for ~2s, and assert:
- zero `pageerror`s (network ERR for Google Fonts via proxy is OK to ignore),
- the `<canvas>` exists and the loop advances (score/state changes),
- it renders at 390×780 (mobile) and a desktop viewport.
A reusable tester lives in scratch; pattern: load page, press arrows/space,
capture console errors, screenshot.

### 4. Ship it
- Flip the catalog entry `status: "soon"` → `"live"` in the same commit.
- **Capture the thumbnail** so the card shows the real game, not generic art:
  `node tools/snap-thumbs.mjs <id>` writes `games/<id>/thumb.png` from an actual
  gameplay frame. Commit it WITH the game. (The home page uses the screenshot and
  only falls back to procedural art if the PNG is missing — never ship a live
  game without its thumbnail.) The tool needs Playwright + Chromium, the same
  headless setup used for load-testing; run it the same way you run the tests.
- Commit with a clear message naming the game + genre.
- Work on and push **`main`**: `git push -u origin main` (retry with backoff on
  network errors). **Pushing to `main` is what publishes the site** — the
  `.github/workflows/deploy-pages.yml` workflow deploys to GitHub Pages on every
  push to main (and hourly as a backstop). So each shipped game goes live
  automatically; no separate deploy step.
- After pushing, you may confirm the deploy via the GitHub Actions tools
  (workflow `deploy-pages.yml`) — but a green build is expected and you don't
  need to babysit it.

### 5. Website sweep — every few iterations (not every hour)
- **Keep thumbnails current.** Re-run `node tools/snap-thumbs.mjs` (all games) or
  `node tools/snap-thumbs.mjs <id>` for any game whose art/start screen changed,
  and confirm every `status:"live"` game has a `games/<id>/thumb.png`. A stale or
  missing thumbnail is a bug — the card must look like the game you actually ship.
- Improve the **home page / navigation**: featured carousel, "new this week"
  row, better empty states, genre landing, share links, SEO/meta polish.
- Add a **style variant** to an existing strong game (e.g. a 16-bit or
  monochrome "Game Boy" palette) and surface it through the style filter.
- Audit older games for bugs, **mobile feel & touch play**, fullscreen scaling,
  and difficulty curve. Treat mobile regressions as bugs to fix, not polish.
- Consider an **ad-slot** refinement or a small site-wide feature.

## Quality bar (hold the line)
- Varied mechanics — the library should feel like an arcade, not one game
  reskinned 74 times.
- Every game is genuinely fun for at least a few minutes and readable at a
  glance. If a build feels flat, make it better before shipping.
- Faithful to the source's tone and famous beats.

## Questions for the human (ask occasionally via AskUserQuestion)
- Priorities: any properties to fast-track? Preferred genres/styles?
- Real ad network integration (e.g. specific slot sizes / provider)?
- Custom domain logo/wordmark tweaks, color preferences?
- Should we add leaderboards/sharing (would need a backend)?

## Progress
- Live: see `status:"live"` in `js/catalog.js`.
- Remaining: every `status:"soon"` entry. ~70 to go at launch.
```
Batch 1 (launch): sherlock-hound (maze), dracula-castle (platformer),
alice-rabbithole (faller), oz-yellowbrick (runner).
```
