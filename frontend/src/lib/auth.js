import { create } from "zustand";
import { api, setTokens, clearTokens } from "./api";

export const useAuth = create((set) => ({
  user: null,
  loading: true,
  bootstrap: async () => {
    try {
      const r = await api.get("/auth/me");
      set({ user: r.data, loading: false });
    } catch (_) {
      set({ user: null, loading: false });
    }
  },
  loginEmail: async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    await setTokens(r.data.access_token, r.data.refresh_token);
    set({ user: r.data.user });
    return r.data.user;
  },
  registerEmail: async (email, password, name, country_code) => {
    const r = await api.post("/auth/register", { email, password, name, country_code });
    await setTokens(r.data.access_token, r.data.refresh_token);
    set({ user: r.data.user });
    return r.data.user;
  },
  requestOTP: async (phone) => {
    const r = await api.post("/auth/otp/request", { phone, purpose: "login" });
    return r.data;
  },
  verifyOTP: async (phone, code) => {
    const r = await api.post("/auth/otp/verify", { phone, code });
    await setTokens(r.data.access_token, r.data.refresh_token);
    set({ user: r.data.user });
    return r.data.user;
  },
  socialLogin: async (provider) => {
    // MOCKED — real impl would use expo-auth-session for Google and
    // expo-apple-authentication for Apple, then exchange tokens with backend.
    const r = await api.post("/auth/social", {
      provider,
      provider_token: `mock_${provider}_${Date.now()}`,
      name: provider === "apple" ? "Apple User" : "Google User",
    });
    await setTokens(r.data.access_token, r.data.refresh_token);
    set({ user: r.data.user });
    return r.data.user;
  },
  signOut: async () => {
    await clearTokens();
    set({ user: null });
  },
}));
