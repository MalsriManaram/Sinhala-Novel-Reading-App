import React from "react";
import { Text, Pressable, View } from "react-native";
import { useTheme } from "../theme/store";
import { radii } from "../theme/tokens";

export function Button({ title, onPress, variant = "primary", style, testID, disabled, icon, compact }) {
  const colors = useTheme((s) => s.colors)();
  const bg =
    variant === "primary" ? colors.primary :
    variant === "ghost" ? "transparent" : colors.surface;
  const fg =
    variant === "primary" ? "#1A140A" : colors.text;
  const borderColor = variant === "ghost" ? colors.border : "transparent";
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        {
          backgroundColor: bg,
          borderRadius: radii.lg,
          paddingHorizontal: compact ? 14 : 18,
          paddingVertical: compact ? 10 : 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderWidth: 1,
          borderColor,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {icon}
      <Text style={{ color: fg, fontWeight: "600", fontSize: compact ? 13 : 15 }}>{title}</Text>
    </Pressable>
  );
}

export function GlassCard({ children, style }) {
  const colors = useTheme((s) => s.colors)();
  return (
    <View
      style={[
        {
          backgroundColor: colors.glass,
          borderColor: colors.border,
          borderWidth: 1,
          borderRadius: radii.lg,
          padding: 16,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Badge({ label, tone = "neutral" }) {
  const colors = useTheme((s) => s.colors)();
  const palette = {
    neutral: { bg: colors.border, fg: colors.text },
    gold: { bg: "rgba(199,146,62,0.18)", fg: colors.primary },
    pink: { bg: "rgba(244,114,182,0.13)", fg: "#f9a8d4" },
    green: { bg: "rgba(34,197,94,0.15)", fg: "#86efac" },
  }[tone];
  return (
    <View style={{ backgroundColor: palette.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill }}>
      <Text style={{ color: palette.fg, fontSize: 10, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
        {label}
      </Text>
    </View>
  );
}
