import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, Image } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/theme/store";
import { radii } from "../../src/theme/tokens";
import { api } from "../../src/lib/api";
import { Button, Badge, GlassCard } from "../../src/components/ui";
import { OneSignal } from "../../src/lib/integrations";

export default function Waitlist() {
  const router = useRouter();
  const colors = useTheme((s) => s.colors)();
  const [items, setItems] = useState([]);
  const [reminders, setReminders] = useState([]);

  const load = async () => {
    const [u, r] = await Promise.all([
      api.get("/novels/upcoming"),
      api.get("/reminders/mine").catch(() => ({ data: [] })),
    ]);
    setItems(u.data);
    setReminders(r.data.map((x) => x.novel_id));
  };
  useEffect(() => { load(); }, []);

  const toggleReminder = async (n) => {
    const enabled = !reminders.includes(n.id);
    await api.post("/reminders", { novel_id: n.id, enabled });
    if (enabled && n.release_at) await OneSignal.scheduleReminder(n.title, n.release_at);
    setReminders((s) => enabled ? [...s, n.id] : s.filter((x) => x !== n.id));
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 120 }} testID="waitlist-screen">
        <Text style={{ color: colors.primary, fontSize: 10, letterSpacing: 4, textTransform: "uppercase" }}>
          Coming Soon
        </Text>
        <Text style={{ color: colors.text, fontSize: 32, fontWeight: "700", marginTop: 6 }}>
          Worth the Wait.
        </Text>
        <Text style={{ color: colors.textDim, marginTop: 6 }}>
          Tap "Remind me" — we'll ping you 1 hour before launch.
        </Text>

        <View style={{ marginTop: 22, gap: 14 }}>
          {items.map((n) => (
            <Pressable
              key={n.id}
              onPress={() => router.push(`/novel/${n.id}`)}
              testID={`waitlist-card-${n.id}`}
              style={{ borderRadius: radii.lg, overflow: "hidden", backgroundColor: colors.surface }}
            >
              {n.cover_url ? (
                <Image source={{ uri: n.cover_url }} style={{ width: "100%", height: 220 }} />
              ) : null}
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Badge label={n.category} tone="gold" />
                  {n.release_at && (
                    <Text style={{ color: colors.textDim, fontSize: 11 }}>
                      {new Date(n.release_at).toDateString()}
                    </Text>
                  )}
                </View>
                <Text style={{ color: colors.text, fontSize: 19, fontWeight: "600", marginTop: 8 }}>{n.title}</Text>
                <Text style={{ color: colors.textDim, marginTop: 4 }}>{n.author}</Text>
                <Text numberOfLines={2} style={{ color: colors.textDim, marginTop: 8, lineHeight: 19 }}>
                  {n.synopsis}
                </Text>
                <Button
                  title={reminders.includes(n.id) ? "Reminder on" : "Remind me"}
                  variant={reminders.includes(n.id) ? "primary" : "ghost"}
                  onPress={() => toggleReminder(n)}
                  icon={<Ionicons name={reminders.includes(n.id) ? "notifications" : "notifications-outline"} size={14} color={reminders.includes(n.id) ? "#1A140A" : colors.text} />}
                  testID={`waitlist-remind-${n.id}`}
                  style={{ marginTop: 12, alignSelf: "flex-start" }}
                  compact
                />
              </View>
            </Pressable>
          ))}
          {items.length === 0 && (
            <GlassCard><Text style={{ color: colors.textDim }}>No upcoming novels yet.</Text></GlassCard>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
