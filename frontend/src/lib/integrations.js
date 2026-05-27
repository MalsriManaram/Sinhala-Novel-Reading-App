/**
 * MOCKED integrations used by the mobile UI.  These are placeholders for
 * the real native modules: AdMob Rewarded Video, RevenueCat, OneSignal,
 * Dialog Ideamart, Google Auth, Apple Auth.  They simulate realistic
 * timings and outcomes so the UI flows can be tested end-to-end.
 */
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export const RewardedAd = {
  /**
   * Simulate an AdMob rewarded ad.  Returns a non-empty reward token on
   * success that the backend will accept for chapter unlocking.
   */
  show: async () => {
    await wait(1200); // load
    await wait(1500); // "play"
    return { token: `mock_admob_${Date.now()}` };
  },
};

export const OneSignal = {
  setExternalUserId: async (id) => { console.log("[mocked-onesignal] setExternalUserId", id); },
  scheduleReminder: async (novelTitle, releaseAtIso) => {
    const t = new Date(releaseAtIso).getTime() - 60 * 60 * 1000; // 1h before
    console.log("[mocked-onesignal] schedule push", novelTitle, "at", new Date(t).toISOString());
    return true;
  },
  send: async (title, message) => {
    console.log("[mocked-onesignal] send", { title, message });
    return true;
  },
};

export const RevenueCat = {
  configure: async (apiKey, appUserId) => { console.log("[mocked-revenuecat] configure", appUserId); },
  purchasePackage: async (planId) => {
    await wait(1000);
    return { transactionId: `mock_rc_${Date.now()}`, productId: planId };
  },
  cancel: async () => true,
};

export const GoogleAuth = {
  signIn: async () => {
    await wait(800);
    return { token: `mock_google_${Date.now()}`, email: "test.user@gmail.com", name: "Test Google" };
  },
};

export const AppleAuth = {
  signIn: async () => {
    await wait(800);
    return { token: `mock_apple_${Date.now()}`, name: "Apple User" };
  },
};
