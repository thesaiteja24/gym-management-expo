import { DisplayDuration } from "@/components/DisplayDuration";
import ExerciseRow from "@/components/workout/ExerciseRow";
import RestTimerSnack from "@/components/workout/RestTimerSnack";
import { Exercise, useExercise } from "@/stores/exerciseStore";
import { useWorkout } from "@/stores/workoutStore";
import { calculateWorkoutVolume } from "@/utils/workout";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useNavigation } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Text,
  TouchableOpacity,
  useColorScheme,
  Vibration,
  View,
} from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function StartWorkout() {
  const isDark = useColorScheme() === "dark";
  const safeAreaInsets = useSafeAreaInsets();
  const navigation = useNavigation();

  const exerciseList = useExercise((s) => s.exerciseList);

  const {
    workout,
    rest,
    startWorkout,
    saveWorkout,
    discardWorkout,
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

  const [isDragging, setIsDragging] = useState(false);
  const [now, setNow] = useState(Date.now());
  const lastIndexRef = useRef<number | null>(null);
  const prevCompletedRef = useRef<Map<string, boolean>>(new Map());

  const exerciseMap = useMemo<Map<string, Exercise>>(
    () => new Map(exerciseList.map((e) => [e.id, e])),
    [exerciseList],
  );

  const remainingSeconds =
    rest.running && rest.startedAt && rest.seconds != null
      ? Math.max(0, rest.seconds - Math.floor((now - rest.startedAt) / 1000))
      : 0;

  const handleSaveWorkout = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const res = await saveWorkout();

      if (res.success) {
        router.replace("/(app)/(tabs)/workout");
        discardWorkout();
      } else {
        console.error("Failed to save workout", res.error);
        Toast.show({
          type: "error",
          text1: "Failed to save workout",
          text2: res.error?.message || "Please try again later.",
        });
      }
    } catch (error) {
      console.error("Failed to save workout", error);
      Toast.show({
        type: "error",
        text1: "Failed to save workout",
        text2:
          error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  useEffect(() => {
    if (!workout) {
      startWorkout();
    }
  }, []);

  useEffect(() => {
    if (!rest.running) return;

    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [rest.running, rest.startedAt]);

  useEffect(() => {
    if (rest.running && remainingSeconds === 0) {
      Vibration.vibrate([0, 500, 200, 500, 200, 500]);
      stopRestTimer();
    }
  }, [rest.running, remainingSeconds]);

  useEffect(() => {
    if (!workout) return;

    workout.exercises.forEach((exercise) => {
      exercise.sets.forEach((set) => {
        const key = `${exercise.exerciseId}:${set.id}`;
        const prevCompleted = prevCompletedRef.current.get(key) ?? false;

        // just completed → start rest (if preset exists)
        if (!prevCompleted && set.completed && set.restSeconds) {
          startRestTimer(set.restSeconds);
        }

        // just uncompleted → stop rest
        if (prevCompleted && !set.completed) {
          stopRestTimer();
        }

        prevCompletedRef.current.set(key, set.completed);
      });
    });
  }, [workout?.exercises]);

  useEffect(() => {
    navigation.setOptions({
      rightIcons: [
        {
          name: "checkmark-done",
          onPress: handleSaveWorkout,
        },
      ],
    });
  }, [handleSaveWorkout]);

  if (!workout) return null;

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

          <DisplayDuration
            startTime={workout.startTime}
            textColor="text-blue-500"
          />
        </View>
        <View className="flex flex-row gap-2">
          <Text>Volume: </Text>
          <Text>{calculateWorkoutVolume(workout).volume}</Text>
        </View>
        <View className="flex flex-row gap-2">
          <Text>Sets: </Text>
          <Text>{calculateWorkoutVolume(workout).sets}</Text>
        </View>
      </View>

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
              onStartSetTimer={(setId) => startSetTimer(item.exerciseId, setId)}
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
          <View className="mb-16 p-4">
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                router.push({
                  pathname: "/(app)/exercises",
                  params: { mode: "select" },
                });
              }}
              className="mb-24 h-12 w-full justify-center rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <Text className="text-center text-xl font-semibold text-black dark:text-white">
                Add an Exercise
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      <RestTimerSnack
        visible={rest.running}
        remainingSeconds={remainingSeconds}
        onAddTime={adjustRestTimer}
        onSkip={stopRestTimer}
      />
    </View>
  );
}
