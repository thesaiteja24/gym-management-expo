import DateTimePickerModal from "@/components/DateTimePickerModal";
import { Button } from "@/components/ui/Button";

import { useAuth } from "@/stores/authStore";
import { ExerciseType, useExercise } from "@/stores/exerciseStore";
import { useWorkout } from "@/stores/workoutStore";

import { convertWeight } from "@/utils/converter";
import { calculateWorkoutMetrics } from "@/utils/workout";

import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function SaveWorkout() {
  /* Local State */
  const lineHeight = Platform.OS === "ios" ? undefined : 28;
  const insets = useSafeAreaInsets();

  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(
    null,
  );

  /* Store Related State */
  const {
    workoutSaving,
    workout,
    getAllWorkouts,
    updateWorkout,
    saveWorkout,
    discardWorkout,
  } = useWorkout();

  const { exerciseList, getAllExercises } = useExercise();

  const preferredWeightUnit =
    useAuth((s) => s.user?.preferredWeightUnit) ?? "kg";

  /* Derived State */
  // Derived Map of exerciseId -> exerciseType
  const exerciseTypeMap = useMemo(() => {
    const map = new Map<string, ExerciseType>();
    exerciseList.forEach((ex) => {
      map.set(ex.id, ex.exerciseType);
    });
    return map;
  }, [exerciseList]);

  // Workout summary
  const summary = useMemo(() => {
    if (!workout) {
      return {
        volume: 0,
        sets: 0,
        startTime: new Date(),
        endTime: new Date(),
      };
    }

    const { tonnage, completedSets } = calculateWorkoutMetrics(
      workout,
      exerciseTypeMap,
    );

    return {
      volume: tonnage,
      sets: completedSets,
      startTime: new Date(workout.startTime),
      endTime: new Date(workout.endTime),
    };
  }, [workout, exerciseTypeMap]);

  /* Handlers */
  const handleConfirmSave = async () => {
    if (summary.endTime <= summary.startTime) {
      Toast.show({
        type: "error",
        text1: "Invalid time range",
        text2: "End time must be after start time",
      });
      return;
    }

    const res = await saveWorkout();

    if (!res.success) {
      Toast.show({
        type: "error",
        text1: "Failed to save workout",
        text2: res.error?.message || "Please try again",
      });
      return;
    }

    Toast.show({
      type: "success",
      text1: "Workout saved successfully",
    });

    discardWorkout();
    getAllWorkouts();
    router.replace("/(app)/(tabs)/workout");
  };

  /* Effects */
  // Set end time to now on mount
  useEffect(() => {
    if (workout) {
      updateWorkout({ endTime: new Date() });
    }
  }, []);

  useEffect(() => {
    if (!exerciseList.length) {
      getAllExercises();
    }
  }, [exerciseList.length]);

  /* UI Rendering */
  if (!workout) {
    return <View className="flex-1 bg-white dark:bg-black" />;
  }

  return (
    <View
      style={{ paddingBottom: insets.bottom }}
      className="flex-1 bg-white p-4 dark:bg-black"
    >
      {/* ───── Title ───── */}
      <Text className="mb-1 text-neutral-500">Workout title</Text>
      <TextInput
        value={workout.title ?? ""}
        onChangeText={(text) => updateWorkout({ title: text })}
        className="rounded-xl border border-neutral-300 px-4 py-3 text-lg text-black dark:border-neutral-700 dark:text-white"
        style={{ lineHeight }}
      />

      {/* ───── Summary ───── */}
      <View className="mt-6">
        <Text className="mb-2 text-lg font-semibold text-black dark:text-white">
          Summary
        </Text>

        <View className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800">
          <View className="flex-row justify-between">
            {/* LEFT */}
            <View className="flex-1 gap-4">
              <TouchableOpacity
                onPress={() => setActivePicker("start")}
                className="gap-1"
              >
                <Text className="text-sm text-neutral-500">Started</Text>
                <Text className="text-base font-semibold text-blue-500">
                  {summary.startTime.toLocaleString()}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setActivePicker("end")}
                className="gap-1"
              >
                <Text className="text-sm text-neutral-500">Ended</Text>
                <Text className="text-base font-semibold text-blue-500">
                  {summary.endTime.toLocaleString()}
                </Text>
              </TouchableOpacity>
            </View>

            {/* RIGHT */}
            <View className="flex-1 items-end gap-4">
              <View className="items-end gap-1">
                <Text className="text-sm text-neutral-500">Volume</Text>
                <Text className="text-base font-medium text-black dark:text-white">
                  {convertWeight(summary.volume)} {preferredWeightUnit}
                </Text>
              </View>

              <View className="items-end gap-1">
                <Text className="text-sm text-neutral-500">Sets</Text>
                <Text className="text-base font-medium text-black dark:text-white">
                  {summary.sets}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ───── Actions ───── */}
      <View className="mt-auto gap-3">
        <Button
          title="Save Workout"
          variant="primary"
          loading={workoutSaving}
          onPress={handleConfirmSave}
        />
        <Button
          title="Back to Workout"
          variant="secondary"
          disabled={workoutSaving}
          onPress={() => router.back()}
        />
      </View>

      {/* ───── Date pickers ───── */}
      <DateTimePickerModal
        visible={activePicker === "start"}
        title="Workout Started"
        initialValue={summary.startTime}
        onClose={() => setActivePicker(null)}
        onConfirm={(date) => updateWorkout({ startTime: date })}
      />

      <DateTimePickerModal
        visible={activePicker === "end"}
        title="Workout Ended"
        initialValue={summary.endTime}
        onClose={() => setActivePicker(null)}
        onConfirm={(date) => updateWorkout({ endTime: date })}
      />
    </View>
  );
}
