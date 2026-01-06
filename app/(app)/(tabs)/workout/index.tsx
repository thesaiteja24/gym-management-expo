import { Button } from "@/components/ui/Button";
import { useWorkout } from "@/stores/workoutStore";
import { router } from "expo-router";
import React from "react";
import { ScrollView, View } from "react-native";

export default function WorkoutScreen() {
  const { workout, discardWorkout } = useWorkout();
  return (
    <ScrollView className="h-full flex-col bg-white p-4 dark:bg-black">
      <View className="flex flex-row gap-4">
        <Button
          title={workout ? "Continue the Pump" : "Ready to Get Pumped?"}
          variant="primary"
          onPress={() => router.push("/(app)/workout/start")}
          className="flex-1"
        />

        {workout && (
          <Button
            title="Discard"
            variant="danger"
            haptic
            onPress={discardWorkout}
            className="max-w-[35%]"
          />
        )}
      </View>

      <Button
        title="View Exercise Library"
        variant="secondary"
        onPress={() => router.push("/(app)/exercises/")}
        className="mt-4"
      />
    </ScrollView>
  );
}
