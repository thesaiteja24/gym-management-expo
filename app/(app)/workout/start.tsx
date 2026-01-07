import { Button } from "@/components/ui/Button";
import { ElapsedTime } from "@/components/workout/ElapsedTime";
import ExerciseRow from "@/components/workout/ExerciseRow";
import RestTimerSnack from "@/components/workout/RestTimerSnack";

import { useAuth } from "@/stores/authStore";
import { Exercise, ExerciseType, useExercise } from "@/stores/exerciseStore";
import { useWorkout } from "@/stores/workoutStore";

import { convertWeight } from "@/utils/converter";
import { calculateWorkoutMetrics } from "@/utils/workout";

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useNavigation } from "expo-router";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Text,
  useColorScheme,
  Vibration,
  View,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function StartWorkout() {
  /* Local State */
  const isDark = useColorScheme() === "dark";
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation();

  const [now, setNow] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const lastIndexRef = useRef<number | null>(null);
  const prevCompletedRef = useRef<Map<string, boolean>>(new Map());

  /* Store Related State */
  const {
    workoutSaving,
    workout,
    rest,
    startWorkout,
    removeExercise,
    reorderExercises,
    addSet,
    updateSet,
    toggleSetCompleted,
    removeSet,
    startSetTimer,
    stopSetTimer,
    startRestTimer,
    saveRestForSet,
    stopRestTimer,
    adjustRestTimer,
  } = useWorkout();

  const exerciseList = useExercise((s) => s.exerciseList);

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

  // Derived Map of exerciseId -> Exercise
  const exerciseMap = useMemo<Map<string, Exercise>>(
    () => new Map(exerciseList.map((e) => [e.id, e])),
    [exerciseList],
  );

  // Remaining rest timer seconds
  const remainingSeconds =
    rest.running && rest.startedAt && rest.seconds != null
      ? Math.max(0, rest.seconds - Math.floor((now - rest.startedAt) / 1000))
      : 0;

  /* Helpers */
  function getSetValidationStats() {
    if (!workout) return { valid: 0, invalid: 0 };

    let valid = 0;
    let invalid = 0;

    workout.exercises.forEach((ex) => {
      const exerciseType = exerciseTypeMap.get(ex.exerciseId);
      if (!exerciseType) return;

      ex.sets.forEach((set) => {
        if (!set.completed) {
          invalid += 1;
          return;
        }

        const reps = set.reps ?? 0;
        const weight = set.weight ?? 0;
        const duration = set.durationSeconds ?? 0;

        let isValid = false;

        switch (exerciseType) {
          case "repsOnly":
            isValid = reps > 0;
            break;
          case "durationOnly":
            isValid = duration > 0;
            break;
          case "weighted":
          case "assisted":
            isValid = reps > 0 && weight > 0;
            break;
        }

        if (isValid) valid += 1;
        else invalid += 1;
      });
    });

    return { valid, invalid };
  }

  function canNavigateToSave() {
    if (!workout) return { ok: false };

    if (workout.exercises.length === 0) {
      return { ok: false, reason: "NO_EXERCISES" };
    }

    const { valid, invalid } = getSetValidationStats();

    if (valid === 0) {
      return { ok: false, reason: "NO_VALID_SETS" };
    }

    return { ok: true, invalidCount: invalid };
  }

  /* Handlers */
  const handleOpenSave = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const result = canNavigateToSave();

    if (!result.ok) {
      if (result.reason === "NO_EXERCISES") {
        Toast.show({
          type: "error",
          text1: "No exercises added",
          text2: "Add at least one exercise to continue.",
        });
      }

      if (result.reason === "NO_VALID_SETS") {
        Toast.show({
          type: "error",
          text1: "No valid sets added",
          text2: "Add at least one valid set to continue.",
          onPress: () => Toast.hide(),
        });
      }

      return;
    }

    router.push("/(app)/workout/save");
  };

  /* Effects */
  // Start a new workout if none exists
  useEffect(() => {
    if (!workout) startWorkout();
  }, []);

  // Rest Timer Effect
  useEffect(() => {
    if (!rest.running) return;

    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [rest.running, rest.startedAt]);

  // Rest Timer Completion Effect
  useEffect(() => {
    if (rest.running && remainingSeconds === 0) {
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);
      stopRestTimer();
    }
  }, [rest.running, remainingSeconds]);

  // Set Completion Effect - Start/Stop rest timer based on set completion
  useEffect(() => {
    if (!workout) return;

    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        const key = `${exercise.exerciseId}:${set.id}`;
        const prevCompleted = prevCompletedRef.current.get(key) ?? false;

        if (!prevCompleted && set.completed && set.restSeconds) {
          startRestTimer(set.restSeconds);
        }

        if (prevCompleted && !set.completed) {
          stopRestTimer();
        }

        prevCompletedRef.current.set(key, set.completed);
      });
    });
  }, [workout?.exercises]);

  // Navigation Options Effect
  useEffect(() => {
    navigation.setOptions({
      rightIcons: [
        {
          name: "checkmark-done",
          onPress: workoutSaving ? undefined : handleOpenSave,
          disabled: workoutSaving,
          color: "green",
        },
      ],
    });
  }, [handleOpenSave, workoutSaving]);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  /* UI Rendering */
  if (!workout) {
    return <View className="flex-1 bg-white dark:bg-black" />;
  }

  return (
    <View
      style={{ paddingBottom: safeAreaInsets.bottom }}
      className="flex-1 bg-white dark:bg-black"
    >
      {/* ───── Top bar ───── */}
      <View className="flex-row items-center justify-between gap-2 border-b border-neutral-200 p-4 dark:border-neutral-800">
        <View className="flex flex-row gap-2">
          <Ionicons
            name="hourglass-outline"
            size={24}
            color={isDark ? "white" : "black"}
          />

          <ElapsedTime
            startTime={workout.startTime}
            textClassName="text-lg font-semibold text-blue-500"
          />
        </View>
        <View className="flex flex-row gap-2">
          <Text className="text-black dark:text-white">Volume: </Text>
          <Text className="text-black dark:text-white">
            {/* converts from KG to User preferred unit as we by default store as kg */}
            {convertWeight(
              calculateWorkoutMetrics(workout, exerciseTypeMap).tonnage,
            )}{" "}
            {preferredWeightUnit}
          </Text>
        </View>
        <View className="flex flex-row gap-2">
          <Text className="text-black dark:text-white">Sets: </Text>
          <Text className="text-black dark:text-white">
            {calculateWorkoutMetrics(workout, exerciseTypeMap).completedSets}
          </Text>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: "transparent" }}
        behavior={keyboardVisible ? "padding" : undefined}
        keyboardVerticalOffset={100}
      >
        {/* ───── Exercises list ───── */}
        <DraggableFlatList
          data={workout.exercises}
          keyExtractor={(item) => item.exerciseId}
          activationDistance={12}
          contentContainerStyle={{ marginBottom: safeAreaInsets.bottom }}
          onPlaceholderIndexChange={(index) => {
            if (lastIndexRef.current !== index) {
              lastIndexRef.current = index;
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          onDragBegin={(index) => {
            setIsDragging(true);
            lastIndexRef.current = index;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          onDragEnd={({ data }) => {
            setIsDragging(false);
            reorderExercises(data);
          }}
          renderItem={({ item, drag, isActive }) => {
            const details = exerciseMap.get(item.exerciseId);
            if (!details) return null;

            return (
              <ExerciseRow
                exercise={item}
                exerciseDetails={details}
                isActive={isActive}
                isDragging={isDragging}
                drag={drag}
                preferredWeightUnit={preferredWeightUnit}
                onPress={() =>
                  router.navigate(`/(app)/exercises/${item.exerciseId}`)
                }
                onReplaceExercise={() =>
                  router.push({
                    pathname: "/(app)/exercises",
                    params: { replace: item.exerciseId },
                  })
                }
                onDeleteExercise={() => removeExercise(item.exerciseId)}
                onAddSet={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  addSet(item.exerciseId);
                }}
                onUpdateSet={(setId, patch) =>
                  updateSet(item.exerciseId, setId, patch)
                }
                onToggleCompleteSet={(setId) =>
                  toggleSetCompleted(item.exerciseId, setId)
                }
                onDeleteSet={(setId) => removeSet(item.exerciseId, setId)}
                onStartSetTimer={(setId) =>
                  startSetTimer(item.exerciseId, setId)
                }
                onStopSetTimer={(setId) => stopSetTimer(item.exerciseId, setId)}
                onSaveRestPreset={(setId, seconds) =>
                  saveRestForSet(item.exerciseId, setId, seconds)
                }
              />
            );
          }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center px-6 py-20">
              <Ionicons
                name="accessibility-outline"
                size={48}
                color={isDark ? "#9ca3af" : "#6b7280"}
              />

              <Text className="mt-4 text-lg font-semibold text-neutral-700 dark:text-neutral-300">
                No exercises yet
              </Text>

              <Text className="mt-2 text-center text-neutral-500 dark:text-neutral-400">
                Add an exercise to start your workout
              </Text>
            </View>
          }
          ListFooterComponent={
            <View className="mb-[50%] p-4">
              <Button
                title="Add an Exercise"
                onPress={() =>
                  router.push({
                    pathname: "/(app)/exercises",
                    params: { mode: "select" },
                  })
                }
              />
            </View>
          }
        />
      </KeyboardAvoidingView>
      <RestTimerSnack
        visible={rest.running}
        remainingSeconds={remainingSeconds}
        onAddTime={adjustRestTimer}
        onSkip={stopRestTimer}
      />
    </View>
  );
}
