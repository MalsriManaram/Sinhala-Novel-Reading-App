import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Image, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/theme/store";
import { api } from "../../src/lib/api";
import { Badge, Button } from "../../src/components/ui";
import { radii } from "../../src/theme/tokens";
import { useAuth } from "../../src/lib/auth";
import RatingModal from "../../src/components/RatingModal";
import PaywallSheet from "../../src/components/PaywallSheet";

export default function NovelDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useTheme((s) => s.colors)();
  const { user } = useAuth();
  const [novel, setNovel] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [showRating, setShowRating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  const load = async () => {
    const [n, c, r] = await Promise.all([
      api.get(`/novels/${id}`),
      api.get(`/novels/${id}/chapters`),
      api.get(`/ratings/novel/${id}`).catch(() => ({ data: null })),
    ]);
    setNovel(n.data); setChapters(c.data); setMyRating(r.data);
  };
  useEffect(() => { load(); }, [id]);

  if (!novel) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} testID="novel-detail">
        <View style={{ position: "relative" }}>
          {novel.cover_url ? (
            <Image source={{ uri: novel.cover_url }} style={{ width: "100%", height: 360 }} />
          ) : null}
          <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "60%", backgroundColor: "rgba(11,12,16,0)" }} />
          <Pressable
            onPress={() => router.back()}
            testID="novel-back"
            style={{
              position: "absolute", top: 12, left: 12, width: 36, height: 36, borderRadius: 18,
              backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center",
            }}
          >
            <Ionicons name="chevron-back" size={18} color="#fff" />
          </Pressable>
        </View>

        <View style={{ padding: 22, marginTop: -42 }}>
          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <Badge label={novel.category} tone="gold" />
            {novel.status === "upcoming" && <Badge label="Upcoming" tone="pink" />}
          </View>
          <Text style={{ color: colors.text, fontSize: 28, fontWeight: "700", marginTop: 8 }}>
            {novel.title}
          </Text>
          <Text style={{ color: colors.textDim, marginTop: 4 }}>by {novel.author}</Text>

          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
              <Ionicons name="star" size={14} color={colors.primary} />
              <Text style={{ color: colors.text, fontWeight: "700" }}>{novel.avg_rating?.toFixed(1) || "0.0"}</Text>
              <Text style={{ color: colors.textDim, fontSize: 12 }}>({novel.rating_count})</Text>
            </View>
            <Text style={{ color: colors.textDim }}>·</Text>
            <Text style={{ color: colors.textDim, fontSize: 12 }}>{chapters.length} chapters</Text>
          </View>

          <Text style={{ color: colors.text, marginTop: 16, lineHeight: 22 }}>{novel.synopsis}</Text>

          <View style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
            {chapters[0] && (
              <Button
                title="Start reading"
                onPress={() => router.push(`/reader/${chapters[0].id}`)}
                style={{ flex: 1 }}
                testID="novel-start-reading"
              />
            )}
            <Button
              title={myRating ? `Rated ${myRating.score}★` : "Rate"}
              variant="ghost"
              onPress={() => setShowRating(true)}
              testID="novel-rate-btn"
            />
          </View>

          <Text style={{ color: colors.text, fontSize: 11, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 28 }}>
            Chapters
          </Text>
          <View style={{ marginTop: 10, gap: 6 }}>
            {chapters.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  if (c.is_premium && !user?.premium_status) {
                    router.push(`/reader/${c.id}`); // reader handles ad unlock UI
                  } else {
                    router.push(`/reader/${c.id}`);
                  }
                }}
                testID={`chapter-row-${c.id}`}
                style={{
                  flexDirection: "row", alignItems: "center", gap: 10,
                  padding: 12, borderRadius: radii.md,
                  borderWidth: 1, borderColor: colors.border,
                }}
              >
                <Text style={{ color: colors.primary, fontWeight: "700", width: 22 }}>{c.chapter_number}</Text>
                <Text style={{ color: colors.text, flex: 1 }}>{c.title || "Untitled"}</Text>
                {c.is_premium
                  ? <Ionicons name="lock-closed" size={14} color={colors.primary} />
                  : <Ionicons name="lock-open-outline" size={14} color={colors.textDim} />}
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>

      <RatingModal
        visible={showRating}
        novelId={novel.id}
        currentScore={myRating?.score}
        onClose={async (score) => {
          setShowRating(false);
          if (score) await load();
        }}
      />
      <PaywallSheet visible={showPaywall} onClose={() => setShowPaywall(false)} />
    </SafeAreaView>
  );
}
