import { useAuth } from "@/stores/authStore";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const hasRestored = useAuth((s) => s.hasRestored);
  const hasSeenOnboarding = useAuth((s) => s.hasSeenOnboarding);

  if (!hasRestored) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  console.log("hasSeenOnboarding", hasSeenOnboarding);
  if (!isAuthenticated) {
    return <Redirect href="/(auth)/onboarding" />;
  }

  return (
    <Redirect href={isAuthenticated ? "/(app)/(tabs)/home" : "/(auth)/login"} />
  );
}
