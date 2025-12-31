import { DeleteConfirmModal } from "@/components/DeleteConfrimModal";
import EquipmentModal from "@/components/exercises/EquipmentModal";
import ExerciseList from "@/components/exercises/ExerciseList";
import MuscleGroupModal from "@/components/exercises/MuscleGroupModal";

import { ROLES as roles } from "@/constants/roles";
import { useAuth } from "@/stores/authStore";
import { useEquipment } from "@/stores/equipmentStore";
import { useExercise } from "@/stores/exerciseStore";
import { useMuscleGroup } from "@/stores/muscleGroupStore";

import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import Fuse from "fuse.js";

import React, { useEffect, useMemo, useState } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import Toast from "react-native-toast-message";

// Chip (pure UI)
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

// Screen
export default function Exercises() {
  const role = useAuth((s) => s.user?.role);

  const { equipmentList, equipmentLoading, getAllEquipment } = useEquipment();
  const { muscleGroupList, muscleGroupLoading, getAllMuscleGroups } =
    useMuscleGroup();
  const { exerciseList, exerciseLoading, getAllExercises, deleteExercise } =
    useExercise();

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

  /* ---------------------------------------------
     Load data
  --------------------------------------------- */
  useEffect(() => {
    getAllEquipment();
    getAllMuscleGroups();
    getAllExercises();
  }, []);

  /* ---------------------------------------------
     Fuzzy Search and Filtering
  --------------------------------------------- */
  const [query, setQuery] = useState("");

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

    const resultIds = new Set(fuse.search(query).map((r) => r.item.id));

    return data.filter((e) => resultIds.has(e.id));
  }, [exerciseList, filter, fuse, query]);

  //  Clear search when modal opens
  useEffect(() => {
    if (showEquipmentModal || showMuscleGroupsModal) {
      setQuery("");
    }
  }, [showEquipmentModal, showMuscleGroupsModal]);

  return (
    <View className="flex-1 bg-white p-4 dark:bg-black">
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
              onPress={() => setShowEquipmentModal(true)}
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
              onPress={() => setShowMuscleGroupsModal(true)}
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
        onPress={(exercise) => {
          router.push(`/exercises/${exercise.id}`);
        }}
        onLongPress={(exercise) => {
          if (role !== roles.systemAdmin) return;
          setDeleteExerciseId({
            id: exercise.id,
            title: exercise.title,
          });
        }}
      />

      {/* Equipment modal */}
      <EquipmentModal
        visible={showEquipmentModal}
        loading={equipmentLoading}
        equipment={equipmentList}
        onClose={() => setShowEquipmentModal(false)}
        onSelect={(item) => {
          setFilter((f) => ({ ...f, equipmentId: item.id }));
          setShowEquipmentModal(false);
        }}
        onLongPress={(item) => {
          if (role !== roles.systemAdmin) return;
          setShowEquipmentModal(false);
          router.push(`/equipment/${item.id}`);
        }}
      />

      {/* Muscle group modal */}
      <MuscleGroupModal
        visible={showMuscleGroupsModal}
        loading={muscleGroupLoading}
        muscleGroups={muscleGroupList}
        onClose={() => setShowMuscleGroupsModal(false)}
        onSelect={(item) => {
          setFilter((f) => ({ ...f, muscleGroupId: item.id }));
          setShowMuscleGroupsModal(false);
        }}
        onLongPress={(item) => {
          if (role !== roles.systemAdmin) return;
          setShowMuscleGroupsModal(false);
          router.push(`/muscle-groups/${item.id}`);
        }}
      />

      {/* Delete confirmation */}
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
