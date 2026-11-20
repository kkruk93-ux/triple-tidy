/**
 * Monetization hooks only — no ad SDK, no network calls, no tracking.
 * Wire a rewarded-ad provider into showRewarded() later, and an IAP
 * into purchaseRemoveAds(). The rest of the game should call these
 * functions and honor the removeAds flag.
 */
const STATE = {
  removeAds: false,
};

export function getRemoveAds() {
  return STATE.removeAds;
}

export function setRemoveAds(value) {
  STATE.removeAds = !!value;
  return STATE.removeAds;
}

/**
 * Future hook for a rewarded ad (extra Undo / Shuffle / Hint).
 * Resolves { rewarded: false } until an SDK is connected.
 */
export async function showRewarded(_placement = 'extra-help') {
  return { rewarded: false, reason: 'not-implemented' };
}

/**
 * Future hook for an interstitial. No-ops when removeAds is true.
 */
export async function showInterstitial(_placement = 'level-end') {
  if (STATE.removeAds) return { shown: false, skipped: true };
  return { shown: false, reason: 'not-implemented' };
}

/**
 * Future hook for a "Remove ads" purchase.
 */
export async function purchaseRemoveAds() {
  return { purchased: false, reason: 'not-implemented' };
}

export const monetization = {
  get removeAds() {
    return STATE.removeAds;
  },
  set removeAds(v) {
    STATE.removeAds = !!v;
  },
  showRewarded,
  showInterstitial,
  purchaseRemoveAds,
  getRemoveAds,
  setRemoveAds,
};

export default monetization;
