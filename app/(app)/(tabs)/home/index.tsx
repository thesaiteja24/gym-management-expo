import WorkoutCard from "@/components/workout/WorkoutCard";
import { ExerciseType, useExercise } from "@/stores/exerciseStore";
import { useWorkout } from "@/stores/workoutStore";
import { router, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, View } from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { workoutLoading, workoutHistory, getAllWorkouts } = useWorkout();
  const { exerciseList, getAllExercises } = useExercise();
  const [refreshing, setRefreshing] = useState(false);

  // derived Map of exerciseId -> exerciseType
  const exerciseTypeMap = React.useMemo(() => {
    const map = new Map<string, ExerciseType>();
    exerciseList.forEach((ex) => {
      map.set(ex.id, ex.exerciseType);
    });
    return map;
  }, [exerciseList]);

  /* Side Effects */
  // Load workouts on mount
  useEffect(() => {
    if (!exerciseList.length) {
      getAllExercises();
    }
    if (!workoutHistory.length) {
      getAllWorkouts();
    }
  }, [exerciseList.length, workoutHistory.length]);

  // Inject reload button
  useEffect(() => {
    navigation.setOptions({
      rightIcons: [
        {
          name: "settings-outline",
          onPress: () => router.navigate("/profile/settings"),
        },
      ],
    });
  }, [navigation]);

  // Pull-to-refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([getAllWorkouts(), getAllExercises()]);
    setRefreshing(false);
  }, [getAllWorkouts, getAllExercises]);

  return (
    <View className="flex-1 bg-white px-4 pt-4 dark:bg-black">
      <Text className="mb-4 text-lg font-semibold text-black dark:text-white">
        Your Workouts
      </Text>

      <FlatList
        data={workoutHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <WorkoutCard workout={item} exerciseTypeMap={exerciseTypeMap} />
        )}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !workoutLoading ? (
            <Text className="mt-12 text-center text-base text-neutral-500 dark:text-neutral-400">
              No workouts logged yet
            </Text>
          ) : null
        }
      />
    </View>
  );
}
