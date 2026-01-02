import { DisplayDuration } from "@/components/DisplayDuration";
import ExerciseRow from "@/components/workout/ExerciseRow";
import { useExercise } from "@/stores/exerciseStore";
import { useWorkout } from "@/stores/workoutStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { Text, TouchableOpacity, useColorScheme, View } from "react-native";
import DraggableFlatList from "react-native-draggable-flatlist";

export default function StartWorkout() {
  const isDark = useColorScheme() === "dark";
  const exerciseList = useExercise((s) => s.exerciseList);
  const [isDragging, setIsDragging] = React.useState(false);
  const lastIndexRef = useRef<number | null>(null);

  const {
    activeWorkout,
    startWorkout,
    setExerciseSelection,
    setExerciseReplacementId,
    removeExercise,
    reorderExercises,
    addSetToExercise,
    updateSet,
    toggleSetCompletion,
    removeSetFromExercise,
  } = useWorkout();

  const handleReplaceExercise = (oldExerciseId: string) => {
    setExerciseReplacementId(oldExerciseId);
    router.push("/(app)/exercises");
  };

  const exerciseMap = useMemo(
    () => new Map(exerciseList.map((e) => [e.id, e])),
    [exerciseList],
  );

  useEffect(() => {
    if (!activeWorkout) startWorkout();
  }, [activeWorkout, startWorkout]);

  if (!activeWorkout) return null;

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Top bar */}
      <View className="flex-row gap-2 border-b border-neutral-200 p-4 dark:border-neutral-800">
        <Ionicons
          name="hourglass-outline"
          size={24}
          color={isDark ? "white" : "black"}
        />
        <DisplayDuration startTime={activeWorkout.startTime} />
      </View>

      <DraggableFlatList
        data={activeWorkout.exercises}
        keyExtractor={(item) => `${item.exerciseId}-${item.exerciseIndex}`} // MUST be unique per row
        activationDistance={12}
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
        onScrollEndDrag={() => setIsDragging(false)}
        onDragEnd={({ data }) => {
          setIsDragging(false);
          reorderExercises(data);
        }}
        renderItem={({ item, drag, isActive }) => {
          const details = exerciseMap.get(item.exerciseId);

          return (
            <ExerciseRow
              exercise={item}
              exerciseDetails={details}
              drag={drag}
              onPress={() =>
                router.navigate(`/(app)/exercises/${item.exerciseId}`)
              }
              isActive={isActive}
              isDragging={isDragging}
              onReplaceExercise={() => {
                handleReplaceExercise(item.exerciseId);
              }}
              onDeleteExercise={() => removeExercise(item.exerciseId)}
              onAddSet={() => addSetToExercise(item.exerciseId)}
              onUpdateSet={(setId, patch) =>
                updateSet(item.exerciseId, setId, patch)
              }
              onToggleCompleteSet={(setId) =>
                toggleSetCompletion(item.exerciseId, setId)
              }
              onDeleteSet={(setId) =>
                removeSetFromExercise(item.exerciseId, setId)
              }
            />
          );
        }}
        ListFooterComponent={
          <View className="mb-16 p-4">
            <TouchableOpacity
              onPress={() => {
                setExerciseSelection(true);
                router.push("/(app)/exercises");
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
    </View>
  );
}
