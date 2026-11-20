import { LEVEL_COUNT, BOARD_W, BOARD_H } from './config.js';
import { Game } from './game.js';
import { iconSvg, iconTint, iconName } from './icons.js';
import {
  isMuted,
  setMuted,
  toggleMuted,
  playTap,
  playMatch,
  playWin,
  playLose,
  playHint,
  playShuffle,
  unlockAudio,
} from './audio.js';
import { loadProgress, saveProgress, recordWin } from './storage.js';
import { showRewarded } from './monetization.js';

const app = document.getElementById('app');
const game = new Game();
let progress = loadProgress();
setMuted(progress.muted);

let screen = 'home';
let animFast = false;
let flyLock = false;
let timerId = 0;
let toastTimer = 0;

function formatTime(sec) {
  const s = Math.max(0, Math.floor(sec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

// Mute control uses a simple SVG glyph (no emoji).
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

function render() {
  if (screen === 'home') renderHome();
  else if (screen === 'levels') renderLevels();
  else if (screen === 'about') renderAbout();
  else if (screen === 'play') renderPlay();
}

function shell(inner, extraClass = '') {
  app.className = `app ${extraClass}`;
  app.innerHTML = inner;
}

function renderHome() {
  stopTimer();
  const next = Math.min(progress.unlocked, LEVEL_COUNT);
  const cleared = Object.keys(progress.stars).length;
  shell(`
    <section class="screen home" data-screen="home">
      <button class="icon-btn mute-btn" type="button" data-act="mute" aria-label="${isMuted() ? 'Unmute sounds' : 'Mute sounds'}">${muteGlyph()}</button>
      <div class="brand">
        <div class="logo" aria-hidden="true">${logoSvg()}</div>
        <h1>Triple Tidy</h1>
        <p class="tag">Match three. Clear the tray. Tidy the pile.</p>
      </div>
      <div class="home-actions">
        <button class="btn primary" type="button" data-act="play">${cleared ? 'Continue' : 'Play'}</button>
        <button class="btn ghost" type="button" data-act="levels">Levels</button>
        <button class="btn ghost" type="button" data-act="about">About</button>
      </div>
      <p class="home-meta">${cleared} / ${LEVEL_COUNT} tidied · next: level ${next}</p>
    </section>
  `);
}

function logoSvg() {
  return `
    <svg class="logo-svg" viewBox="0 0 160 120" width="160" height="120" aria-hidden="true">
      <rect x="28" y="34" width="64" height="64" rx="16" fill="#FFFBF5" stroke="#E8D5C4" stroke-width="3" transform="rotate(-14 60 66)"/>
      <rect x="54" y="22" width="64" height="64" rx="16" fill="#FFFBF5" stroke="#E8D5C4" stroke-width="3" transform="rotate(10 86 54)"/>
      <rect x="46" y="38" width="68" height="68" rx="16" fill="#FFFBF5" stroke="#2A9D8F" stroke-width="3"/>
      <g transform="translate(48 40) scale(0.97)">${iconInner(6)}</g>
    </svg>
  `;
}

function iconInner(type) {
  // iconSvg wraps a full svg; for nested use the raw mark via a foreign image is messy.
  // Draw a mini star for the logo (type 6 is star).
  return `<path d="M32 8l6.2 14.4 15.8 1.6-12 10.4 3.6 15.6L32 42.4 18.4 50l3.6-15.6-12-10.4 15.8-1.6z" fill="#E6B017"/>`;
}

function renderLevels() {
  stopTimer();
  const cells = [];
  for (let i = 1; i <= LEVEL_COUNT; i++) {
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
        <button class="icon-btn" type="button" data-act="home" aria-label="Back">${backGlyph()}</button>
        <h2>Levels</h2>
        <button class="icon-btn mute-btn" type="button" data-act="mute" aria-label="${isMuted() ? 'Unmute sounds' : 'Mute sounds'}">${muteGlyph()}</button>
      </header>
      <div class="level-grid">${cells.join('')}</div>
    </section>
  `);
}

function backGlyph() {
  return `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M15 5l-8 7 8 7" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
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
        <h1>Triple Tidy</h1>
        <p>A cozy tile puzzle. Lift a free tile onto the tray. Three of a kind vanish. Empty the board to tidy up — but do not overflow the tray.</p>
        <p>Thirty procedurally seeded levels, each built so a solution exists. Play offline, in portrait, at your own pace.</p>
        <h3>Links</h3>
        <ul class="links">
          <li><a href="https://www.youtube.com/@RoviHere" target="_blank" rel="noopener noreferrer">YouTube</a></li>
          <li><a href="https://x.com/RoviHere" target="_blank" rel="noopener noreferrer">X</a></li>
          <li><a href="https://suno.com/@kkruk93" target="_blank" rel="noopener noreferrer">Suno</a></li>
        </ul>
        <p class="btc">Support (BTC): <span class="addr">bc1qd05h6spuj8dqf9rs9fu4re9rh4q6k0gflfqum8</span></p>
        <p class="ver">Version 1.0.0</p>
      </div>
    </section>
  `);
}

function renderPlay() {
  const g = game;
  const time = formatTime(g.elapsedSec());
  const cfg = g.config;
  const overlay = g.status === 'won' ? winOverlay() : g.status === 'lost' ? loseOverlay() : '';
  shell(`
    <section class="screen play" data-screen="play">
      <header class="top play-top">
        <button class="icon-btn" type="button" data-act="back-levels" aria-label="Back to levels">${backGlyph()}</button>
        <div class="play-title">
          <h2>Level ${g.level}</h2>
          <p class="stats"><span data-role="timer">${time}</span> · ${g.clicks} moves</p>
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
      </div>
      <div class="tray-wrap">
        <p class="tray-label">Tray</p>
        <div class="tray" data-role="tray">${renderTray()}</div>
      </div>
      ${overlay}
      <div class="toast" data-role="toast" hidden></div>
    </section>
  `, 'in-play');
  if (g.status === 'playing') startTimer();
  else stopTimer();
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
  return living
    .map((t) => {
      const free = game.status === 'playing' && game.canCollect(t.id);
      const hint = game.lastHintId === t.id;
      return `<button class="tile ${free ? 'free' : 'blocked'} ${hint ? 'hinted' : ''}"
        type="button" data-act="tile" data-id="${t.id}" data-type="${t.type}"
        ${free ? '' : 'tabindex="-1"'}
        aria-label="${free ? `Collect ${iconName(t.type)}` : `${iconName(t.type)}, covered`}"
        style="--x:${t.x};--y:${t.y};--z:${t.z};--tw:${t.w};--th:${t.h};--tint:${iconTint(t.type)};">
        <span class="tile-face">${iconSvg(t.type, 48)}</span>
      </button>`;
    })
    .join('');
}

function renderTray() {
  const slots = [];
  for (let i = 0; i < 7; i++) {
    const t = game.tray[i];
    if (t) {
      slots.push(`<div class="slot filled" data-slot="${i}" data-tid="${t.id}" style="--tint:${iconTint(t.type)}">
        <span class="tile-face">${iconSvg(t.type, 40)}</span>
      </div>`);
    } else {
      slots.push(`<div class="slot empty" data-slot="${i}"></div>`);
    }
  }
  return slots.join('');
}

function winOverlay() {
  const stars = game.starCount();
  const hasNext = game.level < LEVEL_COUNT;
  return `
    <div class="overlay" data-role="overlay" data-kind="win">
      <div class="modal">
        <h3>Board tidied!</h3>
        <div class="star-big">${starRow(stars, 'lg')}</div>
        <p class="modal-meta">${formatTime(game.elapsedSec())} · ${game.clicks} moves</p>
        <div class="modal-actions">
          ${hasNext ? '<button class="btn primary" type="button" data-act="next">Next level</button>' : ''}
          <button class="btn ghost" type="button" data-act="replay">Replay</button>
          <button class="btn ghost" type="button" data-act="levels">Levels</button>
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
          <button class="btn ghost" type="button" data-act="levels">Levels</button>
        </div>
      </div>
    </div>`;
}

function startLevel(n) {
  game.start(n);
  screen = 'play';
  render();
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

async function onTileClick(id, btn) {
  if (flyLock && !animFast) return;
  if (!game.canCollect(id)) return;
  playTap();
  const slotIndexBefore = predictedSlot(game.tray, game.tiles.find((t) => t.id === id));
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
  if (result.matched) {
    playMatch();
    renderPlay();
    if (!animFast) await sparkleMatch();
  }
  if (result.won) {
    playWin();
    progress = recordWin(progress, game.level, result.stars, game.elapsedSec());
    renderPlay();
    return;
  }
  if (result.lost) {
    playLose();
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
    window.setTimeout(() => {
      if (tray) tray.classList.remove('matching');
      resolve();
    }, 280);
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

app.addEventListener('click', (ev) => {
  const btn = ev.target.closest('[data-act]');
  if (!btn || !app.contains(btn)) return;
  unlockAudio();
  const act = btn.getAttribute('data-act');
  if (act === 'mute') {
    progress.muted = toggleMuted();
    saveProgress(progress);
    const label = isMuted() ? 'Unmute sounds' : 'Mute sounds';
    btn.setAttribute('aria-label', label);
    btn.innerHTML = muteGlyph();
    return;
  }
  if (act === 'play') {
    startLevel(Math.min(progress.unlocked, LEVEL_COUNT));
    return;
  }
  if (act === 'levels') {
    screen = 'levels';
    render();
    return;
  }
  if (act === 'about') {
    screen = 'about';
    render();
    return;
  }
  if (act === 'home' || act === 'back-levels') {
    screen = act === 'home' ? 'home' : 'levels';
    render();
    return;
  }
  if (act === 'start-level') {
    startLevel(Number(btn.getAttribute('data-level')));
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
    startLevel(game.level);
    return;
  }
  if (act === 'next') {
    startLevel(Math.min(LEVEL_COUNT, game.level + 1));
  }
});

async function playSolution(delay = 0) {
  if (game.status !== 'playing') return { ok: false };
  const prev = animFast;
  animFast = delay <= 0;
  const ids = game.officialLeft.slice();
  for (const id of ids) {
    if (game.status !== 'playing') break;
    const r = game.collect(id);
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
  if (game.status === 'won') {
    progress = recordWin(progress, game.level, game.starCount(), game.elapsedSec());
  }
  animFast = prev;
  renderPlay();
  return { ok: game.status === 'won', status: game.status };
}

window.__TT__ = {
  getScreen: () => screen,
  getProgress: () => ({ ...progress, stars: { ...progress.stars } }),
  startLevel,
  getState: () => ({
    level: game.level,
    status: game.status,
    tray: game.tray.map((t) => t.type),
    remaining: game.tiles.filter((t) => !t.removed).length,
    clicks: game.clicks,
    solution: game.solutionIds.slice(),
    officialLeft: game.officialLeft.slice(),
    stars: game.status === 'won' ? game.starCount() : 0,
  }),
  setFast: (v) => {
    animFast = !!v;
  },
  playSolution,
  collect: (id) => game.collect(id),
  forceLose: () => {
    const r = game.forceLose();
    renderPlay();
    return r;
  },
  go: (name) => {
    screen = name;
    render();
  },
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

render();
