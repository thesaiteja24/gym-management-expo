import { useAuth } from "@/stores/authStore";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

SplashScreen.preventAutoHideAsync().catch(() => {});

type Props = {
  children: React.ReactNode;
  redirectTo?: string;
  Loader?: React.FC;
};

export const AuthGuard: React.FC<Props> = ({
  children,
  redirectTo = "/login",
  Loader,
}) => {
  const router = useRouter();

  const restoreFromStorage = useAuth((s) => s.restoreFromStorage);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const isLoading = useAuth((s) => s.isLoading);

  const [restored, setRestored] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await restoreFromStorage();
      } catch (err) {
        // ignore
      } finally {
        if (mounted) setRestored(true);
        SplashScreen.hideAsync().catch(() => {});
      }
    })();
    return () => {
      mounted = false;
    };
  }, [restoreFromStorage]);

  useEffect(() => {
    if (restored && !isLoading) {
      if (!isAuthenticated) {
        router.replace(redirectTo as any);
      }
    }
  }, [restored, isLoading, isAuthenticated, router, redirectTo]);

  if (!restored || isLoading) {
    if (Loader) return <Loader />;
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
};

export default AuthGuard;
