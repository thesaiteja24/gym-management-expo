import { useWorkout } from "@/stores/workoutStore";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import React, { useMemo } from "react";
import { ScrollView, Text, View } from "react-native";

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.floor(ms / 60000);

  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function formatTimeAgo(dateString: string) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function calculateVolume(workout: any) {
  let volume = 0;

  workout.exercises.forEach((ex: any) => {
    ex.sets.forEach((set: any) => {
      if (set.weight && set.reps) {
        volume += Number(set.weight) * set.reps;
      }
    });
  });

  return volume;
}

export default function WorkoutDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { workoutHistory } = useWorkout();

  const workout = useMemo(
    () => workoutHistory.find((w: any) => w.id === id),
    [workoutHistory, id],
  );

  if (!workout) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-lg text-neutral-500">Workout not found</Text>
      </View>
    );
  }

  const duration = formatDuration(workout.startTime, workout.endTime);
  const timeAgo = formatTimeAgo(workout.endTime);
  const volume = calculateVolume(workout);

  return (
    <ScrollView className="flex-1 bg-white p-4 dark:bg-black">
      {/* Header */}
      <View className="mb-6">
        <Text className="text-2xl font-bold text-black dark:text-white">
          {workout.title || "Workout"}
        </Text>

        <Text className="mt-1 text-base text-neutral-500 dark:text-neutral-400">
          {timeAgo} · {duration} · {volume.toLocaleString()} kg
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
            <View
              key={set.id}
              className="flex-row items-center justify-between py-2"
            >
              <Text className="text-base text-neutral-500">
                Set {index + 1}
              </Text>

              {set.weight && set.reps ? (
                <Text className="text-base font-semibold text-black dark:text-white">
                  {set.weight} × {set.reps}
                </Text>
              ) : set.durationSeconds ? (
                <Text className="text-base font-semibold text-black dark:text-white">
                  {set.durationSeconds}s
                </Text>
              ) : (
                <Text className="text-base font-semibold text-black dark:text-white">
                  {set.reps}
                </Text>
              )}

              <Text className="text-sm text-neutral-500">
                Rest {set.restSeconds}s
              </Text>
            </View>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}
