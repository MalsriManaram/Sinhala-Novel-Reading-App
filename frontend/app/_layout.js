import React, { useEffect } from "react";
import { Platform } from "react-native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useAuth } from "../src/lib/auth";
import { useTheme } from "../src/theme/store";
import { refreshContentKey } from "../src/lib/contentKey";

export default function RootLayout() {
  const bootstrap = useAuth((s) => s.bootstrap);
  const initTheme = useTheme((s) => s.init);
  const mode = useTheme((s) => s.mode);
  const user = useAuth((s) => s.user);

  useEffect(() => {
    // Block screenshots & screen recording on native devices only (anti-piracy)
    if (Platform.OS === "ios" || Platform.OS === "android") {
      const sc = require("expo-screen-capture");
      sc.preventScreenCaptureAsync().catch(() => {});
    }
    initTheme();
    bootstrap();
  }, []);

  useEffect(() => {
    // Re-fetch the AES content key (in memory only) for premium users
    if (user?.premium_status) refreshContentKey();
  }, [user?.premium_status]);

  return (
    <SafeAreaProvider>
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
    </SafeAreaProvider>
  );
}
