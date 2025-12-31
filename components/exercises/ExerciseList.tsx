import { ActivityIndicator } from "@react-native-blossom-ui/components";
import { Image } from "expo-image";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";

type Props = {
  loading: boolean;
  exercises: any[];

  onPress: (exercise: any) => void;
  onLongPress?: (exercise: any) => void;
};

export default function ExerciseList({
  loading,
  exercises,
  onPress,
  onLongPress,
}: Props) {
  if (loading) {
    return <ActivityIndicator animating size="large" className="mt-8" />;
  }

  if (!exercises.length) {
    return (
      <View className="mt-8 px-4">
        <Text className="text-center text-black dark:text-white">
          No exercises found.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={exercises}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16 }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <TouchableOpacity
          className="flex-row justify-between pb-4"
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
      )}
    />
  );
}
