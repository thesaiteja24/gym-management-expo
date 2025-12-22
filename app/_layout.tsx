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

// ─────────────────────────────────────────────
// Keep splash until we explicitly release it
// ─────────────────────────────────────────────
SplashScreen.preventAutoHideAsync();

type UpdateState = "idle" | "downloading" | "restarting";

export default function RootLayout() {
  const theme = useColorScheme();
  const segments = useSegments();

  // ───── Fonts ─────
  const [fontsLoaded] = useFonts({
    Monoton: require("../assets/fonts/Monoton-Regular.ttf"),
  });

  // ───── Auth restore ─────
  const restoreFromStorage = useAuth((s) => s.restoreFromStorage);
  const hasRestored = useAuth((s) => s.hasRestored);

  // ───── OTA state ─────
  const [otaChecked, setOtaChecked] = useState(false);
  const [showOtaModal, setShowOtaModal] = useState(false);
  const [updateState, setUpdateState] = useState<UpdateState>("idle");

  const isAuthRoute = segments[0] === "(auth)";

  // 1️⃣ Restore auth
  useEffect(() => {
    restoreFromStorage();
  }, [restoreFromStorage]);

  // 2️⃣ Check OTA (skip auth routes)
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
          setOtaChecked(true); // 🔑 never block splash
          return;
        }
      } catch (e) {
        console.log("OTA check failed:", e);
      }

      setOtaChecked(true);
    }

    checkOTA();
  }, [isAuthRoute]);

  // 3️⃣ Release splash ONLY when all boot work is done
  useEffect(() => {
    if (fontsLoaded && hasRestored && otaChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, hasRestored, otaChecked]);

  // 4️⃣ Fallback loader (normally never visible)
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

      {/* OTA Modal */}
      <OtaUpdateModal
        visible={showOtaModal}
        state={updateState}
        onLater={() => {
          if (updateState !== "idle") return;
          setShowOtaModal(false);
        }}
        onRestart={async () => {
          try {
            setUpdateState("downloading");
            await Updates.fetchUpdateAsync();

            setUpdateState("restarting");
            await Updates.reloadAsync();
          } catch (e) {
            console.log("OTA update failed:", e);
            setUpdateState("idle");
          }
        }}
      />
    </>
  );
}
