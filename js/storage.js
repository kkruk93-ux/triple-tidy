import { LEVEL_COUNT, STORAGE_KEY, LEGACY_STORAGE_KEY } from './config.js';
import { setRemoveAds } from './monetization.js';

function empty() {
  return {
    version: 1,
    unlocked: 1,
    stars: {},
    bestTime: {},
    muted: false,
    removeAds: false,
    tutorialDone: false,
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!raw) return empty();
    const data = JSON.parse(raw);
    const base = empty();
    const unlocked = Math.max(1, Math.min(LEVEL_COUNT, data.unlocked | 0 || 1));
    const stars = {};
    const bestTime = {};
    if (data.stars && typeof data.stars === 'object') {
      for (const [k, v] of Object.entries(data.stars)) {
        const level = k | 0;
        const s = v | 0;
        if (level >= 1 && level <= LEVEL_COUNT && s >= 1 && s <= 3) stars[level] = s;
      }
    }
    if (data.bestTime && typeof data.bestTime === 'object') {
      for (const [k, v] of Object.entries(data.bestTime)) {
        const level = k | 0;
        const t = Number(v);
        if (level >= 1 && level <= LEVEL_COUNT && t > 0) bestTime[level] = t;
      }
    }
    const progress = {
      ...base,
      unlocked,
      stars,
      bestTime,
      muted: !!data.muted,
      removeAds: !!data.removeAds,
      tutorialDone: !!data.tutorialDone,
    };
    setRemoveAds(progress.removeAds);
    return progress;
  } catch {
    return empty();
  }
}

export function saveProgress(progress) {
  const data = {
    version: 1,
    unlocked: progress.unlocked,
    stars: progress.stars,
    bestTime: progress.bestTime,
    muted: !!progress.muted,
    removeAds: !!progress.removeAds,
    tutorialDone: !!progress.tutorialDone,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  setRemoveAds(data.removeAds);
}

export function recordWin(progress, level, stars, timeSec) {
  const next = {
    ...progress,
    stars: { ...progress.stars },
    bestTime: { ...progress.bestTime },
    unlocked: Math.max(progress.unlocked, Math.min(LEVEL_COUNT, level + 1)),
  };
  const prev = next.stars[level] || 0;
  if (stars > prev) next.stars[level] = stars;
  const best = next.bestTime[level];
  if (!best || timeSec < best) next.bestTime[level] = timeSec;
  saveProgress(next);
  return next;
}
