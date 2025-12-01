import React from "react";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Welcome = () => {
  return (
    <SafeAreaView className="flex h-full items-center justify-between bg-black">
      <TouchableOpacity className="w-full flex justify-end items-end p-4">
        <Text className="text-white">Login</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Welcome;
