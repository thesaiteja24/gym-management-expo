import { useThemeColor } from "@/hooks/useThemeColor";
import { WorkoutLogSet } from "@/stores/workoutStore";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SET_TYPES: {
  key: WorkoutLogSet["setType"];
  title: string;
  description: string;
  titleClass: string;
}[] = [
  {
    key: "warmup",
    title: "Warm Up",
    description: "Prepare muscles and joints before working sets.",
    titleClass: "text-yellow-500",
  },
  {
    key: "working",
    title: "Working",
    description: "Primary sets counted toward training volume.",
    titleClass: "text-black dark:text-white",
  },
  {
    key: "failureSet",
    title: "Failure",
    description: "Performed until no further reps are possible.",
    titleClass: "text-danger",
  },
  {
    key: "dropSet",
    title: "Drop Set",
    description: "Reduce weight and continue immediately after failure.",
    titleClass: "text-primary font-semibold",
  },
];

type Props = {
  visible: boolean;
  currentType: WorkoutLogSet["setType"];
  onSelect: (type: WorkoutLogSet["setType"]) => void;
  onClose: () => void;
};

export default function SetTypeSelectionModal({
  visible,
  currentType,
  onSelect,
  onClose,
}: Props) {
  const colors = useThemeColor();
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        className="flex-1 justify-end bg-black/40"
        style={{
          marginBottom: useSafeAreaInsets().bottom,
        }}
      >
        {/* Backdrop */}
        <Pressable className="absolute inset-0" onPress={onClose} />

        {/* Sheet */}
        <View className="rounded-t-3xl bg-white p-6 dark:bg-neutral-900">
          {/* Header */}
          <View className="mb-6 flex-row items-center justify-between">
            <Text className="text-xl font-bold text-black dark:text-white">
              Set Type
            </Text>

            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="gray" />
            </TouchableOpacity>
          </View>

          {/* Options */}
          <View className="gap-4">
            {SET_TYPES.map((type) => {
              const selected = currentType === type.key;

              return (
                <TouchableOpacity
                  key={type.key}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    onSelect(type.key);
                    onClose();
                  }}
                  className={`rounded-xl border p-4 ${
                    selected
                      ? "border-primary bg-blue-50 dark:bg-blue-950"
                      : "border-neutral-300 dark:border-neutral-700"
                  }`}
                >
                  <View className="flex-row items-start justify-between">
                    <View className="flex-1 pr-4">
                      <Text className={`text-lg font-bold ${type.titleClass}`}>
                        {type.title}
                      </Text>

                      <Text className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                        {type.description}
                      </Text>
                    </View>

                    {selected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color={colors.primary}
                      />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
