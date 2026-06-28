# The Hourly Build-Loop Playbook

This file is the standing instruction set for each hourly iteration that builds
out games.polecat.live. Follow it top to bottom, then stop.

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
- Commit with a clear message naming the game + genre.
- `git push -u origin <branch>` (retry with backoff on network errors).

### 5. Every few iterations (not every hour)
- Improve the **home page / navigation**: featured carousel, "new this week"
  row, better empty states, genre landing, share links, SEO/meta polish.
- Add a **style variant** to an existing strong game (e.g. a 16-bit or
  monochrome "Game Boy" palette) and surface it through the style filter.
- Audit older games for bugs, mobile feel, and difficulty curve.
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
