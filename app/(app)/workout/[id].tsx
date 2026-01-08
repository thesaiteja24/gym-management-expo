import { ExerciseType, useExercise } from "@/stores/exerciseStore";
import { useWorkout } from "@/stores/workoutStore";
import {
  formatDurationFromDates,
  formatSeconds,
  formatTimeAgo,
} from "@/utils/time";
import { calculateWorkoutMetrics } from "@/utils/workout";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function WorkoutDetails() {
  /* Local State */
  const { id } = useLocalSearchParams<{ id: string }>();
  const safeAreaInsets = useSafeAreaInsets();

  /* Store Related State */
  const { workoutHistory } = useWorkout();
  const { exerciseList } = useExercise();

  /* Derived State */
  const exerciseTypeMap = useMemo(() => {
    const map = new Map<string, ExerciseType>();
    exerciseList.forEach((ex) => {
      map.set(ex.id, ex.exerciseType);
    });
    return map;
  }, [exerciseList]);

  const workout = useMemo(
    () => workoutHistory.find((w) => w.id === id),
    [workoutHistory, id],
  );

  if (!workout) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-lg text-neutral-500">Workout not found</Text>
      </View>
    );
  }

  const duration = formatDurationFromDates(workout.startTime, workout.endTime);

  const timeAgo = formatTimeAgo(workout.endTime);

  const { tonnage, completedSets } = calculateWorkoutMetrics(
    workout,
    exerciseTypeMap,
  );

  /* UI Rendering */
  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={["bottom"]}
      className="bg-white dark:bg-black"
    >
      <ScrollView className="flex-1 bg-white p-4 dark:bg-black">
        {/* Header */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-black dark:text-white">
            {workout.title || "Workout"}
          </Text>

          <Text className="mt-1 text-base text-neutral-500 dark:text-neutral-400">
            {timeAgo} · {duration} · {tonnage.toLocaleString()} kg ·{" "}
            {completedSets} sets
          </Text>
        </View>

        {/* Exercises */}
        {workout.exercises.map((ex: any) => (
          <View
            key={ex.id}
            className="mb-6 rounded-2xl border border-neutral-200 p-4 dark:border-neutral-800"
          >
            {/* Exercise header */}
            <View className="mb-3 flex-row items-center gap-3">
              <Image
                source={ex.exercise.thumbnailUrl}
                style={{ width: 48, height: 48, borderRadius: 999 }}
              />

              <Text className="text-xl font-semibold text-black dark:text-white">
                {ex.exercise.title}
              </Text>
            </View>

            {/* Sets */}
            {ex.sets.map((set: any, index: number) => (
              <View key={set.id} className="flex-row items-center py-2">
                {/* Set label */}
                <Text className="flex-1 text-left text-base text-neutral-500">
                  Set {index + 1}
                </Text>

                {/* Value */}
                <Text className="flex-1 text-left text-base font-semibold text-black dark:text-white">
                  {set.weight && set.reps
                    ? `${set.weight} X ${set.reps}`
                    : set.durationSeconds
                      ? `${set.durationSeconds}s`
                      : `${set.reps} reps`}
                </Text>

                {/* Rest */}
                <Text className="flex-1 text-left text-sm text-neutral-500">
                  Rest {formatSeconds(set.restSeconds)}
                </Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
