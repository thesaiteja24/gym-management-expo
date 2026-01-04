import { DeleteConfirmModal } from "@/components/DeleteConfrimModal";
import EquipmentModal from "@/components/exercises/EquipmentModal";
import ExerciseList from "@/components/exercises/ExerciseList";
import MuscleGroupModal from "@/components/exercises/MuscleGroupModal";

import { ROLES as roles } from "@/constants/roles";
import { useAuth } from "@/stores/authStore";
import { useEquipment } from "@/stores/equipmentStore";
import { Exercise, useExercise } from "@/stores/exerciseStore";
import { useMuscleGroup } from "@/stores/muscleGroupStore";
import { useWorkout } from "@/stores/workoutStore";

import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import Fuse from "fuse.js";

import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

/* ───────────────── Chip (UI only) ───────────────── */

type ChipProps = {
  label: string;
  onRemove: () => void;
};

function Chip({ label, onRemove }: ChipProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <TouchableOpacity
      onPress={onRemove}
      className="h-12 w-full flex-row items-center justify-around rounded-2xl border border-neutral-200/60 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800"
    >
      <Text className="text-lg font-semibold text-black dark:text-white">
        {label}
      </Text>
      <Ionicons
        name="close-circle"
        size={24}
        color={isDark ? "#737373" : "#a3a3a3"}
      />
    </TouchableOpacity>
  );
}

/* ───────────────── Screen ───────────────── */

export default function ExercisesScreen() {
  const role = useAuth((s) => s.user?.role);
  const safeAreaInsets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  const replaceExerciseId =
    typeof params.replace === "string" ? params.replace : null;

  const isSelectionMode = params.mode === "select";

  const { addExercise, removeExercise, replaceExercise, workout } =
    useWorkout();

  const { equipmentList, equipmentLoading, getAllEquipment } = useEquipment();
  const { muscleGroupList, muscleGroupLoading, getAllMuscleGroups } =
    useMuscleGroup();
  const { exerciseList, exerciseLoading, getAllExercises, deleteExercise } =
    useExercise();

  const initialSelectedIds = useMemo(
    () => new Set(workout?.exercises.map((e) => e.exerciseId) ?? []),
    [workout?.exercises],
  );

  // Local, temporary selection buffer (UI only)
  const [tempSelectedIds, setTempSelectedIds] =
    useState<Set<string>>(initialSelectedIds);

  const selectedExerciseIds = isSelectionMode
    ? tempSelectedIds
    : new Set(workout?.exercises.map((e) => e.exerciseId) ?? []);

  const selectedCount = selectedExerciseIds.size;

  const [query, setQuery] = useState("");
  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showMuscleGroupsModal, setShowMuscleGroupsModal] = useState(false);

  const [filter, setFilter] = useState({
    equipmentId: "",
    muscleGroupId: "",
  });

  const [deleteExerciseId, setDeleteExerciseId] = useState<{
    id: string;
    title: string;
  } | null>(null);

  /* ───────────────── Load data ───────────────── */

  useEffect(() => {
    getAllEquipment();
    getAllMuscleGroups();
    getAllExercises();
  }, []);

  /* ───────────────── Fuzzy search ───────────────── */

  const fuse = useMemo(() => {
    if (!exerciseList.length) return null;

    return new Fuse(exerciseList, {
      keys: [
        { name: "title", weight: 0.7 },
        { name: "equipment.title", weight: 0.2 },
        { name: "primaryMuscleGroup.title", weight: 0.1 },
        { name: "secondaryMuscleGroups.title", weight: 0.1 },
      ],
      threshold: 0.3,
      ignoreLocation: true,
    });
  }, [exerciseList]);

  const filteredExercises = useMemo(() => {
    let data = exerciseList;

    if (filter.equipmentId) {
      data = data.filter((e) => e.equipment?.id === filter.equipmentId);
    }

    if (filter.muscleGroupId) {
      data = data.filter(
        (e) =>
          e.primaryMuscleGroup?.id === filter.muscleGroupId ||
          e.otherMuscleGroups?.some((m) => m.id === filter.muscleGroupId),
      );
    }

    if (!fuse || query.trim() === "") return data;

    const ids = new Set(fuse.search(query).map((r) => r.item.id));
    return data.filter((e) => ids.has(e.id));
  }, [exerciseList, filter, fuse, query]);

  /* ───────────────── Handlers ───────────────── */

  const handleExercisePress = (exercise: Exercise) => {
    Haptics.selectionAsync();

    if (replaceExerciseId) {
      replaceExercise(replaceExerciseId, exercise.id);
      router.replace("/(app)/workout/start");
      return;
    }

    if (isSelectionMode) {
      setTempSelectedIds((prev) => {
        const next = new Set(prev);

        if (next.has(exercise.id)) {
          next.delete(exercise.id);
        } else {
          next.add(exercise.id);
        }

        return next;
      });
      return;
    }

    router.push(`/(app)/exercises/${exercise.id}`);
  };

  /* ───────────────── Render ───────────────── */

  return (
    <View
      style={{ paddingBottom: safeAreaInsets.bottom }}
      className="flex-1 bg-white px-4 pt-4 dark:bg-black"
    >
      {/* Search */}
      <View className="mb-4">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises, equipment, muscles…"
          placeholderTextColor="#9CA3AF"
          className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-lg text-black dark:border-neutral-800 dark:bg-neutral-900 dark:text-white"
        />
      </View>

      {/* Filters */}
      <View className="mb-4 flex-row gap-4">
        <View className="flex-1">
          {filter.equipmentId ? (
            <Chip
              label={
                equipmentList.find((e) => e.id === filter.equipmentId)?.title ??
                "Equipment"
              }
              onRemove={() => setFilter((f) => ({ ...f, equipmentId: "" }))}
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                setShowEquipmentModal(true);
              }}
              className="h-12 w-full justify-center rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <Text className="text-center text-xl font-semibold text-black dark:text-white">
                Equipment
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View className="flex-1">
          {filter.muscleGroupId ? (
            <Chip
              label={
                muscleGroupList.find((m) => m.id === filter.muscleGroupId)
                  ?.title ?? "Muscle"
              }
              onRemove={() => setFilter((f) => ({ ...f, muscleGroupId: "" }))}
            />
          ) : (
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
                setShowMuscleGroupsModal(true);
              }}
              className="h-12 w-full justify-center rounded-2xl border border-neutral-200/60 bg-white dark:border-neutral-800 dark:bg-neutral-900"
            >
              <Text className="text-center text-xl font-semibold text-black dark:text-white">
                Muscle Groups
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Exercise list */}
      <ExerciseList
        loading={exerciseLoading}
        exercises={filteredExercises}
        isSelecting={isSelectionMode}
        isSelected={(id) => selectedExerciseIds.has(id)}
        onPress={handleExercisePress}
        onLongPress={(exercise) => {
          if (role !== roles.systemAdmin) return;
          setDeleteExerciseId({ id: exercise.id, title: exercise.title });
        }}
      />

      {/* Bottom bar (selection mode) */}
      {isSelectionMode && !exerciseLoading && (
        <View className="flex-row items-center justify-between rounded-2xl border border-neutral-200/60 bg-neutral-100 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
              router.back();
            }}
          >
            <Text className="text-lg font-semibold text-red-500">Cancel</Text>
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-black dark:text-white">
            {selectedCount} selected
          </Text>

          <TouchableOpacity
            disabled={selectedCount === 0}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

              // Remove exercises that were unselected
              initialSelectedIds.forEach((id) => {
                if (!tempSelectedIds.has(id)) {
                  removeExercise(id);
                }
              });

              // Add newly selected exercises
              tempSelectedIds.forEach((id) => {
                if (!initialSelectedIds.has(id)) {
                  addExercise(id);
                }
              });

              router.replace("/(app)/workout/start");
            }}
          >
            <Text
              className={`text-lg font-semibold ${
                selectedCount === 0 ? "text-neutral-400" : "text-green-500"
              }`}
            >
              Done
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modals */}
      <EquipmentModal
        visible={showEquipmentModal}
        loading={equipmentLoading}
        equipment={equipmentList}
        onClose={() => setShowEquipmentModal(false)}
        onSelect={(item) => {
          setFilter((f) => ({ ...f, equipmentId: item.id }));
          setShowEquipmentModal(false);
        }}
      />

      <MuscleGroupModal
        visible={showMuscleGroupsModal}
        loading={muscleGroupLoading}
        muscleGroups={muscleGroupList}
        onClose={() => setShowMuscleGroupsModal(false)}
        onSelect={(item) => {
          setFilter((f) => ({ ...f, muscleGroupId: item.id }));
          setShowMuscleGroupsModal(false);
        }}
      />

      {deleteExerciseId && (
        <DeleteConfirmModal
          visible
          title={`Delete "${deleteExerciseId.title}"?`}
          description="This exercise will be permanently removed."
          onCancel={() => setDeleteExerciseId(null)}
          onConfirm={async () => {
            const res = await deleteExercise(deleteExerciseId.id);
            await getAllExercises();
            setDeleteExerciseId(null);

            Toast.show({
              type: res.success ? "success" : "error",
              text1: res.success
                ? "Exercise deleted successfully"
                : "Error deleting exercise",
              text2: res.message,
            });
          }}
        />
      )}
    </View>
  );
}
