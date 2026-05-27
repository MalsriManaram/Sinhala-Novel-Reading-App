import React from "react";
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/theme/store";
import { t } from "../../src/theme/i18n";

export default function TabsLayout() {
  const colors = useTheme((s) => s.colors)();
  const lang = useTheme((s) => s.language);

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: colors.glass,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 76,
          paddingTop: 8,
          paddingBottom: 14,
          // glassmorphic feel — expo-blur added at root level on iOS for true blur
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 11, letterSpacing: 0.3, fontWeight: "600" },
        tabBarIcon: ({ color, size }) => {
          const map = {
            home: "book-outline",
            waitlist: "time-outline",
            library: "bookmarks-outline",
            profile: "person-circle-outline",
          };
          return <Ionicons name={map[route.name] || "ellipse"} size={size + 2} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: t(lang, "home") }} />
      <Tabs.Screen name="waitlist" options={{ title: t(lang, "waitlist") }} />
      <Tabs.Screen name="library" options={{ title: t(lang, "library") }} />
      <Tabs.Screen name="profile" options={{ title: t(lang, "profile") }} />
    </Tabs>
  );
}
