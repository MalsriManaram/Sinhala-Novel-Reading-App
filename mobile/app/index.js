/**
 * Entry router — routes to auth or main tabs depending on session.
 */
import React, { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import { useAuth } from "../src/lib/auth";
import { useTheme } from "../src/theme/store";

export default function Index() {
  const { user, loading } = useAuth();
  const colors = useTheme((s) => s.colors)();
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }
  return <Redirect href={user ? "/(tabs)/home" : "/(auth)/login"} />;
}
