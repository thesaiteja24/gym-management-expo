// app/_layout.tsx
import { CustomToast } from "@/components/CustomToast";
import { useAuth } from "@/stores/authStore"; // <-- add this
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  StatusBar,
  View,
  useColorScheme,
} from "react-native";
import Toast from "react-native-toast-message";
import "./globals.css";

export default function RootLayout() {
  const theme = useColorScheme();
  const [loaded] = useFonts({
    Monoton: require("../assets/fonts/Monoton-Regular.ttf"),
  });

  const restoreFromStorage = useAuth((s) => s.restoreFromStorage);
  const hasRestored = useAuth((s) => s.hasRestored);

  // Step 1: restore auth info on startup
  useEffect(() => {
    restoreFromStorage();
  }, [restoreFromStorage]);

  // Step 2: wait for fonts
  useEffect(() => {
    if (loaded && hasRestored) {
      SplashScreen.hideAsync();
    }
  }, [loaded, hasRestored]);

  // Step 3: while loading or restoring, keep splash or show spinner
  if (!loaded || !hasRestored) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  // Step 4: render navigation
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <Toast
        config={{
          success: (props) => <CustomToast {...props} type="success" />,
          error: (props) => <CustomToast {...props} type="error" />,
          info: (props) => <CustomToast {...props} type="info" />,
        }}
        topOffset={60}
      />
    </>
  );
}
