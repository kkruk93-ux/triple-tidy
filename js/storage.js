import { ACHIEVEMENTS, LEVEL_COUNT, STORAGE_KEY, LEGACY_STORAGE_KEYS, WORLDS, shiftISO, todayISO, worldFor } from './config.js';
import { setRemoveAds } from './monetization.js';
import { setMuted } from './audio.js';

function emptyDaily() {
  return { lastDate: null, lastWon: null, streak: 0, bestStreak: 0, wins: 0, days: {} };
}

function empty() {
  return {
    version: 2,
    unlocked: 1,
    stars: {},
    bestTime: {},
    muted: false,
    vibrate: true,
    removeAds: false,
    tutorialDone: false,
    seenTips: {},
    achievements: {},
    daily: emptyDaily(),
    stats: { campaignWins: 0, totalWins: 0, totalMoves: 0, playSeconds: 0, bestCombo: 0 },
  };
}

function readRaw() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) return raw;
  for (const key of LEGACY_STORAGE_KEYS) {
    const legacy = localStorage.getItem(key);
    if (legacy) return legacy;
  }
  return null;
}

export function loadProgress() {
  try {
    const raw = readRaw();
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
    const daily = { ...emptyDaily(), ...(data.daily && typeof data.daily === 'object' ? data.daily : {}) };
    if (!daily.days || typeof daily.days !== 'object') daily.days = {};
    const stats = { ...base.stats, ...(data.stats && typeof data.stats === 'object' ? data.stats : {}) };
    const achievements = data.achievements && typeof data.achievements === 'object' ? { ...data.achievements } : {};
    const seenTips = data.seenTips && typeof data.seenTips === 'object' ? { ...data.seenTips } : {};
    const progress = {
      ...base,
      unlocked,
      stars,
      bestTime,
      muted: !!data.muted,
      vibrate: data.vibrate !== false,
      removeAds: !!data.removeAds,
      tutorialDone: !!data.tutorialDone,
      seenTips,
      achievements,
      daily,
      stats,
    };
    setRemoveAds(progress.removeAds);
    return progress;
  } catch {
    return empty();
  }
}

export function saveProgress(progress) {
  const data = {
    version: 2,
    unlocked: progress.unlocked,
    stars: progress.stars,
    bestTime: progress.bestTime,
    muted: !!progress.muted,
    vibrate: progress.vibrate !== false,
    removeAds: !!progress.removeAds,
    tutorialDone: !!progress.tutorialDone,
    seenTips: progress.seenTips || {},
    achievements: progress.achievements || {},
    daily: progress.daily || emptyDaily(),
    stats: progress.stats || empty().stats,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  setRemoveAds(data.removeAds);
}

function unlockAchievements(progress) {
  const cleared = Object.keys(progress.stars).length;
  const totalStars = Object.values(progress.stars).reduce((a, b) => a + (b | 0), 0);
  const grant = (id) => {
    if (!progress.achievements[id]) progress.achievements[id] = Date.now();
  };
  if (cleared >= 1 || progress.daily.wins >= 1) grant('first-tidy');
  if (cleared >= 10) grant('ten-clear');
  if (cleared >= 50) grant('fifty-clear');
  if (cleared >= LEVEL_COUNT) grant('all-clear');
  for (const world of WORLDS) {
    let all = true;
    for (let n = world.start; n <= world.end; n++) {
      if (!progress.stars[n]) { all = false; break; }
    }
    if (all) grant(`${world.id}-done`);
  }
  if (Object.values(progress.stars).some((s) => s >= 3) || Object.values(progress.daily.days).some((d) => d && d.stars >= 3)) {
    grant('perfect');
  }
  if (progress.daily.wins >= 1) grant('daily-one');
  if (Math.max(progress.daily.streak, progress.daily.bestStreak) >= 7) grant('streak-7');
  void totalStars;
  return progress;
}

export function recordWin(progress, level, stars, timeSec, extra = {}) {
  const next = {
    ...progress,
    stars: { ...progress.stars },
    bestTime: { ...progress.bestTime },
    achievements: { ...progress.achievements },
    stats: { ...progress.stats },
    daily: { ...progress.daily, days: { ...progress.daily.days } },
    unlocked: Math.max(progress.unlocked, Math.min(LEVEL_COUNT, level + 1)),
  };
  const prev = next.stars[level] || 0;
  if (stars > prev) next.stars[level] = stars;
  const best = next.bestTime[level];
  if (!best || timeSec < best) next.bestTime[level] = timeSec;
  next.stats.campaignWins = (next.stats.campaignWins || 0) + 1;
  next.stats.totalWins = (next.stats.totalWins || 0) + 1;
  next.stats.totalMoves = (next.stats.totalMoves || 0) + (extra.moves || 0);
  next.stats.playSeconds = (next.stats.playSeconds || 0) + timeSec;
  if ((extra.combo || 0) > (next.stats.bestCombo || 0)) next.stats.bestCombo = extra.combo;
  if (extra.noHelp) {
    if (!next.achievements['no-help']) next.achievements['no-help'] = Date.now();
  }
  unlockAchievements(next);
  saveProgress(next);
  return next;
}

export function recordDailyWin(progress, isoDate, stars, timeSec, extra = {}) {
  const next = {
    ...progress,
    achievements: { ...progress.achievements },
    stats: { ...progress.stats },
    daily: { ...progress.daily, days: { ...progress.daily.days } },
  };
  const firstToday = next.daily.lastWon !== isoDate;
  if (firstToday) {
    const yesterday = shiftISO(isoDate, -1);
    next.daily.streak = next.daily.lastWon === yesterday ? (next.daily.streak || 0) + 1 : 1;
    next.daily.bestStreak = Math.max(next.daily.bestStreak || 0, next.daily.streak);
    next.daily.wins = (next.daily.wins || 0) + 1;
    next.daily.lastWon = isoDate;
    next.daily.lastDate = isoDate;
  }
  const prev = next.daily.days[isoDate] || {};
  next.daily.days[isoDate] = {
    stars: Math.max(prev.stars || 0, stars),
    time: !prev.time || timeSec < prev.time ? timeSec : prev.time,
  };
  next.stats.totalWins = (next.stats.totalWins || 0) + (firstToday ? 1 : 0);
  next.stats.totalMoves = (next.stats.totalMoves || 0) + (extra.moves || 0);
  next.stats.playSeconds = (next.stats.playSeconds || 0) + timeSec;
  if ((extra.combo || 0) > (next.stats.bestCombo || 0)) next.stats.bestCombo = extra.combo;
  unlockAchievements(next);
  saveProgress(next);
  return next;
}

export function markTipSeen(progress, tip) {
  const next = { ...progress, seenTips: { ...progress.seenTips, [tip]: true } };
  saveProgress(next);
  return next;
}

export function resetProgress(keepPrefs = true) {
  const prev = keepPrefs ? loadProgress() : empty();
  const next = empty();
  if (keepPrefs) {
    next.muted = !!prev.muted;
    next.vibrate = prev.vibrate !== false;
  }
  saveProgress(next);
  setMuted(next.muted);
  return next;
}

export function clearedCount(progress) {
  return Object.keys(progress.stars).length;
}

export function totalStars(progress) {
  return Object.values(progress.stars).reduce((a, b) => a + (b | 0), 0);
}

export function worldProgress(progress, world) {
  let done = 0;
  let stars = 0;
  for (let n = world.start; n <= world.end; n++) {
    if (progress.stars[n]) done += 1;
    stars += progress.stars[n] || 0;
  }
  const unlocked = progress.unlocked >= world.start;
  return { done, total: world.end - world.start + 1, stars, unlocked };
}

export function achievementList(progress) {
  return ACHIEVEMENTS.map((a) => ({ ...a, unlockedAt: progress.achievements[a.id] || 0 }));
}

export function todayDaily(progress, date = new Date()) {
  const iso = todayISO(date);
  return { iso, entry: progress.daily.days[iso] || null, streak: progress.daily.streak || 0 };
}

export { worldFor, todayISO };
