import React from "react";
import { ScrollView, Text } from "react-native";

export default function Workout() {
  return (
    <ScrollView style={{ flex: 1 }} className="bg-white dark:bg-black">
      <Text className="text-black dark:text-white">Workout Screen</Text>
    </ScrollView>
  );
}
