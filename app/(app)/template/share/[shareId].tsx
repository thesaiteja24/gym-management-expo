import { Button } from "@/components/ui/Button";
import { useAuth } from "@/stores/authStore";
import { useExercise } from "@/stores/exerciseStore";
import { TemplateExercise, TemplateSet } from "@/stores/template/types";
import { useTemplate } from "@/stores/templateStore";
import { SetType } from "@/stores/workoutStore";
import { Image } from "expo-image";
import { router, useLocalSearchParams, useNavigation } from "expo-router";
import React, { useEffect, useMemo } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/* ───────────────── Group Color Logic ───────────────── */

const GROUP_COLORS = [
  "#4C1D95",
  "#7C2D12",
  "#14532D",
  "#7F1D1D",
  "#1E3A8A",
  "#581C87",
  "#0F766E",
  "#1F2937",
];

function hashStringToIndex(str: string, modulo: number) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % modulo;
}

function getGroupColor(groupId: string) {
  return GROUP_COLORS[hashStringToIndex(groupId, GROUP_COLORS.length)];
}

/* ───────────────── Set Type Color Logic ───────────────── */
function getSetTypeColor(
  set: TemplateSet,
  type: SetType,
  completed: boolean,
): { style: string; value: string | number } {
  switch (type) {
    case "warmup":
      if (completed) {
        return { style: "text-white", value: "W" };
      }
      return { style: "text-yellow-500", value: "W" };
    case "dropSet":
      if (completed) {
        return { style: "text-white", value: "D" };
      }
      return { style: "text-purple-500", value: "D" };
    case "failureSet":
      if (completed) {
        return { style: "text-white", value: "F" };
      }
      return { style: "text-red-500", value: "F" };
    default:
      if (completed) {
        return { style: "text-white", value: set.setIndex + 1 };
      }
      return { style: "text-black dark:text-white", value: set.setIndex + 1 };
  }
}

export default function TemplateDetails() {
  const { shareId } = useLocalSearchParams<{ shareId: string }>();

  const navigation = useNavigation();
  const isDark = useColorScheme() === "dark";
  const safeAreaInsets = useSafeAreaInsets();
  const [loading, setLoading] = React.useState(false);

  // Stores
  const sharedTempalte = useTemplate((s) => s.sharedTemplate);
  const localTemplates = useTemplate((s) => s.templates);
  const getTemplateByShareId = useTemplate((s) => s.getTemplateByShareId);
  const saveSharedTemplate = useTemplate((s) => s.saveSharedTemplate);
  const setSharedTemplate = useTemplate((s) => s.setSharedTemplate);

  useEffect(() => {
    getTemplateByShareId(shareId);
  }, [shareId]);

  useEffect(() => {
    navigation.setOptions({
      title: sharedTempalte?.title ?? "Template Details",
      headerLeft: () => (
        <TouchableOpacity
          onPress={() => {
            setSharedTemplate(null);
            router.back();
          }}
          style={{ marginRight: 15 }}
        >
          <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 17 }}>
            Back
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, sharedTempalte, isDark]);

  const groupMap = useMemo(() => {
    const map = new Map<string, any>();
    sharedTempalte?.exerciseGroups.forEach((g) => map.set(g.id, g));
    return map;
  }, [sharedTempalte?.exerciseGroups]);

  // Check if we already have this template
  const existingTemplate = useMemo(() => {
    if (!sharedTempalte?.shareId) return null;
    return localTemplates.find(
      (t) => t.sourceShareId === sharedTempalte.shareId,
    );
  }, [localTemplates, sharedTempalte]);

  const handleSave = async () => {
    if (!sharedTempalte) return;
    setLoading(true);

    try {
      if (existingTemplate) {
        Alert.alert(
          "Overwrite Template?",
          "You already have a copy of this template. Do you want to overwrite your local version with this one?",
          [
            {
              text: "Cancel",
              style: "cancel",
              onPress: () => setLoading(false),
            },
            {
              text: "Overwrite",
              style: "destructive",
              onPress: async () => {
                const res = await saveSharedTemplate(sharedTempalte, {
                  overwriteId: existingTemplate.id,
                });
                setLoading(false);
                if (res.success) {
                  Alert.alert("Success", "Template updated!", [
                    {
                      text: "View Template",
                      onPress: () => {
                        setSharedTemplate(null);
                        router.replace(`/(app)/template/${res.id}`);
                      },
                    },
                  ]);
                }
              },
            },
            // Option to save as new copy? Maybe not needed for now based on plan.
            {
              text: "Save as New",
              onPress: async () => {
                const res = await saveSharedTemplate(sharedTempalte); // No overwriteId = new
                setLoading(false);
                if (res.success) {
                  Alert.alert("Success", "Template saved as new copy!", [
                    {
                      text: "View Template",
                      onPress: () => {
                        setSharedTemplate(null);
                        router.replace(`/(app)/template/${res.id}`);
                      },
                    },
                  ]);
                }
              },
            },
          ],
        );
      } else {
        const res = await saveSharedTemplate(sharedTempalte);
        setLoading(false);
        if (res.success) {
          Alert.alert("Success", "Template saved to your library!", [
            {
              text: "View Template",
              onPress: () => {
                setSharedTemplate(null);
                router.replace(`/(app)/template/${res.id}`);
              },
            },
          ]);
        }
      }
    } catch (e) {
      console.error(e);
      setLoading(false);
      Alert.alert("Error", "Failed to save template.");
    }
  };

  const handleShare = async () => {
    if (!sharedTempalte?.shareId) return;

    const url = `pump://template/share/${sharedTempalte.shareId}`;

    try {
      await Share.share(
        {
          message:
            Platform.OS === "android"
              ? `Check out this workout template:\n${url}`
              : `Check out this workout template:`,
          url,
          title: sharedTempalte.title,
        },
        {
          dialogTitle: "Share Workout Template",
        },
      );
    } catch (error) {
      console.error("Error sharing template:", error);
    }
  };

  if (!sharedTempalte) {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        {loading || !shareId ? (
          <View>
            <Text className="text-neutral-500">Loading...</Text>
          </View>
        ) : (
          <Text className="text-neutral-500">Template not found.</Text>
        )}
      </View>
    );
  }

  return (
    <View className="relative flex-1 bg-white dark:bg-black">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Info */}
        <View className="border-b border-neutral-100 p-4 dark:border-neutral-900">
          <Text className="mb-2 text-3xl font-bold text-black dark:text-white">
            {sharedTempalte.title}
          </Text>
          {/* Author Info */}
          <Text className="mb-2 text-sm font-medium text-blue-600 dark:text-blue-400">
            {sharedTempalte.authorName
              ? `Created by ${sharedTempalte.authorName}`
              : "Shared Template"}
          </Text>

          {sharedTempalte.notes && (
            <Text className="mb-4 text-base text-neutral-600 dark:text-neutral-400">
              {sharedTempalte.notes}
            </Text>
          )}

          <View className="flex-row gap-4">
            <View className="rounded-full bg-neutral-100 px-3 py-1 dark:bg-neutral-800">
              <Text className="text-base font-medium text-neutral-500">
                {sharedTempalte.exerciseGroups.length} Exercises
              </Text>
            </View>
          </View>
        </View>

        {/* Read Only Exercise List */}
        <View className="gap-4 p-4">
          {sharedTempalte.exercises.map((ex, idx) => (
            <ReadOnlyExerciseRow
              key={ex.id || idx}
              exercise={ex}
              group={
                ex.exerciseGroupId ? groupMap.get(ex.exerciseGroupId) : null
              }
            />
          ))}
        </View>
      </ScrollView>

      {/* Floating Action Button for Starting */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-neutral-100 bg-white p-4 dark:border-neutral-900 dark:bg-black"
        style={{ paddingBottom: safeAreaInsets.bottom + 16 }}
      >
        <Button
          title={
            existingTemplate ? "Update Saved Template" : "Save to My Templates"
          }
          onPress={handleSave}
          disabled={loading}
        />
      </View>
    </View>
  );
}

function ReadOnlyExerciseRow({
  exercise,
  group,
}: {
  exercise: TemplateExercise;
  group: any | null;
}) {
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
          <Text className="text-base capitalize text-neutral-500">
            {details.exerciseType}
          </Text>
        </View>
      </View>

      {group && (
        <View
          className="mb-3 self-start rounded-full"
          style={{ backgroundColor: getGroupColor(group.id) }}
        >
          <Text className="px-3 py-1 text-sm font-medium text-white">
            {`${group.groupType.toUpperCase()} ${String.fromCharCode(
              "A".charCodeAt(0) + group.groupIndex,
            )}`}
          </Text>
        </View>
      )}

      <View className="gap-2">
        {exercise.sets.map((set, idx) => (
          <View
            key={set.id || idx}
            className="flex-row items-center rounded bg-neutral-50 p-2 dark:bg-neutral-800/50"
          >
            {/* Set index */}
            <Text
              className={`w-6 text-center text-base font-semibold ${getSetTypeColor(set, set.setType, false).style}`}
            >
              {getSetTypeColor(set, set.setType, true).value}
            </Text>

            {/* Main values */}
            <View className="flex-1 flex-row items-center gap-3">
              {set.weight != null && (
                <Text className="text-base font-medium text-neutral-700 dark:text-neutral-300">
                  {set.weight} kg
                </Text>
              )}

              {set.reps != null && (
                <Text className="text-base font-medium text-neutral-700 dark:text-neutral-300">
                  × {set.reps}
                </Text>
              )}

              {set.durationSeconds != null && (
                <Text className="text-base font-medium text-neutral-700 dark:text-neutral-300">
                  {set.durationSeconds}s
                </Text>
              )}
            </View>

            {/* RPE */}
            <Text className="w-14 text-center text-base text-neutral-400">
              {set.rpe != null ? `RPE ${set.rpe}` : "—"}
            </Text>

            {/* Rest */}
            <Text className="w-14 text-right text-base text-neutral-400">
              {set.restSeconds != null ? `${set.restSeconds}s` : "—"}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
