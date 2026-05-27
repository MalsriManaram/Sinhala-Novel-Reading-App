import { create } from "zustand";
import { api } from "./api";

export const useAuth = create((set, get) => ({
  user: null,
  loading: true,
  bootstrap: async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const r = await api.get("/auth/me");
      set({ user: r.data, loading: false });
    } catch (_) {
      set({ user: null, loading: false });
    }
  },
  login: async (email, password) => {
    const r = await api.post("/auth/login", { email, password });
    localStorage.setItem("access_token", r.data.access_token);
    localStorage.setItem("refresh_token", r.data.refresh_token);
    set({ user: r.data.user });
    return r.data.user;
  },
  logout: async () => {
    try { await api.post("/auth/logout"); } catch (_) {}
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    set({ user: null });
  },
}));
