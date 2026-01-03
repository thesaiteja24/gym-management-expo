import { DisplayDuration } from "@/components/DisplayDuration";
import ExerciseRow from "@/components/workout/ExerciseRow";
import RestTimerSnack from "@/components/workout/RestTimerSnack";
import { Exercise, useExercise } from "@/stores/exerciseStore";
import { useWorkout } from "@/stores/workoutStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function StartWorkout() {
  const isDark = useColorScheme() === "dark";
  const safeAreaInsets = useSafeAreaInsets();

  const exerciseList = useExercise((s) => s.exerciseList);

  const {
    workout,
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
  } = useWorkout();

  const [isDragging, setIsDragging] = useState(false);
  const lastIndexRef = useRef<number | null>(null);

  const exerciseMap = useMemo<Map<string, Exercise>>(
    () => new Map(exerciseList.map((e) => [e.id, e])),
    [exerciseList],
  );

  useEffect(() => {
    if (!workout) {
      startWorkout();
    }
  }, []);

  if (!workout) return null;

  return (
    <View
      style={{ paddingBottom: safeAreaInsets.bottom }}
      className="flex-1 bg-white dark:bg-black"
    >
      {/* ───── Top bar ───── */}
      <View className="flex-row gap-2 border-b border-neutral-200 p-4 dark:border-neutral-800">
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
              onAddSet={() => addSet(item.exerciseId)}
              onUpdateSet={(setId, patch) =>
                updateSet(item.exerciseId, setId, patch)
              }
              onToggleCompleteSet={(setId) =>
                toggleSetCompleted(item.exerciseId, setId)
              }
              onDeleteSet={(setId) => removeSet(item.exerciseId, setId)}
              onStartSetTimer={(setId) => startSetTimer(item.exerciseId, setId)}
              onStopSetTimer={(setId) => stopSetTimer(item.exerciseId, setId)}
              onStartRest={(seconds) => startRestTimer(seconds)}
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

      <RestTimerSnack />
    </View>
  );
}
