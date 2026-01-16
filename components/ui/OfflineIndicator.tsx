import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import React from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/**
 * Displays a banner when the device is offline
 */
export function OfflineIndicator() {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const isOffline = !isConnected || isInternetReachable === false;

  if (!isOffline) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: insets.top,
        left: 0,
        right: 0,
        backgroundColor: "#EF4444",
        paddingVertical: 6,
        paddingHorizontal: 16,
        zIndex: 9999,
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 13,
          fontWeight: "600",
          textAlign: "center",
        }}
      >
        You're offline. Changes will sync when connected.
      </Text>
    </View>
  );
}
