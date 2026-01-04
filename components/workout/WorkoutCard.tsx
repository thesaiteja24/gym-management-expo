import { WorkoutHistoryItem } from "@/stores/workoutStore";
import { formatDurationFromDates, formatTimeAgo } from "@/utils/time";
import { calculateWorkoutVolume } from "@/utils/workout";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function WorkoutCard(workout: WorkoutHistoryItem) {
  const duration = formatDurationFromDates(workout.startTime, workout.endTime);
  const timeAgo = formatTimeAgo(workout.endTime);
  const volume = calculateWorkoutVolume(workout);

  const previewExercises = workout.exercises.slice(0, 3);
  const remaining = workout.exercises.length - previewExercises.length;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/(app)/workout/${workout.id}`)}
      className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Header */}
      <View className="mb-3 flex-row items-start justify-between">
        <View>
          <Text className="text-xl font-semibold text-black dark:text-white">
            {workout.title || "Workout"}
          </Text>

          <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {timeAgo}
          </Text>
        </View>

        <Text className="text-lg font-semibold text-blue-500">
          <Text className="text-lg font-semibold text-black dark:text-white">
            Duration:
          </Text>{" "}
          {duration}
        </Text>
      </View>

      <Text className="mb-3 text-lg font-medium text-neutral-600 dark:text-neutral-400">
        Volume: {volume.toLocaleString()} kg
      </Text>

      {/* Exercise preview */}
      {previewExercises.map((ex: any) => (
        <View key={ex.id} className="mb-2 flex-row items-center gap-3">
          <Image
            source={ex.exercise.thumbnailUrl}
            style={{ width: 44, height: 44, borderRadius: 999 }}
            contentFit="cover"
          />

          <Text
            numberOfLines={1}
            className="flex-1 text-lg font-semibold text-black dark:text-white"
          >
            {ex.sets.length} sets of {ex.exercise.title}
          </Text>
        </View>
      ))}

      {remaining > 0 && (
        <Text className="mt-1 text-center text-lg text-blue-500">
          See {remaining} more exercise{remaining > 1 ? "s" : ""}
        </Text>
      )}
    </TouchableOpacity>
  );
}
