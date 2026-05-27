/**
 * Paywall bottom sheet — picks RevenueCat or Dialog Ideamart based on
 * /subscriptions/paywall-config (server-side geo detection).
 */
import React, { useEffect, useState } from "react";
import { Modal, View, Text, ActivityIndicator } from "react-native";
import { useTheme } from "../theme/store";
import { radii } from "../theme/tokens";
import { api } from "../lib/api";
import { Button, Badge } from "./ui";
import { RevenueCat } from "../lib/integrations";

export default function PaywallSheet({ visible, onClose, onSubscribed }) {
  const colors = useTheme((s) => s.colors)();
  const [cfg, setCfg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState("plans"); // plans | otp
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [pickedPlan, setPickedPlan] = useState(null);

  useEffect(() => {
    if (!visible) return;
    api.get("/subscriptions/paywall-config").then((r) => setCfg(r.data));
  }, [visible]);

  const subscribeRevenueCat = async (plan) => {
    setBusy(true);
    try {
      const purchase = await RevenueCat.purchasePackage(plan.id);
      await api.post("/subscriptions/subscribe", { provider: "revenuecat", plan: plan.id, external_id: purchase.transactionId });
      onSubscribed?.();
    } finally { setBusy(false); }
  };

  const startIdeamart = async (plan) => {
    setPickedPlan(plan); setStep("otp");
  };

  const requestOtp = async () => {
    setBusy(true);
    try {
      await api.post("/subscriptions/otp/request", null, { params: { phone } });
    } finally { setBusy(false); }
  };

  const confirmIdeamart = async () => {
    setBusy(true);
    try {
      await api.post("/subscriptions/subscribe", {
        provider: "ideamart", plan: pickedPlan.id, phone, otp_code: otp,
      });
      onSubscribed?.();
    } finally { setBusy(false); }
  };

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View
          testID="paywall-sheet"
          style={{
            backgroundColor: colors.surface, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            borderWidth: 1, borderColor: colors.border,
          }}
        >
          {!cfg ? (
            <ActivityIndicator color={colors.primary} />
          ) : step === "plans" ? (
            <>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: "700" }}>Unlock everything</Text>
                <Badge label={cfg.provider === "ideamart" ? "Dialog Ideamart" : "RevenueCat"} tone="pink" />
              </View>
              <Text style={{ color: colors.textDim, marginTop: 6 }}>
                Read every chapter, listen offline, no ads — 1-tap cancel any time.
              </Text>
              <View style={{ marginTop: 18, gap: 10 }}>
                {cfg.plans.map((p) => (
                  <View key={p.id}
                    style={{
                      borderColor: colors.border, borderWidth: 1, borderRadius: radii.lg, padding: 14,
                      flexDirection: "row", alignItems: "center", justifyContent: "space-between",
                    }}
                  >
                    <View>
                      <Text style={{ color: colors.text, fontWeight: "600" }}>{p.label}</Text>
                      <Text style={{ color: colors.textDim, fontSize: 12 }}>
                        {p.price_usd ? `US$${p.price_usd}` : `LKR ${p.price_lkr}`}
                      </Text>
                    </View>
                    <Button
                      compact
                      title="Subscribe"
                      testID={`paywall-plan-${p.id}`}
                      onPress={() => cfg.provider === "revenuecat" ? subscribeRevenueCat(p) : startIdeamart(p)}
                      disabled={busy}
                    />
                  </View>
                ))}
              </View>
              <View style={{ marginTop: 16, alignItems: "center" }}>
                <Text style={{ color: colors.textDim, fontSize: 12 }}>Mocked integration · no real charge</Text>
              </View>
              <Button title="Maybe later" variant="ghost" onPress={onClose} style={{ marginTop: 18 }} testID="paywall-dismiss" />
            </>
          ) : (
            <>
              <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>Verify with OTP</Text>
              <Text style={{ color: colors.textDim, marginTop: 6 }}>
                Dialog Ideamart will send a 6-digit code to your mobile.
              </Text>
              <View style={{ marginTop: 12 }}>
                <Text style={{ color: colors.textDim, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" }}>Phone</Text>
                <Text
                  style={{
                    color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
                    paddingHorizontal: 12, paddingVertical: 10, marginTop: 6,
                  }}
                >
                  {phone || "+947…"}
                </Text>
                <Button title="Send OTP" onPress={requestOtp} style={{ marginTop: 10 }} testID="paywall-otp-send" />
              </View>
              <View style={{ marginTop: 14 }}>
                <Text style={{ color: colors.textDim, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" }}>OTP code</Text>
                <Text
                  style={{
                    color: colors.text, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md,
                    paddingHorizontal: 12, paddingVertical: 10, marginTop: 6,
                  }}
                >
                  {otp || "_ _ _ _ _ _"}
                </Text>
                <Button title="Confirm subscription" onPress={confirmIdeamart} style={{ marginTop: 10 }} disabled={busy} testID="paywall-otp-confirm" />
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
