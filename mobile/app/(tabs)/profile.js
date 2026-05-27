import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, Switch } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/lib/auth";
import { useTheme } from "../../src/theme/store";
import { radii } from "../../src/theme/tokens";
import { Button, Badge, GlassCard } from "../../src/components/ui";
import { api } from "../../src/lib/api";
import { t } from "../../src/theme/i18n";
import PaywallSheet from "../../src/components/PaywallSheet";
import { purgeAllOffline } from "../../src/lib/offline";

export default function Profile() {
  const router = useRouter();
  const { user, signOut, bootstrap } = useAuth();
  const colors = useTheme((s) => s.colors)();
  const mode = useTheme((s) => s.mode);
  const toggleTheme = useTheme((s) => s.toggle);
  const lang = useTheme((s) => s.language);
  const setLanguage = useTheme((s) => s.setLanguage);

  const [showPaywall, setShowPaywall] = useState(false);
  const [busy, setBusy] = useState(false);

  const cancel = async () => {
    setBusy(true);
    try {
      await api.post("/subscriptions/cancel");
      await purgeAllOffline();
      await bootstrap();
    } finally { setBusy(false); }
  };

  return (
    <SafeAreaView edges={["top"]} style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 120 }} testID="profile-screen">
        <Text style={{ color: colors.primary, fontSize: 10, letterSpacing: 4, textTransform: "uppercase" }}>
          Account
        </Text>
        <Text style={{ color: colors.text, fontSize: 32, fontWeight: "700", marginTop: 6 }}>
          {user?.name || user?.email || user?.phone || "Reader"}
        </Text>

        <GlassCard style={{ marginTop: 18, flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Ionicons name={user?.premium_status ? "sparkles" : "sparkles-outline"} size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: "600" }}>
              {user?.premium_status ? "Premium membership" : "Free membership"}
            </Text>
            <Text style={{ color: colors.textDim, fontSize: 12, marginTop: 2 }}>
              {user?.premium_status
                ? "Offline reading, ad-free, unlimited chapters."
                : "Watch a rewarded ad to read premium chapters."}
            </Text>
          </View>
          {user?.premium_status ? (
            <Button title="Cancel" variant="ghost" compact onPress={cancel} disabled={busy} testID="profile-cancel-btn" />
          ) : (
            <Button title="Upgrade" compact onPress={() => setShowPaywall(true)} testID="profile-upgrade-btn" />
          )}
        </GlassCard>

        <Text style={{ color: colors.text, fontSize: 14, fontWeight: "600", marginTop: 24, letterSpacing: 1.4, textTransform: "uppercase", fontSize: 11 }}>
          {t(lang, "settings")}
        </Text>

        <View style={{ marginTop: 12, gap: 8 }}>
          {/* Theme */}
          <Row label={t(lang, "theme")} icon={mode === "dark" ? "moon-outline" : "sunny-outline"}>
            <Switch
              testID="settings-theme-toggle"
              value={mode === "dark"}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: "rgba(199,146,62,0.55)" }}
              thumbColor={mode === "dark" ? colors.primary : colors.text}
            />
          </Row>
          {/* Language */}
          <Row label={t(lang, "language")} icon="language-outline">
            <View style={{ flexDirection: "row", gap: 6 }}>
              {[
                { code: "en", label: "EN" },
                { code: "si", label: "සිං" },
              ].map((l) => (
                <Pressable
                  key={l.code}
                  onPress={() => setLanguage(l.code)}
                  testID={`settings-lang-${l.code}`}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999,
                    backgroundColor: lang === l.code ? "rgba(199,146,62,0.18)" : "transparent",
                    borderWidth: 1, borderColor: lang === l.code ? colors.primary : colors.border,
                  }}
                >
                  <Text style={{ color: lang === l.code ? colors.primary : colors.text, fontSize: 12, fontWeight: "600" }}>{l.label}</Text>
                </Pressable>
              ))}
            </View>
          </Row>
        </View>

        <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 24 }}>
          Provider · <Text style={{ color: colors.text }}>{user?.provider}</Text>
        </Text>
        <Text style={{ color: colors.textDim, fontSize: 11 }}>
          Country · <Text style={{ color: colors.text }}>{user?.country_code || "—"}</Text>
        </Text>
        <Text style={{ color: colors.textDim, fontSize: 11, marginBottom: 18 }}>
          Joined · <Text style={{ color: colors.text }}>{user?.created_at?.slice(0, 10)}</Text>
        </Text>

        <Button
          title={t(lang, "signOut")}
          variant="ghost"
          icon={<Ionicons name="log-out-outline" size={14} color={colors.text} />}
          onPress={async () => { await signOut(); router.replace("/(auth)/login"); }}
          testID="profile-signout"
        />

        <Text style={{ color: colors.textDim, fontSize: 11, marginTop: 22, textAlign: "center" }}>
          v1.0.0 · screenshots blocked · AES-256-GCM offline
        </Text>
      </ScrollView>

      <PaywallSheet
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSubscribed={async () => { setShowPaywall(false); await bootstrap(); }}
      />
    </SafeAreaView>
  );
}

function Row({ label, icon, children }) {
  const colors = useTheme((s) => s.colors)();
  return (
    <View
      style={{
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingHorizontal: 14, paddingVertical: 12,
        borderWidth: 1, borderColor: colors.border, borderRadius: 14,
      }}
    >
      <Ionicons name={icon} size={16} color={colors.textDim} />
      <Text style={{ color: colors.text, flex: 1 }}>{label}</Text>
      {children}
    </View>
  );
}
