import { WorkoutHistoryItem } from "@/stores/workoutStore";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

function formatDuration(start: string, end: string) {
  const ms = new Date(end).getTime() - new Date(start).getTime();
  const minutes = Math.floor(ms / 60000);

  if (minutes < 60) return `${minutes}m`;

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function calculateVolume(workout: WorkoutHistoryItem) {
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

function formatTimeAgo(dateString: string) {
  const now = Date.now();
  const past = new Date(dateString).getTime();
  const diffMs = now - past;

  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days > 1 ? "s" : ""} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

export default function WorkoutCard(workout: WorkoutHistoryItem) {
  const duration = formatDuration(workout.startTime, workout.endTime);
  const timeAgo = formatTimeAgo(workout.endTime);
  const volume = calculateVolume(workout);

  const previewExercises = workout.exercises.slice(0, 3);
  const remaining = workout.exercises.length - previewExercises.length;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => router.push(`/(app)/workout/${workout.id}` as any)}
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
