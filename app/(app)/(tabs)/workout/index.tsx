import { useWorkout } from "@/stores/workoutStore";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function WorkoutScreen() {
  const { activeWorkout, endWorkout } = useWorkout();
  return (
    <ScrollView className="flex-1 bg-white p-4 dark:bg-black">
      <View className="flex flex-row gap-4">
        <View className="flex-1">
          <TouchableOpacity
            onPress={() => {
              router.replace("/(app)/workout/start");
            }}
            className="h-12 w-full justify-center rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Text className="text-center text-xl font-semibold text-black dark:text-white">
              {activeWorkout ? "Continue the Pump" : "Ready to Get Pumped?"}
            </Text>
          </TouchableOpacity>
        </View>

        {activeWorkout && (
          <View className="max-w-[35%] flex-1">
            <TouchableOpacity
              onPress={() => {
                endWorkout();
              }}
              className="h-12 w-full justify-center rounded-2xl border border-red-200/60 bg-white dark:border-red-800 dark:bg-neutral-900"
            >
              <Text className="text-center text-xl font-semibold text-red-600">
                Discard
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View className="mt-4">
        <TouchableOpacity
          onPress={() => {
            router.push("/(app)/exercises/");
          }}
          className="h-12 w-full justify-center rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Text className="text-center text-xl font-semibold text-black dark:text-white">
            View Exercise Directory
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
