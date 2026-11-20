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
