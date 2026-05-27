import React, { useState } from "react";
import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/store";
import { radii } from "../theme/tokens";
import { Button } from "./ui";
import { api } from "../lib/api";
import { t } from "../theme/i18n";

export default function RatingModal({ visible, onClose, novelId, currentScore }) {
  const colors = useTheme((s) => s.colors)();
  const lang = useTheme((s) => s.language);
  const [score, setScore] = useState(currentScore || 0);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (score === 0) return;
    setBusy(true);
    try {
      await api.post("/ratings", { novel_id: novelId, score });
      onClose(score);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={() => onClose(null)}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
        <View
          testID="rating-modal"
          style={{
            backgroundColor: colors.surface, padding: 24, borderTopLeftRadius: 24, borderTopRightRadius: 24,
            borderWidth: 1, borderColor: colors.border,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: "700" }}>{t(lang, "rateThisNovel")}</Text>
          <Text style={{ color: colors.textDim, marginTop: 4, fontSize: 13 }}>One rating per novel — editable.</Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 18, justifyContent: "center" }}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Pressable
                key={s}
                testID={`rating-star-${s}`}
                onPress={() => setScore(s)}
                style={{ padding: 6 }}
              >
                <Ionicons name={s <= score ? "star" : "star-outline"} size={36} color={colors.primary} />
              </Pressable>
            ))}
          </View>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 22 }}>
            <Button title="Cancel" variant="ghost" onPress={() => onClose(null)} style={{ flex: 1 }} testID="rating-cancel" />
            <Button title="Submit" onPress={submit} disabled={busy || score === 0} style={{ flex: 1 }} testID="rating-submit" />
          </View>
        </View>
      </View>
    </Modal>
  );
}
