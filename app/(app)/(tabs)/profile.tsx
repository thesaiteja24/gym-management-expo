import React from "react";
import { ScrollView, Text } from "react-native";

export default function Profile() {
  return (
    <ScrollView style={{ flex: 1 }} className="bg-white dark:bg-black">
      <Text className="text-black dark:text-white">Profile Screen</Text>
    </ScrollView>
  );
}
