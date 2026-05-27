import React, { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, RefreshControl } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../src/theme/store";
import { api } from "../../src/lib/api";
import NovelCard from "../../src/components/NovelCard";

export default function Home() {
  const router = useRouter();
  const colors = useTheme((s) => s.colors)();
  const lang = useTheme((s) => s.language);
  const [novels, setNovels] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const r = await api.get("/novels", { params: { status: "published" } });
    setNovels(r.data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: 22, paddingBottom: 120 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        testID="home-screen"
      >
        <Text style={{ color: colors.primary, fontSize: 10, letterSpacing: 4, textTransform: "uppercase" }}>
          Discover
        </Text>
        <Text style={{ color: colors.text, fontSize: 32, fontWeight: "700", marginTop: 6 }}>
          Tonight's reading.
        </Text>
        <Text style={{ color: colors.textDim, marginTop: 6, lineHeight: 20 }}>
          {lang === "si"
            ? "ඔබට අවශ්‍ය නවකතා, සිතුවිලි සහ සිංහල ශ්‍රවණ සහාය ලැබේ."
            : "Curated novels with Sinhala-aware narration and offline reading."}
        </Text>

        <View style={{ marginTop: 22, gap: 18, flexDirection: "row", flexWrap: "wrap" }}>
          {novels.map((n) => (
            <View key={n.id} style={{ width: "47%", flexGrow: 1 }}>
              <NovelCard novel={n} onPress={() => router.push(`/novel/${n.id}`)} />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
