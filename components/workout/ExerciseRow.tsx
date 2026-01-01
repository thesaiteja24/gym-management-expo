import SetRow from "@/components/workout/SetRow";
import { WorkoutLogExercise } from "@/stores/workoutStore";
import { Entypo, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Text, TouchableOpacity, View, useColorScheme } from "react-native";

type Props = {
  exercise: WorkoutLogExercise;
  exerciseDetails: any;
  isActive: boolean;
  isDragging: boolean;
  drag: () => void;

  onAddSet: () => void;
  onUpdateSet: (setId: string, patch: any) => void;
  onToggleSet: (setId: string) => void;
  onDeleteSet: (setId: string) => void;
};

function ExerciseRow({
  exercise,
  exerciseDetails,
  isDragging,
  isActive,
  drag,
  onAddSet,
  onUpdateSet,
  onToggleSet,
  onDeleteSet,
}: Props) {
  const isDark = useColorScheme() === "dark";

  return (
    <View
      className="mb-4 p-4"
      style={{
        opacity: isActive ? 0.95 : 1,
        transform: [{ scale: isActive ? 1.02 : 1 }],
      }}
    >
      {/* Drag handle */}
      <TouchableOpacity
        onLongPress={drag}
        activeOpacity={0.8}
        className="flex-row items-center gap-4"
      >
        <Image
          source={exerciseDetails?.thumbnailUrl}
          style={{
            width: 40,
            height: 40,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: "gray",
          }}
        />
        <Text className="text-xl font-semibold text-black dark:text-white">
          {exerciseDetails?.title}
        </Text>
      </TouchableOpacity>

      {/* Sets header */}
      <View className="mt-4 flex-row items-center px-2">
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
          <Entypo name="cycle" size={22} color={isDark ? "white" : "black"} />
        </View>
      </View>

      {exercise.sets.map((set) => (
        <SetRow
          key={set.id}
          set={set}
          onUpdate={(patch) => onUpdateSet(set.id, patch)}
          onToggleComplete={() => onToggleSet(set.id)}
          onDelete={() => onDeleteSet(set.id)}
        />
      ))}

      <TouchableOpacity
        onPress={onAddSet}
        className="mt-2 h-12 w-full justify-center rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-900"
      >
        <Text className="text-center text-xl font-semibold text-black dark:text-white">
          Add Set
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default React.memo(ExerciseRow);
