import AuthGuard from "@/components/AuthGuard";
import { Tabs } from "expo-router";
import React from "react";

export default function AppLayout() {
  return (
    <AuthGuard redirectTo="/login">
      <Tabs screenOptions={{ headerShown: false }}>
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
          }}
        />
        <Tabs.Screen
          name="workouts/index"
          options={{
            title: "Workouts",
          }}
        />
        <Tabs.Screen
          name="profile/index"
          options={{
            title: "Profile",
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}
