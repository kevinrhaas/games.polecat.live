# Rebuild queue — kill the sameness (worst first)

A 69-game audit (2026-07) found the arcade rhymes too much: most games stack
3–5 near-identical **move-to-dodge / steer / catch** chapters behind a (nicely
themed but) always-5-node click menu. This queue lists the most repetitive /
weakest games, worst first, each with a **target genre + structure** that is
true to the property AND its era. The build loop pulls from the TOP of this
list (see BUILD_LOOP.md / build-game.yml): rebuild it as a genuine **genre
shift** (not a reskin — new verbs, and vary the structure/opening per CLAUDE.md
"Variety is the job"), re-shoot the thumbnail, then **delete that line from this
queue** in the same commit. Promote to Gen-4 (hub + branches) where noted.

## Queue
1. **sinbad-voyage** — all 5 chapters are the same L/R dodge → **Gen-4 sailing/trade roguelike**: navigable sea hub, crew/provision management, each voyage a *different* set-piece genre.
2. **huckfinn-raft** — 4/5 steer-dodge → **Oregon-Trail-style river journey sim**: branching stops, supplies/trust economy, help-Jim moral choices; the river map gates real branches.
3. **journeycenter-earth** — 5/5 dodge → **Verne descent resource-sim**: ration air/rope/water, branching descent routes on a vertical strata map (turn-based survival).
4. **annegreen-gables** — 4/5 fall-catchers → **cozy life-sim / dialogue visual-novel**: imagination & social scrapes as branching conversation.
5. **pride-prejudice** — 5 chapters, only 2 real mechanics → **Regency dating-sim**: reputation/affection meters + a minuet rhythm beat + a letter-writing word puzzle; branching dialogue.
6. **phantom-opera** — a MUSIC property wasted on dodge → **rhythm/music game** across the staff + a stalking-pursuit mode through the Garnier.
7. **invisibleman-fade** — 3 repeated sight-cone dodges → **dedicated stealth game**: one contiguous manhunt with a persistent exposure/visibility economy (footprints, snow, smoke reveal you); fewer, deeper levels.
8. **sleepyhollow-ride** — 4/5 steer-dodge → **hide-from-the-Horseman stealth-horror** (one escalating chase) + a schoolmaster courting social-sim.
9. **timemachine-eloi** — 4/5 dodge, only plain-list menu left → **machine-assembly + resource roguelite** (ration parts, tune circuits, branching eras, inventory); Gen-4 candidate.
10. **whitefang-wild** — 4/5 move/chase → **Yukon survival-sim** (hunger/cold/pack-dominance meters, branching trek) + a pack-hierarchy strategy chapter.
11. **greatexpect-pip** — 4/5 move-dodge → **class-ladder branching life-RPG**: money/status stats, gentleman-vs-blacksmith choices grow the ending.
12. **scrooge-carol** — 4/5 catch/dodge/runner → **branching time-travel narrative**: Past/Present/Future choices rewrite a redemption ledger + a coin-sorting puzzle.
13. **olivertwist-dodge** — 3 side-dodges → **stealth pickpocket sim**: grid lift-timing + a suspicion/heat meter under Fagin.
14. **littlemermaid-sea** — 4/5 dodge → **potion-brewing ingredient-memory** at the witch's cave + a branching courtship dialogue; keep only the dance as action.
15. **snowwhite-apple** — 3 dodge lanes → **dwarfs mine-management/tycoon** + the Queen's potion-brewing crafting puzzle + hide-in-cottage stealth.
16. **around80days-race** — 3 interchangeable steer-dodge lanes → **time-budget travel strategy**: a route-planning board game across a world map (embodies the wager).
17. **odysseus-voyage** — 3 L/R dodges → **overworld voyage map** with Oregon-Trail-style crew/resource management and choice encounters.
18. **heidi-alps** — 3 horizontal-move levels → **alpine day-cycle chore/herding sim** (Harvest-Moon-lite): seasons, foraging, caregiving stats.
19. **merlin-spells** — 4/5 dodge → **rune-tracing spellcaster** (path-tracing) + a Simon-style incantation duel vs Nimue.
20. **windwillows-toad** — ch1 & ch2 are the same dodge lane → swap one for **disguise-and-bluff social stealth** ("Toad as washerwoman") + make the boat a **rowing rhythm** game.
21. **treasureisland-map** — 3 tap-to-hit chapters → a **broadside cannon-aim ship duel** + a "spot the mutineer" **crew social-deduction** chapter.
22. **grimm-tales** — an anthology, but ch2 & ch5 repeat → make each tale a *different* genre (Hansel maze, Rumpelstiltskin name-guess word puzzle, Rapunzel vertical climber).
23. **alibaba-cave** — reuses the same whack-a-mole twice → a **hide-and-seek deduction** ("which of 40 jars hides a thief?", Clue-style).
24. **notld-survive** — dodge + mash → a **real-time base-defense / tower-defense**: board the house, ration ammo, assign survivors to positions.
25. **1001nights-magic** — 3/5 steer/catch-dodge → a **point-and-click "tell-a-tale" branching adventure**: Scheherazade picks story fragments as a choose-your-path deck to survive each dawn.

## Reference templates (already varied — copy these, don't rebuild)
`dracula-castle` (Gen-4 hub + branches — the gold standard), `metropolis-1927`
(platformer + spot-the-fake + rescue race), `sherlock-hound`, `princepauper-swap`,
`peterpan-flight`, `warworlds-tripods`, `zorro-mark`, `thor-loki`,
`beowulf-grendel`, `donquixote-tilt`, `littlewomen-march`.
