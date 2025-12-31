import { DisplayDuration } from "@/components/DisplayDuration";
import { useWorkout } from "@/stores/workoutStore";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";

export default function index() {
  const isDark = useColorScheme() === "dark";
  const activeWorkout = useWorkout((s) => s.activeWorkout);
  const setExerciseSelection = useWorkout((s) => s.setExerciseSelection);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Top Section displays duration, volume and muscle heatmap */}
      <View className="mb-6 flex flex-row gap-2 border-b border-neutral-200 p-4 pb-4 dark:border-neutral-800">
        <Ionicons
          name="hourglass-outline"
          size={24}
          color={isDark ? "white" : "black"}
        />

        {activeWorkout && (
          <DisplayDuration startTime={activeWorkout.startTime} />
        )}
      </View>

      {/* Add Exercise Button */}
      <View className="flex-1">
        <TouchableOpacity
          onPress={() => {
            setExerciseSelection(true); // setting exercise selection true
            router.push("/(app)/(tabs)/exercises");
          }}
          className="h-12 w-full justify-center rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-900"
        >
          <Text className="text-center text-xl font-semibold text-black dark:text-white">
            Add an Exercise
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
