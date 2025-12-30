import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity } from "react-native";

export default function Home() {
  return (
    <ScrollView style={{ flex: 1 }} className="bg-white dark:bg-black p-4">
      <TouchableOpacity
        onPress={() => router.push("/workout")}
        className="w-full h-12 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 justify-center"
      >
        <Text className="text-xl font-semibold text-black dark:text-white text-center">
          Ready to Get Pumped?
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
