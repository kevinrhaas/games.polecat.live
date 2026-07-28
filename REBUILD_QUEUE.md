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
8. **timemachine-eloi** — already has a custom dial menu + a timing-bar / catch-dodge / stealth-cones / matchlight-gather / dodge-debris spread (this line's old "4/5 dodge, only plain-list menu" description no longer matches the file — checked 2026-07-22). Still a **Gen-4 candidate** (machine-assembly + resource roguelite, branching eras, inventory) if someone wants to build its 16-bit hub version, but not a worst-offender rebuild.
16. ~~**odysseus-voyage**~~ — already has a bespoke chart-map menu (not a plain list) and 5 already-varied mechanics (hide-under-sheep dodge, collect-and-dodge, survive, steer, timing); this line's old "3 L/R dodges" description no longer matches the file (checked 2026-07-28). The Oregon-Trail-style crew/resource-management + choice-encounter ask is already delivered by its Gen-4 sibling `odyssey-16` (bag of winds, crew upgrades, flags/choices, branching endings) — rebuilding the Gen-3 8-bit game into the same shape would blur the CLAUDE.md Gen-3/Gen-4 split (Gen-3 = arcade action, Gen-4 = deep hub/resource sim), not fix repetition. Not a worst-offender rebuild.
24. **notld-survive** — dodge + mash → a **real-time base-defense / tower-defense**: board the house, ration ammo, assign survivors to positions.
25. **1001nights-magic** — 3/5 steer/catch-dodge → a **point-and-click "tell-a-tale" branching adventure**: Scheherazade picks story fragments as a choose-your-path deck to survive each dawn.

## Reference templates (already varied — copy these, don't rebuild)
`dracula-castle` (Gen-4 hub + branches — the gold standard), `metropolis-1927`
(platformer + spot-the-fake + rescue race), `sherlock-hound`, `princepauper-swap`,
`peterpan-flight`, `warworlds-tripods`, `zorro-mark`, `thor-loki`,
`beowulf-grendel`, `donquixote-tilt`, `littlewomen-march`.
