// app/index.tsx
import { useAuth } from "@/stores/authStore";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, hasRestored, user } = useAuth();

  // Wait for restore before deciding
  if (!hasRestored) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href={isAuthenticated ? "/home" : "/(auth)/login"} />;
}
