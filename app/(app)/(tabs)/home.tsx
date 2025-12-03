import React from "react";
import { ScrollView, Text } from "react-native";

export default function Home() {
  return (
    <ScrollView style={{ flex: 1 }} className="bg-white dark:bg-black">
      <Text className="text-black dark:text-white">Home Screen</Text>
    </ScrollView>
  );
}
