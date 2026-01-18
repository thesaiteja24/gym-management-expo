import { Button } from "@/components/ui/Button";
import { useAuth } from "@/stores/authStore";
import { useExercise } from "@/stores/exerciseStore";
import { TemplateExercise, TemplateSet } from "@/stores/template/types";
import { useTemplate } from "@/stores/templateStore";
import { convertWeight } from "@/utils/converter";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TemplateDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const safeAreaInsets = useSafeAreaInsets();

  const { templates, deleteTemplate, startWorkoutFromTemplate } = useTemplate();
  const user = useAuth((s) => s.user);

  const template = useMemo(
    () => templates.find((t) => t.id === id),
    [templates, id],
  );

  const isOwner = template?.userId === user?.userId;

  useEffect(() => {
    navigation.setOptions({
      headerTitle: template?.title || "Template Details",
      headerRight: () => (
        <View className="flex-row gap-4">
          <TouchableOpacity onPress={handleEdit}>
            <Ionicons
              name="pencil"
              size={24}
              color={isDark ? "white" : "black"}
            />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation, template, isDark]);

  const handleEdit = () => {
    router.push({
      pathname: "/(app)/template/editor",
      params: { mode: "edit", id: id },
    });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Template",
      "Are you sure you want to delete this template?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (id) {
              await deleteTemplate(id);
              router.back();
            }
          },
        },
      ],
    );
  };

  if (!template) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Text className="text-neutral-500">Template not found.</Text>
      </View>
    );
  }

  return (
    <View className="relative flex-1 bg-white dark:bg-black">
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Header Info */}
        <View className="border-b border-neutral-100 p-4 dark:border-neutral-900">
          <Text className="mb-2 text-3xl font-bold text-black dark:text-white">
            {template.title}
          </Text>
          {template.notes && (
            <Text className="mb-4 text-base text-neutral-600 dark:text-neutral-400">
              {template.notes}
            </Text>
          )}

          <View className="flex-row gap-4">
            <View className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
              <Text className="text-xs font-medium text-neutral-500">
                {template.exercises.length} Exercises
              </Text>
            </View>
            <View className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
              <Text className="text-xs font-medium text-neutral-500">
                Last used: Never
              </Text>
            </View>
          </View>
        </View>

        {/* Read Only Exercise List */}
        <View className="gap-4 p-4">
          {template.exercises.map((ex, idx) => (
            <ReadOnlyExerciseRow key={ex.id || idx} exercise={ex} />
          ))}
        </View>

        {/* Delete Button */}
        <TouchableOpacity onPress={handleDelete} className="items-center py-4">
          <Text className="font-medium text-red-500">Delete Template</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Floating Action Button for Starting */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-neutral-100 bg-white p-4 dark:border-neutral-900 dark:bg-black"
        style={{ paddingBottom: safeAreaInsets.bottom + 16 }}
      >
        <Button
          title="Start Workout"
          onPress={() => {
            if (id) startWorkoutFromTemplate(id);
          }}
        />
      </View>
    </View>
  );
}

function ReadOnlyExerciseRow({ exercise }: { exercise: TemplateExercise }) {
  const { exerciseList } = useExercise();
  const isDark = useColorScheme() === "dark";
  const preferredWeightUnit =
    useAuth((s) => s.user?.preferredWeightUnit) || "kg";

  const details = useMemo(
    () => exerciseList.find((e) => e.id === exercise.exerciseId),
    [exerciseList, exercise.exerciseId],
  );

  if (!details) return null;

  return (
    <View className="rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <View className="mb-3 flex-row items-center gap-3">
        <Image
          source={details.thumbnailUrl}
          style={{ width: 40, height: 40, borderRadius: 6 }}
        />
        <View>
          <Text className="text-base font-semibold text-black dark:text-white">
            {details.title}
          </Text>
          <Text className="text-xs capitalize text-neutral-500">
            {details.exerciseType}
          </Text>
        </View>
      </View>

      <View className="gap-2">
        {exercise.sets.map((set, idx) => (
          <View
            key={set.id || idx}
            className="flex-row items-center justify-between rounded bg-neutral-50 p-2 dark:bg-neutral-800/50"
          >
            <View className="flex-row items-center gap-2">
              <View className="h-6 w-6 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-700">
                <Text className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  {idx + 1}
                </Text>
              </View>
              <Text className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {formatSetDetails(set, preferredWeightUnit)}
              </Text>
            </View>
            {set.rpe && (
              <Text className="text-xs text-neutral-400">RPE {set.rpe}</Text>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

function formatSetDetails(set: TemplateSet, unit: any) {
  const parts = [];
  if (set.weight != null) {
    const val = convertWeight(set.weight, {
      from: "kg",
      to: unit,
      precision: 1,
    });
    parts.push(`${val} ${unit}`);
  }
  if (set.reps != null) {
    parts.push(`${set.reps} reps`);
  }
  if (set.durationSeconds != null) {
    parts.push(`${set.durationSeconds}s`);
  }
  return parts.join(" • ") || "No targets";
}
