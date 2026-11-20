import { APP_NAME, APP_TAGLINE, BOARD_H, BOARD_W, LEVEL_COUNT, WORLDS, todayISO, worldById, worldFor } from './config.js';
import { Game } from './game.js';
import { isRevealed } from './board.js';
import { iconName, iconSvg, iconTint } from './icons.js';
import {
  haptic,
  isMuted,
  isVibrate,
  playCombo,
  playCrack,
  playHint,
  playLose,
  playMatch,
  playShuffle,
  playTap,
  playUnlock,
  playWin,
  setMuted,
  setVibrate,
  toggleMuted,
  unlockAudio,
} from './audio.js';
import {
  achievementList,
  clearedCount,
  loadProgress,
  markTipSeen,
  recordDailyWin,
  recordWin,
  resetProgress,
  saveProgress,
  totalStars,
  worldProgress,
} from './storage.js';
import { showRewarded } from './monetization.js';

const app = document.getElementById('app');
const game = new Game();
let progress = loadProgress();
setMuted(progress.muted);
setVibrate(progress.vibrate !== false);

let screen = 'home';
let worldId = 'meadow';
let animFast = false;
let flyLock = false;
let timerId = 0;
let toastTimer = 0;
let tutorialStep = 0;
let mechanicTip = null;
let confirmReset = false;
let comboFlash = 0;

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function worldOfPlay() {
  return game.config.world || worldFor(game.level || 1);
}

function muteGlyph() {
  return `<svg class="mute-glyph" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">${
    isMuted()
      ? '<path d="M4 9h4l6-5v16l-6-5H4z" fill="currentColor" opacity="0.35"/><path d="M15.5 9.5l5 5M20.5 9.5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      : '<path d="M4 9h4l6-5v16l-6-5H4z" fill="currentColor"/><path d="M16.5 9c1.4 1.2 1.4 4.8 0 6M19 7c2.4 2.2 2.4 7.8 0 10" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
  }</svg>`;
}

function starRow(count, size = 'md') {
  const parts = [1, 2, 3].map((i) => {
    const on = i <= count;
    return `<span class="star ${on ? 'on' : 'off'} ${size}" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="1em" height="1em"><path d="M12 2.4l2.7 6.6 7.1.6-5.4 4.6 1.7 6.9L12 17.6 5.9 21.1l1.7-6.9L2.2 9.6l7.1-.6z" fill="currentColor"/></svg>
    </span>`;
  });
  return `<span class="stars" role="img" aria-label="${count} of 3 stars">${parts.join('')}</span>`;
}

function backGlyph() {
  return `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-8 7 8 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

function render() {
  const w = screen === 'play' ? worldOfPlay() : worldById(worldId);
  app.dataset.world = (w && w.id) || 'meadow';
  document.body.dataset.world = app.dataset.world;
  if (screen === 'home') renderHome();
  else if (screen === 'worlds') renderWorlds();
  else if (screen === 'levels') renderLevels();
  else if (screen === 'daily') renderDaily();
  else if (screen === 'stats') renderStats();
  else if (screen === 'settings') renderSettings();
  else if (screen === 'about') renderAbout();
  else if (screen === 'play') renderPlay();
}

function shell(inner, extraClass = '') {
  const world = (screen === 'play' ? worldOfPlay() : worldById(worldId)) || WORLDS[0];
  app.className = `app world-${world.id} ${extraClass}`;
  app.dataset.world = world.id;
  app.innerHTML = inner;
}

function renderHome() {
  stopTimer();
  const next = Math.min(progress.unlocked, LEVEL_COUNT);
  const cleared = clearedCount(progress);
  const streak = progress.daily.streak || 0;
  shell(`
    <section class="screen home" data-screen="home">
      <button class="icon-btn mute-btn" type="button" data-act="mute" aria-label="${isMuted() ? 'Unmute sounds' : 'Mute sounds'}">${muteGlyph()}</button>
      <div class="brand">
        <div class="logo" aria-hidden="true">${logoSvg()}</div>
        <h1>${APP_NAME}</h1>
        <p class="tag">${APP_TAGLINE}</p>
      </div>
      <div class="home-actions">
        <button class="btn primary" type="button" data-act="play">${cleared ? 'Continue' : 'Play'}</button>
        <button class="btn ghost" type="button" data-act="worlds">Worlds</button>
        <button class="btn ghost" type="button" data-act="daily">Daily Puzzle</button>
        <div class="home-row">
          <button class="btn ghost" type="button" data-act="stats">Stats</button>
          <button class="btn ghost" type="button" data-act="settings">Settings</button>
        </div>
        <button class="btn ghost" type="button" data-act="about">About</button>
      </div>
      <p class="home-meta">${cleared} / ${LEVEL_COUNT} tidied · next: level ${next}${streak ? ` · streak ${streak}` : ''}</p>
    </section>
  `);
}

function logoSvg() {
  return `
    <svg class="logo-svg" viewBox="0 0 160 120" width="160" height="120" aria-hidden="true">
      <rect x="28" y="34" width="64" height="64" rx="16" fill="#FFFBF5" stroke="#E8D5C4" stroke-width="3" transform="rotate(-14 60 66)"/>
      <rect x="54" y="22" width="64" height="64" rx="16" fill="#FFFBF5" stroke="#E8D5C4" stroke-width="3" transform="rotate(10 86 54)"/>
      <rect x="46" y="38" width="68" height="68" rx="16" fill="#FFFBF5" stroke="#2A9D8F" stroke-width="3"/>
      <g transform="translate(48 40) scale(0.97)">${iconInner()}</g>
    </svg>
  `;
}

function iconInner() {
  return `<path d="M32 12c14 8 20 22 16 34-12 2-24-8-28-22 4-8 8-10 12-12z" fill="#2F9E6B"/><path d="M32 16c9 7 13 18 11 28" stroke="#1E7A52" stroke-width="1.6" fill="none"/><path d="M32 22c4 2 8 6 10 12M32 30c3 2 6 5 7 9M32 38c2 1 4 3 5 6" stroke="#A6E3C4" stroke-width="1.3" fill="none" stroke-linecap="round"/>`;
}

function renderWorlds() {
  stopTimer();
  const cards = WORLDS.map((world) => {
    const wp = worldProgress(progress, world);
    const locked = !wp.unlocked;
    return `
      <button class="world-card ${locked ? 'locked' : ''} world-${world.id}" type="button"
        data-act="open-world" data-world="${world.id}" ${locked ? 'disabled' : ''}
        style="--accent:${world.accent}"
        aria-label="${locked ? `${world.name} locked` : `${world.name}, ${wp.done} of ${wp.total} tidied`}">
        <span class="world-icon" aria-hidden="true">${iconSvg(0, 48, world.id)}</span>
        <span class="world-copy">
          <strong>${world.name}</strong>
          <em>${world.start}–${world.end}</em>
          <span class="world-tag">${world.tagline}</span>
          <span class="world-prog">${locked ? 'Locked' : `${wp.done} / ${wp.total} tidied`}</span>
        </span>
        ${wp.done ? starRow(wp.done === wp.total ? 3 : 1, 'sm') : ''}
      </button>`;
  }).join('');
  shell(`
    <section class="screen worlds" data-screen="worlds">
      <header class="top">
        <button class="icon-btn" type="button" data-act="home" aria-label="Back">${backGlyph()}</button>
        <h2>Worlds</h2>
        <button class="icon-btn mute-btn" type="button" data-act="mute" aria-label="${isMuted() ? 'Unmute sounds' : 'Mute sounds'}">${muteGlyph()}</button>
      </header>
      <div class="world-list">${cards}</div>
    </section>
  `);
}

function renderLevels() {
  stopTimer();
  const world = worldById(worldId);
  const cells = [];
  for (let i = world.start; i <= world.end; i++) {
    const locked = i > progress.unlocked;
    const stars = progress.stars[i] || 0;
    cells.push(`
      <button class="level-cell ${locked ? 'locked' : ''} ${stars ? 'done' : ''}" type="button"
        data-act="start-level" data-level="${i}" ${locked ? 'disabled' : ''}
        aria-label="${locked ? `Level ${i} locked` : `Level ${i}${stars ? `, ${stars} stars` : ''}`}">
        <span class="num">${i}</span>
        ${locked ? '<span class="lock" aria-hidden="true"></span>' : starRow(stars, 'sm')}
      </button>
    `);
  }
  shell(`
    <section class="screen levels" data-screen="levels">
      <header class="top">
        <button class="icon-btn" type="button" data-act="worlds" aria-label="Back to worlds">${backGlyph()}</button>
        <h2>Levels</h2>
        <button class="icon-btn mute-btn" type="button" data-act="mute" aria-label="${isMuted() ? 'Unmute sounds' : 'Mute sounds'}">${muteGlyph()}</button>
      </header>
      <p class="world-heading">${world.name} · ${world.start}–${world.end}</p>
      <div class="level-grid">${cells.join('')}</div>
    </section>
  `);
}

function renderDaily() {
  stopTimer();
  const iso = todayISO();
  const won = progress.daily.days[iso];
  const streak = progress.daily.streak || 0;
  const series = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = todayISO(d);
    const entry = progress.daily.days[key];
    const label = String(d.getDate());
    series.push(`<span class="day-pill ${entry ? 'done' : ''} ${key === iso ? 'today' : ''}" title="${key}">${label}${entry ? '★' : ''}</span>`);
  }
  shell(`
    <section class="screen daily" data-screen="daily">
      <header class="top">
        <button class="icon-btn" type="button" data-act="home" aria-label="Back">${backGlyph()}</button>
        <h2>Daily Puzzle</h2>
        <button class="icon-btn mute-btn" type="button" data-act="mute" aria-label="${isMuted() ? 'Unmute sounds' : 'Mute sounds'}">${muteGlyph()}</button>
      </header>
      <div class="panel">
        <p class="daily-date">${iso}</p>
        <p class="daily-copy">A new seeded board every day, playable offline. Your streak grows if you tidy yesterday’s puzzle too.</p>
        <div class="day-series" aria-label="Last seven days">${series.join('')}</div>
        <p class="daily-streak">Streak <strong>${streak}</strong> · best ${progress.daily.bestStreak || 0}</p>
        ${won ? `<p class="daily-done">Tidied today ${starRow(won.stars, 'md')} · ${formatTime(won.time)}</p>` : ''}
        <button class="btn primary" type="button" data-act="start-daily">${won ? 'Play again' : 'Play today'}</button>
      </div>
    </section>
  `);
}

function renderStats() {
  stopTimer();
  const cleared = clearedCount(progress);
  const stars = totalStars(progress);
  const badges = achievementList(progress).map((a) => `
    <div class="badge ${a.unlockedAt ? 'on' : 'off'}">
      <strong>${a.name}</strong>
      <span>${a.desc}</span>
    </div>`).join('');
  shell(`
    <section class="screen stats" data-screen="stats">
      <header class="top">
        <button class="icon-btn" type="button" data-act="home" aria-label="Back">${backGlyph()}</button>
        <h2>Stats</h2>
        <button class="icon-btn mute-btn" type="button" data-act="mute" aria-label="${isMuted() ? 'Unmute sounds' : 'Mute sounds'}">${muteGlyph()}</button>
      </header>
      <div class="stat-grid">
        <div class="stat"><b>${cleared}</b><span>Levels tidied</span></div>
        <div class="stat"><b>${stars}</b><span>Stars</span></div>
        <div class="stat"><b>${progress.daily.streak || 0}</b><span>Daily streak</span></div>
        <div class="stat"><b>${progress.daily.wins || 0}</b><span>Daily wins</span></div>
        <div class="stat"><b>${progress.stats.bestCombo || 0}</b><span>Best combo</span></div>
        <div class="stat"><b>${Math.round((progress.stats.playSeconds || 0) / 60)}</b><span>Minutes played</span></div>
      </div>
      <h3 class="subhead">Badges</h3>
      <div class="badge-grid">${badges}</div>
    </section>
  `);
}

function renderSettings() {
  stopTimer();
  shell(`
    <section class="screen settings" data-screen="settings">
      <header class="top">
        <button class="icon-btn" type="button" data-act="home" aria-label="Back">${backGlyph()}</button>
        <h2>Settings</h2>
        <span></span>
      </header>
      <div class="panel">
        <label class="toggle">
          <span>Sound</span>
          <button class="switch ${isMuted() ? '' : 'on'}" type="button" data-act="mute" aria-pressed="${!isMuted()}" aria-label="${isMuted() ? 'Unmute sounds' : 'Mute sounds'}"></button>
        </label>
        <label class="toggle">
          <span>Vibration</span>
          <button class="switch ${isVibrate() ? 'on' : ''}" type="button" data-act="vibrate" aria-pressed="${isVibrate()}" aria-label="${isVibrate() ? 'Disable vibration' : 'Enable vibration'}"></button>
        </label>
        <p class="hint-copy">Vibration uses your device’s vibrate API when available. Nothing is sent off the device.</p>
        <button class="btn ghost danger" type="button" data-act="reset-ask">Reset progress</button>
        ${confirmReset ? `
          <div class="confirm">
            <p>This clears levels, daily streak, and badges on this device. Sound and vibration preferences stay.</p>
            <button class="btn primary" type="button" data-act="reset-yes">Reset everything</button>
            <button class="btn ghost" type="button" data-act="reset-no">Cancel</button>
          </div>` : ''}
      </div>
    </section>
  `);
}

function renderAbout() {
  stopTimer();
  shell(`
    <section class="screen about" data-screen="about">
      <header class="top">
        <button class="icon-btn" type="button" data-act="home" aria-label="Back">${backGlyph()}</button>
        <h2>About</h2>
        <button class="icon-btn mute-btn" type="button" data-act="mute" aria-label="${isMuted() ? 'Unmute sounds' : 'Mute sounds'}">${muteGlyph()}</button>
      </header>
      <div class="about-body">
        <h1>${APP_NAME}</h1>
        <p>A cozy tile puzzle. Lift a free tile onto the tray. Three of a kind vanish. Empty the board to tidy up — but do not overflow the tray.</p>
        <p>One hundred seeded levels across five worlds, plus a Daily Puzzle. Later worlds add locked tiles, hidden faces, and ice. Each campaign board is built so a solution exists. Play offline, in portrait, at your own pace.</p>
        <h3>Links</h3>
        <ul class="links">
          <li><a href="https://www.youtube.com/@RoviHere" target="_blank" rel="noopener noreferrer">YouTube</a></li>
          <li><a href="https://x.com/RoviHere" target="_blank" rel="noopener noreferrer">X</a></li>
          <li><a href="https://suno.com/@kkruk93" target="_blank" rel="noopener noreferrer">Suno</a></li>
        </ul>
        <p class="btc">Support (BTC): <span class="addr">bc1qd05h6spuj8dqf9rs9fu4re9rh4q6k0gflfqum8</span></p>
        <p class="links-extra"><a href="./privacy.html">Privacy policy</a></p>
        <p class="ver">Version 1.1.0</p>
      </div>
    </section>
  `);
}

function renderPlay() {
  const g = game;
  const time = formatTime(g.elapsedSec());
  const world = worldOfPlay();
  const title = g.daily ? 'Daily Puzzle' : `Level ${g.level}`;
  const overlay = g.status === 'won' ? winOverlay() : g.status === 'lost' ? loseOverlay() : '';
  shell(`
    <section class="screen play" data-screen="play">
      <header class="top play-top">
        <button class="icon-btn" type="button" data-act="back-play" aria-label="${g.daily ? 'Back to daily' : 'Back to levels'}">${backGlyph()}</button>
        <div class="play-title">
          <h2>${title}</h2>
          <p class="stats"><span data-role="timer">${time}</span> · ${g.clicks} moves · ${world.name}</p>
        </div>
        <button class="icon-btn mute-btn" type="button" data-act="mute" aria-label="${isMuted() ? 'Unmute sounds' : 'Mute sounds'}">${muteGlyph()}</button>
      </header>
      <div class="helps">
        ${helpBtn('undo', 'Undo', g.helps.undo)}
        ${helpBtn('shuffle', 'Shuffle', g.helps.shuffle)}
        ${helpBtn('hint', 'Hint', g.helps.hint)}
      </div>
      <div class="board-wrap">
        <div class="board" data-role="board" style="--bw:${BOARD_W};--bh:${BOARD_H};">
          ${renderTiles()}
        </div>
        ${comboFlash ? `<div class="combo-pop" data-role="combo">Combo ×${comboFlash}</div>` : ''}
      </div>
      <div class="tray-wrap">
        <p class="tray-label">Tray</p>
        <div class="tray" data-role="tray">${renderTray()}</div>
      </div>
      ${overlay}
      ${tutorialMarkup()}
      ${mechanicMarkup()}
      <div class="toast" data-role="toast" hidden></div>
    </section>
  `, 'in-play');
  if (g.status === 'playing') startTimer();
  else stopTimer();
  maybeOfferTip();
}

function helpBtn(kind, label, left) {
  const empty = left <= 0;
  return `<button class="help-btn ${empty ? 'empty' : ''}" type="button" data-act="help" data-help="${kind}" aria-label="${label}, ${left} left">
    <span class="help-name">${label}</span>
    <span class="help-count">${left}</span>
  </button>`;
}

function renderTiles() {
  const living = game.tiles.filter((t) => !t.removed);
  living.sort((a, b) => a.z - b.z);
  const world = worldOfPlay().id;
  return living
    .map((t) => {
      const free = game.status === 'playing' && game.canCollect(t.id);
      const hint = game.lastHintId === t.id;
      const revealed = isRevealed(t, game.tiles);
      const ice = t.ice | 0;
      const classes = [
        'tile',
        free ? 'free' : 'blocked',
        hint ? 'hinted' : '',
        t.locked ? 'locked-tile' : '',
        !revealed ? 'mystery' : '',
        ice >= 2 ? 'ice' : '',
        ice === 1 ? 'ice-cracked' : '',
        t.isKey && revealed ? 'is-key' : '',
      ].filter(Boolean).join(' ');
      const name = revealed ? iconName(t.type, world) : 'hidden tile';
      let state = 'covered';
      if (t.locked) state = 'locked';
      else if (!revealed) state = 'hidden';
      else if (ice >= 2) state = 'icy';
      else if (ice === 1) state = 'cracked ice';
      else if (free) state = 'free';
      return `<button class="${classes}"
        type="button" data-act="tile" data-id="${t.id}" data-type="${t.type}"
        ${free ? '' : 'tabindex="-1"'}
        aria-label="${name}, ${state}"
        style="--x:${t.x};--y:${t.y};--z:${t.z};--tw:${t.w};--th:${t.h};--tint:${iconTint(t.type, world)};">
        <span class="tile-face">${revealed ? iconSvg(t.type, 48, world) : tileBack()}</span>
        ${t.locked ? '<span class="tile-lock" aria-hidden="true"></span>' : ''}
        ${t.isKey && revealed ? '<span class="tile-key" aria-hidden="true"></span>' : ''}
        ${ice ? '<span class="tile-ice" aria-hidden="true"></span>' : ''}
      </button>`;
    })
    .join('');
}

function tileBack() {
  return `<svg viewBox="0 0 64 64" width="48" height="48" aria-hidden="true">
    <rect x="8" y="8" width="48" height="48" rx="12" fill="#D9C4AE"/>
    <rect x="14" y="14" width="36" height="36" rx="8" fill="#EFE0CE"/>
    <path d="M32 22c-5 0-8 3-8 7 0 6 8 6 8 11" stroke="#8A6F58" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="32" cy="44" r="2.4" fill="#8A6F58"/>
  </svg>`;
}

function renderTray() {
  const world = worldOfPlay().id;
  const slots = [];
  for (let i = 0; i < 7; i++) {
    const t = game.tray[i];
    if (t) {
      slots.push(`<div class="slot filled" data-slot="${i}" data-tid="${t.id}" style="--tint:${iconTint(t.type, world)}">
        <span class="tile-face">${iconSvg(t.type, 40, world)}</span>
      </div>`);
    } else {
      slots.push(`<div class="slot empty" data-slot="${i}"></div>`);
    }
  }
  return slots.join('');
}

function confettiMarkup() {
  const bits = [];
  for (let i = 0; i < 28; i++) {
    const left = 4 + (i * 37) % 92;
    const delay = ((i * 13) % 40) / 100;
    const dur = 1.1 + (i % 5) * 0.12;
    const hue = (i * 41) % 360;
    bits.push(`<span class="confetti-bit" style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s;background:hsl(${hue} 80% 60%)"></span>`);
  }
  return `<div class="confetti" aria-hidden="true">${bits.join('')}</div>`;
}

function winOverlay() {
  const stars = game.starCount();
  const hasNext = !game.daily && game.level < LEVEL_COUNT;
  return `
    <div class="overlay" data-role="overlay" data-kind="win">
      ${confettiMarkup()}
      <div class="modal">
        <h3>Board tidied!</h3>
        <div class="star-big">${starRow(stars, 'lg')}</div>
        <p class="modal-meta">${formatTime(game.elapsedSec())} · ${game.clicks} moves</p>
        <div class="modal-actions">
          ${hasNext ? '<button class="btn primary" type="button" data-act="next">Next level</button>' : ''}
          ${game.daily ? '<button class="btn primary" type="button" data-act="daily">Daily Puzzle</button>' : ''}
          <button class="btn ghost" type="button" data-act="replay">Replay</button>
          <button class="btn ghost" type="button" data-act="${game.daily ? 'daily' : 'levels'}" ${game.daily ? '' : ''}>${game.daily ? 'Back' : 'Levels'}</button>
        </div>
      </div>
    </div>`;
}

function loseOverlay() {
  return `
    <div class="overlay" data-role="overlay" data-kind="lose">
      <div class="modal">
        <h3>Tray is full</h3>
        <p>The tray overflowed. Try a different order, or use Undo, Shuffle, or Hint.</p>
        <div class="modal-actions">
          <button class="btn primary" type="button" data-act="replay">Try again</button>
          <button class="btn ghost" type="button" data-act="${game.daily ? 'daily' : 'levels'}">${game.daily ? 'Daily Puzzle' : 'Levels'}</button>
        </div>
      </div>
    </div>`;
}

function startLevel(n) {
  game.start(n);
  worldId = worldFor(n).id;
  screen = 'play';
  tutorialStep = n === 1 && !progress.tutorialDone ? 1 : 0;
  mechanicTip = null;
  comboFlash = 0;
  render();
}

function startDaily(iso = todayISO()) {
  game.startDaily(iso);
  worldId = (game.config.world && game.config.world.id) || 'meadow';
  screen = 'play';
  tutorialStep = 0;
  mechanicTip = null;
  comboFlash = 0;
  render();
}

const TUTORIAL = [
  'Tap a bright tile. It flies down to the tray.',
  'Three of a kind vanish from the tray.',
  'If the tray fills up, you lose. Clear the whole pile to win.',
];

const TIPS = {
  lock: 'A locked tile cannot move until you collect its matching key.',
  hidden: 'Some tiles hide their faces. They flip when nothing sits on top.',
  ice: 'Icy tiles need two taps: the first crack, the second collects.',
};

function tutorialMarkup() {
  if (!tutorialStep || game.status !== 'playing') return '';
  const last = tutorialStep >= TUTORIAL.length;
  const label = last ? 'Got it' : 'Next';
  return `<div class="tutorial" data-role="tutorial">
    <div class="tutorial-card" data-step="${tutorialStep}">
      <p class="tutorial-step">Tip ${tutorialStep} of ${TUTORIAL.length}</p>
      <p class="tutorial-text">${TUTORIAL[tutorialStep - 1]}</p>
      <button class="btn primary" type="button" data-act="tutorial-next">${label}</button>
    </div>
  </div>`;
}

function maybeOfferTip() {
  if (tutorialStep || game.status !== 'playing' || mechanicTip) return;
  const hasLock = game.tiles.some((t) => !t.removed && (t.locked || t.isKey));
  const hasHidden = game.tiles.some((t) => !t.removed && t.mystery);
  const hasIce = game.tiles.some((t) => !t.removed && t.ice);
  let kind = null;
  if (hasLock && !progress.seenTips.lock) kind = 'lock';
  else if (hasHidden && !progress.seenTips.hidden) kind = 'hidden';
  else if (hasIce && !progress.seenTips.ice) kind = 'ice';
  if (!kind) return;
  mechanicTip = kind;
  const host = app.querySelector('.screen.play');
  if (!host) return;
  const wrap = document.createElement('div');
  wrap.className = 'mechanic-tip';
  wrap.setAttribute('data-role', 'mechanic-tip');
  wrap.innerHTML = `<div class="mechanic-card">
    <p>${TIPS[kind]}</p>
    <button class="btn primary" type="button" data-act="tip-ok">Got it</button>
  </div>`;
  host.appendChild(wrap);
}

function mechanicMarkup() {
  return '';
}

function dismissTip() {
  if (!mechanicTip) return;
  progress = markTipSeen(progress, mechanicTip);
  mechanicTip = null;
  const el = app.querySelector('[data-role="mechanic-tip"]');
  if (el) el.remove();
  maybeOfferTip();
}

function advanceTutorial() {
  if (!tutorialStep) return;
  if (tutorialStep >= TUTORIAL.length) {
    tutorialStep = 0;
    progress.tutorialDone = true;
    saveProgress(progress);
  } else {
    tutorialStep += 1;
  }
  renderPlay();
}

function skipTutorial() {
  tutorialStep = 0;
  progress.tutorialDone = true;
  saveProgress(progress);
  if (screen === 'play') renderPlay();
}

function startTimer() {
  stopTimer();
  timerId = setInterval(() => {
    const el = app.querySelector('[data-role="timer"]');
    if (el && game.status === 'playing') el.textContent = formatTime(game.elapsedSec());
  }, 250);
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = 0;
  }
}

function showToast(msg) {
  const el = app.querySelector('[data-role="toast"]');
  if (!el) return;
  el.hidden = false;
  el.textContent = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.hidden = true;
  }, 1800);
}

function applyWinProgress() {
  const extra = { moves: game.clicks, combo: game.combo, noHelp: game.helpsUsed === 0 };
  if (game.daily) progress = recordDailyWin(progress, game.dailyDate || todayISO(), game.starCount(), game.elapsedSec(), extra);
  else progress = recordWin(progress, game.level, game.starCount(), game.elapsedSec(), extra);
}

async function onTileClick(id, btn) {
  if (flyLock && !animFast) return;
  if (!game.canCollect(id)) return;
  const tile = game.tiles.find((t) => t.id === id);
  const needsCrack = tile && tile.ice > 1;
  if (needsCrack) {
    playCrack();
    haptic('crack');
    const result = game.collect(id);
    renderPlay();
    return result;
  }
  playTap();
  haptic('tap');
  const slotIndexBefore = predictedSlot(game.tray, tile);
  const dur = animFast ? 0 : 320;
  if (dur > 0 && btn) {
    flyLock = true;
    await flyToTray(btn, slotIndexBefore, dur);
  }
  const result = game.collect(id);
  flyLock = false;
  if (!result.ok) {
    renderPlay();
    return;
  }
  if (result.unlocked) {
    playUnlock();
    haptic('unlock');
  }
  if (result.matched) {
    if (result.combo >= 2) {
      comboFlash = result.combo;
      playCombo(result.combo);
      haptic('combo');
    } else {
      playMatch();
      haptic('match');
      comboFlash = 0;
    }
    renderPlay();
    if (!animFast) await sparkleMatch();
    comboFlash = 0;
  }
  if (result.won) {
    playWin();
    haptic('win');
    applyWinProgress();
    renderPlay();
    return;
  }
  if (result.lost) {
    playLose();
    haptic('lose');
    renderPlay();
    return;
  }
  renderPlay();
}

function predictedSlot(tray, tile) {
  if (!tile) return tray.length;
  let lastSame = -1;
  for (let i = 0; i < tray.length; i++) if (tray[i].type === tile.type) lastSame = i;
  if (lastSame >= 0) return lastSame + 1;
  return tray.length;
}

function flyToTray(fromEl, slotIndex, dur) {
  return new Promise((resolve) => {
    const traySlots = app.querySelectorAll('.tray .slot');
    const target = traySlots[Math.min(slotIndex, traySlots.length - 1)];
    if (!target) {
      resolve();
      return;
    }
    const a = fromEl.getBoundingClientRect();
    const b = target.getBoundingClientRect();
    const ghost = fromEl.cloneNode(true);
    ghost.removeAttribute('data-act');
    ghost.classList.add('flying');
    ghost.style.position = 'fixed';
    ghost.style.left = `${a.left}px`;
    ghost.style.top = `${a.top}px`;
    ghost.style.width = `${a.width}px`;
    ghost.style.height = `${a.height}px`;
    ghost.style.margin = '0';
    ghost.style.zIndex = '80';
    ghost.style.transition = 'none';
    ghost.style.pointerEvents = 'none';
    document.body.appendChild(ghost);
    fromEl.style.visibility = 'hidden';
    const dx = b.left - a.left + (b.width - a.width) / 2;
    const dy = b.top - a.top + (b.height - a.height) / 2;
    const sx = b.width / a.width;
    const sy = b.height / a.height;
    requestAnimationFrame(() => {
      ghost.style.transition = `transform ${dur}ms cubic-bezier(.2,.85,.2,1)`;
      ghost.style.transform = `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`;
    });
    window.setTimeout(() => {
      ghost.remove();
      resolve();
    }, dur + 20);
  });
}

function sparkleMatch() {
  return new Promise((resolve) => {
    const tray = app.querySelector('.tray');
    if (tray) tray.classList.add('matching');
    const pop = app.querySelector('[data-role="combo"]');
    if (pop) pop.classList.add('show');
    window.setTimeout(() => {
      if (tray) tray.classList.remove('matching');
      resolve();
    }, 360);
  });
}

async function onHelp(kind) {
  if (game.status !== 'playing') return;
  if (kind === 'undo') {
    const r = game.undo();
    if (!r.ok && r.reason === 'empty') return requestExtra('undo');
    if (r.ok) renderPlay();
    else showToast('Nothing to undo');
    return;
  }
  if (kind === 'shuffle') {
    const r = game.shuffle();
    if (!r.ok && r.reason === 'empty') return requestExtra('shuffle');
    if (r.ok) {
      playShuffle();
      renderPlay();
    } else showToast('Cannot shuffle now');
    return;
  }
  if (kind === 'hint') {
    const r = game.hint();
    if (!r.ok && r.reason === 'empty') return requestExtra('hint');
    if (r.ok) {
      playHint();
      haptic('hint');
      renderPlay();
    } else showToast('No hint available');
  }
}

async function requestExtra(kind) {
  const result = await showRewarded(`extra-${kind}`);
  if (result && result.rewarded) {
    game.grantHelp(kind);
    showToast(`Extra ${kind} added`);
    renderPlay();
  } else {
    showToast('No extra uses left');
  }
}

function leavePlay() {
  if (game.daily) {
    screen = 'daily';
  } else {
    worldId = worldFor(game.level || 1).id;
    screen = 'levels';
  }
  render();
}

app.addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-act]');
  if (!btn || !app.contains(btn)) return;
  unlockAudio();
  const act = btn.getAttribute('data-act');
  if (act === 'tutorial-next') {
    advanceTutorial();
    return;
  }
  if (act === 'tip-ok') {
    dismissTip();
    return;
  }
  if (act === 'mute') {
    progress.muted = toggleMuted();
    saveProgress(progress);
    if (screen === 'play') {
      const muteBtn = app.querySelector('[data-act="mute"]');
      if (muteBtn) {
        muteBtn.setAttribute('aria-label', isMuted() ? 'Unmute sounds' : 'Mute sounds');
        muteBtn.innerHTML = muteGlyph();
      }
    } else render();
    return;
  }
  if (act === 'vibrate') {
    progress.vibrate = !isVibrate();
    setVibrate(progress.vibrate);
    saveProgress(progress);
    if (progress.vibrate) haptic('tap');
    render();
    return;
  }
  if (act === 'play') {
    startLevel(Math.min(progress.unlocked, LEVEL_COUNT));
    return;
  }
  if (act === 'worlds') {
    screen = 'worlds';
    render();
    return;
  }
  if (act === 'open-world') {
    worldId = btn.getAttribute('data-world') || 'meadow';
    screen = 'levels';
    render();
    return;
  }
  if (act === 'levels') {
    if (game.level) worldId = worldFor(game.level).id;
    screen = 'levels';
    render();
    return;
  }
  if (act === 'daily') {
    screen = 'daily';
    render();
    return;
  }
  if (act === 'stats') {
    screen = 'stats';
    render();
    return;
  }
  if (act === 'settings') {
    confirmReset = false;
    screen = 'settings';
    render();
    return;
  }
  if (act === 'about') {
    screen = 'about';
    render();
    return;
  }
  if (act === 'home') {
    screen = 'home';
    render();
    return;
  }
  if (act === 'back-play' || act === 'back-levels') {
    leavePlay();
    return;
  }
  if (act === 'start-level') {
    startLevel(Number(btn.getAttribute('data-level')));
    return;
  }
  if (act === 'start-daily') {
    startDaily();
    return;
  }
  if (act === 'tile') {
    onTileClick(Number(btn.getAttribute('data-id')), btn);
    return;
  }
  if (act === 'help') {
    onHelp(btn.getAttribute('data-help'));
    return;
  }
  if (act === 'replay') {
    if (game.daily) startDaily(game.dailyDate || todayISO());
    else startLevel(game.level);
    return;
  }
  if (act === 'next') {
    startLevel(Math.min(LEVEL_COUNT, game.level + 1));
    return;
  }
  if (act === 'reset-ask') {
    confirmReset = true;
    render();
    return;
  }
  if (act === 'reset-no') {
    confirmReset = false;
    render();
    return;
  }
  if (act === 'reset-yes') {
    progress = resetProgress(true);
    confirmReset = false;
    worldId = 'meadow';
    render();
  }
});

function collectReady(id) {
  const tile = game.tiles.find((t) => t.id === id);
  if (!tile) return { ok: false };
  if (tile.ice > 1) {
    const first = game.collect(id);
    if (!first.ok) return first;
  }
  return game.collect(id);
}

async function playSolution(delay = 0) {
  if (game.status !== 'playing') return { ok: false };
  if (tutorialStep) skipTutorial();
  mechanicTip = null;
  const prev = animFast;
  animFast = delay <= 0;
  const ids = game.officialLeft.slice();
  for (const id of ids) {
    if (game.status !== 'playing') break;
    const r = collectReady(id);
    if (!r.ok) {
      animFast = prev;
      renderPlay();
      return { ok: false, id };
    }
    if (delay > 0) {
      renderPlay();
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  if (game.status === 'won') applyWinProgress();
  animFast = prev;
  renderPlay();
  return { ok: game.status === 'won', status: game.status };
}

window.__TT__ = {
  getScreen: () => screen,
  getProgress: () => ({
    ...progress,
    stars: { ...progress.stars },
    daily: { ...progress.daily, days: { ...progress.daily.days } },
  }),
  startLevel,
  startDaily,
  getState: () => ({
    level: game.level,
    status: game.status,
    tray: game.tray.map((t) => t.type),
    remaining: game.tiles.filter((t) => !t.removed).length,
    clicks: game.clicks,
    solution: game.solutionIds.slice(),
    officialLeft: game.officialLeft.slice(),
    stars: game.status === 'won' ? game.starCount() : 0,
    daily: game.daily,
    world: worldOfPlay().id,
  }),
  setFast: (v) => {
    animFast = !!v;
  },
  playSolution,
  collect: (id) => collectReady(id),
  forceLose: () => {
    const r = game.forceLose();
    renderPlay();
    return r;
  },
  go: (name, opts = {}) => {
    if (opts.world) worldId = opts.world;
    screen = name;
    render();
  },
  skipTutorial,
  dismissTip,
  getTutorialStep: () => tutorialStep,
  getTip: () => mechanicTip,
  refresh: () => render(),
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

render();
