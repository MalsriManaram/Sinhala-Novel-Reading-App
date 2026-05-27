/**
 * Cross-platform secure-ish token storage.
 * - native: expo-secure-store (Keychain / Keystore)
 * - web: localStorage (fine for preview; real prod web build would use HTTP-only cookie)
 */
import { Platform } from "react-native";

let impl;
if (Platform.OS === "web") {
  impl = {
    getItemAsync: async (k) => {
      try { return window.localStorage.getItem(k); } catch { return null; }
    },
    setItemAsync: async (k, v) => {
      try { window.localStorage.setItem(k, v); } catch {}
    },
    deleteItemAsync: async (k) => {
      try { window.localStorage.removeItem(k); } catch {}
    },
  };
} else {
  // Lazy require so web bundler doesn't choke
  impl = require("expo-secure-store");
}

export const getItemAsync = (k) => impl.getItemAsync(k);
export const setItemAsync = (k, v) => impl.setItemAsync(k, v);
export const deleteItemAsync = (k) => impl.deleteItemAsync(k);
