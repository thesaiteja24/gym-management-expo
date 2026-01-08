import AuthGuard from "@/components/auth/AuthGuard";
import { Stack } from "expo-router";
import React from "react";
import { useColorScheme } from "react-native";

export default function AppLayout() {
  return (
    <AuthGuard redirectTo="/(auth)/login">
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor:
              useColorScheme() === "dark" ? "#000000" : "#ffffff",
          },
        }}
      >
        <Stack.Screen name="(tabs)" />
      </Stack>
    </AuthGuard>
  );
}
