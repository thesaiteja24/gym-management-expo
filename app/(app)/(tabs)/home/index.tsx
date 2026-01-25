import { router, useNavigation } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import StreakCard, { StreakDay } from "@/components/home/StreakCard";
import WorkoutCard from "@/components/workout/WorkoutCard";

import { useAuth } from "@/stores/authStore";
import { ExerciseType, useExercise } from "@/stores/exerciseStore";
import { useWorkout, WorkoutHistoryItem } from "@/stores/workoutStore";
import { parseUTCToLocalDate, toDateKey } from "@/utils/time";

export default function HomeScreen() {
  const navigation = useNavigation();

  // ───────────────── Stores ─────────────────
  const user = useAuth((s) => s.user);

  const workoutLoading = useWorkout((s) => s.workoutLoading);
  const workoutHistory = useWorkout((s) => s.workoutHistory);
  const getAllWorkouts = useWorkout((s) => s.getAllWorkouts);

  const exerciseList = useExercise((s) => s.exerciseList);
  const getAllExercises = useExercise((s) => s.getAllExercises);

  const [refreshing, setRefreshing] = useState(false);

  // ───────────────── Derived data ─────────────────
  const exerciseTypeMap = useMemo(() => {
    const map = new Map<string, ExerciseType>();
    exerciseList.forEach((ex) => map.set(ex.id, ex.exerciseType));
    return map;
  }, [exerciseList]);

  const sortedWorkoutHistory = useMemo(
    () =>
      [...workoutHistory].sort(
        (a, b) =>
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
      ),
    [workoutHistory],
  );

  type ListItem =
    | { type: "section-header" }
    | { type: "workout"; workout: WorkoutHistoryItem };

  const listData: ListItem[] = useMemo(() => {
    if (sortedWorkoutHistory.length === 0) return [];

    return [
      { type: "section-header" },
      ...sortedWorkoutHistory.map((w) => ({
        type: "workout" as const,
        workout: w,
      })),
    ];
  }, [sortedWorkoutHistory]);

  // ───────────────── Streak builder ─────────────────
  const streakData = useMemo(() => {
    const workouts = sortedWorkoutHistory;
    const today = new Date();
    const todayKey = toDateKey(today);

    const start = new Date(today);
    start.setDate(today.getDate() - 3);

    const end = new Date(today);
    end.setDate(today.getDate() + 3);

    const workoutDays = new Set(
      workouts.map((w) => toDateKey(parseUTCToLocalDate(w.startTime))),
    );

    const days: StreakDay[] = [];
    const cursor = new Date(start);

    while (cursor <= end) {
      const key = toDateKey(cursor);

      let status: StreakDay["status"];
      if (workoutDays.has(key)) status = "active";
      else if (key === todayKey) status = "today";
      else if (cursor > today) status = "future";
      else status = "missed";

      days.push({ date: key, status });
      cursor.setDate(cursor.getDate() + 1);
    }

    return {
      monthLabel: today.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
      days,
      message: `🔥 ${workoutDays.size} workouts this week`,
    };
  }, [sortedWorkoutHistory]);

  // ───────────────── Navigation ─────────────────
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

  // ───────────────── Refresh ─────────────────
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([getAllWorkouts(), getAllExercises()]);
    setRefreshing(false);
  }, [getAllWorkouts, getAllExercises]);

  // ───────────────── Render ─────────────────
  return (
    <SafeAreaView
      className="flex-1 bg-white px-4 pt-4 dark:bg-black"
      edges={["top"]}
    >
      {/* Fixed header */}
      <View className="mb-4">
        <Text className="text-2xl font-semibold text-black dark:text-white">
          Welcome Back, {user?.firstName?.split(" ").slice(0, 2).join(" ")}!
        </Text>
        <Text className="text-base font-medium text-neutral-600 dark:text-neutral-400">
          Ready to get pumped?
        </Text>
      </View>

      {/* Two-stage scrolling */}
      <FlatList
        data={listData}
        keyExtractor={
          (item, index) =>
            item.type === "section-header"
              ? "section-header"
              : item.workout.clientId // Using clientId as stable key
        }
        renderItem={({ item }) => {
          if (item.type === "section-header") {
            return (
              <View className="border-b border-neutral-200 bg-white pb-2 dark:border-neutral-800 dark:bg-black">
                <Text className="mb-2 text-xl font-medium text-black dark:text-white">
                  Your Workouts
                </Text>
              </View>
            );
          }

          return (
            <WorkoutCard
              workout={item.workout}
              exerciseTypeMap={exerciseTypeMap}
            />
          );
        }}
        ListHeaderComponent={
          sortedWorkoutHistory.length > 0 ? (
            <StreakCard {...streakData} />
          ) : null
        }
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          workoutLoading && !refreshing ? (
            <ActivityIndicator />
          ) : (
            <Text className="mt-12 text-center text-base text-neutral-500 dark:text-neutral-400">
              No workouts logged yet
            </Text>
          )
        }
      />
    </SafeAreaView>
  );
}
