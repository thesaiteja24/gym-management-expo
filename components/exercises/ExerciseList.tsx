import { Exercise } from "@/stores/exerciseStore";
import { ActivityIndicator } from "@react-native-blossom-ui/components";
import { Image } from "expo-image";
import React, { useCallback } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

type Props = {
  exerciseSelection: boolean;
  loading: boolean;
  exercises: Array<Exercise>;

  isSelected: (id: string) => boolean;
  onPress: (exercise: any) => void;
  onLongPress?: (exercise: any) => void;
};

const ExerciseRow = React.memo(
  ({
    item,
    isSelected,
    onPress,
    onLongPress,
  }: {
    item: Exercise;
    isSelected: boolean;
    onPress: (e: Exercise) => void;
    onLongPress?: (e: Exercise) => void;
  }) => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        className={`mb-4 h-20 flex-row items-center justify-between px-4 ${
          isSelected ? "rounded-l-lg border-l-4 border-l-amber-500" : ""
        }`}
        onPress={() => onPress(item)}
        onLongPress={() => onLongPress?.(item)}
        delayLongPress={700}
      >
        <View className="w-3/4">
          <Text className="text-xl font-semibold text-black dark:text-white">
            {item.title}
          </Text>

          <View className="mt-1 flex-row gap-4">
            <Text className="text-sm font-semibold text-blue-500">
              {item.equipment.title}
            </Text>
            <Text className="text-sm font-semibold text-blue-500">
              {item.primaryMuscleGroup.title}
            </Text>
            <Text className="text-sm font-semibold text-red-500">PR</Text>
          </View>
        </View>

        <Image
          source={item.thumbnailUrl}
          style={{
            width: 60,
            height: 60,
            borderRadius: 100,
            borderWidth: 1,
            borderColor: "gray",
            backgroundColor: "white",
          }}
          contentFit="cover"
        />
      </TouchableOpacity>
    );
  },
);

export default function ExerciseList({
  exerciseSelection = false,
  loading,
  exercises,
  isSelected,
  onPress,
  onLongPress,
}: Props) {
  if (loading) {
    return <ActivityIndicator animating size="large" className="mt-8" />;
  }

  if (!exercises.length) {
    return (
      <View className="my-8 px-4">
        <Text className="text-center text-black dark:text-white">
          No exercises found.
        </Text>
      </View>
    );
  }

  const renderItem = useCallback(
    ({ item }: { item: Exercise }) => (
      <ExerciseRow
        item={item}
        isSelected={exerciseSelection && isSelected(item.id)}
        onPress={onPress}
        onLongPress={onLongPress}
      />
    ),
    [exerciseSelection, isSelected, onPress, onLongPress],
  );

  return (
    <FlatList
      data={exercises}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
    />
  );
}
