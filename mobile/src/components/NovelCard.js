import React from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/store";
import { radii } from "../theme/tokens";
import { Badge } from "./ui";

export default function NovelCard({ novel, onPress }) {
  const colors = useTheme((s) => s.colors)();
  return (
    <Pressable
      onPress={onPress}
      testID={`novel-card-${novel.id}`}
      style={({ pressed }) => ({
        width: "100%",
        aspectRatio: 0.66,
        borderRadius: radii.lg,
        overflow: "hidden",
        backgroundColor: colors.surface,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      {novel.cover_url ? (
        <Image source={{ uri: novel.cover_url }} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      ) : null}
      <View
        style={{
          position: "absolute", left: 0, right: 0, bottom: 0, height: "60%",
          backgroundColor: "rgba(0,0,0,0)",
        }}
      />
      <View style={{ padding: 10, position: "absolute", top: 0, left: 0, right: 0, flexDirection: "row", justifyContent: "space-between" }}>
        {novel.status === "upcoming" ? <Badge label="Soon" tone="gold" /> : <View />}
        <View
          style={{
            flexDirection: "row", alignItems: "center", gap: 4,
            backgroundColor: "rgba(0,0,0,0.55)", borderColor: "rgba(255,255,255,0.18)", borderWidth: 1,
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: radii.pill,
          }}
        >
          <Ionicons name="star" size={11} color={colors.primary} />
          <Text style={{ color: "#fff", fontSize: 11, fontWeight: "600" }}>
            {novel.avg_rating?.toFixed?.(1) || "0.0"}
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>({novel.rating_count || 0})</Text>
        </View>
      </View>
      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: "rgba(0,0,0,0.55)" }}>
        <Text style={{ fontSize: 10, letterSpacing: 1.4, color: "rgba(255,255,255,0.75)", textTransform: "uppercase" }}>
          {novel.category}
        </Text>
        <Text numberOfLines={2} style={{ color: "#fff", fontSize: 16, marginTop: 2, fontWeight: "600" }}>
          {novel.title}
        </Text>
        <Text style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, marginTop: 2 }}>{novel.author}</Text>
      </View>
    </Pressable>
  );
}
