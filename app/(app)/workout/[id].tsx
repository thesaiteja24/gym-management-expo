import { Button } from "@/components/ui/Button";
import {
  DeleteConfirmModal,
  DeleteConfirmModalHandle,
} from "@/components/ui/DeleteConfrimModal";
import { ExerciseType, useExercise } from "@/stores/exerciseStore";
import {
  TemplateExercise,
  TemplateExerciseGroup,
} from "@/stores/template/types";
import { useTemplate } from "@/stores/templateStore";
import {
  SetType,
  useWorkout,
  WorkoutHistoryExercise,
  WorkoutHistorySet,
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
import { router, useLocalSearchParams } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

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
  const [isDeleting, setIsDeleting] = useState(false);
  // const [showDeleteModal, setShowDeleteModal] = useState(false); // Removed
  // const [showDiscardModal, setShowDiscardModal] = useState(false); // Removed

  const deleteModalRef = useRef<DeleteConfirmModalHandle>(null);
  const discardModalRef = useRef<DeleteConfirmModalHandle>(null);

  /* Store Related State */
  const { workoutHistory, deleteWorkout } = useWorkout();
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

  /* Handlers */
  const handleEdit = () => {
    if (!workout) return;

    const activeWorkout = useWorkout.getState().workout;

    if (activeWorkout) {
      if (activeWorkout.id === workout.id) {
        // Resuming same edit
        router.push("/(app)/workout/start");
        return;
      }

      // Warn about overwriting
      discardModalRef.current?.present();
    } else {
      useWorkout.getState().loadWorkoutHistory(workout);
      router.push("/(app)/workout/start");
    }
  };

  const handleDiscardConfirm = () => {
    if (!workout) return;
    useWorkout.getState().discardWorkout();
    useWorkout.getState().loadWorkoutHistory(workout);
    // Modal auto dismisses on confirm
    router.push("/(app)/workout/start");
  };

  const handleDeleteConfirm = async () => {
    if (!workout) return;
    // Modal auto dismisses on confirm

    Toast.show({
      type: "success",
      text1: "Workout deleted",
    });

    router.back();
    await deleteWorkout(workout.clientId, workout.id);
  };

  const handleSaveAsTemplate = () => {
    if (!workout) return;

    const { startDraftTemplate } = useTemplate.getState();
    const Crypto = require("expo-crypto");

    // 1. Create ID Mappings for Groups
    // We Map <OldDBGroupId, NewDraftGroupUUID>
    const groupIdMap = new Map<string, string>();
    workout.exerciseGroups.forEach((g) => {
      groupIdMap.set(g.id, Crypto.randomUUID());
    });

    // 2. Clone Groups with New IDs
    const exerciseGroups: TemplateExerciseGroup[] = workout.exerciseGroups.map(
      (g: WorkoutLogGroup, gIdx: number) => ({
        id: groupIdMap.get(g.id)!, // Use the mapped new UUID
        groupIndex: gIdx,
        groupType: g.groupType,
        restSeconds: g.restSeconds ?? undefined,
      }),
    );

    // 3. Clone Exercises & Sets with New IDs
    const exercises: TemplateExercise[] = workout.exercises.map(
      (ex: WorkoutHistoryExercise, exIdx: number) => {
        // Resolve new Group ID if applicable
        const newGroupId = ex.exerciseGroupId
          ? groupIdMap.get(ex.exerciseGroupId)
          : undefined;

        return {
          id: Crypto.randomUUID(), // New Draft Item UUID
          exerciseId: ex.exercise.id,
          exerciseIndex: exIdx,
          exerciseGroupId: newGroupId,
          sets: ex.sets.map((s: WorkoutHistorySet, sIdx: number) => ({
            id: Crypto.randomUUID(), // New Set UUID
            setIndex: sIdx,
            setType: s.setType,
            weight: s.weight ?? undefined,
            reps: s.reps ?? undefined,
            note: s.note ?? undefined,
            rpe: s.rpe ?? undefined,
            durationSeconds: s.durationSeconds ?? undefined,
            restSeconds: s.restSeconds ?? undefined,
          })),
        };
      },
    );

    startDraftTemplate({
      title: workout.title || "Untitled Workout",
      notes: "Created from workout history",
      exercises: exercises,
      exerciseGroups: exerciseGroups,
    });

    router.push("/(app)/template/editor");
  };

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
        <View className="mb-6 flex-col gap-2">
          <View className="flex-row items-center justify-between">
            <Text className="flex-1 text-xl font-bold text-black dark:text-white">
              {workout.title || "Workout"}
            </Text>
            {workout.isEdited && (
              <View className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
                <Text className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                  Edited
                </Text>
              </View>
            )}
          </View>

          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
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
                  style={{ width: 44, height: 44, borderRadius: 999 }}
                />

                <Text className="text-lg font-semibold text-black dark:text-white">
                  {ex.exercise.title}
                </Text>
              </View>

              {/* Group badge  */}
              {groupDetails && (
                <View
                  className="mb-3 self-start rounded-full"
                  style={{ backgroundColor: getGroupColor(groupDetails.id) }}
                >
                  <Text className="font-regular px-3 py-1 text-sm text-white">
                    {`${groupDetails.groupType.toUpperCase()} ${String.fromCharCode(
                      "A".charCodeAt(0) + groupDetails.groupIndex,
                    )}`}
                  </Text>
                </View>
              )}

              {/* Sets */}
              {ex.sets.map((set: any, setIndex: number) => (
                <View key={set.id}>
                  <View className="flex-row items-center py-2">
                    <Text
                      className={`flex-1 text-base font-bold ${getSetTypeColor(set, set.setType, set.completed).style}`}
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
                  {set.note && (
                    <Text className="mb-4 text-sm text-black dark:text-white">
                      <Text className="font-semibold">Note:</Text> {set.note}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          );
        })}

        {/* Actions */}
        <View className="mb-8 mt-4 flex-col gap-3">
          <Button
            title="Edit Workout"
            onPress={handleEdit}
            variant="secondary"
          />
          <Button
            title="Save as Template"
            onPress={handleSaveAsTemplate}
            variant="secondary"
          />
          <Button
            title="Delete Workout"
            variant="danger"
            loading={isDeleting}
            onPress={() => deleteModalRef.current?.present()}
          />
        </View>
      </ScrollView>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        ref={deleteModalRef}
        title="Delete Workout?"
        description="This workout and all its data will be permanently deleted. This action cannot be undone."
        onCancel={() => {}}
        onConfirm={handleDeleteConfirm}
      />

      {/* Discard Confirmation Modal */}
      <DeleteConfirmModal
        ref={discardModalRef}
        title="Discard Current Workout?"
        description="You have an active workout in progress. Editing this history item will discard your current progress."
        confirmText="Discard & Edit"
        onCancel={() => {}}
        onConfirm={handleDiscardConfirm}
      />
    </SafeAreaView>
  );
}
