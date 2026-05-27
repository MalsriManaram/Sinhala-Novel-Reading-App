import React, { useEffect, useRef, useState } from "react";
import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/theme/store";
import { useAuth } from "../../src/lib/auth";
import { api } from "../../src/lib/api";
import { Button, Badge } from "../../src/components/ui";
import { radii } from "../../src/theme/tokens";
import { RewardedAd } from "../../src/lib/integrations";
import { downloadChapter, readOfflineChapter, isChapterDownloaded } from "../../src/lib/offline";
import TTSPlayer from "../../src/components/TTSPlayer";
import RatingModal from "../../src/components/RatingModal";
import PaywallSheet from "../../src/components/PaywallSheet";

export default function Reader() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const colors = useTheme((s) => s.colors)();
  const { user, bootstrap } = useAuth();

  const [chapter, setChapter] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [fontSize, setFontSize] = useState(17);
  const [sentences, setSentences] = useState([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const scrollRef = useRef(null);

  const load = async () => {
    const r = await api.get(`/chapters/${id}`);
    setChapter(r.data);
    setDownloaded(await isChapterDownloaded(parseInt(id, 10)));
    if (r.data.novel_id) {
      const sib = await api.get(`/novels/${r.data.novel_id}/chapters`);
      setChapters(sib.data);
    }
  };
  useEffect(() => { load(); }, [id]);

  const watchAdToUnlock = async () => {
    setBusy(true);
    try {
      const reward = await RewardedAd.show();
      await api.post("/ads/unlock", { chapter_id: parseInt(id, 10), ad_reward_token: reward.token });
      await load();
    } catch (e) {
      // ignore — toast in real app
    } finally { setBusy(false); }
  };

  const download = async () => {
    if (!user?.premium_status) { setShowPaywall(true); return; }
    setBusy(true);
    try {
      await downloadChapter(parseInt(id, 10));
      setDownloaded(true);
    } finally { setBusy(false); }
  };

  if (!chapter) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  const isLastChapter = chapters.length > 0 && chapters[chapters.length - 1].id === chapter.id;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={["top"]}>
      <View style={{
        flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: colors.border,
      }}>
        <Pressable onPress={() => router.back()} testID="reader-back" style={{ padding: 6 }}>
          <Ionicons name="chevron-back" size={20} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, alignItems: "center" }}>
          <Text style={{ color: colors.textDim, fontSize: 11, letterSpacing: 1 }}>CHAPTER {chapter.chapter_number}</Text>
          <Text style={{ color: colors.text, fontWeight: "600" }}>{chapter.title || "Untitled"}</Text>
        </View>
        <Pressable onPress={() => setFontSize((s) => Math.max(13, s - 1))} style={{ padding: 6 }} testID="reader-font-smaller">
          <Text style={{ color: colors.text, fontSize: 12 }}>A-</Text>
        </Pressable>
        <Pressable onPress={() => setFontSize((s) => Math.min(28, s + 1))} style={{ padding: 6 }} testID="reader-font-bigger">
          <Text style={{ color: colors.text, fontSize: 16 }}>A+</Text>
        </Pressable>
      </View>

      {chapter.locked ? (
        <ScrollView contentContainerStyle={{ padding: 28, paddingBottom: 160, alignItems: "center" }}>
          <View style={{
            backgroundColor: "rgba(199,146,62,0.12)", borderColor: colors.primary, borderWidth: 1,
            borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5, marginTop: 22,
          }}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: "700", letterSpacing: 1.5 }}>PREMIUM CHAPTER</Text>
          </View>
          <Ionicons name="lock-closed" size={48} color={colors.primary} style={{ marginTop: 22 }} />
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700", marginTop: 14, textAlign: "center" }}>
            This chapter is locked.
          </Text>
          <Text style={{ color: colors.textDim, marginTop: 6, textAlign: "center", maxWidth: 280 }}>
            Watch a rewarded ad to unlock it for 24 hours, or subscribe for unlimited access.
          </Text>
          <View style={{ gap: 10, marginTop: 22, width: "100%" }}>
            <Button title="Watch ad to unlock" onPress={watchAdToUnlock} disabled={busy} testID="reader-ad-unlock" />
            <Button title="Subscribe" variant="ghost" onPress={() => setShowPaywall(true)} testID="reader-subscribe-btn" />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 16, paddingBottom: 200 }}
          testID="reader-content"
        >
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            {chapter.is_premium && <Badge label="Premium" tone="gold" />}
            <Pressable onPress={download} testID="reader-download-btn">
              <Badge label={downloaded ? "Downloaded" : "Download"} tone={downloaded ? "green" : "neutral"} />
            </Pressable>
          </View>
          {sentences.length === 0 ? (
            chapter.content.split("\n").map((p, i) => (
              <Text key={i} style={{ color: colors.text, fontSize: fontSize, lineHeight: fontSize * 1.7, marginBottom: 12 }}>
                {p}
              </Text>
            ))
          ) : (
            <Text style={{ color: colors.text, fontSize, lineHeight: fontSize * 1.7 }}>
              {sentences.map((s, i) => (
                <Text key={i} style={{ backgroundColor: i === activeIdx ? colors.highlight : "transparent" }}>
                  {s.text + "  "}
                </Text>
              ))}
            </Text>
          )}

          {isLastChapter && (
            <View style={{ marginTop: 26, padding: 18, borderRadius: radii.lg, borderWidth: 1, borderColor: colors.border }}>
              <Text style={{ color: colors.text, fontWeight: "700" }}>You finished the latest chapter.</Text>
              <Text style={{ color: colors.textDim, marginTop: 4 }}>Rate the novel — it helps other readers find great Sinhala stories.</Text>
              <Button title="Rate this novel" onPress={() => setShowRating(true)} style={{ marginTop: 12, alignSelf: "flex-start" }} testID="reader-rate-btn" compact />
            </View>
          )}
        </ScrollView>
      )}

      {!chapter.locked && (
        <TTSPlayer
          text={chapter.content}
          onProgressChange={(idx, ofs) => { setActiveIdx(idx); if (sentences.length === 0 && ofs) setSentences(ofs); }}
        />
      )}

      <RatingModal
        visible={showRating}
        novelId={chapter.novel_id}
        onClose={() => setShowRating(false)}
      />
      <PaywallSheet
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribed={async () => { setShowPaywall(false); await bootstrap(); await load(); }}
      />
    </SafeAreaView>
  );
}
