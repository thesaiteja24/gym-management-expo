import { DeleteConfirmModal } from "@/components/DeleteConfrimModal";
import { useAuth } from "@/stores/authStore";
import { useEquipment } from "@/stores/equipmentStore";
import { useExercise } from "@/stores/exerciseStore";
import { useMuscleGroup } from "@/stores/muscleGroupStore";
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

import EquipmentModal from "@/components/exercises/EquipmentModal";
import ExerciseList from "@/components/exercises/ExerciseList";
import MuscleGroupModal from "@/components/exercises/MuscleGroupModal";
import { Ionicons } from "@expo/vector-icons";

//  Reusable Chip (same size & shape as button)
type ChipProps = {
  label: string;
  onRemove: () => void;
};

function Chip({ label, onRemove }: ChipProps) {
  const isDark = useColorScheme() === "dark";

  return (
    <TouchableOpacity
      onPress={onRemove}
      className="
        w-full
        h-12
        flex-row
        items-center
        justify-around
        gap-2
        rounded-2xl
        border border-neutral-200/60
        dark:border-neutral-800
        bg-neutral-200 dark:bg-neutral-800
      "
    >
      <Text className="text-lg font-semibold text-black dark:text-white">
        {label}
      </Text>
      <Ionicons
        className="justify-self-end"
        name="close-circle"
        size={24}
        color={isDark ? "#737373" : "#a3a3a3"}
      />
    </TouchableOpacity>
  );
}

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

  useEffect(() => {
    getAllEquipment();
    getAllMuscleGroups();
    getAllExercises();
  }, []);

  //  Search + Fuzzy setup
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
          // @ts-ignore
          e.secondaryMuscleGroups?.some((m) => m.id === filter.muscleGroupId)
      );
    }

    if (!fuse || query.trim() === "") return data;

    return fuse.search(query).map((r) => r.item);
  }, [exerciseList, filter, fuse, query]);

  useEffect(() => {
    if (showEquipmentModal || showMuscleGroupsModal) {
      setQuery("");
    }
  }, [showEquipmentModal, showMuscleGroupsModal]);

  return (
    <View className="flex-1 bg-white dark:bg-black p-4">
      {/* Search */}
      <View className="mb-4">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search exercises, equipment, muscles…"
          placeholderTextColor="#9CA3AF"
          className="
            rounded-xl
            border border-neutral-200
            dark:border-neutral-800
            bg-white dark:bg-neutral-900
            px-4 py-3
            text-lg text-black dark:text-white
          "
        />
      </View>

      {/* Top filter slots */}
      <View className="flex-row gap-4 mb-4">
        {/* Equipment slot */}
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
              className="
                w-full
                h-12
                rounded-2xl
                border border-neutral-200/60
                dark:border-neutral-800
                bg-white dark:bg-neutral-900
                justify-center
              "
            >
              <Text className="text-xl font-semibold text-black dark:text-white text-center">
                Equipment
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Muscle group slot */}
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
              className="
                w-full
                h-12
                rounded-2xl
                border border-neutral-200/60
                dark:border-neutral-800
                bg-white dark:bg-neutral-900
                justify-center
              "
            >
              <Text className="text-xl font-semibold text-black dark:text-white text-center">
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
        role={role}
        onDelete={setDeleteExerciseId}
      />

      {/* Modals */}
      <EquipmentModal
        visible={showEquipmentModal}
        onClose={() => setShowEquipmentModal(false)}
        role={role}
        loading={equipmentLoading}
        equipment={equipmentList}
        onSelect={(id) => {
          setFilter((f) => ({ ...f, equipmentId: id }));
          setShowEquipmentModal(false);
        }}
      />

      <MuscleGroupModal
        visible={showMuscleGroupsModal}
        onClose={() => setShowMuscleGroupsModal(false)}
        role={role}
        loading={muscleGroupLoading}
        muscleGroups={muscleGroupList}
        onSelect={(id) => {
          setFilter((f) => ({ ...f, muscleGroupId: id }));
          setShowMuscleGroupsModal(false);
        }}
      />

      {/* Delete exercise */}
      {deleteExerciseId && (
        <DeleteConfirmModal
          visible
          title={`Delete "${deleteExerciseId.title}"?`}
          description="This exercise will be permanently removed."
          onCancel={() => setDeleteExerciseId(null)}
          onConfirm={async () => {
            setDeleteExerciseId(null);
            const res = await deleteExercise(deleteExerciseId.id);
            await getAllExercises();

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
