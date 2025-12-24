import { ROLES as roles } from "@/constants/roles";
import { ActivityIndicator } from "@react-native-blossom-ui/components";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import Toast from "react-native-toast-message";

type Props = {
  loading: boolean;
  exercises: any[];
  role?: string;
  onDelete: (v: { id: string; title: string }) => void;
};

export default function ExerciseList({
  loading,
  exercises,
  role,
  onDelete,
}: Props) {
  if (loading) {
    return <ActivityIndicator animating size="large" className="mt-8" />;
  }

  return (
    <ScrollView className="mt-4 px-4" showsVerticalScrollIndicator={false}>
      {exercises.map((exercise) => (
        <TouchableOpacity
          key={exercise.id}
          className="flex-row justify-between pb-4"
          onPress={() =>
            role === roles.systemAdmin
              ? router.push(`/exercises/${exercise.id}`)
              : Toast.show({ type: "info", text1: "Coming Soon" })
          }
          onLongPress={() =>
            role === roles.systemAdmin &&
            onDelete({ id: exercise.id, title: exercise.title })
          }
          delayLongPress={700}
        >
          <View className="w-3/4">
            <Text className="text-xl font-semibold text-black dark:text-white">
              {exercise.title}
            </Text>

            <View className="flex-row gap-4 mt-1">
              <Text className="text-sm text-blue-500 font-semibold">
                {exercise.equipment.title}
              </Text>
              <Text className="text-sm text-blue-500 font-semibold">
                {exercise.primaryMuscleGroup.title}
              </Text>
              <Text className="text-sm text-red-500 font-semibold">PR</Text>
            </View>
          </View>

          <Image
            source={exercise.thumbnailUrl}
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
      ))}
    </ScrollView>
  );
}
