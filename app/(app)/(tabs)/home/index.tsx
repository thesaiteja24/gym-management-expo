import { useWorkout } from "@/stores/workoutStore";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Home() {
  const { activeWorkout, startWorkout, endWorkout } = useWorkout();
  return (
    <ScrollView style={{ flex: 1 }} className="bg-white dark:bg-black p-4">
      <View className="flex flex-row gap-4">
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => {
              startWorkout();
              router.push("/workout");
            }}
            className="w-full h-12 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 justify-center"
          >
            <Text className="text-xl font-semibold text-black dark:text-white text-center">
              {activeWorkout ? "Continue the Pump" : "Ready to Get Pumped?"}
            </Text>
          </TouchableOpacity>
        </View>

        {activeWorkout && (
          <View className="flex-1 max-w-[35%]">
            <TouchableOpacity
              onPress={() => {
                endWorkout();
              }}
              className="w-full h-12 rounded-2xl border border-red-200/60 dark:border-red-800 bg-white dark:bg-neutral-900 justify-center"
            >
              <Text className="text-xl font-semibold text-red-600 text-center">
                Discard
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
