import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import { dark, light } from "./tokens";

export const useTheme = create((set, get) => ({
  mode: Appearance.getColorScheme() === "light" ? "light" : "dark",
  language: "en", // "en" | "si"
  init: async () => {
    const [m, l] = await Promise.all([
      AsyncStorage.getItem("theme"),
      AsyncStorage.getItem("language"),
    ]);
    if (m) set({ mode: m });
    if (l) set({ language: l });
  },
  toggle: async () => {
    const next = get().mode === "dark" ? "light" : "dark";
    set({ mode: next });
    await AsyncStorage.setItem("theme", next);
  },
  setLanguage: async (lang) => {
    set({ language: lang });
    await AsyncStorage.setItem("language", lang);
  },
  colors: () => (get().mode === "dark" ? dark : light),
}));
