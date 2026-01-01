import { DisplayDuration } from "@/components/DisplayDuration";
import SetRow from "@/components/workout/SetRow";
import { useExercise } from "@/stores/exerciseStore";
import { useWorkout } from "@/stores/workoutStore";
import { Entypo, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function index() {
  const isDark = useColorScheme() === "dark";
  const exerciseList = useExercise((s) => s.exerciseList);
  const {
    activeWorkout,
    setExerciseSelection,
    addSetToExercise,
    updateSet,
    toggleSetCompletion,
    removeSetFromExercise,
  } = useWorkout();

  const exerciseMap = useMemo(() => {
    return new Map(exerciseList.map((ex) => [ex.id, ex]));
  }, [exerciseList]);

  return (
    <View className="flex-1 bg-white dark:bg-black">
      {/* Top Section displays duration, volume and muscle heatmap */}
      <View className="flex flex-row gap-2 border-b border-neutral-200 p-4 dark:border-neutral-800">
        <Ionicons
          name="hourglass-outline"
          size={24}
          color={isDark ? "white" : "black"}
        />

        {activeWorkout && (
          <DisplayDuration startTime={activeWorkout.startTime} />
        )}
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {activeWorkout?.exercises.length ? (
          activeWorkout.exercises.map((exercise, index) => {
            const exerciseDetails = exerciseMap.get(exercise.exerciseId);

            return (
              <View
                key={exerciseDetails?.id}
                className="mb-4 flex justify-center gap-4 p-4"
              >
                {/* Header */}
                <View className="flex-row items-center gap-4">
                  <Image
                    source={exerciseDetails?.thumbnailUrl}
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 100,
                      borderWidth: 1,
                      borderColor: "gray",
                      backgroundColor: "white",
                    }}
                    contentFit="cover"
                  />
                  <Text className="text-xl font-semibold text-black dark:text-white">
                    {exerciseDetails?.title}
                  </Text>
                </View>

                {/* Sets Header */}
                <View className="flex-row items-center px-2">
                  <Text className="w-10 text-lg font-semibold text-black dark:text-white">
                    Set
                  </Text>

                  <Text className="flex-1 text-center text-lg font-semibold text-black dark:text-white">
                    Previous
                  </Text>

                  <View className="w-16 items-center">
                    <MaterialCommunityIcons
                      name="weight-kilogram"
                      size={22}
                      color={isDark ? "white" : "black"}
                    />
                  </View>

                  <View className="w-16 items-center">
                    <Entypo
                      name="cycle"
                      size={22}
                      color={isDark ? "white" : "black"}
                    />
                  </View>
                </View>

                {/* Sets Details */}
                {exercise.sets.map((set) => (
                  <SetRow
                    key={set.id}
                    set={set}
                    onUpdate={(patch) =>
                      updateSet(exercise.exerciseId, set.id, patch)
                    }
                    onToggleComplete={() =>
                      toggleSetCompletion(exercise.exerciseId, set.id)
                    }
                    onDelete={() =>
                      removeSetFromExercise(exercise.exerciseId, set.id)
                    }
                  />
                ))}

                {/* Add set button */}
                <TouchableOpacity
                  onPress={() => {
                    addSetToExercise(exercise.exerciseId);
                  }}
                  className="h-12 w-full justify-center rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-900"
                >
                  <Text className="text-center text-xl font-semibold text-black dark:text-white">
                    Add Set
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-center text-lg text-neutral-500 dark:text-neutral-400">
              No exercises added yet. Tap "Add an Exercise" to get started!
            </Text>
          </View>
        )}

        {/* Add Exercise Button */}
        <View className="mb-16 flex-1 p-4">
          <TouchableOpacity
            onPress={() => {
              setExerciseSelection(true); // setting exercise selection true
              router.push("/(app)/(tabs)/exercises");
            }}
            className="h-12 w-full justify-center rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-900"
          >
            <Text className="text-center text-xl font-semibold text-black dark:text-white">
              Add an Exercise
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
