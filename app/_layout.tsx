import { CustomToast } from "@/components/CustomToast";
import { OtaUpdateModal } from "@/components/OtaUpdateModal";
import { useAuth } from "@/stores/authStore";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useSegments } from "expo-router";
import * as Updates from "expo-updates";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StatusBar,
  View,
  useColorScheme,
} from "react-native";
import Toast from "react-native-toast-message";
import "./globals.css";

// Keep splash visible until we explicitly hide it
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const theme = useColorScheme();
  const segments = useSegments();

  const [fontsLoaded] = useFonts({
    Monoton: require("../assets/fonts/Monoton-Regular.ttf"),
  });

  const restoreFromStorage = useAuth((s) => s.restoreFromStorage);
  const hasRestored = useAuth((s) => s.hasRestored);

  const [otaChecked, setOtaChecked] = useState(false);
  const [showOtaModal, setShowOtaModal] = useState(false);

  const isAuthRoute = segments[0] === "(auth)";

  // 1️⃣ Restore auth state
  useEffect(() => {
    restoreFromStorage();
  }, [restoreFromStorage]);

  // 2️⃣ OTA check (skip auth routes)
  useEffect(() => {
    async function checkOTA() {
      if (isAuthRoute) {
        setOtaChecked(true);
        return;
      }

      try {
        const update = await Updates.checkForUpdateAsync();

        if (update.isAvailable) {
          setShowOtaModal(true);
          setOtaChecked(true); // 🔑 unblock splash
          return;
        }
      } catch (e) {
        console.log("OTA check failed:", e);
      }

      setOtaChecked(true);
    }

    checkOTA();
  }, [isAuthRoute]);

  // 3️⃣ Hide splash only when ALL boot tasks finish
  useEffect(() => {
    if (fontsLoaded && hasRestored && otaChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hasRestored, otaChecked]);

  // 4️⃣ Loading fallback (rarely visible, but safe)
  if (!fontsLoaded || !hasRestored || !otaChecked) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator />
      </View>
    );
  }

  // 5️⃣ App UI
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

      <OtaUpdateModal
        visible={showOtaModal}
        onLater={() => {
          setShowOtaModal(false);
        }}
        onRestart={async () => {
          await Updates.fetchUpdateAsync();
          await Updates.reloadAsync();
        }}
      />
    </>
  );
}
