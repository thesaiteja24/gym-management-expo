import { Button } from "@/components/ui/Button";
import { useWorkout } from "@/stores/workoutStore";
import { router } from "expo-router";
import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkoutScreen() {
  const { workout, discardWorkout } = useWorkout();
  return (
    <View
      className="flex-1 bg-white p-4 dark:bg-black"
      style={{ paddingBottom: useSafeAreaInsets().bottom }}
    >
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
    </View>
  );
}
