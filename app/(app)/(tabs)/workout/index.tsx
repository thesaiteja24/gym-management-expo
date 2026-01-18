import { Button } from "@/components/ui/Button";
import TemplateCard from "@/components/workout/TemplateCard";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useTemplate } from "@/stores/templateStore";
import { useWorkout } from "@/stores/workoutStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function WorkoutScreen() {
  const colors = useThemeColor();

  const { workout, discardWorkout } = useWorkout();
  const { templates, getAllTemplates } = useTemplate();

  useEffect(() => {
    getAllTemplates();
  }, []);

  return (
    <View
      className="flex-1 bg-white p-4 dark:bg-black"
      style={{ paddingBottom: useSafeAreaInsets().bottom }}
    >
      <View className="px-4">
        {/* Active Workout Control */}
        <View className="mb-4 flex flex-row gap-4">
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
              onPress={discardWorkout}
              className="max-w-[35%]"
            />
          )}
        </View>

        <Button
          title="View Exercise Library"
          variant="secondary"
          onPress={() => router.push("/(app)/exercises/")}
          className="mb-6"
        />

        {/* Templates Section */}
        <View className="flex flex-col gap-4">
          <View className="flex flex-row items-center justify-between">
            <Text className="text-xl font-bold text-black dark:text-white">
              My Templates
            </Text>

            <TouchableOpacity
              onPress={() => router.push("/(app)/template/editor")}
            >
              <MaterialCommunityIcons
                name="folder-plus"
                size={24}
                color={colors.icon}
              />
            </TouchableOpacity>
          </View>

          {templates.length === 0 ? (
            <View className="mb-4 h-32 items-center justify-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700">
              <Text className="text-neutral-500 dark:text-neutral-400">
                No templates yet. Create one!
              </Text>
            </View>
          ) : (
            <FlatList
              horizontal
              data={templates}
              renderItem={({ item }) => <TemplateCard template={item} />}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              className="overflow-visible"
              contentContainerStyle={{ paddingRight: 20 }}
            />
          )}
        </View>
      </View>
    </View>
  );
}
