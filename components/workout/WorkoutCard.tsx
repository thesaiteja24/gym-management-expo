import { ExerciseType } from "@/stores/exerciseStore";
import { WorkoutHistoryItem } from "@/stores/workoutStore";
import { formatDurationFromDates, formatTimeAgo } from "@/utils/time";
import { calculateWorkoutMetrics } from "@/utils/workout";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function WorkoutCard({
  workout,
  exerciseTypeMap,
}: {
  workout: WorkoutHistoryItem;
  exerciseTypeMap: Map<string, ExerciseType>;
}) {
  const duration = formatDurationFromDates(workout.startTime, workout.endTime);
  const timeAgo = formatTimeAgo(workout.endTime);
  const volume = calculateWorkoutMetrics(workout, exerciseTypeMap).tonnage;

  // Guard against missing exercises array
  const exercises = workout.exercises || [];
  const previewExercises = exercises.slice(0, 3);
  const remaining = exercises.length - previewExercises.length;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => {
        router.push(`/(app)/workout/${workout.id}`);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      className="mb-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
    >
      {/* Header */}
      <View className="mb-4 flex-col justify-between gap-2">
        <Text className="line-clamp-1 text-lg font-semibold text-black dark:text-white">
          {workout.title || "Workout"}
        </Text>

        <View className="flex-row items-center justify-between gap-4">
          <Text className="flex-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            {timeAgo}
          </Text>

          <Text className="flex-1 text-base font-semibold text-primary">
            <Text className="text-base font-semibold text-black dark:text-white">
              Duration:
            </Text>{" "}
            {duration}
          </Text>
        </View>
        <View className="flex-row items-center justify-between gap-4">
          <Text className="flex-1 text-base font-medium text-neutral-600 dark:text-neutral-400">
            Volume: {volume} kg
          </Text>
          {/* Need to decide where to show this */}
          {/* <Text className="flex-1 text-base font-semibold text-primary">

            {workout?.user?.firstName + " " + workout?.user?.lastName}
          </Text> */}
        </View>
      </View>

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
            className="flex-1 text-base font-semibold text-black dark:text-white"
          >
            {ex.sets.length} sets of {ex.exercise.title}
          </Text>
        </View>
      ))}

      {remaining > 0 && (
        <Text className="mt-1 text-center text-sm text-primary">
          See {remaining} more exercise{remaining > 1 ? "s" : ""}
        </Text>
      )}
    </TouchableOpacity>
  );
}
