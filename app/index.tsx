import { useAuth } from "@/stores/authStore";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const hasRestored = useAuth((s) => s.hasRestored);

  if (!hasRestored) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Redirect href={isAuthenticated ? "/(app)/(tabs)/home" : "/(auth)/login"} />
  );
}
