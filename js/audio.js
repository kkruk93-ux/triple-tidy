let ctx = null;
let muted = false;

function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function setMuted(value) {
  muted = !!value;
  return muted;
}

export function isMuted() {
  return muted;
}

export function toggleMuted() {
  return setMuted(!muted);
}

function tone(freq, t0, dur, type, gain, freqEnd) {
  const c = ac();
  if (!c || muted) return;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g);
  g.connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export function playTap() {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime;
  tone(620, t, 0.07, 'triangle', 0.06);
}

export function playMatch() {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime;
  tone(392, t, 0.12, 'triangle', 0.07);
  tone(494, t + 0.07, 0.12, 'triangle', 0.07);
  tone(587, t + 0.14, 0.18, 'triangle', 0.08);
}

export function playWin() {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime;
  [523, 659, 784, 1046].forEach((f, i) => tone(f, t + i * 0.11, 0.28, 'triangle', 0.08));
}

export function playLose() {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime;
  tone(320, t, 0.2, 'sine', 0.07, 180);
  tone(240, t + 0.16, 0.32, 'sine', 0.06, 120);
}

export function playHint() {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime;
  tone(880, t, 0.1, 'sine', 0.05);
  tone(1320, t + 0.08, 0.12, 'sine', 0.04);
}

export function playShuffle() {
  const c = ac();
  if (!c || muted) return;
  const t = c.currentTime;
  tone(300, t, 0.08, 'square', 0.03, 500);
  tone(500, t + 0.07, 0.08, 'square', 0.03, 280);
}

export function unlockAudio() {
  ac();
}


let vibrateOn = true;

export function setVibrate(value) {
  vibrateOn = !!value;
}

export function isVibrate() {
  return vibrateOn;
}

export function haptic(kind = 'tap') {
  if (!vibrateOn) return;
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return;
  const patterns = {
    tap: 8,
    crack: 14,
    unlock: [10, 24, 16],
    match: [8, 28, 16],
    combo: [10, 20, 10, 20, 18],
    win: [12, 40, 20, 40, 36],
    lose: [30, 40, 50],
    hint: 12,
  };
  try {
    navigator.vibrate(patterns[kind] || 8);
  } catch {
    /* some browsers throw if vibration is blocked */
  }
}

export function playCrack() {
  const ctx = ac();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  tone(920, t0, 0.05, 'triangle', 0.05);
  tone(420, t0 + 0.04, 0.08, 'sine', 0.05);
}

export function playUnlock() {
  const ctx = ac();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  tone(520, t0, 0.07, 'triangle', 0.05);
  tone(780, t0 + 0.06, 0.1, 'sine', 0.05);
}

export function playCombo(n = 2) {
  const ctx = ac();
  if (!ctx) return;
  const t0 = ctx.currentTime;
  const base = 520 + Math.min(6, n) * 40;
  tone(base, t0, 0.08, 'triangle', 0.06);
  tone(base * 1.25, t0 + 0.07, 0.1, 'sine', 0.05);
}
