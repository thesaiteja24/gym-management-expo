import React from "react";
import { ScrollView, Text } from "react-native";

export default function HomeScreen() {
  return (
    <ScrollView style={{ flex: 1 }} className="bg-white p-4 dark:bg-black">
      <Text className="text-xl font-semibold text-black dark:text-white">
        Welcome to Pump!
      </Text>
    </ScrollView>
  );
}
