import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme } from "../../src/theme/store";
import { api } from "../../src/lib/api";
import { useAuth } from "../../src/lib/auth";
import { Badge, GlassCard } from "../../src/components/ui";
import { radii } from "../../src/theme/tokens";
import * as FileSystem from "expo-file-system";

const OFFLINE_DIR = FileSystem.documentDirectory + "offline/";

export default function Library() {
  const router = useRouter();
  const colors = useTheme((s) => s.colors)();
  const { user } = useAuth();
  const [ratings, setRatings] = useState([]);
  const [novels, setNovels] = useState({});
  const [downloads, setDownloads] = useState([]);

  useEffect(() => {
    api.get("/ratings/mine").then((r) => setRatings(r.data)).catch(() => {});
    (async () => {
      try {
        const info = await FileSystem.getInfoAsync(OFFLINE_DIR);
        if (info.exists) {
          const files = await FileSystem.readDirectoryAsync(OFFLINE_DIR);
          setDownloads(files);
        }
      } catch (_) {}
    })();
  }, []);

  useEffect(() => {
    Promise.all(ratings.map((r) => api.get(`/novels/${r.novel_id}`).then((res) => res.data)))
      .then((arr) => setNovels(Object.fromEntries(arr.map((n) => [n.id, n]))));
  }, [ratings]);

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 120 }} testID="library-screen">
        <Text style={{ color: colors.primary, fontSize: 10, letterSpacing: 4, textTransform: "uppercase" }}>
          Your Shelf
        </Text>
        <Text style={{ color: colors.text, fontSize: 32, fontWeight: "700", marginTop: 6 }}>
          Library.
        </Text>
        {!user?.premium_status && (
          <GlassCard style={{ marginTop: 16, flexDirection: "row", alignItems: "center", gap: 12 }}>
            <Ionicons name="cloud-offline-outline" size={22} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "600" }}>Offline reading is a Premium perk.</Text>
              <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 2 }}>
                Subscribe to keep downloaded chapters available without a network.
              </Text>
            </View>
          </GlassCard>
        )}

        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginTop: 22 }}>
          Your ratings ({ratings.length})
        </Text>
        <View style={{ marginTop: 10, gap: 10 }}>
          {ratings.map((r) => {
            const n = novels[r.novel_id];
            return (
              <Pressable
                key={r.id}
                onPress={() => n && router.push(`/novel/${n.id}`)}
                style={{ flexDirection: "row", padding: 12, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: "600" }}>{n?.title || "Loading…"}</Text>
                  <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 2 }}>{n?.author}</Text>
                </View>
                <View style={{ flexDirection: "row", gap: 2 }}>
                  {[1,2,3,4,5].map((s) => (
                    <Ionicons key={s} name={s <= r.score ? "star" : "star-outline"} size={14} color={colors.primary} />
                  ))}
                </View>
              </Pressable>
            );
          })}
          {ratings.length === 0 && (
            <Text style={{ color: colors.textDim }}>Rate novels and they'll appear here.</Text>
          )}
        </View>

        <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600", marginTop: 28 }}>
          Downloaded
        </Text>
        <View style={{ marginTop: 10, gap: 8 }}>
          {downloads.map((f) => (
            <View key={f} style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="lock-closed-outline" size={14} color={colors.primary} />
              <Text style={{ color: colors.textDim, fontSize: 12 }}>{f} <Badge label="AES-256" tone="green" /></Text>
            </View>
          ))}
          {downloads.length === 0 && <Text style={{ color: colors.textDim }}>Nothing downloaded yet.</Text>}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
