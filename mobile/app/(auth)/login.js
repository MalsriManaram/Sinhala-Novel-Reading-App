import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../src/lib/auth";
import { useTheme } from "../../src/theme/store";
import { radii } from "../../src/theme/tokens";
import { Button } from "../../src/components/ui";
import { t } from "../../src/theme/i18n";
import { GoogleAuth, AppleAuth } from "../../src/lib/integrations";

export default function Login() {
  const router = useRouter();
  const colors = useTheme((s) => s.colors)();
  const lang = useTheme((s) => s.language);
  const { requestOTP, verifyOTP, socialLogin } = useAuth();

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState(null);

  const sendOtp = async () => {
    setBusy(true);
    try {
      const r = await requestOTP(phone);
      setOtpSent(true);
      setHint(`Mock code: ${r.mocked_code}`); // helps dev/demo
    } finally { setBusy(false); }
  };

  const verify = async () => {
    setBusy(true);
    try {
      await verifyOTP(phone, code);
      router.replace("/(tabs)/home");
    } finally { setBusy(false); }
  };

  const social = async (provider) => {
    setBusy(true);
    try {
      // Mocked: real impl uses expo-auth-session/google or expo-apple-authentication
      const mock = provider === "google" ? await GoogleAuth.signIn() : await AppleAuth.signIn();
      await socialLogin(provider);
      router.replace("/(tabs)/home");
    } finally { setBusy(false); }
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: "center", backgroundColor: colors.bg }}
      keyboardShouldPersistTaps="handled"
    >
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1489846986031-7cea03ab8fd0?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMzN8MHwxfHNlYXJjaHwxfHxteXN0ZXJ5JTIwdGhyaWxsZXIlMjBkYXJrJTIwY2luZW1hdGljJTIwcG9zdGVyfGVufDB8fHx8MTc3OTg3OTA2NXww&ixlib=rb-4.1.0&q=85" }}
        style={{ width: "100%", aspectRatio: 1.4, borderRadius: 24, opacity: 0.85 }}
      />
      <Text style={{ color: colors.primary, marginTop: 28, letterSpacing: 4, textTransform: "uppercase", fontSize: 10 }}>
        Sinhala Novels
      </Text>
      <Text style={{ color: colors.text, fontSize: 30, fontWeight: "700", marginTop: 4 }}>
        Welcome back.
      </Text>
      <Text style={{ color: colors.textDim, marginTop: 6 }}>
        Sign in with your phone, Google or Apple ID.
      </Text>

      <View style={{ marginTop: 24, gap: 10 }}>
        <Text style={{ color: colors.textDim, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" }}>
          {t(lang, "phone")}
        </Text>
        <TextInput
          testID="login-phone"
          placeholder="+947XXXXXXXX"
          placeholderTextColor={colors.textDim}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={{
            color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md,
            paddingHorizontal: 14, paddingVertical: 12,
          }}
        />
        {!otpSent ? (
          <Button title={t(lang, "sendOTP")} onPress={sendOtp} disabled={busy || !phone} testID="login-send-otp" />
        ) : (
          <>
            <Text style={{ color: colors.textDim, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", marginTop: 4 }}>
              {t(lang, "otp")}
            </Text>
            <TextInput
              testID="login-otp"
              placeholder="123456"
              placeholderTextColor={colors.textDim}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              style={{
                color: colors.text, borderColor: colors.border, borderWidth: 1, borderRadius: radii.md,
                paddingHorizontal: 14, paddingVertical: 12, letterSpacing: 4,
              }}
            />
            {hint ? <Text style={{ color: colors.textDim, fontSize: 11 }}>{hint}</Text> : null}
            <Button title={t(lang, "verify")} onPress={verify} disabled={busy || !code} testID="login-verify" />
          </>
        )}
      </View>

      <Text style={{ color: colors.textDim, textAlign: "center", marginVertical: 18 }}>{t(lang, "or")}</Text>

      <View style={{ gap: 10 }}>
        <Button
          title={t(lang, "continueWithGoogle")}
          variant="ghost"
          onPress={() => social("google")}
          icon={<Ionicons name="logo-google" size={16} color={colors.text} />}
          testID="login-google"
        />
        <Button
          title={t(lang, "continueWithApple")}
          variant="ghost"
          onPress={() => social("apple")}
          icon={<Ionicons name="logo-apple" size={16} color={colors.text} />}
          testID="login-apple"
        />
      </View>

      <Text style={{ color: colors.textDim, fontSize: 11, textAlign: "center", marginTop: 24 }}>
        All third-party auth (Google · Apple · Dialog Ideamart) is mocked in this build.
      </Text>
    </ScrollView>
  );
}
