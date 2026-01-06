import { useAuth } from "@/stores/authStore";
import { useWorkout } from "@/stores/workoutStore";
import { convertWeight } from "@/utils/converter";
import { calculateWorkoutVolume } from "@/utils/workout";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import DateTimePickerModal from "@/components/DateTimePickerModal";
import { Button } from "@/components/ui/Button";

export default function SaveWorkout() {
  const lineHeight = Platform.OS === "ios" ? undefined : 28;
  const isDark = useColorScheme() === "dark";
  const insets = useSafeAreaInsets();

  const { workoutSaving, workout, updateWorkout, saveWorkout, discardWorkout } =
    useWorkout();
  const preferredWeightUnit =
    useAuth((s) => s.user?.preferredWeightUnit) ?? "kg";

  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(
    null,
  );

  if (!workout) return null;

  /* ───────────────── Derived Summary ───────────────── */

  const summary = useMemo(() => {
    const { volume, sets } = calculateWorkoutVolume(workout);
    return {
      volume,
      sets,
      startTime: new Date(workout.startTime),
      endTime: new Date(workout.endTime),
    };
  }, [workout]);

  console.log("Workout summary:", summary);
  /* ───────────────── Save ───────────────── */

  const handleConfirmSave = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

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
    router.replace("/(app)/(tabs)/workout");
  };

  useEffect(() => {
    if (workout) {
      updateWorkout({
        endTime: new Date(),
      });
    }
  }, []);

  /* ───────────────── Render ───────────────── */

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
            {/* LEFT COLUMN */}
            <View className="flex-1 gap-4">
              {/* Started */}
              <TouchableOpacity
                onPress={() => setActivePicker("start")}
                className="gap-1"
              >
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Started
                </Text>
                <Text className="text-base font-semibold text-blue-500">
                  {summary.startTime.toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>

              {/* Ended */}
              <TouchableOpacity
                onPress={() => setActivePicker("end")}
                className="gap-1"
              >
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Ended
                </Text>
                <Text className="text-base font-semibold text-blue-500">
                  {summary.endTime.toLocaleString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </TouchableOpacity>
            </View>

            {/* RIGHT COLUMN */}
            <View className="flex-1 items-end gap-4">
              {/* Volume */}
              <View className="items-end gap-1">
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Volume
                </Text>
                <Text className="text-base font-medium text-black dark:text-white">
                  {convertWeight(summary.volume)} {preferredWeightUnit}
                </Text>
              </View>

              {/* Sets */}
              <View className="items-end gap-1">
                <Text className="text-sm text-neutral-500 dark:text-neutral-400">
                  Sets
                </Text>
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
      </View>

      {/* ───── DateTime Pickers ───── */}
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
