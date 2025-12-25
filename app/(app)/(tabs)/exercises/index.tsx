import { DeleteConfirmModal } from "@/components/DeleteConfrimModal";
import { useAuth } from "@/stores/authStore";
import { useEquipment } from "@/stores/equipmentStore";
import { useExercise } from "@/stores/exerciseStore";
import { useMuscleGroup } from "@/stores/muscleGroupStore";
import { View } from "@react-native-blossom-ui/components";
import React, { useEffect, useState } from "react";
import { Text, TouchableOpacity } from "react-native";
import Toast from "react-native-toast-message";

import EquipmentModal from "@/components/exercises/EquipmentModal";
import ExerciseList from "@/components/exercises/ExerciseList";
import MuscleGroupModal from "@/components/exercises/MuscleGroupModal";

export default function Exercises() {
  const role = useAuth((s) => s.user?.role);

  const { equipmentList, equipmentLoading, getAllEquipment, deleteEquipment } =
    useEquipment();

  const {
    muscleGroupList,
    muscleGroupLoading,
    getAllMuscleGroups,
    deleteMuscleGroup,
  } = useMuscleGroup();

  const { exerciseList, exerciseLoading, getAllExercises, deleteExercise } =
    useExercise();

  const [showEquipmentModal, setShowEquipmentModal] = useState(false);
  const [showMuscleGroupsModal, setShowMuscleGroupsModal] = useState(false);

  const [deleteEquipmentId, setDeleteEquipmentId] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [deleteMuscleGroupId, setDeleteMuscleGroupId] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [deleteExerciseId, setDeleteExerciseId] = useState<{
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    getAllEquipment();
    getAllMuscleGroups();
    getAllExercises();
  }, []);

  return (
    <View className="flex-1 bg-white dark:bg-black p-4">
      {/* Top buttons */}
      <View className="flex-row gap-4">
        <TouchableOpacity
          onPress={() => setShowEquipmentModal(true)}
          className="flex-1 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
        >
          <Text className="text-xl font-semibold text-black dark:text-white">
            Equipment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowMuscleGroupsModal(true)}
          className="flex-1 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4"
        >
          <Text className="text-xl font-semibold text-black dark:text-white">
            Muscle Groups
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exercises */}
      <ExerciseList
        loading={exerciseLoading}
        exercises={exerciseList}
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
        onDelete={setDeleteEquipmentId}
      />

      <MuscleGroupModal
        visible={showMuscleGroupsModal}
        onClose={() => setShowMuscleGroupsModal(false)}
        role={role}
        loading={muscleGroupLoading}
        muscleGroups={muscleGroupList}
        onDelete={setDeleteMuscleGroupId}
      />

      {/* Delete confirmations */}
      {deleteEquipmentId && (
        <DeleteConfirmModal
          visible
          title={`Delete "${deleteEquipmentId.title}"?`}
          description="This equipment will be permanently removed."
          onCancel={() => setDeleteEquipmentId(null)}
          onConfirm={async () => {
            setDeleteEquipmentId(null);
            const res = await deleteEquipment(deleteEquipmentId.id);
            await getAllEquipment();
            Toast.show({
              type: res.success ? "success" : "error",
              text1: res.success
                ? "Equipment deleted successfully"
                : "Error deleting equipment",
              text2: res.message,
            });
          }}
        />
      )}

      {deleteMuscleGroupId && (
        <DeleteConfirmModal
          visible
          title={`Delete "${deleteMuscleGroupId.title}"?`}
          description="This muscle group will be permanently removed."
          onCancel={() => setDeleteMuscleGroupId(null)}
          onConfirm={async () => {
            setDeleteMuscleGroupId(null);
            const res = await deleteMuscleGroup(deleteMuscleGroupId.id);
            await getAllMuscleGroups();
            Toast.show({
              type: res.success ? "success" : "error",
              text1: res.success
                ? "Muscle group deleted successfully"
                : "Error deleting muscle group",
              text2: res.message,
            });
          }}
        />
      )}

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
