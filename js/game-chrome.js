// -----------------------------------------------------------------------
// game-chrome.js — swap the per-game top-bar emoji for Polecat Shell icons.
//
// Per-game pages don't load the shell, but they SHOULD use the fleet icon
// collection + standards (single-color, stroke-based, currentColor, 24×24)
// rather than emoji. This tiny module imports the shared icon() set, registers
// the few chrome glyphs the base set doesn't carry (fullscreen / volume), and
// replaces the back arrow + bar buttons on load. The emoji in the HTML stay as
// graceful fallbacks if this module ever fails to load.
//
// Mute state: the engine shells (saga.js / saga2.js) toggle `.is-muted` on the
// button; CSS swaps the sound/muted glyph, so nothing here has to track audio.
// -----------------------------------------------------------------------
import { icon, registerIcons } from '../vendor/polecat-shell/icons.js';

// chrome glyphs not in the base set — kept on the fleet design bar
// (stroke-based, currentColor, 24×24, round caps).
registerIcons({
  back: '<path d="m15 6-6 6 6 6"/>',
  fullscreen: '<path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4"/>',
  sound: '<path d="M4 9v6h3l5 4V5L7 9H4z"/><path d="M16 8.5a4 4 0 0 1 0 7M18.7 6a7 7 0 0 1 0 12"/>',
  muted: '<path d="M4 9v6h3l5 4V5L7 9H4z"/><path d="m16 9.5 5 5M21 9.5l-5 5"/>',
});

function paint() {
  const arrow = document.querySelector('.game-bar .back .ar');
  if (arrow) arrow.innerHTML = icon('back', 14);

  const fs = document.getElementById('fullscreenBtn');
  if (fs) fs.innerHTML = icon('fullscreen', 18);

  const rs = document.getElementById('restartBtn');
  if (rs) rs.innerHTML = icon('refresh', 18);

  // mute button carries BOTH glyphs; .is-muted (set by the engine shell) flips them
  const mute = document.getElementById('muteBtn');
  if (mute) mute.innerHTML = '<span class="ic-on">' + icon('sound', 18) + '</span><span class="ic-off">' + icon('muted', 18) + '</span>';

  // the engine's floating fullscreen-exit button (appears only in immersive mode)
  const fx = document.querySelector('.re-fs-btn');
  if (fx) fx.innerHTML = icon('close', 20);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paint);
else paint();
// the exit button is created when the game builds its engine (after this module
// may have run) — repaint shortly after so it gets the icon too.
setTimeout(paint, 400);
