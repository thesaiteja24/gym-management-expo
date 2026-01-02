import { useAuth } from "@/stores/authStore";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function SettingsScreen() {
  const logout = useAuth((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  return (
    <View className="flex h-full items-center bg-white p-4 dark:bg-black">
      <TouchableOpacity
        onPress={handleLogout}
        className="flex w-full flex-row items-center justify-start gap-4 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
      >
        <AntDesign name="logout" size={24} color="red" />
        <Text className="text-xl font-semibold text-black dark:text-white">
          Logout{" "}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
