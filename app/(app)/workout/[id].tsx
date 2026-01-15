import { ExerciseType, useExercise } from "@/stores/exerciseStore";
import {
  SetType,
  useWorkout,
  WorkoutLogGroup,
  WorkoutLogSet,
} from "@/stores/workoutStore";
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

/* ───────────────── Group Color Logic (shared with ExerciseRow) ───────────────── */

const GROUP_COLORS = [
  "#4C1D95", // deep purple
  "#7C2D12", // dark orange / brown
  "#14532D", // dark green
  "#7F1D1D", // dark red
  "#1E3A8A", // deep blue
  "#581C87", // violet
  "#0F766E", // teal
  "#1F2937", // slate
];

function hashStringToIndex(str: string, modulo: number) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % modulo;
}

function getGroupColor(groupId: string) {
  const index = hashStringToIndex(groupId, GROUP_COLORS.length);
  return GROUP_COLORS[index];
}

/* ───────────────── Set Type Color Logic ───────────────── */
function getSetTypeColor(
  set: WorkoutLogSet,
  type: SetType,
  completed: boolean,
): { style: string; value: string | number } {
  switch (type) {
    case "warmup":
      if (completed) {
        return { style: "text-white", value: "W" };
      }
      return { style: "text-yellow-500", value: "W" };
    case "dropSet":
      if (completed) {
        return { style: "text-white", value: "D" };
      }
      return { style: "text-purple-500", value: "D" };
    case "failureSet":
      if (completed) {
        return { style: "text-white", value: "F" };
      }
      return { style: "text-red-500", value: "F" };
    default:
      if (completed) {
        return { style: "text-white", value: set.setIndex + 1 };
      }
      return { style: "text-black dark:text-white", value: set.setIndex + 1 };
  }
}

/* ───────────────── Component ───────────────── */

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

  const groupMap = useMemo(() => {
    const map = new Map<string, WorkoutLogGroup>();
    workout?.exerciseGroups.forEach((g) => map.set(g.id, g));
    return map;
  }, [workout?.exerciseGroups]);

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
      style={{ flex: 1, paddingBottom: safeAreaInsets.bottom }}
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
        {workout.exercises.map((ex: any) => {
          const groupDetails = ex.exerciseGroupId
            ? groupMap.get(ex.exerciseGroupId)
            : null;

          return (
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

              {/* Group badge  */}
              {groupDetails && (
                <View
                  className="mb-3 self-start rounded-full"
                  style={{ backgroundColor: getGroupColor(groupDetails.id) }}
                >
                  <Text className="px-3 py-1 text-base font-semibold text-white">
                    {`${groupDetails.groupType.toUpperCase()} ${String.fromCharCode(
                      "A".charCodeAt(0) + groupDetails.groupIndex,
                    )}`}
                  </Text>
                </View>
              )}

              {/* Sets */}
              {ex.sets.map((set: any, setIndex: number) => (
                <View key={set.id} className="flex-row items-center py-2">
                  <Text
                    className={`flex-1 text-lg font-bold ${getSetTypeColor(set, set.setType, set.completed).style}`}
                  >
                    {getSetTypeColor(set, set.setType, set.completed).value}
                  </Text>

                  <Text className="flex-1 text-base font-semibold text-black dark:text-white">
                    {set.weight && set.reps
                      ? `${set.weight} × ${set.reps}`
                      : set.durationSeconds
                        ? `${set.durationSeconds}s`
                        : `${set.reps} reps`}
                  </Text>

                  <Text className="flex-1 text-base font-semibold text-black dark:text-white">
                    RPE {set.rpe || "-"}
                  </Text>

                  <Text className="flex-1 text-sm text-neutral-500">
                    Rest {formatSeconds(set.restSeconds)}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
