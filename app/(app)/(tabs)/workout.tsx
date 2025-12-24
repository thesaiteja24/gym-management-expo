import { DeleteConfirmModal } from "@/components/DeleteConfrimModal";
import { ROLES as roles } from "@/constants/roles";
import { useAuth } from "@/stores/authStore";
import { DeleteConfirmModal } from "@/components/DeleteConfrimModal";
import { ROLES as roles } from "@/constants/roles";
import { useAuth } from "@/stores/authStore";
import { useEquipment } from "@/stores/equipmentStore";
import { useExercise } from "@/stores/exerciseStore";
import { useMuscleGroup } from "@/stores/muscleGroupStore";
import { ActivityIndicator, View } from "@react-native-blossom-ui/components";
import { Image } from "expo-image";
import { router } from "expo-router";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
} from "react-native";
import Toast from "react-native-toast-message";
import Toast from "react-native-toast-message";

export default function Workout() {
  const role = useAuth((s) => s.user?.role);
  // Equipment related state and actions
  const [showEquipmentModal, setShowEquipmentModal] = React.useState(false);
  const [deleteEquipmentId, setDeleteEquipmentId] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const equipmentLoading = useEquipment((s) => s.equipmentLoading);
  const equipmentList = useEquipment((s) => s.equipmentList);
  const getAllEquipment = useEquipment((s) => s.getAllEquipment);
  const deleteEquipment = useEquipment((s) => s.deleteEquipment);

  const handleEquipmentPress = () => {
    setShowEquipmentModal(true);
  };

  useEffect(() => {
    getAllEquipment();
  }, []);

  // Muscle Group related state and actions
  const [showMuscleGroupsModal, setShowMuscleGroupsModal] =
    React.useState(false);
  const [deleteMuscleGroupId, setDeleteMuscleGroupId] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const [deleteMuscleGroupId, setDeleteMuscleGroupId] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const muscleGroupLoading = useMuscleGroup((s) => s.muscleGroupLoading);
  const muscleGroupList = useMuscleGroup((s) => s.muscleGroupList);
  const getAllMuscleGroups = useMuscleGroup((s) => s.getAllMuscleGroups);
  const deleteMuscleGroup = useMuscleGroup((s) => s.deleteMuscleGroup);

  const handleMuscleGroupsPress = () => {
    setShowMuscleGroupsModal(true);
  };

  useEffect(() => {
    getAllMuscleGroups();
  }, []);

  // Exercise related state and actions
  const [deleteExerciseId, setDeleteExerciseId] = React.useState<{
    id: string;
    title: string;
  } | null>(null);
  const exerciseLoading = useExercise((s) => s.exerciseLoading);
  const exerciseList = useExercise((s) => s.exerciseList);
  const getAllExercises = useExercise((s) => s.getAllExercises);
  const deleteExercise = useExercise((s) => s.deleteExercise);

  useEffect(() => {
    getAllExercises();
  }, []);

  return (
    <View style={{ flex: 1 }} className="bg-white dark:bg-black p-4">
      {/* Equipment and Muscle Groups selection buttons */}
      <View className="flex flex-row w-full gap-4">
        <TouchableOpacity
          onPress={handleEquipmentPress}
          className="flex-1 flex-row items-center justify-start gap-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm"
        >
          <Text className="text-black dark:text-white font-semibold text-xl">
            Equipment
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleMuscleGroupsPress}
          className="flex-1 flex-row items-center justify-start gap-4 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm"
        >
          <Text className="text-black dark:text-white font-semibold text-xl">
            Muscle Groups
          </Text>
        </TouchableOpacity>
      </View>

      {/* Exercises list */}
      {exerciseLoading ? (
        <ActivityIndicator animating size="large" className="mt-8" />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          className="px-4 mt-4"
        >
          {exerciseList.map((exercise) => (
            <TouchableOpacity
              key={exercise.id}
              className="flex-1 flex-row items-center justify-between gap-4 pb-4"
              onPress={() => {
                setShowEquipmentModal(false);

                if (role === roles.systemAdmin) {
                  router.push(`/exercises/${exercise.id}`);
                } else {
                  Toast.show({
                    type: "info",
                    text1: "Coming Soon",
                  });
                }
              }}
              onLongPress={() => {
                if (role !== roles.systemAdmin) return;

                setDeleteExerciseId({
                  id: exercise.id,
                  title: exercise.title,
                });
              }}
              delayLongPress={700}
            >
              <View className="w-3/4">
                <Text className="text-black dark:text-white text-xl font-semibold py-2">
                  {exercise.title}
                </Text>

                <View className="flex-row gap-4">
                  <Text className="text-sm text-blue-500 font-semibold">
                    {exercise.equipment.title}
                  </Text>

                  <Text className="text-sm text-blue-500 font-semibold">
                    {exercise.primaryMuscleGroup.title}
                  </Text>

                  <Text className="text-sm text-red-600 font-semibold">PR</Text>
                </View>
              </View>

              <Image
                cachePolicy="memory-disk"
                source={exercise.thumbnailUrl}
                style={{
                  borderRadius: 100,
                  borderColor: "gray",
                  borderWidth: 1,
                  width: 60,
                  height: 60,
                  backgroundColor: "white",
                }}
                contentFit="cover"
              />
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Equipment modal */}
      <Modal animationType="slide" transparent visible={showEquipmentModal}>
        <View className="flex-1 bg-black/40 justify-end">
          {/* Backdrop */}
          <Pressable
            className="absolute inset-0"
            onPress={() => setShowEquipmentModal(false)}
          />

          {/* Modal content */}
          <View className="bg-white dark:bg-[#111] rounded-t-3xl p-6 pt-4 h-[80%]">
            <View
              className={`flex-row ${
                role === roles.systemAdmin
                  ? "justify-between"
                  : "justify-center"
              } items-center mb-6`}
            >
              <Text className="text-black dark:text-white text-xl font-bold text-center">
                Equipment
              </Text>
              {role === roles.systemAdmin && (
                <TouchableOpacity
                  onPress={() => {
                    setShowEquipmentModal(false);
                    if (role === roles.systemAdmin) {
                      router.push("/equipment/create");
                    }
                  }}
                >
                  <Text className="text-blue-500 text-xl text-center">
                    Create
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View
              className={`flex-row ${
                role === roles.systemAdmin
                  ? "justify-between"
                  : "justify-center"
              } items-center mb-6`}
            >
              <Text className="text-black dark:text-white text-xl font-bold text-center">
                Equipment
              </Text>
              {role === roles.systemAdmin && (
                <TouchableOpacity
                  onPress={() => {
                    setShowEquipmentModal(false);
                    if (role === roles.systemAdmin) {
                      router.push("/equipment/create");
                    }
                  }}
                >
                  <Text className="text-blue-500 text-xl text-center">
                    Create
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {equipmentLoading ? (
              <ActivityIndicator animating size="large" className="mt-8" />
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 32 }}
              >
                {equipmentList.map((equipment) => (
                  <TouchableOpacity
                  <TouchableOpacity
                    key={equipment.id}
                    className="flex-row items-center justify-between gap-4 pb-4"
                    onPress={() => {
                      setShowEquipmentModal(false);

                      if (role === roles.systemAdmin) {
                        router.push(`/equipment/${equipment.id}`);
                      } else {
                        Toast.show({
                          type: "info",
                          text1: "Coming Soon",
                        });
                      }
                    }}
                    onLongPress={() => {
                      if (role !== roles.systemAdmin) return;

                      setDeleteEquipmentId({
                        id: equipment.id,
                        title: equipment.title,
                      });
                    }}
                    delayLongPress={700}
                    onPress={() => {
                      setShowEquipmentModal(false);

                      if (role === roles.systemAdmin) {
                        router.push(`/equipment/${equipment.id}`);
                      } else {
                        Toast.show({
                          type: "info",
                          text1: "Coming Soon",
                        });
                      }
                    }}
                    onLongPress={() => {
                      if (role !== roles.systemAdmin) return;

                      setDeleteEquipmentId({
                        id: equipment.id,
                        title: equipment.title,
                      });
                    }}
                    delayLongPress={700}
                  >
                    <Text className="text-black dark:text-white text-xl font-semibold py-2">
                      {equipment.title}
                    </Text>


                    <Image
                      cachePolicy="memory-disk"
                      source={equipment.thumbnailUrl}
                      style={{
                        borderRadius: 100,
                        borderColor: "gray",
                        borderWidth: 1,
                        width: 50,
                        height: 50,
                        backgroundColor: "white",
                      }}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Muscle Groups modal */}
      <Modal animationType="slide" transparent visible={showMuscleGroupsModal}>
        <View className="flex-1 bg-black/40 justify-end">
          {/* Backdrop */}
          <Pressable
            className="absolute inset-0"
            onPress={() => setShowMuscleGroupsModal(false)}
          />

          {/* Modal content */}
          <View className="bg-white dark:bg-[#111] rounded-t-3xl p-6 pt-4 h-[80%]">
            <View
              className={`flex-row ${
                role === roles.systemAdmin
                  ? "justify-between"
                  : "justify-center"
              } items-center mb-6`}
            >
              <Text className="text-black dark:text-white text-xl font-bold text-center">
                Muscle Groups
              </Text>
              {role === roles.systemAdmin && (
                <TouchableOpacity
                  onPress={() => {
                    setShowMuscleGroupsModal(false);
                    if (role === roles.systemAdmin) {
                      router.push("/muscle-groups/create");
                    }
                  }}
                >
                  <Text className="text-blue-500 text-xl text-center">
                    Create
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {muscleGroupLoading ? (
              <ActivityIndicator animating size="large" className="mt-8" />
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingBottom: 32 }}
              >
                {muscleGroupList.map((muscleGroup) => (
                  <TouchableOpacity
                  <TouchableOpacity
                    key={muscleGroup.id}
                    className="flex-row items-center justify-between gap-4 pb-4"
                    onPress={() => {
                      setShowMuscleGroupsModal(false);
                      if (role === roles.systemAdmin) {
                        router.push(`/muscle-groups/${muscleGroup.id}`);
                      } else {
                        Toast.show({
                          type: "info",
                          text1: "Coming Soon",
                        });
                      }
                    }}
                    onLongPress={() => {
                      if (role !== roles.systemAdmin) return;

                      setDeleteMuscleGroupId({
                        id: muscleGroup.id,
                        title: muscleGroup.title,
                      });
                    }}
                    delayLongPress={700}
                  >
                    <Text className="text-black dark:text-white text-xl font-semibold py-2">
                      {muscleGroup.title}
                    </Text>
                    <Image
                      cachePolicy="memory-disk"
                      source={{ uri: muscleGroup.thumbnailUrl }}
                      style={{
                        borderRadius: 100,
                        borderColor: "gray",
                        borderWidth: 1,
                        width: 50,
                        height: 50,
                        backgroundColor: "white",
                      }}
                      contentFit="contain"
                    />
                  </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Delete Muscle Group Confirm Modal */}
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
            if (res.success) {
              Toast.show({
                type: "success",
                text1: "Muscle group deleted successfully",
              });
            } else {
              Toast.show({
                type: "error",
                text1: "Error deleting muscle group",
                text2: res.message,
              });
            }
          }}
        />
      )}

      {/* Delete Equipment Confirm Modal */}
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

            if (res.success) {
              Toast.show({
                type: "success",
                text1: "Equipment deleted successfully",
              });
            } else {
              Toast.show({
                type: "error",
                text1: "Error deleting equipment",
                text2: res.message,
              });
            }
          }}
        />
      )}

      {/* Delete Exercise Confirm Modal */}
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

            if (res.success) {
              Toast.show({
                type: "success",
                text1: "Exercise deleted successfully",
              });
            } else {
              Toast.show({
                type: "error",
                text1: "Error deleting exercise",
                text2: res.message,
              });
            }
          }}
        />
      )}
    </View>
  );
}
