import AuthGuard from "@/components/AuthGuard";
import { Stack } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <AuthGuard redirectTo="/(auth)/login">
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthGuard>
  );
}
