import WorkoutCard from "@/components/workout/WorkoutCard";
import { useWorkout } from "@/stores/workoutStore";
import { router, useNavigation } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, Text, View } from "react-native";

export default function HomeScreen() {
  const navigation = useNavigation();
  const { workoutLoading, workoutHistory, getAllWorkouts } = useWorkout();

  useEffect(() => {
    getAllWorkouts();
  }, []);

  // Inject reload button
  useEffect(() => {
    navigation.setOptions({
      rightIcons: [
        {
          name: "refresh-outline",
          onPress: () => getAllWorkouts(),
        },
        {
          name: "settings-outline",
          onPress: () => router.navigate("/profile/settings"),
        },
      ],
    });
  }, [navigation]);

  return (
    <View className="flex-1 bg-white p-4 dark:bg-black">
      <Text className="mb-4 text-xl font-semibold text-black dark:text-white">
        Your Workouts
      </Text>

      <FlatList
        data={workoutHistory}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <WorkoutCard {...item} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !workoutLoading ? (
            <Text className="mt-12 text-center text-neutral-500 dark:text-neutral-400">
              No workouts logged yet
            </Text>
          ) : null
        }
      />
    </View>
  );
}
