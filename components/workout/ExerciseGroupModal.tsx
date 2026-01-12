import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { Modal, Pressable, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../ui/Button";

type GroupExerciseItem = {
  id: string;
  title: string;
  thumbnailUrl?: string;
  selected: boolean;
  disabled: boolean;
};

type Props = {
  visible: boolean;
  exercises: GroupExerciseItem[];
  onSelect: (exercise: GroupExerciseItem) => void;
  onClose: () => void;
  onConfirm?: () => void;
};

export default function ExerciseGroupModal({
  visible,
  exercises,
  onSelect,
  onClose,
  onConfirm,
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* Backdrop */}
      <Pressable className="flex-1 bg-black/40" onPress={onClose} />

      {/* Sheet */}
      <View className="absolute bottom-0 w-full rounded-t-3xl bg-white p-4 dark:bg-neutral-900">
        {/* Header */}
        <View className="mb-4 flex-row items-center justify-between">
          <Text className="text-lg font-semibold text-black dark:text-white">
            Select Exercises
          </Text>

          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="gray" />
          </TouchableOpacity>
        </View>

        {/* Exercise list */}
        <View className="gap-3">
          {exercises.map((exercise) => {
            const opacity = exercise.disabled ? 0.4 : 1;
            const borderColor = exercise.selected
              ? "border-blue-500"
              : "border-neutral-300";

            return (
              <TouchableOpacity
                key={exercise.id}
                disabled={exercise.disabled}
                onPress={() => onSelect(exercise)}
                className={`flex-row items-center gap-4 rounded-xl border ${borderColor} p-3`}
                style={{ opacity }}
              >
                <Image
                  source={exercise.thumbnailUrl}
                  style={{ width: 44, height: 44, borderRadius: 22 }}
                />

                <Text className="flex-1 text-base text-black dark:text-white">
                  {exercise.title}
                </Text>

                {exercise.selected && (
                  <Ionicons name="checkmark-circle" size={22} color="#3b82f6" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer */}
        {onConfirm && (
          <View className="mt-4">
            <Button title="Confirm" onPress={onConfirm} />
          </View>
        )}
      </View>
    </Modal>
  );
}
