import { useAuth } from "@/stores/authStore";
import { AntDesign } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const logout = useAuth((state) => state.logout);

  const handleLogout = () => {
    logout();
  };

  return (
    <View className="flex items-center  h-full bg-white dark:bg-black p-4">
      <TouchableOpacity
        onPress={handleLogout}
        className="flex flex-row items-center justify-start w-full gap-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm"
      >
        <AntDesign name="logout" size={24} color="red" />
        <Text className="text-black dark:text-white font-semibold text-xl">
          Logout{" "}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
